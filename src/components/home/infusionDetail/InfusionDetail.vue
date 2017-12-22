<template>
<div>
  <el-card class="box-card infusion-overview" v-loading.body="loading" element-loading-text="正在加载...">
    <div slot="header" class="card-header">
      <div class="card-title"><i class="fa fa-line-chart"></i> 输液详情</div>
      <router-link :to="{name: 'home'}">
        <el-button class="fr" type="default" size="mini">返回监测列表</el-button>
      </router-link>
    </div>
    <div class="filter-wrap">
      输液监测器（设备号：{{data.deviceInfo.deviceSn}}，MAC地址：{{data.deviceInfo.macAddress}}，床号：{{data.bagInfo.bedCode}}，容器规格：{{data.bagInfo.spec_capacity}}ml）
      <div class="fr">
        <el-select size="mini" style="display: inline-block;" @change="changeCapacity" v-model="selectedBag">
          <el-option v-for="bag in bagList" :value="bag" :label="`${bag.split('-')[0]}-${bag.split('-')[1]}ml`"></el-option>
        </el-select>
        <!-- <el-button type="primary" size="mini" @click="() => openSetting()">设置</el-button> -->
      </div>
    </div>
    <div class="card-content">
      <div class="infusion-process">
        <div class="infusion-process_bar" :style="{width: `${100 - (data.bagInfo ? data.bagInfo.latestInmPercent : 0)}%`}"></div>
        <span class="infusion-process__num fr">{{100 - data.bagInfo.latestInmPercent}}%</span>
        <span id="infusion-process__start-time">{{data.bagInfo.begin_time && data.bagInfo.begin_time.substr(10, 9)}}</span>
        <span id="infusion-process__end-time">{{data.bagInfo.end_time && data.bagInfo.end_time.substr(10, 9)}}</span>
      </div>
      <div style="text-align: center;margin-bottom: 10px">
        剩余<span>{{data.bagInfo.latestRestCapacity}}</span>ml
        剩余<span>{{data.bagInfo.latestRestTime}}</span>分钟
      </div>
      <div class="chart-wrap">
        <div class="chart-container">

        </div>
      </div>
    </div>
  </el-card>
  <!-- <el-dialog title="监测器设置" v-model="settingVisible">
    <el-form :model="settingForm" label-width="100px" ref="settingForm" :rules="rules" v-loading.body="settingLoading" element-loading-text="正在加载设置...">
      <div class="block-title">
        设备信息
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="grid-content">
            型号：{{data.deviceInfo.deviceModel}}
          </div>
        </el-col>
        <el-col :span="12">
          <div class="grid-content">
            设备号：{{data.deviceInfo.deviceSn}}
          </div>
        </el-col>
        <el-col :span="12">
          <div class="grid-content">
            mac地址：{{data.deviceInfo.macAddress}}
          </div>
        </el-col>
        <el-col :span="12">
          <div class="grid-content">
            <el-button v-if="!!data.deviceInfo.bindType" size="mini" type="danger" :disabled="unbinding" @click="() => unbind(data.deviceInfo.macAddress)">{{unbinding ? '正在解绑...': '解除绑定'}}</el-button>
          </div>
        </el-col>
      </el-row>
      <div class="block-title">
        报警设置
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="报警开关：">
            <el-switch v-model="settingForm.alarmSwitch" on-text="开" off-text="关" on-color="#13ce66" off-color="#999">
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="剩余时间：" style="width: 200px">
            <el-select size="small" name="restTimeAlarm" v-model="settingForm.restTimeAlarm" placeholder="剩余时间">
              <el-option label="3分钟" value="3"></el-option>
              <el-option label="5分钟" value="5"></el-option>
              <el-option label="10分钟" value="10"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="滴速范围：" required>
            <el-col :span="10">
              <el-form-item prop="dropSpeedFloor">
              <el-input inline type="number" class="inline-input" name="dropSpeedFloor" size="small" v-model="settingForm.dropSpeedFloor">
              </el-input>
              </el-form-item>
            </el-col>
            <el-col class="line" :span="4">
              -
            </el-col>
            <el-col :span="10">
              <el-form-item prop="dropSpeedUpper">
              <el-input inline type="number" class="inline-input" name="dropSpeedUpper" size="small" v-model="settingForm.dropSpeedUpper">
              </el-input>
              </el-form-item>
            </el-col>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="点滴系数：" style="width: 200px">
            <el-select size="small" name="idc" v-model="settingForm.idc" placeholder="点滴系数">
              <el-option label="10" value="10"></el-option>
              <el-option label="15" value="15"></el-option>
              <el-option label="20" value="20"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="剩余液量：" style="width: 200px">
            <el-select size="small" name="restMlAlerm" v-model="settingForm.restMlAlerm" placeholder="剩余液量">
              <el-option label="5ml" value="5"></el-option>
              <el-option label="10ml" value="10"></el-option>
              <el-option label="20ml" value="20"></el-option>
              <el-option label="30ml" value="30"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="settingVisible = false">取消</el-button>
      <el-button type="primary" @click="saveSetting" :disabled="savingSetting">{{savingSetting ? '正在保存...' : '保存'}}</el-button>
    </div>
  </el-dialog> -->
</div>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';
import * as CONST from '@/const';
import moment from 'moment';
import auth from '@/auth';
import {
  Message
} from 'element-ui';

require('./index.scss');
const Highcharts = require('highcharts');

export default {
  created() {
    this.getData();
    this.getBagList();
  },
  mounted() {

  },
  data() {
    const _this = this;
    return {
      loading: false,
      settingForm: {},
      settingVisible: false,
      settingLoading: false,
      unbinding: false,
      savingSetting: false,
      selectedBag: null,

      bagList: [],

      data: {
        bagInfo: {},
        list: [],
        deviceInfo: {}
      },

      rules: {
        dropSpeedFloor: [{
          required: true,
          type: 'number',
          message: '请输入数字',
          trigger: 'blur'
        }, {
          min: 1,
          max: 2000,
          trigger: 'blur',
          validator: (rule, value, callback) => {
            if (typeof rule.max !== 'number') {
              throw new Error('rule.max不是数字');
            }

            if (typeof rule.min !== 'number') {
              throw new Error('rule.min不是数字');
            }

            if (typeof value !== 'number') {
              throw new Error('value不是数字');
            }

            if (value > rule.max) {
              callback(new Error(`数字不能大于${rule.max}`));
            }
            if (value < rule.min) {
              callback(new Error(`数字不能小于${rule.min}`));
            }
            if (value > _this.settingForm.dropSpeedUpper && !!_this.settingForm.dropSpeedUpper) {
              callback(new Error(`数字不能大于${_this.settingForm.dropSpeedUpper}`));
            }
            callback();
          }
        }],
        dropSpeedUpper: [{
          required: true,
          type: 'number',
          message: '请输入数字',
          trigger: 'blur'
        }, {
          min: 1,
          max: 2000,
          trigger: 'blur',
          validator: (rule, value, callback) => {
            if (typeof rule.max !== 'number') {
              throw new Error('rule.max不是数字');
            }

            if (typeof rule.min !== 'number') {
              throw new Error('rule.min不是数字');
            }

            if (typeof value !== 'number') {
              throw new Error('value不是数字');
            }

            if (value > rule.max) {
              callback(new Error(`数字不能大于${rule.max}`));
            }
            if (value < rule.min) {
              callback(new Error(`数字不能小于${rule.min}`));
            }
            if (value < _this.settingForm.dropSpeedFloor && !!_this.settingForm.dropSpeedFloor) {
              callback(new Error(`数字不能小于${_this.settingForm.dropSpeedFloor}`));
            }
            callback();
          }
        }]
      }
    }
  },
  methods: {
    getData() {
      this.loading = true;
      return this.$http.get(`${CONST.PATH}/getPerBagDetailLst`, {
        params: {
          infusionBagId: this.$route.query.id
        }
      }).then(response => {
        if (response.body) {
          this.loading = false;
          this.data = response.body.data;
          const { material = '暂无', spec_capacity } = this.data.bagInfo;
          this.selectedBag = `${material}-${spec_capacity}`;
          this.drawChart();
        }
      });
    },

    getBagList() {
      return this.$http.get(`${CONST.PATH}/getInfusionBagList`, {
        params: {
          deptId: auth.getToken().deptList[0].code
        }
      }).then(response => {
        if (response.body) {
          this.bagList = response.body.data.list.map(({ material, spec_capacity, seq_id }) => [material, spec_capacity, seq_id].join('-'));
        }
      });
    },

    getDevSetting(macAddress) {
      return this.$http.get(`${CONST.PATH}/getInfusionDeviceSetInfoByMacaddress`, {
        params: {
          macAddress
        }
      }).then(response => {
        if (response.body) {
          this.settingForm = response.body.data;
          this.settingForm.alarmSwitch = response.body.data.alarmSwitch === '1';
        }
        return response.body;
      });
    },

    saveSetting() {
      this.$refs.settingForm.validate((valid) => {
        if (valid) {
          const _formData = Object.assign({}, this.settingForm);
          this.savingSetting = true;
          _formData.macAddress = this.activeRow.macAddress;
          _formData.alarmSwitch = _formData.alarmSwitch ? '1' : '0';
          this.$http.post(`${CONST.PATH}/saveInfusionDeviceSetInfo`, {
            itemDeviceSet: JSON.stringify(_formData)
          }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;'
            },
            emulateJSON: true
          }).then(response => {
            if (response) {
              Message({
                message: response.body.msg || '已保存设置！',
                type: 'success'
              });
              this.settingVisible = false;
              this.getData();
              this.savingSetting = false;
            }
          });
        } else {
          return false;
        }
      });
    },

    openSetting() {
      this.settingVisible = true;
      this.settingLoading = true;
      this.getDevSetting(this.data.deviceInfo.macAddress).then(() => {
        this.settingVisible = true;
        this.settingLoading = false;
      }).catch(err => this.settingLoading = false);
    },

    unbind(macAddress) {
      this.unbinding = true;
      this.$http.get(`${CONST.PATH}/cancelBindDeviceByMacaddress`, {
        params: {
          macAddress
        }
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;'
        },
        emulateJSON: true
      }).then(response => {
        this.unbinding = false;
        if (response) {
          Message({
            message: response.body.msg || '解绑成功！',
            type: 'success'
          });

          this.getData();
        }
      });
    },

    drawChart() {
      /**
       * 每个标注点最小大小为 MIN_SIZE；
       * 标注点超过 容器宽度 / MIN_SIZE时，宽度加大
       */
      let speedList = [];
      let capacityList = [];
      let dateList = [];
      const data = this.data.list.slice();
      const _chartWrap = document.querySelector('.chart-wrap');
      const _chartContainer = document.querySelector('.chart-container');
      const MIN_SIZE = 3;
      const MAX_LENGTH = _chartWrap.clientWidth / MIN_SIZE;
      const width = data.length >= MAX_LENGTH ? MIN_SIZE * data.length : _chartWrap.clientWidth;
      data.forEach(item => {
        speedList.push(item.drop_speed);
        capacityList.push(item.rest_capacity);
        dateList.push(item.create_time.substr(10, 9));
      });
      _chartContainer.style.width = `${width}px`;

      // 使用highcharts
      this.chart = Highcharts.chart(_chartContainer, {
        chart: {
          type: 'line',
          zoomType: 'xy'
        },
        title: {
          //text: (chartData.rest === 0 ? '已输液完毕！' : '剩余' + chartData.rest + 'ml')
          text: ''
        },
        legend: {
          align: 'right',
          verticalAlign: 'top',
          x: 0,
          y: 0,
          floating: true,
          borderWidth: 0,
          backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        xAxis: {
          categories: dateList
        },
        yAxis: [{
            title: {
              text: '单位:滴/分'
            },
            plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
            }],
            min: 0, // 定义最小值
            startOnTick: true,
            floor: 0
            //opposite: true
          },
          {
            title: {
              text: '单位:ml'
            },
            plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
            }],
            floor: 0,
            opposite: true
          }
        ],
        tooltip: {
          shared: true,
          crosshairs: true
        },
        credits: {
          text: '联新移动医疗',
          href: 'http://www.lachesis-mh.com',
          enabled: true
        },
        plotOptions: {
          areaspline: {
            fillOpacity: 0
          },
          series: {
            dataLabels: {
              enabled: true
            }
            //enableMouseTracking: false
          }
        },
        series: [{
          name: '速度',
          data: speedList,
          color: '#5eb104',
          dataLabels: {
            color: '#5eb104',
            style: {
              textShadow: false
            }
          },
          tooltip: {
            valueSuffix: '滴/分'
          }
        }, {
          name: '剩余量',
          data: capacityList,
          color: '#00CCFF',
          dataLabels: {
            color: '#00CCFF',
            style: {
              textShadow: false
            }
          },
          tooltip: {
            valueSuffix: 'ml'
          },
          yAxis: 1
        }]
      });
    },

    // 修改容量
    changeCapacity() {
      const [ material, spec_capacity, seq_id ] = this.selectedBag.split('-');
      if ((material == this.data.bagInfo.material && spec_capacity == this.data.bagInfo.spec_capacity) || !seq_id) {
        return;
      }
      return this.$http.get(`${CONST.PATH}/updateInfusionBagInfo`, {
        params: {
          infusion_bag_id: this.$route.query.id,
          seqId: seq_id
        }
      }).then(response => {
        if (response.body) {
          Message({
            message: response.body.msg || '更新成功！',
            type: 'success'
          });
          this.getData();
        }
      });
    }
  }
}
</script>
