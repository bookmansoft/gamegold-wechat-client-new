<!-- 活动页面
-->
<template>
  <div>
    <!-- <x-header :left-options="{preventGoBack: true}" @on-click-back="onBack">{{headerTitle}}</x-header> -->
    <div v-if="hasRedAct==true">
        <group :title=redPackAct.act_name>
            <div style="padding:15px;"><p>{{redPackAct.act_desc}}</p></div>
        </group>
        <group title="活动时间">
            <div style="padding:15px;"><p>
            {{utils.formatDateStr(new Date(redPackAct.act_start_at*1000), 'yyyy年MM月dd日')}} 
              至  
            {{utils.formatDateStr(new Date(redPackAct.act_end_at*1000), 'yyyy年MM月dd日')}}
            {{retMsg}}</p></div>
        </group>

        <group label-width="3.5em" label-margin-right="2em" label-align="right">
            <div style="padding:15px;">
            <x-button type="warn" @click.native="gotRedPack">去抽利是</x-button>
            </div>
        </group>

        <group title="抽奖记录">
            <div style="padding:15px;" v-if="userRedPackList.length==0"><p>您还没抽过奖</p></div>
            <div v-for="(item, index) in userRedPackList" :key="index"> 
                <div style="padding:10px;">
                    <flexbox >
                    <flexbox-item :span="5">
                        <div class="flex-demo">
                            <p><span style="font-size:13px;">{{utils.formatDateStr(new Date(item.act_at*1000), 'MM-dd HH:mm')}}</span></p>
                        </div>
                    </flexbox-item>
                    <flexbox-item :span="2">
                        <div class="flex-demo">
                            <p><span>{{item.amount/100}} 元</span></p>
                        </div>
                    </flexbox-item>
                    <flexbox-item >
                        <div class="flex-demo">
                            <p v-if="item.status==0">
                                <x-button type="primary" @click.native="userRedPackSend(item)" class="redpackBtn">
                                    <span style="font-size:14px;">领取</span></x-button>
                            </p>
                            <p v-else-if="item.status==1">
                                <x-button :disabled="true" type="default" class="redpackBtn">
                                    <span style="font-size:14px;">待确认</span></x-button>
                            </p>
                            <p v-else-if="item.status==2">
                                <x-button :disabled="true" type="default" class="redpackBtn">
                                    <span style="font-size:14px;">已发送</span></x-button>
                            </p>
                        </div>
                    </flexbox-item>
                    </flexbox>
                </div>
                <div style="height:3px; width:100%; background-color:#FAFAFA"></div>
            </div>
        </group>

    </div>

  </div>
</template>
<script>
import { XHeader, Group, Cell, XButton, Flexbox, FlexboxItem} from 'vux'
import { setTimeout } from 'timers';

export default {
  components: {
    XHeader,  Group, Cell, XButton,Flexbox, FlexboxItem
  },
  data () {
    return {
      headerTitle: '活动',
      hasRedAct: null,
      code: null,
      redPackAct: null,
      userRedPackList: [],
      UserRedPackAct: null,
      retMsg: null
    }
  },
  computed:{
    userBase() {return this.$store.state.user.auth},
  },
  methods: {
      onBack() {
        this.$router.push('/mine');
      },

      getRedPackAct() {
          this.$store.dispatch('redpack/RedPackActCurrent', {}).then(res => {
              if(res.code == 0) {
                  this.redPackAct = res.data;
                  this.hasRedAct = true;
                  this.getUserRedPackAct(this.redPackAct.id)
                  this.getUserRedPack(this.redPackAct.id)
              } else {
                  this.hasRedAct = false
              }
          });
      },

      getUserRedPackAct(act_id) {
        this.$store.dispatch('redpack/UserRedPackAct', {
            act_id: act_id,
        }).then(res => {
              if(res.code == 0) {
                  this.UserRedPackAct = res.data;
              }
          });
      },

      getUserRedPack(act_id) {
          this.$store.dispatch('redpack/UserRedPack', {
              act_id: act_id,
          }).then(res => {
              if(res.code == 0) {
                  this.userRedPackList = res.data;
              }
          });
      },

      gotRedPack() {
          let lotteryTicket = this.redPackAct.each_num
          if(this.UserRedPackAct != null ) {
              if(this.UserRedPackAct.act_count >= lotteryTicket) {
                  this.showPlugin('您的抽奖次数已达到本次活动的上限')
                  return
              } else {
                  lotteryTicket = lotteryTicket - this.UserRedPackAct.act_count 
              }
          }
          this.showPlugin('您有'+lotteryTicket+'抽奖机会')
          setTimeout(()=>{
              this.$router.push({ name: 'LuckyWheel', params: { lotteryTicket: lotteryTicket, redPackAct: this.redPackAct }})
          }, 500)
          
      },

      userRedPackSend(item) {
          this.$store.dispatch('redpack/UserRedPackSend', {
            openid: this.userBase.openid, 
            id: item.id,
            act_id: item.act_id,
          }).then(res => {
              if(res.code == 0) {
                  this.showPlugin('利是已领取，请注意查收微信利是')
                  for(var i=0; i<this.userRedPackList.length; i++) {
                      if(this.userRedPackList[i].id == item.id) {
                          item.status = 1
                          this.userRedPackList.splice(i,1,item);
                      }
                  }
              }
          });
      },
      

      showPlugin(msg) {
        this.$vux.alert.show({
            title: '提示',
            content: msg
        })
      },
      
  },
  created() {
    if(!this.userBase.uid) {
        this.$router.push('/login');
    } else {
        this.getRedPackAct();
    }
  }

}
</script>

<style scoped lang="less">
.redpackBtn {
    width: 40px; 
    height: 25px; 
    line-height: 25px;
}

</style>