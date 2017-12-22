import Vue from 'vue';
import {
  Message,
  Loading,
  Form,
  FormItem,
  Input,
  Select,
  Option,
  Radio,
  RadioButton,
  RadioGroup,
  Checkbox,
  Table,
  TableColumn,
  DatePicker,
  Switch,
  Button,
  Card,
  Tabs,
  TabPane,
  Dialog,
  Pagination,
  Menu,
  Col,
  Row,
  Submenu,
  Tag,
  MenuItem
} from 'element-ui';
import VueResource from 'vue-resource';
import 'element-ui/lib/theme-default/index.css';
import auth from '@/auth';
import '@/style/index.scss';
import VueRouter from 'vue-router';
import * as CONST from '@/const';

import 'font-awesome-sass/assets/stylesheets/_font-awesome.scss'

// import Raven from 'raven-js';
// import RavenVue from 'raven-js/plugins/vue';

import {router} from './router/router.js';

Vue.use(VueRouter);
Vue.use(Dialog);
Vue.use(Col);
Vue.use(Row);
Vue.use(VueResource);
Vue.use(Loading);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Select);
Vue.use(Option);
Vue.use(Radio);
Vue.use(RadioButton);
Vue.use(RadioGroup);
Vue.use(Checkbox);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(DatePicker);
Vue.use(Switch);
Vue.use(Button);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Pagination);
Vue.use(Card);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(Tag);
Vue.use(MenuItem);

// import ('font-awesome-sass/assets/stylesheets/font-awesome/_font-awesome.scss')
// require('font-awesome')
require('@/directives/battery/index.js');
require('@/directives/focus/index.js');

// Raven
// .config('https://0accec47ac6e4b878cafac0336e199b1@sentry.io/221492')
// .addPlugin(RavenVue, Vue)
// .install();

// 拦截器
Vue.http.interceptors.push((request, next) => {
  // 检查是否已登录
  // 未登录则跳转至登录页
  if (!auth.checkAuth() && ['login', 'autoLogin'].indexOf(router.currentRoute.name) < 0 && request.url.indexOf('getInfusionWards') < 0) {
    router.push({path: '/login'});
    return;
  }
  const method = request.method;
  debugger; // eslint-disable-line no-debugger, no-restricted-syntax
  next(response => {
    // debugger; // eslint-disable-line no-debugger, no-restricted-syntax
    if (!response.body) {
      return;
    }
    const resCode = response.body.rslt;
    let isShowError = true;

    switch (resCode) {
      case '0':
        console.log('请求成功！');
        // post 请求弹出响应信息
        if (method === 'POST') {
          if (response.body.msg) {
            Message({message: response.body.msg, type: 'success'});
          }
        }
        break;

      case '-1':
        // 有些失败的请求不显示失败信息
        if (Array.isArray(CONST.NO_ERROR_MESSAGE_PATH)) {
          for (let i = 0; i < CONST.NO_ERROR_MESSAGE_PATH.length; i += 1) {
            if (response.url.indexOf(CONST.NO_ERROR_MESSAGE_PATH[i]) > -1) {
              isShowError = false;
              break;
            }
          }
        }
        if (isShowError) {
          Message({
            message: response.body.msg || '请求失败！',
            type: 'error'
          });
        }
        response.body = null;
        break;
        // TODO 缺少会话超时的情况
      default:
        // debugger; // eslint-disable-line no-debugger, no-restricted-syntax
        if (response.url.indexOf('getAlarmStatus') === -1 && response.status !== 200) {
          Message({
            message: response.body.msg || '请求失败，请检查网络设置或联系管理员！',
            type: 'error'
          });
          response.body = null;
        }
    }
  });
});

export default new Vue({
  el: '#root',
  router,
  created() {
    if (!auth.getToken()) {
      return;
    }
    this.$http.get(`${CONST.PATH}/getInfusionWards`).then(response => {
      if (response.body) {
        this.deptList = response.body.data.list || [];
      }
    });
  },
  data() {
    return {token: auth.getToken(), deptList: []};
  },
  render: h => h('router-view')
});
