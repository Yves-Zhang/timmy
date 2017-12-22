<template>
<div class="login-body">
  <div class="login-header">
    <div class="w">
      <div class="login-logo"></div>
    </div>
  </div>
  <div class="login-wrapper" :style="{'min-height': `${window.innerHeight - 120}px`}">
    <div class="login-box">
      <div class="login-box__header">
        用户登录
      </div>
      <el-form class="login-box__form" :rules="rules" :model="loginForm" ref="loginForm" label-width="100px">
        <el-form-item label="" prop="userName">
          <i class="fa fa-user"></i>
          <el-input v-focus name="userName" @keydown.enter.native="login" type="text" placeholder="用户名" v-model="loginForm.userName"></el-input>
        </el-form-item>

        <el-form-item label="" prop="password">
          <i class="fa fa-lock"></i>
          <el-input type="password" @keydown.enter.native="login" placeholder="密码" name="password" v-model="loginForm.password" auto-complete="off"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button class="login-btn" type="primary" :disabled="isLoging" @click="login">{{isLoging ? '正在登录...' : '登录'}}</el-button>
        </el-form-item>
        <div class="reset-password">
          <a href="javascript:;" @click="reset">重置</a>
        </div>
      </el-form>
    </div>
  </div>
  <footer-component></footer-component>
</div>
</template>
<script>
import Vue from 'vue';
import {
  Message
} from 'element-ui';
import auth from '../../auth';

import Footer from '../../layout/footer/Footer.vue';

require('./login.scss');

export default {
  components: {
    'footer-component': Footer
  },
  data: () => {
    return {
      window: window,
      loginForm: {
        userName: '',
        password: ''
      },
      rules: {
        userName: [{
          required: true,
          message: '请输入用户名',
          trigger: 'change'
        }],
        password: [{
          required: true,
          message: '请输入密码',
          trigger: 'change'
        }]
      },
      isLoging: false
    };
  },

  methods: {
    login() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          const credentials = {
            userName: this.loginForm.userName,
            password: this.loginForm.password
          };
          this.isLoging = true;
          auth.login(this, credentials, '/').then(response => {
            this.isLoging = false;
            if (!response) {
              console.log('确认科室数据是否正确');
            }
          });
        } else {
          return false;
        }
      });
    },

    reset() {
      this.$refs.loginForm.resetFields();
    }
  }
}
</script>
