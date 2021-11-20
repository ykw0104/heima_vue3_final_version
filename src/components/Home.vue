<template>
  <el-container class="hm-home">
    <!--------------- 1. 头部 --------------------->
    <el-header class="hm-home-header">
      <div class="hm-home-header-left">
        <!-- <img src="../assets/img/avatar.jpeg" alt="" /> -->
        <span>一枝红艳露凝香,云雨巫山枉断肠</span>
      </div>

      <el-button type="info" size="small" @click="logout">退出</el-button>
    </el-header>
    <el-container class="hm-home-container">
      <!-------------- 2. 左侧边栏 ---------------->
      <el-aside
        class="hm-home-aside"
        :width="isMenuCollapse ? '64px' : '200px'"
      >
        <!-- 2.1 折叠和展开图标 -->
        <div class="hm-toggle-box">
          <el-icon :size="20" color="#fff" @click="toggleMenuCollapse">
            <fold v-if="!isMenuCollapse" />
            <expand v-else />
          </el-icon>
        </div>
        <!-- 2.2 左侧菜单栏 -->
        <el-menu
          active-text-color="#409EFF"
          background-color="#333744"
          text-color="#fff"
          :collapse="isMenuCollapse"
          :collapse-transition="false"
          router
          :default-active="route.path"
        >
          <el-sub-menu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 2.2.1 一级菜单的图标和文字 -->
            <template #title>
              <el-icon>
                <user v-if="item.id === 125" />
                <management v-else-if="item.id === 103" />
                <wallet v-else-if="item.id === 101" />
                <tickets v-else-if="item.id === 102" />
                <trend-charts v-else-if="item.id === 145" />
              </el-icon>
              <span>{{ item.authName }}</span>
            </template>

            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <!-- 2.2.2 二级菜单的图标和文字 -->
              <template #title>
                <el-icon>
                  <arrow-right />
                </el-icon>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!------------------ 3. 右侧主体 ------------->
      <el-main class="hm-home-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
/* --Import------------------------------------------------------------------------------------------------- */
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import {
  ArrowRight,
  User,
  Management,
  Wallet,
  Tickets,
  TrendCharts,
  Fold,
  Expand,
} from "@element-plus/icons";
import { $getMenuList } from "@/request";

const router = useRouter();
const route = useRoute();
/* --Data--------------------------------------------------------------------------------------------------- */
// 左侧菜单
const menuList = ref([]);
// 左侧菜单折叠和展开
const isMenuCollapse = ref(false);
/* --Methods------------------------------------------------------------------------------------------------ */
/* 用户退出 */
const logout = () => {
  // 清空(包括保存的token)
  window.sessionStorage.clear();
  // 跳转到login
  router.push("/login");
};

/* 获取左侧菜单 */
const getMenuList = async () => {
  // 请求左侧菜单
  const { data: res } = await $getMenuList();

  // 请求失败
  if (res.meta.status !== 200)
    return ElMessage.error("获取左侧菜单失败 o(╥﹏╥)o");

  // 保存左侧菜单
  menuList.value = res.data;
};

/* 左侧菜单和折叠和展开 */
const toggleMenuCollapse = () => {
  isMenuCollapse.value = !isMenuCollapse.value;
};
/* --Others------------------------------------------------------------------------------------------------- */
// 获取左侧菜单
getMenuList();
</script>

<style lang="scss" scoped>
.hm-home {
  height: 100%;

  .hm-home-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #373d41;
    color: #fff;

    .hm-home-header-left {
      display: flex;
      align-items: center;

      img {
        width: 40px;
      }

      span {
        padding-left: 15px;
        font-size: 24px;
        font-family: "xiahang";
      }
    }
  }

  .hm-home-container {
    .hm-home-aside {
      background-color: #333744;

      .hm-toggle-box {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding-right: 10px;
        background-color: #4a5064;

        .el-icon {
          cursor: pointer;
        }
      }

      .el-menu {
        border-right: none;
      }
    }

    .hm-home-main {
      background: url("../assets/img/main_bg2.jpg") no-repeat center/cover;
    }
  }
}
</style>
