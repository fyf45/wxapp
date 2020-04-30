Page({
  onLoad(options) {
    getApp().loadPageData(this, "diagnotichistory", null, function (data) {
      let records = data.records || [];
      if (records.length > 0) {
        let timeline = {};
        for (let i = 0; i < records.length; i++) {
          let record = records[i];
          let year = record.create_date.year + 1900;
          let yearString = year + "年";
          let diagnoticYear = timeline[yearString];
          if (diagnoticYear == null) {
            timeline[yearString] = diagnoticYear = [];
          }
          record.isActive = i == 0
          timeline[yearString].push(record);
        }
        this.setData({
          "timeline": timeline
        })
      } else {
        wx.redirectTo({
          url: '../diagQuestion/diagQuestion',
        })
      }
    });
  },
  bindDiagnostic_result: function (e) {
    let timeline = this.data.timeline;
    for (let i in timeline) {
      if (i == e.currentTarget.dataset.yearindex) {
        timeline[i].filter((element, _index) => {
          element.isActive = _index == e.currentTarget.dataset.monthindex ? true : false
        })
      } else {
        timeline[i].filter((ele, index) => {
          ele.isActive = false
        })
      }
    }
    this.setData({
      "timeline": timeline
    })
  }
})