<template>
  <div class="hm-add">
    <!-- 1. 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2. 卡片视图 -->
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      />

      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="parseInt(activeIndex)"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- form + tab栏区域 -->
      <el-form
        ref="addFormRef"
        :model="addForm"
        status-icon
        :rules="addFormRules"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- a -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- b -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in manyTableData"
              :label="item.attr_name"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, index) in item.attr_vals"
                  :key="index"
                  border
                />
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- c -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- d -->
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传图片 -->
            <el-upload
              :action="uploadURL"
              :headers="headerObj"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- e -->
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <QuillEditor
              theme="snow"
              v-model:content="addForm.goods_introduce"
              contentType="html"
              style="min-height: 300px; margin-bottom: 15px"
            />

            <!-- 添加按钮 -->
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览弹出框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="50%">
      <img :src="previewPath" alt="" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
/* --Import------------------------------------------------------------------------------------------------- */
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { $getCategories, $getParams, $addGoods } from "@/request";
import { ElMessage } from "element-plus";

import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

import _ from "lodash";

const router = useRouter();
/* --Data--------------------------------------------------------------------------------------------------- */
// 步骤激活项
const activeIndex = ref("0");

// 表单对象
const addFormRef = ref(null);
// 表单数据
const addForm = ref({
  goods_name: "",
  goods_price: 0,
  goods_weight: 0,
  goods_number: 0,
  goods_cat: [],
  pics: [], // 上传图片数组,
  goods_introduce: "",
  attrs: [],
});
// 表单验证规则
const addFormRules = ref({
  goods_name: [
    {
      required: true,
      message: "商品名称不能为空",
      trigger: "blur",
    },
  ],
  goods_price: [
    {
      required: true,
      message: "商品价格不能为空",
      trigger: "blur",
    },
  ],
  goods_weight: [
    {
      required: true,
      message: "商品重量不能为空",
      trigger: "blur",
    },
  ],
  goods_number: [
    {
      required: true,
      message: "商品数量不能为空",
      trigger: "blur",
    },
  ],
  goods_cat: [
    {
      required: true,
      message: "商品分类不能为空",
      trigger: "blur",
    },
  ],
});
// 商品分类数据
const cateList = ref([]);
// 商品分类级联选择器配置项
const cateProps = ref({
  expandTrigger: "hover",
  label: "cat_name",
  value: "cat_id",
  children: "children",
});
// 商品分类的三级Id
const lv3CateId = computed(() => {
  if (addForm.value.goods_cat.length === 3) {
    return addForm.value.goods_cat[2];
  }
  return null;
});
// 商品参数数据
const manyTableData = ref([]);
// 商品属性数据
const onlyTableData = ref([]);
// 图片上传地址
const uploadURL = ref("https://lianghj.top:8888/api/private/v1/upload");
// 图片上传组件的请求头
const headerObj = ref({
  Authorization: window.sessionStorage.getItem("token"),
});
// 图片预览的地址
const previewPath = ref("");
// 图片预览弹出框的显示和隐藏
const previewVisible = ref(false);
/* --Methods------------------------------------------------------------------------------------------------ */
/* 获取商品分类 */
const getCateList = async () => {
  // 获取商品分类
  const { data: res } = await $getCategories();

  if (res.meta.status !== 200)
    return ElMessage.error("获取商品分类失败 o(╥﹏╥)o");

  // 保存商品分类数据
  cateList.value = res.data;
};

/* 级联选择器选中项改变 */
const handleChange = () => {
  // 只能选中三级商品分类
  addForm.value.goods_cat =
    addForm.value.goods_cat.length === 3 ? addForm.value.goods_cat : [];
};

/* 切换tab页之前的事件 */
const beforeTabLeave = (activeName, oldActiveName) => {
  // 在基本信息tab页没有选中三级商品分类, 无法进入下一步
  if (oldActiveName === "0" && addForm.value.goods_cat.length !== 3) {
    ElMessage.error("请先选择商品分类(必须是三级分类)");
    return false;
  }
};

/* tab页被点击 */
const tabClicked = async () => {
  // tab页为商品参数
  if (activeIndex.value === "1") {
    // 获取三级分类的参数
    const { data: res } = await $getParams(lv3CateId.value, "many");

    if (res.meta.status !== 200)
      return ElMessage.error("获取参数失败 o(╥﹏╥)o");

    // 修改数据
    res.data.forEach((item) => {
      item.attr_vals =
        item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
    });

    // 保存参数数据
    manyTableData.value = res.data;
  }
  // tab页为商品属性
  else if (activeIndex.value === "2") {
    // 获取商品属性
    const { data: res } = await $getParams(lv3CateId.value, "only");

    if (res.meta.status !== 200)
      return ElMessage.error("获取属性失败 o(╥﹏╥)o");

    // 保存属性数据
    onlyTableData.value = res.data;
  }
  // tab页为商品图片
  else if (activeIndex.value === "3") {
  }
};

/* 处理图片预览效果 */
const handlePreview = (file) => {
  // 保存图片预览地址
  previewPath.value = file.response.data.url;

  // 显示预览弹出框
  previewVisible.value = true;
};

/* 处理图片移除 */
const handleRemove = (file) => {
  // 要移除图片的临时路径
  const filePath = file.response.data.tmp_path;

  //查找对应索引
  const index = addForm.value.pics.findIndex((item) => item.pic === filePath);

  // 根据索引值删除该图片
  addForm.value.pics.splice(index, 1);
};

/* 图片上传成功 */
const handleSuccess = (response) => {
  // 拼接得到图片信息对象
  const picInfo = { pic: response.data.tmp_path };

  // push到pics数组中
  addForm.value.pics.push(picInfo);
};

/* 添加商品 */
const add = () => {
  addFormRef.value.validate(async (valid) => {
    // 校验失败
    if (!valid) {
      return ElMessage.error("请填写必要的表单项");
    }

    // 深拷贝addForm
    const addFormClone = _.cloneDeep(addForm.value);
    // 修改addFormClone的goods_cat属性
    addFormClone.goods_cat = addFormClone.goods_cat.join(",");

    // 处理商品参数,相关的加到addForm里
    manyTableData.value.forEach((item) => {
      const newInfo = {
        attr_id: item.attr_id,
        attr_value: item.attr_vals.join(" "),
      };
      addForm.value.attrs.push(newInfo);
    });

    // 处理商品属性, 相关的加到addForm里
    onlyTableData.value.forEach((item) => {
      const newInfo = {
        attr_id: item.attr_id,
        attr_value: item.attr_vals,
      };
      addForm.value.attrs.push(newInfo);
    });

    addFormClone.attrs = addForm.value.attrs;

    // 添加商品
    const { data: res } = await $addGoods(addFormClone);

    // 添加失败
    if (res.meta.status !== 201)
      return ElMessage.error("添加商品失败 o(╥﹏╥)o");

    // 添加成功
    ElMessage.success("添加商品成功 (*^▽^*)");

    // 添加商品完成,跳转到商品列表
    router.push("/goods");
  });
};
/* --Others------------------------------------------------------------------------------------------------- */
// 获取商品分类
getCateList();
</script>

<style lang="scss" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
</style>
