<template>
  <div class="hm-login">
    <div class="hm-login-box">
      <!-- 1. 登录头像 -->
      <div class="hm-avatar-box">
        <img src="@/assets/img/avatar.jpeg" alt="" />
      </div>

      <!-- 2. 登录表单 -->
      <el-form
        class="hm-login-form"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
      >
        <!-- 2.1 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            :prefix-icon="User"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>

        <!-- 2.2 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :prefix-icon="Key"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>

        <!-- 2.3 提交按钮 -->
        <el-form-item class="hm-btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
/* --Import------------------------------------------------------------------------------------------------- */
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { User, Key } from "@element-plus/icons";
import { $login } from "@/request";

const router = useRouter();
/* --Data--------------------------------------------------------------------------------------------------- */
// 登录表单对象
const loginFormRef = ref(null);
// 登录表单数据
const loginForm = ref({
  username: "admin",
  password: "123456",
});
// 登录表单规则
const loginFormRules = ref({
  username: [
    {
      required: true,
      message: "用户名不能为空",
      trigger: "blur",
    },
    {
      min: 3,
      max: 10,
      message: "长度在 3 到 10 个字符之间",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "密码不能为空",
      trigger: "blur",
    },
    {
      min: 6,
      max: 15,
      message: "长度在 6 到 15 个字符之间",
      trigger: "blur",
    },
  ],
});

/* --Methods------------------------------------------------------------------------------------------------ */
/* 登录表单登录 */
const login = () => {
  loginFormRef.value.validate(async (valid) => {
    // 校验不通过
    if (!valid) return false;

    // 登录请求
    const { data: res } = await $login(loginForm.value);

    // 登录失败提示
    if (res.meta.status !== 200) return ElMessage.error("登录失败 o(╥﹏╥)o");

    // 保存token
    window.sessionStorage.setItem("token", res.data.token);
    // 跳转到home
    router.push("/home");
  });
};

/* 登录表单重置 */
const resetLoginForm = () => {
  loginFormRef.value.resetFields();
};
/* --Others------------------------------------------------------------------------------------------------- */
</script>

<style lang="scss">
.hm-login {
  position: relative;
  height: 100%;
  background-color: #373d41;

  .hm-login-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;

    .hm-avatar-box {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 130px;
      height: 130px;
      padding: 10px;
      border: 1px solid #ffe3e5;
      border-radius: 50%;
      box-shadow: 0 0 10px #ffe3e5;
      background-color: #fff;

      > img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }

    .hm-login-form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;

      .hm-btns > .el-form-item__content {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
