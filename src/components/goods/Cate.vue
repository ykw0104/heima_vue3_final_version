<template>
  <div class="hm-cate">
    <!-- 1. 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
  </div>

  <!-- 2. 卡片视图区 -->
  <el-card>
    <!-- 2.1 添加按钮 -->
    <el-row>
      <el-col>
        <el-button type="primary">添加分类</el-button>
      </el-col>
    </el-row>

    <!-- 2.2 树形表格数据-->
    <el-table
      :data="cateList"
      style="width: 100%; margin-bottom: 20px; margin-top: 15px"
      row-key="cat_id"
      border
      v-loading="isCateTableLoading"
    >
      <el-table-column prop="cat_name" label="分类名称" />

      <el-table-column label="是否有效">
        <template #default="scope">
          <el-icon v-if="!scope.row.cat_deleted" color="#67C23A" :size="20">
            <check />
          </el-icon>
          <el-icon v-else color="#F56C6C" :size="20">
            <close />
          </el-icon>
        </template>
      </el-table-column>

      <el-table-column label="排序">
        <template #default="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else-if="scope.row.cat_level === 2"
            >三级</el-tag
          >
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="primary" :icon="Edit" size="mini">编辑</el-button>
          <el-button type="danger" :icon="Delete" size="mini">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 2.3 分页 -->
    <el-pagination
      v-model:currentPage="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-card>
</template>

<script setup>
/* --Import------------------------------------------------------------------------------------------------- */
import { ref } from "vue";
import { Close, Check, Edit, Delete } from "@element-plus/icons";
import { ElMessage, ElMessageBox } from "element-plus";
import { $getCategories } from "@/request";
/* --Data--------------------------------------------------------------------------------------------------- */
// 请求商品分类数据的参数
const queryInfo = ref({
  type: 3,
  pagenum: 1,
  pagesize: 5,
});
// 商品分类数据列表
const cateList = ref([]);
// 商品总数
const total = ref(0);
// 商品table是否显示加载
const isCateTableLoading = ref(false);

/* --Methods------------------------------------------------------------------------------------------------ */
/* 获取商品分类数据 */
const getCateList = async () => {
  // 商品table显示加载
  isCateTableLoading.value = true;
  // 请求列表
  const { data: res } = await $getCategories(queryInfo.value);

  // 请求失败消息
  if (res.meta.status !== 200) {
    // 商品table隐藏加载
    isCateTableLoading.value = false;
    return ElMessage.error("获取商品列表失败 o(╥﹏╥)o");
  }

  // 保存商品列表数据
  cateList.value = res.data.result;
  // 保存商品总数
  total.value = res.data.total;
  // 商品table隐藏加载
  isCateTableLoading.value = false;
};

/* 监听pagesize改变 */
const handleSizeChange = (newPageSize) => {
  queryInfo.value.pagesize = newPageSize;

  // 视频中有个bug,如pagesize为2,在pagenum为4时, 切换到pagesize为10, 有时候会没数据
  // 自己的处理: 如果当前页已经大于页码改变后的最大页, 则直接返回,不执行查询, 让handleCurrentChange处理
  if (
    queryInfo.value.pagenum > Math.ceil(total.value / queryInfo.value.pagesize)
  ) {
    return;
  }

  getCateList();
};

/* 监听页码pagenum改变 */
const handleCurrentChange = (newPagenum) => {
  queryInfo.value.pagenum = newPagenum;
  getCateList();
};
/* --Others------------------------------------------------------------------------------------------------- */
// 获取商品分类数据
getCateList();
</script>
<style lang="scss" scoped></style>
