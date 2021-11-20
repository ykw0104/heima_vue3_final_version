import axios from "axios";

const $http = axios.create({
  baseURL: "https://lianghj.top:8888/api/private/v1/",
  timeout: 10000,
});

$http.interceptors.request.use(
  function (config) {
    config.headers.Authorization = window.sessionStorage.getItem("token");
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

/* --Login--------------------------------------------------------------------------------------------------- */
/* 用户登录 */
export const $login = (username, password) => {
  return $http({
    method: "POST",
    url: "/login",
    data: {
      username,
      password,
    },
  });
};

/* --User--------------------------------------------------------------------------------------------------- */
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
