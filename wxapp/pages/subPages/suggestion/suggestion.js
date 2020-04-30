let app = getApp();
Page({
  data: {
    suggestion_max_length: 300
  },
  bindwordNum: function (e) {
    this.setData({
      wordNum: e.detail.value.length
    })
  },
  bindFormSubmit: function (res) {
    if (this.data.wordNum) {
      app.invokeAPI("usercomment", {
        "comment": res.detail.value.suggestion
      }, function () {
        wx.showToast({
          title: '信息已提交',
          icon: "success",
          mask: true,
          duration: 2000,
          success: function() {
            wx.navigateBack({
              delta: 1
            })
          }
        })
      }, function (res) {
        if (res.errorCode == 10032) {
          app.showError('内容非法，请重新输入');
        } else {
          app.showError('请确认已填写信息再提交');
        }
      });
    }
  },
  onLoad: function (options) {}
})