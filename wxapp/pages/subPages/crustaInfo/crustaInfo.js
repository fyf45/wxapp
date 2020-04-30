import {
  Formatter
} from "../../../utils/utils.js"

let app = getApp();

Page({
  data: {
    showRemarkArea: false
  },
  onLoad: function(options) {
    wx.showShareMenu({
      withShareTicket: true
    });
    let page = this;
    if (options && options.id) {
      this.id = options.id;
    }
    if (this.id) {
      app.loadPageData(this, "article", {
        "id": this.id
      }, function() {
          app.loadPageHTML(page, page.data.article.article_content)
      }.bind(this));
    }
  },
  onShow: function () {
    let _this = this;
    _this.setData({
      x: app.globalData.deviceInfo.windowWidth - 50,
      y: app.globalData.deviceInfo.windowHeight - 100,
    })
  },
  bindCommentTap(e) {
    this.setData({
      showRemarkArea: true
    })
  },
  bindCommentBlur(e) {
    this.setData({
      showRemarkArea: false
    })
  },
  bindCommentShow: function(e) {
    this.setData({
      keyboardHeight: e.detail.height
    })
  },
  bindRemarkFormSubmit: function(e) {
    app.invokeAPI("article", {
      action: "remark",
      id: this.id,
      content: e.detail.value.remarkContent
    }, function() {
      this.onLoad();
      this.setData({
        commentText: null
      })
    }.bind(this))
  },
  bindCommentInput: function(e) {
    this.setData({
      commentText: e.detail.value
    })
  },
  bindLikeTap: function(e) {
    app.invokeAPI("article", {
      action: "like",
      id: this.id,
    }, function() {
      this.onLoad();
    }.bind(this))
  },
  bindRemarkLikeTap: function(e) {
    if (e.currentTarget.dataset.id) {
      let remarkId = e.currentTarget.dataset.id;
      app.invokeAPI("article", {
        "action": "remarkLike",
        "id": this.id,
        "remarkId": remarkId
      }, function() {
        this.onLoad();
      }.bind(this))
    }
  }
})