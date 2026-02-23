<template>
    <div class="flex min-h-screen items-center justify-center bg-slate-900">
        <div class="w-full max-w-sm">
            <!-- Logo / Title -->
            <div class="mb-8 text-center">
                <h1 class="text-3xl font-bold text-white">Nexum</h1>
                <p class="mt-1 text-sm text-slate-400">Admin Panel</p>
            </div>

            <!-- Card -->
            <div class="rounded-2xl bg-white p-8 shadow-xl">
                <h2 class="mb-6 text-xl font-semibold text-slate-800">Sign in</h2>

                <form @submit="handleLogin" novalidate class="space-y-4">
                    <!-- API error alert -->
                    <div
                        v-if="apiError"
                        class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                        {{ apiError }}
                    </div>

                    <!-- Email -->
                    <div>
                        <label for="email" class="mb-1 block text-sm font-medium text-slate-700">
                            Email
                        </label>
                        <input
                            id="email"
                            v-bind="emailAttrs"
                            v-model="emailValue"
                            type="email"
                            autocomplete="email"
                            placeholder="admin@nexum.com"
                            :class="[
                                'w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2',
                                emailError
                                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200',
                            ]"
                        />
                        <p v-if="emailError" class="mt-1 text-xs text-red-600">{{ emailError }}</p>
                    </div>

                    <!-- Password -->
                    <div>
                        <label for="password" class="mb-1 block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <input
                            id="password"
                            v-bind="passwordAttrs"
                            v-model="passwordValue"
                            type="password"
                            autocomplete="current-password"
                            placeholder="••••••••"
                            :class="[
                                'w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2',
                                passwordError
                                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200',
                            ]"
                        />
                        <p v-if="passwordError" class="mt-1 text-xs text-red-600">{{ passwordError }}</p>
                    </div>

                    <!-- Submit -->
                    <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="mt-2 flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
                    >
                        <svg
                            v-if="isSubmitting"
                            class="mr-2 h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const apiError = ref('')

// Validation schema
const schema = yup.object({
    email: yup
        .string()
        .required('Email is required.')
        .email('Please enter a valid email address.'),
    password: yup
        .string()
        .required('Password is required.')
        .min(6, 'Password must be at least 6 characters.'),
})

const { handleSubmit, isSubmitting } = useForm({ validationSchema: schema })

const { value: emailValue,    errorMessage: emailError,    handleBlur: blurEmail,    attrs: emailAttrs    } = useField('email')
const { value: passwordValue, errorMessage: passwordError, handleBlur: blurPassword, attrs: passwordAttrs } = useField('password')

const handleLogin = handleSubmit(async (values) => {
    apiError.value = ''
    try {
        await authStore.login(values.email, values.password)
        router.push('/commission-report')
    } catch (err) {
        apiError.value = err.response?.data?.message || 'Login failed. Please try again.'
    }
})
</script>
