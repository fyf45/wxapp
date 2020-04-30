let app = getApp();

Page({
  data:{
    isShowed:true
  },
  onLoad: function(options) {
    if (options.id) {
      let skuId = options.id;
      app.loadPageData(this, "sku", {
        "id": skuId
      }, function(res) {
        if (res.records.length > 0) {
          let sku = res.records[0];
          sku.sku_images = sku.sku_images.split(",");
          sku.sku_description = sku.sku_description.replace(/style=".+?"/g, "").replace(/class=".+?"/g, "").replace(/<img/g, '<img style="width:100%;height:auto;display:block"');
          this.setData({
            "sku": sku,
            "unaffordable": app.getUser().cowry < sku.sku_price,
          })
        }
      });
    }
    if(options.isShowed){
      this.setData({
        isShowed: false
      })
    }
  },
  bindPurchaseTap: function() {
    if (this.data.sku) {
      wx.redirectTo({
        url: '../orderSubmit/orderSubmit?id=' + this.data.sku.sku_id,
      });
    }
  }

})