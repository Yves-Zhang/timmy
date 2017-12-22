<template>
  <div>
    <el-card class="box-card infusion-overview">
      <div slot="header" class="card-header">
        <div class="card-title"><i class="icon iconfont icon-icons_container_mana"></i> 输液袋附加物管理</div>
        <el-button class="fr" type="primary" size="mini" @click="addContainer"><i class="fa fa-plus"></i> 新增附加物</el-button>
      </div>
      <div class="filter-wrap">

            <div class="filter-wrap">
              <el-form :inline="true" :model="queryParams" class="demo-form-inline" ref="queryParams">
                <el-form-item>
                  <el-select size="small" @change="getData" v-model="queryParams.deptCode" placeholder="病区">
                    <el-option value="" label="全部"></el-option>
                    <el-option v-for="dept in $root.deptList" :key="dept.code" :label="dept.name" :value="dept.code"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item style="width: 200px">
                  <el-input inline class="inline-input" size="small" placeholder="附加物名称、重量、是否启用" v-model="filterItem">
                  </el-input>
                </el-form-item>
              </el-form>
            </div>
            <div class="card-content">
              <el-table :data="filterdList[currentPage - 1]" @sorc-change="sortChange" stripe border style="width: 100%">
                <el-table-column type="index" label="序号" width="50">
                </el-table-column>
                <el-table-column prop="deptName" label="科室">
                </el-table-column>
                <el-table-column prop="additionalName" label="附加物名称">
                </el-table-column>
                <el-table-column prop="additionalWeight" label="附加物重量">
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="240">
                </el-table-column>
                <el-table-column prop="flag" label="是否启用" inline-template>
                  <el-tag :type="row.flag=='启用'?'success':'gray'" close-transition>{{row.flag}}</el-tag>
                </el-table-column>
                <el-table-column :context="_self" inline-template label="操作">
                  <span>
                    <el-button type="text" size="small" @click="() => openEdit(row)">修改</el-button>
                    <el-button type="danger" size="mini" @click="() => confirmDelete(row.seqId)">删除</el-button>
                  </span>
                </el-table-column>
              </el-table>
              <div class="table-pagination">
                <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
                </el-pagination>
              </div>
            </div>

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
    <el-dialog title="编辑附加物信息" size="tiny" v-model="editVisible" style="min-width: 1200px">
      <el-form :model="editForm" :rules="rules" label-width="120px" ref="editForm">
    <!--     <el-form-item label="主键ID" style="width: 320px;" prop="seqId" v-if="isEdit">
          <el-input size="small" type="text" name="seqId" :maxlength="100" v-model="editForm.seqId">
          </el-input>
        </el-form-item> -->
        <el-form-item label="所属病区" style="width: 280px;" prop="deptCode">
          <el-select size="small" v-model="editForm.deptCode" name="deptCode" placeholder="病区">
            <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code" :key="dept.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="附加物名称" style="width: 320px;" prop="additionalName">
          <el-input size="small" type="text" name="additionalName" :maxlength="30" v-model="editForm.additionalName">
          </el-input>
        </el-form-item>
        <el-form-item label="附加物重量" style="width: 320px;" prop="additionalWeight">
          <el-input size="small" type="number" name="additionalWeight" :maxlength="30" v-model="editForm.additionalWeight">
          </el-input>
        </el-form-item>
        <el-form-item label="是否启用" prop="flag" style="width: 240px;">
          <el-switch v-model="editForm.flag" on-text="开" off-text="关" on-color="#13ce66" off-color="#999">
          </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="editVisible = false">取消</el-button>
        <el-button size="small" type="primary" :disabled="saving" @click="save">{{saving ? '正在保存...' : '保存'}}</el-button>
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
      return  _.chunk(this.data.list.filter(
        item =>{
          if(!_this.filterItem){
            return true;
          }
          return item.additionalName.indexOf(_this.filterItem) > -1||item.additionalWeight.toString().indexOf(_this.filterItem) > -1||item.flag.indexOf(_this.filterItem) > -1
        }
        ), _this.perPageSize);
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
      saving: false,

      rules: {
        deptCode: [
            { required: true, message: '请选择病区', trigger: 'change' }
        ],
        additionalName: [
          { required: true, message: '请填写附加物名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        additionalWeight: [
          { required: true, message: '请填写附加物重量', type:'number',trigger: 'blur'}
        ],
      }
    }
  },
  methods: {
    getData() {
      this.subUrl='getAdditionalList';
      this.loading = true;
      return this.$http.get(`${CONST.PATH}/${this.subUrl}`, {
        params: {
          deptCode: this.queryParams.deptCode
        }
      }).then(response => {
        console.log(response.body.data)
        this.loading = false;
        this.data = response.body.data;
        this.data.list.forEach(item =>{
          item.flag = item.flag == 1?'启用':'不启用';
        })
        this.list = _.chunk(this.data.list, this.perPageSize);
      });
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    openEdit(row) {
      this.editForm = Object.assign({}, row);
      this.editForm.flag = this.editForm.flag == '启用'?true:false;
      this.editVisible = true;
    },
    confirmDelete(seqId) {
      this.deleteVisible = true;
      this.deleteSeqId = seqId;
    },
    addContainer() {
      this.editVisible = true;
      this.editForm = {
        seqId: '',
        deptCode: '',
        additionalName: '',
        additionalWeight: '',
        flag: false,
      };
      setTimeout(() => {
        this.$refs.editForm.resetFields();
      }, 100);
    },

    save() {
      var params = Object.assign({},this.editForm);
      params.flag = params.flag == true?1:0;
      console.log(params)
      delete params.createTime;
      delete params.tagType;
      delete params.statusText;
      delete params.deptName;
      this.$refs.editForm.validate((valid) =>{
        if(valid){
         this.$http.post(`${CONST.PATH}/saveAdditional?`,{
            item:JSON.stringify(params)
          },{
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;'
            },
            emulateJSON: true
          })
          .then(response =>{
            console.log(response);
            this.getData();
            this.editVisible = false;
          })
          .catch(error =>{
            console.log(error)
          })
        }else{
          return false;
        }
      })
   
    },

    deleteContainer() {
      this.$http.post(`${CONST.PATH}/delAdditional`, {
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
