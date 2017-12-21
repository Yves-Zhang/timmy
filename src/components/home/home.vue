<template>
<el-container>
	<el-header class="header">
		<el-menu
		  :default-active="activeIndex2"
		  class="el-menu-demo"
		  mode="horizontal"
		  @select="handleSelect"
		  background-color="#545c64"
		  text-color="#fff"
		  active-text-color="#ffd04b">
		  <el-menu-item :index="item.index" v-for="item in navList" :key="item.id" v-if="!item.subNav">{{item.name}}</el-menu-item>
		  <el-submenu :index="item.index" v-else>
		    <template slot="title">{{item.name}}</template>
		    <el-menu-item :index="subItem.index" v-for="subItem in item.subNav" :key="subItem.id">{{subItem.name}}</el-menu-item>
		  </el-submenu>
		</el-menu>
	</el-header>
	<el-main style="background-color:red;">
		<h3>{{count}}</h3>
		<div>
			<el-button type="primary" size="small" @click="countFuc('add')">+</el-button>
			<el-button type="danger" size="small" @click="countFuc('reduce')">-</el-button>
		</div>
	</el-main>
	<el-footer style="background-color:blue;">

	</el-footer>	
</el-container>
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
		console.log(this)
	},
	name:"home",
	data (){
		return {
			activeIndex: '1',
        	activeIndex2: '1',
			navList:navList.list,
			aaa:[1,2,3]
		}
	},
	store,
	methods:{
		...mapMutations([]),
		handleSelect(key, keyPath) {
	        console.log(key, keyPath);
	    },
		countFuc(arg){
			this.$store.commit(arg);
		}
	}
}

</script>