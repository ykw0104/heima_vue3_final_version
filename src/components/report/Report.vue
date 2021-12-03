<template>
  <div class="hm-report">
    <!-- 1. 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2. 卡片视图区 -->
    <el-card>
      <div id="main" style="width: 600px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script setup>
/* --Import------------------------------------------------------------------------------------------------- */
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import { $getReports } from "@/request";
import _ from "lodash";
/* --Data--------------------------------------------------------------------------------------------------- */
const options = ref({
  title: {
    text: "用户来源",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
      label: {
        backgroundColor: "#E9EEF3",
      },
    },
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: [
    {
      boundaryGap: false,
    },
  ],
  yAxis: [
    {
      type: "value",
    },
  ],
});
/* --Methods------------------------------------------------------------------------------------------------ */

/* --Others------------------------------------------------------------------------------------------------- */

onMounted(async () => {
  var myChart = echarts.init(document.getElementById("main"));

  const { data: res } = await $getReports();

  if (res.meta.status !== 200)
    return ElMessage.error("获取折线图数据 o(╥﹏╥)o");

  const result = _.merge(res.data, options.value);

  myChart.setOption(result);
});
</script>

<style lang="scss" scoped></style>
