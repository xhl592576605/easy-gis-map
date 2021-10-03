import { createApp } from 'vue'
import App from './app'
import './assets/global.scss'
import "ant-design-vue/dist/antd.css";
import '//at.alicdn.com/t/font_2824561_g90zzryh9ep.js'
import { store } from './store';

createApp(App).use(store).mount('#app')
