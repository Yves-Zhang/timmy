<template>
  <div class="outerWarp" :style="isFull && itemStyle" @click="() => goToDetail(item.bagId, item.status)">
    <div class="content" :class="item.statusClassName" >
        <div class="bedNumberBox" :style="{'backgroundColor':tendLevel[item.tendLevel]}"><span class="bedNumber">{{item.bedCode}}</span></div>

    <!--     <div class="justBedNumberBox" v-if="item.justShowBedCode">
          {{item.bedCode}}
          <div class="materials" :style="{backgroundColor: flagColor[item.startFlag]}">
            {{item.material && item.material.substr(0, 1)}}
          </div>
          <div class="alias-code" v-if="item.justShowBedCode" ref="aliasCode">{{item.aliasCode}}</div>
        </div> -->
        
        <div class="detail">
            <div class="infusionBagBox" :style="isFull && infusionBagBox">
              <div class="infusionBag  bottleState" :class="{'alarmBed':item.justShowBedCode}" :style="{'border':item.justShowBedCode?'2px #F85982 solid':'none','background':item.justShowBedCode?'#fff':'','height':item.justShowBedCode?'calc( 100% - 4px)':''}">
                <div class="remainFluidText" v-if="item.status === 'I' && item.showText" :style="isFull && remainFluidText">
                  <span class="remain">{{item.restCapacity}}</span>
                  <hr class="line">
                  <span v-show="item.speedAlarm">
                      <i style="margin-right: 3px;" class="fa fa-tint"></i><span class="speed">{{`${item.speed}`}}</span>
                    </span>
                    <span v-show="!item.speedAlarm">
                      <i class="icon iconfont icon-icons_thelast" style="margin-right: 3px;font-size: inherit;font-weight: bold;"></i><span>{{item.restTime}}</span>
                    </span>
                </div>
                <div class="remainFluid" v-show="item.status === 'I' && !item.justShowBedCode && !item.wash" :style="{'height': item.status === 'I' && ((item.percent<=10?'10':item.percent)+'%') }"></div>
                

                <div style="position: relative;display: inline-block;float: right;" :style="isFull && scaleMaterials">
                  <div class="materials" :style="{backgroundColor: flagColor[item.startFlag]}" v-if="!(item.status=='N'||item.status==null)">
                    {{item.material && item.material.substr(0, 1)}}
                  </div>
                </div>
                <div style="position: relative;display: inline-block;float: left;" :style="isFull && scaleRestKwh">
                  <div class="tips-icon" v-if="item.restKwh <= 10 && item.status!='N'">
                    <img class="tips-icon-img" src="/infusion/app/assets/images/components/battery.png" alt="低电量">
                  </div>
                </div>

              </div>
            </div>
            <div class="textDebailBox" :style="isFull && textDebailBox">
              <div class="textDebail" :style="isFull && textDebail">
                <dl class="patient-detail">
                  <dd class="patient__name">
                    {{item.patientName}}
                  </dd>
                  <dd>
                    <span class="patient__sex" :class="{'male': item.sex === '男', 'female': item.sex === '女'}">{{item.sex}}</span> 
                    <span>{{item.patientAge}}</span>
                  </dd>
                  <dd>
                    {{item.admitDate}}
                  </dd>
                  <dd>
                    {{item.inHospitalNo}}
                  </dd>
                </dl>
              </div>
            </div>
        </div>

    </div>
  </div>
</template>

<script>
require('./commonInfusionItem.scss');

const SCALE = window.innerHeight / 480;
const SCALE_FOR_LARGE = window.innerHeight / 760;
export default {
  
  computed: {
    scaleRestKwh(){
      return {
        transformOrigin : 'top left',
        transform:`scale(${SCALE_FOR_LARGE})`
      }
    },
    scaleMaterials(){
      return {
        transformOrigin : 'top right',
        transform:`scale(${SCALE_FOR_LARGE})`
      }
    },
    remainFluidText(){
      const basis = 100 / this.params.rowBottleNum;
      return {
        transformOrigin : 'center',
        transform:`scale(${SCALE_FOR_LARGE})`
      }
    },

    textDebail(){
      const basis = 100 / this.params.rowBottleNum;
      return {
        // backgroundColor:'red',
        transformOrigin : 'top left',
        transform:`scale(${SCALE_FOR_LARGE})`
      };
    },
    infusionBagBox(){
      return {
        flex:'2'
      }
    },
    textDebailBox(){
      return {
        flex:'5'
      }
    },
    itemStyle() {
      const basis = 100 / this.params.rowBottleNum;
      return {
        padding:'2px',
        width: `${basis}%`,
        height: `${(window.innerHeight - 35) / this.rowNum}px`,
        flex: `0 1 ${basis}%`
      };
    },
  },
  data() {
    return {
      flagColor: {
        0: '#6D6D70',
        1: '#13B67F',
        2: '#3F7DC8'
      },
      tendLevel:{
        0: '#FBC131',  //特级护理黄色
        1: '#D64743',  //一级护理红色
        2: '#17ACFF',  //二级护理蓝色
        3: '#0EE588',  //三级护理绿色
        4: '#B2B2B2'   //无护理级别
      }
    };
  },
  mounted() {
    window.addEventListener('resize', () => {
      window.location.reload(true);
    });
  },
  name: 'CommonInfusionItem',
  props: ['item', 'goToDetail', 'params', 'rowNum', 'total', 'isFull']
};
</script>
