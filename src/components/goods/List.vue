<template>
  <div class="hm-list">
    <!-- 1. 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2. 卡片视图区 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索框 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <template #append>
              <el-button :icon="Search" @click="getGoodsList"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!-- 添加按钮 -->
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="110px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="90px"
        ></el-table-column>
        <el-table-column label="创建时间" width="176px">
          <template #default="scope">
            {{ dateFormat(scope.row.add_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template #default="scope">
            <el-button type="primary" :icon="Edit" size="mini" />
            <el-button
              type="danger"
              :icon="Delete"
              size="mini"
              @click="removeGoodById(scope.row.goods_id)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:currentPage="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup>
/* --Import------------------------------------------------------------------------------------------------- */
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Search, Edit, Delete } from "@element-plus/icons";
import { $getGoodsList, $deleteGoods } from "@/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { dateFormat } from "@/utils";

const router = useRouter();
/* --Data--------------------------------------------------------------------------------------------------- */
// 查询商品列表数据的参数
const queryInfo = ref({
  query: "",
  pagenum: 1,
  pagesize: 10,
});
// 商品列表数据
const goodsList = ref([]);
// 商品列表数据总数
const total = ref(0);
/* --Methods------------------------------------------------------------------------------------------------ */
/* 获取商品列表数据 */
const getGoodsList = async () => {
  const { data: res } = await $getGoodsList(queryInfo.value);

  if (res.meta.status !== 200)
    return ElMessage.error("获取商品列表数据失败 o(╥﹏╥)o");

  // ElMessage.success("获取商品列表数据成功 (*^▽^*)");

  // 保存数据
  goodsList.value = res.data.goods;
  total.value = res.data.total;
};

/* 分页的页数发生改变 */
const handleSizeChange = (newPageSize) => {
  queryInfo.value.pagesize = newPageSize;

  // 视频中有个bug,如pagesize为2,在pagenum为4时, 切换到pagesize为10, 有时候会没数据
  // 自己的处理: 如果当前页已经大于页码改变后的最大页, 则直接返回,不执行查询, 让handleCurrentChange处理
  if (
    queryInfo.value.pagenum > Math.ceil(total.value / queryInfo.value.pagesize)
  ) {
    return;
  }

  getGoodsList();
};

/* 分页的页码发生改变 */
const handleCurrentChange = (newPageNum) => {
  queryInfo.value.pagenum = newPageNum;
  getGoodsList();
};

/* 删除按钮的点击事件: 删除商品 */
const removeGoodById = async (id) => {
  // 确认删除对话框
  const confirmRes = await ElMessageBox.confirm(
    "是否确认删除该商品",
    "Warning",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).catch((err) => err);

  // 取消删除
  if (confirmRes !== "confirm") return ElMessage.info("取消删除");

  // 确认删除
  const { data: res } = await $deleteGoods(id);

  // 删除失败
  if (res.meta.status !== 200) return ElMessage.error("删除失败 o(╥﹏╥)o");

  // 删除成功
  ElMessage.success("删除成功 (*^▽^*)");

  // 获取商品列表数据
  getGoodsList();
};

/* 跳转到添加商品页面 */
const goAddPage = () => {
  router.push("/goods/add");
};
/* --Others------------------------------------------------------------------------------------------------- */
// 获取商品列表数据
getGoodsList();
</script>

<style lang="scss" scoped></style>
