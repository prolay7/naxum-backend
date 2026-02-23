<template>
    <Teleport to="body">
        <div
            v-if="visible"
            class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <!-- Backdrop -->
            <div
                class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                @click="$emit('close')"
            />

            <!-- Dialog -->
            <div class="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                <!-- Header -->
                <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h3 class="font-semibold text-slate-800">Order Items</h3>

                        <!-- Skeleton subtitle while loading -->
                        <div v-if="loading" class="mt-1.5 flex items-center gap-2">
                            <div class="h-3 w-20 animate-pulse rounded bg-slate-200"></div>
                            <div class="h-3 w-1 animate-pulse rounded bg-slate-200"></div>
                            <div class="h-3 w-28 animate-pulse rounded bg-slate-200"></div>
                            <div class="h-3 w-1 animate-pulse rounded bg-slate-200"></div>
                            <div class="h-3 w-24 animate-pulse rounded bg-slate-200"></div>
                        </div>

                        <!-- Real subtitle -->
                        <p v-else class="mt-0.5 text-xs text-slate-500">
                            <span v-if="invoice" class="font-mono font-medium text-slate-600">{{ invoice }}</span>
                            <template v-if="invoice && purchaser"> &middot; </template>
                            <span v-if="purchaser">{{ purchaser }}</span>
                            <template v-if="distributor"> &middot; via <span class="text-indigo-600">{{ distributor }}</span></template>
                        </p>
                    </div>
                    <button
                        @click="$emit('close')"
                        class="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Body -->
                <div class="px-6 py-4">
                    <!-- Error -->
                    <div
                        v-if="error"
                        class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        {{ error }}
                    </div>

                    <!-- Table (always rendered so header is stable) -->
                    <div v-else class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                    <th class="pb-3 pr-4">SKU</th>
                                    <th class="pb-3 pr-4">Product</th>
                                    <th class="pb-3 pr-4 text-right">Price</th>
                                    <th class="pb-3 pr-4 text-right">Qty</th>
                                    <th class="pb-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">

                                <!-- Skeleton rows -->
                                <template v-if="loading">
                                    <tr
                                        v-for="n in 4"
                                        :key="`skel-${n}`"
                                        class="animate-pulse"
                                    >
                                        <td class="py-3.5 pr-4">
                                            <div class="h-3 w-16 rounded bg-slate-200"></div>
                                        </td>
                                        <td class="py-3.5 pr-4">
                                            <div class="h-3 rounded bg-slate-200" :class="skelW[n % skelW.length]"></div>
                                        </td>
                                        <td class="py-3.5 pr-4 text-right">
                                            <div class="ml-auto h-3 w-14 rounded bg-slate-200"></div>
                                        </td>
                                        <td class="py-3.5 pr-4 text-right">
                                            <div class="ml-auto h-3 w-6 rounded bg-slate-200"></div>
                                        </td>
                                        <td class="py-3.5 text-right">
                                            <div class="ml-auto h-3 w-16 rounded bg-slate-200"></div>
                                        </td>
                                    </tr>
                                </template>

                                <!-- Empty state -->
                                <template v-else-if="items.length === 0">
                                    <tr>
                                        <td colspan="5" class="py-12 text-center text-sm text-slate-500">
                                            No items found for this order.
                                        </td>
                                    </tr>
                                </template>

                                <!-- Data rows -->
                                <template v-else>
                                    <tr v-for="item in items" :key="item.sku" class="text-slate-700">
                                        <td class="py-3 pr-4 font-mono text-xs text-slate-500">{{ item.sku }}</td>
                                        <td class="py-3 pr-4">{{ item.product_name }}</td>
                                        <td class="py-3 pr-4 text-right">{{ fmt(item.price) }}</td>
                                        <td class="py-3 pr-4 text-right">{{ item.quantity }}</td>
                                        <td class="py-3 text-right font-medium">{{ fmt(item.total) }}</td>
                                    </tr>
                                </template>

                            </tbody>

                            <!-- Footer total — skeleton while loading, real value after -->
                            <tfoot>
                                <tr class="border-t border-slate-200 font-semibold text-slate-800">
                                    <td colspan="4" class="pt-3 pr-4 text-right text-xs uppercase tracking-wide text-slate-500">
                                        Order Total
                                    </td>
                                    <td class="pt-3 text-right">
                                        <div
                                            v-if="loading"
                                            class="ml-auto h-3 w-16 animate-pulse rounded bg-slate-200"
                                        />
                                        <span v-else>{{ fmt(grandTotal) }}</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <!-- Footer -->
                <div class="border-t border-slate-100 px-6 py-4">
                    <button
                        @click="$emit('close')"
                        class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import api from '../services/api'

const props = defineProps({
    visible:     Boolean,
    orderId:     { type: Number, default: null },
    invoice:     { type: String, default: '' },
    purchaser:   { type: String, default: '' },
    distributor: { type: String, default: '' },
})

defineEmits(['close'])

const items = ref([])
const loading = ref(false)
const error = ref('')

// Varying widths for the product name skeleton column
const skelW = ['w-36', 'w-48', 'w-40', 'w-32']

const grandTotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.total, 0)
)

function fmt(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value)
}

watch(
    () => props.visible,
    async (visible) => {
        if (!visible || !props.orderId) return
        loading.value = true
        error.value = ''
        items.value = []
        try {
            const response = await api.get(`/commission-report/${props.orderId}/items`)
            items.value = response.data.data
        } catch {
            error.value = 'Failed to load order items.'
        } finally {
            loading.value = false
        }
    }
)
</script>
