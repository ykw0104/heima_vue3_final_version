import axios from "axios";

const $http = axios.create({
  baseURL: "https://lianghj.top:8888/api/private/v1/",
  timeout: 10000,
});

$http.interceptors.request.use(
  function (config) {
    // 请求头的Authorization添加token, 才能访问接口
    config.headers.Authorization = window.sessionStorage.getItem("token");
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

/* --1. 登录--------------------------------------------------------------------------------------------------- */
/**
 * 用户登录
 * user对象的属性有:username, password
 */
export const $login = (user) => {
  return $http({
    method: "POST",
    url: "/login",
    data: {
      username: user.username,
      password: user.password,
    },
  });
};

/* --2. 用户管理--------------------------------------------------------------------------------------------------- */
/**
 * 获取用户列表
 * queryInfo对象的属性有: query, pagenum, pagesize
 */
export const $getUserList = (queryInfo) => {
  return $http({
    method: "GET",
    url: "/users",
    params: queryInfo,
  });
};

/**
 * 修改用户状态
 * userInfo对象的属性有:id, mg_state
 */
export const $modifyUserState = (userInfo) => {
  return $http({
    method: "PUT",
    url: `/users/${userInfo.id}/state/${userInfo.mg_state}`,
  });
};

/* 获取角色列表 */
export const $getRoleList = () => {
  return $http({
    method: "GET",
    url: "/roles",
  });
};

/* --3. 权限管理--------------------------------------------------------------------------------------------------- */

/* 获取左侧菜单 */
export const $getMenuList = () => {
  return $http({
    method: "GET",
    url: "/menus",
  });
};
/* --4. 角色管理--------------------------------------------------------------------------------------------------- */

/* --5. 商品分类管理--------------------------------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------------------------------- */
