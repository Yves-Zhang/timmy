<template>
  <div>
    <el-card class="box-card infusion-overview">
      <div slot="header" class="card-header">
        <div class="card-title"><i class="icon iconfont icon-icons_container_mana"></i> 输液容器管理</div>
        <el-button class="fr" type="primary" size="mini" @click="addContainer"><i class="fa fa-plus"></i> 新增容器</el-button>
      </div>
      <div class="filter-wrap">
        <el-tabs type="card" @tab-click="getData" element-loading-text="正在加载..." v-model="activeName">
          <el-tab-pane label="输液容器规格" name="infusionContainerSpecifications">
            <div class="filter-wrap">
              <el-form :inline="true" :model="queryParams" class="demo-form-inline" ref="queryParams">
                <el-form-item>
                  <el-select size="small" @change="getData" v-model="queryParams.deptCode" placeholder="病区">
                    <el-option value="" label="全部"></el-option>
                    <el-option v-for="dept in $root.deptList" :key="dept.code" :label="dept.name" :value="dept.code"></el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
            <div class="card-content">
              <el-table :data="filterdList[currentPage - 1]" @sorc-change="sortChange" stripe border style="width: 100%">
                <el-table-column type="index" label="序号" width="50">
                </el-table-column>
                <el-table-column prop="material" label="材质">
                </el-table-column>
                <el-table-column prop="tare" label="皮重(g)" width="100" sortable>
                </el-table-column>
                <el-table-column prop="spec_capacity" label="规格" width="80" sortable>
                </el-table-column>
                <el-table-column prop="spec_weight" label="液体重量" width="100">
                </el-table-column>
                <el-table-column prop="total_weight" label="总重量" width="100">
                </el-table-column>
                <el-table-column prop="deptName" label="病区名称" width="140">
                </el-table-column>
                <el-table-column inline-template label="适配范围" width="140">
                  <span>{{row.total_from}}-{{row.total_to}}</span>
                </el-table-column>
                <el-table-column :context="_self" inline-template label="操作">
                  <span>
                    <el-button type="text" size="small" @click="() => openEdit(row)">设置</el-button>
                    <el-button type="danger" size="mini" @click="() => confirmDelete(row.seq_id)">删除</el-button>
                  </span>
                </el-table-column>
              </el-table>
              <div class="table-pagination">
                <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
                </el-pagination>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="历史修改记录" name="historyRcord">
            <div class="filter-wrap">
              <el-form :inline="true" :model="queryParams" class="demo-form-inline" ref="queryParams">

                <el-form-item>
                  <el-select size="small" v-model="wardName" placeholder="病区">
                    <el-option value="" label="全部"></el-option>
                    <el-option v-for="dept in $root.deptList" :key="dept.code" :label="dept.name" :value="dept.code"></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item style="width: 160px">
                  <el-input inline class="inline-input" size="small" placeholder="规格、备注、材质检索" v-model="filterItem">
                  </el-input>
                </el-form-item>


              </el-form>
            </div>
            <div class="card-content">
              <el-table :data="filterdList[currentPage - 1]" @sorc-change="sortChange" stripe border style="width: 100%">
                <el-table-column type="index" label="序号" width="50" sortable>
                </el-table-column>
                <el-table-column prop="deptName" label="科室名称"  width="140" sortable>
                </el-table-column>
                <el-table-column prop="create_person" label="修改人"  width="140" sortable>
                </el-table-column>
                <el-table-column prop="spec_capacity" label="规格"  width="140" sortable>
                </el-table-column>
                <el-table-column prop="material" label="材质"  width="140" sortable>
                </el-table-column>
                <el-table-column prop="create_time" label="修改时间" sortable>
                </el-table-column>
                <el-table-column prop="modify_reason" label="备注" sortable>
                </el-table-column>
                <el-table-column :context="_self" inline-template label="操作" width="200">
                  <span>
                    <el-button type="text" size="small" @click="() => openDetail(row)">详情</el-button>
                    <!-- <el-button type="danger" size="mini" @click="() => confirmDelete(row.seq_id)">删除</el-button> -->
                  </span>
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



    <!-- 删除 -->
    <el-dialog title="警告" size="tiny" v-model="deleteVisible">
      <i class="el-icon-information text-warning"></i> 确定删除容器？
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="deleteVisible = false">取消</el-button>
        <el-button size="small" type="danger" @click="deleteContainer">确定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑容器信息" size="tiny" v-model="editVisible" style="min-width: 1200px">
      <el-form :model="editForm" :rules="rules" label-width="120px" ref="editForm">
        <el-form-item label="材质" style="width: 240px;" prop="material">
          <el-select size="small" name="material" v-model="editForm.material" placeholder="材质">
            <el-option label="塑料袋" value="塑料袋"></el-option>
            <el-option label="塑料瓶" value="塑料瓶"></el-option>
            <el-option label="玻璃瓶" value="玻璃瓶"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属病区" style="width: 280px;" prop="deptCode">
          <el-select size="small" v-model="editForm.deptCode" name="deptCode" placeholder="病区">
            <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code" :key="dept.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="药物编号" style="width: 320px;" prop="drugCode">
          <el-input size="small" type="text" name="drugCode" :maxlength="30" v-model="editForm.drugCode">
          </el-input>
        </el-form-item>
        <el-form-item label="药物名称" style="width: 320px;" prop="drugName">
          <el-input size="small" type="text" name="drugName" :maxlength="100" v-model="editForm.drugName">
          </el-input>
        </el-form-item>
        <el-form-item label="容器规格" prop="spec_capacity" style="width: 240px;">
          <el-input size="small" type="number" min="1" max="9999" name="spec_capacity" v-model="editForm.spec_capacity">
            <template slot="append">ml</template>
          </el-input>
        </el-form-item>
        <el-form-item label="皮重" prop="tare" style="width: 240px;">
          <el-input size="small" type="number" name="tare" v-model="editForm.tare">
            <template slot="append">g</template>
          </el-input>
        </el-form-item>
        <el-form-item label="总重量" prop="total_weight" style="width: 240px;">
          <el-input size="small" type="number" name="total_weight" v-model="editForm.total_weight">
            <template slot="append">g</template>
          </el-input>
        </el-form-item>
        <el-form-item label="适配范围" required>
          <el-col :span="10">
            <el-form-item prop="total_from">
              <el-input
                inline
                class="inline-input"
                size="small"
                type="number"
                name="total_from"
                required
                v-model="editForm.total_from">
                <template slot="append">g</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2">
            -
          </el-col>
          <el-col :span="10">
            <el-form-item prop="total_to">
            <el-input
              inline
              class="inline-input"
              size="small"
              type="number"
              name="total_to"
              required
              v-model="editForm.total_to">
              <template slot="append">g</template>
            </el-input>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="备注" prop="modify_reason">
          <el-col :span="22">
            <el-input size="small" type="text" name="modify_reason" :maxlength="100" v-model="editForm.modify_reason" required>
            </el-input>
          </el-col>
          
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="editVisible = false">取消</el-button>
        <el-button size="small" type="primary" :disabled="saving" @click="save">{{saving ? '正在保存...' : '保存'}}</el-button>
      </div>
    </el-dialog>
    <!-- 修改详情 -->
    <el-dialog title="修改详情" size="tiny" v-model="modifyTheDetails" style="min-width: 1200px">
      <el-row :gutter="24">
        <el-col :span="24">
          <div class="grid-content bg-purple">
            <span class="bold">修改人：</span>{{detailList.create_person}}
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="grid-content bg-purple">
            <span class="bold">修改时间：</span>{{detailList.create_time}}
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="grid-content bg-purple">
            <span class="bold">修改备注：</span>{{detailList.modify_reason}}
          </div>
        </el-col>
      </el-row>
      

      <el-row :gutter="20">
        <el-col :span="12" class="bold middle">
          <div class="grid-content bg-purple">修改前</div>
        </el-col>
        <el-col :span="12" class="bold middle after">
          <div class="grid-content bg-purple">修改后</div>
        </el-col>
      </el-row>


      <el-row :gutter="20">
        <el-col :span="12" class="itemBorder" >
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple">原材质：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple">{{detailList.material}}</div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12" class="itemBorder" >
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple" :class="{'sign':detailList.material!==detailList.material_up}">新材质：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple" :class="{'sign':detailList.material!==detailList.material_up}">{{detailList.material_up}}</div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="12" class="itemBorder" >
          <el-row :gutter="24">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple">原皮重：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple">{{detailList.tare}}</div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12" class="itemBorder" >
          <el-row :gutter="24">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple" :class="{'sign':detailList.tare!==detailList.tare_up}">新皮重：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple" :class="{'sign':detailList.tare!==detailList.tare_up}">{{detailList.tare_up}}</div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      

      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="12" class="itemBorder" >
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple">原规格：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple">{{detailList.spec_capacity}}</div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12" class="itemBorder" >
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple" :class="{'sign':detailList.spec_capacity!==detailList.spec_capacity_up}">新规格：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple" :class="{'sign':detailList.spec_capacity!==detailList.spec_capacity_up}">{{detailList.spec_capacity_up}}</div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="12" class="itemBorder" >
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple">原总重量：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple">{{detailList.total_weight}}</div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12" class="itemBorder" >
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple" :class="{'sign':detailList.total_weight!==detailList.total_weight_up}">新总重量：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple" :class="{'sign':detailList.total_weight!==detailList.total_weight_up}">{{detailList.total_weight_up}}</div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>

<!-- 
      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="12"  class="itemBorder">
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple">原报警阀值：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple">{{detailList.warning_volume}}</div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12" class="itemBorder" >
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple" :class="{'sign':detailList.warning_volume!==detailList.warning_volume_up}">新报警阀值：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple" :class="{'sign':detailList.warning_volume!==detailList.warning_volume_up}">{{detailList.warning_volume_up}}</div>
            </el-col>
          </el-row>
        </el-col>
      </el-row> -->

      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="12" class="itemBorder" >
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple">修改前：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple">{{detailList.total_from}}</div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12" class="itemBorder" >
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple" :class="{'sign':detailList.total_from!==detailList.total_from_up}">修改后：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple" :class="{'sign':detailList.total_from!==detailList.total_from_up}">{{detailList.total_from_up}}</div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>


      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="12"  class="itemBorder">
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple">原匹配范围起始：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple">{{detailList.total_to}}</div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12"  class="itemBorder">
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple" :class="{'sign':detailList.total_to!==detailList.total_to_up}">新匹配范围起始：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple" :class="{'sign':detailList.total_to!==detailList.total_to_up}">{{detailList.total_to_up}}</div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>


      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="12"  class="itemBorder">
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple">原科室名：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple">{{detailList.deptName}}</div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12"  class="itemBorder">
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple" :class="{'sign':detailList.deptName!==detailList.deptName_up}">新科室名：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple" :class="{'sign':detailList.deptName!==detailList.deptName_up}">{{detailList.deptName_up}}</div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>


      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="12"  class="itemBorder">
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple">原药物编号：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple">{{detailList.drugCode}}</div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12"  class="itemBorder">
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple" :class="{'sign':detailList.drugCode!==detailList.drugCode_up}">新药物编号：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple" :class="{'sign':detailList.drugCode!==detailList.drugCode_up}">{{detailList.drugCode_up}}</div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>


      <el-row :gutter="20" style="margin-top: 10px;">
        <el-col :span="12"  class="itemBorder">
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple">原药物名称：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple">{{detailList.drugName}}</div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12"  class="itemBorder">
          <el-row :gutter="20">
            <el-col :span="12" class="bold">
              <div class="grid-content bg-purple" :class="{'sign':detailList.drugName!==detailList.drugName_up}">新药物名称：</div>
            </el-col>
            <el-col :span="12">
              <div class="grid-content bg-purple" :class="{'sign':detailList.drugName!==detailList.drugName_up}">{{detailList.drugName_up}}</div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
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
  DatePicker
} from 'element-ui';

import {range} from '@/common/validator';
import {sortChange} from '@/common/sortChange';
require('./index.scss');

Vue.component(DatePicker.name, DatePicker);

export default {
  created() {
    this.loading = true;
    this.getData();
  },
  computed: {
    // 过滤后的列表
    filterdList() {
      const _this = this;
      if(_this.subUrl=='getInfusionBagList'){
        return _.chunk(this.data.list.filter(item => {
          return true;
        }), _this.perPageSize);
      }else{
        return _.chunk(this.data.list.filter(item => {
          if (!_this.filterItem && !_this.wardName) {
            return true;
          }else if(_this.filterItem && _this.wardName){
            return item.deptCode==_this.wardName && (item.spec_capacity.toString().indexOf(_this.filterItem) > -1||item.material.indexOf(_this.filterItem) > -1||item.modify_reason.indexOf(_this.filterItem) > -1);
          }else if(_this.filterItem && !_this.wardName){
            return item.spec_capacity.toString().indexOf(_this.filterItem) > -1||item.material.indexOf(_this.filterItem) > -1||item.modify_reason.indexOf(_this.filterItem) > -1;
          }else if(!_this.filterItem && _this.wardName){
            return item.deptCode==_this.wardName;
          }
        }), _this.perPageSize);
      }
    },
    // 过滤后的条目数
    resultSize() {
      let len = 0;
      this.filterdList.forEach(item => len += item.length);
      return len;
    }
  },
  data() {
    const _this = this;
    return {
      activeName:'infusionContainerSpecifications',
      wardName:'',
      filterItem:null,
      subUrl:'getInfusionBagList',
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

      editForm: {},
      editVisible: false,
      deleteVisible: false,
      detailList:{},
      modifyTheDetails:false,
      saving: false,

      rules: {
        material: [{
          required: true,
          message: '请选择材质'
        }],
        deptCode: [{
          required: true,
          message: '请选择病区'
        }],
        spec_capacity: [{
          required: true,
          type: 'number',
          message: '请输入数字',
          trigger: 'blur'
        }, {
          min: 1,
          max: 9999,
          message: '数字长度在 1 到 9999 之间',
          trigger: 'change',
          validator: range
        }],
        tare: [{
          required: true,
          type: 'number',
          message: '请输入数字',
          trigger: 'change'
        }, {
          min: 1,
          max: 9999,
          message: '数字长度在 1 到 9999 之间',
          trigger: 'change',
          validator: range
        }],
        total_weight: [{
          required: true,
          type: 'number',
          message: '请输入数字',
          trigger: 'change'
        }, {
          min: 1,
          max: 9999,
          message: '数字长度在 1 到 9999 之间',
          trigger: 'change',
          validator: range
        }],
        total_from: [{
          required: true,
          type: 'number',
          message: '请输入数字',
          trigger: 'change'
        }, {
          min: 0,
          max: 2000,
          trigger: 'change',
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
            if (value > _this.editForm.total_to && !!_this.editForm.total_to) {
              callback(new Error(`数字不能大于${_this.editForm.total_to}`));
            }
            callback();
          }
        }],
        total_to: [{
          required: true,
          type: 'number',
          message: '请输入数字',
          trigger: 'change'
        }, {
          min: 1,
          max: 3000,
          trigger: 'change',
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
            if (value < _this.editForm.total_from && !!_this.editForm.total_from) {
              callback(new Error(`数字不能小于${_this.editForm.total_from}`));
            }
            callback();
          }
        }],
        modify_reason: [{
          required:true,
          message:'不能为空'
        }]
      }
    }
  },
  methods: {
    getData(tab,event) {
      if(tab){
        switch (tab.name){
          case 'infusionContainerSpecifications' :
            this.subUrl='getInfusionBagList';
            break;
          case  'historyRcord' :
            this.subUrl='getInfusionBagHisList';
            break;
          default:
            break;
        }
      }
      this.loading = true;
      return this.$http.get(`${CONST.PATH}/${this.subUrl}`, {
        params: {
          deptId: this.queryParams.deptCode
        }
      }).then(response => {
        console.log(response.body.data)
        this.loading = false;
        this.data = response.body.data;
        this.data.list = this.transformData(response.body.data.list);
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
    openEdit(row) {
      this.rules.modify_reason[0].required=true;
      this.editForm = Object.assign({
        isNewBag: 0
      }, row);
      this.editVisible = true;
    },
    openDetail(row){
      console.log(row);
      this.modifyTheDetails=true;
      this.detailList = Object.assign({},row);
      console.log(this.detailList)
    },
    confirmDelete(seqId) {
      this.deleteVisible = true;
      this.deleteSeqId = seqId;
    },
    addContainer() {
      this.rules.modify_reason[0].required=false;
      this.editVisible = true;
      this.editForm = {
        material: '',
        deptCode: '',
        spec_capacity: '',
        tare: '',
        warning_volume: null,
        total_to: '',
        total_from: '',
        total_weight: '',
        isNewBag: 1
      };
      setTimeout(() => {
        this.$refs.editForm.resetFields();
      }, 100);
    },
    save() {
      if (this.editForm.seq_id) {
        delete this.editForm.statusText;
        delete this.editForm.tagType;
        delete this.editForm.spec_weight;
        delete this.editForm.deptName;
      }
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.saving = true;
          this.$http.post(`${CONST.PATH}/saveInfusionBag`, {
            itemBag: JSON.stringify(this.editForm)
          }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;'
            },
            emulateJSON: true
          }).then(response => {
            this.saving = false;
            if (response.body) {
              this.editVisible = false;
              this.getData();
            }
          });
        } else {
          return false;
        }
      });
    },

    deleteContainer() {
      this.$http.post(`${CONST.PATH}/delInfusionBag`, {
        seqid: this.deleteSeqId
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;'
        },
        emulateJSON: true
      }).then(response => {
        this.saving = false;
        if (response.body) {
          this.deleteVisible = false;
          this.getData();
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
