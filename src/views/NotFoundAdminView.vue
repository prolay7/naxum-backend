<template>
    <div class="flex flex-1 flex-col items-center justify-center py-24 text-center">

        <!-- 404 number -->
        <p class="text-8xl font-extrabold tracking-tight text-indigo-600">404</p>

        <!-- Heading -->
        <h2 class="mt-4 text-2xl font-bold text-slate-800">Page not found</h2>

        <!-- Sub-message -->
        <p class="mt-2 text-sm text-slate-500">
            The page you're looking for doesn't exist or has been moved.
        </p>

        <!-- Actions -->
        <div class="mt-8 flex items-center gap-3">
            <button
                @click="router.back()"
                class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
                &larr; Go back
            </button>

            <RouterLink
                to="/commission-report"
                class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
                Go to Dashboard
            </RouterLink>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
