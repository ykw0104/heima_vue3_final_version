<template>
  <div class="hm-order">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <!-- 搜索框 -->
          <el-input placeholder="请输入内容">
            <template #append>
              <el-button :icon="Search"></el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单的table表格 -->
      <el-table :data="orderList" v-loading="isOrderTableLoading" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款">
          <template #default="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success">
              已付款</el-tag
            >
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间">
          <template #default="scope">
            {{ dateFormat(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <!-- 添加城市 -->
            <el-button :icon="Edit" type="primary" size="mini" @click="showBox">
            </el-button>
            <!-- 物流进度 -->
            <el-button
              :icon="Location"
              type="success"
              size="mini"
              @click="showProgress"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:currentPage="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址的弹出框 -->
    <el-dialog
      v-model="addressVisible"
      title="修改地址"
      width="50%"
      @close="addressDialogClose"
    >
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="addressFormRules"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityData"
            v-model="addressForm.address1"
            style="width: 100%"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addressVisible = false">取消</el-button>
          <el-button type="primary" @click="addressVisible = false"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 物流进度的弹出框 -->
    <el-dialog v-model="progressVisible" title="物流进度" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup>
/* --Import------------------------------------------------------------------------------------------------- */
import { ref } from "vue";
import { Search, Edit, Location } from "@element-plus/icons";
import { ElMessage, ElMessageBox } from "element-plus";
import { $getOrderList, $getKuaidi } from "@/request";
import { dateFormat } from "@/utils";
import citydata from "@/utils/citydata.js";
/* --Data--------------------------------------------------------------------------------------------------- */
// 查询订单的请求参数
const queryInfo = ref({
  query: "",
  pagenum: 1,
  pagesize: 10,
});
// 订单列表
const orderList = ref([]);
// 订单总条数
const total = ref(0);

// order表格加载的显示和关闭
const isOrderTableLoading = ref(false);

// 修改地址弹出框的显示和隐藏
const addressVisible = ref(false);
// 修改地址表单对象
const addressFormRef = ref(null);
// 修改地址表单数据
const addressForm = ref({
  address1: [],
  address2: "",
});
// 修改地址表单校验规则
const addressFormRules = ref({
  address1: [
    {
      required: true,
      message: "请选择省市区/县",
      trigger: "blur",
    },
  ],
  address2: [
    {
      required: true,
      message: "请填写详细地址",
      trigger: "blur",
    },
  ],
});
// 城市列表数据
const cityData = ref(citydata);

// 物流进度弹出框的显示和隐藏
const progressVisible = ref(false);
// 物流信息
const progressInfo = ref({});
/* --Methods------------------------------------------------------------------------------------------------ */
/* 获取订单列表 */
const getOrderList = async () => {
  // 开启table加载
  isOrderTableLoading.value = true;

  //请求order数据
  const { data: res } = await $getOrderList(queryInfo.value);

  if (res.meta.status !== 200) {
    // 关闭table加载
    isOrderTableLoading.value = false;
    ElMessage.error("获取订单列表失败 o(╥﹏╥)o");
    return;
  }

  // 保存订单数据
  orderList.value = res.data.goods;
  total.value = res.data.total;

  // 关闭table加载
  isOrderTableLoading.value = false;
};

/* 分页的一页大小改变 */
const handleSizeChange = (newPageSize) => {
  queryInfo.value.pagesize = newPageSize;

  if (
    queryInfo.value.pagenum > Math.ceil(total.value / queryInfo.value.pagesize)
  ) {
    return;
  }

  // 获取订单列表
  getOrderList();
};

/* 分页的页码改变 */
const handleCurrentChange = (newPageNum) => {
  queryInfo.value.pagenum = newPageNum;

  // 获取订单列表
  getOrderList();
};

/* 修改地址的弹出框 */
const showBox = () => {
  // 显示弹出框
  addressVisible.value = true;
};

/* 修改地址弹出框的关闭 */
const addressDialogClose = () => {
  // 清空表单
  addressFormRef.value.resetFields();
};

/* 物流进度的弹出框 */
const showProgress = async () => {
  // 获取物流信息, 这里Id写死了
  const { data: res } = await $getKuaidi("1106975712662");

  if (res.meta.status !== 200)
    return ElMessage.error("获取物流信息失败 o(╥﹏╥)o");

  // 保存物流信息
  progressInfo.value = res.data;
  // 显示弹出框
  progressVisible.value = true;
};
/* --Others------------------------------------------------------------------------------------------------- */
// 获取订单列表
getOrderList();
</script>

<style lang="scss" scoped></style>
