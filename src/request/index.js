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
 */
export const $deleteUserById = (id) => {
  return $http({
    method: "DELETE",
    url: `/users/${id}`,
  });
};

/**
 * 更新用户角色
 * @param {*} id 用户id
 * @param {*} rid 角色id
 */
export const $saveRole = (id, rid) => {
  return $http({
    method: "PUT",
    url: `/users/${id}/role`,
    data: {
      rid,
    },
  });
};

/* --4. 权限管理--------------------------------------------------------------------------------------------------- */
/**
 * 获取所有权限列表
 * @param {*} type 值list或tree
 */
export const $getRightsList = (type) => {
  return $http({
    method: "GET",
    url: `/rights/${type}`,
  });
};

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
/**
 * 获取角色列表
 */
export const $getRolesList = () => {
  return $http({
    method: "GET",
    url: "/roles",
  });
};

/**
 * 删除指定权限
 * @param {*} roleId 角色id
 * @param {*} rightId 权限id
 */
export const $deleteRight = (roleId, rightId) => {
  return $http({
    method: "DELETE",
    url: `/roles/${roleId}/rights/${rightId}`,
  });
};

/**
 * 给角色添加权限
 * @param {*} roleId 角色id
 * @param {*} rids 半选中和全选中的权限id, 逗号分隔
 * @returns
 */
export const $addRights = (roleId, rids) => {
  return $http({
    method: "POST",
    url: `/roles/${roleId}/rights`,
    data: {
      rids,
    },
  });
};
/* --6. 商品分类管理--------------------------------------------------------------------------------------------------- */
/**
 * 查询商品分类列表
 * @param {*} queryInfo 包含三个值:
 * 1. type : [1,2,3] 一层,两层,三层分类列表, 不传获取所有级别(可选)
 * 2. pagenum: 当前页, 不传获取所有(可选)
 * 3. pagesize: 每页显示多少条, 不传获取所有(可选)
 */
export const $getCategories = (queryInfo) => {
  return $http({
    method: "GET",
    url: "/categories",
    params: queryInfo,
  });
};

/**
 * 添加分类
 * @param {*} cate 包含三个属性: cat_pid(父分类ID), cat_name, cat_level
 */
export const $addCategory = (cate) => {
  return $http({
    method: "POST",
    url: "/categories",
    data: cate,
  });
};
/* --7. 分类参数管理--------------------------------------------------------------------------------------------------- */
/**
 * 获取分类商品的所有参数
 * @param {*} cateId 分类Id
 * @param {*} sel 值only: 静态参数 , 值many: 动态参数
 */
export const $getParams = (cateId, sel) => {
  return $http({
    method: "GET",
    url: `/categories/${cateId}/attributes`,
    params: {
      sel,
    },
  });
};

/**
 * 获取分类商品的某个参数
 * @param {*} cateId 分类Id
 * @param {*} attrId 参数Id
 * @param {*} attr_sel 值many或only
 * @param {*} attr_vals 如果是many需要填写值, 以逗号分隔
 */
export const $getParam = (cateId, attrId, attr_sel, attr_vals = null) => {
  return $http({
    method: "GET",
    url: `/categories/${cateId}/attributes/${attrId}`,
    params: {
      attr_sel,
      attr_vals,
    },
  });
};

/**
 * 添加参数
 * @param {*} cateId  分类Id
 * @param {*} attrObj 包含:
 *                      attr_name: 参数名称
 *                      attr_sel: many或only
 *                      attr_vals: 如果是many,需要填写值的选项, 逗号分隔(可选参数)
 */
export const $addParam = (cateId, attrObj) => {
  return $http({
    method: "POST",
    url: `/categories/${cateId}/attributes`,
    data: attrObj,
  });
};

/**
 * 修改参数
 * @param {*} cateId 分类Id
 * @param {*} attrId 属性Id
 * @param {*} attrObj 三个值: attr_name, attr_sel, attr_vals(可选)
 */
export const $editParam = (cateId, attrId, attrObj) => {
  return $http({
    method: "PUT",
    url: `/categories/${cateId}/attributes/${attrId}`,
    data: attrObj,
  });
};

/**
 * 删除参数
 * @param {*} cateId 分类Id
 * @param {*} attrId 属性Id
 */
export const $deleteParam = (cateId, attrId) => {
  return $http({
    method: "DELETE",
    url: `/categories/${cateId}/attributes/${attrId}`,
  });
};
/* --8. 商品管理--------------------------------------------------------------------------------------------------- */
/**
 * 获取商品列表数据
 * @param {*} queryInfo 包含:
 *                    query(查询参数)
 *                    pagenum(当前页码)
 *                    pagesize(每页显示条数)
 */
export const $getGoodsList = (queryInfo) => {
  return $http({
    method: "GET",
    url: `/goods`,
    params: queryInfo,
  });
};

/**
 * 删除商品
 * @param {*} id 商品Id
 * @returns
 */
export const $deleteGoods = (id) => {
  return $http({
    method: "DELETE",
    url: `/goods/${id}`,
  });
};

/**
 * 添加商品
 * @param {*} goods
 *  goods_name: 商品名称
    goods_price: 价格
    goods_weight: 重量
    goods_number: 数量
    goods_cat: 用','分割的分类列表
    pics: 上传图片的数组(可空)
    goods_introduce: 介绍(可空)
    attrs: 商品参数(数组), 包含商品参数和属性
 */
export const $addGoods = (goods) => {
  return $http({
    method: "POST",
    url: `/goods`,
    data: goods,
  });
};
/* --9. 图片上传--------------------------------------------------------------------------------------------------- */

/* --10. 订单管理--------------------------------------------------------------------------------------------------- */

/* --11. 数据统计--------------------------------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------------------------------- */
