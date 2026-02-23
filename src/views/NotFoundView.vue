<template>
    <div class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">

        <!-- 404 number -->
        <p class="text-8xl font-extrabold tracking-tight text-indigo-600">404</p>

        <!-- Heading -->
        <h1 class="mt-4 text-2xl font-bold text-slate-800">Page not found</h1>

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
                to="/login"
                class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
                Go to Login
            </RouterLink>
        </div>

        <!-- Decorative grid -->
        <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <svg class="absolute left-1/2 top-0 h-[48rem] w-[80rem] -translate-x-1/2 opacity-[0.04]"
                aria-hidden="true">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" class="text-slate-700" />
            </svg>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
