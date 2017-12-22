<template>
<div>
  <el-card class="box-card infusion-overview">
    <div slot="header" class="card-header">
      <div class="card-title"><i class="icon iconfont icon-icons_infusion_stati"></i> 设备使用统计图</div>
    </div>
    <div class="filter-wrap">
      <el-form :inline="true" :model="queryParams" el.form.change="getData" class="demo-form-inline" ref="queryParams">
        <el-form-item>
          <el-select size="small" v-model="queryParams.deptCode" placeholder="病区">
            <el-option v-for="dept in $root.deptList" :key="dept.code" :label="dept.name" :value="dept.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-show="queryParams.statModel === 'byHour'">
          <el-date-picker class="small-picker" :editable="false" style="width: 120px" size="small" type="date" placeholder="起始时间" v-model="queryParams.startDate"></el-date-picker>
        </el-form-item>
        <el-form-item v-show="queryParams.statModel === 'byWeek'">
          <el-date-picker class="small-picker" :editable="false" style="width: 120px" size="small" type="year" placeholder="选择年份" v-model="queryParams.endDate"></el-date-picker>
        </el-form-item>
        <el-form-item v-show="['byDay', 'byMonth'].indexOf(queryParams.statModel) >= 0">
          <el-date-picker class="small-picker" :editable="false" :clearable="false" :picker-options="startTimeOptions" style="width: 120px" size="small" type="date" placeholder="选择日期" v-model="queryParams.startDate"></el-date-picker>
        </el-form-item>
        <el-form-item v-show="['byDay', 'byMonth'].indexOf(queryParams.statModel) >= 0">
          <el-date-picker class="small-picker" :editable="false" :clearable="false" :picker-options="endTimeOptions" style="width: 120px" size="small" type="date" placeholder="结束时间" v-model="queryParams.endDate"></el-date-picker>
        </el-form-item>
        <el-button size="small" type="primary" @click="getData">查询</el-button>
      </el-form>
    </div>
    <div class="card-content" v-loading.body="loading" element-loading-text="正在加载...">
      <div class="chart-wrap">
        <div class="chart-container">

        </div>
      </div>
    </div>
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
  Message
} from 'element-ui';

// require('./index.scss');
const Highcharts = require('highcharts');

window.moment = moment;

export default {
  created() {
    // [start]在生命周期created阶段调用preDate方法修改data中的值
    this.queryParams.startDate=this.preDate(7);
    // [end]在生命周期created阶段调用preDate方法修改data中的值
    this.getData();
  },
  mounted() {

  },
  data() {
    const that = this;
    const authResult = auth.getToken();
    return {
      wardCode:authResult.deptList[0].code,
      wardName:authResult.deptList[0].name,
      loading: false,
      queryParams: {
        deptCode: authResult.deptList[0].code,
        statModel: 'byDay',
        startDate: '',
        endDate: moment(`${new Date()}`).format('YYYY/MM/DD')
      },
      dateRange: [new Date(), new Date()],
      data: {},
      infusionNum: 0,
      infusionBag: 0,
      xAxis: {
        byHour: [],
        byMonth: [],
        byWeek: [],
        byDay: []
      },

      endTimeOptions: {
        disabledDate(time) {
          return time.getTime() > Number(moment(that.queryParams.startDate).add(1, 'years').format('x')) || time.getTime() < new Date(that.queryParams.startDate).getTime();
        }
      },

      startTimeOptions: {
        disabledDate(time) {
          return time.getTime() < Number(moment(that.queryParams.endDate).subtract(1, 'years').format('x')) || time.getTime() > new Date(that.queryParams.endDate).getTime();
        }
      },
    }
  },
  methods: {
    // [start]获取多少天（参数中设置）前的日期函数
    preDate(days){
      let date=moment().subtract(days, 'days')._d;
      return moment(date).format('YYYY/MM/DD');
    },
    // [end]获取多少天（参数中设置）前的日期函数
    

    getData() {
      this.loading = true;
      const params = Object.assign({}, this.queryParams);
      params.startDate = moment(params.startDate).format('YYYY/MM/DD');
      params.endDate = moment(params.endDate).format('YYYY/MM/DD');
      return this.$http.get(`${CONST.PATH}/statInfusionInfosByBedcode`, {
          params,
        }).then(response => {
          if (response.body) {
            this.loading = false;
            this.data = response.body.data;
            this.drawChart();
          }
        })
        .catch(err => this.loading = false);
    },

    drawChart() {
      /**
       * 每个标注点最小大小为 MIN_SIZE；
       * 标注点超过 容器宽度 / MIN_SIZE时，宽度加大
       */
      let accuracyRate = [];
      let presskeyRate = [];
      let categories = [];
      const data = this.data.list.slice();
      const _this = this;
      const _chartWrap = document.querySelector('.chart-wrap');
      const _chartContainer = document.querySelector('.chart-container');
      const MIN_SIZE = 3;
      const MAX_LENGTH = _chartWrap.clientWidth / MIN_SIZE;
      const width = data.length >= MAX_LENGTH ? MIN_SIZE * data.length : _chartWrap.clientWidth;
      _chartContainer.style.width = `${width}px`;

      // 创建x轴数据
      this.xAxis = {
        byHour: [],
        byMonth: [],
        byWeek: [],
        byDay: []
      };
      const lastDayOfYear = moment(new Date().getFullYear() + '-12-31');
      const WEEK_OF_YEAR = lastDayOfYear.isoWeeks();
      const MONTH_OF_YEAR = 12;
      const HOUR_OF_DAY = 24;
      let i = 0;
      let key = 'natural_stat_date';
      let keyStr = '';
      let startI = 1;

      data.forEach(item => {
          categories.push(item.bed_code+'床');
          accuracyRate.push(item.unpresskey_total);
          presskeyRate.push(item.presskey_total);
      });

      // 使用highcharts
      this.chart = Highcharts.chart(_chartContainer, {
        chart: {
          type: 'column',
          zoomType: 'xy'
        },
        title: {
          text: '病区设备使用统计',
          style:{
            'color':'#fff',
            'opacity':0
          }
        },
        legend: {
          align: 'right',
          verticalAlign: 'top',
          x: 0,
          y: 0,
          floating: true,
          borderWidth: 0,
          backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) ||
            '#FFFFFF'
        },
        xAxis: {
          categories
        },
        yAxis: [
        {
          title: {
            text: '次'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }],
          floor: 0
          // opposite: true
        }],
        tooltip: {
          // formatter() {
          //   if(this.series.index == 0){
          //     return [
          //       '<b>',
          //       this.series.name,
          //       ':',
          //       this.y,
          //       '%',
          //       '</b>',
          //       '<br/>',
          //       '使用总次数：',
          //       data[this.point.index].infusion_bag_num,
          //       '<br/>',
          //       '正确次数：',
          //       data[this.point.index].infusion_normal
          //     ].join('');
          //   }else if(this.series.index == 1){
          //     return [
          //       '<b>',
          //       this.series.name,
          //       ':',
          //       this.y,
          //       '%',
          //       '</b>',
          //       '<br/>',
          //       '使用总次数：',
          //       data[this.point.index].infusion_bag_num,
          //       '<br/>',
          //       '按键次数：',
          //       data[this.point.index].presskey_total
          //     ].join('');
          //   }
            
          // }
          formatter: function () {
                return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + this.y + '<br/>' +
                    '总量: ' + this.point.stackTotal;
            }
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
              enabled: false
            },
            enableMouseTracking: true
          },
          column: {
                stacking: 'normal'
            }
        },
        series: [
        {
          name: '按键次数',
          data: presskeyRate,
          color: '#86C0E5',
          stack: 'index'
        },
         {
          name: '未按键次数',
          data: accuracyRate,
          color: '#8883D5',
          stack: 'index'
        }
        ]
      });
    }
  }
}
</script>
