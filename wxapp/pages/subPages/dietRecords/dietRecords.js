let app = getApp();
Page({
  onLoad: function (options) {
    app.loadPageData(this, "therapy", {
      "action": "mox",
      "therapyId": options.therapy
    }, function (res) {
        wx.setNavigationBarTitle({
          title: this.data.solution_name,
        })
        if (res.therapy_details.length > 0) {
          this.setData({
            formulaData: [
              {
                type: "配方表",
                data: res.therapy_details[0].detail_acupoint.split("、")
              },
              {
                type: "功效",
                data: res.therapy_details[0].detail_temperature ? res.therapy_details[0].detail_temperature.split(";") : "-"
              },
              {
                type: "制作方法",
                data: res.therapy_details[0].detail_comment ? res.therapy_details[0].detail_comment.split(";") : "-"
              },
              {
                type: "食用方法",
                data: res.therapy_details[0].detail_duration ? res.therapy_details[0].detail_duration.split(";") : "-"
              }
            ]
          })
        }
    }.bind(this), function (err) {
      wx.reLaunch({
        url: "/pages/index/index",
      })
    }, null, "正在加载方案");
  },
  bindTherapyFinishTap: function (e) {
    let therapyId = this.options.therapy;
    let lastTherapy = this.data.therapy_day == this.data.solution_days;
    app.invokeAPI("therapy", {
      "action": "process",
      "therapyId": therapyId
    }, function () {
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
  bindCloseShareTap: function (e) {
    wx.reLaunch({
      url: '/pages/subPages/programsType/programsType',
    })
  },
  bindShareTap: function (e) {
    wx.redirectTo({
      url: '/pages/subPages/appraise/appraise?therapyId=' + this.options.therapy,
    })
  },
})