let app = getApp();
Page({
  onLoad: function(options) {
    app.loadPageData(this, "search", {
      "action": "list"
      });
  },
  bindClearHistoryTap: function(e) {
    let page = this;
    let my = this.data.my;
    if (my && my.length > 0) {
      app.invokeAPI("search", {
        "action": "clear"
      }, function() {
        page.setData({
          my: []
        })
      })
    }
  }
})