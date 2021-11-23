<template>
  <div class="hm-rights">
    <!-- 1. 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2. 卡片视图 -->
    <el-card>
      <!-- 2.1 权限table -->
      <el-table :data="rightsList" v-loading="rightsTableLoading" stripe>
        <el-table-column type="index" />
        <el-table-column label="权限名称" prop="authName" />
        <el-table-column label="路径" prop="path" />
        <el-table-column label="权限等级">
          <template #default="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success"
              >二级</el-tag
            >
            <el-tag v-else-if="scope.row.level === '2'" type="danger"
              >三级</el-tag
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
/* --Import------------------------------------------------------------------------------------------------- */
import { ref } from "vue";
import { $getRightsList } from "@/request";
/* --Data--------------------------------------------------------------------------------------------------- */
// 权限列表
const rightsList = ref([]);
// 权限table是否显示加载效果
const rightsTableLoading = ref(false);
/* --Methods------------------------------------------------------------------------------------------------ */
/* 获取权限列表 */
const getRightsList = async () => {
  // 开启table加载效果
  rightsTableLoading.value = true;
  // 请求权限列表
  const { data: res } = await $getRightsList("list");

  // 获取失败
  if (res.meta.status !== 200) {
    // 关闭table加载效果
    rightsTableLoading.value = false;
    return ElMessage.error("获取权限列表失败 o(╥﹏╥)o");
  }

  // 获取成功
  rightsList.value = res.data;
  // 关闭table加载效果
  rightsTableLoading.value = false;
};
/* --Others------------------------------------------------------------------------------------------------- */
// 获取权限列表
getRightsList();
</script>

<style lang="scss" scoped></style>
