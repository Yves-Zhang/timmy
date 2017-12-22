<template>
<div>
  <el-card class="box-card infusion-overview">
    <div slot="header" class="card-header">
      <div class="card-title"><i class="icon iconfont icon-icons_blue_manage"></i> 蓝桥管理</div>
      <div class="fr">
        <el-button type="danger" size="mini" style="margin-right: 20px;" @click="() => confirmDelete('all')"><i class="el-icon-delete"></i>删除无效蓝桥</el-button>
        蓝桥LED灯开关：
        <el-switch v-model="isBridgeLedOn" @change="setBridgeLed" on-text="开" off-text="关" on-color="#13ce66" off-color="#999">
        </el-switch>
      </div>
    </div>
    <div class="filter-wrap">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline" ref="queryParams">
        <el-form-item>
          <el-select size="small" @change="getData" v-model="queryParams.deptCode" placeholder="病区">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code" :key="dept.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="width: 240px">
          <el-input inline class="inline-input" size="small" placeholder="mac地址、房间号、ip地址检索" v-model="filterText">
          </el-input>
        </el-form-item>
        <el-form-item style="width: 120px">
          <el-select size="small" v-model="statusText" placeholder="绑定状态">
            <el-option value="" label="全部"></el-option>
            <el-option label="离线" value="离线"></el-option>
            <el-option label="长期离线" value="长期离线"></el-option>
            <el-option label="在线" value="在线"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="card-content" v-loading.body="loading" element-loading-text="正在加载...">
      <el-table :data="list[currentPage - 1]" @sort-change="sortChange" stripe border style="width: 100%">
        <el-table-column type="index" label="序号" width="40">
        </el-table-column>
        <el-table-column prop="deptName" label="所属病区" width="120">
        </el-table-column>
        <el-table-column prop="flyOverDevModel" label="型号" width="100">
        </el-table-column>
        <el-table-column prop="flyOverDevNum" label="设备号" width="100">
        </el-table-column>
        <el-table-column prop="flyOverDevAddress" label="物理地址" width="120">
        </el-table-column>
        <el-table-column prop="room" label="房间号" sortable width="80">
        </el-table-column>
        <el-table-column prop="ipAddress" label="ip地址" sortable width="120">
        </el-table-column>
        <el-table-column prop="flyOverVersion" label="版本" width="230" sortable>
        </el-table-column>
        <el-table-column prop="statusText" label="状态" inline-template width="80">
          <el-tag :type="row.tagType" close-transition>{{row.statusText}}</el-tag>
        </el-table-column>
        <el-table-column :context="_self" inline-template label="操作">
          <span>
              <el-button type="text" size="small" @click="() => loadDetail(row.flyOverDevAddress)">详情</el-button>
              <el-button type="text" size="small" @click="() => openSetting(row)">设置</el-button>
              <el-button type="danger" size="mini" @click="() => confirmDelete(row.flyOverDevAddress)"><i class="el-icon-delete"></i> 删除</el-button>
            </span>
        </el-table-column>
      </el-table>
      <div class="table-pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
        </el-pagination>
      </div>
    </div>
  </el-card>
  <el-dialog title="监测器" v-model="detailVisible" style="min-width: 1200px">
    <el-table border stripe :data="details" v-loading.body="loadingDetail" element-loading-text="正在加载...">
      <el-table-column type="index" label="序号" width="50"></el-table-column>
      <el-table-column prop="macAddress" label="设备地址" width="140">
      </el-table-column>
      <el-table-column prop="deviceName" label="设备名称" width="140">
      </el-table-column>
      <el-table-column prop="deviceSn" label="设备号" width="100">
      </el-table-column>
      <el-table-column prop="deviceModel" label="型号" width="100">
      </el-table-column>
      <el-table-column prop="restKwh" label="电量" width="60" inline-template>
        <span v-battery="row.restKwh"></span>
      </el-table-column>
      <el-table-column prop="deviceVersion" label="版本" width="50">
      </el-table-column>
      <el-table-column prop="statusText" label="状态" inline-template>
        <el-tag :type="row.tagType" close-transition>{{row.statusText}}</el-tag>
      </el-table-column>
      <el-table-column prop="deptName" label="病区" width="100">
      </el-table-column>
      <el-table-column prop="bedCode" label="床号" width="60">
      </el-table-column>
    </el-table>
  </el-dialog>
  <!-- 设置 -->
  <el-dialog title="蓝桥设置" size="tiny" v-model="settingVisible" style="min-width: 1200px">
    <el-form :model="settingForm" ref="settingForm" :rules="rules" label-width="120px">
      <el-form-item label="房号" style="width: 280px;" prop="room">
        <el-input size="small" :maxlength="12" name="room" v-model="settingForm.room"></el-input>
      </el-form-item>
      <el-form-item label="设备号" style="width: 280px;" prop="flyOverDevNum">
        <el-input size="small" :maxlength="20" name="flyOverDevNum" v-model="settingForm.flyOverDevNum"></el-input>
      </el-form-item>
      <el-form-item label="病区" prop="deptCode" style="width: 280px;">
        <el-select size="small" name="deptCode" v-model="settingForm.deptCode" placeholder="病区">
          <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code" :key="dept.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="MAC地址" style="width: 280px;" prop="flyOverDevAddress">
        <el-input size="small" name="flyOverDevAddress" v-model="settingForm.flyOverDevAddress"></el-input>
      </el-form-item>
      <el-form-item label="ip地址" style="width: 280px;" prop="ipAddress">
        <el-input size="small" name="ipAddress" v-model="settingForm.ipAddress"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="settingVisible = false">取消</el-button>
      <el-button size="small" type="primary" :disabled="savingSetting" @click="saveSetting">{{savingSetting ? '正在保存...' : '保存'}}</el-button>
    </div>
  </el-dialog>

  <!-- 删除 -->
  <el-dialog title="警告" size="tiny" v-model="deleteVisible" @close="beforCancel">
    <i class="el-icon-information text-warning"></i> {{isAll?'本次操作会删除所有未绑定房间和病区的蓝桥，是否确认?':'确定删除？'}}
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancel">取消</el-button>
      <el-button size="small" type="danger" @click="del">确定</el-button>
    </div>
  </el-dialog>
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

import {
  sortChange
} from '@/common/sortChange';

export default {
  created() {
    this.loading = true;
    this.getData();
    this.getLedStatus();
  },
  watch: {
    filterText(val) {
      this.list = _.chunk(this.data.list.filter(item => {
        if (!val) {
          return true;
        }
        if (item.flyOverDevAddress && item.flyOverDevAddress.toLowerCase().indexOf(val.toLowerCase().trim()) > -1
          || (item.room && item.room.toString().indexOf(val.trim()) > -1)
          || (item.ipAddress && item.ipAddress.indexOf(val.trim()) > -1)
        ) {
          return true;
        }
      }), this.perPageSize);
    },
    statusText(val) {
      this.list = _.chunk(this.data.list.filter(item => {
        if (!val) {
          return true;
        }
        if (item.statusText === val) {
          return true;
        }
      }), this.perPageSize);
    },
  },
  computed: {
    // 过滤后的列表
    filterdList() {
      const _this = this;
      return _.chunk(this.data.list.filter(item => {
        return true;
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
    return {
      loadingDetail:false,
      savingSetting:false,
      isAll:false,
      deleteId:null,
      deleteVisible: false,
      loading: false,
      queryParams: {
        deptCode: ''
      },
      list: [],
      data: {
        list: []
      },
      details: [],
      perPageSize: 10,
      currentPage: 1,
      filterText: '',
      statusText: '',
      detailVisible: false,

      settingVisible: false,
      settingForm: {
        deptCode: ''
      },

      isBridgeLedOn: true,

      rules: {
        room: [{
          required: true,
          message: '请填写房号',
          trigger: 'change'
        }],
        deptCode: [{
          required: true,
          message: '请选择科室',
          trigger: 'change'
        }],
        flyOverDevNum: [{
          required: true,
          message: '请填写设备号',
          trigger: 'change'
        }],
        ipAddress: [{
          validator: (rule, value, callback) => {
            const isValid = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value);
            if (!isValid && !!value) {
              callback(new Error('不是合理的ip地址，请确认！'));
            }
            callback();
          },
          trigger: 'change'
        }],
        flyOverDevAddress: [{
          required: true,
          message: '请填写mac地址',
          trigger: 'change'
        }]
      }
    }
  },
  methods: {
    getData() {
      this.loading = true;
      return this.$http.get(`${CONST.PATH}/getBlueBridges`, {
        params: this.queryParams
      }).then(response => {
        this.loading = false;
        this.data = response.body.data;
        this.data.list = this.transformData(response.body.data.list);
        this.list = _.chunk(this.data.list, this.perPageSize);
      });
    },

    getLedStatus() {
      return this.$http.get(`${CONST.PATH}/getInfusionSysConfigInfoByIdAndOwner`, {
        params: {
          configId: 'blueBridgeLedSwitch',
          configOwner: 'DEFAULT'
        }
      }).then(response => {
        if (response.body) {
          this.bridgeLed = response.body.data;
          this.isBridgeLedOn = response.body.data.configValue === '1';
        }
      });
    },
    transformData(data) {
      return data.map(item => {
        const itemTemp = Object.assign({}, item);
        if (typeof item.deviceLnk === 'undefined') {
          switch (item.flyOverStatus) {
            case 1:
              itemTemp.tagType = 'success';
              itemTemp.statusText = '在线';
              break;
            case 0:
              itemTemp.tagType = 'danger';
              itemTemp.statusText = '离线';
              break;
            case -1:
              itemTemp.tagType = 'danger';
              itemTemp.statusText = '长期离线';
              break;
            default:
              itemTemp.tagType = 'gray';
              itemTemp.statusText = '--';
              break;
          }
        } else {
          switch (item.deviceLnk) {
            case '1':
              itemTemp.tagType = 'success';
              itemTemp.statusText = '在线';
              break;
            default:
              itemTemp.tagType = 'danger';
              itemTemp.statusText = '离线';
              break;
              // default:
              //   itemTemp.tagType = 'gray';
              //   itemTemp.statusText = '--';
              //   break;
          }
        }
        itemTemp.room = item.room && parseInt(item.room);

        return itemTemp;
      });
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    loadDetail(flyOverDevAddress) {
      this.loadingDetail = true;
      this.$http.get(`${CONST.PATH}/getInfusionDevices`, {
        params: {
          keyType: 'FL',
          keyword: flyOverDevAddress
        }
      }).then(response => {
        if (response) {
          this.details = this.transformData(response.body.data.list);
          this.detailVisible = true;
        }
        this.loadingDetail = false;
      }).catch(error => this.loadingDetail = false);
    },
    openSetting(row) {
      this.settingForm = Object.assign({
        deptCode: '',
        ipAddress: null
      }, row);
      if(this.settingForm.room){
        this.settingForm.room = this.settingForm.room.toString();
      }
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
          this.$http.post(`${CONST.PATH}/updateBlubridge`, this.settingForm, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;'
            },
            emulateJSON: true
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
    },

    setBridgeLed() {
      const data = Object.assign(this.bridgeLed, {
        configValue: this.isBridgeLedOn ? '1' : '0'
      });

      this.$http.post(`${CONST.PATH}/updateInfusionSysConfigInfo`, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;'
        },
        emulateJSON: true
      }).then(response => {
        if (!response.body) {
          this.isBridgeLed = !this.isBridgeLedOn;
        } else {
          Message({
            type: 'success',
            message: this.isBridgeLedOn ? '已开启！' : '已关闭！'
          });
        }
      }).catch(() => {
        this.isBridgeLedOn = !this.isBridgeLedOn;
      });
    },

    sortChange(obj) {
      if (obj.order) {
        this.list = sortChange(this.data.list, obj.prop, obj.order, this.perPageSize);
      }
    },

    confirmDelete(id) {
      if(id=='all'){
        this.isAll=true;
      }
      this.deleteVisible = true;
      this.deleteId = id;
    },

    beforCancel(){
      let _this=this;
      setTimeout(function(){
        _this.isAll = false;
      },500)
    },

    cancel(){
      let _this=this;
      this.deleteVisible = false;
      setTimeout(function(){
        _this.isAll = false;
      },500)
    },
    del(){
      this.isAll=false;
      if(this.deleteId=='all'){
        this.$http.get(`${CONST.PATH}/delInvalidBlueBridgeList`,{

        })
        .then(response=>{
          this.getData();
          console.log(response)
        })
        .catch(error=>{
          console.log(error)
        })
      }else{
        this.$http.get(`${CONST.PATH}/delBlueBridgeByMac?macAddress=${this.deleteId}`,{
        })
        .then(response=>{
          this.getData();
          console.log(response)
        })
        .catch(error=>{
          console.log(error)
        })
        console.log(this.deleteId)
      }
      this.deleteVisible = false;
    }

  }
}
</script>
