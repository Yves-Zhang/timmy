  <template>
<div>
  <el-card class="box-card infusion-overview">
    <div slot="header" class="card-header">
      <div class="card-title"><i class="icon iconfont icon-icons_system_error"></i> 系统诊断</div>
    </div>
    <div class="card-content">
      <el-tabs type="card" @tab-click="getData" v-model="activeName">
        <el-tab-pane label="系统模块" name="system" v-if="isadmin!=2">
          <div class="system-model">
            <div class="system-model_item">
              <i class="fa fa-wifi"></i>
              <h3>蓝桥</h3>
              <div class="text-info" v-show="loading">
                <i class="el-icon-loading"></i>
              </div>
              <div class="text-success" v-if="systemLogData.sysMap.blueBridgeStatus">
                <i class="el-icon-circle-check"></i> 正常
              </div>
              <div class="text-danger" v-if="typeof systemLogData.sysMap.blueBridgeStatus === 'boolean' && !systemLogData.sysMap.blueBridgeStatus">
                <i class="el-icon-warning"></i> 异常
              </div>

            </div>
            <div class="system-model_item">
              <i class="fa fa-microchip"></i>
              <h3>
                                  Redis
                              </h3>
              <div class="text-info" v-show="loading">
                <i class="el-icon-loading"></i>
              </div>
              <div class="text-success" v-if="systemLogData.sysMap.redisStatus">
                <i class="el-icon-circle-check"></i> 正常
              </div>
              <div class="text-danger" v-if="typeof systemLogData.sysMap.redisStatus === 'boolean' && !systemLogData.sysMap.redisStatus">
                <i class="el-icon-warning"></i> 异常
              </div>
            </div>
            <div class="system-model_item">
              <i class="fa fa-database"></i>
              <h3>
                                  数据库
                              </h3>
              <div class="text-info" v-show="loading">
                <i class="el-icon-loading"></i>
              </div>
              <div class="text-success" v-if="systemLogData.sysMap.dataBaseStatus">
                <i class="el-icon-circle-check"></i> 正常
              </div>
              <div class="text-danger" v-if="typeof systemLogData.sysMap.dataBaseStatus === 'boolean' && !systemLogData.sysMap.dataBaseStatus">
                <i class="el-icon-warning"></i> 异常
              </div>
            </div>
          </div>
          <div class="tool-btn">
            <el-button type="primary" @click="getData"><i class="fa fa-refresh"></i> 重新诊断</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="监测器异常" name="monitor" v-if="isadmin!=2">
          <div class="card-content" v-loading="loading" element-loading-text="正在加载..." style="overflow: hidden;">
            <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
              <el-table-column type="index" label="序号" width="50">
              </el-table-column>
              <el-table-column prop="deptName" label="病区" width="160">
              </el-table-column>
              <el-table-column prop="bedCode" label="床号" width="160">
              </el-table-column>
              <el-table-column prop="macAddress" label="mac地址" width="200">
              </el-table-column>
              <el-table-column prop="restKwh" label="剩余电量" width="200" inline-template>
                <span v-battery="row.restKwh"></span>
              </el-table-column>
              <el-table-column prop="abnormalInfo" label="异常原因" width="200">
              </el-table-column>
              <el-table-column label="在线状态" inline-template>
                <el-tag :type="row.tagLink" close-transition>{{row.linkText}}</el-tag>
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
                <el-select size="small" v-model="wardCode" placeholder="科室">
                  <el-option value="" label="全部"></el-option>
                  <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code" :key="dept.id"></el-option>
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
            <el-table :data="filterdList_1[currentPage_1 - 1]" stripe border style="width: 100%">
              <el-table-column type="index" label="序号" width="50">
              </el-table-column>
              <el-table-column prop="deptName" label="所属病区" width="140">
              </el-table-column>
              <el-table-column prop="flyOverVersion" label="版本">
              </el-table-column>
              <el-table-column prop="room" label="房间号"  width="100" sortable>
              </el-table-column>
              <el-table-column prop="flyOverDevAddress" label="蓝桥mac" width="120">
              </el-table-column>
              <el-table-column prop="flyOverDevModel" label="设备类型" width="100">
              </el-table-column>
              <el-table-column prop="flyOverStatus" label="设备状态" width="100" inline-template sortable>
                <el-tag :type="row.flyOverStatus.statusType" close-transition>{{row.flyOverStatus.statusText}}</el-tag>
              </el-table-column>
              <el-table-column prop="leftDuration" label="离线时长(小时)" width="120" sortable>
              </el-table-column>
              <el-table-column prop="offLineCounts" label="离线次数" width="100" sortable>
              </el-table-column>
           <!--    <el-table-column prop="deptCode" label="科室号" width="100">
              </el-table-column> -->
              
              <el-table-column prop="flyoverRssi" label="最近rssi" width="100" sortable>
              </el-table-column>
            </el-table>
            <div class="table-pagination">
              <el-pagination @current-change="handleCurrentChange_1" :current-page="currentPage_1" :page-size="10" layout="total, prev, pager, next" :total="resultSize_1">
              </el-pagination>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="扫描未使用监测器" name="infusion" v-if="isadmin!=2">
          <div class="card-content" v-loading="loading" element-loading-text="正在加载..." style="overflow: hidden;">
            <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
              <el-table-column type="index" label="序号" width="50">
              </el-table-column>
              <el-table-column prop="deptName" label="病区" width="120">
              </el-table-column>
              <el-table-column prop="bedCode" label="型号" width="80">
              </el-table-column>
              <el-table-column prop="mac_address" label="mac地址" width="140">
              </el-table-column>
              <el-table-column prop="begin_time" label="开始时间" width="160">
              </el-table-column>
              <el-table-column prop="end_time" label="结束时间" width="160">
              </el-table-column>
              <el-table-column prop="spec_capacity" label="规格" width="80">
              </el-table-column>
              <el-table-column prop="net_weight" label="净重" width="80">
              </el-table-column>
              <el-table-column prop="tare" label="皮重" width="80">
              </el-table-column>
              <el-table-column prop="material" label="材质" width="80">
              </el-table-column>
              <el-table-column prop="remark" label="备注">
              </el-table-column>
            </el-table>
          
            <div class="table-pagination">
              <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
              </el-pagination>
            </div>
          </div>
        </el-tab-pane>



        <el-tab-pane label="误报次数较高的监测器" name="Equipment" v-if="isadmin!=2">
            <div class="filter-wrap">
              <el-form :inline="true" :model="queryParams" el.form.change="getData" class="demo-form-inline" ref="queryParams">
                <el-form-item>
                  <el-select size="small" v-model="wardCode" placeholder="科室" v-if="equipment">
                    <el-option value="" label="全部"></el-option>
                    <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code" :key="dept.id"></el-option>
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
              <el-table :data="filterdList_1[currentPage_1 - 1]" stripe border style="width: 100%">
                <el-table-column type="index" label="序号" width="120">
                </el-table-column>
                <el-table-column prop="deptName" label="所属病区" width="120">
                </el-table-column>
                <el-table-column prop="bedCode" label="床号" width="120">
                </el-table-column>
           <!--      <el-table-column prop="deptCode" label="科室号" width="120">
                </el-table-column>
                 -->
                <el-table-column prop="macAddress" label="MAC地址" width="180">
                </el-table-column>
                <el-table-column prop="ealyCounts" label="报警偏早次数">
                </el-table-column>
                <el-table-column prop="lateCounts" label="报警偏晚次数">
                </el-table-column>
                <el-table-column prop="totalCounts" label="误报总次" width="120">
                </el-table-column>
              </el-table>
              <div class="table-pagination">
                <el-pagination @current-change="handleCurrentChange_1" :current-page="currentPage_1" :page-size="10" layout="total, prev, pager, next" :total="resultSize_1">
                </el-pagination>
              </div>
            </div>
        </el-tab-pane>

        <el-tab-pane label="误报次数较高的规格" name="specifications" v-if="isadmin!=2">
          <div class="filter-wrap">
            <el-form :inline="true" :model="queryParams" el.form.change="getData" class="demo-form-inline" ref="queryParams">
              <el-form-item>
                <el-select size="small" v-model="wardCode" placeholder="科室">
                  <el-option value="" label="全部"></el-option>
                  <el-option v-for="dept in $root.deptList" :label="dept.name" :value="dept.code" :key="dept.id"></el-option>
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
            <el-table :data="filterdList_1[currentPage_1 - 1]" stripe border style="width: 100%">
              <el-table-column type="index" label="序号" width="80">
              </el-table-column>
              <el-table-column prop="deptName" label="所属病区" width="80">
              </el-table-column>
              <el-table-column prop="spec_capacity" label="规格" width="80" sortable>
              </el-table-column>
              <el-table-column prop="material" label="材质" width="80" sortable>
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
     <!--          <el-table-column prop="deptCode" label="科室号" width="80">
              </el-table-column> -->
            
              <el-table-column prop="earlyCounts" label="偏早次数" width="100" sortable>
              </el-table-column>
              <el-table-column prop="lateCounts" label="偏晚次数" width="100" sortable>
              </el-table-column>
              <el-table-column prop="totalCounts" label="误报总计" sortable>
              </el-table-column>
            </el-table>
            <div class="table-pagination">
              <el-pagination @current-change="handleCurrentChange_1" :current-page="currentPage_1" :page-size="10" layout="total, prev, pager, next" :total="resultSize_1">
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
import auth from '../../../auth';
import moment from 'moment';

require('./index.scss');

export default {
  created() {
    this.loading = true;
    this.startTime = this.preDate(7);
    this.endTime = moment(new Date()).format('YYYY/MM/DD');
    this.getData();
  },
  computed: {
    // 过滤后的列表
    filterdList() {
      const _this = this;
      if (this.data.filter) {
        return _.chunk(this.data.filter(item => {
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
    },
    filterdList_1() {
      const _this = this;
      return _.chunk(this.equipmentList.filter(item => {
        if (!_this.filter) {
          return true;
        }
        return item.bedCode.indexOf(_this.filter) > -1 || item.macAddress.indexOf(_this.filter) > -1;
      }), _this.perPageSize_1);

      return this.equipmentList;
    },
    resultSize_1() {
      let len = 0;
      this.filterdList_1.forEach(item => len += item.length);
      return len;
    }
  },
  data() {
    const authResult = auth.getToken();
    return {
      activeName:'system',
      queryParams:null,
      isadmin:authResult.user.isadmin,
      wardCode:authResult.deptList[0].code,
      loading: false,
      data: [],
      subUrl:authResult.user.isadmin=='2'?'getExceptionBlueBridgeInfo':'checkSysSeverIsOk',
      systemLogData: {
        sysMap: {
        }
      },
      details: [],
      perPageSize: 10,
      currentPage: 1,
      currentPage_1:1,
      perPageSize_1: 10,
      equipment:true,
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
      filter:null,
      startTime:'',
      endTime:'',
      mistakeNumber:null,
      equipmentList:[]
    }
  },
  methods: {
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    handleCurrentChange_1(val) {
      this.currentPage_1 = val;
    },
    getData(tab, event) {
      // 根据选项卡name来获取数据
      
      // debugger; // eslint-disable-line no-debugger, no-restricted-syntax
      if (tab) {
        switch (tab.name) {
          case 'system':
            break;

          case 'monitor':
            this.subUrl = 'getAbnormalDeviceList';
            break;

          case 'infusion':
            this.subUrl = 'getNoDataInfusionBag';
            break;


          case 'Equipment':
            this.subUrl='getFalsePositivesDevices';
            this.equipment=true;
            break;

          case 'specifications':
            this.subUrl='getFalsePositivesBags';
            this.equipment=false;
            this.filter=null;
            break;

          case 'bridge':
            this.subUrl='getExceptionBlueBridgeInfo';
            this.equipment=true;
            this.filter=null;
            break;

          default:
            break;
        }
      }
      this.loading = true;

        if(['getFalsePositivesDevices','getFalsePositivesBags','getExceptionBlueBridgeInfo'].indexOf(this.subUrl)>-1){
          this.loading = false;
          var params={
            deptCode:this.wardCode,
            startTime:moment(this.startTime).format('YYYY-MM-DD'),
            endTime:moment(this.endTime).format('YYYY-MM-DD'),
            compareLevel:this.mistakeNumber?this.mistakeNumber:5
          }
          if(this.subUrl=='getExceptionBlueBridgeInfo'){
            delete params.compareLevel;
          }
          this.loading = true;
          return this.$http.get(`${CONST.PATH}/${this.subUrl}`,{
            params:params
          })
          .then(response => {
            this.loading = false;
            this.equipmentList=response.body.data;
            if(this.subUrl=='getExceptionBlueBridgeInfo'){
              _.map(this.equipmentList,function(item){
                console.log(item.flyOverStatus);
                switch (item.flyOverStatus){
                  case -1 :
                    item.flyOverStatus={
                      statusType:'danger',
                      statusText:'长期离线'
                    };
                    break;
                  case 0 :
                    item.flyOverStatus={
                      statusType:'danger',
                      statusText:'离线'
                    };
                    break;
                  case 1 :
                    item.flyOverStatus={
                      statusType:'success',
                      statusText:'在线'
                    };
                    break;
                  default : 
                    break;
                }
              }) 
            }
          })
          .catch(() => this.loading = false);
          return;
        }else{
          
          return this.$http.get(`${CONST.PATH}/${this.subUrl}`).then(response => {
            // debugger; // eslint-disable-line no-debugger, no-restricted-syntax
            this.loading = false;
            if (this.subUrl !== 'checkSysSeverIsOk') {
              this.data = this.transformData(response.body.data.list);
              this.list = _.chunk(this.data.list, this.perPageSize);
            } else {
              this.systemLogData = response.body.data;
            }
          }).catch(() => this.loading = false);
        }
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
        }

        return itemTemp;
      });
    },
    // [start]获取多少天（参数中设置）前的日期函数
    preDate(days){
      let date=moment().subtract(days, 'days')._d;
      return moment(date).format('YYYY/MM/DD');
    },
    // [end]获取多少天（参数中设置）前的日期函数  
    download(filePath, fileName) {
      window.open(`${CONST.PATH}/downLoad?url=${filePath}`, fileName);
    }
  }
}
</script>
