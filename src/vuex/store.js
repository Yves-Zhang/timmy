import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
	count:1
}
const mutations = {
	add(state){
		state.count++;
	},
	reduce(state){
		state.count--;
	}
}
const getters = {

}

//actions作用等同于mutations，不同的是mutations是同步的方式，actions是异步的方式
const actions = {

}


export default new Vuex.Store({
	state,
	mutations,
	getters,
	actions
})