import Vue from 'vue'
import App from './App'
import router from './router/index'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
/**
 * use async await 
 */
 (async () => {
  const ipc = await createIPC() 
  window.ipc = ipc
  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app')
})();

