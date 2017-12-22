import VueRouter from 'vue-router';
import auth from '@/auth';
import {Message} from 'element-ui';
import Main from '@/Main.vue';
import Login from '@/components/login/Login.vue';
import AutoLogin from '@/components/login/AutoLogin.vue';
import Home from '@/components/home/Home.vue';
import InfusionDetail from '@/components/home/infusionDetail/InfusionDetail.vue';
import Query from '@/components/infusion/query/Query.vue';
import Statistic from '@/components/infusion/statistic/Statistic.vue';
import AccuracyOfAlarm from '@/components/infusion/accuracyOfAlarm/accuracyOfAlarm.vue';
import StatisticsOfEquipmentUseInWard from '@/components/infusion/statisticsOfEquipmentUseInWard/StatisticsOfEquipmentUseInWard.vue';
import SummaryOfInfusionInformation from '@/components/infusion/summaryOfInfusionInformation/SummaryOfInfusionInformation.vue';
import SummaryOfAccuracy from '@/components/infusion/summaryOfAccuracy/summaryOfAccuracy.vue';
import InformationQueryForInfusionMedicine from '@/components/infusion/informationQueryForInfusionMedicine/InformationQueryForInfusionMedicine.vue';

import Alarm from '@/components/infusion/alarm/Alarm.vue';
import Monitor from '@/components/device/monitor/Monitor.vue';
import Container from '@/components/device/container/Container.vue';
import InfusionBagSurchargeManagement from '@/components/device/infusionBagSurchargeManagement/InfusionBagSurchargeManagement.vue';
import Bridge from '@/components/device/bridge/Bridge.vue';

import User from '@/components/setting/user/User.vue';
import Bed from '@/components/setting/bed/Bed.vue';
import Config from '@/components/setting/config/Config.vue';
import Dept from '@/components/setting/dept/Dept.vue';
import Log from '@/components/setting/log/Log.vue';
import SystemLog from '@/components/setting/systemLog/SystemLog.vue';
import CheckSystemDefects from '@/components/setting/CheckSystemDefects/CheckSystemDefects.vue';
import Tool from '@/components/setting/tool/Tool.vue';

export const router = new VueRouter({
  mode: 'hash',
  base: 'infusion',
  routes: [
    // ['首页', '输液监测', '输液查询', '输液统计', '报警信息', '监测器管理', '床位管理', '常用设置'];
    {
      path: '',
      name: 'infusion',
      components: {
        default: Main
      },
      children: [
        {
          path: '',
          name: 'home',
          meta: {
            title: '输液监测'
          },
          component: Home
        }, {
          path: '/query',
          name: 'query',
          meta: {
            title: '输液记录查询'
          },
          component: Query
        }, {
          path: '/informationQueryForInfusionMedicine',
          name: 'informationQueryForInfusionMedicine',
          meta: {
            title: '输液用药信息查询'
          },
          component: InformationQueryForInfusionMedicine
        }, {
          path: '/statistics',
          name: 'statistics',
          meta: {
            title: '输液量统计图'
          },
          component: Statistic
        }, {
          path: '/alarms',
          name: 'alarms',
          meta: {
            title: '报警信息'
          },
          component: Alarm
        }, {
          path: '/accuracyOfAlarm',
          name: 'accuracyOfAlarm',
          meta: {
            title: '报警准确率趋势图'
          },
          component: AccuracyOfAlarm
        }, {
          path: '/summaryOfAccuracy',
          name: 'summaryOfAccuracy',
          meta: {
            title: '报警准确率汇总表'
          },
          component: SummaryOfAccuracy
        }, {
          path: '/equipmentUseInWard',
          name: 'equipmentUseInWard',
          meta: {
            title: '设备使用统计图'
          },
          component: StatisticsOfEquipmentUseInWard
        }, {
          path: '/summaryOfInfusionInformation',
          name: 'summaryOfInfusionInformation',
          meta: {
            title: '全院输液统计图'
          },
          component: SummaryOfInfusionInformation
        }, {
          path: '/infusionDetail',
          name: 'infusionDetail',
          meta: {
            title: '输液袋详情'
          },
          component: InfusionDetail
        },
        // ***********************************************设备管理**********************************************
        {
          path: '/devices',
          name: 'devices',
          meta: {
            title: '监测器管理'
          },
          component: Monitor
        }, {
          path: '/containers',
          name: 'containers',
          meta: {
            title: '输液容器管理',
            requireAdmin: true
          },
          component: Container
        }, {
          path: '/blueBridge',
          name: 'blueBridge',
          meta: {
            title: '蓝桥管理',
            requireAdmin: true
          },
          component: Bridge
        }, {
          path: '/infusionBagSurchargeManagement',
          name: 'infusionBagSurchargeManagement',
          meta: {
            title: '输液袋附加物管理',
            requireAdmin: true
          },
          component: InfusionBagSurchargeManagement
        },
        // ************************************************系统设置**********************************************
        {
          path: '/users',
          name: 'users',
          meta: {
            title: '用户管理',
            requireAdmin: true
          },
          component: User
        }, {
          path: '/depts',
          name: 'depts',
          meta: {
            title: '病区管理',
            requireAdmin: true
          },
          component: Dept
        }, {
          path: '/beds',
          name: 'beds',
          meta: {
            title: '床位管理'
          },
          component: Bed
        }, {
          path: '/tools',
          name: 'tools',
          meta: {
            title: '诊断工具',
            requireAdmin: true
          },
          component: Tool
        }, {
          path: '/config',
          name: 'config',
          meta: {
            title: '常用设置'
          },
          component: Config
        }, {
          path: '/logs',
          name: 'logs载',
          meta: {
            title: '日志下载',
            requireAdmin: true
          },
          component: Log
        }, {
          path: '/systemTools',
          name: 'systemTools',
          meta: {
            title: '系统诊断',
            requireAdmin: true
          },
          component: SystemLog
        }, {
          path: '/checkSystemDefects',
          name: 'checkSystemDefects',
          meta: {
            title: '系统缺陷检查',
            requireAdmin: true
          },
          component: CheckSystemDefects
        }
      ]
    }, {
      path: '/login',
      name: 'login',
      meta: {
        title: '登录'
      },
      component: Login
    }, {
      path: '/autoLogin',
      name: 'autoLogin',
      meta: {
        title: '全闭环输液系统-登录'
      },
      component: AutoLogin
    }
  ]
});

router.afterEach(route => {
  // 改变document title
  document.title = `${route.meta.title} - 联新全闭环输液`;
});

router.beforeEach((to, from, next) => {
  // 自动登录不检查
  if (to.name === 'autoLogin') {
    next();
    return;
  }
  // 用户已登录进入登陆页时，不跳转。
  const isLogined = auth.checkAuth();
  if (isLogined && to.name === 'login') {
    next(from.path);
    return;
  }

  if (!isLogined && to.name !== 'login' && from.name !== 'login') {
    next('/login');
  }
  // 当用户输入url跳转时，根据权限判断是否进入。
  if (auth.token && auth.token.user.isadmin === '0' && to.meta.requireAdmin) {
    Message({message: '您当前没有权限进入该页面，如有需要请联系管理员~', type: 'error'});
    next(from.path);
    return;
  }
  next();
});
