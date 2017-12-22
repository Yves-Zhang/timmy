<template>
<div>
  <el-card class="box-card infusion-overview">
    <div slot="header" class="card-header">
      <div class="card-title"><i class="icon iconfont icon-icons_monitor_manage"></i> 监测器管理</div>
      <!-- <el-button class="fr" type="danger" size="mini" @click="resetConfirmVisible = true"><i class="fa fa-warning"></i> 所有设备恢复默认设置</el-button> -->
    </div>
    <div class="filter-wrap">
      <el-form :inline="true" :model="queryParams" el.form.change="getData" class="demo-form-inline" ref="queryParams">
        <el-form-item v-if="isAdmin">
          <el-select size="small" @change="getData" v-model="queryParams.keyword" placeholder="病区">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker class="small-picker" :editable="false" style="width: 120px" size="small" type="date" placeholder="添加时间" v-model="filterParams.addTime"></el-date-picker>
        </el-form-item>
        <el-form-item style="width: 120px">
          <el-select size="small" v-model="filterParams.filterBindType" placeholder="绑定状态">
            <el-option value="" label="全部"></el-option>
            <el-option label="未绑定" value="未绑定"></el-option>
            <el-option label="床位" value="床位"></el-option>
            <el-option label="患者" value="患者"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="width: 160px">
          <el-input inline class="inline-input" size="small" placeholder="mac地址、床号检索" v-model="filterParams.text">
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="card-content" v-loading.body="loading" element-loading-text="正在加载...">
      <el-table :data="list[currentPage - 1]" @sort-change="sortChange" stripe border style="width: 100%">
        <el-table-column type="index" label="序号" width="50">
        </el-table-column>
        <el-table-column prop="deviceName" sortable label="设备名称" width="120">
        </el-table-column>
        <el-table-column prop="deviceModel" label="型号" width="80">
        </el-table-column>
        <el-table-column prop="deviceSn" label="设备号" width="100">
        </el-table-column>
        <el-table-column prop="macAddress" sortable label="MAC地址" width="120">
        </el-table-column>
        <el-table-column prop="deptName" sortable label="病区">
        </el-table-column>
        <el-table-column prop="bindTypeText" label="绑定方式" inline-template>
          <el-tag :type="row.tagType" close-transition>{{row.bindTypeText}}</el-tag>
        </el-table-column>
        <el-table-column prop="bindTarget" label="绑定对象"></el-table-column>
        <el-table-column prop="restKwh" sortable label="电量" width="60" inline-template>
          <span v-battery="row.restKwh"></span>
        </el-table-column>
        <el-table-column prop="deviceVersion" sortable label="版本" width="60"></el-table-column>
        <el-table-column prop="flyOverDevRoom" sortable label="房间号" width="80"></el-table-column>
        <el-table-column prop="flyOverDevAddress" label="连接蓝桥" width="120"></el-table-column>
        <el-table-column prop="createTime" label="添加时间" sortable width="120"></el-table-column>
        <el-table-column fixed="right" prop="deviceLnk" label="状态" sortable inline-template width="90">
          <el-tag :type="row.tagLink" close-transition>{{row.linkText}}</el-tag>
        </el-table-column>

        <el-table-column :context="_self" inline-template label="操作" fixed="right" width="180">
          <span>
            <!-- <el-button type="text" size="small" @click="() => openSetting(row)">设置</el-button> -->
            <el-button type="text" size="small" v-if="!row.bindTarget" @click="() => openBinding(row)">绑定</el-button>
            <el-button type="text" size="small" v-if="!!row.bindTarget" @click="() => doUnbind(row)">解除绑定</el-button>
            <el-button type="text" size="small" @click="() => showWeight(row)">查看重量</el-button>
            <el-button type="danger" size="mini" @click="() => confirmDelete(row.macAddress)">删除</el-button>
            </span>
        </el-table-column>
      </el-table>
      <div class="table-pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
        </el-pagination>
      </div>
    </div>
  </el-card>
  <!-- 重量 -->
  <el-dialog title="重量" size="tiny" @close="closeWeight" v-model="weightVisible" style="min-width: 1200px">
    <el-form label-width="120px">
      <el-form-item label="床位" style="width: 280px;" prop="room">
        <el-input size="small" readonly v-model="weightInfo.bedCode"></el-input>
      </el-form-item>
      <el-form-item label="MAC地址" style="width: 280px;" prop="btAddress">
        <el-input size="small" readonly v-model="weightInfo.btAddress"></el-input>
      </el-form-item>
      <el-form-item label="实时重量" style="width: 220px;">
          <el-input size="small" type="number" readonly name="total_weight" v-model="weightInfo.weight">
            <template slot="append">g</template>
          </el-input>
        </el-form-item>
      <el-form-item label="发送时间" style="width: 280px;" prop="flyOverDevAddress">
        <el-input size="small" readonly v-model="weightInfo.sedTime"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeWeight">关闭</el-button>
    </div>
  </el-dialog>

  <!-- 绑定 -->
  <el-dialog title="设备绑定" size="tiny" v-model="bindingVisible" style="min-width: 1200px">
    <el-form :model="editForm" :rules="rules.editForm" ref="editForm" label-width="120px">
      <el-form-item label="mac地址" prop="macAddress" style="width: 280px;">
        <el-input :readonly="true" name="macAddress" size="small" v-model="editForm.macAddress"></el-input>
      </el-form-item>
      <el-form-item label="病区" prop="deptCode" style="width: 280px;">
        <el-select size="small" name="deptCode" v-model="editForm.deptCode" placeholder="病区">
          <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="床号" prop="bedCode" style="width: 200px;">
        <el-select size="small" name="bedCode" v-model="editForm.bedCode" placeholder="床号">
          <el-option v-for="bedCode in activeBedList" :label="bedCode" :value="bedCode"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="bindingVisible = false">取消</el-button>
      <el-button size="small" type="primary" :disabled="savingBind" @click="saveBind">{{savingBind ? '正在绑定...' : '绑定'}}</el-button>
    </div>
  </el-dialog>
  <!-- 删除 -->
  <el-dialog title="警告" size="tiny" v-model="deleteVisible">
    <i class="el-icon-information text-warning"></i> 确定删除设备？
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="deleteVisible = false">取消</el-button>
      <el-button size="small" type="danger" @click="() => deleteDev(macAddress)">确定</el-button>
    </div>
  </el-dialog>
  <!-- 重置 -->
  <!-- <el-dialog title="警告" size="tiny" v-model="resetConfirmVisible">
    <i class="fa fa-warning text-danger"></i> 此操作将会使所有设备恢复默认设置，请确认！
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="resetConfirmVisible = false">取消</el-button>
      <el-button size="small" type="danger" @click="reset">确定</el-button>
    </div>
  </el-dialog> -->
  <!-- 解绑 -->
  <el-dialog title="警告" size="tiny" v-model="unbindConfirmVisible">
    <i class="fa fa-warning text-danger"></i> 确定解绑该设备吗？
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="unbindConfirmVisible = false">取消</el-button>
      <el-button size="small" type="danger" @click="() => unbind(activeRow.macAddress)">确定</el-button>
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
  Message,
  DatePicker
} from 'element-ui';

import {
  sortChange
} from '@/common/sortChange';

Vue.component(DatePicker.name, DatePicker);

export default {
  created() {
    this.loading = true;
    this.getData();
    this.getBedList();
  },
  computed: {
    // 过滤后的列表
    filteredList() {
      const _this = this;
      return _.chunk(this.data.list.filter(item => {
        if (!_this.addTime) {
          return true;
        }

        if (!_this.bindType) {
          return true;
        }

        if (item.createTime && item.createTime.indexOf(_this.addTime) > -1) {
          return true;
        }
        if (item.bindTypeText === _this.bindType) {
          return true;
        }
      }), _this.perPageSize);
    },
    // 过滤后的条目数
    resultSize() {
      let len = 0;

      this.list.forEach(item => len += item.length);

      return len;
    }
  },
  data() {
    const isAdmin = auth.getToken().user.isadmin === '1';
    const _this = this;
    return {
      isAdmin,
      loading: false,
      queryParams: {
        keyword: isAdmin ? '' : auth.getToken().deptList[0].code,
        keyType: 'DC'
      },
      list: [],
      data: {
        list: []
      },
      details: [],
      perPageSize: 10,
      currentPage: 1,
      addTime: '',
      filterBindType: null,
      filterText: null,
      settingVisible: false,
      weightVisible: false,
      deleteVisible: false,
      bindingVisible: false,

      filterParams: {
        addTime: null,
        filterBindType: '',
        text: ''
      },

      weightTimeId: null,

      rules: {
        editForm: {
          macAddress: [{
            required: true,
            message: '请填写mac地址'
          }],
          bedCode: [{
            required: true,
            message: '请选择绑定床号'
          }],
          deptCode: [{
            required: true,
            message: '请选择病区'
          }]
        },
        settingForm: {
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
      },

      editForm: {
        seqId: '',
        macAddress: '',
        deptCode: '',
        isNewDev: null,
        bedCode: ''
      },
      savingBind: false,
      settingForm: {
        alarmSwitch: false
      },
      weightInfo: {},
      savingSetting: false,
      settingLoading: false,
      activeBedList: [],
      activeRow: {},

      unbinding: false,
      resetConfirmVisible: false,
      unbindConfirmVisible: false
    }
  },
  watch: {
    filterParams: {
      handler(value) {
        this.list = _.chunk(this.data.list.filter(item => {
          if (!value) {
            return true;
          }
          if ((item.bindTypeText === value.filterBindType || !value.filterBindType)
            && (item.createTime === moment(value.addTime).format('YYYY-MM-DD') || !value.addTime)
            && (item.macAddress && item.macAddress.toLowerCase().indexOf(value.text.toLowerCase().trim()) > -1 || (item.bindTarget && item.bindTarget.indexOf(value.text.trim()) > -1))) {
            return true;
          }
        }), this.perPageSize);
      },
      deep: true,
    },

    'editForm.deptCode': {
      handler(val) {
        if (val) {
          const found = _.find(this.bedList, {
            code: val
          });

          if (found) {
            this.activeBedList = found.bedLstFormat;

            if (this.activeBedList.indexOf(this.editForm.bedCode) === -1) {
              this.editForm.bedCode = '';
            }
          }
        }
      },
      deep: true
    },
  },
  methods: {
    getData() {
      this.loading = true;
      this.filterParams.text = '';
      this.filterParams.addTime = '';
      this.filterParams.filterBindType = '';

      return this.$http.get(`${CONST.PATH}/getInfusionDevices`, {
        params: this.queryParams
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
        switch (item.bindType) {
          case 'DB':
            itemTemp.tagType = 'primary';
            itemTemp.bindTypeText = '床位';
            itemTemp.bindTarget = item.bedCode;
            break;
          case 'DP':
            itemTemp.tagType = 'info';
            itemTemp.bindTypeText = '患者';
            itemTemp.bindTarget = item.patName;
            break;
          default:
            itemTemp.tagType = 'gray';
            itemTemp.bindTarget = '';
            itemTemp.bindTypeText = '未绑定';
            break;
        }
        switch (item.deviceLnk) {
          case '1':
            itemTemp.tagLink = 'success';
            itemTemp.linkText = '在线';
            break;

          case '-1':
            itemTemp.tagLink = 'danger';
            itemTemp.linkText = '离线';
            break;

          case '0':
            itemTemp.tagLink = 'danger';
            itemTemp.linkText = '被动离线';
            break;

          default:
            itemTemp.tagLink = 'gray';
            itemTemp.linkText = '--';
            break;
        }

        return itemTemp;
      });
    },
    openSetting(row) {
      this.activeRow = row;
      this.settingVisible = true;
      this.settingLoading = true;
      this.getDevSetting(row.macAddress).then(() => {
        this.settingVisible = true;
        this.settingLoading = false;
      }).catch(err => this.settingLoading = false);
    },
    showWeight(row) {
      this.activeRow = row;
      this.weightVisible = true;
      this.getInfusionRedisDetailByMac(row.macAddress);
      this.weightTimeId = setInterval(() => {
        this.getInfusionRedisDetailByMac(row.macAddress);
      }, 2000);
    },
    closeWeight() {
      this.weightVisible = false;
      clearInterval(this.weightTimeId);
    },
    confirmDelete(macAddress) {
      this.deleteVisible = true;
      this.deleteMacAddress = macAddress;
    },
    openBinding(row) {
      this.editForm.deptCode = row.deptCode || '';
      this.editForm.bedCode = row.bedCode || '';
      this.editForm.macAddress = row.macAddress || '';
      this.editForm.seqId = row.seqId || '';
      this.editForm.isNewDev = 0;
      this.bindingVisible = true;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    getBedList() {
      this.$http.get(`${CONST.PATH}/getInfusionDepts`).then(response => {
        if (response) {
          // debugger; // eslint-disable-line no-debugger, no-restricted-syntax
          this.bedList = response.data.data.list;
        }
      });
    },
    doUnbind(row) {
      this.activeRow = row;
      this.unbindConfirmVisible = true;
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
        this.unbindConfirmVisible = false;
        this.unbinding = false;
        if (response) {
          Message({
            message: response.body.msg || '解绑成功！',
            type: 'success'
          });

          this.activeRow.bindType = null;
          this.getData();
        }
      });
    },
    saveBind() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.savingBind = true;
          this.$http.post(`${CONST.PATH}/saveInfusionDevice`, {
            itemDevice: JSON.stringify(this.editForm)
          }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;'
            },
            emulateJSON: true
          }).then(response => {
            this.savingBind = false;
            if (response.body) {
              Message({
                message: response.body.msg,
                type: 'success'
              });
              this.bindingVisible = false;
              this.getData();
            }
          });
        } else {
          return false;
        }
      });
    },
    // reset() {
    //   this.$http.get(`${CONST.PATH}/resetAllDeviceSetInfos`, {
    //     params: {
    //       deptCode: auth.getToken().deptList[0].code
    //     }
    //   }).then(response => {
    //     if (response.body) {
    //       Message({
    //         message: response.body.msg || '已重置！',
    //         type: 'success'
    //       });
    //
    //       this.resetConfirmVisible = false;
    //       this.getData();
    //     }
    //   });
    // },
    // saveSetting() {
    //   this.$refs.settingForm.validate((valid) => {
    //     if (valid) {
    //       const _formData = Object.assign({}, this.settingForm);
    //       this.savingSetting = true;
    //       _formData.macAddress = this.activeRow.macAddress;
    //       _formData.alarmSwitch = _formData.alarmSwitch ? '1' : '0';
    //       this.$http.post(`${CONST.PATH}/saveInfusionDeviceSetInfo`, {
    //         itemDeviceSet: JSON.stringify(_formData)
    //       }, {
    //         headers: {
    //           'Content-Type': 'application/x-www-form-urlencoded;'
    //         },
    //         emulateJSON: true
    //       }).then(response => {
    //         if (response) {
    //           Message({
    //             message: response.body.msg || '已保存设置！',
    //             type: 'success'
    //           });
    //           this.settingVisible = false;
    //           this.getData();
    //           this.savingSetting = false;
    //         }
    //       });
    //     } else {
    //       return false;
    //     }
    //   });
    // },
    deleteDev() {
      this.$http.post(`${CONST.PATH}/delDevice`, {
        macAddress: this.deleteMacAddress
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;'
        },
        emulateJSON: true
      }).then(response => {
        if (response) {
          Message({
            message: response.body.msg || '已删除设备！',
            type: 'success'
          });
          this.deleteVisible = false;
          this.getData();
        }
      });
    },
    getInfusionRedisDetailByMac(macAddress) {
      this.weightInfo = {};
      return this.$http.get(`${CONST.PATH}/getInfusionRedisDataByMac`, {
        params: {
          mac: macAddress
        }
      }).then(({ body = {} }) => {
        if (body && body.data) {
          const { data } = body;
          const dataItem = JSON.parse(data[data.length - 1]);
          this.weightInfo = _.assign({
            bedCode: this.activeRow.bedCode,
            sedTime: moment(dataItem.dateTime).format('YYYY-MM-DD HH:mm:ss')
          }, dataItem);
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

    sortChange(obj) {
      if (obj.order) {
        this.list = sortChange(this.data.list, obj.prop, obj.order, this.perPageSize);
      }
    }
  }
}
</script>
