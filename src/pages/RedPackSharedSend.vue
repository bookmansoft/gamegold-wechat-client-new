<!-- 多人利是预发送页面
-->
<template>
  <div>
    <box gap="10px 10px">
      <group class="group">
        <x-input class="input" title="总金额" placeholder="0.000" v-model="total_amount">
          <x-button slot="right">千克</x-button>
        </x-input>
      </group>
      <!-- <group class="group">
        <group-title slot="title">
          <span class="groupTitle">当前钱包剩余金额XXXX千克</span>
        </group-title>
      </group>-->
      <group class="group">
        <x-input class="input" title="利是个数" placeholder="请填写个数" v-model="total_num">
          <x-button slot="right">个</x-button>
        </x-input>
      </group>
      <group class="group">
        <group-title slot="title">
          <span class="groupTitle">单个利是金额随机</span>
        </group-title>
      </group>
      <group>
        <x-input class="input" placeholder="祝福语：恭喜发财，万事如意！" value="恭喜发财，万事如意！" v-model="wishing"></x-input>
      </group>

      <flexbox>
        <flexbox-item :span="3"></flexbox-item>
        <flexbox-item :span="6">
          <div align="center" style="font-size:20px;margin-top:45px;">总金额{{ total_amount }}千克</div>
        </flexbox-item>
      </flexbox>
      <flexbox>
        <flexbox-item :span="3"></flexbox-item>
        <flexbox-item :span="6">
          <div align="center" style="margin-top:35px;">
            <x-button type="warn" @click.native="justSend">生成利是</x-button>
          </div>
        </flexbox-item>
      </flexbox>
    </box>
  </div>
</template>
<script>
import {
  Flexbox,
  FlexboxItem,
  Divider,
  XInput,
  Group,
  XButton,
  Cell,
  Box,
  GroupTitle
} from "vux";
import moment from "moment";
export default {
  components: {
    Flexbox,
    FlexboxItem,
    Divider,
    XInput,
    XButton,
    Group,
    GroupTitle,
    Cell,
    Box
  },
  data() {
    return {
      tabIndex: 0,
      total_amount: "1", //金额
      total_num: "1", //利是个数
      wishing: "恭喜发财，万事如意！", //祝福语
      send_id: -1
    };
  },
  methods: {
    justSend() {
      this.$store.dispatch('rps/send', {
        total_amount: parseInt(this.total_amount) * 100000,
        total_num: parseInt(this.total_num),
        wishing: this.wishing
      }).then(res => {
        if(res.code == 0) {
          this.send_id = res.data;
          this.$router.push("/redpackshared/unpack/" + this.send_id);
        } else {
          throw new Error(`sharedredpack.Send: ${res.code}`);
        }
      }).catch(e=>{
        console.log(e);
        this.$router.push('/home');
      });
    }
  },
  created() {
    if(!this.$store.state.user.auth.uid) {
        this.$router.push('/login');
        return;
    }
  },
};
</script>

<style scoped>
.groupTitle {
  font-size: 16px;
  margin-bottom: 20px;
}
.input {
  font-size: 20px;
}
</style>