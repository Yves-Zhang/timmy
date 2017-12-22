<template>
<div class="infusion-item-wrap" :class="item.statusClassName" @click="() => goToDetail(item.bagId, item.status)" :style="isFull && itemStyle">
  <div class="item-inner-wrap">
    <!-- {{item}} -->
    <div class="item_patientInfo" :class="{'just-show-bedCode': item.justShowBedCode}">
      <div class="patient_bedCode" :style="isFull && scale" :class="{'scale-xy': !item.justShowBedCode}">
        {{item.bedCode}}
      </div>
      <div class="alias-code" v-if="item.justShowBedCode" :style="isFull && scale" ref="aliasCode">{{item.aliasCode}}</div>
      <!-- 存在患者信息并且不存在剩余液量报警时，显示患者信息 -->
      <dl class="patient-detail" :style="isFull && scale" style="transform-origin: left bottom" v-if="!item.justShowBedCode && item.patientName">
        <dt class="tv-patient-name">
          {{item.patientName}}
        </dt>
        <dd>
          <span class="patient__sex" :class="{'male': item.sex === '男', 'female': item.sex === '女'}">{{item.sex}}</span> {{item.patientAge}}
        </dd>
        <dd>
          {{item.inHospitalNo}}
        </dd>
        <dd>
          <span class="patient__admit-date">{{item.admitDate}}</span>
        </dd>
      </dl>
      <!-- 摇晃提示 -->
      <div class="waggle tips-icon" v-if="item.isWaggle">
        <img src="/infusion/app/assets/images/components/icons_shake.png" alt="摇晃">
      </div>
    </div>
    <!-- 剩余液量报警时，只显示床号 -->
    <div class="item_monitor-wrap" v-if="!item.justShowBedCode"  :class="{'no-capacity': item.status === 'N'}">
      <!-- 输液袋容积 -->
      <div class="monitor-capacity" :style="isFull && scale" v-show="item.status !== 'N'">
        <span>{{item.status=='W'?0:item.specCapacity}}ml</span>
      </div>
      <div class="monitor-bottle" :style="isFull && scale">
        <div class="bottle-container">
          <!-- 根据剩余液量计算高度 -->
          <div class="bottle-rest-vol" :class="{'none-vol': item.status !== 'I'}" :style="{height: `${item.status === 'I' && !item.wash && (item.percent * 70 / 100 <= 10 ? 10 : item.percent * 70 / 100) || 70}px`}"></div>
          <div class="bottle_text" v-if="item.showText">
            <div class="monitor_rest-capacity">
              {{item.restCapacity}}ml
            </div>
            <div class="monitor_rest-time">
              <span v-show="item.speedAlarm" class="speed-alarm-wrap">
                <i style="margin-right: 3px;" class="fa fa-tint"></i>
                <span class="drop-speed-num">{{`${item.speed}`}}</span>
              </span>
              <span v-show="!item.speedAlarm">{{item.restTime}}分</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 低电量提示 -->
    <div class="coulometer tips-icon" v-if="item.restKwh <= 10 && item.status!='N'">
      <img src="/infusion/app/assets/images/components/battery.png" alt="低电量">
    </div>
    <!-- 按键方式提醒 -->
<!--     <div class="tips-startFlag" :style="{borderColor: flagColor[item.startFlag],backgroundColor: flagColor[item.startFlag]}" v-if="['S', 'L', 'B', 'I', 'W'].indexOf(item.status) > -1 && item.restCapacity >= 6">
      {{item.material && item.material.substr(0, 1)}}
    </div> -->
    <div class="tips-startFlag" :style="{borderColor: flagColor[item.startFlag],backgroundColor: flagColor[item.startFlag]}" v-if="!(item.status=='N'||item.status==null)">
      <span v-show="item.status !== 'W'">{{item.material && item.material.substr(0, 1)}}</span>
    </div>
  </div>
</div>
</template>

<script>
require('./infusionItem.scss');

/**
  * 小于20个或每页显示20个，屏幕高度480px的情况下，刚好显示完整输液袋。以此为基准计算比例。
  */
const SCALE = window.innerHeight / 480;
const SCALE_FOR_LARGE = window.innerHeight / 760;
export default {
  /**
    * 如果输液袋个数超过20个，则按每行6个的宽度设置；
    * 小于20个或每页显示20个时，按每行5个的宽度设置，每页4行；同时scale比例放大
    */
  computed: {
    itemStyle() {
      // const basis = 100 / ((this.total && this.total <= 20) ? 5 : this.params.rowBottleNum);
      const basis = 100 / this.params.rowBottleNum;
      debugger;
      console.log(this.rowNum)
      return {
        width: `${basis}%`,
        height: `${(window.innerHeight - 35) / this.rowNum}px`,
        flex: `0 1 ${basis}%`
      };
    },

    scale() {
      const style = {};
      let styleText = null;

      const component = arguments[0];
      let transformStyle = '';


//之前关林的代码
      // if (this.total && this.total <= 20) {
      //   styleText = `scale(${SCALE}, ${SCALE})`;
      // } else {
      //   styleText = `scale(${SCALE_FOR_LARGE})`;
      //   if (SCALE_FOR_LARGE < 1) {
      //     if (this.item.status !== 'N') {
      //       style.transformOrigin = 'top';

      //       if (SCALE_FOR_LARGE < 0.7) {
      //         style.marginTop = '-9px';
      //       }
      //     }
      //     if (this.item.status === 'N') {
      //       style.transformOrigin = 'center';
      //     }
      //   }
      // }
//之前关林的代码


//取消放大缩小后的代码
      if (this.total ) {
        styleText = `scale(${SCALE_FOR_LARGE})`;
        if (SCALE_FOR_LARGE < 1) {
          if (this.item.status !== 'N') {
            style.transformOrigin = 'top';

            if (SCALE_FOR_LARGE < 0.7) {
              style.marginTop = '-9px';
            }
          }
          if (this.item.status === 'N') {
            style.transformOrigin = 'center';
          }
        }
      } else {

        
      }
//取消放大缩小后的代码

      // if (component.$refs.aliasCode) {
      //   transformStyle = component.$refs.aliasCode.style.transform;
      //   style.transform = ['translateX(-50%)', transformStyle].join(' ');
      // } else {
      style.transform = styleText;
      style['-webkit-transform'] = styleText;
      // }

      return style;
    }
  },
  data() {
    return {
      flagColor: {
        0: '#6D6D70',
        1: '#13B67F',
        2: '#3F7DC8'
      },
      materialText: {

      }
    };
  },
  mounted() {
    window.addEventListener('resize', () => {
      window.location.reload();
    });

    // this.$refs.aliasCode.style.transform = ` translateX(-50%) ${this.$refs.aliasCode.style.transform}`;
  },
  name: 'InfusionItem',
  props: ['item', 'goToDetail', 'params', 'rowNum', 'total', 'isFull']
};
</script>
