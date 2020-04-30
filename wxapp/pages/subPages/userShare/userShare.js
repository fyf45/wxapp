let app = getApp();

Page({


  onLoad: function (options) {
    if (this.options.therapy) {
      this.setData({
        isComment: true
      })
      wx.setNavigationBarTitle({
        title: '评价成功',
      })
    }

  },
  onShareAppMessage: function (res) {
    app.invokeAPI("share", null, function() {
      wx.navigateBack({
        delta: 100
      })
    });
    return {
      title: '贝壳健康',
      path: '/pages/index/index?openId=' + app.getUser().openId,
      imageUrl: app.ossurl + '/static/image/share.png'
    }
  }
})