import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: () => import("@/components/Login") },
  {
    path: "/home",
    component: () => import("@/components/Home"),
    redirect: "/welcome",
    children: [
      { path: "/welcome", component: () => import("@/components/Welcome") },
      { path: "/users", component: () => import("@/components/user/Users") },
      { path: "/rights", component: () => import("@/components/power/Rights") },
      { path: "/roles", component: () => import("@/components/power/Roles") },
      {
        path: "/categories",
        component: () => import("@/components/goods/Cate"),
      },
      { path: "/params", component: () => import("@/components/goods/Params") },
      { path: "/goods", component: () => import("@/components/goods/List") },
      { path: "/goods/add", component: () => import("@/components/goods/Add") },
      { path: "/orders", component: () => import("@/components/order/Order") },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from) => {
  // 没有登录跳转到登录页
  if (to.path !== "/login") {
    const token = window.sessionStorage.getItem("token");
    if (!token) {
      return { path: "/login" };
    }
  }
});

export default router;
