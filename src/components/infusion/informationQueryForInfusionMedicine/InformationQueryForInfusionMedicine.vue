<template>
<div>
  <el-card class="box-card infusion-overview">
    <div slot="header" class="card-header">
      <div class="card-title"><i class="icon iconfont icon-icons_infusion_searc"></i> 输液用药信息查询</div>
    </div>
    <div class="filter-wrap">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline" ref="queryParams">
        <el-form-item v-if="isAdmin">
          <el-select size="small" v-model="queryParams.deptCode" placeholder="病区">
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
          <el-input size="small" v-model="drugName" placeholder="药物名称(必填)"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input size="small" v-model="filterBed" placeholder="床号或住院号过滤"></el-input>
        </el-form-item>
        <el-button :plain="true" size="small" type="primary" @click="getQueryData">查询</el-button>
      </el-form>
    </div>
    <div class="card-content" v-loading.body="loading" element-loading-text="正在加载...">
      <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
        <el-table-column type="index" label="序号" width="40">
        </el-table-column>
        <el-table-column prop="deptName" label="病区">
        </el-table-column>
        <el-table-column prop="bedCode" label="床号"  sortable>
        </el-table-column>
        <el-table-column prop="patientHospno" label="住院号" width="120" sortable>
        </el-table-column>
        <el-table-column prop="patientName" label="病人姓名">
        </el-table-column>
        <el-table-column prop="drugName" label="药物名称" width="120" sortable>
        </el-table-column>
        <el-table-column prop="frequency" label="频次" width="80">
        </el-table-column>
        <el-table-column prop="orderBarcode" label="瓶签条码" width="120">
        </el-table-column>
        <el-table-column prop="beginTime" label="开始时间" sortable width="160">
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" sortable width="160">
        </el-table-column>
        <el-table-column prop="specCapacity" label="规格(ml)" width="120" sortable>
        </el-table-column>
        <el-table-column prop="material" label="材质" width="80" sortable>
        </el-table-column>
        <el-table-column prop="avgDropspeed" label="平均滴速(滴/分)" width="140" sortable>
        </el-table-column>
        <el-table-column prop="infusionDuration" label="持续时长(分钟)" width="120">
        </el-table-column>
        <el-table-column :context="_self" inline-template label="操作" fixed="right" width="80">
          <span>
              <el-tooltip class="item" effect="dark" content="查看详情" placement="top" style="margin-right: 10px;">
                <el-button type="text" size="small" @click="() => showDetail(row.drugName,row.infusionBagId)"><i class="fa fa-file-text-o"></i></el-button>
              </el-tooltip>
            </span>
        </el-table-column>
      </el-table>
      <div class="table-pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
        </el-pagination>
      </div>
    </div>
  </el-card>

  <el-card class="box-card">
    <el-tabs type="card" v-model="cardName">
      <el-tab-pane label="输液统计" name="totalOfInfusion">
        <el-row :gutter="20">
          <el-col :span="24">
            <div class="grid-content">
              总平均滴速：{{data.AvgDropspeedTotal?total.AvgDropspeedTotal:'--'}}滴/分
            </div>
          </el-col>
          <el-col :span="4">
            <div class="grid-content">
              总输液量：{{data.InfusionCapacityTotal?total.InfusionCapacityTotal:'--'}}ml
            </div>
          </el-col>
          <el-col :span="4">
            <div class="grid-content">
              总输液时长：{{data.InfusionDurationTotal?total.InfusionDurationTotal:'--'}}分钟
            </div>
          </el-col>
        </el-row> 
      </el-tab-pane>
      <el-tab-pane label="体征详情" name="detailOfSign">
        <div class="radioBox" v-show="mapShow">
          <div class="radio_type">
            <el-radio-group v-model="trackType" size="small" @change="drawChart">
              <el-radio-button label="dropSpeed">滴速</el-radio-button>
              <el-radio-button label="infusionCapcity">药量</el-radio-button>
            </el-radio-group>
          </div>
          <div class="radio_content">    
            <el-radio-group v-model="mapPamars.vitalType" size="small" @change="getMapData">
              <el-radio-button label="temperature">体温</el-radio-button>
              <el-radio-button label="bloodPress">血压</el-radio-button>
              <el-radio-button label="pulse">脉搏</el-radio-button>
              <el-radio-button label="breath">呼吸</el-radio-button>
              <el-radio-button label="heartRate">心率</el-radio-button>
              <el-radio-button label="oxygenSaturation">血氧浓度</el-radio-button>
              <el-radio-button label="painLevel">疼痛程度</el-radio-button>
            </el-radio-group> 
          </div>
        </div>
        <div class="card-content" v-loading.body="chartloading" element-loading-text="正在加载..." style="min-height: 80px;padding-top: 20px;">
          <div class="chart-wrap">
            <div class="chart-container">

            </div>
          </div>
        </div>
      </el-tab-pane> 
    </el-tabs> 
        
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
  Tooltip,
  Message
} from 'element-ui';

require('./index.scss');

const Highcharts = require('highcharts');

Vue.component(DatePicker.name, DatePicker);
Vue.component(Tooltip.name, Tooltip);

export default {
  created() {
    // this.loading = true;
    this.queryParams.startTime=this.preDate(7); 
    // this.getQueryData();
    
  },
  computed: {
    // 过滤后的列表
    filterdList() {
      const _this = this;
      var afterFilter = this.data.list.filter(item => {
        let regBed = new RegExp('^'+item.bedCode+'$');
        let regHos = new RegExp('^'+item.patientHospno+'$');

        if (!_this.filterBed) {
          return true;
        }
        return regBed.test(_this.filterBed) || regHos.test(_this.filterBed);
      });
      
      // 计算总量数据
      let AvgDropspeedTotal = 0;
      let InfusionCapacityTotal = 0;
      let InfusionDurationTotal = 0;
      let count = 0;

      afterFilter.forEach(item => {
        count += 1;
        AvgDropspeedTotal += item.avgDropspeed;
        InfusionCapacityTotal += item.specCapacity;
        InfusionDurationTotal += item.infusionDuration;
      });
      _this.total.AvgDropspeedTotal = Math.floor(AvgDropspeedTotal / count);
      _this.total.InfusionCapacityTotal = InfusionCapacityTotal; 
      _this.total.InfusionDurationTotal = InfusionDurationTotal; 

      return _.chunk(afterFilter, _this.perPageSize);
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
      detailData:null,
      cardName:"totalOfInfusion",
      chartList:null,
      chartloading:false,
      mapShow:false,
      trackType:"dropSpeed",
      mapPamars:{
        infusionBagId:null,
        drugName:null,
        vitalType:"temperature"
      },
      total:{
        AvgDropspeedTotal:0,
        InfusionCapacityTotal:0,
        InfusionDurationTotal:0
      },
      drugName:null,
      isAdmin,
      loading: false,
      queryParams: {
        deptCode: isAdmin ? '' : auth.getToken().deptList[0].code,
        startTime: '',
        endTime: moment(),
        infusionStatus: ''
      },
      list: [],
      data: {
        list: []
      },
      allDepsStatData: [],
      details: [],
      perPageSize: 10,
      currentPage: 1,
      filterBed: null,
      endTimeOptions: {
        disabledDate(time) {
          return time.getTime() > new Date(that.queryParams.startTime).getTime() + 180 * 24 * 3600 * 1000 || time.getTime() < new Date(that.queryParams.startTime).getTime();
        }
      },

      startTimeOptions: {
        disabledDate(time) {
          return time.getTime() < new Date(that.queryParams.endTime).getTime() - 180 * 24 * 3600 * 1000 || time.getTime() > new Date(that.queryParams.endTime).getTime();
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
    getQueryData() {
      if(this.drugName==null){
        Message.error('药物名称必填');
        return  false;
      }
      this.loading = true;
      const params = _.assign({}, this.queryParams, {
        startTime: moment(this.queryParams.startTime).format('YYYY/MM/DD'),
        endTime: moment(this.queryParams.endTime).format('YYYY/MM/DD'),
        drugName:this.drugName
      });
      delete params.infusionStatus;
      return this.$http.post(`${CONST.PATH}/getInfusionBagsByDrug`, {
        item:JSON.stringify(params)
      },{
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;'
        },
        emulateJSON: true
      }).then(response => {
        this.loading = false;
        const alarm = response.body.data;
        this.data = alarm;
        this.list = _.chunk(this.data.list, this.perPageSize);
      }).catch(error => {
        Message.error(error);
      });
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    showDetail(drugName,infusionBagId){
      this.mapPamars.drugName = drugName;
      this.mapPamars.infusionBagId = infusionBagId;
      console.log(this.mapPamars)
      this.getMapData();
    },
    getMapData(){
      this.cardName = "detailOfSign";
      this.mapShow = true;
      this.chartloading = true;
      this.$http.post(`${CONST.PATH}/getInfusionPerbagTrackInfo`,this.mapPamars,{
        headers:{
          'Content-Type':'application/x-www-form-urlencoded;'
        },
        emulateJSON:true
      }).then(response => {
        this.chartloading = false;
        this.detailData = response.body.data;
        this.drawChart();
      }).catch(error => {
        console.log(error)
      })
    },
    drawChart(){
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


      var trackTypeList = [];
      var vitalTypeList = [];
      var vitalTypeList_1 = [];

      var option = {};
      var trackTypeUnit = this.detailData.trackList[0].infusionUnit;
      var vitalTypeUnit = this.detailData.signList[0].viatlSignsUnit;

      this.detailData.signList.forEach(item =>{
        var arry_1 = [];
        var arry = [];
        var time = item.createTime+28800000;
        if(_this.mapPamars.vitalType=="bloodPress" && item.viatlSignsValuesAdditional){
          arry_1[0] = time;
          arry_1[1] = parseFloat(item.viatlSignsValuesAdditional);
          vitalTypeList_1.push(arry_1);
        }
        arry[0] = time;
        arry[1] = parseFloat(item.viatlSignsValues)
        vitalTypeList.push(arry);
      });

      this.detailData.trackList.forEach(item =>{
        var arry = [];
        var time = item.createTime+28800000;
        arry[0] = time;
        switch(_this.trackType){
          case "dropSpeed" :
            arry[1] = item.dropSpeed;
            break;
          case "infusionCapcity" :
            arry[1] = item.infusionDrugWeight;
            break;
          default:
            break;
        }
        trackTypeList.push(arry);
      })

      option =  {
        chart: {
          type: 'spline',
          zoomType: 'xy'
        },
        title: {
          text: '详情图',
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
          type: 'datetime'
        },
        yAxis: [{
          title: {
            text: null
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
            text: null
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
          name: null,
          data: trackTypeList,
          color: '#5eb104',
          dataLabels: {
            color: '#5eb104',
            style: {
              textShadow: false
            }
          }
        }, {
          name: null,
          data: vitalTypeList,
          color: '#00CCFF',
          dataLabels: {
            color: '#00CCFF',
            style: {
              textShadow: false
            }
          },
          yAxis: 1
        }]
      };

      option.yAxis[1].title.text = vitalTypeUnit;


      switch (_this.trackType) {
        case "dropSpeed" :
          option.series[0].name = "滴速";
          option.yAxis[0].title.text = "滴/分";
          break;
        case "infusionCapcity" :
          option.series[0].name = "输液量";
          option.yAxis[0].title.text = "ml";
          break;
        default:
          break;
      };
      switch (_this.mapPamars.vitalType) {
        case "temperature" :
          option.series[1].name = "体温";      
          break;
        case "bloodPress" :
          option.series[1].name = "收缩压";
          option.series[2] = {
            name: '舒张压',
            data: vitalTypeList_1,
            color: '#8883D5',
            dataLabels: {
              color: '#8883D5',
              style: {
                textShadow: false
              }
            },
            yAxis: 1
          };
          console.log(option)
          break;
        case "pulse" :
          option.series[1].name = "脉搏";
          break;
        case "breath" :
          option.series[1].name = "呼吸";
          break;
        case "heartRate" :
          option.series[1].name = "心率";
          break;
        case "oxygenSaturation" :
          option.series[1].name = "血氧含量";
          break;
        case "painLevel" :
          option.series[1].name = "疼痛程度";
          break;
        default:
          break;
      };

      this.chart = Highcharts.chart(_chartContainer,option);
    }
  }
}
</script>
