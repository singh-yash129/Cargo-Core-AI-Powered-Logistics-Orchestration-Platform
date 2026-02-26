<template>
    <div class="h-[calc(100vh-8rem)] flex flex-col gap-4">
        <!-- Header -->
        <div class="flex justify-between items-center flex-wrap gap-2">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Warehouse Floor Plan</h2>
                <p class="text-sm text-gray-500 mt-0.5">Click a section to view its racks & cells</p>
            </div>
            <!-- Search -->
            <div class="relative w-80">
                <span
                    class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                <input v-model="searchQuery" @input="onSearch" type="text"
                    placeholder="Search Order ID, SKU, RMA, product..."
                    class="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                <div v-if="searchResults.length && searchQuery"
                    class="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                    <div v-for="r in searchResults" :key="r.product.sku + r.rackId" @click="focusSearchResult(r)"
                        class="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer border-b border-gray-100 dark:border-white/5 last:border-0">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-bold text-gray-900 dark:text-white">{{ r.product.name }}</span>
                            <span class="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">{{
                                r.colLabel }} → {{ r.rackLabel }}</span>
                        </div>
                        <div class="flex gap-3 mt-0.5 text-[10px] text-gray-500">
                            <span>SKU: <b class="text-gray-700 dark:text-gray-300">{{ r.product.sku }}</b></span>
                            <span>Order: <b class="text-gray-700 dark:text-gray-300">{{ r.product.orderId }}</b></span>
                            <span v-if="r.product.rma">RMA: <b class="text-yellow-500">{{ r.product.rma }}</b></span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <!-- Floor Tabs -->
                <div
                    class="bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-1 flex">
                    <button v-for="f in floors" :key="f.id"
                        class="px-3 py-1 text-sm font-bold rounded transition-colors"
                        :class="activeFloor === f.id ? 'bg-primary text-background-dark shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'"
                        @click="activeFloor = f.id; expandedColId = null">{{ f.label }}</button>
                </div>
                <button @click="addFloor"
                    class="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"><span
                        class="material-symbols-outlined text-[16px]">add</span></button>
                <button v-if="floors.length > 1" @click="deleteFloor"
                    class="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"><span
                        class="material-symbols-outlined text-[16px]">delete</span></button>
                <button @click="editMode = !editMode"
                    class="py-1 px-3 rounded-lg text-sm font-bold flex items-center gap-1 border transition-colors"
                    :class="editMode ? 'bg-primary/20 text-primary border-primary/30' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10'">
                    <span class="material-symbols-outlined text-[16px]">{{ editMode ? 'lock_open' : 'edit' }}</span>{{
                        editMode ? 'Editing' : 'Edit' }}
                </button>
                <button v-if="editMode" @click="showGroupModal = true"
                    class="bg-primary hover:bg-primary/90 text-white font-bold py-1 px-3 rounded-lg text-sm flex items-center gap-1"><span
                        class="material-symbols-outlined text-[16px]">add</span>Group</button>
            </div>
        </div>

        <!-- Main -->
        <div class="flex-1 flex gap-4 min-h-0">
            <div class="flex-1 glass-panel rounded-xl relative overflow-hidden flex flex-col">
                <!-- Edit toolbar -->
                <div v-if="editMode"
                    class="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                    <button @click="addColumn"
                        class="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 px-3 py-1 rounded text-xs font-bold border border-blue-500/20"><span
                            class="material-symbols-outlined text-[14px] align-middle">view_column</span> +
                        Section</button>
                    <button v-if="expandedColId" @click="addRackToCol"
                        class="bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 px-3 py-1 rounded text-xs font-bold border border-purple-500/20"><span
                            class="material-symbols-outlined text-[14px] align-middle">grid_view</span> + Rack</button>
                    <div class="flex-1"></div>
                    <label class="flex items-center gap-1 text-xs text-gray-500 cursor-pointer"><input type="checkbox"
                            v-model="snapToGrid" class="accent-primary" />Snap</label>
                    <button v-if="selectedElement" @click="deleteSelected"
                        class="bg-red-500/10 text-red-500 px-3 py-1 rounded text-xs font-bold border border-red-500/20"><span
                            class="material-symbols-outlined text-[14px] align-middle">delete</span></button>
                </div>

                <!-- Breadcrumbs + Navigation -->
                <div
                    class="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                    <!-- Breadcrumb trail -->
                    <div class="flex items-center gap-1 text-xs flex-1">
                        <button @click="expandedColId = null; highlightedRackIds = []" class="font-bold transition-colors"
                            :class="expandedColId ? 'text-primary hover:text-primary/80 cursor-pointer' : 'text-gray-900 dark:text-white'">
                            <span class="material-symbols-outlined text-[14px] align-middle mr-0.5">home</span>{{
                            currentFloorLabel }}
                        </button>
                        <template v-if="expandedColId">
                            <span class="text-gray-400">›</span>
                            <span class="text-gray-900 dark:text-white font-bold flex items-center gap-1">
                                <span class="w-2 h-2 rounded-full"
                                    :style="{ background: getColColor(expandedColumn) }"></span>
                                {{ expandedColumn?.label }}
                            </span>
                            <span class="text-[10px] px-1.5 py-0.5 rounded ml-1"
                                :style="{ background: getColColor(expandedColumn) + '20', color: getColColor(expandedColumn) }">{{
                                    getGroupName(expandedColumn?.groupId)||'Ungrouped' }}</span>
                        </template>
                    </div>
                    <!-- Search result nav -->
                    <div v-if="searchPaths.length > 0" class="flex items-center gap-1 text-xs">
                        <button @click="prevResult"
                            class="w-6 h-6 flex items-center justify-center rounded bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300"><span
                                class="material-symbols-outlined text-[14px]">keyboard_arrow_up</span></button>
                        <span class="text-gray-500 font-mono px-1">{{ currentPathIdx + 1 }}/{{ searchPaths.length
                            }}</span>
                        <button @click="nextResult"
                            class="w-6 h-6 flex items-center justify-center rounded bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300"><span
                                class="material-symbols-outlined text-[14px]">keyboard_arrow_down</span></button>
                        <button @click="clearSearchNav" class="ml-1 text-gray-400 hover:text-red-400"><span
                                class="material-symbols-outlined text-[14px]">close</span></button>
                    </div>
                    <!-- ESC hint -->
                    <div v-if="expandedColId"
                        class="text-[10px] text-gray-400 bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono">
                        ESC ← back</div>
                </div>

                <!-- Canvas -->
                <div ref="canvasRef" class="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900/80"
                    @mousedown="onCanvasDown" @mousemove="onCanvasMove" @mouseup="onCanvasUp"
                    :style="{ cursor: editMode && isDragging ? 'grabbing' : editMode ? 'crosshair' : 'default' }">
                    <!-- Zoom wrapper -->
                    <div class="absolute inset-0 overflow-auto" ref="scrollContainer">
                        <div class="zoom-container" :style="zoomStyle"
                            style="min-width:1200px;min-height:800px;position:relative">
                            <!-- Grid -->
                            <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                                style="min-width:1200px;min-height:800px">
                                <defs>
                                    <pattern id="gs" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor"
                                            class="text-gray-400 dark:text-gray-600" stroke-width="0.5" />
                                    </pattern>
                                    <pattern id="gl" width="100" height="100" patternUnits="userSpaceOnUse">
                                        <rect width="100" height="100" fill="url(#gs)" />
                                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor"
                                            class="text-gray-400 dark:text-gray-500" stroke-width="1" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#gl)" />
                            </svg>

                            <!-- ========== SECTION VIEW (columns) ========== -->
                            <template v-if="!expandedColId">
                                <!-- Group boundaries -->
                                <div v-for="g in currentGroups" :key="'gb' + g.id"
                                    class="absolute rounded-xl border-2 border-dashed pointer-events-none"
                                    :style="getGroupBoundary(g)"
                                    :class="{ 'opacity-0': getGroupCols(g.id).length === 0 }">
                                    <div class="absolute -top-5 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                                        :style="{ background: g.color + '30', color: g.color }">{{ g.name }}</div>
                                </div>
                                <!-- Column cards -->
                                <div v-for="col in currentColumns" :key="col.id" class="absolute select-none"
                                    :style="elStyle(col)" :class="[selectedElement?.id === col.id ? 'ring-2 ring-primary shadow-lg shadow-primary/20 z-20' : 'z-10',
                                    editMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                                    highlightedColIds.includes(col.id) ? 'search-highlight z-30' : '']"
                                    @mousedown.stop="onElDown($event, col)" @click.stop="onColClick(col)">
                                    <!-- Tooltip -->
                                    <div v-if="highlightedColIds.includes(col.id) && getHighlightProducts(col.id).length"
                                        class="absolute -top-20 left-1/2 -translate-x-1/2 w-52 bg-gray-900 dark:bg-black text-white p-2.5 rounded-xl shadow-2xl z-50 search-tooltip pointer-events-none border border-primary/40">
                                        <div class="text-[10px] font-bold text-primary mb-1">📦 {{
                                            getHighlightProducts(col.id).length }} product(s) found</div>
                                        <div v-for="p in getHighlightProducts(col.id).slice(0, 3)" :key="p.sku"
                                            class="text-[9px] text-gray-300">• {{ p.name }} <span
                                                class="text-gray-500">({{
                                                    p.sku }})</span></div>
                                        <div v-if="getHighlightProducts(col.id).length > 3"
                                            class="text-[9px] text-gray-500 mt-0.5">+{{
                                            getHighlightProducts(col.id).length - 3 }}
                                            more...</div>
                                        <div
                                            class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 bg-gray-900 dark:bg-black rotate-45 border-r border-b border-primary/40">
                                        </div>
                                    </div>
                                    <div class="w-full h-full rounded-lg border-2 flex flex-col items-center justify-center gap-1 text-[10px] font-bold relative overflow-hidden group hover:shadow-lg transition-shadow"
                                        :style="{ borderColor: getColColor(col) + '80', background: getColColor(col) + '18' }">
                                        <span class="material-symbols-outlined text-[20px] opacity-60"
                                            :style="{ color: getColColor(col) }">inventory_2</span>
                                        <span :style="{ color: getColColor(col) }">{{ col.label }}</span>
                                        <span class="text-[8px] opacity-50" :style="{ color: getColColor(col) }">{{
                                            getGroupName(col.groupId) }}</span>
                                        <span class="absolute top-1 right-1 text-[8px] px-1 py-0.5 rounded font-bold"
                                            :style="{ background: getColColor(col) + '20', color: getColColor(col) }">{{
                                                getRacksForCol(col.id).length }} racks</span>
                                        <span v-if="getProductsInCol(col.id).length"
                                            class="absolute bottom-1 right-1 text-[7px] px-1 py-0.5 rounded bg-primary/20 text-primary font-bold">{{
                                                getProductsInCol(col.id).length }} items</span>
                                    </div>
                                </div>
                            </template>

                            <!-- ========== EXPANDED RACK VIEW ========== -->
                            <template v-if="expandedColId">
                                <div v-for="rack in expandedRacks" :key="rack.id" class="absolute select-none"
                                    :style="elStyle(rack)" :class="[selectedElement?.id === rack.id ? 'ring-2 ring-primary shadow-lg shadow-primary/20 z-20' : 'z-10',
                                    editMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                                    highlightedRackIds.includes(rack.id) ? 'search-highlight z-30' : '']"
                                    @mousedown.stop="onElDown($event, rack)">
                                    <!-- Rack tooltip -->
                                    <div v-if="highlightedRackIds.includes(rack.id) && getHighlightRackProducts(rack.id).length"
                                        class="absolute -top-20 left-1/2 -translate-x-1/2 w-52 bg-gray-900 dark:bg-black text-white p-2.5 rounded-xl shadow-2xl z-50 search-tooltip pointer-events-none border border-primary/40">
                                        <div class="text-[10px] font-bold text-primary mb-1">📦 {{ rack.label }}</div>
                                        <div v-for="p in getHighlightRackProducts(rack.id)" :key="p.sku"
                                            class="text-[9px] text-gray-300">• {{ p.name }} <span
                                                class="text-white font-bold">{{ p.qty }} {{ p.unit }}</span></div>
                                        <div
                                            class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 bg-gray-900 dark:bg-black rotate-45 border-r border-b border-primary/40">
                                        </div>
                                    </div>
                                    <div
                                        class="w-full h-full rounded-lg border border-purple-500/40 bg-purple-500/8 flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-purple-400 relative overflow-hidden group hover:shadow-lg transition-shadow">
                                        <!-- Cell grid -->
                                        <div class="grid gap-0.5 p-1"
                                            :style="{ gridTemplateColumns: `repeat(${rack.cols || 4},1fr)` }">
                                            <div v-for="c in (rack.cols || 4) * (rack.rows || 3)" :key="c"
                                                class="w-5 h-5 rounded-sm border flex items-center justify-center text-[7px] relative group/cell cursor-default"
                                                :class="getCellProduct(rack.id, c) ? 'border-purple-400/60 bg-purple-500/25 text-purple-300' : 'border-purple-500/20 bg-purple-500/5 text-transparent'">
                                                {{ getCellProduct(rack.id, c) ? '●' : '○' }}
                                                <!-- Cell hover tooltip -->
                                                <div v-if="getCellProduct(rack.id, c)"
                                                    class="hidden group-hover/cell:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-40 bg-black/95 text-white p-2 rounded-lg text-[9px] z-50 pointer-events-none shadow-xl">
                                                    <div class="font-bold text-primary">{{ getCellProduct(rack.id,
                                                        c).name }}
                                                    </div>
                                                    <div class="text-gray-400">{{ getCellProduct(rack.id, c).sku }} · {{
                                                        getCellProduct(rack.id, c).qty }} {{ getCellProduct(rack.id,
                                                        c).unit }}
                                                    </div>
                                                    <div class="text-gray-500">Order: {{ getCellProduct(rack.id,
                                                        c).orderId }}
                                                    </div>
                                                    <div v-if="getCellProduct(rack.id, c).rma" class="text-yellow-400">
                                                        RMA: {{
                                                            getCellProduct(rack.id, c).rma }}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <span>{{ rack.label }}</span>
                                        <span v-if="getProductsInRack(rack.id).length"
                                            class="absolute top-1 right-1 text-[7px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">{{
                                                getProductsInRack(rack.id).length }} items</span>
                                    </div>
                                    <!-- Resize handle -->
                                    <div v-if="editMode && selectedElement?.id === rack.id"
                                        class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-30"
                                        @mousedown.stop="onResizeDown($event, rack)">
                                        <div class="w-2.5 h-2.5 border-r-2 border-b-2 border-primary rounded-br"></div>
                                    </div>
                                </div>
                            </template>
                        </div><!-- end zoom-container -->
                    </div><!-- end scroll wrapper -->
                </div>
            </div>

            <!-- Sidebar -->
            <div class="w-64 flex flex-col gap-3">
                <!-- Properties -->
                <div v-if="selectedElement && editMode" class="glass-panel rounded-xl p-4 space-y-3">
                    <h3 class="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1"><span
                            class="material-symbols-outlined text-[16px] text-primary">settings</span>Properties</h3>
                    <div><label class="text-[10px] text-gray-500 block">Label</label><input
                            v-model="selectedElement.label"
                            class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                    </div>
                    <div v-if="selectedElement.type === 'column'"><label
                            class="text-[10px] text-gray-500 block">Group</label>
                        <select v-model="selectedElement.groupId"
                            class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none">
                            <option :value="null">None</option>
                            <option v-for="g in currentGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div><label class="text-[10px] text-gray-500 block">W</label><input type="number"
                                v-model.number="selectedElement.w" min="40"
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none" />
                        </div>
                        <div><label class="text-[10px] text-gray-500 block">H</label><input type="number"
                                v-model.number="selectedElement.h" min="40"
                                class="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none" />
                        </div>
                    </div>
                </div>
                <!-- Groups -->
                <div class="glass-panel rounded-xl p-4 flex-1 overflow-hidden flex flex-col gap-2">
                    <h3 class="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1"><span
                            class="material-symbols-outlined text-[16px] text-yellow-400">folder</span>Groups</h3>
                    <div class="flex-1 overflow-y-auto space-y-2">
                        <div v-for="g in currentGroups" :key="g.id" @click="editingGroup = g"
                            class="p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 cursor-pointer hover:border-primary/30">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded-full" :style="{ background: g.color }"></div><span
                                    class="text-xs font-bold text-gray-900 dark:text-white flex-1">{{ g.name
                                    }}</span><span class="text-[9px] text-gray-500">{{ getGroupCols(g.id).length }}
                                    cols</span>
                            </div>
                        </div>
                        <div v-if="!currentGroups.length" class="text-center text-gray-500 text-xs py-6">No groups</div>
                    </div>
                </div>
                <!-- Floor summary -->
                <div v-if="!expandedColId" class="glass-panel rounded-xl p-4 space-y-2">
                    <div class="flex justify-between text-xs"><span class="text-gray-500">Sections</span><span
                            class="font-bold text-gray-900 dark:text-white">{{ currentColumns.length }}</span></div>
                    <div class="flex justify-between text-xs"><span class="text-gray-500">Total Racks</span><span
                            class="font-bold text-gray-900 dark:text-white">{{ currentRacks.length }}</span></div>
                    <div class="flex justify-between text-xs"><span class="text-gray-500">Total Products</span><span
                            class="font-bold text-primary">{{ currentFloorProducts.length }}</span></div>
                </div>
            </div>
        </div>

        <!-- Group Modal -->
        <Teleport to="body">
            <div v-if="showGroupModal || editingGroup"
                class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                @click.self="showGroupModal = false; editingGroup = null">
                <div
                    class="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                    <div
                        class="px-6 py-3 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <h3 class="font-bold text-gray-900 dark:text-white">{{ editingGroup ? 'Edit' : 'New' }} Group
                        </h3>
                        <button @click="showGroupModal = false; editingGroup = null"
                            class="text-gray-400 hover:text-gray-700 dark:hover:text-white"><span
                                class="material-symbols-outlined">close</span></button>
                    </div>
                    <div class="p-5 space-y-3">
                        <div><label
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label><input
                                v-model="groupForm.name" placeholder="e.g. Fragile"
                                class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-primary/50" />
                        </div>
                        <div><label
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                            <div class="flex gap-2 flex-wrap"><button v-for="c in presetColors" :key="c"
                                    @click="groupForm.color = c"
                                    class="w-7 h-7 rounded-lg border-2 hover:scale-110 transition-transform"
                                    :class="groupForm.color === c ? 'border-white ring-2 ring-primary scale-110' : 'border-transparent'"
                                    :style="{ background: c }"></button></div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Internal
                                    Gap</label><input type="number" v-model.number="groupForm.internalGap" min="0"
                                    max="20"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none" />
                            </div>
                            <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">External
                                    Gap</label><input type="number" v-model.number="groupForm.externalGap" min="0"
                                    max="40"
                                    class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none" />
                            </div>
                        </div>
                    </div>
                    <div
                        class="px-6 py-3 border-t border-gray-200 dark:border-white/5 flex justify-between bg-gray-50 dark:bg-white/5">
                        <button v-if="editingGroup" @click="deleteGroup(editingGroup.id)"
                            class="text-red-500 text-sm font-bold">Delete</button>
                        <div v-else></div>
                        <div class="flex gap-2"><button @click="showGroupModal = false; editingGroup = null"
                                class="px-3 py-1.5 text-gray-600 dark:text-gray-400 text-sm">Cancel</button><button
                                @click="saveGroup"
                                class="px-4 py-1.5 bg-primary text-white rounded-lg font-bold text-sm">{{
                                    editingGroup ? 'Save' : 'Create' }}</button></div>
                    </div>
                </div>
            </div>
        </Teleport>
        <div v-if="toastMsg"
            class="fixed bottom-6 right-6 bg-green-500/90 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-bounce">
            <span class="material-symbols-outlined">check_circle</span>
            <div class="font-bold text-sm">{{ toastMsg }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const activeFloor = ref(1)
const editMode = ref(false)
const snapToGrid = ref(true)
const selectedElement = ref(null)
const expandedColId = ref(null)
const showGroupModal = ref(false)
const editingGroup = ref(null)
const toastMsg = ref('')
const canvasRef = ref(null)
const isDragging = ref(false)
const isResizing = ref(false)
const dragOff = ref({ x: 0, y: 0 })
const searchQuery = ref('')
const searchResults = ref([])
const highlightedColIds = ref([])
const highlightedRackIds = ref([])
const highlightedProducts = ref([])
const searchPaths = ref([])
const currentPathIdx = ref(0)
let searchTimer = null
let highlightTimer = null

// Zoom state
const zoomLevel = ref('FLOOR') // FLOOR | SECTION
const transitioning = ref(false)

const zoomStyle = computed(() => {
    if (expandedColId.value && expandedColumn.value) {
        return { transition: transitioning.value ? 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s' : 'none' }
    }
    return { transition: transitioning.value ? 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s' : 'none' }
})

const currentFloorLabel = computed(() => floors.value.find(f => f.id === activeFloor.value)?.label || 'Floor')

const floors = ref([{ id: 1, label: 'Floor 1' }, { id: 2, label: 'Floor 2' }, { id: 3, label: 'Floor 3' }])
const presetColors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1']

const groups = ref([
    { id: 'g1', floorId: 1, name: 'Fragile', color: '#ef4444', internalGap: 2, externalGap: 10 },
    { id: 'g2', floorId: 1, name: 'Fertilizer', color: '#10b981', internalGap: 2, externalGap: 10 },
    { id: 'g3', floorId: 1, name: 'Electronics', color: '#3b82f6', internalGap: 4, externalGap: 14 },
    { id: 'g4', floorId: 2, name: 'Cold Storage', color: '#06b6d4', internalGap: 3, externalGap: 12 },
])

// Columns = sections
const columns = ref([
    { id: 'c1', floorId: 1, type: 'column', label: 'SEC-01 Fragile', groupId: 'g1', x: 40, y: 60, w: 120, h: 140 },
    { id: 'c2', floorId: 1, type: 'column', label: 'SEC-02 Fragile', groupId: 'g1', x: 166, y: 60, w: 120, h: 140 },
    { id: 'c3', floorId: 1, type: 'column', label: 'SEC-03 Fertilizer', groupId: 'g2', x: 320, y: 60, w: 120, h: 140 },
    { id: 'c4', floorId: 1, type: 'column', label: 'SEC-04 Fertilizer', groupId: 'g2', x: 446, y: 60, w: 120, h: 140 },
    { id: 'c5', floorId: 1, type: 'column', label: 'SEC-05 Electronics', groupId: 'g3', x: 600, y: 60, w: 140, h: 140 },
    { id: 'c6', floorId: 1, type: 'column', label: 'SEC-06 Electronics', groupId: 'g3', x: 746, y: 60, w: 140, h: 140 },
    { id: 'c7', floorId: 1, type: 'column', label: 'SEC-07 General', groupId: null, x: 40, y: 260, w: 120, h: 130 },
    { id: 'c8', floorId: 2, type: 'column', label: 'SEC-10 Cold A', groupId: 'g4', x: 60, y: 60, w: 130, h: 150 },
    { id: 'c9', floorId: 2, type: 'column', label: 'SEC-11 Cold B', groupId: 'g4', x: 200, y: 60, w: 130, h: 150 },
])

// Racks = cells inside columns
const racks = ref([
    { id: 'r1', colId: 'c1', label: 'Rack-A1', x: 30, y: 30, w: 180, h: 110, cols: 4, rows: 3 },
    { id: 'r2', colId: 'c1', label: 'Rack-A2', x: 230, y: 30, w: 180, h: 110, cols: 4, rows: 3 },
    { id: 'r3', colId: 'c2', label: 'Rack-B1', x: 30, y: 30, w: 200, h: 120, cols: 5, rows: 3 },
    { id: 'r4', colId: 'c2', label: 'Rack-B2', x: 250, y: 30, w: 200, h: 120, cols: 5, rows: 3 },
    { id: 'r5', colId: 'c3', label: 'Rack-C1', x: 30, y: 30, w: 180, h: 110, cols: 4, rows: 3 },
    { id: 'r6', colId: 'c3', label: 'Rack-C2', x: 230, y: 30, w: 180, h: 110, cols: 4, rows: 3 },
    { id: 'r7', colId: 'c4', label: 'Rack-D1', x: 30, y: 30, w: 200, h: 130, cols: 5, rows: 3 },
    { id: 'r8', colId: 'c5', label: 'Rack-E1', x: 30, y: 30, w: 200, h: 120, cols: 5, rows: 3 },
    { id: 'r9', colId: 'c5', label: 'Rack-E2', x: 250, y: 30, w: 200, h: 120, cols: 5, rows: 3 },
    { id: 'r10', colId: 'c6', label: 'Rack-F1', x: 30, y: 30, w: 220, h: 140, cols: 6, rows: 4 },
    { id: 'r11', colId: 'c7', label: 'Rack-G1', x: 30, y: 30, w: 180, h: 100, cols: 4, rows: 3 },
    { id: 'r12', colId: 'c8', label: 'Rack-H1', x: 30, y: 30, w: 200, h: 120, cols: 5, rows: 3 },
    { id: 'r13', colId: 'c8', label: 'Rack-H2', x: 250, y: 30, w: 200, h: 120, cols: 5, rows: 3 },
    { id: 'r14', colId: 'c9', label: 'Rack-I1', x: 30, y: 30, w: 200, h: 120, cols: 5, rows: 3 },
])

// Products in rack cells
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
    { sku: 'CLD-6005', name: 'Ice Cream Tubs 500ml', orderId: 'ORD-21220', rma: null, rackId: 'r14', cell: 8, qty: 300, unit: 'tubs' },
])

// ==================== COMPUTED ====================
const currentColumns = computed(() => columns.value.filter(c => c.floorId === activeFloor.value))
const currentGroups = computed(() => groups.value.filter(g => g.floorId === activeFloor.value))
const currentRacks = computed(() => {
    const colIds = currentColumns.value.map(c => c.id)
    return racks.value.filter(r => colIds.includes(r.colId))
})
const currentFloorProducts = computed(() => {
    const rackIds = currentRacks.value.map(r => r.id)
    return products.value.filter(p => rackIds.includes(p.rackId))
})
const expandedColumn = computed(() => columns.value.find(c => c.id === expandedColId.value))
const expandedRacks = computed(() => racks.value.filter(r => r.colId === expandedColId.value))

function getRacksForCol(colId) { return racks.value.filter(r => r.colId === colId) }
function getGroupCols(gid) { return currentColumns.value.filter(c => c.groupId === gid) }
function getGroupName(gid) { return groups.value.find(g => g.id === gid)?.name || '' }
function getColColor(col) { if (!col) return '#6b7280'; const g = groups.value.find(g => g.id === col.groupId); return g?.color || '#6b7280' }
function getProductsInCol(colId) { const rids = getRacksForCol(colId).map(r => r.id); return products.value.filter(p => rids.includes(p.rackId)) }
function getProductsInRack(rackId) { return products.value.filter(p => p.rackId === rackId) }
function getCellProduct(rackId, cell) { return products.value.find(p => p.rackId === rackId && p.cell === cell) || null }
function elStyle(el) { return { left: el.x + 'px', top: el.y + 'px', width: el.w + 'px', height: el.h + 'px' } }

function getGroupBoundary(g) {
    const cols = getGroupCols(g.id); if (!cols.length) return { opacity: 0 }
    const p = 12, mnX = Math.min(...cols.map(c => c.x)) - p, mnY = Math.min(...cols.map(c => c.y)) - p
    const mxX = Math.max(...cols.map(c => c.x + c.w)) + p, mxY = Math.max(...cols.map(c => c.y + c.h)) + p
    return { left: mnX + 'px', top: mnY + 'px', width: (mxX - mnX) + 'px', height: (mxY - mnY) + 'px', borderColor: g.color + '50' }
}

// ==================== SEARCH (progressive) ====================
function onSearch() {
    clearTimeout(searchTimer); highlightedColIds.value = []; highlightedRackIds.value = []; highlightedProducts.value = []
    if (!searchQuery.value.trim()) { searchResults.value = []; return }
    searchTimer = setTimeout(() => {
        const q = searchQuery.value.toLowerCase().trim()
        const matched = products.value.filter(p => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.orderId.toLowerCase().includes(q) || (p.rma && p.rma.toLowerCase().includes(q)))
        searchResults.value = matched.map(p => {
            const rack = racks.value.find(r => r.id === p.rackId)
            const col = columns.value.find(c => c.id === rack?.colId)
            return { product: p, rackId: p.rackId, colId: rack?.colId, colLabel: col?.label || '?', rackLabel: rack?.label || '?', floorId: col?.floorId || 1 }
        })
    }, 200)
}

function focusSearchResult(r) {
    if (r.floorId !== activeFloor.value) activeFloor.value = r.floorId
    highlightedProducts.value = searchResults.value.map(s => s.product)
    searchPaths.value = [...searchResults.value]
    currentPathIdx.value = searchResults.value.indexOf(r)
    searchQuery.value = ''
    // Count unique columns matched on this floor
    const colIds = [...new Set(searchResults.value.filter(s => s.floorId === r.floorId).map(s => s.colId))]
    const rackIds = [...new Set(searchResults.value.filter(s => s.colId === r.colId).map(s => s.rackId))]
    searchResults.value = []

    transitioning.value = true
    if (colIds.length > 1) {
        expandedColId.value = null
        highlightedColIds.value = colIds
        highlightedRackIds.value = []
    } else if (colIds.length === 1 && rackIds.length > 1) {
        expandedColId.value = colIds[0]
        highlightedColIds.value = []
        nextTick(() => { highlightedRackIds.value = rackIds })
    } else {
        expandedColId.value = r.colId
        highlightedColIds.value = []
        nextTick(() => { highlightedRackIds.value = [r.rackId] })
    }
    setTimeout(() => { transitioning.value = false }, 450)
    clearTimeout(highlightTimer)
    highlightTimer = setTimeout(() => { highlightedColIds.value = []; highlightedRackIds.value = []; highlightedProducts.value = [] }, 8000)
}

function nextResult() {
    if (!searchPaths.value.length) return
    currentPathIdx.value = (currentPathIdx.value + 1) % searchPaths.value.length
    navigateToPath(searchPaths.value[currentPathIdx.value])
}
function prevResult() {
    if (!searchPaths.value.length) return
    currentPathIdx.value = (currentPathIdx.value - 1 + searchPaths.value.length) % searchPaths.value.length
    navigateToPath(searchPaths.value[currentPathIdx.value])
}
function navigateToPath(p) {
    if (p.floorId !== activeFloor.value) activeFloor.value = p.floorId
    highlightedProducts.value = [p.product]
    transitioning.value = true
    expandedColId.value = p.colId
    highlightedColIds.value = []
    nextTick(() => { highlightedRackIds.value = [p.rackId] })
    setTimeout(() => { transitioning.value = false }, 450)
    clearTimeout(highlightTimer)
    highlightTimer = setTimeout(() => { highlightedRackIds.value = []; highlightedProducts.value = [] }, 8000)
}
function clearSearchNav() {
    searchPaths.value = []; currentPathIdx.value = 0
    highlightedColIds.value = []; highlightedRackIds.value = []; highlightedProducts.value = []
}

function getHighlightProducts(colId) { return highlightedProducts.value.filter(p => { const rack = racks.value.find(r => r.id === p.rackId); return rack?.colId === colId }) }
function getHighlightRackProducts(rackId) { return highlightedProducts.value.filter(p => p.rackId === rackId) }

// ==================== INTERACTIONS ====================
function onColClick(col) {
    if (!editMode.value) {
        transitioning.value = true
        expandedColId.value = col.id
        selectedElement.value = null
        setTimeout(() => { transitioning.value = false }, 450)
    } else { selectedElement.value = col }
}
function onElDown(e, el) { if (!editMode.value) return; selectedElement.value = el; isDragging.value = true; isResizing.value = false; dragOff.value = { x: e.clientX - el.x, y: e.clientY - el.y } }
function onResizeDown(e, el) { if (!editMode.value) return; isResizing.value = true; isDragging.value = false; dragOff.value = { x: e.clientX, y: e.clientY, ow: el.w, oh: el.h } }
function onCanvasDown(e) { if (e.target === canvasRef.value || ['svg', 'rect', 'path'].includes(e.target.tagName)) selectedElement.value = null }
function onCanvasMove(e) {
    if (!editMode.value || !selectedElement.value) return
    const snap = v => snapToGrid.value ? Math.round(v / 20) * 20 : v
    if (isDragging.value) { selectedElement.value.x = Math.max(0, snap(e.clientX - dragOff.value.x)); selectedElement.value.y = Math.max(0, snap(e.clientY - dragOff.value.y)) }
    if (isResizing.value) { selectedElement.value.w = Math.max(40, snap(dragOff.value.ow + (e.clientX - dragOff.value.x))); selectedElement.value.h = Math.max(40, snap(dragOff.value.oh + (e.clientY - dragOff.value.y))) }
}
function onCanvasUp() { isDragging.value = false; isResizing.value = false }
function deleteSelected() {
    if (!selectedElement.value) return
    const id = selectedElement.value.id
    if (selectedElement.value.type === 'column') {
        // Cascade: delete racks and products in those racks
        const rackIds = racks.value.filter(r => r.colId === id).map(r => r.id)
        products.value = products.value.filter(p => !rackIds.includes(p.rackId))
        racks.value = racks.value.filter(r => r.colId !== id)
        columns.value = columns.value.filter(c => c.id !== id)
    } else {
        // Cascade: delete products in this rack
        products.value = products.value.filter(p => p.rackId !== id)
        racks.value = racks.value.filter(r => r.id !== id)
    }
    selectedElement.value = null
    showToast('Deleted (with contents)')
}

let idc = 100
function addColumn() { columns.value.push({ id: 'c' + (idc++), floorId: activeFloor.value, type: 'column', label: `SEC-${idc}`, groupId: null, x: 80 + Math.random() * 200, y: 80 + Math.random() * 200, w: 120, h: 140 }); showToast('Section added') }
function addRackToCol() { if (!expandedColId.value) return; racks.value.push({ id: 'r' + (idc++), colId: expandedColId.value, label: `Rack-${idc}`, x: 30 + Math.random() * 100, y: 30 + Math.random() * 100, w: 180, h: 110, cols: 4, rows: 3 }); showToast('Rack added') }

// ==================== FLOORS ====================
function addFloor() { const nid = Math.max(...floors.value.map(f => f.id), 0) + 1; floors.value.push({ id: nid, label: `Floor ${nid}` }); activeFloor.value = nid; showToast(`Floor ${nid} added`) }
function deleteFloor() { if (floors.value.length <= 1) return; const id = activeFloor.value; columns.value = columns.value.filter(c => c.floorId !== id); groups.value = groups.value.filter(g => g.floorId !== id); floors.value = floors.value.filter(f => f.id !== id); activeFloor.value = floors.value[0].id; expandedColId.value = null; showToast('Floor deleted') }

// ==================== GROUPS ====================
const groupForm = ref({ name: '', color: '#3b82f6', internalGap: 2, externalGap: 10 })
watch(editingGroup, g => { if (g) groupForm.value = { name: g.name, color: g.color, internalGap: g.internalGap, externalGap: g.externalGap }; else groupForm.value = { name: '', color: '#3b82f6', internalGap: 2, externalGap: 10 } })
watch(showGroupModal, v => { if (v) groupForm.value = { name: '', color: '#3b82f6', internalGap: 2, externalGap: 10 } })
function saveGroup() { if (!groupForm.value.name.trim()) return; if (editingGroup.value) { Object.assign(editingGroup.value, groupForm.value); showToast('Group updated'); editingGroup.value = null } else { groups.value.push({ id: 'g' + Date.now(), floorId: activeFloor.value, ...groupForm.value }); showToast('Group created'); showGroupModal.value = false } }
function deleteGroup(id) { columns.value.forEach(c => { if (c.groupId === id) c.groupId = null }); groups.value = groups.value.filter(g => g.id !== id); editingGroup.value = null; showToast('Group deleted') }

function showToast(m) { toastMsg.value = m; setTimeout(() => { toastMsg.value = '' }, 2500) }
watch(activeFloor, () => { selectedElement.value = null; expandedColId.value = null; searchPaths.value = [] })

// ESC key handler
function onKeyDown(e) {
    if (e.key === 'Escape') {
        if (expandedColId.value) {
            transitioning.value = true
            expandedColId.value = null
            highlightedRackIds.value = []
            setTimeout(() => { transitioning.value = false }, 450)
        } else {
            selectedElement.value = null
        }
    }
    // Arrow keys for search nav
    if (searchPaths.value.length > 0) {
        if (e.key === 'ArrowDown') { e.preventDefault(); nextResult() }
        if (e.key === 'ArrowUp') { e.preventDefault(); prevResult() }
    }
}
import { onMounted, onUnmounted } from 'vue'
onMounted(() => { window.addEventListener('keydown', onKeyDown) })
onUnmounted(() => { window.removeEventListener('keydown', onKeyDown) })
</script>

<style scoped>
.zoom-container {
    transform-origin: 0 0;
}

.search-highlight {
    animation: pulse-hl 1s ease-in-out infinite;
}

@keyframes pulse-hl {

    0%,
    100% {
        box-shadow: 0 0 0 0 rgba(68, 233, 150, .4), 0 0 20px rgba(68, 233, 150, .2);
        transform: scale(1);
    }

    50% {
        box-shadow: 0 0 0 8px rgba(68, 233, 150, 0), 0 0 30px rgba(68, 233, 150, .3);
        transform: scale(1.03);
    }
}

.search-tooltip {
    animation: tt-bounce 1.5s ease-in-out infinite;
}

@keyframes tt-bounce {

    0%,
    100% {
        transform: translateX(-50%) translateY(0);
    }

    50% {
        transform: translateX(-50%) translateY(-6px);
    }
}
</style>
