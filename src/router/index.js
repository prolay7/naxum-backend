import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
            meta: { requiresGuest: true },
        },
        {
            path: '/',
            component: () => import('../layouts/AdminLayout.vue'),
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    redirect: '/commission-report',
                },
                {
                    path: 'commission-report',
                    name: 'commission-report',
                    component: () => import('../views/CommissionReportView.vue'),
                },
                {
                    path: 'top-distributors',
                    name: 'top-distributors',
                    component: () => import('../views/TopDistributorsView.vue'),
                },
                // 404 inside the admin layout (for authenticated users)
                {
                    path: ':pathMatch(.*)*',
                    name: 'not-found-admin',
                    component: () => import('../views/NotFoundAdminView.vue'),
                    meta: { requiresAuth: true },
                },
            ],
        },
        // 404 standalone (for unauthenticated users)
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('../views/NotFoundView.vue'),
        },
    ],
})

router.beforeEach((to) => {
    const isAuthenticated = !!localStorage.getItem('token')

    if (to.meta.requiresAuth && !isAuthenticated) {
        return { name: 'login' }
    }
    if (to.meta.requiresGuest && isAuthenticated) {
        return { name: 'commission-report' }
    }
    // Authenticated users hitting the standalone 404 → redirect into the admin layout 404
    if (to.name === 'not-found' && isAuthenticated) {
        return { name: 'not-found-admin' }
    }
})

export default router
