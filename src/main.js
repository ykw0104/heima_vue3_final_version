import { createApp } from "vue";

// 导入全局css
import "@/assets/css/global.css";

// 导入element-plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import App from "./App.vue";
import router from "./router";
import store from "./store";

const app = createApp(App);

app.use(ElementPlus);
app.use(store).use(router).mount("#app");
