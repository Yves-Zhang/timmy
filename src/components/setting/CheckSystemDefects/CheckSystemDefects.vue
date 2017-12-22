<template>
  <div>
    <el-card class="box-card infusion-overview">
      <div slot="header" class="card-header">
        <div class="card-title"><i class="fa fa-users"></i> 系统缺陷检查</div>
      </div>
      <div>
        <el-tabs type="card" @tab-click="getData" element-loading-text="正在加载...">
          <el-tab-pane label="误报率较高的设备" name="Equipment">
            <div class="filter-wrap">
              <el-form :inline="true" :model="queryParams" el.form.change="getData" class="demo-form-inline" ref="queryParams">
                <el-form-item>
                  <el-select size="small" @change="getData" v-model="wardCode" placeholder="科室" v-if="equipment">
                    <el-option value="" label="全部"></el-option>
                    <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-date-picker class="small-picker" :editable="false" style="width: 120px" size="small" type="date" placeholder="添加起始时间" v-model="startTime"></el-date-picker>
                </el-form-item>
                <el-form-item>
                  <el-date-picker class="small-picker" :editable="false" style="width: 120px" size="small" type="date" placeholder="添加添加结束时间" v-model="endTime"></el-date-picker>
                </el-form-item>
                <el-form-item style="width: 160px" v-if="equipment">
                  <el-input inline class="inline-input" size="small" placeholder="mac地址、床号检索" v-model="filter">
                  </el-input>
                </el-form-item>
                <el-form-item style="width: 160px">
                  <el-select size="small" v-model="mistakeNumber" filterable placeholder="误报次数" allow-create>
                    <el-option 
                      v-for="item in mistakeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item> 
                <el-button size="small" type="primary" @click="getData">查询</el-button>
              </el-form>
            </div>
            <div class="card-content" v-loading="loading" element-loading-text="正在加载..." style="overflow: hidden;">
              <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
                <el-table-column type="index" label="序号" width="120">
                </el-table-column>
                <el-table-column prop="bedCode" label="床号" width="120">
                </el-table-column>
                <el-table-column prop="deptCode" label="科室号" width="120">
                </el-table-column>
                <el-table-column prop="deptName" label="科室名称" width="120">
                </el-table-column>
                <el-table-column prop="macAddress" label="MAC地址" width="180">
                </el-table-column>
                <el-table-column prop="ealyCounts" label="报警偏早次数">
                </el-table-column>
                <el-table-column prop="lateCounts" label="报警偏晚此数">
                </el-table-column>
                <el-table-column prop="totalCounts" label="误报总次" width="120">
                </el-table-column>
              </el-table>
              <div class="table-pagination">
                <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
                </el-pagination>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="误报率较高的规格" name="specifications">
            <div class="filter-wrap">
              <el-form :inline="true" :model="queryParams" el.form.change="getData" class="demo-form-inline" ref="queryParams">
                <el-form-item>
                  <el-select size="small" @change="getData" v-model="wardCode" placeholder="科室">
                    <el-option value="" label="全部"></el-option>
                    <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-date-picker class="small-picker" :editable="false" style="width: 120px" size="small" type="date" placeholder="添加起始时间" v-model="startTime"></el-date-picker>
                </el-form-item>
                <el-form-item>
                  <el-date-picker class="small-picker" :editable="false" style="width: 120px" size="small" type="date" placeholder="添加添加结束时间" v-model="endTime"></el-date-picker>
                </el-form-item>
                <el-form-item style="width: 160px">
                  <el-select size="small" v-model="mistakeNumber" filterable placeholder="误报次数" allow-create>
                    <el-option 
                      v-for="item in mistakeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item> 
                <el-button size="small" type="primary" @click="getData">查询</el-button>
              </el-form>
            </div>
            <div class="card-content" v-loading="loading" element-loading-text="正在加载..." style="overflow: hidden;">
              <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
                <el-table-column type="index" label="序号" width="80">
                </el-table-column>
                <el-table-column prop="spec_capacity" label="规格" width="80">
                </el-table-column>
                <el-table-column prop="material" label="材质" width="80">
                </el-table-column>
                <el-table-column prop="tare" label="皮重" width="80">
                </el-table-column>
                <el-table-column prop="spec_weight" label="液体净重" width="120">
                </el-table-column>
                <el-table-column prop="total_weight" label="毛重">
                </el-table-column>
                <el-table-column prop="total_from" label="重量下限">
                </el-table-column>
                <el-table-column prop="total_to" label="重量上限" width="80">
                </el-table-column>
                <el-table-column prop="deptCode" label="科室号" width="80">
                </el-table-column>
                <el-table-column prop="deptName" label="科室名称" width="80">
                </el-table-column>
                <el-table-column prop="earlyCounts" label="偏早次数" width="80">
                </el-table-column>
                <el-table-column prop="lateCounts" label="偏晚次数" width="80">
                </el-table-column>
                <el-table-column prop="totalCounts" label="误报总计">
                </el-table-column>
              </el-table>
              <div class="table-pagination">
                <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
                </el-pagination>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="异常蓝桥设备" name="bridge">
            <div class="filter-wrap">
              <el-form :inline="true" :model="queryParams" el.form.change="getData" class="demo-form-inline" ref="queryParams">
                <el-form-item>
                  <el-select size="small" @change="getData" v-model="wardCode" placeholder="科室">
                    <el-option value="" label="全部"></el-option>
                    <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-date-picker class="small-picker" :editable="false" style="width: 120px" size="small" type="date" placeholder="添加起始时间" v-model="startTime"></el-date-picker>
                </el-form-item>
                <el-form-item>
                  <el-date-picker class="small-picker" :editable="false" style="width: 120px" size="small" type="date" placeholder="添加添加结束时间" v-model="endTime"></el-date-picker>
                </el-form-item> 
                <el-button size="small" type="primary" @click="getData">查询</el-button>
              </el-form>
            </div>
            <div class="card-content" v-loading="loading" element-loading-text="正在加载..." style="overflow: hidden;">
              <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
                <el-table-column type="index" label="序号" width="50">
                </el-table-column>
                <el-table-column prop="flyOverDevAddress" label="蓝桥mac" width="120">
                </el-table-column>
                <el-table-column prop="flyOverDevModel" label="设备类型" width="100">
                </el-table-column>
                <el-table-column prop="flyOverStatus" label="设备状态" width="100">
                </el-table-column>
                <el-table-column prop="flyOverVersion" label="版本">
                </el-table-column>
                <el-table-column prop="room" label="房间号"  width="100">
                </el-table-column>
                <el-table-column prop="offLineCounts" label="离线次数" width="100">
                </el-table-column>
                <el-table-column prop="deptCode" label="科室号" width="100">
                </el-table-column>
                <el-table-column prop="deptName" label="科室名称" width="140">
                </el-table-column>
                <el-table-column prop="flyoverRssi" label="最近rssi" width="100">
                </el-table-column>
              </el-table>
              <div class="table-pagination">
                <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
                </el-pagination>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
    </div>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';
import * as CONST from '../../../const';
import auth from '../../../auth/';
import moment from 'moment';


export default {
  created() {
    this.loading = true;
    this.getData();
  },
  computed: {
    filterdList() {
      const _this = this;
      return _.chunk(this.equipmentList.filter(item => {
        if (!_this.filter) {
          return true;
        }
        return item.bedCode.indexOf(_this.filter) > -1 || item.macAddress.indexOf(_this.filter) > -1;
      }), _this.perPageSize);
    },
    resultSize() {
      let len = 0;
      this.filterdList.forEach(item => len += item.length);
      return len;
    }
  },
  data() {
    const authResult = auth.getToken();
    return {
      mistakeOptions: [{
          value: '0',
          label: '0'
        }, {
          value: '5',
          label: '5'
        }, {
          value: '10',
          label: '10'
        }, {
          value: '20',
          label: '20'
        }],
      wardCode:'',
      subUrl:'getFalsePositivesDevices',
      equipment:true,
      filter:null,
      perPageSize: 10,
      currentPage: 1,
      startTime:moment(this.startTime).format('YYYY-MM-DD'),
      endTime:moment(this.endTime).format('YYYY-MM-DD'),
      mistakeNumber:null,
      equipmentList:[]
    }
  },
  methods: {
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    getData(tab, event) {
      var _this=this;
      if(tab){
        switch (tab.name){
          case 'Equipment':
            _this.subUrl='getFalsePositivesDevices';
            _this.equipment=true;
            break;
          case 'specifications':
            _this.subUrl='getFalsePositivesBags';
            _this.equipment=false;
            _this.filter=null;
            break;
          case 'bridge':
            _this.subUrl='getExceptionBlueBridgeInfo';
            _this.equipment=true;
            _this.filter=null;
            break;
          default:
            break;
          }
        }
      var params={
            deptCode:this.wardCode,
            startTime:moment(this.startTime).format('YYYY-MM-DD'),
            endTime:moment(this.endTime).format('YYYY-MM-DD'),
            compareLevel:this.mistakeNumber?this.mistakeNumber:5
          }
      if(_this.subUrl=='getExceptionBlueBridgeInfo'){
        delete params.compareLevel;
      }
      this.loading = true;
      return this.$http.get(`${CONST.PATH}/${this.subUrl}`,{
        params:params
      })
      .then(response => {
        this.loading = false;
        this.equipmentList=response.body.data;
      })
      .catch(() => this.loading = false);
    }
  }
}
</script>
