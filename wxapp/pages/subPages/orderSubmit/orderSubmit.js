let app = getApp();
Page({
  data: {
    currentItemIndex: 0,
    qty: 1,
  },
  onLoad(options) {
    if (options.id) {
      app.loadPageData(this, "inv", {
        id: options.id
      }, function () {
        this.setData({
          cowry: app.getUser().cowry
        })
      });
    }
  },
  onShow: function () {
    if (app.globalData.currentAddress) {
      this.setData({
        addresses: [app.globalData.currentAddress]
      })
      app.globalData.currentAddress = null;
    }
  },
  bindModelChanged(e) {
    let index = e.target.dataset.index;
    this.setData({
      "currentItemIndex": index,
    })
    this.validateQty();
  },
  validateQty(qty) {
    qty = qty || this.data.qty;
    let index = this.data.currentItemIndex;
    let targetQty = this.data.records[index].inv_quantity;
    let targetPrice = this.data.records[index].sku_price;
    let userCowry = this.data.cowry;
    let maxBid = userCowry / targetPrice | 0 > 0 ? userCowry / targetPrice | 0 : 1;
    this.setData({
      "qty": qty <= targetQty ? qty * targetPrice <= userCowry ? qty : maxBid : targetQty * targetPrice <= userCowry ? targetQty : maxBid
    });
    return this.data.qty;
  },
  bindQtyInput(e) {
    let targetQty = e.detail.value | 0 || 1;
    return this.validateQty(targetQty);
  },
  bindQtyTap(e) {
    this.setData({
      qty: this.data.qty + (e.target.dataset.offset | 0)
    })
  },
  bindOrderButtonTap(e) {
    let that = this;
    if (this.data.qty > 0 && this.data.addresses && this.data.addresses.length > 0 && this.data.cowry >= this.data.qty * this.data.records[this.data.currentItemIndex].sku_price) {
      let sku = this.data.records[this.data.currentItemIndex];
      let addr = this.data.addresses[0];
      app.invokeAPI("inv", {
        "action": "purchase",
        "id": sku.sku_id,
        "model": sku.sku_model,
        "qty": this.data.qty,
        "addressId": addr.address_id
      }, function () {
        wx.showToast({
          title: '订单创建成功',
          success() {
            wx.redirectTo({
              url: '../orderMessage/orderMessage',
            })
          }
        })
      }, function (err) {
        let errorString = "发生未知错误，请重试";
        if (err.errorCode == 10017) {
          errorString = "库存调取失败";
        } else if (err.errorCode == 10018) {
          errorString = "库存不足";
        } else if (err.errorCode == 10019) {
          errorString = "账户余额不足";
        } else if (err.errorCode == 10020) {
          errorString = "账户更新失败";
        } else if (err.errorCode == 10021) {
          errorString = "订单创建失败";
        }
        app.showError(errorString);
      })
    } else {
      that.setData({
        isClose: true
      })
    }
  },
  onShareAppMessage: function (res) {
    app.invokeAPI("share", null, function () {
      wx.navigateBack({
        delta: 100
      })
    });
    return {
      title: '贝壳健康',
      path: '/pages/index/index?openId=' + app.getUser().openId,
      imageUrl: app.ossurl + '/static/image/share01.png'
    }
  },
  onCloseshellBox: function () {
    this.setData({
      isClose: false
    })
  }
})