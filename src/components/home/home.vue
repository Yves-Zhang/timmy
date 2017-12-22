<template>
<el-card class="box-card infusion-overview">
  <div slot="header" class="card-header">
    <div class="card-title" v-show="!isFull"><i class="icon iconfont icon-icons_infusion_list"></i> 输液监测列表</div>
    <!-- <i class="fa fa-tint"></i> --> 
    <div class="slide-controls" v-show="isFull">
      <span :class="{active: num === currentPageNum + 1}" class="slide-controls_item" v-for="num in pageCount" :key="num.id"></span>
    </div>
    <el-button class="full-btn" size="mini" style="margin-left: 10px;" type="default" @click="toggleFull" :class="{fl: isFull}">
      <i class="fa" :class="{'fa-expand': !isFull, 'fa-compress': isFull}"></i> {{isFull ? '退出全屏' : '全屏显示'}}
    </el-button>
    
    <el-form v-show="!isFull" style="position: absolute;top:-4px;right: 240px;vertical-align: middle;" v-if="isadmin!='0'">
      <el-form-item>
        <el-select placeholder="选择病区" size="small" @change="getCode" v-model="wardCode">
          <el-option v-for="item in $root.deptList" :label="item.name" :value="item.code" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-input v-show="!isFull" style="width: auto;" class="input-round home-search-input" size="small" placeholder="床号检索" icon="search" v-model="filterText">
    </el-input>
    <div class="tv-logo-right" v-show="isFull">      
      <div class="fr" style="height: 100%;">
        <ul class="canfor" v-if="fullVision!='old'">
          <li>总数：{{totalPatien}} 人</li>
          <li><span class="levelColor" :style="{backgroundColor:nursingLevelsColor[0]}"></span>特级：{{levelCount['special-level']}} 人</li>
          <li><span class="levelColor" :style="{backgroundColor:nursingLevelsColor[1]}"></span>一级：{{levelCount['one-level']}} 人</li>
          <li><span class="levelColor" :style="{backgroundColor:nursingLevelsColor[2]}"></span>二级：{{levelCount['two-level']}} 人</li>
          <li><span class="levelColor" :style="{backgroundColor:nursingLevelsColor[3]}"></span>三级：{{levelCount['three-level']}} 人</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="infusion-overview-content" :style="{height: isFull && `${window.innerHeight - 35}px` || 'auto',backgroundColor:isFull&&fullVision=='commonDarkColor'?'#072B45':''}">
    <div class="tv-rule" v-show="isFull" :style="{backgroundColor:isFull&&fullVision=='commonDarkColor'?'#072B45':'',boxShadow:isFull&&fullVision=='commonDarkColor'?'none':''}">
      <div class="top-vol">
        15ml
      </div>
      <div class="medium-vol vol-text">
        10ml
      </div>
      <div class="bottom-vol vol-text">
        5ml
      </div>
      <div class="rule-bedCode-wrap">
        <div class="inner-wrap">
          <div class="rule-row" v-for="row in ruleData" :key="row.id">
            <div class="inner-item" v-for="item in row" :style="item.style" :key="item.id">{{item.bedCode}}</div>
          </div>
          <!-- <div class="inner-item" v-for="item in ruleData.area_b" :style="item.style">{{item.bedCode}}</div> -->
        </div>
      </div>
    </div>




    <!-- [start]原版显示版本 -->
    <div class="infusion-list" :style="{width: isFull ? 'calc(100% - 190px)' : '100%'}" v-if="fullVision=='old'">
      <InfusionItem v-for="item in infusionList[currentPageNum]" class="infusion-item" :item="item" :goToDetail="goToDetail" :params="tvShowParams" :rowNum="currentPageRowNum" :isFull.sync="isFull" :total="infusionList[currentPageNum].length" :key="item.id"></InfusionItem>
    </div>
    <!-- [end]原版显示版本 -->


    <!-- [start]通用版本 -->
    <div class="infusion-list" :style="{width: isFull ? 'calc(100% - 190px)' : '100%'}" v-if="fullVision=='common'" style="background: #fff">
      <CommonInfusionItem v-for="item in infusionList[currentPageNum]" class="infusion-item" :item="item" :goToDetail="goToDetail" :params="tvShowParams" :rowNum="currentPageRowNum" :isFull.sync="isFull" :total="infusionList[currentPageNum].length" :key="item.id"></CommonInfusionItem>
    </div>
    <!-- [end]通用版本 -->

    <!-- [start]通用深色版 -->
    <div class="infusion-list" :style="{width: isFull ? 'calc(100% - 190px)' : '100%',backgroundColor:'#999999'}" v-if="fullVision=='commonDarkColor'">
      <CommonInfusionItemDarkColor v-for="item in infusionList[currentPageNum]" class="infusion-item" :item="item" :goToDetail="goToDetail" :params="tvShowParams" :rowNum="currentPageRowNum" :isFull.sync="isFull" :total="infusionList[currentPageNum].length" :key="item.id"></CommonInfusionItemDarkColor>
    </div>
    <!-- [end]通用深色版 -->


        <!-- [start]完整数据显示版本 -->
    <div class="infusion-list" :style="{width: isFull ? 'calc(100% - 190px)' : '100%'}" v-if="fullVision=='fullVision'" style="background: #fff">
      <FullVisionInfusionItem v-for="item in infusionList[currentPageNum]" class="infusion-item" :item="item" :goToDetail="goToDetail" :params="tvShowParams" :rowNum="currentPageRowNum" :isFull.sync="isFull" :total="infusionList[currentPageNum].length" :key="item.id"></FullVisionInfusionItem>
    </div>
    <!-- [end]完整数据显示版本 -->


    <div class="infusion-cutline" v-show="getCutlineIsVisible()"></div>
    <div v-show="infusionData && infusionData.length === 0" class="no-data">
      <i class="el-icon-information text-warning"></i> 暂无输液患者
    </div>
  </div>
  <!-- 提示音报警音频 -->
  <audio class="prompt-voice" src="/infusion/app/assets/sounds/02_Osmium_00.ogg" controls="controls" hidden="hidden"></audio>
  <!-- 床号语音报警音频 -->
  <div class="bed-alarm-voice">
    <audio :class="`bed-voice-item_${bedCode.replace(/\+/,'_')}`" :src="`/infusion/app/assets/sounds/bed_voice/_${bedCode}.MP3`" controls="controls" hidden="hidden" v-for="bedCode in voiceBedList" :key="bedCode.id"></audio>
  </div>
  <!-- 离开病区报警音频 -->
<!--   <div class="bed-leave-voice">
    <audio :class="`bed-leave-item_${item.bedCode}`" :src="`/infusion/app/assets/sounds/leave_voice/${parseInt(item.bedCode)}.wav`" controls="controls" hidden="hidden" v-for="item in leaveData"></audio>
  </div>
 -->

  <!-- 紧急呼叫地图、离开病区显示 TODO: 目前使用的是北大医院的楼层图，后续做成配置化-->
  <div class="leave-call-wrap" v-show="isFull && (leaveData.length > 0 || callData.length > 0)" :class="{'only-leave': leaveData.length > 0 && callData.length === 0}">
    <div class="patient-leave_header" v-show="callData.length > 0">
      紧急呼叫 <span class="header_dept-name">{{DEPT_NAME}}</span>
    </div>
    <!-- <div class="map-bg" :style="{backgroundImage: 'url(/infusion/app/assets/images/components/map-black_192.png)'}"> -->
    <div class="map-bg" :style="mapStyle" style="background-color: #fff">
      <div class="map-marker" v-for="location in callData" :style="setMarkerStyle(location)" :key="location.id">
        <div class="spread">
          <span class="spread__item"></span>
        </div>
      </div>
      <div class="leave-content" v-if="leaveData.length > 0">
        <div v-for="bed in leaveData" :key="bed.id">{{bed.content.patInhosRecord.bedCode}}床，{{bed.content.patInhosRecord.patName}}</div>
        <div class="">离开病区</div>
      </div>
      <div class="leave-content" v-if="callData.length > 0">
        <div v-for="call in callData" :key="call.id">
          {{call.content.room}}房，{{call.content.bindingUserName}} {{call && call.event === '0102' ? '请求医护支援' : '医护报警'}}
        </div>
      </div>
    </div>
  </div>


  <!-- 床头卡呼叫 -->
  <div class="bedCardWrap" v-show="isFull && bedCardList.length > 0">
    <div class="bedCard">
      <span v-for="(item,index) in bedCardList" :key="item.id">
        <span v-if="index!=0">、</span>{{item}}
      </span>
      <div class="bottomText">
        <p> 正在呼叫…… </p>
      </div>
    </div>
  </div>




</el-card>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';
import InfusionItem from './InfusionItem.vue';
import CommonInfusionItem from './common_InfusionItem.vue';
import CommonInfusionItemDarkColor from './commonInfusionItem_darkColor.vue'
import FullVisionInfusionItem from './fullVision_InfusionItem.vue';
import * as CONST from '@/const';
import auth from '@/auth/';
import moment from 'moment';
import {
  Message
} from 'element-ui';

require('./home.scss');
  
const mock = require('./mock.json');
const infusionMock = require('./infusion2.json');
// const numberBedJson = require('./numberBedCodeMock.json');
// const mock1 = require('./mock1.json');
const Music = window.Music;


export default {
  props: ['isFull', 'fullFn'],
  created() {
    this.init();
    if(Music&&Music.checkTtsStatus){
      let checkOut = Music.checkTtsStatus();
      this.isTTS = checkOut;
      console.log('这是TTS的检测结果'+this.isTTS)
    }else{
      console.log('checkTtsStatus不存在')
      console.log('这是TTS的检测结果'+this.isTTS)
    }
    
  },
  watch: {
    // 床号过滤
    filterText(val) {
      this.getInfusionData();

    },
    isPromptAlarm(val) {
      // 提示音报警
      if (this.tvShowParams.voiceAlarm === 1 && val) {
        const _prompt = document.querySelector('.prompt-voice');
        _prompt.play();
        this.timeIds[4] = setInterval(() => _prompt.play(), this.PROMPT_PLAY_TIME);
      } else {
        clearInterval(this.timeIds[4]);
      }
    },
    /**
      * 离开病区语音报警一个床位只播放一次
      * 输液报警提示音每5分钟播放一次
      * 输液完成语音报警一个床位只播放一次
      */
    voiceBedList(newBedList, oldBedList) {
      let count = 0;
      if (this.tvShowParams.voiceAlarm === 2) {
        setTimeout(() => {
          newBedList.forEach(item => {
            if (oldBedList.indexOf(item) === -1) {
              const toBePlayedVoice = document.querySelector(`.bed-voice-item_${item.replace(/\+/,'_')}`);
              setTimeout(() => {
                if(this.isTTS && Music.playMusic){
                  Music.playMusic(0, item.toString());
                }else{
                  toBePlayedVoice.play();
                }
              }, (Music && Music.playMusic ? this.TV_VOICE_PLAY_TIME * count : this.VOICE_PLAY_TIME * count));
              count += 1;
            }
          });
        }, 600);
      }
    },

    // leaveData(newPatient, oldPatient) {
    //   let count = 0;
    //   const newArray = newPatient.map(item => item.bedCode);
    //   const oldArray = oldPatient.map(item => item.bedCode);

    //   setTimeout(() => {
    //     newArray.forEach(item => {
    //       if (oldArray.indexOf(item) === -1) {
    //         const toBePlayedVoice = document.querySelector(`.bed-leave-item_${item}`);
    //         setTimeout(() => {
    //           try {
    //             Music.playMusic(2, item.toString());
    //           } catch (err) {
    //             console.log(err);
    //             toBePlayedVoice.play();
    //           }
    //         }, this.LEAVE_PLAY_TIME * count);
    //         count += 1;
    //       }
    //     });
    //   }, 600);
    // }
  },
  mounted() {
    // title设置为床号范围
    if (this.tvShowParams.startBed && this.tvShowParams.endBed) {
      document.title = `${this.tvShowParams.startBed}床-${this.tvShowParams.endBed}床 输液监测 - 联新全闭环输液`;
    }
  },
  beforeDestroy() {
    // 离开监测页面时，清除刷新定时器
    this.destroy();
  },
  destroyed() {
    // 离开监测页面时，清除刷新定时器
    this.destroy();
  },
  computed: {
    wardList(){
      return $root.deptList
    },
    infusionList() {
      let list = [];
      if (!Array.isArray(this.infusionData)) {
        return list;
      }

      this.infusionData.forEach((item,index) => {
        let _item = {};
        const perBagInfo = item.inmPerBagInfo;
        const perDeviceInfo = item.bedPatientInfo;
        const perSetting = item.infusionDeviceSetInfo;

        _item = {
          hasPatien:item.bedPatientInfo?true:false,
          wash:false,
          occupant:item.occupant?item.occupant:null,
          capacityAlarmStatus:(perBagInfo && perBagInfo.capacityAlarmStatus) || 0,
          tendLevel:'4',
          showPatientInfo: !!perSetting,
          // 是否显示输液袋的文本信息：剩余液量和剩余时间|滴速等
          showText: false,
          // 床号别名
          aliasCode: item.aliasCode,
          bedUnit: item.bedUnit,
          // 是否摇晃
          isWaggle: item.isWaggle,
          bedCode: typeof item.bedCode !== 'undefined' ? item.bedCode.toString().substr(0, 8) : '',
          speed: perBagInfo.latestDropSpeed,
          admitDate: (perDeviceInfo && perDeviceInfo.admitDate) || '',
          inOut: (perDeviceInfo && perDeviceInfo.inOut) || '',
          admitDiagnosis:(perDeviceInfo && perDeviceInfo.admitDiagnosis) || '',
          operationDate:(perDeviceInfo && perDeviceInfo.operationDate) || '',
          positive:(perDeviceInfo && perDeviceInfo.positive) || '',
          dietType:(perDeviceInfo && perDeviceInfo.dietType) || '',
          restTime: perBagInfo.latestRestTime,
          percent: perBagInfo.latestInmPercent,
          material: perBagInfo.material,
          restCapacity: parseFloat(perBagInfo.latestRestCapacity),
          bagId: perBagInfo.infusion_bag_id,
          restMlAlarm: typeof perSetting !== 'undefined' && parseFloat(perSetting.restMlAlerm) !== 0 ? perSetting.restMlAlerm : 0,
          restTimeAlarm: typeof perSetting !== 'undefined' && parseFloat(perSetting.restTimeAlarm) !== 0 ? perSetting.restTimeAlarm : 0,
          specCapacity: perBagInfo.spec_capacity,
          speedAlarm: perBagInfo.speedAlarmStatus > 0,
          isRestMlAlarm: item.isRestMlAlarm,
          restKwh: item.restKwh && parseFloat(item.restKwh) || 0,
          orderExecCount: perBagInfo.order_exec_count,
          // 滴速报警时是否显示黄色液体
          speedColorAlarm: item.isDropSpeedAlarm,
          // startFlag 按键方式：0:关闭；1:短按；2:长按
          startFlag: perBagInfo.startFlag
        };

        // 患者信息

        if (perDeviceInfo) {
          if(perDeviceInfo.tendLevel !== undefined){
          	if([0,1,2,3,4].indexOf(perDeviceInfo.tendLevel) > 0){
          		_item.tendLevel = perDeviceInfo.tendLevel;
          	}else{
          		_item.tendLevel = 4;
          	}
          }
          _item.patientName = perDeviceInfo.patientName;
          _item.patientAge = perDeviceInfo.age;
          _item.inHospitalNo = perDeviceInfo.inHospitalNo;
          _item.sex = perDeviceInfo.sex === 'F' ? '女' : '男';
        }

        if (typeof perBagInfo.infusion_status === 'undefined' || perBagInfo.infusion_status === 'F' || perBagInfo.infusion_status === 'S') {
          _item.status = 'N';
          _item.statusClassName = 'notStart';
          _item.restCapacity = 0;
          _item.restTime = 0;
          _item.percent = 0;

          // 显示空床时，输液瓶无刻度
            
          if (this.tvShowParams.isInfusion === 1) {
            _item.statusClassName += ' empty-bottle';
          }
        } else {
          if (perBagInfo.infusion_status === 'B') {
            _item.status = 'B';
            _item.statusClassName = 'begin';

            if (parseFloat(item.monitorTime) > 20) {
              _item.status = 'M';
              _item.statusClassName = 'unmatch';
            }
          } else if (perBagInfo.infusion_status === 'L') {
            _item.status = 'L';
            _item.statusClassName = 'leave';
          }else if (perBagInfo.infusion_status === 'W') {
            _item.status = 'W';
            _item.statusClassName = 'waitingStart';
          } else if (perBagInfo.infusion_status === 'P') {
            _item.status = 'P';
            _item.statusClassName = 'suspend';
          } else if (perBagInfo.infusion_status === 'I') {
            _item.status = 'I';
            _item.showText = true;
            _item.statusClassName = 'infusing';

            // 滴速报警
            if (_item.speedAlarm && _item.speedColorAlarm) {
              // 设置冲洗状态参数  暂时写死 500
              if(_item.speed > 500){
                _item.wash = true;
                _item.showText = false;
                _item.statusClassName = 'wash';
              }else{
                _item.statusClassName = 'infusing alarm-speed';
              }
            }
            // 剩余液量报警
            if (_item.restCapacity < 15) {
              _item.wash = false;
              _item.showText = true;
              if(_item.restCapacity < 5 && _item.capacityAlarmStatus!=0){
                _item.statusClassName = 'infusing alarm--rest-0';
                  // 剩余液量低于5ml时只显示床号
                _item.justShowBedCode = true;
              }else{
                _item.statusClassName = 'infusing';
                if (_item.isRestMlAlarm) {
                  _item.statusClassName += ' alarm--rest-3';
                }
              }
            }
          } else {
            _item.status = perBagInfo.infusion_status;
          }
        }
        _item.showBottle = ['I', 'N'].indexOf(_item.status) === -1;
        if(this.tvShowParams.isInfusion === 0){
          if((_item.status !== 'N' && (['I', 'B', 'M', 'L', 'P', 'W', 'C'].indexOf(_item.status) > -1)) || _item.patientName){
            list.push(_item);
          }
        }
        else if(this.tvShowParams.isInfusion === 1) { 
          list.push(_item);
        }
      });

      this.list = list;

      this.totalPatien = _.filter(list, function(n) {
                          return n.hasPatien;
                        }).length;

      // if (list.length <= 20 || this.tvShowParams.bottleCount <= 20) {
      //   this.rowNum = 4;
      // } else {
      //   this.rowNum = this.tvSetting ? Math.ceil(this.tvSetting.bottleCount / this.tvSetting.rowBottleNum) : 6;
      // }

      this.rowNum = this.tvSetting ? Math.ceil(this.tvSetting.bottleCount / this.tvSetting.rowBottleNum) : 6;

      // 按配置的每页显示个数分屏

      // [start]计算各护理级别的人数
      function sum(list,key,val){
        var count=0;
        for(var i=0;i<list.length;i++){
          if(list[i][key]==val){
            count++;
          }
        }
        return count;
      }

      
      this.levelCount={
        'special-level':sum(this.list,'tendLevel','0'),
        'one-level':sum(this.list,'tendLevel','1'),
        'two-level':sum(this.list,'tendLevel','2'),
        'three-level':sum(this.list,'tendLevel','3')
      }
      console.log(this.levelCount)


      return _.chunk(list, this.tvShowParams.bottleCount);
    },

    pageCount() {
      return this.infusionList.length;
    },

    ruleData() {
      return this.calcRule(this.list);
    },

    // 语音提示的床位数组
    // voiceBedList() {
    //   return this.list
    //     .filter(item => item.restCapacity < 5 && item.status && ['N', 'B', 'M', 'W'].indexOf(item.status) === -1 && item.capacityAlarmStatus!=0)
    //     .map(item => Music && Music.playMusic ? `${item.aliasCode || item.bedCode}${item.bedUnit}` : item.bedCode);
    // },
    voiceBedList() {
      return this.list
        .filter(item => item.restCapacity < 5 && item.status && ['N', 'B', 'M', 'W'].indexOf(item.status) === -1 && item.capacityAlarmStatus!=0)
        .map(item => {
          let code;
          let reg = /[a-zA-Z]/g;
          let regZero = /^0{1}/g;
          let regAddZero = /^\+0/g;
          code = item.bedCode.replace(reg,"").replace(regZero,"").replace(regAddZero,"+");
          if(this.isTTS && Music && Music.playMusic){
            return item.aliasCode || code+item.bedUnit;
          }else{
            return code;
          }
        });
    },

    mapStyle() {
      const headerElement = document.querySelector('.patient-leave_header');
      const headerHeight = headerElement ? headerElement.clientHeight : 64;
      if (this.callData.length > 0) {
        // console.log(JSON.parse(this.callData[0]))
        var mapUrl = this.callData[0].content.mapUrl
        return {
          backgroundImage: `url(${mapUrl})`,
          height: `${window.innerHeight - headerHeight}px`,
        };
      }
      return '';
    }
  },
  data() {
    const tvSetting = JSON.parse(localStorage.getItem('tvSetting'));
    const authResult = auth.getToken();
    return {
      totalPatien:null,
      isTTS:false,
      isMessage:tvSetting && tvSetting.message ? tvSetting.message : false,
      bedCardList:[],
      isadmin:authResult.user.isadmin, 
      levelCount:{
        'special-level':0,
        'one-level':0,
        'two-level':0,
        'three-level':0
      },
      show:"false",
      resolution:"",
      fullVision: tvSetting && tvSetting.selectedVison ? tvSetting.selectedVison : 'old',
      nursingLevelsColor:tvSetting && tvSetting.selectedVison=='commonDarkColor'?{
        0: '#FBC131',  //特级护理黄色
        1: '#FF5EC8',  //一级护理红色
        2: '#00E4FF',  //二级护理蓝色
        3: '#0EE588',  //三级护理绿色
        4: '#B2B2B2'   //无护理级别
      }:{
        0: '#FBC131',  //特级护理黄色
        1: '#D64743',  //一级护理红色
        2: '#17ACFF',  //二级护理蓝色
        3: '#0EE588',  //三级护理绿色
        4: '#B2B2B2'   //无护理级别
      },
      // fullVision:true,
      // 切换时间默认值
      PAGE_CHANGE_TIME: 15000,
      // 输液数据刷新时间默认值
      REFRESH_TIME: 5000,
      // 离开病区数据刷新时间默认值
      LEAVE_TIME: 3000,
      // 提示音播放时间间隔
      PROMPT_PLAY_TIME: 1000 * 60 * 5,
      // 语音报警播放时间间隔
      VOICE_PLAY_TIME: 4000,
      TV_VOICE_PLAY_TIME: 6000,
      // 离开病区语音播放时间间隔
      LEAVE_PLAY_TIME: 3000,
      window: window,
      // 分页数
      currentPageNum: 0,
      // 版本：0敏捷版；1对接版。
      version: null,

      currentPageRowNum: tvSetting ? Math.ceil(tvSetting.bottleCount / tvSetting.rowBottleNum) : 6,

      list: [],
      DEPT_CODE: authResult ? authResult.deptList[0].code : null,
      DEPT_NAME: authResult ? authResult.deptList[0].name : '',
      wardCode: authResult ? authResult.deptList[0].code : null,
      tvSetting,
      rowNum: tvSetting ? Math.ceil(tvSetting.bottleCount / tvSetting.rowBottleNum) : 6,
      timeIds: [],
      isPromptAlarm: null,

      filterText: null,

      tvShowParams: tvSetting || {
        // 每页显示输液个数
        bottleCount: 42,
        // 声音提示方式：0静音；1提示音；2语音
        voiceAlarm: 0,
        // 显示列数
        rowBottleNum: 7,
        // 是否显示空床：1显示；0不显示
        isInfusion: 0
      },

      infusionData: [],
      alarmStatus: null,
      leaveData: [],
      callData: [],
      leavePreson:[]
    }
  },
  methods: {
    getCode(arg){
      this.DEPT_CODE=arg;
      this.init();
    },
    cut(){
      this.fullVision=!this.fullVision;
    },
    init() {
      this.getInfusionData();
      // this.getLeaveData();
      this.getAlarmStatus();
      this.getBedCardMessage();
      this.destroy();
      this.refresh();
    },
    // 获取输液数据 getInfusionManagerInfosOfMins
    getInfusionData() {

      // REVIEW 设置aliasCode居中
      const aliasCodeElements = document.querySelectorAll('.alias-code');


      _.forEach(aliasCodeElements, (elem) => {
        if (elem && elem.style.transform.indexOf('translateX') < 0) {
          elem.style.transform = `translateX(-50%) ${elem.style.transform}`;
          elem.style['-webkit-transform'] = `${elem.style.transform}`;
        }
      });
//更改数据环境代码
      return this.$http.get(`${CONST.PATH}/getInfusionManagerInfosOfMins`, {
        params: {
          deptCode: this.wardCode,
          isInfusion: this.tvShowParams.isInfusion,
          startBedCode: this.tvShowParams.startBed,
          endBedCode: this.tvShowParams.endBed,
          bedCode: this.filterText
        }
      }).then(response => {
        if (response.body) {
          this.version = response.body.version;
          this.infusionData = response.body.data;
          // this.infusionData = infusionMock.data;
          
        }
      });
    },
    // 获取离开病区患者数据
    
//     getLeaveData() {
//       //        Music.playMusic(0, '2');
//       return this.$http.get(`${CONST.PATH}/getEquipmentReceiveInfoList`, {
//         params: {
//           deptCode: auth.getToken().deptList[0].code
//         }
//       }).then(response => {
//         if (response.body) {
//           this.leaveData = [];
//           this.callData = [];
// //           const dataList = mock;
// //           const data = JSON.parse(dataList.data);
//           const data = response.body.data && JSON.parse(response.body.data);
//           // debugger; // eslint-disable-line no-debugger, no-restricted-syntax
//           try {
//             console.log('leave call Data', data);
//             if (data && Array.isArray(data.data.lst) && data.data.lst.length > 0) {
//               data.data.lst.forEach(item => {
//                 if (item.dataType === 'RFID') {
//                   this.leaveData.push({
//                     bedCode: item.patientInfo.bedCode || '',
//                     name: item.patientInfo.name || ''
//                   });
//                 } else if (item.dataType === 'location' && item.equipmentLocation) {
//                   const location = item.equipmentLocation.location.split(';');
//                   if (!this.offset_left) {
//                     this.setOffset();
//                   }
//                   this.callData.push({
//                     name: item.comUser && item.comUser.userName || '',
//                     left: location[0],
//                     top: location[1],
//                     event: item.event,
//                     roomNum: item.equipmentLocation.roomNum,
//                     buildingCode: item.equipmentLocation.buildingCode,
//                     equCode: item.equipmentLocation.equCode
//                   });
//                 }
//                 if (item.dataType === 'location' && !item.equipmentLocation) {
//                   console.warn('dataType为location时，equipmentLocation不能为空！！！');
//                 }
//               });
//             }
//           } catch (err) {
//             console.info(err);
//           }

//           console.log('callData', this.callData);
//         }
//       }).catch(err => console.info(err));
//     },
    getCutlineIsVisible() {
      if (!this.isFull) {
        return false;
      }
      // if (this.rowNum !== 4) {
      //   return this.infusionList[this.currentPageNum] && this.infusionList[this.currentPageNum].length % this.tvShowParams.bottleCount !== 0;
      // }
      if (this.rowNum !== 4) {
        return this.infusionList[this.currentPageNum] && this.infusionList[this.currentPageNum].length % this.tvShowParams.bottleCount !== 0;
      }
      if (this.infusionList.length === 0) {
        return true;
      }
      return this.infusionList[this.currentPageNum].length < 20;
    },
    // 获取报警状态数据 提示音报警
    getAlarmStatus() {
      if (this.tvShowParams.voiceAlarm !== 1) {
        return false;
      }
      return this.$http.get(`${CONST.PATH}/getAlarmStatus`, {
        params: {
          deptCode: auth.getToken().deptList[0].code
        }
      }).then(response => {
        if (response.body) {
          this.isPromptAlarm = response.body === 1;
        }
      });
    },

    // 获取床头卡发送的消息
    getBedCardMessage (){
      if(!this.isMessage){
        return false;
      }
      var _this = this;
      return this.$http.get(`${CONST.PATH}/getWarningMessage?deptCode=${this.wardCode}`,{})
      .then(response => {
        var list = response.body.data.patientCallList;
        let leaveData = response.body.data.wristbandList;
        let callData = response.body.data.locationList;
        _this.leaveData = [];
        _this.callData = [];
        _this.leavePreson = [];
        leaveData.forEach(item =>{
          item = JSON.parse(item);
          _this.leaveData.push(item)
        });
        callData.forEach(item =>{
          item = JSON.parse(item);
          _this.callData.push(item)
        });
        if(_this.callData.length!=0){
          if (!_this.offset_left) {
            _this.setOffset();
          }
        }
       
        if(_this.leaveData.length!=0){
          _this.leaveData.forEach(item =>{
            let bedCode = item.content.patInhosRecord.bedCode;
            let patName = item.content.patInhosRecord.patName;
            _this.leavePreson.push(bedCode.toString() + patName.toString())
          })
         
          let str = _this.leavePreson.join('')+'离开病区';
          if(Music){
              Music.callMusic(str);
            }
        };
        if(leaveData.length == 0 && callData.length == 0){
            _this.bedCardList = [];
            list.forEach(item =>{
              item = JSON.parse(item);
              _this.bedCardList.push(item.content.bedCode+'床');
            })

            var str=_this.bedCardList.join('')+'正在呼叫……';
            // 调用安卓callMusic方法播放声音
            
            if(Music&&_this.bedCardList.length!=0){
              Music.callMusic(str);
            }
        }
       
      })
    },
    // 定时刷新数据
    refresh() {
      this.timeIds[0] = this.slide();
      this.timeIds[1] = this.refreshInfusion();
      this.timeIds[2] = this.refreshLeaveData();
      this.timeIds[3] = this.refreshAlarmStatus();
      this.timeIds[4] = this.refreshBedCard();
    },
    /**
      * 进入详情页
      * 当状态为正在输液、停止输液、开始输液、离开
      * 且非全屏下才能点击进入详情页
      */
    goToDetail(bagId, status) {
      if(this.isFull){
        return false;
      };

      if ((['N', 'S', 'W'].indexOf(status) > -1 || !bagId)&&(!this.isFull)) {
        return false;
      };
      this.$router.push({
        name: 'infusionDetail',
        query: {
          id: bagId
        }
      });
    },

    // 计算刻度显示
    calcRule(data) {
      if (!Array.isArray(data)) {
        return null;
      }
      const ruleData = {
        area_b: [],
        type: {}
      };
      const ruleCollection = {};
      const _data = data.slice().sort((a, b) => a.restCapacity - b.restCapacity);

      _data.forEach((item, index, array) => {

        const vol = item.restCapacity;
        let normal_num = Math.floor(vol);

        let key = `_${normal_num}`;

        let prevKey = `_${Number(normal_num + 1)}`;
        let nextKey = `_${Number(normal_num - 1)}`;

        const _temp = {
          bedCode: item.bedCode,
          style: {},
          key,
          value: vol
        };
        const bottleItem = {
          bedCode: item.bedCode,
          value: vol,
          style: {
            fontSize: '36px',
          },
        };
        if ((vol >= normal_num || Math.floor(vol) === normal_num) && vol < normal_num + 1) {
          if (item.status !== 'I' || vol < 0 || normal_num > 15) return;
          // if (item.status !== 'I' || !item.patientAge || vol == 0) return;
          // 新算法
          // 
          // || item.capacityAlarmStatus==0
          let intVol = Math.floor(vol);
          if (_.isEmpty(ruleCollection[intVol])) {
            ruleCollection[intVol] = [];
            bottleItem.style.textAlign = 'center';
          }

          if (ruleCollection[intVol] && ruleCollection[intVol].length > 0 && ruleCollection[intVol].length < 2) {
            ruleCollection[intVol][0].style.textAlign = 'left';
            bottleItem.style.textAlign = 'right';
          }

          const bottleStack = (num) => {
            // 相同刻度个数大于两个时，如果上一格为空则往上堆。

            if (!ruleCollection[num + 1]) {
              ruleCollection[num + 1] = [];
              bottleItem.style.textAlign = 'center';
              bottleItem.style = Object.assign(bottleItem.style, this.setStyle(item.bedCode, num + 1, vol));
              ruleCollection[num + 1].push(bottleItem);
            } else if (ruleCollection[num + 1].length < 2) {
              ruleCollection[num + 1][0].style.textAlign = 'left';
              bottleItem.style.textAlign = 'right';
              bottleItem.style = Object.assign(bottleItem.style, this.setStyle(item.bedCode, num + 1, vol));
              ruleCollection[num + 1].push(bottleItem);
            } else {
              // 上一行的同一刻度已经超过两个
              bottleStack(num + 1);
            }
          }

          // 相同刻度个数大于两个时，如果上一格为空则往上堆。
          if (ruleCollection[intVol] && ruleCollection[intVol].length > 1) {
            bottleStack(intVol);
          } else {
            bottleItem.style = Object.assign(bottleItem.style, this.setStyle(item.bedCode, intVol, vol));
            ruleCollection[intVol].push(bottleItem);
          }

          // 新算法 end
        }
      });
      return ruleCollection;

      // return ruleData;
    },

    setStyle(data, num, vol, rowCount) {
      const ruleHeight = window.innerHeight - 55;
      const fontHeight = ruleHeight / 15;
      let bottom = '';
      let colorText = '';

      if (vol > 0 && vol < 1) {
        // bottom = 0;
       bottom = num * fontHeight;
      } else {
        bottom = num * fontHeight;
      }

      if (num < 6) {
        colorText = '#cf1973';
      } else {
        colorText = '#8f49f1';
      }

      return {
        lineHeight: `${fontHeight}px`,
        color: colorText,
        bottom: `${bottom}px`
      };
    },

    // 位置点偏移量
    setOffset() {
      const original_size = {
        width: 2045,
        height: 1252,
        scale: 2045 / 1252
      };

      setTimeout(() => {
        const _map = document.querySelector('.map-bg');
        const map_width = _map.clientWidth;
        const map_height = _map.clientHeight;
        const map_bg_scale = map_width / map_height;
        let map_real_height = null;
        let offset_left = null;
        let map_real_width = null;
        let offset_top = null;
        let scale = null;
        const image = new Image();
        const cssArr = _map.style.backgroundImage.split(' ');
        let image_src = cssArr.filter(function(item) {
          return item.indexOf('url') >= 0;
        })[0];

        image_src = image_src.replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',')[0];
        image.src = image_src;

        original_size.width = image.width;
        original_size.height = image.height;
        original_size.scale = image.width / image.height;

        // 大小判定
        if (map_bg_scale > original_size.scale) {
          map_real_height = map_height;
          map_real_width = map_height * original_size.scale;
        } else {
          map_real_height = map_width / original_size.scale;
          map_real_width = map_width;
        }

        this.offset_left = (map_width - map_real_width) / 2;
        this.offset_top = (map_height - map_real_height) / 2;
        this.scale = map_real_width / original_size.width;

      }, 500);
    },

    // 声音报警
    setMarkerStyle(marker) {
      // console.log(marker.content.coordinate.split(";"));
      let coordinate = marker.content.coordinate.split(";");
      if (!!this.scale) {
        return {
          display: 'block',
          left: `${coordinate[0] * this.scale + this.offset_left - 18}px`,
          top: `${coordinate[1] * this.scale + this.offset_top - 18}px`
        };
      }

      return {};
    },

    // 销毁定时器
    destroy() {
      this.timeIds.forEach(timeId => clearInterval(timeId));
      this.currentPageNum = 0;
    },

    // 全屏切换
    toggleFull() {
      this.filterText = null;
      this.init();
      if (this.isFull) {
        this.destroy();
      }
      this.fullFn();
    },

    // 切屏
    slide() {
      const that = this;
      return setInterval(() => {
        that.currentPageNum += 1;
        if (that.currentPageNum >= that.pageCount) {
          that.currentPageNum = 0;
        }
        // that.currentPageRowNum = that.infusionList[that.currentPageNum] && that.infusionList[that.currentPageNum].length <= 20 ? 4 : that.rowNum || 4;
        that.currentPageRowNum = that.infusionList[that.currentPageNum] && that.rowNum || 4;
      }, this.PAGE_CHANGE_TIME);
    },

    refreshInfusion() {
      return setInterval(this.getInfusionData, this.REFRESH_TIME);
    },

    refreshLeaveData() {
      return setInterval(this.getLeaveData, this.LEAVE_TIME);
    },

    refreshAlarmStatus() {
      return setInterval(this.getAlarmStatus, this.REFRESH_TIME);
    },

    refreshBedCard(){
      return setInterval(this.getBedCardMessage, this.REFRESH_TIME);
    }
  },
  components: {
    InfusionItem,
    CommonInfusionItem,
    CommonInfusionItemDarkColor,
    FullVisionInfusionItem
  },
  /**
   * 离开监测页面时，如果是全屏状态下则只退出全屏，不跳转；
   * 否则不处理，直接跳转
   */
  beforeRouteLeave(to, from, next) {
    if (this.isFull) {
      this.toggleFull();
      next(false);
    } else {
      next();
    }
  }
}
</script>
