let app = getApp();

Page({

  onLoad: function(options) {
    this.setData({
      categoryId: options.categoryId,
      categoryName: options.categoryName
    })
    if (!options.categoryId) {
      wx.navigateBack({
        delta: 1
      })
    }
    wx.setNavigationBarTitle({
      title: options.categoryName || "贝壳健康"
    })
    app.loadPageData(this, "disease", { "categoryId": options.categoryId });
  }
})