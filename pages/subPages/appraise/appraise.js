Page({

  data: {
    score: 5,
  },

  onLoad: function(options) {
    if (!this.options.therapyId) {
      wx.navigateBack({
        delta: 1
      });
    }
  },

  bindStarTap: function(e) {
    let score = parseInt(e.target.dataset.score) || 0;
    if (score != this.data.score) {
      this.setData({
        score: score
      });
    }
  },

  bindCommentChange: function(e) {
    this.setData({
      comment: e.detail.value
    })
  },

  bindButtonTap: function() {
    getApp().invokeAPI("comment", Object.assign(this.options, this.data), function() {
      wx.redirectTo({
        url: '../userShare/userShare?therapy=' + this.options.therapyId
      })
    }.bind(this));
  },
})