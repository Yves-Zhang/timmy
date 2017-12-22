<template>
<div>
  <el-card class="box-card infusion-overview">
    <div slot="header" class="card-header">
      <div class="card-title"><i class="icon iconfont icon-icons_infusion_stati"></i> 输液量统计图</div>
    </div>
    <div class="filter-wrap">
      <el-form :inline="true" :model="queryParams" el.form.change="getData" class="demo-form-inline" ref="queryParams">
        <el-form-item>
          <el-select size="small" @change="getData" v-model="queryParams.deptCode" placeholder="病区">
            <el-option value="all" label="全部"></el-option>
            <el-option v-for="dept in $root.deptList" :key="dept.code" :label="dept.name" :value="dept.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-radio-group size="small" v-model="queryParams.statModel" @change="radioChange">
            <el-radio-button label="byHour">时</el-radio-button>
            <el-radio-button label="byDay">日</el-radio-button>
            <el-radio-button label="byWeek">周</el-radio-button>
            <el-radio-button label="byMonth">月</el-radio-button>
          </el-radio-group>
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

require('./index.scss');
const Highcharts = require('highcharts');

window.moment = moment;

export default {
  created() {
    this.getData(this.queryParams.statModel);
  },
  mounted() {

  },
  data() {
    const that = this;
    return {
      loading: false,
      queryParams: {
        deptCode: 'all',
        statModel: 'byMonth',
        startDate: moment(`${new Date().getFullYear()}/01/01`).format('YYYY/MM/DD'),
        endDate: moment(`${new Date().getFullYear()}/12/31`).format('YYYY/MM/DD')
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
    radioChange(){
      if(this.queryParams.statModel=='byDay'){
        this.queryParams.startDate = this.preDate(30);
        this.queryParams.endDate = moment(`${new Date()}`).format('YYYY/MM/DD');
      }else if(this.queryParams.statModel=='byMonth'){
        this.queryParams.startDate = moment(`${new Date().getFullYear()}/01/01`).format('YYYY/MM/DD');
        this.queryParams.endDate = moment(`${new Date().getFullYear()}/12/31`).format('YYYY/MM/DD');
      }else if(this.queryParams.statModel=='byHour'){
        this.queryParams.startDate = moment(`${new Date()}`).format('YYYY/MM/DD');
        this.queryParams.endDate = '';
      }else if(this.queryParams.statModel=='byWeek'){
        this.queryParams.startDate = moment(`${new Date()}`).year()+'/01'+'/01';
        this.queryParams.endDate = moment(`${new Date()}`).year()+'/12'+'/31';
      }
    },
    getData() {
      this.loading = true;
      const params = Object.assign({}, this.queryParams);

      switch (params.statModel) {
        case 'byHour':
          params.startDate = moment(params.startDate).format('YYYY/MM/DD');
          params.endDate = '';
          break;

        case 'byWeek':
          params.startDate = `${moment(params.endDate).year()}/01/01`;
          params.endDate = `${moment(params.endDate).year()}/12/31`;
          break;

        default:
          params.startDate = moment(params.startDate).format('YYYY/MM/DD');
          params.endDate = moment(params.endDate).format('YYYY/MM/DD');
          break;
      }

      return this.$http.get(`${CONST.PATH}/statInfusion`, {
          params,
        }).then(response => {
          if (response.body) {
            this.loading = false;
            this.data = response.body.data;
            this.infusionNum = response.body.data.total.infusion_ml_num;
            this.infusionBag = response.body.data.total.infusion_bag_num;
            this.drawChart();
          }
        })
        .catch(err => this.loading = false);
    },

    // [start]获取多少天（参数中设置）前的日期函数
      preDate(days){
        let date=moment().subtract(days, 'days')._d;
        return moment(date).format('YYYY/MM/DD');
      },
      // [end]获取多少天（参数中设置）前的日期函数  

    drawChart() {
      /**
       * 每个标注点最小大小为 MIN_SIZE；
       * 标注点超过 容器宽度 / MIN_SIZE时，宽度加大
       */
      let totalCapacity = [];
      let totalBag = [];
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
      let key = '';
      let keyStr = '';

      let startI = 1;

      const months = moment(this.queryParams.endDate).diff(moment(this.queryParams.startDate), 'months');
      const startMonth = moment(this.queryParams.startDate).month() + 1;

      switch (this.queryParams.statModel) {
        case 'byMonth':
          i = months + startMonth;
          startI = startMonth;
          key = 'month_in_year';
          keyStr = '月';
          break;

        case 'byWeek':
          i = WEEK_OF_YEAR;
          startI = 1;
          key = 'week_in_year';
          keyStr = '周';
          break;

        case 'byHour':
          i = HOUR_OF_DAY;
          startI = 1;
          key = 'stat_hour';
          keyStr = 'h';
          break;

        default:
          key = 'natural_stat_date';
          startI = 1;
          break;
      }

      if (this.queryParams.statModel !== 'byDay') {
        for (let _i = startI; _i <= i; _i += 1) {

          let xNum = _i;

          if (this.queryParams.statModel === 'byMonth') {
            xNum = _i % 12;

            if (xNum === 0) {
              xNum = xNum + 12;
            }
          }

          categories.push(`${xNum}${keyStr}`);
          totalBag.push(0);
          totalCapacity.push(0);
        }
      }

      data.forEach(item => {
        if (this.queryParams.statModel === 'byDay' && typeof item.natural_stat_date !== 'undefined') {
          categories.push(item.natural_stat_date.substr(0, 10));
          totalBag.push(item.infusion_bag_num);
          totalCapacity.push(item.infusion_ml_num);
        } else if (typeof item[key] !== 'undefined') {
          const existIndex = _.findIndex(categories, cate => parseInt(cate.replace('月'), 10) === parseInt(item[key], 10));
          totalCapacity[existIndex] = item.infusion_ml_num;
          totalBag[existIndex] = item.infusion_bag_num;
        }
      });

      // 使用highcharts
      this.chart = Highcharts.chart(_chartContainer, {
        chart: {
          type: 'spline',
          zoomType: 'xy'
        },
        title: {
          text: '输液ml数与输液袋数统计',
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
        yAxis: [{
          title: {
            text: 'ml'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }],
          floor: 0
          // opposite: true
        }, {
          title: {
            text: '袋数'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }],
          floor: 0,
          opposite: true
        }],
        tooltip: {
          formatter() {
            if (this.series.index == 0) {
              return [
                '<b>',
                this.series.name,
                ': ',
                (_this.infusionNum !== 0 ? this.y : 0) + 'ml',
                '</b><br/>',
                this.x,
                ': ',
                (_this.infusionNum != 0 ? (this.y / _this.infusionNum * 100).toFixed(2) : 0) + '%'
              ].join('');
            } else if (this.series.index == 1) {
              return [
                '<b>',
                this.series.name,
                ': ',
                (_this.infusionBag != 0 ? this.y : 0) + '袋',
                '</b><br/>',
                this.x,
                ': ',
                (_this.infusionBag != 0 ? (this.y / _this.infusionBag * 100).toFixed(2) : 0) + '%'
              ].join('');
            }
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
              enabled: true
            },
            enableMouseTracking: true
          }
        },
        series: [{
          index: 123,
          name: '输液量',
          data: totalCapacity,
          color: '#5eb104',
          dataLabels: {
            color: '#5eb104',
            style: {
              textShadow: false
            }
          }
        }, {
          index: 246,
          name: '输液袋数',
          data: totalBag,
          color: '#00CCFF',
          dataLabels: {
            color: '#00CCFF',
            style: {
              textShadow: false
            }
          },
          yAxis: 1
        }]
      });
    }
  }
}
</script>
