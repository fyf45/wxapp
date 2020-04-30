const pageSize = 10;
const durations = {
  "一周内": 7,
  "一个月内": 30,
  "三个月内": 90,
  "所有记录": 0
};
let app = getApp();

Page({
  currentPage: 0,
  data: {
    "durations": durations,
    dataDuration: Object.keys(durations)[0],
    actionStatus: 1,
    deleteRecord: {
      "deleteIcon": "/static/image/historyRecord/guanli.jpg",
      "deleteRecordTxt": "管理"
    },
  },
  bindDurationMenuTap: function () {
    let page = this;
    wx.showActionSheet({
      itemList: Object.keys(durations),
      success(res) {
        page.setData({
          dataDuration: Object.keys(durations)[res.tapIndex],
          records: []
        })
        page.currentPage = 0;
        page.onLoad.bind(page)();
      }
    })
  },
  resetSwiper: function () {
    this.setData({
      currentSwiper: 0
    })
  },
  onLoad: function () {
    let records = this.data.records;
    let page = this;
    app.loadPageData(this, "therapy", {
      "action": "history",
      "daySpan": durations[this.data.dataDuration],
      "page": this.currentPage
    }, function (res) {
      if (res.records != null && res.records.length > 0 && records) {
        for (var i = 0; i < res.records.length; i++) {
          records.push(res.records[i]);
        }
        page.setData({
          "records": records
        })
      }
    });
  },
  onReachBottom: function (e) {
    if (this.data.size > (this.currentPage + 1) * pageSize) {
      this.currentPage++;
      this.onLoad(e);
    }
  },
  bindActionTap: function (e) {
    let page = this;
    this.resetSwiper();
    let currentStatus = this.data.actionStatus;
    if (currentStatus == 2) {
      return this.removeSelectedRecord(function () {
        this.swapCurrentStatus();
      }.bind(this));
    } else {
      this.swapCurrentStatus();
    }
  },
  swapCurrentStatus: function (currentStatus) {
    this.setData({
      actionStatus: (~this.data.actionStatus) & 3
    })
  },
  bindCheckboxClick: function (e) {
    let record = e.currentTarget.dataset.record;
    let index = e.currentTarget.dataset.index;
    this.data.records[index].checked = !this.data.records[index].checked;
    this.setData({
      records: this.data.records
    })
  },
  bindRemoveTap: function (e) {
    let index = e.currentTarget.dataset.index;
    this.data.records[index].checked = true;
    this.removeSelectedRecord(function () {
      this.resetSwiper();
    }.bind(this), {
      current_index: e.currentTarget.dataset.index
    });
  },
  removeSelectedRecord: function (callback, current_index) {
    if (this.data.records) {
      let removeList = [];
      let newRecords = [];
      if (current_index) {
        let current = current_index;
        removeList = [];
        this.data.records.forEach(function (record, index) {
          if (record.checked && current["current_index"] == index) {
            removeList.push(record.history_id);
          } else {
            newRecords.push(record);
            record.checked = false;
          }
        })
        this.setData({
          records: this.data.records
        })
      } else {
        this.data.records.forEach(function (record) {
          if (record.checked) {
            removeList.push(record.history_id);
          } else {
            newRecords.push(record);
          }
        })
      }
      if (removeList.length > 0) {
        return app.confirm("确定要删除" + removeList.length + "条记录吗？", function () {
          app.invokeAPI("therapy", {
            "action": "remove",
            "id_list": removeList
          }, function () {
            if (callback) {
              callback();
            }
            wx.showToast({
              title: '删除成功',
            })
            this.setData({
              records: newRecords,
              actionStatus: 1
            });
          }.bind(this), function () {
            app.showError("删除失败");
          })
        }.bind(this), function () {
          this.data.records.forEach(record => {
            record.checked = false;
          })
          removeList = [];
          if (callback) {
            callback();
          }
          this.setData({
            records: this.data.records,
            actionStatus: 1
          })
        }.bind(this));
      }
    }
    if (callback) {
      callback();
    }
  }
})