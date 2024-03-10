import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { usePermissStore } from '../store/permiss';
import Home from '../views/home.vue';
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
        children: [
            {
                path: '/dashboard',
                name: 'dashboard',
                meta: {
                    title: '系统首页',
                    permiss: '1',
                },
                component: () => import(/* webpackChunkName: "dashboard" */ '../views/dashboard.vue'),
            },
            {
                path: '/studenttable',
                name: 'studenttable',
                meta: {
                    title: '学生信息表格',
                    permiss: '2',
                },
                component: () => import(/* webpackChunkName: "table" */ '../views/studenttable.vue'),
            },
            {
                path: '/teachertable',
                name: 'teachertable',
                meta: {
                    title: '教师信息表格',
                    permiss: '2',
                },
                component: () => import(/* webpackChunkName: "table" */ '../views/teachertable.vue'),
            },
            {
                path: '/contenttable',
                name: 'contenttable',
                meta: {
                    title: '毕设表格',
                    permiss: '2',
                },
                component: () => import(/* webpackChunkName: "table" */ '../views/contenttable.vue'),
            },
            {
                path: '/editdesign',
                name: 'editdesign',
                meta: {
                    title: '选题编辑',
                    permiss: '11',
                },
                component: () => import(/* webpackChunkName: "charts" */ '../views/editdesign.vue'),
            },
            {
                path: '/tabs',
                name: 'tabs',
                meta: {
                    title: 'tab标签',
                    permiss: '3',
                },
                component: () => import(/* webpackChunkName: "tabs" */ '../views/tabs.vue'),
            },
            {
                path: '/form',
                name: 'baseform',
                meta: {
                    title: '表单',
                    permiss: '5',
                },
                component: () => import(/* webpackChunkName: "form" */ '../views/form.vue'),
            },
            {
                path: '/user',
                name: 'user',
                meta: {
                    title: '个人中心',
                },
                component: () => import(/* webpackChunkName: "user" */ '../views/user.vue'),
            },
            {
                path: '/icon',
                name: 'icon',
                meta: {
                    title: '自定义图标',
                    permiss: '3',
                },
                component: () => import(/* webpackChunkName: "icon" */ '../views/icon.vue'),
            },
            {
                path: '/adddesign',
                name: 'adddesign',
                meta: {
                    title: '发布选题',
                    permiss: '2',
                },
                component: () => import(/* webpackChunkName: "markdown" */ '../views/adddesign.vue'),
            },

        ],
    },
    {
        path: '/login',
        name: 'Login',
        meta: {
            title: '登录',
        },
        component: () => import(/* webpackChunkName: "login" */ '../views/login.vue'),
    },
    {
        path: '/403',
        name: '403',
        meta: {
            title: '没有权限',
        },
        component: () => import(/* webpackChunkName: "403" */ '../views/403.vue'),
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    NProgress.start();
    const role = localStorage.getItem('ms_username');
    const permiss = usePermissStore();
    if (!role && to.path !== '/login') {
        next('/login');
    } else if (to.meta.permiss && !permiss.key.includes(to.meta.permiss)) {
        // 如果没有权限，则进入403
        next('/403');
    } else {
        next();
    }
});

router.afterEach(() => {
    NProgress.done()
})

export default router;
