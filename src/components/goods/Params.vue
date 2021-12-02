<template>
  <div class="hm-params">
    <!-- 1. 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2. 卡片视图区 -->
    <el-card>
      <el-alert
        title="注意: 只允许为第三级分类设置相关参数!"
        type="warning"
        :closable="false"
        show-icon
      />

      <!-- 2.1 选中商品分类区域 -->
      <el-row style="margin: 15px 0">
        <el-col>
          <span>选择商品分类: </span>
          <!-- 2.1.1 商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 2.2 Tab页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 2.2.1 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 2.2.1.1 动态参数添加按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加动态参数</el-button
          >
          <!-- 2.2.1.2 动态参数表格 -->
          <el-table :data="manyTableData" stripe border row-key="attr_id">
            <!-- 2.2.1.2.1 头部展开行 -->
            <el-table-column type="expand">
              <template #default="scope">
                <!-- a. 渲染的tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- b. 添加tag标签 -->
                <el-input
                  v-if="scope.row.inputVisible"
                  ref="saveTagInputRef"
                  v-model="scope.row.inputValue"
                  class="input-new-tag"
                  size="mini"
                  @keyup.enter="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" />
            <el-table-column label="参数名称" prop="attr_name" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button
                  type="primary"
                  :icon="Edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  :icon="Delete"
                  size="mini"
                  @click="removeParam(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 2.2.2 静态参数面板 -->
        <el-tab-pane label="静态参数" name="only">
          <!-- 2.2.2.1 静态参数添加按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加静态参数</el-button
          >
          <!-- 2.2.2.2 静态参数表格 -->
          <el-table :data="onlyTableData" stripe border row-key="attr_id">
            <!-- 2.2.2.2.1 头部展开行 -->
            <el-table-column type="expand">
              <template #default="scope">
                <!-- a. 渲染的tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- b. 添加tag标签 -->
                <el-input
                  id="onlyInput"
                  v-if="scope.row.inputVisible"
                  ref="saveTagInputRef"
                  v-model="scope.row.inputValue"
                  class="input-new-tag"
                  size="mini"
                  @keyup.enter="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" />
            <el-table-column label="属性名称" prop="attr_name" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button
                  type="primary"
                  :icon="Edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  :icon="Delete"
                  size="mini"
                  @click="removeParam(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 2.3 添加参数的弹出框 -->
      <el-dialog
        v-model="addDialogVisible"
        :title="'添加' + titleText + '参数'"
        width="50%"
        @close="addDialogClose"
      >
        <!-- 2.3.1 添加参数的表单 -->
        <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="addFormRules"
          label-width="100px"
        >
          <el-form-item :label="titleText + '参数'" prop="attr_name">
            <el-input v-model="addForm.attr_name" />
          </el-form-item>
        </el-form>

        <!-- 2.3.2 底部的按钮 -->
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="addDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="addParam">确定</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 2.4 编辑参数的弹出框 -->
      <el-dialog
        v-model="editDialogVisible"
        :title="'修改' + titleText + '参数'"
        width="50%"
        @close="editDialogClose"
      >
        <!-- 2.4.1 修改参数的表单 -->
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editFormRules"
          label-width="100px"
        >
          <el-form-item :label="titleText + '参数'" prop="attr_name">
            <el-input v-model="editForm.attr_name" />
          </el-form-item>
        </el-form>

        <!-- 2.4.2 底部的按钮 -->
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="editParam">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
/* --Import------------------------------------------------------------------------------------------------- */
import { ref, computed, nextTick } from "vue";
import {
  $getCategories,
  $getParams,
  $addParam,
  $getParam,
  $editParam,
  $deleteParam,
} from "@/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { Edit, Delete } from "@element-plus/icons";
/* --Data--------------------------------------------------------------------------------------------------- */
// 商品分类列表
const cateList = ref([]);
// 级联选择框的配置对象
const cateProps = ref({
  expandTrigger: "hover",
  value: "cat_id",
  label: "cat_name",
  children: "children",
});
// 级联选择框绑定的数组值
const selectedCateKeys = ref([]);
// 选中的三级分类Id
const cateId = computed(() => {
  return selectedCateKeys.value.length === 3 ? selectedCateKeys.value[2] : null;
});

// 激活Tab的name值
const activeName = ref("many");
// 禁用Tab的按钮
const isBtnDisabled = computed(() => {
  // 不是三级分类, 返回true, 即禁用
  return selectedCateKeys.value.length !== 3 ? true : false;
});
// 动态参数
const manyTableData = ref([]);
// 静态参数
const onlyTableData = ref([]);

// 添加参数弹出框的标题
const titleText = computed(() => {
  return activeName.value === "many" ? "动态" : "静态";
});
// 添加参数弹出框的显示和隐藏
const addDialogVisible = ref(false);
// 添加参数表单对象
const addFormRef = ref({});
// 添加参数表单的数据
const addForm = ref({
  attr_name: "",
});
// 添加参数表单的校验规则
const addFormRules = ref({
  attr_name: [
    {
      required: true,
      message: "请输入参数名称",
      trigger: "blur",
    },
  ],
});

// 修改参数弹出框的显示和隐藏
const editDialogVisible = ref(false);
// 修改参数弹出框对象
const editFormRef = ref(null);
// 修改参数弹出框的数据
const editForm = ref({});
// 修改参数弹出框的校验规则
const editFormRules = ref({
  attr_name: [
    {
      required: true,
      message: "请输入参数名称",
      trigger: "blur",
    },
  ],
});

// 保存新建tag的文本框
const saveTagInputRef = ref(null);
/* --Methods------------------------------------------------------------------------------------------------ */
/* 获取商品分类 */
const getCateList = async () => {
  // 请求商品分类列表
  const { data: res } = await $getCategories();

  // 失败提示
  if (res.meta.status !== 200) {
    return ElMessage.error("获取商品分类失败 o(╥﹏╥)o");
  }

  // 保存数据
  cateList.value = res.data;
};

/* 获取参数列表数据 */
const getParamsData = async () => {
  // 不是三级分类
  if (selectedCateKeys.value.length !== 3) {
    selectedCateKeys.value = [];
    manyTableData.value = [];
    onlyTableData.value = [];
    return;
  }

  // 是三级分类
  const { data: res } = await $getParams(cateId.value, activeName.value);

  // 失败处理
  if (res.meta.status !== 200) {
    return ElMessage.error("获取参数列表失败 o(╥﹏╥)o");
  }

  // 改造res.data
  res.data.forEach((item) => {
    // 字符串空格分隔, 保存为数组
    item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
    // 文本输入框和新建tag的button的切换, 默认显示button按钮;
    item.inputVisible = false;
    //  文本框的绑定值
    item.inputValue = "";
  });

  // 成功处理
  if (activeName.value === "many") {
    // 动态参数
    manyTableData.value = res.data;
  } else {
    // 静态参数
    onlyTableData.value = res.data;
  }
};

/* 级联选择框选择项选中触发 */
const handleChange = async () => {
  // 获取参数列表
  getParamsData();
};

/* Tab页签被点击*/
const handleTabClick = () => {
  // 获取参数列表
  getParamsData();
};

/* 添加参数弹出框的close事件: 清空数据 */
const addDialogClose = () => {
  addFormRef.value.resetFields();
};

/* 确定按钮的click事件: 添加商品参数 */
const addParam = () => {
  addFormRef.value.validate(async (valid) => {
    // 验证不通过
    if (!valid) return;

    // 发起请求
    const { data: res } = await $addParam(cateId.value, {
      attr_name: addForm.value.attr_name,
      attr_sel: activeName.value,
    });

    // 失败处理
    if (res.meta.status !== 201) {
      return ElMessage.error("添加参数失败 o(╥﹏╥)o");
    }

    // 成功提示
    ElMessage.success("登录成功 (*^▽^*)");
    // 关闭弹出框
    addDialogVisible.value = false;
    // 获取参数列表
    getParamsData();
  });
};

/* 修改按钮的click事件: 显示修改参数的弹出框 */
const showEditDialog = async (attr_id) => {
  // 修改参数请求
  const { data: res } = await $getParam(
    cateId.value,
    attr_id,
    activeName.value
  );

  // 失败处理
  if (res.meta.status !== 200)
    return ElMessage.error("获取参数信息失败 o(╥﹏╥)o");

  // 保存数据
  editForm.value = res.data;

  // 显示修改弹出框
  editDialogVisible.value = true;
};

/* 修改弹出框的close事件: 清除表单数据 */
const editDialogClose = () => {
  editFormRef.value.resetFields();
};

/* 确定按钮的click事件: 修改参数  */
const editParam = () => {
  editFormRef.value.validate(async (valid) => {
    // 校验不通过
    if (!valid) return;

    // 校验通过,发起修改请求
    const { data: res } = await $editParam(
      cateId.value,
      editForm.value.attr_id,
      {
        attr_name: editForm.value.attr_name,
        attr_sel: activeName.value,
      }
    );

    // 失败处理
    if (res.meta.status !== 200)
      return ElMessage.error("修改参数信息失败 o(╥﹏╥)o");

    // 成功处理
    ElMessage.success("修改参数信息成功 (*^▽^*)");
    // 获取参数列表信息
    getParamsData();
    // 关闭修改弹出框
    editDialogVisible.value = false;
  });
};

/* 删除按钮的click事件: 删除参数 */
const removeParam = async (param) => {
  const confirmRes = await ElMessageBox.confirm(
    `确认要删除"${param.attr_name}"吗?`,
    "警告",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).catch((err) => err);

  // 取消操作
  if (confirmRes !== "confirm") {
    return ElMessage.info("取消删除");
  }

  // 确认操作, 进行删除
  const { data: res } = await $deleteParam(cateId.value, param.attr_id);

  // 失败处理
  if (res.meta.status !== 200) return ElMessage.error("删除参数失败 o(╥﹏╥)o");

  // 成功处理
  ElMessage.success("删除参数成功 (*^▽^*)");
  // 获取参数列表
  getParamsData();
};

/* 将attr_vals保存到数据库 */
const saveAttrVals = async (row) => {
  // 发起请求,保存这次操作
  const { data: res } = await $editParam(cateId.value, row.attr_id, {
    attr_name: row.attr_name,
    attr_sel: row.attr_sel,
    attr_vals: row.attr_vals.join(" "),
  });

  // 失败处理
  if (res.meta.status !== 200) return ElMessage.error("修改参数失败 o(╥﹏╥)o");

  // 修改成功
  ElMessage.success("修改成功 (*^▽^*)");
};

/* enter键的抬起和文本框失去焦点的事件 */
const handleInputConfirm = async (row) => {
  // 输入内容判空
  if (row.inputValue.trim().length === 0) {
    row.inputValue = "";
    row.inputVisible = false;
    return;
  }

  // 输入有内容,存入数据
  row.attr_vals.push(row.inputValue.trim());
  // 清空输入框
  row.inputValue = "";

  // 显示New Tag按钮
  row.inputVisible = false;

  // 保存到数据库
  saveAttrVals(row);
};

/* New Tag按钮的点击事件: 显示文本输入框 */
const showInput = (row) => {
  // 显示文本输入框
  row.inputVisible = true;

  nextTick(() => {
    // 文本框自动获取焦点
    saveTagInputRef.value.input.focus();
  });
};

/* Tab删除按钮的click事件: 删除对应的参数可选项 */
const handleClose = (index, row) => {
  row.attr_vals.splice(index, 1);

  // 保存到数据库
  saveAttrVals(row);
};
/* --Others------------------------------------------------------------------------------------------------- */
// 获取商品分类
getCateList();
</script>

<style lang="scss" scoped>
.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
