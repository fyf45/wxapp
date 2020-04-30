let app = getApp();
Page({
  data: {
    currentPanelIndex: 0,
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.disease,
    })
    this.setData({
      disease: options.disease
    })
    app.loadPageData(this, "disease", {
      "solution": options.disease
    })
  },
  bindCollapsePanelTap: function (e) {
    if (!e.target.id) {
      this.setData({
        currentPanelIndex: this.data.currentPanelIndex == e.currentTarget.dataset.index ? -1 : e.currentTarget.dataset.index,
        records:this.data.records
      })
    }
  },
  bindAddTherapy: function (e) {
    let page = this;
    let solution = e.target.dataset.solution;
    if (solution.therapyId != null) {
      wx.navigateTo({
        url: '/pages/subPages/programsType/programsType'
      })
    } else {
      this.addTherapy(this, e.target.dataset.solution);
    }
  },
  addTherapy: function (page, solution, callback) {
    app.invokeAPI("therapy", {
      solutionId: solution.solution_id,
      solutionName: solution.solution_name,
      therapyDays: solution.solution_days,
      "action": "save"
    }, function (e) {
      wx.showToast({
        title: '方案添加成功！',
        success: function () {
          for (let i = 0; i < page.data.records.length; i++) {
            let s = page.data.records[i];
            if (s.solution_id == solution.solution_id) {
              s.therapyId = e.data.therapyId;
              break;
            }
          }
          page.setData({
            "records": page.data.records
          });
          if (callback)
            callback(e.data.therapyId);
        }
      })
    });
  },
  bindStartTherapy: function (e) {
    let page = this;
    let solution = this.data.records[this.data.currentPanelIndex];
    if (!solution.therapyId) {
      wx.showModal({
        title: '提示',
        content: '您还没有添加该方案，是否提交并开始？',
        success(res) {
          console.log(res)     
          if (res.confirm) {
            page.addTherapy(page, solution, function (therapyId) {
              this.startTherapy(therapyId, solution.solution_type);
            }.bind(page));
          } else if (res.cancel) {}
        }
      })
    } else {
      this.startTherapy(solution.therapyId, solution.solution_type);
    }
  },
  startTherapy: function (therapyId, solutionType) {
    if (solutionType == 0) {
      wx.navigateTo({
        url: '/pages/subPages/newMoxaStart/newMoxaStart?therapy=' + therapyId,
      })
    } else if (solutionType == 1) {
      wx.navigateTo({
        url: '/pages/subPages/massageDetail/massageDetail?therapy=' + therapyId,
      })
    } else {
      wx.navigateTo({
        url: '/pages/subPages/dietRecords/dietRecords?therapy=' + therapyId,
      })
    }
  },
  onShareAppMessage: function (res) {
    app.invokeAPI("share", null, function () {
      wx.navigateBack({
        delta: 100
      })
    });
    return {
      title: '贝壳健康',
      path: '/pages/index/index?openId=' + app.getUser().openId,
      imageUrl: app.ossurl + '/static/image/share01.png'
    }
  }
})