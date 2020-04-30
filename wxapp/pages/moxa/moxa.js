let app = getApp();

Page({
  data: {},
  changeGroup: function (event) {
    var currentIndex = event.currentTarget.dataset.id;
    this.setData({
      selectedId: currentIndex
    })
  },
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        "selectedId": options.id
      })
    }
    if(options.showTabBar)wx.showTabBar();
    app.loadPageData(this, "mox", null, this.onDataArrived);
  },
  onDataArrived: function (data) {
    if (data) {
      data.selectedId = this.data.selectedId || (Object.keys(data.categories).length > 0 ? data.categories[Object.keys(data.categories)[0]].id : null);
      this.setData(data);
    }
  }
})
