Page({
  data: {

  },
  onLoad: function (options) {
    this.setData(options);
    getApp().loadPageData(this, "disease", {
      "disease": options.disease
    })
  },
})