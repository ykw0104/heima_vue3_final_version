```
接口地址: https://lianghj.top:8888/api/private/v1/

视频地址: https://www.bilibili.com/video/BV1x64y1S7S7?p=1

富文本编辑器: https://vueup.github.io/vue-quill/guide/usage.html#in-single-file-component

邮箱,手机号表单验证规则 在utils/index.js

接口使用顺序:
Login组件:
  $login(登录请求并获取token)

Home组件:
  $getMenuList(获取左侧菜单)

Users组件:
  $getUserList(获取用户列表)
  $switchUserState(更新用户状态 mg_state:true/false)
  $addUser(添加用户)
  $getUserById(查看单个用户)
  $editUserById(修改单个用户)
  $deleteUserById(删除某个用户)
  $getRolesList(获取角色列表)
  
 Rights组件:
  $getRightsList(获取权限列表 type:list)
  
 Roles组件:
  $getRolesList(获取角色列表)
  $deleteRight(删除某个角色的指定权限)
  $getRightsList(获取权限列表 type: tree)
  $addRights(给某个角色添加权限)
```
