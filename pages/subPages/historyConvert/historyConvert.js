let app = getApp();
let pageSize = 20;

Page({
  currentPage: 0,
  data: {
    source: app.globalData.cowrySource
  },

  onLoad: function(options) {
    app.loadPageData(this, "cowry");
  },

  onReachBottom: function() {
    let page = this;
    if (this.data.size > (this.currentPage + 1) * pageSize) {
      let records = this.data.records;
      app.loadPageData(this, "cowry", {
        "page": ++this.currentPage
      }, function(res) {
        if (res.records != null && res.records.length > 0) {
          for (var i = 0; i < res.records.length; i++) {
            records.push(res.records[i]);
          }
          page.setData({
            "records": records
          })
        }
      });
    }
  }
})