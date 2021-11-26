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
        <el-button type="primary" @click="showAddCateDialog"
          >添加分类</el-button
        >
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

    <!-- 2.4 添加分类商品弹出框 -->
    <el-dialog
      v-model="addCateDialogVisible"
      title="添加分类"
      width="50%"
      @close="addCateDialogClose"
    >
      <!-- 2.4.1 添加分类商品的表单 -->
      <el-form
        ref="addCateFormRef"
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="120px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" />
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 2.4.1.1 级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
            style="width: 100%"
          ></el-cascader>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addCate">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
/* --Import------------------------------------------------------------------------------------------------- */
import { ref } from "vue";
import { Close, Check, Edit, Delete } from "@element-plus/icons";
import { ElMessage, ElMessageBox } from "element-plus";
import { $getCategories, $addCategory } from "@/request";
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

// 控制添加分类商品弹出框
const addCateDialogVisible = ref(false);
// 添加分类表单对象
const addCateFormRef = ref(null);
// 添加分类表单数据
const addCateForm = ref({
  cat_name: "",
  // 父级分类id
  cat_pid: 0,
  // 分类等级, 默认是添加一级分类
  cat_level: 0,
});
// 添加分类校验规则
const addCateFormRules = ref({
  cat_name: [
    {
      required: true,
      message: "分类名称不能为空",
      trigger: "blur",
    },
  ],
});
// 分类表单中的父级分类数据
const parentCateList = ref([]);
// 级联选择框的配置项
const cascaderProps = ref({
  expandTrigger: "hover",
  checkStrictly: true, // 可以选中一级或二级
  value: "cat_id",
  label: "cat_name",
  children: "children",
});
// 级联选择器的选中值
const selectedKeys = ref([]);
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

/* 添加按钮的click事件: 显示添加分类商品弹出框 */
const showAddCateDialog = () => {
  // 获取父级分类的数据列表
  getParentCateList();

  // 显示弹出框
  addCateDialogVisible.value = true;
};

/* 获取父级分类的商品列表 */
const getParentCateList = async () => {
  const { data: res } = await $getCategories({ type: 2 });

  // 失败提示
  if (res.meta.status !== 200)
    return ElMessage.error("获取父级分类数据失败 o(╥﹏╥)o");

  // 保存父级分类列表
  parentCateList.value = res.data;
};

/* 父级分类的级联选择器选项改变 */
const parentCateChange = () => {
  // 选中的父级分类
  if (selectedKeys.value && selectedKeys.value.length > 0) {
    addCateForm.value.cat_pid =
      selectedKeys.value[selectedKeys.value.length - 1];
    addCateForm.value.cat_level = selectedKeys.value.length;
    return;
  } else {
    addCateForm.value.cat_pid = 0;
    addCateForm.value.cat_level = 0;
  }
};

/* 确认按钮的click事件: 添加新分类*/
const addCate = () => {
  addCateFormRef.value.validate(async (valide) => {
    // 校验失败
    if (!valide) return;

    // 校验成功
    const { data: res } = await $addCategory(addCateForm.value);

    // 失败提示
    if (res.meta.status !== 201)
      return ElMessage.error("添加分类失败 o(╥﹏╥)o");

    // 成功提示
    ElMessage.success("添加分类成功  (*^▽^*)");
    // 获取商品分类数据
    getCateList();
    // 关闭添加分类弹出框
    addCateDialogVisible.value = false;
  });
};

/* 添加分类弹出框的close事件: 清空表单数据 */
const addCateDialogClose = () => {
  addCateFormRef.value.resetFields();
  selectedKeys.value = [];
  addCateForm.value.cat_level = 0;
  addCateForm.value.cat_pid = 0;
};
/* --Others------------------------------------------------------------------------------------------------- */
// 获取商品分类数据
getCateList();
</script>
<style lang="scss" scoped></style>
