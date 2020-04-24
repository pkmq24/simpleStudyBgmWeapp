import Taro, { Component, Config } from "@tarojs/taro";
import { View } from "@tarojs/components";
import { ClText, ClButton, ClLayout, ClCard } from "mp-colorui";
import "mp-colorui/dist/style/baseCSS.scss";
import "mp-colorui/dist/style/components/text.scss";
import "mp-colorui/dist/style/components/button.scss";
import "mp-colorui/dist/style/components/layout.scss";
import "mp-colorui/dist/style/components/card.scss";

import "./index.scss";
import yesapi from "../../lib/yes3";

export default class Index extends Component {
  state: any = {
    musicList: [{ music_name: "Loading" }],
    hasChanged: false,
    no: 0,
    pageNum: 1,
    waitFlag: true,
    lastTime: 0,
    paused: false
  };

  componentWillMount() {}
  async componentDidMount() {

    let ret1 = await yesapi.table.readRnd("bgmList");
    console.log(ret1);
    let id1 = ret1.data.data.id;
    let pageN = Math.ceil((id1-52)/10);
    let noo = (id1-52) % 10;
    let { data } = await yesapi.table.readPage(
      "bgmList",
      [["id", "<>", "-1"]],
      "and",
      pageN,
      10
    );
    console.log(data);
    let { list } = data;
    this.audio = Taro.getBackgroundAudioManager();
    this.audio.title = list[noo].music_name;
    this.audio.src = list[noo].music_src;
    let _this = this;
    console.log(this.state.hasChanged);
    setTimeout(() => {
      console.log(_this.audio.paused);
    }, 100);
    this.setState({
      musicList: list,
      pageNum:pageN,
      no:noo
    });
    
    this.audio.onPause(() => {
      this.setState({paused:true,lastTime:this.audio.currentTime})
    });

    this.audio.onPlay(()=>{
      this.setState({paused:false,lastTime:0});
    });

    this.audio.onNext(()=>{
      this.proceedNext();
    })

    this.audio.onEnded(()=>{
      this.proceedNext();
    });

    this.audio.onPrev(()=>{
      this.proceedBefore();
    })
    
  }

  componentWillUnmount() {}
  async proceedNext() {
    let { musicList, no, pageNum } = this.state;
    if (no % 10 == 9) {
      pageNum += 1;
      let { data } = await yesapi.table.readPage(
        "bgmList",
        [["id", "<>", "-1"]],
        "and",
        pageNum,
        10
      );
      console.log(data);
      let { list } = data;
      this.setState({ musicList: list });
      musicList = list;
      this.audio.title = musicList[0].music_name;
      this.audio.src = musicList[0].music_src;
      this.audio.play();
      let _this = this;
      setTimeout(() => {
        console.log(_this.audio.paused);
      }, 100);
      console.log(this.audio);
      this.setState({
        no: 0,
        hasChanged: false,
        pageNum: pageNum
      });
      return;
    }
    this.audio.title = musicList[no + 1].music_name;
    this.audio.src = musicList[no + 1].music_src;
    this.audio.play();
    let _this = this;
    setTimeout(() => {
      console.log(_this.audio.paused);
    }, 100);
    console.log(this.audio);
    this.setState({
      no: no + 1,
      hasChanged: false
    });
  }
  audio: any = null;
  componentDidShow() {}

  componentDidHide() {}
  async proceedBefore() {
    let { musicList, no, pageNum } = this.state;
    if (no === 0) {
      pageNum -= 1;
      let { data } = await yesapi.table.readPage(
        "bgmList",
        [["id", "<>", "-1"]],
        "and",
        pageNum,
        10
      );
      console.log(data);
      let { list } = data;
      this.setState({ musicList: list });
      musicList = list;
      this.audio.title = musicList[9].music_name;
      this.audio.src = musicList[9].music_src;
      this.audio.play();
      let _this = this;
      setTimeout(() => {
        console.log(_this.audio.paused);
      }, 100);
      console.log(this.audio);
      this.setState({
        no: 9,
        hasChanged: false,
        pageNum:pageNum
      });
      return;
    }
    this.audio.title = musicList[no - 1].music_name;
    this.audio.src = musicList[no - 1].music_src;
    this.audio.play();
    let _this = this;
    setTimeout(() => {
      console.log(_this.audio.paused);
    }, 100);
    console.log(this.audio);
    this.setState({
      no: no - 1,
      hasChanged: false
    });
  }
 
  onChangeStatus() {
    if(this.state.paused === true) {
      this.setState({paused:false,lastTime:0});  
      this.audio.seek(this.state.lastTime);
      this.audio.play();    
      setTimeout(() => {
        console.log(this.audio.paused);
      }, 100);
    }
    else {
      this.audio.pause();
    }
  }

  config: Config = {
    navigationBarTitleText: "安静地听歌学习…"
  };

  render() {
    let { musicList, no } = this.state;
    return (
      <View>
        <ClCard>
          <ClLayout>
            <View style={{ height: "100%", width: "100%" }}>
              <ClText text={musicList[no].music_name} size="xxlarge" />
            </View>
            <ClButton
              onClick={() => {
                Taro.setClipboardData({ data: musicList[no].music_name });
              }}
              style={{ marginTop: "10PX" }}
            >
              复制音乐名称
            </ClButton>{"   "}
            <ClButton
              onClick={this.onChangeStatus.bind(this)}
              style={{ marginTop: "10PX" }}
            >
              {this.state.paused === false? "暂停":"继续"}播放音乐
            </ClButton>
          </ClLayout>
        </ClCard>
        <ClCard>
          <ClLayout>
            <View style={{ height: "100%", width: "100%" }} onClick={()=>{this.audio.seek(150);}}>
              <ClText
                
                text="使用说明"
                size="large"
                fontWeight="bold"
              />
              <ClText
                text="此小程序的唯一功能是播放适合自习听的舒缓的背景音乐。"
                size="normal"
              />
              <ClText
                text="正确食用：打开小程序→锁屏→学习。"
                size="normal"
              />
            </View>
          </ClLayout>
        </ClCard>
      </View>
    );
  }
}
