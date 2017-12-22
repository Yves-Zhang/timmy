<template>
<div>
  <el-card class="box-card infusion-overview">
    <div slot="header" class="card-header">
      <div class="card-title"><i class="fa fa-cogs"></i> 系统设置</div>
    </div>
    <div class="card-content" v-loading.body="loading" element-loading-text="正在加载...">
      <el-tabs type="card" @tab-click="getData" v-model="activeName">
        <el-tab-pane label="常用设置" name="default">
          <el-form ref="settingForm" :model="settingForm" :rules="rules.settingForm" label-width="120px">
            <div class="block-title">
              默认参数设置
              <el-button class="fr" type="danger" size="mini" @click="deleteDefaultVisible = true">删除病区默认报警参数</el-button>
            </div>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="滴速上限" prop="dropSpeedUpper" style="width: 200px;">
                  <el-input name="dropSpeedUpper" type="number" size="small" v-model="settingForm.dropSpeedUpper"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="滴速下限" prop="dropSpeedFloor" style="width: 200px;">
                  <el-input name="dropSpeedFloor" type="number" size="small" v-model="settingForm.dropSpeedFloor"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="显示紫色剩余液量" prop="restMlAlarm">
                  <el-switch v-model="settingForm.restMlAlarm" on-text="开" off-text="关" on-color="#bf9bf2" off-color="#999">
                  </el-switch>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="滴速异常变橙色" prop="dropSpeedAlarm">
                  <el-switch v-model="settingForm.dropSpeedAlarm" on-text="开" off-text="关" on-color="#f60" off-color="#999">
                  </el-switch>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="点滴系数：" style="width: 240px" prop="idc">
                  <el-select size="small" name="idc" v-model="settingForm.idc" placeholder="点滴系数">
                    <el-option label="10" :value="10"></el-option>
                    <el-option label="15" :value="15"></el-option>
                    <el-option label="20" :value="20"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <el-button type="primary" :disabled="saving" @click="saveSetting">{{saving ? '正在保存...' : '保存'}}</el-button>
            </el-form-item>
          </el-form>
          <el-form ref="tvForm" :rules="rules.tvForm" :model="tvForm" label-width="120px">
            <div class="block-title">
              大电视设置
            </div>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="床位范围">
                  <el-col :span="11">
                    <el-form-item prop="startBed">
                      <el-input inline type="number" class="inline-input" size="small" v-model="tvForm.startBed">
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col class="line" :span="2">
                    -
                  </el-col>
                  <el-col :span="11">
                    <el-form-item prop="endBed">
                      <el-input inline type="number" class="inline-input" size="small" v-model="tvForm.endBed">
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-form-item>

              </el-col>
              <el-col :span="8">
                <el-form-item label="每页个数" required prop="bottleCount" style="width: 200px;">
                  <el-input name="bottleCount" type="number" size="small" v-model="tvForm.bottleCount"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="显示列数" required prop="rowBottleNum" style="width: 200px;">
                  <el-input name="rowBottleNum" type="number"size="small" v-model="tvForm.rowBottleNum"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label=" 输液声音提醒" required prop="voiceAlarm" style="width: 240px;">
                  <el-select size="small" v-model="tvForm.voiceAlarm" placeholder="声音提醒">
                    <el-option label="静音" :value="0"></el-option>
                    <el-option label="提示音" :value="1"></el-option>
                    <el-option label="语音" :value="2"></el-option>
                  </el-select>
                </el-form-item>

              </el-col>
              <el-col :span="8">
                <el-form-item label="外部消息提醒" prop="message">
                  <el-switch v-model="tvForm.message" on-text="开" off-text="关" on-color="#13ce66" off-color="#999">
                  </el-switch>
                </el-form-item>
              </el-col>
              
            </el-row>
            <el-row>
              
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item label="显示全部" prop="isInfusion">
                  <el-switch v-model="tvForm.isInfusion" on-text="开" off-text="关" on-color="#13ce66" off-color="#999">
                  </el-switch>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="版本选择" prop="vision" style="width: 240px;">
                  <el-select v-model="tvForm.selectedVison" placeholder="请选择版本">
                    <el-option
                      v-for="item in visions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                      <span style="float: left">{{ item.label }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <el-button type="primary" @click="saveTv">打开电视链接</el-button>
            </el-form-item>
          </el-form>

        </el-tab-pane>
        <el-tab-pane label="参数管理" name="params" v-if="isAdmin">
          <div class="block-title">
            <el-button class="fr" type="primary" size="mini" @click="add"><i class="fa fa-plus"></i> 新增参数</el-button>
          </div>
          <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
            <el-table-column prop="configId" label="参数名称" width="320">
            </el-table-column>
            <el-table-column prop="configValue" label="参数值" width="100">
            </el-table-column>
            <el-table-column prop="configOwner" label="所属科室" width="160" inline-template>
              <span>
                {{this.getDeptName(row.configOwner)}}
              </span>
            </el-table-column>
            <el-table-column prop="configDesc" label="描述" width="320">
            </el-table-column>
            <el-table-column :context="_self" inline-template label="操作">
              <span>
                 <!--  <el-button type="text" size="small" @click="() => openEdit(row)" v-if="row.configId !== 'blueBridgeLedSwitch'"><i class="el-icon-edit"></i> 编辑</el-button> -->
                 <el-button type="text" size="small" @click="() => openEdit(row)"><i class="el-icon-edit"></i> 编辑</el-button>
                  <el-button type="danger" size="mini" @click="() => confirmDelete(row.seqId)" v-if="row.configId !== 'blueBridgeLedSwitch' && row.configType!=='F'"><i class="el-icon-delete"></i>删除</el-button>
                </span>
            </el-table-column>
          </el-table>
          <div class="table-pagination">
            <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="系统信息" name="info">
                <el-table :data="versionInfo" style="width: 100%">
                    <el-table-column prop="infusionMajorVersion" width="160" label="应用服务器版本">
                    </el-table-column>
                    <el-table-column prop="infusionChildVersion" width="160" label="内部版本">
                    </el-table-column>
                    <el-table-column prop="infusionReleaseDate" width="160" label="日期">
                    </el-table-column>
                    <el-table-column prop="blueBrdgeVesion" label="蓝桥服务器版本">
                    </el-table-column>
                </el-table>
        </el-tab-pane>
      </el-tabs>

      <el-dialog title="编辑参数信息" size="tiny" v-model="editVisible" @close="closeCallBack" style="min-width: 1200px">
        <el-form :model="editForm" ref="editForm" :rules="rules.editForm" label-width="120px">
          
          <el-form-item label="名称" prop="configId">
              <el-col :span="12">
                <el-select size="small" name="configId" v-model="editForm.configId" placeholder="请选择参数名称" v-if="!able">
                  <el-option label="纯滴管重量" value="infusionDropperWeight"></el-option>
                  <el-option label="滴管+滴管中液体" value="infusionDropperLiquid"></el-option>
                </el-select>
                <el-select size="small" name="configId" v-model="editForm.configId" placeholder="请选择参数名称" v-if="able" disabled>
                  <el-option label="纯滴管重量" value="infusionDropperWeight"></el-option>
                  <el-option label="滴管+滴管中液体" value="infusionDropperLiquid"></el-option>
                </el-select>
              </el-col>
          </el-form-item>
          
          <el-form-item label="值" prop="configValue">
            <el-col :span="12">
              <el-input type="number" size="small" name="configValue" v-model="editForm.configValue"></el-input>
            </el-col>
          </el-form-item>

          <el-form-item label="所在病区" prop="configOwner">
            <el-col :span="12">
              <el-select size="small" name="configOwner" v-model="editForm.configOwner" placeholder="请选择病区" disabled v-if="able">
                <el-option label="全院" value="DEFAULT"></el-option>
                <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code"></el-option>
              </el-select>
              <el-select size="small" name="configOwner" v-model="editForm.configOwner" placeholder="请选择病区" v-if="!able">
                <el-option label="全院" value="DEFAULT"></el-option>
                <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code"></el-option>
              </el-select>
            </el-col>
          </el-form-item>

          <el-form-item label="描述" prop="configDesc">
            <el-col :span="12">
              <el-input type="textarea" size="small" name="configDesc" v-model="editForm.configDesc"></el-input>
            </el-col>
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" @click="editVisible = false">取消</el-button>
          <el-button size="small" type="primary" :disabled="savingEdit" @click="saveEdit">{{savingEdit ? '正在保存...' : '保存'}}</el-button>
        </div>
      </el-dialog>
      <!-- 删除 -->
      <el-dialog title="警告" size="tiny" v-model="deleteDefaultVisible">
        <i class="fa fa-warning text-danger"></i> 此操作将会删除病区设置的报警方式并恢复系统默认设置。请确认！
        <div slot="footer" class="dialog-footer">
          <el-button size="small" @click="deleteDefaultVisible = false">取消</el-button>
          <el-button size="small" type="danger" :disabled="deleting" @click="deleteDefault">{{deleting ? '正在删除...' : '确定'}}</el-button>
        </div>
      </el-dialog>
      <el-dialog title="警告" size="tiny" v-model="deleteVisible">
        <i class="fa fa-warning text-warning"></i> 确定删除该参数吗？
        <div slot="footer" class="dialog-footer">
          <el-button size="small" @click="deleteVisible = false">取消</el-button>
          <el-button size="small" type="danger" :disabled="deleting" @click="deleteParams">{{deleting ? '正在删除...' : '确定'}}</el-button>
        </div>
      </el-dialog>
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

import {
  range
} from '../../../common/validator';

require('./index.scss');

export default {
  created() {
    this.loading = true;
    this.getData();
    this.getVersionInfo();
  },
  computed: {
    // 过滤后的列表
    filterdList() {
      const _this = this;
      if (this.data.list.filter) {
        return _.chunk(this.data.list.filter(item => {
          if (!_this.filterBed) {
            return true;
          }
          return item.bedCode.indexOf(_this.filterBed) > -1;
        }), _this.perPageSize);
      }

      return this.data;
    },
    // 过滤后的条目数
    resultSize() {
      let len = 0;
      if (Array.isArray(this.filterdList)) {
        this.filterdList.forEach(item => len += item.length);
      }

      return len;
    }
  },
  data() {
    const _this = this;
    const isAdmin = auth.getToken().user.isadmin === '1';

    return {
      activeName:'default',
      able:false,
      visions: [{
          value: 'old',
          label: '旧版'
        }, {
          value: 'common',
          label: '通用版'
        }, {
          value: 'commonDarkColor',
          label: '通用深色版'
        }, {
          value: 'fullVision',
          label: '完全版'
        }],
      versionInfo:[{}],
      isAdmin,
      loading: false,
      queryParams: {
        deptCode: auth.getToken().deptList[0].code
      },
      list: [],
      data: {
        list: []
      },
      details: [],
      perPageSize: 10,
      currentPage: 1,
      filterBed: null,

      deleteVisible: false,
      deleting: false,
      deleteDefaultVisible: false,
      settingVisible: false,
      settingForm: {},
      savingEdit: false,
      saving: false,
      tvForm: (() => {
        let tvSetting = JSON.parse(localStorage.getItem('tvSetting'));

        if (tvSetting) {
          tvSetting.isInfusion = tvSetting.isInfusion === 1 ? true : false;
        }

        tvSetting = tvSetting || {
          message:false,
          selectedVison:'old',
          startBed: 1,
          endBed: 100,
          rowBottleNum: 7,
          bottleCount: 42,
          isInfusion: false,
          voiceAlarm: 0,
        };

        return tvSetting;
      })(),

      editVisible: false,
      editForm: {},

      rules: {
        editForm: {
          configId: [{
            required: true,
            message: '请选择参数名称',
            trigger: 'change'
          }],
          configValue: [{
            required: true,
            type: 'number',
            message: '请填写参数值',
            // trigger: 'change'
          }, {
            type: 'number',
            min: -2,
            max: 10000,
            message: '参数必须大于-2，小于10000'
            // trigger: 'change'
            // 未来的其他参数可能有字符串类型
          }],
          configOwner: [{
            required: true,
            message: '请选择参数所属科室',
            trigger: 'change'
          }]
        },
        settingForm: {
          dropSpeedFloor: [{
            required: true,
            type: 'number',
            message: '请填写下限',
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

              if (typeof value !== 'number' && !!value) {
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
            message: '请填写上限',
            type: 'number',
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
          }],
          idc: [{
            required: true,
            type: 'number',
            message: '请选择点滴系数',
            trigger: 'change'
          }]
        },
        tvForm: {
          startBed: [{
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

              if (typeof value !== 'number' && !!value) {
                throw new Error('value不是数字');
              }

              if (value === '') {
                callback();
                return;
              }

              if (value > rule.max) {
                callback(new Error(`数字不能大于${rule.max}`));
              }
              if (value < rule.min) {
                callback(new Error(`数字不能小于${rule.min}`));
              }
              if (value > _this.tvForm.endBed && !!_this.tvForm.endBed) {
                callback(new Error(`数字不能大于${_this.tvForm.endBed}`));
              }
              callback();
            }
          }],
          endBed: [{
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

              if (typeof value !== 'number' && !!value) {
                throw new Error('value不是数字');
              }

              if (value === '') {
                callback();
                return;
              }

              if (value > rule.max) {
                callback(new Error(`数字不能大于${rule.max}`));
              }
              if (value < rule.min) {
                callback(new Error(`数字不能小于${rule.min}`));
              }
              if (value < _this.tvForm.startBed && !!_this.tvForm.startBed) {
                callback(new Error(`数字不能小于${_this.tvForm.startBed}`));
              }
              callback();
            }
          }],
          bottleCount: [{
            required: true,
            message: '请填写每页个数',
            type: 'number',
            trigger: 'blur'
          }],
          voiceAlarm: [{
            required: true,
            type: 'number',
            message: '请选择提示方式',
            trigger: 'change'
          }],
          rowBottleNum: [{
            required: true,
            type: 'number',
            min: 7,
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (value === '' || value === 0) {
                callback(new Error('列数必填'));
              }
              if (value < rule.min) {
                callback(new Error(`列数不能小于${rule.min}`));
              }
              callback();
            }
          }],
          isInfusion: []
        }
      }
    }
  },
  methods: {
    getData(tab, event) {
      let subUrl = 'getInfusionTvSetInfoByCode';
      if (tab) {
        switch (tab.name) {
          case 'default':
            break;

          case 'params':
            subUrl = 'getInfusionSysConfigInfoList';
            break;

          default:
            break;
        }
      }
      this.loading = true;
      return this.$http.get(`${CONST.PATH}/${subUrl}`, {
        params: subUrl === 'getInfusionTvSetInfoByCode' ? this.queryParams : {}
      }).then(response => {
        this.loading = false;
        if (subUrl == 'getInfusionSysConfigInfoList') {
          this.data.list = response.body.data.list;
          this.list = _.chunk(this.data.list, this.perPageSize);
        } else {
          this.settingForm = response.body.data || {};
          this.settingForm.restMlAlarm = response.body.data.restMlAlarm === '1';
          this.settingForm.dropSpeedAlarm = response.body.data.dropSpeedAlarm === '1';
        }
      }).catch(() => this.loading = false);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    getDeptName(deptCode) {
      const found = _.find(this.$root.deptList, (item) => item.code === deptCode);
      return found ? found.name : '全院';
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
    add() {
      this.editVisible = true;
      this.editForm = {
        configId: '',
        configValue: '',
        configOwner: '',
        configDesc: '',
        isNew: true
      };
      setTimeout(() => {
        this.$refs.editForm.resetFields();
      }, 100);
    },
    configValueRule(min,max){
      return [{required: true,type:'number',message: `请填写${min}到${max}之间的参数值`,min:min,max:max,trigger: 'change'}]
    },
    openEdit(row) {
      row.configValue = Number(row.configValue);
      switch (row.configId){
        case 'infusionDropperWeight':
          this.rules.editForm.configValue = this.configValueRule(0,100);
          break;
        case 'infusionDropperLiquid':
          this.rules.editForm.configValue = this.configValueRule(0,100);
          break;
        case 'infusionAlgorithmDvalue':
          this.rules.editForm.configValue = this.configValueRule(0,1);
          break;
        case 'blueBridgeLedSwitch':
          this.rules.editForm.configValue = this.configValueRule(0,1);
          break;
        case 'statHistoryInfusionSwitch':
          this.rules.editForm.configValue = this.configValueRule(0,1);
          break;
        case 'blueBridgeOffLineTime':
          this.rules.editForm.configValue = this.configValueRule(0,10000);
          break;
        case 'isPressStart':
          this.rules.editForm.configValue = this.configValueRule(0,1);
          break;
        case 'speedCompareTimes':
          this.rules.editForm.configValue = this.configValueRule(0,30);
          break;
        case 'speedCompareLevel':
          this.rules.editForm.configValue = this.configValueRule(0,30);
          break;
        case 'patientNameShowStar':
          this.rules.editForm.configValue = this.configValueRule(0,1);
          break;
        case 'cacuPointCount':
          this.rules.editForm.configValue = this.configValueRule(3,60);
          break;
        case 'capAlarmThreshold':
          this.rules.editForm.configValue = this.configValueRule(0,20);
          break;
        default :
          break;
      }
      if(row.configType == 'F'){
        this.able=true;
      }
      if(row.configId=='isPressStart'){
        this.able=true;
      }      
      this.editForm = Object.assign({}, row);
      this.editVisible = true;
    },
    closeCallBack(){
      this.able=false;
      this.rules.editForm.configValue = [{
            required: true,
            type: 'number',
            message: '请填写参数值',
            // trigger: 'change'
          }, {
            type: 'number',
            min: -2,
            max: 10000,
            message: '参数必须大于-2，小于10000'
            // trigger: 'change'
            // 未来的其他参数可能有字符串类型
          }]
    },
    confirmDelete(seqId) {
      this.deleteSeqId = seqId;
      this.deleteVisible = true;
    },
    deleteParams() {
      this.deleting = true;
      this.$http.get(`${CONST.PATH}/delSysConfigInfoById`, {
        params: {
          seqId: this.deleteSeqId
        }
      }).then(response => {
        this.deleting = false;
        if (response.body) {
          this.deleteVisible = false;
          this.getData({
            name: 'params'
          });
          Message({
            type: 'success',
            message: response.body.msg
          });
        }
      }).catch(error => this.deleting = false);
    },
    deleteDefault() {
      this.$http.get(`${CONST.PATH}/delTvSetInfoByDeptcode`, {
        params: {
          deptCode: auth.getToken().deptList[0].code
        }
      }).then(response => {
        this.deleting = false;
        if (response.body) {
          this.deleteDefaultVisible = false;
          this.getData();
          Message({
            type: 'success',
            message: response.body.msg
          });
        }
      }).catch(error => this.deleting = false);
    },
    saveEdit(isNew) {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          let url = this.editForm.isNew ? 'saveInfusionSysConfigInfo' : 'updateInfusionSysConfigInfo';
          const _form = Object.assign({}, this.editForm);
          if (_form.isNew) {
            delete _form.isNew;
          }
          this.savingEdit = true;
          this.$http.post(`${CONST.PATH}/${url}`, _form, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;'
            },
            emulateJSON: true
          }).then(response => {
            this.savingEdit = false;
            if (response.body) {
              this.editVisible = false;
              this.getData({
                name: 'params'
              });
              Message({
                type: 'success',
                message: response.body.msg
              });
            }
          }).catch(error => this.savingEdit = false);
        } else {
          return false;
        }
      });
    },
    saveSetting() {
      this.$refs.settingForm.validate((valid) => {
        if (valid) {
          const _form = Object.assign({}, this.settingForm);

          this.savingSetting = true;
          delete _form.createTime;
          _form.restMlAlarm = _form.restMlAlarm ? '1' : '0';
          _form.dropSpeedAlarm = _form.dropSpeedAlarm ? '1' : '0';
          _form.deptCode = auth.getToken().deptList[0].code;
          this.$http.get(`${CONST.PATH}/saveInfusionTvSetInfo`, {
            params: _form
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
    saveTv() {
      this.$refs.tvForm.validate((valid) => {
        if (valid) {
          const _form = Object.assign({}, this.tvForm);

          _form.isInfusion = _form.isInfusion ? 1 : 0;
          localStorage.setItem('tvSetting', JSON.stringify(_form));
          this.$parent.isFull = true;
          localStorage.setItem('isFull', JSON.stringify(true));
          this.$router.push({
            name: 'home'
          });
        } else {
          return false;
        }
      });
    },
    getVersionInfo() {
      this.$http.get(`${CONST.PATH}/getVersionInfo`, {
      }).then(response => {
        if (response.body) {
          let data=response.body.data;
          this.versionInfo[0].infusionReleaseDate=data.infusionReleaseDate;
          this.versionInfo[0].infusionChildVersion=data.infusionChildVersion;
          this.versionInfo[0].infusionMajorVersion=data.infusionMajorVersion;
          this.versionInfo[0].blueBrdgeVesion=data.blueBrdgeVesion;
        }
      }).catch();
    }
  }
}
</script>
