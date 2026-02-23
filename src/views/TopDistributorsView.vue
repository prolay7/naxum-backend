<template>
    <div class="space-y-4">
        <!-- Info banner -->
        <div class="rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-3 text-sm text-indigo-700">
            Showing the top 200 distributors ranked by total sales from referred customers (own orders excluded).
        </div>

        <!-- Search bar -->
        <div class="rounded-xl bg-white p-4 shadow-sm">
            <div class="flex gap-3">
                <div class="relative flex-1">
                    <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        v-model="search"
                        type="text"
                        placeholder="Search by distributor name…"
                        class="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        @keyup.enter="applySearch"
                    />
                </div>
                <button
                    @click="applySearch"
                    :disabled="loading"
                    class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                    Search
                </button>
                <button
                    v-if="search"
                    @click="resetSearch"
                    :disabled="loading"
                    class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                >
                    Clear
                </button>
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
                                <th class="w-16 px-5 py-3 text-center">Rank</th>
                                <th class="px-5 py-3">Distributor Name</th>
                                <th class="px-5 py-3 text-right">Total Sales</th>
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
                                    <!-- Rank badge placeholder -->
                                    <td class="px-5 py-4 text-center">
                                        <div class="mx-auto h-7 w-7 rounded-full bg-slate-200"></div>
                                    </td>
                                    <!-- Name -->
                                    <td class="px-5 py-4">
                                        <div class="h-3 rounded bg-slate-200" :class="skelW[n % skelW.length]"></div>
                                    </td>
                                    <!-- Total sales -->
                                    <td class="px-5 py-4 text-right">
                                        <div class="ml-auto h-3 w-20 rounded bg-slate-200"></div>
                                    </td>
                                </tr>
                            </template>

                            <!-- Data rows -->
                            <template v-else>
                                <tr v-if="rows.length === 0">
                                    <td colspan="3" class="py-16 text-center text-sm text-slate-400">
                                        No results found.
                                    </td>
                                </tr>
                                <tr
                                    v-for="row in rows"
                                    :key="row.name + row.top"
                                    class="text-slate-700 transition hover:bg-slate-50"
                                    :class="rankClass(row.top)"
                                >
                                    <td class="px-5 py-3 text-center">
                                        <span
                                            class="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                                            :class="badgeClass(row.top)"
                                        >
                                            {{ row.top }}
                                        </span>
                                    </td>
                                    <td class="px-5 py-3 font-medium">{{ row.name }}</td>
                                    <td class="px-5 py-3 text-right font-semibold text-slate-800">
                                        {{ fmt(row.total_sales) }}
                                    </td>
                                </tr>
                            </template>

                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                    <p class="text-xs text-slate-500">
                        <span v-if="loading" class="inline-block h-3 w-44 animate-pulse rounded bg-slate-200"></span>
                        <span v-else>Showing {{ from }}–{{ to }} of {{ meta.total ?? 0 }} distributors</span>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const rows = ref([])
const meta = ref({})
const loading = ref(false)
const error = ref('')
const currentPage = ref(1)
const perPage = 10
const search = ref('')

// Varying skeleton bar widths for the name column
const skelW = ['w-32', 'w-40', 'w-36', 'w-28', 'w-44', 'w-36', 'w-32', 'w-40', 'w-28', 'w-44']
const skeletonRows = Array.from({ length: perPage }, (_, i) => i)

const from = computed(() => {
    if (!meta.value.total) return 0
    return (currentPage.value - 1) * perPage + 1
})

const to = computed(() => {
    return Math.min(currentPage.value * perPage, meta.value.total ?? 0)
})

function fmt(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value)
}

function rankClass(rank) {
    if (rank === 1) return 'bg-amber-50'
    if (rank === 2) return 'bg-slate-50'
    if (rank === 3) return 'bg-orange-50'
    return ''
}

function badgeClass(rank) {
    if (rank === 1) return 'bg-amber-400 text-white'
    if (rank === 2) return 'bg-slate-400 text-white'
    if (rank === 3) return 'bg-orange-400 text-white'
    return 'bg-slate-100 text-slate-600'
}

function applySearch() {
    fetchData(1)
}

function resetSearch() {
    search.value = ''
    fetchData(1)
}

async function fetchData(page = 1) {
    loading.value = true
    error.value = ''
    currentPage.value = page
    try {
        const params = { per_page: perPage, page }
        if (search.value.trim()) params.search = search.value.trim()

        const response = await api.get('/top-distributors', { params })
        rows.value = response.data.data
        meta.value = {
            total:     response.data.total,
            last_page: response.data.last_page,
        }
    } catch {
        error.value = 'Failed to load top distributors.'
    } finally {
        loading.value = false
    }
}

function goToPage(page) {
    if (page < 1 || page > (meta.value.last_page ?? 1)) return
    fetchData(page)
}

onMounted(() => fetchData(1))
</script>
