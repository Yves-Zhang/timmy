<template>
<div>
  <el-card class="box-card infusion-overview">
    <div slot="header" class="card-header">
      <div class="card-title"><i class="icon iconfont icon-icons_infusion_stati"></i> 全院输液统计图</div>
    </div>
    <div class="filter-wrap">
      <el-form :inline="true" :model="queryParams" el.form.change="getData" class="demo-form-inline" ref="queryParams">
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
        <div class="chart-container-1" style="margin-top: 10px;margin-bottom: 10px">
        </div>
        <div class="chart-container-2" style="margin-top: 10px;margin-bottom: 10px">
        </div>
        <div class="chart-container-3" style="margin-top: 10px;margin-bottom: 10px">
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
      loading: false,
      queryParams: {
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
      return this.$http.get(`${CONST.PATH}/statInfusionInfosByDept`, {
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
      let infusionBagNum = [];
      let presskeyTotal = [];

      let presskeyRateCategories = [];
      let scanbarcodeRateCategories = [];
      let accuracyRateCategories = [];
      let infusionBagNumCategories = [];

      let seriesArry={
         totalInfusion:[],
         totalInfusionTotal:[],
         keyPassRate:[],
         keyPassRateTotal:[],
         scanCodeRate:[],
         scanCodeRateTotal:[],
         alarmRate:[],
         alarmRateTotal:[]
      };




      const data = this.data.list.slice();
      const _this = this;
      const _chartWrap = document.querySelector('.chart-wrap');
      const _chartContainer = document.querySelector('.chart-container');
      const _chartContainer_1 = document.querySelector('.chart-container-1');
      const _chartContainer_2 = document.querySelector('.chart-container-2');
      const _chartContainer_3 = document.querySelector('.chart-container-3');
      


      const MIN_SIZE = 3;
      const MAX_LENGTH = _chartWrap.clientWidth / MIN_SIZE;
      const width = data.length >= MAX_LENGTH ? MIN_SIZE * data.length : _chartWrap.clientWidth;
      _chartContainer.style.width = `${width}px`;
      _chartContainer_1.style.width = `${width}px`;
      _chartContainer_2.style.width = `${width}px`;
      _chartContainer_3.style.width = `${width}px`;

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

      //[start]字符串转数字
      data.forEach(item => {
        item.infusion_bag_num=parseFloat(item.infusion_bag_num);
        item.presskey_rate=parseFloat(item.presskey_rate);
        item.scanbarcode_rate=parseFloat(item.scanbarcode_rate);
        item.accuracy_rate=parseFloat(item.accuracy_rate);
      });
      //[end]字符串转数字

      // [start]对每个图标进行排序
      let presskeyRateData = _.sortBy(data,'presskey_rate').reverse();
      let scanbarcodeRateData = _.sortBy(data,'scanbarcode_rate').reverse();
      let accuracyRateData = _.sortBy(data,'accuracy_rate').reverse();
      // [end]对每个图标进行排序

      presskeyRateData.forEach(item=>{
        presskeyRateCategories.push(item.dept_name);
        seriesArry.keyPassRate.push(item.presskey_rate);
        seriesArry.keyPassRateTotal.push(item.infusion_bag_num);

      });
      scanbarcodeRateData.forEach(item=>{
        scanbarcodeRateCategories.push(item.dept_name);
        seriesArry.scanCodeRate.push(item.scanbarcode_rate);
        seriesArry.scanCodeRateTotal.push(item.infusion_bag_num);

      });
      accuracyRateData.forEach(item=>{
        accuracyRateCategories.push(item.dept_name);
        seriesArry.alarmRate.push(item.accuracy_rate);
        seriesArry.alarmRateTotal.push(item.infusion_bag_num);
      });

      data.forEach(item => {
        infusionBagNumCategories.push(item.dept_name); 
        seriesArry.totalInfusion.push(item.infusion_bag_num);
      });
  



      let charts=[
        {
          ele:_chartContainer,
          categories:infusionBagNumCategories,
          data:[{data:seriesArry.totalInfusion,name:'输液总量'}],
          name:'输液总量',
          unit:'袋',
          min:null,
          total:seriesArry.totalInfusionTotal
        },{
          ele:_chartContainer_1,
          categories:presskeyRateCategories,
          data:[{data:seriesArry.keyPassRate,name:'按键比率'}],
          name:'按键比率',
          unit:'%',
          min:null,
          total:seriesArry.keyPassRateTotal
        },{
          ele:_chartContainer_2,
          categories:scanbarcodeRateCategories,
          data:[{data:seriesArry.scanCodeRate,name:'扫码应用比率'}],
          name:'扫码应用比率',
          unit:'%',
          min:null,
          total:seriesArry.scanCodeRateTotal
        },{
          ele:_chartContainer_3,
          categories:accuracyRateCategories,
          data:[{data:seriesArry.alarmRate,name:'报警准确率'}],
          name:'报警准确率',
          unit:'%',
          min:'60',
          total:seriesArry.alarmRateTotal
        }
      ]


      charts.forEach(item => {
        let _this = this;
        // 使用highcharts
        this.chart = Highcharts.chart(item.ele, {
          chart: {
            type: 'column',
            zoomType: 'xy',
            borderColor:'#C0CCDA',
            borderWidth:1,
            borderRadius:'4px'
          },
          title: {
            text: item.name,
            style:{
              'fontWeight':'bold'
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
            categories: item.categories,
          },
          yAxis: [
          {
            max:item.unit=='%'?'100':null,
            min:item.min,
            title: {
              text: item.unit
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
            formatter() {
              if(item.name=='输液总量'){
                return [
                  '<b>',
                  this.x,
                  '</b>',
                  '<br/>',
                  this.series.name,
                  ':',
                  this.y,
                  item.unit
                ].join(''); 
              }else{
                return [
                  '<b>',
                  this.x,
                  '</b>',
                  '<br/>',
                  this.series.name,
                  ':',
                  this.y,
                  item.unit,
                  '<br/>',
                  '输液总量:',
                  item.total[this.point.index]
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
                enabled: false
              },
              enableMouseTracking: true
            }
          },
          series: item.data
        });
      })
    }
  }
}
</script>
