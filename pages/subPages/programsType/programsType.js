let app = getApp();
let pageSize = 5;

Page({
  data: {
    currentText: ["全部", "未完成", "已完成"],
    currentTab: -1,
    pageSize: pageSize,
    tabs: [{
        title: "全部",
        action: "list",
        currentPage: 0
      },
      {
        title: "未完成",
        action: "listRunning",
        currentPage: 0
      },
      {
        title: "已完成",
        action: "listFinished",
        currentPage: 0
      }
    ]
  },
  currentPage: 0,
  onLoad: function (options) {
    let tabIndex = options.id * 1 ? options.id == 1 ? 2 : 1 : 0;
    this.switchTab(tabIndex);
    this.reloadData();
  },
  switchTab: function (tabIndex) {
    if (tabIndex != this.data.currentTab) {
      this.setData({
        currentTab: tabIndex,
        size: 0
      })
    }
  },
  reloadData() {
    this.data.tabs.forEach((tab) => {
      app.loadPageData(this, "therapy", {
        "action": tab.action
      }, function (res) {
        Object.assign(tab, res);
        this.setData({
          tabs: this.data.tabs,
          currentSwiper: 0
        })
      }.bind(this))
    }, this);
  },
  resetSwiper: function () {
    this.setData({
      currentSwiper: 0
    })
  },
  bindTabSwitched: function (e) {
    this.switchTab(e.target.dataset.current);
  },
  bindRemoveButtonTap: function (e) {
    return app.confirm("确定要删除吗？", function () {
      app.invokeAPI("therapy", {
        "action": "removed",
        "therapyId": e.target.dataset.therapyId
      }, function () {
        wx.showToast({
          title: '删除成功',
        })
        this.reloadData();
      }.bind(this), function (res) {
        console.error(res);
      });
    }.bind(this),function(){
      this.resetSwiper()
    }.bind(this))
  },
  onReachBottom: function () {
    let page = this;
    let tab = this.data.tabs[this.data.currentTab];

    if (tab.size > (tab.currentPage + 1) * pageSize) {
      let records = tab.records;
      app.loadPageData(this, "therapy", {
        "action": tab.action,
        "page": ++tab.currentPage
      }, function (res) {
        if (res.records != null && res.records.length > 0) {
          for (var i = 0; i < res.records.length; i++) {
            records.push(res.records[i]);
          }
          page.setData({
            tabs: this.data.tabs
          })
        }
      });
    }
  }
})