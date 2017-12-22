import {router} from '@/router/router';
import * as CONST from '@/const';
const LOGIN_URL = '/infusion/index/doLoginPc';

export default {
  user: {
    authenticated: false,
    token: null
  },

  login(context, creds, redirect) {
    return context.$http.get(LOGIN_URL, {
      params: creds
    }).then(response => {
      if (response.body) {
        // 科室的数据是deptList
        // 处理没有科室的情况
        if (response.body.data.deptList.length === 0) {
          return null;
        }
        context.$http.get(`${CONST.PATH}/getInfusionWards`).then(response => {
          if (response.body) {
            context.$root.deptList = response.body.data.list || [];
          }
        });
        localStorage.setItem('token', JSON.stringify(response.data.data));

        this.user.authenticated = true;

        if (redirect) {
          router.push({path: redirect});
        }
      }
      return response;
    }, err => {
      context.error = err;
    });
  },

  logout() {
    localStorage.clear();
    this.user.authenticated = false;
  },

  checkAuth() {
    this.user.authenticated = JSON.parse(localStorage.getItem('token'));

    return this.user.authenticated;
  },

  getToken() {
    return JSON.parse(localStorage.getItem('token'));
  },

  getAuthHeader() {
    return {Authorization: `Infusion ${localStorage.getItem('token')}`};
  }
};
