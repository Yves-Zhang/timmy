<template>
<div>
  <el-card class="box-card infusion-overview">
    <div slot="header" class="card-header">
      <div class="card-title"><i class="icon iconfont icon-icons_diagnostic_too"></i> 诊断工具</div>
    </div>
    <div class="tool-input-wrap">
      <el-row :gutter="20">
        <el-col :span="8" :offset="8">
          <div class="grid-content">
            <el-input size="large" v-focus :maxlength="17" name="room" @keydown.enter.native="getData" v-model="macAddress" placeholder="MAC地址如：00:00:00:00:00:00">
              <el-button slot="append" @click="getData">诊断</el-button>
            </el-input>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="card-content" v-loading.body="loading" element-loading-text="正在加载结果...">
      <div class="block-title">
        输液袋情况
      </div>
      <el-row :gutter="20" v-if="infusionDetail.begin_time">
        <el-col :span="4">
          <div class="grid-content">
            床位：{{infusionDetail.bedCode}}</div>
        </el-col>
        <el-col :span="8">
          <div class="grid-content">
            记录id：{{infusionDetail.infusion_bag_id}}</div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content">
            开始时间：{{infusionDetail.begin_time}}</div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content">
            初始重量：{{infusionDetail.act_total_weight}}</div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content">
            输液状态：
            <el-tag :type="infusionDetail.tagType" close-transition>{{infusionDetail.statusText}}</el-tag>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content">
            输液袋：{{infusionDetail.spec_capacity}}ml | {{infusionDetail.material}}
            <el-button type="default" size="mini" @click="() => loadHistory(infusionDetail.infusion_bag_id)"><i class="fa fa-clock-o"></i>&nbsp;历史匹配记录</el-button>
            </div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content">
            启动键：
            <el-tag :type="infusionDetail.startFlag === 0 ? 'gray' : 'success'" close-transition>{{infusionDetail.startFlag === 0 ? '无' : '有'}}</el-tag>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content">
            输液扫描：</div>
        </el-col>
      </el-row>
      <div class="block-title">
        基本状态
      </div>
      <el-row :gutter="20" v-if="baseInfo.inmBlueBridgeInfo.flyOverDevAddress">
        <el-col :span="24">
          <div class="grid-content">
            蓝桥：{{baseInfo.inmBlueBridgeInfo.flyOverDevAddress}} | {{baseInfo.inmBlueBridgeInfo.room}}房
            <el-tag :type="baseInfo.inmBlueBridgeInfo.flyOverStatus === 1 ? 'success': 'gray'" close-transition>{{baseInfo.inmBlueBridgeInfo.flyOverStatus === 1 ? '在线' : '离线'}}</el-tag>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="grid-content">
            监测器：{{baseInfo.infusionDeviceInfo.macAddress}} | {{baseInfo.infusionDeviceInfo.bedCode}}床
            <el-tag :type="baseInfo.infusionDeviceInfo.deviceLnk === '1' ? 'success': 'gray'" close-transition>{{baseInfo.infusionDeviceInfo.deviceLnk === '1' ? '在线' : '离线'}}</el-tag>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="grid-content">
            监测页面：</div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="grid-content">
            <el-card class="box-card">
              <div slot="header" class="card-header">
                Redis队列
                <el-button class="fr" size="mini" type="primary" @click="getInfusionRedisDataByMac" :disabled="!macAddress || macAddress.length < 17">查询</el-button>
              </div>
              <pre v-if="redisDetail.length">{{redisDetail}}</pre>
            </el-card>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="grid-content">
            <el-card class="box-card">
              <div slot="header" class="card-header">
                分析后数据
                <el-button class="fr" size="mini" type="primary" @click="getInfusionRedisDetailByMac" :disabled="!macAddress || macAddress.length < 17">查询</el-button>
              </div>
              <el-table :data="redisComputedAfter" stripe border style="width: 100%" v-if="redisComputedAfter.length > 0">
                <el-table-column type="index" label="序号" width="50">
                </el-table-column>
                <el-table-column prop="create_time" label="创建时间" width="140">
                </el-table-column>
                <el-table-column prop="mac_address" label="mac地址" width="120">
                </el-table-column>
                <el-table-column prop="drop_speed" label="滴速" width="50">
                </el-table-column>
                <el-table-column prop="rest_capacity" label="剩余液量" width="80">
                </el-table-column>
                <el-table-column prop="rest_time" label="剩余时间" width="80">
                </el-table-column>
                <el-table-column prop="rest_weight" label="剩余重量" width="80">
                </el-table-column>
                <el-table-column prop="sent_time" label="发送时间" width="160">
                </el-table-column>
                <el-table-column prop="inm_percent" label="百分比" inline-template width="60">
                  <span>{{row.inm_percent}}%</span>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-card>

  <el-dialog title="历史匹配记录" v-model="historyVisible" size="large" style="min-width: 1200px">
    <el-table border stripe :data="historyData" v-loading.body="historyLoading" element-loading-text="正在加载...">
      <el-table-column type="index" label="序号" width="50"></el-table-column>
      <el-table-column prop="specCapacity" label="匹配规格" width="66"></el-table-column>
      <el-table-column prop="material" label="材质" width="60"></el-table-column>
      <el-table-column prop="actTotalWeight" label="匹配重量" width="66"></el-table-column>
      <el-table-column prop="startFlag" label="按键类型" width="66"></el-table-column>
      <el-table-column prop="orderBar" label="扫描条码" width="250"></el-table-column>
      <el-table-column prop="createTime" label="匹配时间" width="150"></el-table-column>
      <el-table-column prop="remark" label="原因"></el-table-column>
    </el-table>
  </el-dialog>
</div>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';
import * as CONST from '../../../const';
import moment from 'moment';
import auth from '../../../auth';
import {
  Message
} from 'element-ui';

import getInfusionStatus from '../../../common/infusionStatus';

require('./index.scss');

export default {
  computed: {
    // 过滤后的列表
    redisComputedAfter() {
      return this.redisComputed.map(item => {
        item.create_time = moment(item.create_time).format('YYYY-MM-DD HH:mm:ss');
        item.sent_time = moment(item.sent_time).format('YYYY-MM-DD HH:mm:ss');

        return item;
      });
    }
  },
  data() {
    return {
      historyLoading:false,
      loading: false,
      queryParams: {
        deptCode: ''
      },
      list: [],
      data: {
        list: []
      },
      macAddress: '',
      details: [],
      historyData: [],
      perPageSize: 10,
      currentPage: 1,
      filterBed: null,
      detailVisible: false,

      historyVisible: false,

      settingVisible: false,
      settingForm: {},
      requests: {
        getDeviceAndBlueBridgeInfo: () => this.$http.get(`${CONST.PATH}/getDeviceAndBlueBridgeInfo`, {
          params: {
            mac: this.macAddress
          }
        }),

        getInfusionRedisDataByMac: () => this.$http.get(`${CONST.PATH}/getInfusionRedisDataByMac`, {
          params: {
            mac: this.macAddress
          }
        }),

        getInfusionRedisDetailByMac: () => this.$http.get(`${CONST.PATH}/getInfusionRedisDetailByMac`, {
          params: {
            mac: this.macAddress
          }
        }),

        getInfusionDetailByMac: () => this.$http.get(`${CONST.PATH}/getInfusionDetailByMac`, {
          params: {
            mac: this.macAddress
          }
        })
      },

      infusionDetail: {},
      baseInfo: {
        inmBlueBridgeInfo: {},
        infusionDeviceInfo: {}
      },
      redisDetail: {},
      redisComputed: []
    }
  },
  methods: {
    toJson(data) {
      return JSON.stringify(data.map(item => JSON.parse(item)), null, '  ');
    },
    toJs(data) {
      return data.map(item => JSON.parse(item));
    },
    getData() {
      if (this.macAddress.length !== 17) {
        Message({
          type: 'error',
          message: '请输入17位的mac地址'
        });
        return;
      }
      this.loading = true;
      return Promise.all(Object.keys(this.requests).map(key => this.requests[key]()))
        .then(([bridgeInfoData, redisData, redisComputedData, infusionDetaiData]) => {
          this.loading = false;
          this.infusionDetail = infusionDetaiData.body && getInfusionStatus(infusionDetaiData.body.data) || {};
          this.baseInfo = bridgeInfoData.body && bridgeInfoData.body.data || {
            inmBlueBridgeInfo: {},
            infusionDeviceInfo: {}
          };
          this.redisDetail = redisData.body && this.toJson(redisData.body.data) || {};
          this.redisComputed = redisComputedData.body && this.toJs(redisComputedData.body.data) || [];
        })
        .catch(([bridgeErr, redisErr, redisComputedErr, infusionDetailErr]) => {
          console.log(bridgeErr, redisErr, redisComputedErr, infusionDetailErr);
        });
    },
    getInfusionRedisDetailByMac() {
      this.requests.getInfusionRedisDetailByMac().then(response => this.redisComputed = response.body && this.toJs(response.body.data) || {});
    },
    getInfusionRedisDataByMac() {
      this.requests.getInfusionRedisDataByMac().then(response => {
        debugger;
        this.redisDetail = response.body && this.toJson(response.body.data) || {}
      });
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    loadDetail(flMacaddress) {
      this.loadingDetail = true;
      this.$http.get(`${CONST.PATH}/getInfusionDevices`, {
        params: {
          keyType: 'FL',
          keyword: flMacaddress
        }
      }).then(response => {
        if (response) {
          this.details = this.transformData(response.body.data.list);
          this.detailVisible = true;
        }
        this.loadingDetail = false;
      }).catch(error => his.loadingDetail = false);
    },
    loadHistory(infusionBagId) {
      this.historyVisible = true;
      this.historyLoading = true;

      this.$http.get(`${CONST.PATH}/getMatchInfoByBagId`, {
        params: {
          infusionBagId,
        }
      }).then(response => {
        this.historyData = response.data.data.list || [];
        this.historyLoading = false;
      }).catch(error => {
        this.historyLoading = false;
      });
    },
    openSetting(row) {
      this.settingForm = Object.assign({}, row);
      this.settingVisible = true;
    },
    saveSetting() {
      this.$refs.settingForm.validate((valid) => {
        if (valid) {
          this.savingSetting = true;
          delete this.settingForm.statusText;
          delete this.settingForm.tagType;
          delete this.settingForm.deptName;
          delete this.settingForm.flyOverVersion;
          this.$http.get(`${CONST.PATH}/updateBlubridge`, {
            params: this.settingForm
          }).then(response => {
            this.savingSetting = false;
            if (response.body) {
              this.settingVisible = false;
              this.getData();
              Message({
                type: 'success',
                message: response.body.msg
              })
            }
          }).catch(error => this.savingSetting = false);
        } else {
          return false;
        }
      });
    }
  }
}
</script>
