Component({
  properties: {
    keyword: {
      type: "String"
    }
  },

  lifetimes: {
    attached: function() {
      this.setData({
        searchKeyword: this.properties.keyword
      })
    }
  },

  methods: {
    bindSearchButtonTap: function() {
      if (this.data.searchKeyword) {
        wx.redirectTo({
          url: '/pages/subPages/searchList/searchList?keyword=' + this.data.searchKeyword,
        })
      } else {
        wx.navigateBack({
          delta: 1
        })
      }
    },
    bindKeywordInput: function(e) {
      let input = e.detail.value;
      let output = null;
      let re = /([\u4e00-\u9fa5\w]+)/g; 
      if (input.length > 0 && re.test(input)) {
        output = input.match(re).join().replace(/,/g,'');
      }
      this.setData({
        searchKeyword: output
      })
    },
    bindClearSearchTap: function(e) {
      this.setData({
        searchKeyword: null
      })
    },
  }
})