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

/* --2. 登录--------------------------------------------------------------------------------------------------- */
/**
 * 用户登录
 * @param {*} user 包含username, password
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

/* --3. 用户管理--------------------------------------------------------------------------------------------------- */
/**
 * 获取用户列表
 * @param {*} queryInfo 包含query, pagenum, pagesize
 */
export const $getUserList = (queryInfo) => {
  return $http({
    method: "GET",
    url: "/users",
    params: queryInfo,
  });
};

/**
 * 切换用户状态
 * @param {*} userInfo 包含id, mg_state
 * @returns
 */
export const $switchUserState = (userInfo) => {
  return $http({
    method: "PUT",
    url: `/users/${userInfo.id}/state/${userInfo.mg_state}`,
  });
};

/**
 * 通过id获取单个用户
 * @param {*} id 用户id
 */
export const $getUserById = (id) => {
  return $http({
    method: "GET",
    url: `/users/${id}`,
  });
};

/**
 * 添加用户
 * @param {*} userInfo 包含username,password,email, mobile
 */
export const $addUser = (userInfo) => {
  return $http({
    method: "POST",
    url: "/users",
    data: userInfo,
  });
};

/**
 * 通过id修改用户
 * @param {*} id 用户id
 * @param {*} userInfo 包含email,mobile
 */
export const $editUserById = (id, userInfo) => {
  return $http({
    method: "PUT",
    url: `/users/${id}`,
    data: userInfo,
  });
};

/**
 * 通过id删除用户
 * @param {*} id 用户id
 * @returns
 */
export const $deleteUserById = (id) => {
  return $http({
    method: "DELETE",
    url: `/users/${id}`,
  });
};

/**
 * 获取角色列表
 */
export const $getRoleList = () => {
  return $http({
    method: "GET",
    url: "/roles",
  });
};

/* --4. 权限管理--------------------------------------------------------------------------------------------------- */

/**
 * 获取左侧菜单
 */
export const $getMenuList = () => {
  return $http({
    method: "GET",
    url: "/menus",
  });
};
/* --5. 角色管理--------------------------------------------------------------------------------------------------- */

/* --6. 商品分类管理--------------------------------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------------------------------- */
