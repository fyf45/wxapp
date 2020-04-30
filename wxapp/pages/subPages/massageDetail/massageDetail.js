let app = getApp();
let TIMER_INTERVAL = 1000;
Page({
  data: {
    switch_disabled: false,
    ossurl: app.ossurl,
    currentIndex: 0,
    runningTime: 0,
    progress: 0,
    noticeItems: app.globalData.massageNoticeItems,
    started: false,
  },
  onLoad: function(options) {
    app.loadPageData(this, "therapy", {
      "action": "mox",
      "therapyId": options.therapy
    }, function() {
      wx.setNavigationBarTitle({
        title: this.data.solution_name,
      })
    }.bind(this), function() {
      wx.reLaunch({
        url: "/pages/index/index",
      })
    }, null, "正在加载方案");
    wx.stopPullDownRefresh();
  },
  onPullDownRefresh: function() {
    this.onLoad(this.options);
  },
  bindSetAcupoint: function(e) {
    let targetIndex = e.currentTarget.dataset.index;
    let acupoint = this.data.therapy_details[targetIndex];

    if (this.data.currentIndex == targetIndex || acupoint.finished)
      return;
    if (!this.data.started) {
      this.setData({
        currentIndex: targetIndex,
        runningTime: 0,
        progress: 0,
      })
    } else {
      app.showError('请先结束');
    }
  },
  bindTherapyFinishTap: function(e) {
    let therapyId = this.options.therapy;
    let lastTherapy = this.data.therapy_day  == this.data.solution_days;
    this.setData({
      switch_disabled: true
    })
    app.invokeAPI("therapy", {
      "action": "process",
      "therapyId": therapyId
    }, function() {
      if (lastTherapy) {
        this.setData({
          showShare: true
        })
      } else {
        wx.reLaunch({
          url: '/pages/subPages/programsType/programsType',
        })
      }
    }.bind(this))
  },
  bindSwitchButtonTap: function(e) {
    let started = e.currentTarget.dataset.value == "true";
    this.timeTicks = 0;

    if (started) {
      this.startMassage();
      this.handler = setInterval(this.startMassage.bind(this), TIMER_INTERVAL);
    } else {
      this.stopMassage();
    }
  },
  bindLongTap: function(e) {
    if (!this.data.started) {
      this.setData({
        currentIndex: -1
      })
    } else {
      app.showError('请先结束');
    }
  },
  bindMassageAcupointTap: function(e) {
    let acupoint = this.data.therapy_details[this.data.currentIndex].detail_acupoint;
    wx.navigateTo({
      url: '../acupointDetails/acupointDetails?name=' + acupoint,
    })
  },
  startMassage() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
    let acupoint = this.data.therapy_details[this.data.currentIndex];
    let processedTime = Math.floor((++this.timeTicks) / 60);
    let totalTime = acupoint.detail_duration.match(/\d+/g)[0] * 1;
    this.setData({
      started: true,
      runningTime: processedTime,
      progress: (5 * this.timeTicks / 3 / totalTime).toFixed(2),
    })
    if (processedTime >= totalTime) {
      this.stopMassage();
      this.data.therapy_details[this.data.currentIndex].finished = true;
      this.setData({
        currentIndex: -1,
        therapy_details: this.data.therapy_details
      })
      let allFinished = true;
      for (let i = 0; i < this.data.therapy_details.length; i++) {
        allFinished &= this.data.therapy_details[i].finished;
      }
      if (allFinished) {
        this.bindTherapyFinishTap();
      }
    }
  },
  stopMassage() {
    wx.setKeepScreenOn({
      keepScreenOn: false,
    })
    this.setData({
      started: false,
    })
    clearInterval(this.handler);
    this.handler = 0;
  },
  bindCloseShareTap: function(e) {
    wx.reLaunch({
      url: '/pages/subPages/programsType/programsType',
    })
  },
  bindShareTap: function(e) {
    wx.redirectTo({
      url: '/pages/subPages/appraise/appraise?therapyId=' + this.options.therapy,
    })
  }
})