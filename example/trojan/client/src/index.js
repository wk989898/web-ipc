import Vue from 'vue'
import App from './App'
import router from './router/index'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
; (async () => {
  const ipc = await createIPC() //have to inlet
  console.log('ipc init !')
  window.ipc = ipc
  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app')
})();

