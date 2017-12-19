<template>
<div>
	<el-row class="tac">
	  <el-col :span="2">
	    <el-menu
	      default-active="2"
	      class="el-menu-vertical-demo"
	      @open="handleOpen"
	      @close="handleClose">
	      <el-submenu index="item.index" v-for="item in navList">
	        <template slot="title">
	          <i class="el-icon-location"></i>
	          <span>{{item.name}}</span>
	        </template>
	        <el-menu-item-group v-for="subNav in item.subNav">
	          <template slot="title">{{subNav.name}}</template>
	          <el-menu-item index="1-1">选项1</el-menu-item>
	          <el-menu-item index="1-2">选项2</el-menu-item>
	        </el-menu-item-group>
	      </el-submenu>
	    </el-menu>
	  </el-col>
	</el-row>

</div>
</template>

<script>
import "./home.scss"

const navList = require('@/nav.json');

export default {
	created (){

	},
	name:"home",
	data (){
		return {
			navList:navList.list
		}
	},
	methods:{
		handleOpen(key,keyPath){
			console.log(key,keyPath)
		},
		handleClose(key,keyPath){
			console.log(key,keyPath)
		}


	}
}

</script>