<template>
  <div class="hm-users">
    <!-- 1. 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2. 卡片视图 -->
    <el-card>
      <!-- 2.1 搜索和添加用户 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            v-model="queryInfo.query"
            placeholder="输入用户姓名查询"
            clearable
            @clear="getUserList"
          >
            <template #append>
              <el-button :icon="Search" @click="getUserList" />
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">
            添加用户
          </el-button>
        </el-col>
      </el-row>

      <!-- 2.2 用户 table -->
      <el-table :data="userList" stripe v-loading="isUserTableLoading">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="mobile" label="电话" />
        <el-table-column prop="role_name" label="角色" />
        <!-- 2.2.1 用户状态切换 -->
        <el-table-column label="状态">
          <template #default="scope">
            <el-switch
              :loading="scope.row.switchLoading"
              v-model="scope.row.mg_state"
              @change="switchUserState(scope.row)"
            />
          </template>
        </el-table-column>
        <!-- 2.2.2 修改, 删除, 设置-->
        <el-table-column label="操作" width="180px">
          <template #default="scope">
            <!-- 2.2.2.1 修改 -->
            <el-button
              type="primary"
              :icon="Edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            />
            <!-- 2.2.2.2 删除 -->
            <el-button
              type="danger"
              :icon="Delete"
              size="mini"
              @click="deleteUser(scope.row)"
            />
            <!-- 2.2.2.3 设置 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button type="warning" :icon="Setting" size="mini" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 2.3 分页 -->
      <el-pagination
        v-model:currentPage="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />

      <!-- 2.4 添加用户弹出框 -->
      <el-dialog
        v-model="addDialogVisible"
        title="添加用户"
        width="50%"
        @close="addDialogClose"
      >
        <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="addFormRules"
          label-width="70px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" show-password />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email" />
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile" />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="addDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="addUser">确定</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 2.5 修改用户弹出框 -->
      <el-dialog
        v-model="editDialogVisible"
        title="修改用户"
        width="50%"
        @close="editDialogClose"
      >
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editFormRules"
          label-width="70px"
        >
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email" />
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile" />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="editUser">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
/* --Import------------------------------------------------------------------------------------------------- */
import { ref } from "vue";
import { Search, Edit, Delete, Setting } from "@element-plus/icons";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  $getUserList,
  $switchUserState,
  $addUser,
  $getUserById,
  $editUserById,
  $deleteUserById,
} from "@/request";
import { checkEmail, checkMobile } from "@/utils";
/* --Data--------------------------------------------------------------------------------------------------- */
// 获取用户列表的参数对象
const queryInfo = ref({
  query: "",
  pagenum: 1,
  pagesize: 5,
});
// 用户列表
const userList = ref([]);
// 用户总数
const total = ref(0);
// 用户table是否显示加载
const isUserTableLoading = ref(false);

// 添加用户弹出框的显示和隐藏
const addDialogVisible = ref(false);
// 添加用户表单对象
const addFormRef = ref(null);
// 添加用户表单数据
const addForm = ref({
  username: "",
  password: "",
  email: "",
  mobile: "",
});
// 添加用户表单校验规则
const addFormRules = ref({
  username: [
    {
      required: true,
      message: "用户名不能为空",
      trigger: "blur",
    },
    {
      min: 3,
      max: 10,
      message: "用户名长度在 3 到 10 字符之间",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "密码不能为空",
      trigger: "blur",
    },
    {
      min: 6,
      max: 15,
      message: "用户名长度在 6 到 15 字符之间",
      trigger: "blur",
    },
  ],
  email: [
    {
      required: true,
      message: "邮件不能为空",
      trigger: "blur",
    },
    { validator: checkEmail, trigger: "blur" },
  ],
  mobile: [
    {
      required: true,
      message: "手机号不能为空",
      trigger: "blur",
    },
    { validator: checkMobile, trigger: "blur" },
  ],
});

// 修改用户弹出框的显示和隐藏
const editDialogVisible = ref(false);
// 修改用户表单对象
const editFormRef = ref(null);
// 修改用户表单数据
const editForm = ref({});
// 修改用户表单校验规则
const editFormRules = ref({
  email: [
    {
      required: true,
      message: "邮件不能为空",
      trigger: "blur",
    },
    { validator: checkEmail, trigger: "blur" },
  ],
  mobile: [
    {
      required: true,
      message: "手机号不能为空",
      trigger: "blur",
    },
    { validator: checkMobile, trigger: "blur" },
  ],
});

/* --Methods------------------------------------------------------------------------------------------------ */
/* 获取用户列表 */
const getUserList = async () => {
  // 用户table加载显示开启
  isUserTableLoading.value = true;
  // 请求用户列表
  const { data: res } = await $getUserList(queryInfo.value);

  // 失败处理
  if (res.meta.status !== 200) {
    // 用户table加载显示关闭
    isUserTableLoading.value = false;
    return ElMessage.error("请求用户失败 o(╥﹏╥)o");
  }

  // 用户table加载显示关闭
  isUserTableLoading.value = false;
  // 保存请求用户
  userList.value = res.data.users.map((item) => {
    // 额外添加switch loading是否显示
    item.switchLoading = false;
    return item;
  });
  total.value = res.data.total;
};

/* 分页: pagesize改变 */
const handleSizeChange = (pageSize) => {
  queryInfo.value.pagesize = pageSize;
  // 视频中有个bug,如pagesize为2,在pagenum为4时, 切换到pagesize为10, 有时候会没数据
  // 自己的处理: 如果当前页已经大于页码改变后的最大页, 则直接返回,不执行查询
  if (
    queryInfo.value.pagenum > Math.ceil(total.value / queryInfo.value.pagesize)
  )
    return;

  // 获取用户列表
  getUserList();
};

/* 分页: pagenum改变 */
const handleCurrentChange = (pagenum) => {
  queryInfo.value.pagenum = pagenum;

  // 获取用户列表
  getUserList();
};

/* 监听用户状态改变 */
const switchUserState = async (userInfo) => {
  //switch加载显示开启
  userInfo.switchLoading = true;

  // 切换用户状态
  const { data: res } = await $switchUserState(userInfo);

  // 失败提示
  if (res.meta.status !== 200) {
    userInfo.switchLoading = false;
    userInfo.mg_state = !userInfo.mg_state;
    return ElMessage.error("更新用户状态失败 o(╥﹏╥)o");
  }

  //switch加载显示关闭
  userInfo.switchLoading = false;
  // 成功提示
  ElMessage.success("更新用户状态成功 (*^▽^*)");
};

/* 监听用户添加弹出框的关闭 */
const addDialogClose = () => {
  addFormRef.value.resetFields();
};

/* 监听用户添加 */
const addUser = () => {
  addFormRef.value.validate(async (valid) => {
    console.log(valid);
    // 校验不通过
    if (!valid) return false;

    //校验通过, 请求添加用户
    const { data: res } = await $addUser(addForm.value);

    // 请求失败消息
    if (res.meta.status !== 201)
      return ElMessage.error("添加用户失败 o(╥﹏╥)o");

    // 请求成功消息
    ElMessage.success("添加用户成功 (*^▽^*)");
    // 关闭添加用户对话框
    addDialogVisible.value = false;
    // 获取用户列表
    getUserList();
  });
};

/* 监听修改用户弹出框的显示 */
const showEditDialog = async (userId) => {
  // 查询用户
  const { data: res } = await $getUserById(userId);

  // 查询失败
  if (res.meta.status !== 200) return ElMessage.error("查询用户失败 o(╥﹏╥)o");

  // 保存用户
  editForm.value = res.data;
  // 显示修改用户弹出框
  editDialogVisible.value = true;
};

/* 监听修改用户弹出框的关闭 */
const editDialogClose = () => {
  // 清空表单
  editFormRef.value.resetFields();
};

/* 监听用户修改 */
const editUser = () => {
  editFormRef.value.validate(async (valid) => {
    // 校验失败
    if (!valid) return false;

    // 校验通过
    // 请求修改用户
    const { data: res } = await $editUserById(editForm.value.id, {
      email: editForm.value.email,
      mobile: editForm.value.mobile,
    });

    // 请求失败
    if (res.meta.status !== 200)
      return ElMessage.error("更新用户失败 o(╥﹏╥)o");

    // 请求成功
    ElMessage.success("更新用户成功 (*^▽^*)");
    // 关闭弹出框
    editDialogVisible.value = false;
    // 获取用户列表
    getUserList();
  });
};

// 监听删除用户
const deleteUser = async (user) => {
  // 确定返回:confirm 取消返回:cancel
  const confirmResult = await ElMessageBox.confirm(
    `确认删除用户(${user.username})吗?`,
    "警告",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).catch((err) => err);

  // 取消删除操作
  if (confirmResult !== "confirm") return ElMessage.info("取消删除");

  // 确定删除操作
  const { data: res } = await $deleteUserById(user.id);

  // 删除失败
  if (res.meta.status !== 200) return ElMessage.error("删除用户失败 o(╥﹏╥)o");

  // 删除成功
  ElMessage.success("删除成功 (*^▽^*)");
  // 获取用户列表
  getUserList();
};
/* --Others------------------------------------------------------------------------------------------------- */
// 获取用户列表
getUserList();
</script>

<style lang="scss" scoped></style>
