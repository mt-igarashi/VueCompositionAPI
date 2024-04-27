import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/route'
import Utils from '@/js/utils'

// VuexStoreを生成
const store = Utils.instance.createVuexStore();

const app = createApp(App);
app.use(router);
app.mount('#app');
app.use(router);
app.use(store);

// コンポーネントを自動登録します。
Utils.instance.loadComponents(app);