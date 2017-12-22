<template>
  <header class="header" v-show="!isFull">
    <div class="header-top-white fr"></div>
    <div class="header-wrap w">
      <div class="logo fl tc">
        全闭环输液管理
      </div>
      <div class="header-right fr">
        <div class="header-top">
          <div class="date-now fl">
            <i class="fa fa-calendar"></i>
            {{top.time}}
          </div>
          <div class="section-office fl">
            <i class="fa fa-building"></i>
            {{top.user.deptList[0].name}}
          </div>

          <div class="nurse-name fl">
            <i class="fa fa-user"></i>
            {{top.user.user.name}}
            <span class=""></span>
          </div>
          <div class=" fl">
            <a id="logout" @click="logout">
                <i class="fa fa-sign-out"></i>
                退出登录
            </a>
          </div>

          <div class="logo-header"></div>
        </div>
        <el-menu unique-opened default-active="1" class="infusion-nav" mode="horizontal" @open="handleOpen" @select="handleSelect" menu-trigger="click">
            <el-submenu :class="activeMenu(nav)" :key="index" class="nav-submenu" :index="index + ''" v-if="nav.visible" v-for="(nav, index) in navs">
              <template slot="title"><i :class="'fa fa-' + nav.icon"></i> {{nav.name}}</template>
              <el-menu-item v-if="subNav.visible" :key="subIndex" :class="{'active-menu-item': subNav.url.indexOf($route.name) > -1}" :index="index + '-' + subIndex" v-for="(subNav, subIndex) in nav.subItems"><router-link :to="subNav.url">{{subNav.name}}</router-link></el-menu-item>
            </el-submenu>
        </el-menu>
      </div>
    </div>
  </header>
</template>

<script>
require('./header.scss');
import {router} from '@/router/router';
import auth from '@/auth';
import _ from 'lodash';
import moment from 'moment';
import Vue from 'vue';
import * as CONST from '@/const';
const navData = require('./nav.json');

export default {
  props: ['isFull'],
  beforeCreate: () => {
    console.log('创建前！');
  },

  created: () => {
    console.log('创建完毕！');
  },

  mounted() {
    // const body = document.querySelector('body');

    // body.addEventListener('click', event => {
    //   if (event) {
    //
    //   }
    // });
  },

  data() {
    return {
      navs: (() => {
        const userData = auth.getToken();

        if (!userData) {
          return;
        }
        const navs = _.cloneDeep(navData.navs);
        // 普通用户菜单 输液监测
        const ordinaryNav = ['首页', '输液监测', '报警信息', '监测器管理', '床位管理', '常用设置'];
        // 护理部菜单
        const nursingDepartment = ['首页','输液监测','输液记录查询','输液量统计图','报警准确率趋势图','报警准确率汇总表','设备使用统计图','全院输液统计图','输液用药信息查询','常用设置','系统诊断'];
        // '0'代表普通用户；
        // '1'代表管理员，显示所有目录 不做处理；
        // '2'代表护理部；
        if (userData.user.isadmin === '0') {   
          navs.forEach(nav => {
            if (nav.subItems) {
              nav.subItems.forEach(subNav => {
                if (ordinaryNav.indexOf(subNav.name) < 0) {
                  subNav.visible = false;
                }
              });
            }
          });
        }else if(userData.user.isadmin === '2') {
          navs.forEach(nav => {
            if (nav.subItems) {
              nav.subItems.forEach(subNav => {
                if (nursingDepartment.indexOf(subNav.name) < 0) {
                  subNav.visible = false;
                }
              });
            }
          });
        }

        return navs;
      })(),
      top: {
        user: auth.getToken(),
        time: moment().format('YYYY-MM-DD'),
      }
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    handleOpen(index, indexPath) {
      console.log(index, indexPath);
    },
    activeMenu(nav) {
      const isExist = _.find(nav.subItems, (item) => item.url.indexOf(this.$route.name) > -1);
      if (isExist) {
        return {
          'active-menu': true
        };
      }
      return {};
    },
    logout: () => {
      auth.logout();
      router.push({
        name: 'login'
      });
    }
  }
}
</script>
