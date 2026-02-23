<template>
    <div class="flex h-screen bg-slate-100">
        <!-- Sidebar -->
        <aside class="flex w-64 flex-shrink-0 flex-col bg-slate-900">
            <!-- Logo -->
            <div class="flex h-16 items-center px-6">
                <span class="text-xl font-bold text-white">Nexum Admin</span>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 space-y-1 px-3 py-4">
                <RouterLink
                    to="/commission-report"
                    class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                    :class="
                        route.name === 'commission-report'
                            ? 'bg-slate-700 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    "
                >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Commission Report
                </RouterLink>

                <RouterLink
                    to="/top-distributors"
                    class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                    :class="
                        route.name === 'top-distributors'
                            ? 'bg-slate-700 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    "
                >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Top Distributors
                </RouterLink>
            </nav>

            <!-- Logout -->
            <div class="px-3 pb-4">
                <button
                    @click="handleLogout"
                    class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
        </aside>

        <!-- Main content -->
        <div class="flex flex-1 flex-col overflow-hidden">
            <!-- Top header -->
            <header class="flex h-16 flex-shrink-0 items-center border-b border-slate-200 bg-white px-6">
                <h1 class="text-lg font-semibold text-slate-800">{{ pageTitle }}</h1>
            </header>

            <!-- Page content -->
            <main class="flex-1 overflow-auto p-6">
                <RouterView />
            </main>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pageTitle = computed(() => {
    const titles = {
        'commission-report': 'Commission Report',
        'top-distributors':  'Top Distributors',
        'not-found-admin':   'Page Not Found',
    }
    return titles[route.name] || 'Dashboard'
})

async function handleLogout() {
    await authStore.logout()
    router.push('/login')
}
</script>
