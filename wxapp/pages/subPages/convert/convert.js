let app = getApp();

Page({
  data: {
    showIntro: false,
  },
  bindIntroButtonTap: function (e) {
    this.setData({
      "showIntro": !this.data.showIntro
    });
  },
  onLoad: function (options) {
    let showIntro = this.data.showIntro;
    showIntro = options.open_type ? true : false
    this.setData({
      cowry: app.getUser().cowry,
      'showIntro': showIntro
    })
    app.loadPageData(this, "sku");
  }
})