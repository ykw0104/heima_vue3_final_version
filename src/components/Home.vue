<template>
  <div class="hm-home">
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script setup>
/* --Import------------------------------------------------------------------------------------------------- */
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
/* --Data--------------------------------------------------------------------------------------------------- */

/* --Methods------------------------------------------------------------------------------------------------ */
/* 用户退出 */
const logout = () => {
  // 清空(包括保存的token)
  window.sessionStorage.clear();
  // 跳转到login
  router.push("/login");
};
/* --Others------------------------------------------------------------------------------------------------- */
</script>

<style lang="scss" scoped>
.hm-home {
}
</style>
