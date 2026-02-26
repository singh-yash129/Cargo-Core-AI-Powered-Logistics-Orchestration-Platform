import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * @typedef {Object} Floor
 * @property {number} id
 * @property {string} label
 */

/**
 * @typedef {Object} Group
 * @property {string} id
 * @property {number} floorId
 * @property {string} name
 * @property {string} color
 * @property {number} internalGap
 * @property {number} externalGap
 */

/**
 * @typedef {Object} Section
 * @property {string} id
 * @property {number} floorId
 * @property {string|null} groupId
 * @property {string} label
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {boolean} [manualPosition]
 */

/**
 * @typedef {Object} Rack
 * @property {string} id
 * @property {string} sectionId
 * @property {string} label
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {number} rows
 * @property {number} cols
 */

/**
 * @typedef {Object} CellProduct
 * @property {string} sku
 * @property {string} name
 * @property {string} orderId
 * @property {string|null} rma
 * @property {string} rackId
 * @property {number} cell
 * @property {number} qty
 * @property {string} unit
 */

export const useWarehouseFloorStore = defineStore('warehouseFloor', () => {
    // ── Core Data ──────────────────────────────────────────────
    const floors = ref([
        { id: 1, label: 'Floor 1' },
        { id: 2, label: 'Floor 2' },
        { id: 3, label: 'Floor 3' }
    ])

    const groups = ref([
        { id: 'g1', floorId: 1, name: 'Fragile', color: '#ef4444', internalGap: 2, externalGap: 10 },
        { id: 'g2', floorId: 1, name: 'Fertilizer', color: '#10b981', internalGap: 2, externalGap: 10 },
        { id: 'g3', floorId: 1, name: 'Electronics', color: '#3b82f6', internalGap: 4, externalGap: 14 },
        { id: 'g4', floorId: 2, name: 'Cold Storage', color: '#06b6d4', internalGap: 3, externalGap: 12 }
    ])

    const sections = ref([
        { id: 'c1', floorId: 1, groupId: 'g1', label: 'SEC-01 Fragile', x: 40, y: 60, w: 120, h: 140 },
        { id: 'c2', floorId: 1, groupId: 'g1', label: 'SEC-02 Fragile', x: 166, y: 60, w: 120, h: 140 },
        { id: 'c3', floorId: 1, groupId: 'g2', label: 'SEC-03 Fertilizer', x: 320, y: 60, w: 120, h: 140 },
        { id: 'c4', floorId: 1, groupId: 'g2', label: 'SEC-04 Fertilizer', x: 446, y: 60, w: 120, h: 140 },
        { id: 'c5', floorId: 1, groupId: 'g3', label: 'SEC-05 Electronics', x: 600, y: 60, w: 140, h: 140 },
        { id: 'c6', floorId: 1, groupId: 'g3', label: 'SEC-06 Electronics', x: 746, y: 60, w: 140, h: 140 },
        { id: 'c7', floorId: 1, groupId: null, label: 'SEC-07 General', x: 40, y: 260, w: 120, h: 130 },
        { id: 'c8', floorId: 2, groupId: 'g4', label: 'SEC-10 Cold A', x: 60, y: 60, w: 130, h: 150 },
        { id: 'c9', floorId: 2, groupId: 'g4', label: 'SEC-11 Cold B', x: 200, y: 60, w: 130, h: 150 }
    ])

    const racks = ref([
        { id: 'r1', sectionId: 'c1', label: 'Rack-A1', x: 30, y: 30, w: 180, h: 110, cols: 4, rows: 3 },
        { id: 'r2', sectionId: 'c1', label: 'Rack-A2', x: 230, y: 30, w: 180, h: 110, cols: 4, rows: 3 },
        { id: 'r3', sectionId: 'c2', label: 'Rack-B1', x: 30, y: 30, w: 200, h: 120, cols: 5, rows: 3 },
        { id: 'r4', sectionId: 'c2', label: 'Rack-B2', x: 250, y: 30, w: 200, h: 120, cols: 5, rows: 3 },
        { id: 'r5', sectionId: 'c3', label: 'Rack-C1', x: 30, y: 30, w: 180, h: 110, cols: 4, rows: 3 },
        { id: 'r6', sectionId: 'c3', label: 'Rack-C2', x: 230, y: 30, w: 180, h: 110, cols: 4, rows: 3 },
        { id: 'r7', sectionId: 'c4', label: 'Rack-D1', x: 30, y: 30, w: 200, h: 130, cols: 5, rows: 3 },
        { id: 'r8', sectionId: 'c5', label: 'Rack-E1', x: 30, y: 30, w: 200, h: 120, cols: 5, rows: 3 },
        { id: 'r9', sectionId: 'c5', label: 'Rack-E2', x: 250, y: 30, w: 200, h: 120, cols: 5, rows: 3 },
        { id: 'r10', sectionId: 'c6', label: 'Rack-F1', x: 30, y: 30, w: 220, h: 140, cols: 6, rows: 4 },
        { id: 'r11', sectionId: 'c7', label: 'Rack-G1', x: 30, y: 30, w: 180, h: 100, cols: 4, rows: 3 },
        { id: 'r12', sectionId: 'c8', label: 'Rack-H1', x: 30, y: 30, w: 200, h: 120, cols: 5, rows: 3 },
        { id: 'r13', sectionId: 'c8', label: 'Rack-H2', x: 250, y: 30, w: 200, h: 120, cols: 5, rows: 3 },
        { id: 'r14', sectionId: 'c9', label: 'Rack-I1', x: 30, y: 30, w: 200, h: 120, cols: 5, rows: 3 }
    ])

    const products = ref([
        { sku: 'FRG-1001', name: 'Crystal Vase Set', orderId: 'ORD-20254', rma: null, rackId: 'r1', cell: 1, qty: 24, unit: 'pcs' },
        { sku: 'FRG-1002', name: 'Porcelain Dinner Set', orderId: 'ORD-20312', rma: 'RMA-4421', rackId: 'r1', cell: 5, qty: 12, unit: 'sets' },
        { sku: 'FRG-1003', name: 'Glass Panel 60x40', orderId: 'ORD-20455', rma: null, rackId: 'r2', cell: 3, qty: 48, unit: 'pcs' },
        { sku: 'FRG-1004', name: 'Wine Glass Set', orderId: 'ORD-20460', rma: null, rackId: 'r2', cell: 8, qty: 30, unit: 'sets' },
        { sku: 'FRG-1005', name: 'Ceramic Tiles Premium', orderId: 'ORD-20501', rma: null, rackId: 'r3', cell: 2, qty: 200, unit: 'pcs' },
        { sku: 'FRG-1006', name: 'Mirror Panel Round', orderId: 'ORD-20555', rma: 'RMA-4450', rackId: 'r4', cell: 6, qty: 15, unit: 'pcs' },
        { sku: 'FRT-2001', name: 'NPK 20-20-20 Bag', orderId: 'ORD-20133', rma: null, rackId: 'r5', cell: 1, qty: 150, unit: 'bags' },
        { sku: 'FRT-2002', name: 'Urea Granular 50kg', orderId: 'ORD-20189', rma: null, rackId: 'r5', cell: 4, qty: 80, unit: 'bags' },
        { sku: 'FRT-2003', name: 'Organic Compost Mix', orderId: 'ORD-20220', rma: 'RMA-4490', rackId: 'r6', cell: 2, qty: 90, unit: 'bags' },
        { sku: 'FRT-2004', name: 'Potassium Sulfate', orderId: 'ORD-20280', rma: null, rackId: 'r6', cell: 7, qty: 60, unit: 'bags' },
        { sku: 'FRT-2005', name: 'DAP Fertilizer', orderId: 'ORD-20350', rma: null, rackId: 'r7', cell: 3, qty: 120, unit: 'bags' },
        { sku: 'ELC-3001', name: 'LED Monitor 27"', orderId: 'ORD-20612', rma: null, rackId: 'r8', cell: 1, qty: 36, unit: 'pcs' },
        { sku: 'ELC-3002', name: 'Wireless Keyboard', orderId: 'ORD-20614', rma: null, rackId: 'r8', cell: 5, qty: 120, unit: 'pcs' },
        { sku: 'ELC-3003', name: 'USB-C Hub 7-in-1', orderId: 'ORD-20700', rma: 'RMA-4512', rackId: 'r9', cell: 2, qty: 200, unit: 'pcs' },
        { sku: 'ELC-3004', name: 'Bluetooth Speaker Pro', orderId: 'ORD-20750', rma: null, rackId: 'r9', cell: 8, qty: 60, unit: 'pcs' },
        { sku: 'ELC-3005', name: 'Webcam 4K Ultra', orderId: 'ORD-20811', rma: null, rackId: 'r10', cell: 3, qty: 45, unit: 'pcs' },
        { sku: 'ELC-3006', name: 'Laptop Stand Alu', orderId: 'ORD-20820', rma: null, rackId: 'r10', cell: 10, qty: 80, unit: 'pcs' },
        { sku: 'GEN-5001', name: 'Cleaning Supplies', orderId: 'ORD-21100', rma: null, rackId: 'r11', cell: 1, qty: 75, unit: 'sets' },
        { sku: 'GEN-5002', name: 'Paper Towel Bulk', orderId: 'ORD-21105', rma: null, rackId: 'r11', cell: 6, qty: 400, unit: 'rolls' },
        { sku: 'CLD-6001', name: 'Frozen Seafood Box', orderId: 'ORD-21200', rma: null, rackId: 'r12', cell: 1, qty: 60, unit: 'boxes' },
        { sku: 'CLD-6002', name: 'Dairy Products Pallet', orderId: 'ORD-21210', rma: 'RMA-4600', rackId: 'r12', cell: 5, qty: 20, unit: 'pallets' },
        { sku: 'CLD-6003', name: 'Vaccines Cold Chain', orderId: 'ORD-21250', rma: null, rackId: 'r13', cell: 4, qty: 500, unit: 'vials' },
        { sku: 'CLD-6004', name: 'Vaccines Cold Chain', orderId: 'ORD-21260', rma: null, rackId: 'r14', cell: 2, qty: 300, unit: 'vials' },
        { sku: 'CLD-6005', name: 'Ice Cream Tubs 500ml', orderId: 'ORD-21220', rma: null, rackId: 'r14', cell: 8, qty: 300, unit: 'tubs' }
    ])

    const presetColors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1']

    // ── Lookup Maps (computed, rebuilt on data change) ──────────
    const sectionMap = computed(() => {
        const m = new Map()
        sections.value.forEach(s => m.set(s.id, s))
        return m
    })

    const rackMap = computed(() => {
        const m = new Map()
        racks.value.forEach(r => m.set(r.id, r))
        return m
    })

    const groupMap = computed(() => {
        const m = new Map()
        groups.value.forEach(g => m.set(g.id, g))
        return m
    })

    // ── Filtered Getters ──────────────────────────────────────────
    function sectionsByFloor(floorId) {
        return sections.value.filter(s => s.floorId === floorId)
    }

    function groupsByFloor(floorId) {
        return groups.value.filter(g => g.floorId === floorId)
    }

    function racksBySection(sectionId) {
        return racks.value.filter(r => r.sectionId === sectionId)
    }

    function productsByRack(rackId) {
        return products.value.filter(p => p.rackId === rackId)
    }

    function productsBySection(sectionId) {
        const rids = racksBySection(sectionId).map(r => r.id)
        return products.value.filter(p => rids.includes(p.rackId))
    }

    function productsByFloor(floorId) {
        const sids = sectionsByFloor(floorId).map(s => s.id)
        const rids = racks.value.filter(r => sids.includes(r.sectionId)).map(r => r.id)
        return products.value.filter(p => rids.includes(p.rackId))
    }

    function racksOnFloor(floorId) {
        const sids = sectionsByFloor(floorId).map(s => s.id)
        return racks.value.filter(r => sids.includes(r.sectionId))
    }

    function sectionsByGroup(groupId) {
        return sections.value.filter(s => s.groupId === groupId)
    }

    function getGroupColor(section) {
        if (!section) return '#6b7280'
        const g = groupMap.value.get(section.groupId)
        return g?.color || '#6b7280'
    }

    function getGroupName(groupId) {
        return groupMap.value.get(groupId)?.name || ''
    }

    function getCellProduct(rackId, cellIndex) {
        return products.value.find(p => p.rackId === rackId && p.cell === cellIndex) || null
    }

    /** Get the full breadcrumb path for a product */
    function resolveProductPath(product) {
        const rack = rackMap.value.get(product.rackId)
        if (!rack) return null
        const section = sectionMap.value.get(rack.sectionId)
        if (!section) return null
        const floor = floors.value.find(f => f.id === section.floorId)
        const group = groupMap.value.get(section.groupId)
        const row = Math.ceil(product.cell / rack.cols)
        const col = ((product.cell - 1) % rack.cols) + 1
        return {
            floor: floor?.label || 'Unknown',
            group: group?.name || 'Ungrouped',
            section: section.label,
            rack: rack.label,
            cell: `R${row}C${col}`,
            cellIndex: product.cell
        }
    }

    /** Generate a cell grid array for a rack */
    function generateCellGrid(rack) {
        const cells = []
        for (let row = 1; row <= rack.rows; row++) {
            for (let col = 1; col <= rack.cols; col++) {
                const index = (row - 1) * rack.cols + col
                cells.push({
                    id: `${rack.id}:R${row}C${col}`,
                    index,
                    row,
                    col,
                    product: getCellProduct(rack.id, index)
                })
            }
        }
        return cells
    }

    /** Get the group boundary rectangle for visual grouping */
    function getGroupBoundary(group) {
        const secs = sectionsByGroup(group.id).filter(s => s.floorId === group.floorId)
        if (!secs.length) return { opacity: 0 }
        const pad = 12
        const mnX = Math.min(...secs.map(s => s.x)) - pad
        const mnY = Math.min(...secs.map(s => s.y)) - pad
        const mxX = Math.max(...secs.map(s => s.x + s.w)) + pad
        const mxY = Math.max(...secs.map(s => s.y + s.h)) + pad
        return {
            left: mnX + 'px',
            top: mnY + 'px',
            width: (mxX - mnX) + 'px',
            height: (mxY - mnY) + 'px',
            borderColor: group.color + '50'
        }
    }

    // ── Mutations ──────────────────────────────────────────────
    let _idCounter = 100

    function addFloor() {
        const nid = Math.max(...floors.value.map(f => f.id), 0) + 1
        floors.value.push({ id: nid, label: `Floor ${nid}` })
        return nid
    }

    function deleteFloor(floorId) {
        if (floors.value.length <= 1) return false
        const rackIds = racks.value
            .filter(r => sections.value.find(s => s.id === r.sectionId)?.floorId === floorId)
            .map(r => r.id)
        products.value = products.value.filter(p => !rackIds.includes(p.rackId))
        racks.value = racks.value.filter(r => !rackIds.includes(r.id))
        sections.value = sections.value.filter(s => s.floorId !== floorId)
        groups.value = groups.value.filter(g => g.floorId !== floorId)
        floors.value = floors.value.filter(f => f.id !== floorId)
        return true
    }

    function addSection(floorId) {
        const id = 'c' + (_idCounter++)
        sections.value.push({
            id,
            floorId,
            groupId: null,
            label: `SEC-${_idCounter}`,
            x: 80 + Math.random() * 200,
            y: 80 + Math.random() * 200,
            w: 120,
            h: 140
        })
        return id
    }

    function deleteSection(sectionId) {
        const rackIds = racks.value.filter(r => r.sectionId === sectionId).map(r => r.id)
        products.value = products.value.filter(p => !rackIds.includes(p.rackId))
        racks.value = racks.value.filter(r => r.sectionId !== sectionId)
        sections.value = sections.value.filter(s => s.id !== sectionId)
    }

    function addRack(sectionId) {
        const id = 'r' + (_idCounter++)
        racks.value.push({
            id,
            sectionId,
            label: `Rack-${_idCounter}`,
            x: 30 + Math.random() * 100,
            y: 30 + Math.random() * 100,
            w: 180,
            h: 110,
            cols: 4,
            rows: 3
        })
        return id
    }

    function deleteRack(rackId) {
        products.value = products.value.filter(p => p.rackId !== rackId)
        racks.value = racks.value.filter(r => r.id !== rackId)
    }

    function addGroup(floorId, data) {
        const id = 'g' + Date.now()
        groups.value.push({ id, floorId, ...data })
        return id
    }

    function updateGroup(groupId, data) {
        const g = groups.value.find(g => g.id === groupId)
        if (g) Object.assign(g, data)
    }

    function deleteGroup(groupId) {
        sections.value.forEach(s => { if (s.groupId === groupId) s.groupId = null })
        groups.value = groups.value.filter(g => g.id !== groupId)
    }

    return {
        // State
        floors,
        groups,
        sections,
        racks,
        products,
        presetColors,
        // Maps
        sectionMap,
        rackMap,
        groupMap,
        // Getters
        sectionsByFloor,
        groupsByFloor,
        racksBySection,
        productsByRack,
        productsBySection,
        productsByFloor,
        racksOnFloor,
        sectionsByGroup,
        getGroupColor,
        getGroupName,
        getCellProduct,
        resolveProductPath,
        generateCellGrid,
        getGroupBoundary,
        // Mutations
        addFloor,
        deleteFloor,
        addSection,
        deleteSection,
        addRack,
        deleteRack,
        addGroup,
        updateGroup,
        deleteGroup
    }
})
