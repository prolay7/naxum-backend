import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || null)

    const isAuthenticated = computed(() => !!token.value)

    async function login(email, password) {
        const response = await api.post('/login', { email, password })
        token.value = response.data.token
        localStorage.setItem('token', response.data.token)
    }

    async function logout() {
        try {
            await api.post('/logout')
        } finally {
            token.value = null
            localStorage.removeItem('token')
        }
    }

    return { token, isAuthenticated, login, logout }
})
