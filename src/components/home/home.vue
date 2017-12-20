<template>
<div>
<!-- 	<el-row class="tac">
		<el-col :span="2">
			<el-menu default-active="1" @open="handleOpen" @close="handleClose"  text-color="#fff" active-text-color="#545c64" class="leftNav">
				<el-submenu :index="item.index" v-for="item in navList" :key="item.index">
					<template slot="title">
			            <i class="fa fa-file-text" style="margin-right:5px;"></i>
			        	<span>{{item.name}}</span>
			        </template>
				</el-submenu>
			</el-menu>
		</el-col>
	</el-row> -->
	<h3>{{count}}</h3>
	<div>
		<el-button type="primary" size="small" @click="countFuc('add')">+</el-button>
		<el-button type="danger" size="small" @click="countFuc('reduce')">-</el-button>
	</div>
</div>
</template>

<script> 
import "./home.scss"
import { mapState ,mapMutations} from 'Vuex'
import store from '@/vuex/store'

const navList = require('@/nav.json');

export default {
	//第一种中写法
	// computed:mapState({
	// 	count:state => state.count
	// }),
	// 第二种写法
	// computed:mapState(['count']),
	// 运用对象展开运算符兼容mapstate的方法与组件内部方法
	computed:{
		...mapState(['count'])
	},
	
	created (){

	},
	name:"home",
	data (){
		return {
			navList:navList.list
		}
	},
	store,
	methods:{
		...mapMutations([]),
		handleOpen(key,keyPath){
			console.log(key,keyPath)
		},
		handleClose(key,keyPath){
			console.log(key,keyPath)
		},
		countFuc(arg){
			this.$store.commit(arg);
		}
	}
}

</script>