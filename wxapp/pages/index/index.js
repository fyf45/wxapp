let app = getApp();
let user = app.getUser();
Page({
  data: {
    swiperCurrent: 0,
    guide_first: false,
    guide_num: 1,
    guide_txt: '请点击痛经辨证来测试您的体质吧',
    tabItem: [{
        'id': 1,
        'icon_img': '/static/image/index/tongjingbianzheng.png',
        'tab_text': '痛经辨证',
        'tab_url': '/pages/subPages/diagRecord/diagRecord'
      },
      {
        'id': 2,
        'icon_img': '/static/image/index/wodetiaoli.png',
        'tab_text': '我的调理',
        'tab_url': '/pages/subPages/programsType/programsType'
      }
    ]
  },
  bindGuideChange: function () {
    var that = this;
    var guide_num = that.data.guide_num;
    var guide_first = that.data.guide_first;
    var guide_txt = that.data.guide_txt;
    guide_num++;
    if (guide_num == 1) {
      guide_txt = '请点击痛经辨证来测试您的体质吧'
    } else if (guide_num == 2) {
      guide_txt = '"我的调理"是用来收藏个人调理方案的'
    } else if (guide_num == 3) {
      guide_txt = '如果有其他病痛可以试试搜索症状哦！'
    } else if (guide_num == 4) {
      guide_txt = '更多痛经症状，请点击这里。'
    } else {
      guide_first = false;
      wx.showTabBar()
    }
    that.setData({
      guide_num: guide_num,
      guide_first: guide_first,
      guide_txt: guide_txt
    })
  },
  bindMoxaUrl: function () {
    this.setData({
      guide_first: false
    })
    wx.showTabBar()
    wx.reLaunch({
      url: '/pages/moxa/moxa?showTabBar'
    })
  },
  swiperChange(e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  onLoad: function (options) {
    let that = this;
    var guide_first = (user = app.getUser()) ? false : true;
    if (guide_first)
      wx.hideTabBar();
    that.setData({
      guide_first: guide_first,
    })
    app.loadPageData(this, "index", {}, function (res) {
      app.globalData.products = res.products;
    });
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  onPullDownRefresh: function () {
    app.loadPageData(this, "index", null, function () {
      wx.stopPullDownRefresh();
    });
  }
})