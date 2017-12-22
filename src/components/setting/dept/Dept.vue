<template>
  <div>
    <el-card class="box-card infusion-overview">
      <div slot="header" class="card-header">
        <div class="card-title"><i class="icon iconfont icon-icons_ward_manage"></i> 病区管理</div>
        <el-button class="fr" type="primary" size="mini" @click="add"><i class="fa fa-plus"></i> 新增病区</el-button>
      </div>
      <div class="card-content" v-loading.body="loading" element-loading-text="正在加载...">
        <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
          <el-table-column type="index" label="序号" width="50">
          </el-table-column>
          <el-table-column prop="code" label="编号" width="200">
          </el-table-column>
          <el-table-column prop="name" label="名称" width="200">
          </el-table-column>
          <el-table-column prop="bedsCount" label="床位数量" width="160">
          </el-table-column>
          <el-table-column :context="_self" inline-template label="操作">
            <span>
              <el-button type="text" style="margin-left: 6px;" size="small" @click="() => openEdit(row)"><i class="el-icon-edit"></i> 编辑</el-button>
              <router-link :to="{name: 'beds', query: {deptCode: row.code}}"><el-button type="text" style="margin-left: 6px;" size="small"><i class="fa fa-bed"></i> 床位管理</el-button></router-link>
              <el-button type="danger" style="margin-left: 6px;" size="mini" @click="() => confirmDelete(row.code)"><i class="el-icon-delete"></i> 删除</el-button>
            </span>
          </el-table-column>
        </el-table>
        <div class="table-pagination">
          <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
          </el-pagination>
        </div>
      </div>
    </el-card>
    <!-- 删除 -->
    <el-dialog title="警告" size="tiny" v-model="deleteVisible">
      <i class="el-icon-information text-warning"></i> 确定删除该病区？
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="deleteVisible = false">取消</el-button>
        <el-button size="small" type="danger" @click="del">确定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑病区信息" size="tiny" v-model="editVisible" style="min-width: 1200px">
      <el-form :model="editForm" ref="editForm" :rules="rules" label-width="120px">
        <el-form-item label="编号" style="width: 280px;" prop="code">
          <el-input size="small" :maxlength="10" name="code" v-model="editForm.code"></el-input>
        </el-form-item>
        <el-form-item label="名称" style="width: 280px;" prop="name">
          <el-input size="small" :maxlength="20" name="name" v-model="editForm.name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="editVisible = false">取消</el-button>
        <el-button size="small" type="primary" :disabled="saving" @click="saveEdit">{{saving ? '正在保存...' : '保存'}}</el-button>
      </div>
    </el-dialog>
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

export default {
  created() {
    this.loading = true;
    this.getData();
  },
  computed: {
    // 过滤后的列表
    filterdList() {
      const _this = this;
      return _.chunk(this.data.list.filter(item => {
        if (!_this.filterBed) {
          return true;
        }
        return item.bedCode.indexOf(_this.filterBed) > -1;
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
      filterBed: null,
      deleteVisible: false,
      deleting: false,
      saving: false,

      editVisible: false,
      editForm: {},

      rules: {
        code: [{
          required: true,
           validator: (rule, value, callback) => {
            const isValid = /^[A-Za-z0-9]+$/.test(value);
            if (!isValid && !!value) {
              callback(new Error('请输入数字或字母！'));
            }
            if (!value) {
              callback(new Error('病区编号必填！'));
            }
            callback();
          },
          trigger: 'change'
        }],
        name: [{
          required: true,
          message: '请填写病区名称',
          trigger: 'change'
        }]
      }
    }
  },
  methods: {
    getData() {
      this.loading = true;
      return this.$http.get(`${CONST.PATH}/getInfusionDepts`).then(response => {
        this.loading = false;
        this.data = response.body.data;
        this.data.list = this.transformData(response.body.data.list);
        this.list = _.chunk(this.data.list, this.perPageSize);
      });
    },
    transformData(data) {
      return data.map(item => {
        const itemTemp = Object.assign({}, item);

        itemTemp.bedsCount = item.bedLst.length;

        return itemTemp;
      });
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    confirmDelete(code) {
      this.deleteVisible = true;
      this.deleteCode = code;
    },
    del() {
      this.deleting = true;
      this.$http.get(`${CONST.PATH}/delWard`, {
        params: {
          code: this.deleteCode
        }
      }).then(response => {
        if (response.body) {
          Message({
            type: 'success',
            message: response.body.msg
          });
          this.getDeptList()
          this.getData();
          this.deleteVisible = false;
        }
        this.deleteVisible = false;
      }).catch(error => this.deleteVisible = false);
    },
    openEdit(row) {
      this.editVisible = true;
      this.editForm = Object.assign({
        isNewWard: 0
      }, row);
    },
    add() {
      this.editVisible = true;
      this.editForm = {
        code: '',
        name: '',
        isNewWard: 1
      };
      setTimeout(() => {
        this.$refs.editForm.resetFields();
      }, 100);
    },
    saveEdit() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          delete this.editForm.bedLst;
          delete this.editForm.bedLstFormat;
          this.saving = true;
          this.$http.post(`${CONST.PATH}/saveInfusionWard`, {
            itemWard: JSON.stringify(this.editForm)
          }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;'
            },
            emulateJSON: true
          }).then(response => {
            this.saving = false;
            if (response.body) {
              this.editVisible = false;
              this.getDeptList();
              Message({
                type: 'success',
                message: response.body.msg
              });
            }
          }).catch(error => this.saving = false);
        } else {
          return false;
        }
      });
    },
    getDeptList(){  
      this.$http.get(`${CONST.PATH}/getInfusionWards`, {}).then(response => {
        this.$root.deptList = response.body.data.list;
        this.getData();
      }).catch(error => {
        console.log(error)
      })
    }
  }
}
</script>
