let app = getApp();

Page({
  data: {
    currentIndex: 0,
    ossurl: app.ossurl
  },
  handleItemTap: function (e) {
    this.setData({
      currentIndex: e.currentTarget.dataset.index
    })
  },
  onLoad: function (options) {
    if (options.id) {
      app.loadPageData(this, "disease", {
        "solutionId": options.id
      })
    } else {
      wx.navigateBack({
        delta: 1
      })
    }
  },
  bindAddTherapy: function (e) {
    let page = this;
    if (!this.data.therapyId) {
      this.addTherapy(this);
    } else {
      wx.navigateTo({
        url: '/pages/subPages/programsType/programsType?therapy=' + this.data.therapyId,
      })
    }
  },
  addTherapy: function (page, callback) {
    app.invokeAPI("therapy", {
      solutionId: page.data.solution_id,
      solutionName: page.data.solution_name,
      therapyDays: this.data.solution_days,
      "action": "save"
    }, function (e) {
      wx.showToast({
        title: '方案添加成功！',
        success: function () {
          page.setData({
            therapyId: e.data.therapyId
          });
          if (callback)
            callback();
        }
      })
    });
  },
  bindStartTherapy: function (e) {
    let page = this;
    if (!this.data.therapyId) {
      wx.showModal({
        title: '提示',
        content: '您还没有添加该方案，是否提交并开始？',
        success(res) {
          if (res.confirm) {
            page.addTherapy(page, function () {
              page.startTherapy();
            });
          } else if (res.cancel) {}
        }
      })
    } else {
      page.startTherapy();
    }
  },
  startTherapy: function () {
    if (this.data.solution_type == 0) {
      wx.navigateTo({
        url: '/pages/subPages/newMoxaStart/newMoxaStart?therapy=' + this.data.therapyId,
      })
    } else if (this.data.solution_type == 1) {
      wx.navigateTo({
        url: '/pages/subPages/massageDetail/massageDetail?therapy=' + this.data.therapyId,
      })
    } else {
      wx.navigateTo({
        url: '/pages/subPages/dietRecords/dietRecords?therapy=' + this.data.therapyId,
      })
    }
  }
})