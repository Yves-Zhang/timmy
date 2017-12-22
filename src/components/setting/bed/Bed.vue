<template>
  <div>
    <el-card class="box-card infusion-overview">
      <div slot="header" class="card-header">
        <div class="card-title"><i class="icon iconfont icon-icons_bed_manage"></i> 床位管理</div>
        <el-button class="fr" type="primary" size="mini" @click="batchAdd" style="margin-left: 20px;"><i class="fa fa-plus"></i> 批量增加床位</el-button>
        <el-button class="fr" type="primary" size="mini" @click="add"><i class="fa fa-plus"></i> 新增床位</el-button>
      </div>
      <div class="filter-wrap" v-if="isAdmin">
        <el-form :inline="true" :model="queryParams" class="demo-form-inline" ref="queryParams">
          <el-form-item>
            <el-select size="small" @change="getData" v-model="queryParams.deptCode" placeholder="病区">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="dept in $root.deptList" :key="dept.code" :label="dept.name" :value="dept.code"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="card-content" v-loading.body="loading" element-loading-text="正在加载...">
        <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
          <el-table-column type="index" label="序号" width="50">
          </el-table-column>
      <!--     <el-table-column prop="wardCode" label="病区编号" width="200">
          </el-table-column> -->
          <el-table-column prop="wardName" label="病区名称">
          </el-table-column>
          <el-table-column prop="code" label="床位编号" sortable>
          </el-table-column>
          <el-table-column prop="unit" label="单位">
          </el-table-column>
          <el-table-column prop="aliasCode" label="别名">
          </el-table-column>
          <el-table-column prop="hisCode" label="关联床位号">
          </el-table-column>
          <el-table-column prop="queryCode" label="查询代理代码">
          </el-table-column>
          <el-table-column :context="_self" inline-template label="操作">
            <span>
              <el-button type="text" size="small" @click="() => openEdit(row)"><i class="el-icon-edit"></i> 编辑</el-button>
              <el-button type="danger" size="mini" @click="() => confirmDelete(row.id)"><i class="el-icon-delete"></i> 删除</el-button>
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
      <i class="el-icon-information text-warning"></i> 确定删除该床位？
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="deleteVisible = false">取消</el-button>
        <el-button size="small" type="danger" @click="del">确定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑床位信息" size="tiny" v-model="editVisible" style="min-width: 1200px">
      <el-form :model="editForm" ref="editForm" :rules="rules" label-width="120px">
        <el-form-item label="病区" prop="wardCode" style="width: 280px;">
          <el-input readonly size="small" type="hidden" name="hisCode" v-model="editForm.wardCode" v-if="!isAdmin"></el-input>
          <el-input readonly size="small" name="hisCode" :value="deptName" v-if="!isAdmin"></el-input>
          <el-select size="small" v-model="editForm.wardCode" placeholder="病区" v-if="isAdmin">
            <el-option v-for="dept in $root.deptList" :key="dept.code" :label="dept.name" :value="dept.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="编号" style="width: 280px;" prop="code">
          <el-input size="small" :maxlength="5" name="code" v-model="editForm.code"></el-input>
        </el-form-item>
        <el-form-item label="关联床号" style="width: 280px;" prop="hisCode">
          <el-input size="small" :maxlength="20" name="hisCode" v-model="editForm.hisCode"></el-input>
        </el-form-item>
        <el-form-item label="查询代理代码" style="width: 280px;" prop="queryCode">
          <el-input size="small" :maxlength="20" name="queryCode" v-model="editForm.queryCode"></el-input>
        </el-form-item>
        <el-form-item label="别名" style="width: 280px;" prop="aliasCode">
          <el-input size="small" :maxlength="20" name="aliasCode" v-model="editForm.aliasCode"></el-input>
        </el-form-item>
        <el-form-item label="单位" style="width: 280px;" prop="unit">
          <el-select size="small" v-model="editForm.unit" placeholder="单位">
            <el-option label="床" value="床"></el-option>
            <el-option label="座" value="座"></el-option>
          </el-select>
          <!-- <el-input size="small" :maxlength="20" name="unit" v-model="editForm.unit"></el-input> -->
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="editVisible = false">取消</el-button>
        <el-button size="small" type="primary" :disabled="saving" @click="saveEdit">{{saving ? '正在保存...' : '保存'}}</el-button>
      </div>
    </el-dialog>

     <!-- 批量增加床位 -->
    <el-dialog title="批量增加床位" size="tiny" v-model="batchBedVisible" style="min-width: 1200px">
      <el-form :model="batchBedForm" ref="batchBedForm" :rules="rules" label-width="120px">
        <el-form-item label="病区" prop="wardCode" style="width: 280px;">
          <el-input readonly size="small" type="hidden" name="hisCode" v-model="batchBedForm.wardCode" v-if="!isAdmin"></el-input>
          <el-input readonly size="small" :value="deptName" name="hisCode"  v-if="!isAdmin"></el-input>
          <el-select size="small" v-model="batchBedForm.wardCode" placeholder="病区" v-if="isAdmin">
            <el-option v-for="dept in $root.deptList" :key="dept.code" :label="dept.name" :value="dept.code"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="编号范围" required>
          <el-col :span="10">
            <el-form-item prop="codeFrom">
              <el-input
                :maxlength="5"
                inline
                class="inline-input"
                size="small"
                type="number"
                name="codeFrom"
                v-model="batchBedForm.codeFrom">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2">
            -
          </el-col>
          <el-col :span="10">
            <el-form-item prop="codeTo">
            <el-input
              :maxlength="5"
              inline
              class="inline-input"
              size="small"
              type="number"
              name="codeTo"
              v-model="batchBedForm.codeTo">
            </el-input>
            </el-form-item>
          </el-col>
        </el-form-item>

        <el-form-item label="关联床号前后缀">
          <el-col :span="10">
            <el-form-item prop="hisCodePrefix">
              <el-input
                :maxlength="6"
                inline
                class="inline-input"
                size="small"
                type="text"
                name="hisCodePrefix"
                placeholder="没有可不填"
                v-model="batchBedForm.hisCodePrefix">
                <template slot="prepend">前缀</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2">
             &nbsp
          </el-col>
          <el-col :span="10">
            <el-form-item prop="hisCodeSuffix">
            <el-input
              :maxlength="6"
              inline
              class="inline-input"
              size="small"
              type="text"
              name="hisCodeSuffix"
              placeholder="没有可不填"
              v-model="batchBedForm.hisCodeSuffix">
              <template slot="prepend">后缀</template>
            </el-input>
            </el-form-item>
          </el-col>
        </el-form-item>

        <el-form-item label="单位" style="width: 280px;" prop="unit">
          <el-select size="small" v-model="batchBedForm.unit" placeholder="单位">
            <el-option label="床" value="床"></el-option>
            <el-option label="座" value="座"></el-option>
          </el-select>
          <!-- <el-input size="small" :maxlength="20" name="unit" v-model="editForm.unit"></el-input> -->
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="batchBedVisible = false">取消</el-button>
        <el-button size="small" type="primary" :disabled="saving" @click="saveBatchBed">{{saving ? '正在保存...' : '保存'}}</el-button>
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
    const isAdmin = auth.getToken().user.isadmin === '1';
    debugger; // eslint-disable-line no-debugger, no-restricted-syntax
    return {
      isAdmin,

      loading: false,
      deptName: auth.getToken().deptList[0].name,
      queryParams: {
        deptCode: this.$route.query.deptCode || (isAdmin ? '' : auth.getToken().deptList[0].code)
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
      batchBedVisible: false,
      editForm: {
        unit: '床'
      },
      batchBedForm: {
        unit: '床',
        codeFrom:null,
        codeTo:null
      },

      rules: {
        code: [{
          required: true,
          message: '请填写编号',
          trigger: 'change'
        }],
        wardCode: [{
          required: true,
          message: '请选择科室',
          trigger: 'change'
        }],
        queryCode: [{
          required: true,
          message: '请填写代理代码',
          trigger: 'change'
        }],
        codeFrom:[{
          required:true,
          message:'请填写编号'
        },{
          type:'number',
          min:1,
          max:99999,
          message: '数字长度小于5',
          trigger:'change'
        }],
        codeTo:[{
          required:true,
          message:'请填写编号'
        },{
          type:'number',
          min:1,
          max:99999,
          message: '数字长度小于5',
          trigger:'change'
        }],
      }
    }
  },
  methods: {
    getData() {
      this.loading = true;
      return this.$http.get(`${CONST.PATH}/getInfusionWardBed`, {
        params: this.queryParams
      }).then(response => {
        this.loading = false;
        this.data = response.body.data;
        this.data.list = response.body.data.list;
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
    confirmDelete(id) {
      this.deleteVisible = true;
      this.deleteId = id;
    },
    del() {
      this.deleting = true;
      this.$http.get(`${CONST.PATH}/delWardBed`, {
        params: {
          id: this.deleteId
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
    openEdit(row) {
      this.editVisible = true;
      this.editForm = Object.assign({
        isNewWardBed: 0
      }, row);
    },
    add() {
      this.editVisible = true;
      this.editForm = {
        code: '',
        wardCode: this.queryParams.deptCode,
        hisCode: '',
        queryCode:'',
        isNewWardBed: 1,
        unit: '床'
      };
      setTimeout(() => {
        this.$refs.editForm.resetFields();
      }, 100);
    },
    batchAdd(){
      this.batchBedVisible = true;
      this.batchBedForm = {
        wardCode:this.queryParams.deptCode,
        codeFrom:null,
        codeTo:null,
        hisCodePrefix:null,
        hisCodeSuffix:null,
        unit:'床'
      }
    },
    saveBatchBed(){
      this.$refs.batchBedForm.validate((valid) =>{
        if (valid){
          this.saving = true;
          let params = Object.assign({},this.batchBedForm);
          this.$http.post(`${CONST.PATH}/batchSaveBeds`,{
            // params:{
                item:JSON.stringify(params)
              // }
          }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;'
            },
            emulateJSON: true
          }).then(response =>{
            this.saving = false;
            if(response.body){
              this.batchBedVisible = false;
              this.getData();
              Message({
                type:'success',
                message:response.body.msg
              });
            }
          }).catch(error =>{
              this.saving = false
          })
        }else{
          return false;
        }
      })
    },
    saveEdit() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.saving = true;
          this.$http.post(`${CONST.PATH}/saveInfusionWardBedInfo`, {
              // params:{
                itemWardBedInfo: JSON.stringify(this.editForm)
              // }
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
              });
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
