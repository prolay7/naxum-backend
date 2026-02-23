<template>
    <div class="space-y-4">
        <!-- Filters -->
        <div class="rounded-xl bg-white p-5 shadow-sm">
            <div class="flex flex-wrap gap-3">
                <!-- Distributor -->
                <div class="flex-1 min-w-36">
                    <label class="mb-1 block text-xs font-medium text-slate-500">Distributor</label>
                    <input
                        v-model="filters.distributor"
                        type="text"
                        placeholder="Name or ID…"
                        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        @keyup.enter="applyFilters"
                    />
                </div>

                <!-- Date From -->
                <div class="flex-1 min-w-36">
                    <label class="mb-1 block text-xs font-medium text-slate-500">Date From</label>
                    <input
                        v-model="filters.date_from"
                        type="date"
                        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                </div>

                <!-- Date To -->
                <div class="flex-1 min-w-36">
                    <label class="mb-1 block text-xs font-medium text-slate-500">Date To</label>
                    <input
                        v-model="filters.date_to"
                        type="date"
                        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                </div>

                <!-- Invoice -->
                <div class="flex-1 min-w-36">
                    <label class="mb-1 block text-xs font-medium text-slate-500">Invoice</label>
                    <input
                        v-model="filters.invoice"
                        type="text"
                        placeholder="ABC4170…"
                        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        @keyup.enter="applyFilters"
                    />
                </div>

                <!-- Buttons -->
                <div class="flex items-end gap-2">
                    <button
                        @click="applyFilters"
                        :disabled="loading"
                        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                    >
                        Search
                    </button>
                    <button
                        v-if="hasFilters"
                        @click="resetFilters"
                        :disabled="loading"
                        class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>

        <!-- Table card -->
        <div class="rounded-xl bg-white shadow-sm">
            <!-- Error -->
            <div
                v-if="error"
                class="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
                {{ error }}
            </div>

            <template v-else>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                <th class="px-5 py-3">Invoice</th>
                                <th class="px-5 py-3">Purchaser</th>
                                <th class="px-5 py-3">Distributor</th>
                                <th class="px-5 py-3 text-right">Referred Dist.</th>
                                <th class="px-5 py-3">Order Date</th>
                                <th class="px-5 py-3 text-right">%</th>
                                <th class="px-5 py-3 text-right">Order Total</th>
                                <th class="px-5 py-3 text-right">Commission</th>
                                <th class="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">

                            <!-- Skeleton rows -->
                            <template v-if="loading">
                                <tr
                                    v-for="n in skeletonRows"
                                    :key="`skel-${n}`"
                                    class="animate-pulse"
                                >
                                    <td class="px-5 py-4">
                                        <div class="h-3 rounded bg-slate-200" :class="skelW[n % skelW.length]"></div>
                                    </td>
                                    <td class="px-5 py-4">
                                        <div class="h-3 rounded bg-slate-200" :class="skelW[(n + 2) % skelW.length]"></div>
                                    </td>
                                    <td class="px-5 py-4">
                                        <div class="h-3 rounded bg-slate-200" :class="skelW[(n + 4) % skelW.length]"></div>
                                    </td>
                                    <td class="px-5 py-4 text-right">
                                        <div class="ml-auto h-3 w-8 rounded bg-slate-200"></div>
                                    </td>
                                    <td class="px-5 py-4">
                                        <div class="h-3 w-20 rounded bg-slate-200"></div>
                                    </td>
                                    <td class="px-5 py-4 text-right">
                                        <div class="ml-auto h-3 w-6 rounded bg-slate-200"></div>
                                    </td>
                                    <td class="px-5 py-4 text-right">
                                        <div class="ml-auto h-3 w-16 rounded bg-slate-200"></div>
                                    </td>
                                    <td class="px-5 py-4 text-right">
                                        <div class="ml-auto h-3 w-14 rounded bg-slate-200"></div>
                                    </td>
                                    <td class="px-5 py-4 text-right">
                                        <div class="ml-auto h-5 w-10 rounded bg-slate-200"></div>
                                    </td>
                                </tr>
                            </template>

                            <!-- Data rows -->
                            <template v-else>
                                <tr v-if="rows.length === 0">
                                    <td colspan="9" class="py-16 text-center text-sm text-slate-400">
                                        No results found.
                                    </td>
                                </tr>
                                <tr
                                    v-for="row in rows"
                                    :key="row.order_id"
                                    class="text-slate-700 transition hover:bg-slate-50"
                                >
                                    <td class="px-5 py-3 font-mono text-xs font-medium text-slate-600">
                                        {{ row.invoice }}
                                    </td>
                                    <td class="px-5 py-3">{{ row.purchaser }}</td>
                                    <td class="px-5 py-3">
                                        <span v-if="row.distributor">{{ row.distributor }}</span>
                                        <span v-else class="text-slate-400">—</span>
                                    </td>
                                    <td class="px-5 py-3 text-right">
                                        <span v-if="row.referred_distributors !== null">{{ row.referred_distributors }}</span>
                                        <span v-else class="text-slate-400">—</span>
                                    </td>
                                    <td class="px-5 py-3">{{ row.order_date }}</td>
                                    <td class="px-5 py-3 text-right">
                                        <span v-if="row.percentage > 0">{{ row.percentage }}%</span>
                                        <span v-else class="text-slate-400">—</span>
                                    </td>
                                    <td class="px-5 py-3 text-right">{{ fmt(row.order_total) }}</td>
                                    <td class="px-5 py-3 text-right font-medium">
                                        <span v-if="row.commission > 0" class="text-emerald-700">
                                            {{ fmt(row.commission) }}
                                        </span>
                                        <span v-else class="text-slate-400">—</span>
                                    </td>
                                    <td class="px-5 py-3 text-right">
                                        <button
                                            @click="openItems(row)"
                                            class="rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-700"
                                        >
                                            Items
                                        </button>
                                    </td>
                                </tr>
                            </template>

                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                    <p class="text-xs text-slate-500">
                        <span v-if="loading" class="inline-block h-3 w-40 animate-pulse rounded bg-slate-200"></span>
                        <span v-else>Showing {{ from }}–{{ to }} of {{ meta.total ?? 0 }} results</span>
                    </p>
                    <div class="flex items-center gap-1">
                        <button
                            :disabled="loading || currentPage <= 1"
                            @click="goToPage(currentPage - 1)"
                            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            &larr; Prev
                        </button>
                        <span class="px-3 text-sm text-slate-600">
                            <span v-if="loading" class="inline-block h-3 w-16 animate-pulse rounded bg-slate-200"></span>
                            <span v-else>{{ currentPage }} / {{ meta.last_page ?? 1 }}</span>
                        </span>
                        <button
                            :disabled="loading || currentPage >= (meta.last_page ?? 1)"
                            @click="goToPage(currentPage + 1)"
                            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next &rarr;
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </div>

    <!-- Order Items Modal -->
    <OrderItemsModal
        :visible="modal.visible"
        :order-id="modal.orderId"
        :invoice="modal.invoice"
        :purchaser="modal.purchaser"
        :distributor="modal.distributor"
        @close="modal.visible = false"
    />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../services/api'
import OrderItemsModal from '../components/OrderItemsModal.vue'

const rows = ref([])
const meta = ref({})
const loading = ref(false)
const error = ref('')
const currentPage = ref(1)
const perPage = 15

// Varying skeleton bar widths — cycles per row to avoid a uniform look
const skelW = ['w-16', 'w-20', 'w-24', 'w-28', 'w-32', 'w-20', 'w-16', 'w-24']
const skeletonRows = Array.from({ length: perPage }, (_, i) => i)

const filters = reactive({
    distributor: '',
    date_from: '',
    date_to: '',
    invoice: '',
})

const hasFilters = computed(() =>
    !!(filters.distributor || filters.date_from || filters.date_to || filters.invoice)
)

const from = computed(() => {
    if (!meta.value.total) return 0
    return (currentPage.value - 1) * perPage + 1
})

const to = computed(() => {
    return Math.min(currentPage.value * perPage, meta.value.total ?? 0)
})

const modal = reactive({
    visible: false,
    orderId: null,
    invoice: '',
    purchaser: '',
    distributor: '',
})

function openItems(row) {
    modal.orderId     = row.order_id
    modal.invoice     = row.invoice
    modal.purchaser   = row.purchaser
    modal.distributor = row.distributor ?? ''
    modal.visible     = true
}

function fmt(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value)
}

async function fetchData(page = 1) {
    loading.value = true
    error.value = ''
    currentPage.value = page
    try {
        const params = { per_page: perPage, page }
        if (filters.distributor) params.distributor = filters.distributor
        if (filters.date_from)   params.date_from   = filters.date_from
        if (filters.date_to)     params.date_to     = filters.date_to
        if (filters.invoice)     params.invoice     = filters.invoice

        const response = await api.get('/commission-report', { params })
        rows.value = response.data.data
        meta.value = {
            total:     response.data.total,
            last_page: response.data.last_page,
        }
    } catch {
        error.value = 'Failed to load commission report.'
    } finally {
        loading.value = false
    }
}

function applyFilters() {
    fetchData(1)
}

function resetFilters() {
    filters.distributor = ''
    filters.date_from   = ''
    filters.date_to     = ''
    filters.invoice     = ''
    fetchData(1)
}

function goToPage(page) {
    if (page < 1 || page > (meta.value.last_page ?? 1)) return
    fetchData(page)
}

onMounted(() => fetchData(1))
</script>
