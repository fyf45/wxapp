import {
  Formatter
} from "../../../utils/utils.js"
let app = getApp();
const pageSize = 10;
Page({
  currentPage: 0,
  data: {
    logisticsData: {}
  },

  onLoad: function(options) {
    getApp().loadPageData(this, "order", null, null, null, function(record) {
      let date = record.create_date;
      record.create_date = Formatter.formatDateTime(record.create_date);
      record.order_state_text = app.globalData.orderStates[record.order_state];
      return record;
    });
    if (options.pullDown)
      wx.stopPullDownRefresh();
  },

  bindLogisticsTap: function(e) {
    let logistics = e.currentTarget.dataset.logistics;
    let id = logistics.id;
    if (this.data.logisticsData[id]) {
      this.data.logisticsData[id].display = !this.data.logisticsData[id].display;
      this.setData({
        logisticsData: this.data.logisticsData
      });
    } else {
      app.invokeAPI("logistics", logistics, function(res) {
        this.data.logisticsData[id] = {
          display: true,
          success: res.data.code == "OK",
          records: res.data.list,
          message: res.data.msg
        };
        this.setData({
          logisticsData: this.data.logisticsData
        });
      }.bind(this));
    }
  },

  onPullDownRefresh: function() {
    this.onLoad({
      pullDown: true
    });
  },

  onReachBottom: function() {
    let page = this;
    if (this.data.size > (this.currentPage + 1) * pageSize) {
      let records = this.data.records;
      app.loadPageData(this, "order", {
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
      }, null, function(record) {
        let date = record.create_date;
        record.create_date = Formatter.formatDateTime(record.create_date);
        record.order_state_text = app.globalData.orderStates[record.order_state];
        return record;
      });
    }
  }

})