<template>
  <div class="hm-roles">
    <!-- 1. 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2. 卡片视图 -->
    <el-card>
      <!-- 2.1 添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 2.2 角色talbe -->
      <el-table :data="rolesList" v-loading="rolesTableLoading" stripe>
        <!-- 2.2.1 渲染一,二,三级权限 -->
        <el-table-column type="expand">
          <template #default="scope">
            <el-row
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
              class="hm-border-1 hm-vcenter"
            >
              <!-- 2.2.1.1 一级 -->
              <el-col :span="5">
                <el-tag closable @close="deleteRightById(scope.row, item1)">
                  {{ item1.authName }}
                </el-tag>
                <el-icon><caret-right /></el-icon>
              </el-col>

              <el-col :span="19">
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  class="hm-border-2 hm-vcenter"
                >
                  <!-- 2.2.1.2 二级-->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="deleteRightById(scope.row, item2)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <el-icon><caret-right /></el-icon>
                  </el-col>
                  <!-- 2.2.1.3 三级-->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3, index3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="deleteRightById(scope.row, item3)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" />
        <el-table-column label="角色名称" prop="roleName" />
        <el-table-column label="角色描述" prop="roleDesc" />
        <el-table-column label="操作" width="300px">
          <template #default="scope">
            <el-button type="primary" :icon="Edit" size="mini">编辑</el-button>
            <el-button type="danger" :icon="Delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              :icon="Setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 2.3 分配权限的弹出框 -->
      <el-dialog
        v-model="setRightDialogVisible"
        title="分配权限"
        width="50%"
        @close="setRightDialogClose"
      >
        <!-- 2.3.1 树形权限 -->
        <el-tree
          ref="rightsTreeRef"
          :data="rightsTreeList"
          :props="rightsTreeProps"
          show-checkbox
          node-key="id"
          :default-checked-keys="rightsTreeDefCheckedKeys"
          default-expand-all
        />

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="setRightDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="allotRights">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
/* --Import------------------------------------------------------------------------------------------------- */
import { ref } from "vue";
import { Search, Edit, Delete, Setting, CaretRight } from "@element-plus/icons";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  $getRolesList,
  $deleteRight,
  $getRightsList,
  $addRights,
} from "@/request";
import { getLeafKeys } from "@/utils";
/* --Data--------------------------------------------------------------------------------------------------- */
// 角色列表数据
const rolesList = ref([]);
// 角色table是否显示加载
const rolesTableLoading = ref(false);
// 当前即将分配角色权限的角色id
const curRoleId = ref("");

// 分配权限框的显示和隐藏
const setRightDialogVisible = ref(false);
// 分配权限框中的tree对象
const rightsTreeRef = ref(null);
// 树形权限数据列表
const rightsTreeList = ref([]);
// 树形权限的配置
const rightsTreeProps = ref({
  children: "children",
  label: "authName",
});
// 树形权限的默认选中项
const rightsTreeDefCheckedKeys = ref([]);
/* --Methods------------------------------------------------------------------------------------------------ */
/* 获取角色列表 */
const getRolesList = async () => {
  // 开启table加载
  rolesTableLoading.value = true;
  // 请求角色列表
  const { data: res } = await $getRolesList();

  // 获取失败
  if (res.meta.status !== 200) {
    // 关闭table加载
    rolesTableLoading.value = false;
    return ElMessage.error("获取角色列表失败 o(╥﹏╥)o");
  }

  // 保存角色列表
  rolesList.value = res.data;
  // 关闭table加载
  rolesTableLoading.value = false;
};

/* tag的close事件: 删除权限 */
const deleteRightById = async (role, right) => {
  // 确认删除框
  const confirmResult = await ElMessageBox.confirm(
    `确认删除${role.roleName}的${right.authName}权限吗`,
    "警告",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).catch((err) => err);

  // 取消删除
  if (confirmResult !== "confirm") return ElMessage.info("取消删除");

  // 删除权限
  const { data: res } = await $deleteRight(role.id, right.id);

  // 删除失败
  if (res.meta.status !== 200) return ElMessage.error("删除权限失败 o(╥﹏╥)o");

  role.children = res.data;
};

/* 确认按钮的click事件: 显示分配权限弹出框 */
const showSetRightDialog = async (role) => {
  // 保存当前role的id
  curRoleId.value = role.id;

  // 请求树形的权限列表
  const { data: res } = await $getRightsList("tree");

  // 请求失败
  if (res.meta.status !== 200) return ElMessage.error("获取权限失败 o(╥﹏╥)o");

  // 保存数据
  rightsTreeList.value = res.data;

  // 递归获取三级权限节点的id,保存到rightsTreeDefCheckedKeys
  getLeafKeys(role, rightsTreeDefCheckedKeys.value);

  // 显示弹出框
  setRightDialogVisible.value = true;
};

/* 对话框的close事件: 对话框的关闭,清空rightsTreeDefCheckedKeys */
const setRightDialogClose = () => {
  rightsTreeDefCheckedKeys.value = [];
};

/* 确定按钮的click事件: 给角色分配权限 */
const allotRights = async () => {
  // 半选和全选的权限id
  const allIds = [
    ...rightsTreeRef.value.getCheckedKeys(),
    ...rightsTreeRef.value.getHalfCheckedKeys(),
  ];

  // 后端需要的格式
  const allIdsStr = allIds.join(",");
  console.log(allIdsStr);
  // 为角色分配权限
  const { data: res } = await $addRights(curRoleId.value, allIdsStr);

  // 分配权限失败
  if (res.meta.status !== 200) return ElMessage.error("分配权限失败 o(╥﹏╥)o");

  // 分配权限成功
  ElMessage.success("分配权限成功 (*^▽^*)");
  // 获取角色列表
  getRolesList();
  // 关闭弹出框
  setRightDialogVisible.value = false;
};
/* --Others------------------------------------------------------------------------------------------------- */
// 获取角色列表
getRolesList();
</script>

<style lang="scss" scoped>
.hm-vcenter {
  display: flex;
  align-items: center;
}

.el-tag {
  margin: 7px;
}

.hm-border-1 {
  border-bottom: 1px solid #eee;

  &:nth-child(1) {
    border-top: 1px solid #eee;
  }
}

.hm-border-2 {
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
}
</style>
