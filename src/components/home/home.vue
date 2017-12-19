<template>
<div>
	<el-row class="tac">
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