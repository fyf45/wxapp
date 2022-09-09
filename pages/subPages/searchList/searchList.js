let app = getApp();
Page({
  onLoad: function(options) {
    this.setData({
      searchKeyword: options.keyword
    })
    app.loadPageData(this, "search", {
      "action": "search",
      "keyword": options.keyword
    },null, null, function(res) {
      res.solution_name = res.solution_name.replace(options.keyword, '<span class="searchList-keyword">' + options.keyword + "</span>");
      res.disease_synopsis = res.disease_synopsis.replace(options.keyword, '<span class="searchList-keyword">' + options.keyword + "</span>");
      return true;
    })
  },
})