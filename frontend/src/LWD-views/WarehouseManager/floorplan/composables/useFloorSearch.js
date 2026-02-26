import { ref, watch } from 'vue'

/**
 * Token-based search index with progressive drill-down navigation.
 *
 * @param {Object} store - The warehouseFloorStore instance
 * @param {Object} zoom - The useZoomStateMachine instance
 */
export function useFloorSearch(store, zoom) {
    const searchQuery = ref('')
    const searchResults = ref([])
    const highlightedSectionIds = ref([])
    const highlightedRackIds = ref([])
    const highlightedCellKeys = ref([]) // "rackId:cellIndex"
    const highlightedProducts = ref([])
    const searchPaths = ref([])
    const currentPathIdx = ref(0)

    let searchTimer = null
    let highlightTimer = null

    // ── Search Index ────────────────────────────────────────────
    const searchIndex = new Map() // token → Set<product>

    function buildIndex() {
        searchIndex.clear()
        for (const p of store.products) {
            const tokens = tokenize(p)
            for (const t of tokens) {
                if (!searchIndex.has(t)) searchIndex.set(t, new Set())
                searchIndex.get(t).add(p)
            }
        }
    }

    function tokenize(product) {
        const rack = store.rackMap.get(product.rackId)
        const section = rack ? store.sectionMap.get(rack.sectionId) : null
        return [
            ...product.name.toLowerCase().split(/\s+/),
            product.sku.toLowerCase(),
            product.orderId.toLowerCase(),
            product.rma?.toLowerCase(),
            section?.label?.toLowerCase()
        ].filter(Boolean)
    }

    // Rebuild index when products change
    watch(() => store.products.length, buildIndex, { immediate: true })

    // ── Search Execution ────────────────────────────────────────
    function onSearch() {
        clearTimeout(searchTimer)
        clearHighlights()
        if (!searchQuery.value.trim()) {
            searchResults.value = []
            return
        }
        searchTimer = setTimeout(() => {
            const q = searchQuery.value.toLowerCase().trim()

            // Collect all products that match any token prefix
            const matched = new Set()
            for (const [token, prods] of searchIndex) {
                if (token.includes(q)) {
                    prods.forEach(p => matched.add(p))
                }
            }

            // Fallback: direct field search for partial matches not in tokens
            for (const p of store.products) {
                if (
                    p.sku.toLowerCase().includes(q) ||
                    p.name.toLowerCase().includes(q) ||
                    p.orderId.toLowerCase().includes(q) ||
                    (p.rma && p.rma.toLowerCase().includes(q))
                ) {
                    matched.add(p)
                }
            }

            searchResults.value = [...matched].map(p => {
                const rack = store.rackMap.get(p.rackId)
                const section = rack ? store.sectionMap.get(rack.sectionId) : null
                return {
                    product: p,
                    rackId: p.rackId,
                    sectionId: rack?.sectionId,
                    sectionLabel: section?.label || '?',
                    rackLabel: rack?.label || '?',
                    floorId: section?.floorId || 1
                }
            })
        }, 200)
    }

    /**
     * Focus on a specific search result. Determines progressive drill-down level:
     * - Multiple sections → stay FLOOR, highlight sections
     * - Single section, multiple racks → SECTION level, highlight racks
     * - Single rack → SECTION + RACK level, highlight cells
     */
    function focusSearchResult(result, activeFloorId, setFloor, containerSize) {
        // Switch floor if needed
        if (result.floorId !== activeFloorId) {
            setFloor(result.floorId)
        }

        highlightedProducts.value = searchResults.value.map(s => s.product)
        searchPaths.value = [...searchResults.value]
        currentPathIdx.value = searchResults.value.indexOf(result)
        searchQuery.value = ''
        searchResults.value = []

        // Determine scope
        const allOnFloor = searchPaths.value.filter(s => s.floorId === result.floorId)
        const sectionIds = [...new Set(allOnFloor.map(s => s.sectionId))]
        const inSection = allOnFloor.filter(s => s.sectionId === result.sectionId)
        const rackIds = [...new Set(inSection.map(s => s.rackId))]

        if (sectionIds.length > 1) {
            // Broad: highlight multiple sections at floor level
            zoom.zoomToFloor()
            highlightedSectionIds.value = sectionIds
            highlightedRackIds.value = []
        } else if (rackIds.length > 1) {
            // Medium: zoom into section, highlight racks
            zoom.zoomToSection(result.sectionId)
            highlightedSectionIds.value = []
            highlightedRackIds.value = rackIds
        } else {
            // Exact: zoom into section + highlight single rack
            zoom.zoomToSection(result.sectionId)
            highlightedSectionIds.value = []
            highlightedRackIds.value = [result.rackId]
            highlightedCellKeys.value = [`${result.rackId}:${result.product.cell}`]
        }

        scheduleHighlightClear()
    }

    /** Navigate to the next search result */
    function nextResult(activeFloorId, setFloor) {
        if (!searchPaths.value.length) return
        currentPathIdx.value = (currentPathIdx.value + 1) % searchPaths.value.length
        navigateToPath(searchPaths.value[currentPathIdx.value], activeFloorId, setFloor)
    }

    /** Navigate to the previous search result */
    function prevResult(activeFloorId, setFloor) {
        if (!searchPaths.value.length) return
        currentPathIdx.value = (currentPathIdx.value - 1 + searchPaths.value.length) % searchPaths.value.length
        navigateToPath(searchPaths.value[currentPathIdx.value], activeFloorId, setFloor)
    }

    /** Navigate camera to a specific path entry */
    function navigateToPath(entry, activeFloorId, setFloor) {
        if (entry.floorId !== activeFloorId) setFloor(entry.floorId)
        highlightedProducts.value = [entry.product]
        zoom.zoomToSection(entry.sectionId)
        highlightedSectionIds.value = []
        highlightedRackIds.value = [entry.rackId]
        highlightedCellKeys.value = [`${entry.rackId}:${entry.product.cell}`]
        scheduleHighlightClear()
    }

    function clearSearchNav() {
        searchPaths.value = []
        currentPathIdx.value = 0
        clearHighlights()
    }

    function clearHighlights() {
        highlightedSectionIds.value = []
        highlightedRackIds.value = []
        highlightedCellKeys.value = []
        highlightedProducts.value = []
    }

    function scheduleHighlightClear() {
        clearTimeout(highlightTimer)
        highlightTimer = setTimeout(clearHighlights, 8000)
    }

    /** Get highlighted products for a specific section */
    function getHighlightProductsForSection(sectionId) {
        return highlightedProducts.value.filter(p => {
            const rack = store.rackMap.get(p.rackId)
            return rack?.sectionId === sectionId
        })
    }

    /** Get highlighted products for a specific rack */
    function getHighlightProductsForRack(rackId) {
        return highlightedProducts.value.filter(p => p.rackId === rackId)
    }

    return {
        searchQuery,
        searchResults,
        highlightedSectionIds,
        highlightedRackIds,
        highlightedCellKeys,
        highlightedProducts,
        searchPaths,
        currentPathIdx,
        onSearch,
        focusSearchResult,
        nextResult,
        prevResult,
        clearSearchNav,
        clearHighlights,
        getHighlightProductsForSection,
        getHighlightProductsForRack,
        buildIndex
    }
}
