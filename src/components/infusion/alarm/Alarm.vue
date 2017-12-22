<template>
  <div>
    <el-card class="box-card infusion-overview">
      <div slot="header" class="card-header">
        <div class="card-title"><i class="icon iconfont icon-icons_alarm_informat"></i> 报警信息</div>
      </div>
      <div class="filter-wrap">
        <el-form :inline="true" :model="queryParams" class="demo-form-inline" ref="queryParams">
          <el-form-item v-if="isAdmin">
            <el-select size="small" v-model="queryParams.deptCode" placeholder="病区">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code" :key="dept.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-date-picker class="small-picker" :editable="false" style="width: 120px" size="small" type="date" placeholder="选择日期" v-model="queryParams.startDate"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-date-picker class="small-picker" :editable="false" style="width: 120px" size="small" type="date" placeholder="结束时间" v-model="queryParams.endDate"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-input size="small" v-model="filterBed" placeholder="床号"></el-input>
          </el-form-item>
          <el-form-item style="width: 90px">
            <el-select size="small" @change="getQueryData" v-model="queryParams.alarmStatus" placeholder="状态">
              <el-option value="" label="全部"></el-option>
              <el-option label="未处理" value="0"></el-option>
              <el-option label="已处理" value="1"></el-option>
              <el-option label="已忽略" value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-button size="small" type="primary" @click="getQueryData">查询</el-button>
        </el-form>
      </div>
      <div class="card-content" v-loading.body="loading" element-loading-text="正在加载...">
        <el-table :data="filterdList[currentPage - 1]" @sort-change="sortChange" stripe border style="width: 100%">
          <el-table-column type="index" label="序号" width="50">
          </el-table-column>
          <el-table-column prop="alarmTime" label="报警时间" sortable>
          </el-table-column>
          <el-table-column prop="deptName" label="病区">
          </el-table-column>
          <el-table-column prop="bedCode" label="床号">
          </el-table-column>
          <el-table-column prop="alarmTypeText" label="报警类型">
          </el-table-column>
          <el-table-column prop="alarmContent" label="报警内容">
          </el-table-column>
          <el-table-column prop="statusText" label="状态" inline-template >
            <el-tag :type="row.tagType" close-transition>{{row.statusText}}</el-tag>
          </el-table-column>
          <el-table-column prop="operPersonName" label="操作人">
          </el-table-column>
          <el-table-column prop="operTime" label="操作时间" sortable>
          </el-table-column>
        </el-table>
        <div class="table-pagination">
          <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
          </el-pagination>
        </div>
      </div>
    </el-card>


  <el-card class="box-card">
    <div slot="header" class="card-header">
      <div class="card-title">滴速统计</div>
    </div>
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="grid-content">
          滴速过快时长：{{infusionStatistics.durationOfInfusionFast?infusionStatistics.durationOfInfusionFast:'--'}}分钟
        </div>
      </el-col>
      <el-col :span="12">
        <div class="grid-content">
          滴速过慢时长：{{infusionStatistics.durationOfInfusionSlow?infusionStatistics.durationOfInfusionSlow:'--'}}分钟
        </div>
      </el-col>
      <el-col :span="12">
        <div class="grid-content">
          滴速过快次数：{{infusionStatistics.timeOfInfusionFast?infusionStatistics.timeOfInfusionFast:'--'}}次
        </div>
      </el-col>
      <el-col :span="12">
        <div class="grid-content">
          滴速过慢次数：{{infusionStatistics.timeOfInfusionSlow?infusionStatistics.timeOfInfusionSlow:'--'}}次
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
  DatePicker
} from 'element-ui';

import {sortChange} from '../../../common/sortChange';

Vue.component(DatePicker.name, DatePicker);

export default {
  created() {
    this.loading = true;
    this.getQueryData();
  },
  computed: {
    // 过滤后的列表
    filterdList() {
      const _this = this;
      var afterFilter = this.data.list.filter(item => {
        if(!_this.filterBed){
          return true;
        }
        return item.bedCode.indexOf(_this.filterBed) > -1;
      })

      // 计算统计后的数值
      let durationOfInfusionFast = 0;
      let durationOfInfusionSlow = 0;
      let timeOfInfusionFast = 0;
      let timeOfInfusionSlow = 0;
      afterFilter.forEach(item => {
        if(item.alarmContent == '滴速过高'){
          timeOfInfusionFast++;
        }else if(item.alarmContent=='滴速过低'){
          timeOfInfusionSlow++;
        }
      })
      _this.infusionStatistics.timeOfInfusionFast = timeOfInfusionFast;
      _this.infusionStatistics.timeOfInfusionSlow = timeOfInfusionSlow;
      _this.infusionStatistics.durationOfInfusionFast = _this.infusionStatistics.timeOfInfusionFast*5;
      _this.infusionStatistics.durationOfInfusionSlow = _this.infusionStatistics.timeOfInfusionSlow*5;
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
    return {
      infusionStatistics:{
        durationOfInfusionFast:0,
        durationOfInfusionSlow:0,
        timeOfInfusionFast:null,
        timeOfInfusionSlow:null
      },
      isAdmin,
      loading: false,
      queryParams: {
        deptCode: isAdmin ? '' : auth.getToken().deptList[0].code,
        alarmStatus: '',
        startDate: moment(),
        endDate: moment()
      },
      filterBed: null,
      list: [],
      data: {
        list: []
      },
      details: [],
      perPageSize: 10,
      currentPage: 1
    }
  },
  methods: {
    getQueryData() {
      this.loading = true;
      return this.$http.get(`${CONST.PATH}/getInfusionAlarms`, {
        params: Object.assign(this.queryParams, {
          startDate: moment(this.queryParams.startDate).format('YYYY-MM-DD'),
          endDate: moment(this.queryParams.endDate).format('YYYY-MM-DD')
        })
      }).then(response => {
        this.loading = false;
        this.data = response.body.data;
        this.data.list = this.transformData(response.body.data.list);
        this.list = _.chunk(this.data.list, this.perPageSize);
      });
    },
    transformData(data) {
      return data.map(item => {
        const itemTemp = Object.assign({}, item);
        switch (item.alarmStatus) {
          case '1':
            itemTemp.tagType = 'success';
            itemTemp.statusText = '已处理';
            break;
          case '2':
            itemTemp.tagType = 'gray';
            itemTemp.statusText = '已忽略';
            break;
          default:
            itemTemp.tagType = 'danger';
            itemTemp.statusText = '未处理';
            break;
        }

        switch (item.alarmType) {
          case 'REST_TIME':
            itemTemp.alarmTypeText = '时间';
            break;
          case 'REST_CAP':
            itemTemp.alarmTypeText = '液量';
            break;
          default:
            itemTemp.alarmTypeText = '滴速';
            break;
        }

        return itemTemp;
      });
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    loadDetail(bagId) {
      this.$http.get(`${CONST.PATH}/getInfusionAlarms`, {
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
    sortChange(obj) {
      if (obj.order) {
        this.list = sortChange(this.data.list, obj.prop, obj.order, this.perPageSize);
      }
    }
  }
}
</script>
