let app = getApp();
Page({
  binddownChange:function(e){
    var that = this;
    var currentIndex = e.currentTarget.dataset.index;
    var common_problem = that.data.common_problem;
    common_problem.map((ele,index)=>{
      if (currentIndex == index){
        ele.isChecked = !ele.isChecked;
      }
    })
    that.setData({
      currentIndex: currentIndex,
      "common_problem": common_problem
    })
  },
  onLoad: function (options) {
    getApp().loadPageHTML(this, "contact")
    app.loadJSON(this, "common_problem", function (res) {
    }.bind(this))
   ;
  }
})