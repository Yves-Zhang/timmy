<template>
<div>
  <el-card class="box-card infusion-overview">
    <div slot="header" class="card-header">
      <div class="card-title"><i class="icon iconfont icon-icons_infusion_searc"></i> 输液记录查询</div>
    </div>
    <div class="filter-wrap">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline" ref="queryParams">
        <el-form-item v-if="isAdmin">
          <el-select size="small" @change="getQueryData" v-model="queryParams.deptCode" placeholder="病区">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="dept in $root.deptList" :key="dept.code" :label="dept.name" :value="dept.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker class="small-picker" :editable="false" :clearable="false" :picker-options="startTimeOptions" style="width: 120px" size="small" type="date" placeholder="选择日期" v-model="queryParams.startTime"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-date-picker class="small-picker" :editable="false" :clearable="false" :picker-options="endTimeOptions" style="width: 120px" size="small" type="date" placeholder="结束时间" v-model="queryParams.endTime"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-input size="small" v-model="filterBed" placeholder="床号"></el-input>
        </el-form-item>
        <el-form-item style="width: 90px">
          <el-select size="small" @change="getQueryData" v-model="queryParams.infusionStatus" placeholder="输液状态">
            <el-option value="" label="全部"></el-option>
            <el-option label="输液中" value="I"></el-option>
            <el-option label="已离开" value="L"></el-option>
            <el-option label="已暂停" value="P"></el-option>
            <el-option label="已中止" value="S"></el-option>
            <el-option label="已输完" value="F"></el-option>
          </el-select>
        </el-form-item>
        <el-button size="small" type="primary" @click="getQueryData">查询</el-button>
      </el-form>
    </div>
    <div class="card-content" v-loading.body="loading" element-loading-text="正在加载...">
      <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
        <el-table-column type="index" label="序号" width="40">
        </el-table-column>
        <el-table-column prop="deptName" label="病区" width="100">
        </el-table-column>
        <el-table-column prop="bedCode" label="床号" width="50">
        </el-table-column>
        <el-table-column prop="mac_address" label="MAC地址" width="120">
        </el-table-column>
        <el-table-column prop="begin_time" label="开始时间" sortable width="140">
        </el-table-column>
        <el-table-column prop="end_time" label="结束时间" sortable width="140">
        </el-table-column>
        <el-table-column prop="act_total_capacity" label="规格" width="60" sortable>
        </el-table-column>
        <el-table-column prop="net_weight" label="净重(g)" width="80" sortable>
        </el-table-column>
        <el-table-column prop="tare" label="皮重(g)" width="80" sortable>
        </el-table-column>
        <el-table-column prop="material" label="材质">
        </el-table-column>
        <el-table-column prop="statusText" label="状态" inline-template width="80">
          <el-tag :type="row.tagType" close-transition>{{row.statusText}}</el-tag>
        </el-table-column>
        <el-table-column prop="analysisResult" label="分析结果" width="80">
        </el-table-column>
        <el-table-column prop="avgDropspeed" label="平均滴速(滴/分)" sortable width="130">
        </el-table-column>
        <el-table-column prop="infusionDuration" label="输液时长(分)" width="120" sortable>
        </el-table-column>
        <el-table-column :context="_self" inline-template label="操作" fixed="right" width="180">
          <span>
              <el-tooltip class="item" effect="dark" content="输液状态详情" placement="top" style="margin-right: 10px;">
                <el-button type="text" size="small" @click="() => loadDetail(row.infusion_bag_id)"><i class="fa fa-file-text-o"></i></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" v-if="['F', 'S'].indexOf(row.infusion_status) >= 0" content="分析结果图表" placement="top">
                <el-button type="text" size="small" @click="() => openAnalysis(row.mac_address, row.begin_time, row.end_time, row.alarmTime, row.emptyCapacityTime)"><i class="fa fa-line-chart"></i></el-button>
              </el-tooltip>
            </span>
        </el-table-column>
      </el-table>
      <div class="table-pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
        </el-pagination>
      </div>
    </div>
    <el-dialog title="输液状态详情" v-model="detailVisible">
      <el-table border stripe :data="details">
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column prop="statusText" label="输液状态" width="200" inline-template>
          <el-tag :type="row.tagType" close-transition>{{row.statusText}}</el-tag>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间"></el-table-column>
      </el-table>
    </el-dialog>
    <!-- 分析结果 -->
    <el-dialog title="分析结果图表" size="large" v-model="analysisVisible" :close-on-click-modal="false">
      <!--<div v-loading.body="loadAnalysis" element-loading-text="正在加载..."></div>-->
      <div class="chart-wrap analysis-chart" v-loading.body="loadAnalysis" element-loading-text="正在加载...">
        <div class="chart-container"></div>
      </div>
      <div class="no-data" v-show="noneAnalysis">
        <i class="el-icon-information text-warning"></i> 暂无分析数据
      </div>
    </el-dialog>
  </el-card>

  <el-card class="box-card">
    <div slot="header" class="card-header">
      <div class="card-title">统计</div>
    </div>
    <el-row :gutter="20">
      <el-col :span="4">
        <div class="grid-content">
          输液数总计：{{data.infusionBagCount}}袋
        </div>
      </el-col>
      <el-col :span="4">
        <div class="grid-content">
          输液量总计：{{data.infusionMlCount}}ml
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="4" v-for="item in data.listMaterial" :key="item.id">
        <div class="grid-content">
          {{item.material}}总计：{{item.materialCount}}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="4" v-for="item in data.listSpecCapacity" :key="item.id">
        <div class="grid-content">
          容量{{parseFloat(item.specCapacity)}}ml总计：{{item.specCapacityCount}}
        </div>
      </el-col>
    </el-row>
  </el-card>
  </div>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';
import * as CONST from '../../../const';
import moment from 'moment';
import auth from '../../../auth';
import {
  DatePicker,
  Tooltip
} from 'element-ui';

require('./index.scss');

const HighStock = require('highcharts/highstock');

Vue.component(DatePicker.name, DatePicker);
Vue.component(Tooltip.name, Tooltip);

export default {
  created() {
    this.loading = true;
    this.getQueryData();
  },
  computed: {
    // 过滤后的列表
    filterdList() {
      const _this = this;
      return _.chunk(this.data.list.filter(item => {
        if (!_this.filterBed) {
          return true;
        }
        return item.bedCode.indexOf(_this.filterBed) > -1 || (item.analysisResult && item.analysisResult.indexOf(_this.filterBed) > -1);
      }), _this.perPageSize);
    },
    // 过滤后的条目数
    resultSize() {
      let len = 0;
      this.filterdList.forEach(item => len += item.length);
      return len;
    }
  },
  data() {
    const isAdmin = auth.getToken().user.isadmin === '1';
    const that = this;
    return {
      isAdmin,
      loading: false,
      loadAnalysis: false,
      noneAnalysis: false,
      isAllDeptStatisticLoading: false,
      queryParams: {
        deptCode: isAdmin ? '' : auth.getToken().deptList[0].code,
        startTime: moment(),
        endTime: moment(),
        infusionStatus: ''
      },
      list: [],
      data: {
        infusionBagCount:null,
        infusionMlCount:null,
        listMaterial:null,
        listSpecCapacity:null,
        list: []
      },
      allDepsStatData: [],
      details: [],
      perPageSize: 10,
      currentPage: 1,
      filterBed: null,
      detailVisible: false,
      analysisVisible: false,
      allDepsStatVisible: false,

      endTimeOptions: {
        disabledDate(time) {
          return time.getTime() > new Date(that.queryParams.startTime).getTime() + 30 * 24 * 3600 * 1000 || time.getTime() < new Date(that.queryParams.startTime).getTime();
        }
      },

      startTimeOptions: {
        disabledDate(time) {
          return time.getTime() < new Date(that.queryParams.endTime).getTime() - 30 * 24 * 3600 * 1000 || time.getTime() > new Date(that.queryParams.endTime).getTime();
        }
      },
    }
  },
  methods: {
    getQueryData() {
      this.loading = true;
      this.noneAnalysis = false;
      const params = _.assign({}, this.queryParams, {
        startTime: moment(this.queryParams.startTime).format('YYYY-MM-DD'),
        endTime: moment(this.queryParams.endTime).format('YYYY-MM-DD')
      });

      return this.$http.get(`${CONST.PATH}/getInmPerBagInfoList`, {
        params
      }).then(response => {
        this.loading = false;

        const alarm = response.body.data;

        alarm.alarmRate = alarm.totalCount ? ((alarm.earlyAlarmCount + alarm.normalAlarmCount) * 100 / alarm.totalCount).toFixed(2) : 0;
        alarm.accuracy = alarm.totalCount ? (alarm.normalAlarmCount * 100 / (alarm.earlyAlarmCount + alarm.normalAlarmCount)).toFixed(2) : 0;

        this.data = alarm;
        this.data.list = this.transformData(this.data.list);
        this.list = _.chunk(this.data.list, this.perPageSize);
      });
    },
    transformData(data) {
      return data.map(item => {
        const itemTemp = Object.assign({}, item);
        switch (item.infusion_status) {
          case 'I':
            itemTemp.tagType = 'primary';
            itemTemp.statusText = '输液中';
            break;
          case 'S':
            itemTemp.tagType = 'danger';
            itemTemp.statusText = '已中止';
            break;
          case 'P':
            itemTemp.tagType = 'warning';
            itemTemp.statusText = '已暂停';
            break;
          case 'B':
            itemTemp.tagType = '';
            itemTemp.statusText = '开始输液';
            break;
          case 'F':
            itemTemp.tagType = 'success';
            itemTemp.statusText = '已输完';
            break;
          case 'L':
            itemTemp.tagType = 'gray';
            itemTemp.statusText = '已离开';
            break;
          case 'W':
            itemTemp.tagType = 'gray';
            itemTemp.statusText = '等待开启';
            break;
          default:
            itemTemp.tagType = 'gray';
            itemTemp.statusText = '';
            break;
        }

        return itemTemp;
      });
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    loadAllDeptStatistic() {
      this.allDepsStatVisible = true;
      this.isAllDeptStatisticLoading = true;

      this.$http.get(`${CONST.PATH}/getAllInfusionBags`, {
        params: {
          startTime: moment(this.queryParams.startTime).format('YYYY-MM-DD'),
          endTime: moment(this.queryParams.endTime).format('YYYY-MM-DD'),
        }
      }).then(response => {
        this.allDepsStatData = response.data.data;
        this.isAllDeptStatisticLoading = false;
      }).catch(error => {
        this.isAllDeptStatisticLoading = false;
      });
    },
    loadDetail(bagId) {
      this.$http.get(`${CONST.PATH}/getInmPerBagStateByBagId`, {
        params: {
          infusion_bag_id: bagId
        }
      }).then(response => {
        if (response) {
          this.details = this.transformData(response.body.data);
          this.detailVisible = true;
        }
      });
    },
    // 打开分析结果图表
    openAnalysis(macAddress, startTime, endTime, alarmTime, emptyCapacityTime) {
      this.analysisVisible = true;
      this.loadAnalysis = true;
      this.$http.get(`${CONST.PATH}/getInmWeightRecordsByMacTime`, {
          params: {
            macAdd: macAddress,
            startTime,
            endTime
          }
        }).then(response => {
          if (response) {
            this.loadAnalysis = false;
            setTimeout(() => this.drawAnalysis(alarmTime, emptyCapacityTime, response.body.data), 200);
          }
        })
        .catch(() => this.loadAnalysis = false);
    },

    compareTime(time, timeArr) {
      const resArray = timeArr.map(item => Math.abs(new Date(time).getTime() - new Date(item).getTime()));
      const min = Math.min(...resArray);

      return resArray.indexOf(min);
    },

    drawAnalysis(alarmTime, emptyCapacityTime, data) {
      if (!data || data.length === 0 || !Array.isArray(data)) {
        this.noneAnalysis = true;
        return;
      }
      this.noneAnalysis = false;
      const xData = _.map(data, 'create_time');
      const yData = _.map(data, 'inm_weight');
      const totalData = data.map(item => [new Date(item.create_time).getTime(), item.inm_weight]);

      const _chartWrap = document.querySelector('.chart-wrap');
      const _chartContainer = document.querySelector('.chart-container');

      _chartContainer.style.width = `${_chartWrap.clientWidth - 20}px`;

      const flagData = [{
        x: totalData[0][0],
        title: '开始',
        color: '#20A0FF',
        fillColor: '#20A0FF'
      }, {
        x: totalData[totalData.length - 1][0],
        title: '结束',
        color: '#20A0FF',
        fillColor: '#20A0FF'
      }];

      if (alarmTime) {
        const alarmIndex = this.compareTime(alarmTime, xData);
        flagData.push({
          x: new Date(alarmTime).getTime(),
          title: '报警',
          color: '#cf1973',
          fillColor: '#cf1973',
          y: yData[alarmIndex]
        });
      }

      if (emptyCapacityTime) {
        const emptyIndex = this.compareTime(emptyCapacityTime, xData);
        flagData.push({
          x: new Date(emptyCapacityTime).getTime(),
          title: '空瓶',
          color: '#999',
          fillColor: '#999',
          y: yData[emptyIndex]
        });
      }

      HighStock.setOptions({
        global: {
          timezoneOffset: new Date().getTimezoneOffset()
        }
      });

      this.chart = HighStock.stockChart(_chartContainer, {
        rangeSelector: {
          enabled: false
        },

        title: {
          text: '输液瓶输液重量结果分析（单位：g）'
        },

        xAxis: {
          startOnTick: true,
          endOnTick: true,
          dateTimeLabelFormats: {
            second: '%H:%M:%S',
            minute: '%H:%M:%S',
            hour: '%H:%M:%S'
          },
        },

        credits: {
          text: '联新移动医疗',
          href: 'http://www.lachesis-mh.com',
          enabled: true
        },

        tooltip: {
          dateTimeLabelFormats: {
            second: '%H:%M:%S',
            minute: '%H:%M:%S',
            hour: '%H:%M:%S'
          },
          formatter() {
            return `${moment(this.x).format('YYYY-MM-DD HH:mm:ss')}<br /><strong>${this.y.toFixed(2)}g</strong>`
          }
        },

        series: [{
          name: '重量',
          data: data.map(item => [new Date(item.create_time).getTime(), item.inm_weight]),
          tooltip: {
            valueDecimals: 2,
            valueSuffix: 'g'
          },
          id: 'dataseries'
        }, {
          type: 'flags',
          shape: 'squarepin',
          data: flagData,
          style: { // text style
            color: '#fff',
            borderRadius: 4
          },
          onSeries: 'dataseries',
          width: 24
        }]
      });

      this.loadAnalysis = false;
    }
  }
}
</script>
