let app = getApp();
Page({
  onLoad: function(options) {
    this.setData(options);
    if (options.name) {
      let name = decodeURIComponent(options.name);
      let videoName = encodeURIComponent(name);
      this.setData({
        acupoint: name,
        detail_type: options.detail_type,
        videoUrl: app.ossurl + "/acupoints/" + videoName + "/" + videoName + ".mp4",
        picUrl: app.ossurl + "/acupoints/" + options.name + "/" + options.name + ".jpg",
      })
      app.loadPageData(this, "acupoint", {
        "name": this.data.acupoint
      }, function(res) {}.bind(this));
    }
  },
  previewImage: function(e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.src],
    })
  }
})