<template>
  <div>
    <el-card class="box-card infusion-overview">
      <div slot="header" class="card-header">
        <div class="card-title"><i class="icon iconfont icon-icons_user_manage"></i> 用户管理</div>
        <el-button class="fr" type="primary" size="mini" @click="addUser"><i class="fa fa-user-plus"></i> 新增用户</el-button>
      </div>
      <div class="card-content" v-loading.body="loading" element-loading-text="正在加载...">
        <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
          <el-table-column type="index" label="序号" width="50">
          </el-table-column>
          <el-table-column prop="wardname" label="所属病区">
          </el-table-column>
          <el-table-column prop="code" label="编号">
          </el-table-column>
          <el-table-column prop="name" label="姓名">
          </el-table-column>
          <el-table-column prop="usertype" label="账户类型">
          </el-table-column>
          
          <el-table-column :context="_self" inline-template label="操作">
            <span>
              <el-button type="text" size="small" @click="() => openEdit(row.code)"><i class="el-icon-edit"></i> 编辑</el-button>
              <el-button type="danger" size="mini" @click="() => confirmDelete(row.code)"><i class="el-icon-delete"></i> 删除</el-button>
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
      <i class="el-icon-information text-warning"></i> 确定删除该用户？
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="deleteVisible = false">取消</el-button>
        <el-button size="small" type="danger" @click="deleteUser">确定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑用户信息" size="tiny" v-model="editVisible" style="min-width: 1200px">
      <el-form :model="editForm" ref="editForm" :rules="rules" label-width="120px" v-loading.body="editLoading" element-loading-text="正在加载用户信息...">
        <el-form-item label="编号" style="width: 280px;" prop="code">
          <el-input size="small" :maxlength="10" name="code" v-model="editForm.code"></el-input>
        </el-form-item>
        <el-form-item label="姓名" style="width: 280px;" prop="name">
          <el-input size="small" :maxlength="20" name="name" v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" style="width: 280px;">
          <el-input size="small" :maxlength="10" name="password" v-model="editForm.password"></el-input>
        </el-form-item>
        <el-form-item label="所在病区" prop="ward_code" style="width: 280px;">
          <el-select size="small" name="ward_code" v-model="editForm.ward_code" placeholder="请选择病区" required>
            <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code" :key="dept.id"></el-option>
          </el-select>
        </el-form-item>


        <el-form-item label="账号类型" required prop="isadmin" style="width: 280px;">
          <el-select v-model="editForm.isadmin" placeholder="选择账号类型">
            <el-option
              v-for="item in accountType"
              :key="item.value"
              :label="item.label"
              :value="item.value">
              <span style="float: left">{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>

<!--         <el-form-item label="是否管理员" style="width: 280px;" prop="isadmin">
          <el-switch
            v-model="editForm.isadmin"
            on-color="#13ce66"
            on-text="是"
            off-text="否"
            off-color="#999">
          </el-switch>
        </el-form-item> -->
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
      editLoading:false,
      accountType:[{
        value:'0',
        label:'普通用户'
      },
      {
        value:'1',
        label:'管理员'
      },
      {
        value:'2',
        label:'护理部'
      }],
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
          message: '请填写编号',
          validator: (rule, value, callback) => {
            const isValid = /^[A-Za-z0-9]+$/.test(value);
            if (!isValid && !!value) {
              callback(new Error('请输入数字或字母！'));
            }
            if (!value) {
              callback(new Error('用户编号必填！'));
            }
            callback();
          },
          trigger: 'change'
        }],
        ward_code: [{
          required: true,
          message: '请选择科室',
          trigger: 'change'
        }],
        isadmin: [{
          required: true,
          message: '请选择科室',
          trigger: 'change'
        }],
        name: [{
          required: true,
          message: '请填写姓名',
          trigger: 'change'
        }],
        password: [{
          required: true,
          // message: '请填写密码',
          validator: (rule, value, callback) => {
            const isValid = /^[A-Za-z0-9]+$/.test(value);
            if (!isValid && !!value) {
              callback(new Error('请输入数字或字母！'));
            }
            if (!value) {
              callback(new Error('用户编号必填！'));
            }
            callback();
          },
          trigger: 'change'
        }]
      }
    }
  },
  methods: {
    getData() {
      this.loading = true;
      return this.$http.get(`${CONST.PATH}/getInfusionUsers`).then(response => {
        this.loading = false;
        this.data = response.body.data;
        this.data.list = response.body.data.list;
        this.data.list.forEach(item =>{
          switch (item.isadmin){
            case '0':
              item.usertype='普通用户';
              break;
            case '1':
              item.usertype='管理员';
              break;
            case '2':
              item.usertype='护理部';
              break;
            default:
              break;
          }
        })
        this.list = _.chunk(this.data.list, this.perPageSize);
      });
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    confirmDelete(code) {
      this.deleteVisible = true;
      this.deleteCode = code;
    },
    deleteUser() {
      this.deleting = true;
      this.$http.get(`${CONST.PATH}/delUser`, {
        params: {
          code: this.deleteCode
        }
      }).then(response => {
        if (response.body) {
          Message({
            type: 'success',
            message: response.body.msg
          });
          this.getData();
          this.deleteVisible = false;
        }
        this.deleteVisible = false;
      }).catch(error => this.deleteVisible = false);
    },
    openEdit(code) {
      this.editVisible = true;
      this.editLoading = true;
      this.getUserInfo(code).then(response => {
        if (response.body && response.body.data) {
          this.editForm = response.body.data;
          console.log(this.editForm)
          // this.editForm.isadmin = response.body.data.isadmin === '1';
          this.editForm.isadmin = response.body.data.isadmin;
          this.editForm.ward_code = this.editForm.wardcode;
        } else {
          this.editForm = {};
        }
        this.editLoading = false;
      }).catch(() => this.editLoading = false);
    },
    getUserInfo(code) {
      return this.$http.get(`${CONST.PATH}/getInfusionUsersByCode`, {
        params: {
          code
        }
      });
    },
    addUser() {
      this.editVisible = true;
      this.editForm = {
        code: '',
        ward_code: '',
        name: '',
        password: '',
        isadmin: '0',
        isNewUser: 1
      };
      setTimeout(() => {
        this.$refs.editForm.resetFields();
      }, 100);
    },
    saveEdit() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          const _formData = Object.assign({}, this.editForm);

          this.saving = true;
          this.$http.post(`${CONST.PATH}/saveInfusionUser`, {
            itemUser: JSON.stringify(_formData)
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
              Message({
                type: 'success',
                message: response.body.msg
              })
            }
          }).catch(error => this.saving = false);
        } else {
          return false;
        }
      });
    }
  }
}
</script>
