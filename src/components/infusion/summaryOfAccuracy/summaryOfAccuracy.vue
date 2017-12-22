<template>
	<div>
		<el-card class="box-card infusion-overview">
			<div slot="header" class="card-header">
		      <div class="card-title"><i class="icon iconfont icon-icons_statistics_sum"></i> 报警准确率汇总</div>
		    </div>
		    <div class="filter-wrap">
		      	<el-form :inline="true" :model="queryParams" el.form.change="getData" class="demo-form-inline" ref="queryParams">
			        <el-form-item v-show="queryParams.statModel === 'byWeek'">
			            <el-date-picker class="small-picker" :editable="false" style="width: 120px" size="small" type="year" placeholder="选择年份" v-model="queryParams.endDate">
			            </el-date-picker>
			        </el-form-item>
			        <el-form-item v-show="['byDay', 'byMonth'].indexOf(queryParams.statModel) >= 0">
			            <el-date-picker class="small-picker" :editable="false" :clearable="false" style="width: 120px" size="small" type="date" placeholder="选择日期" v-model="queryParams.startTime">
			            </el-date-picker>
			        </el-form-item>
			        <el-form-item v-show="['byDay', 'byMonth'].indexOf(queryParams.statModel) >= 0">
			            <el-date-picker class="small-picker" :editable="false" :clearable="false" style="width: 120px" size="small" type="date" placeholder="结束时间" v-model="queryParams.endTime">
			            </el-date-picker>
			        </el-form-item>
			        <el-button size="small" type="primary" @click="getData">查询</el-button>
			    </el-form>
			</div>
			<div class="card-content" v-loading.body="loading" element-loading-text="正在加载...">
		        <el-table :data="filterdList[currentPage - 1]" stripe border style="width: 100%">
		          <el-table-column type="index" label="序号" width="50">
		          </el-table-column>
		          <el-table-column label="所属病区" prop="dept_name">
		          </el-table-column>
		          <el-table-column label="输液次数" prop="infusion_bag_num">
		          </el-table-column>
		          <el-table-column label="报警正常" prop="infusion_normal">
		          </el-table-column>
		          <el-table-column label="输液报警偏早" prop="infusion_early" sortable>
		          </el-table-column>
		          <el-table-column label="输液报警偏晚" prop="infusion_late" sortable>
		          </el-table-column>
		          <el-table-column label="准确率" prop="accuracy_rate" sortable>
		          </el-table-column>
		          <el-table-column label="按键率" prop="presskey_rate" sortable>
		          </el-table-column>
		          <el-table-column label="扫描率" prop="scanbarcode_rate" sortable>
		          </el-table-column>
		        </el-table>
		        <div class="table-pagination">
		          <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="10" layout="total, prev, pager, next" :total="resultSize">
		          </el-pagination>
		        </div>
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



export default {
	created(){
		// [start]在生命周期created阶段调用preDate方法修改data中的值
	    this.queryParams.startTime=this.preDate(7);
	    this.queryParams.endTime=new Date();
	    // [end]在生命周期created阶段调用preDate方法修改data中的值
	    this.getData();
	},
	computed:{
		// 过滤后的列表
	    filterdList() {
	      const _this = this;
	      return _.chunk(_this.summaryList.filter(item => {
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
	mounted(){

	},
	data(){
		const that = this;
    	const authResult = auth.getToken();
		return {
			queryParams: {
		        statModel: 'byDay',
		        startTime: '',
		        endTime: ''
		    },
		    loading:false,
		    summaryList:[],
		    currentPage: 1,
      		filterBed: null,
      		perPageSize:10
		}
	},
	methods:{
		getData(){
			this.loading = true;
			this.queryParams.startTime = moment(this.queryParams.startTime).format('YYYY/MM/DD');
			this.queryParams.endTime = moment(this.queryParams.endTime).format('YYYY/MM/DD');
			const params = Object.assign({},this.queryParams);
			delete params.deptCode;
			delete params.statModel;
			return this.$http.get(`${CONST.PATH}/getAllInfusionBags`,{
				params
			})
			.then(response=>{
					if (response.body) {
			            this.loading = false;
			            this.summaryList=response.body.data.list;
			        }
				}
			)
			.catch(error=>this.loading=false)
		},
		handleCurrentChange(val) {
	      this.currentPage = val;
	    },
		// [start]获取多少天（参数中设置）前的日期函数
	    preDate(days){
	      let date=moment().subtract(days, 'days')._d;
	      return moment(date).format('YYYY/MM/DD');
	    }
	    // [end]获取多少天（参数中设置）前的日期函数
	}
}
</script>