let app = getApp();
Page({
  data: {
    needRespond: false
  },
  onLoad: function(options) {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address'
          })
        }
      }
    })
    app.loadPageData(this, "address", {
      "action": "list"
    });
    if (options && options.needRespond) {
      this.setData({
        needRespond: true
      })
    }
  },
  onShow: function() {
    if (app.globalData.updateAddress) {
      app.globalData.updateAddress = false;
      this.onLoad();
    }
  },
  bindAddressAdd: function(e) {
    let page = this;
    wx.chooseAddress({
      success(res) {
        app.invokeAPI("address", Object.assign(res, {
          "action": "save"
        }), function(e) {
          wx.showToast({
            title: '地址添加成功',
            success(res) {
              page.onLoad.bind(page)();
            }
          }, )
        })
      },
      fail(err) {
        if (err.errMsg && err.errMsg.indexOf("cancel") < 0) {
          wx.navigateTo({
            url: '../addressFill/addressFill',
          })
        }
      }
    })
  },
  bindAddressEdit: function(e) {
    Object.assign(app.globalData, {
      address: e.currentTarget.dataset.item
    });
    wx.navigateTo({
      url: '../addressFill/addressFill?id=' + e.currentTarget.dataset.id,
    })
  },
  bindAddressTap: function(e) {
    if (this.data.needRespond) {
      let index = e.currentTarget.dataset.index;
      app.globalData.currentAddress = this.data.records[index];
      wx.navigateBack({
        delta: 1
      })
    }
  },
  bindAddressRemove: function(e) {
    let page = this;
    app.confirm('是否删除收货地址', function(res) {
      app.invokeAPI("address", {
        "action": "remove",
        "addressId": e.currentTarget.dataset.id
      }, function() {
        let records = page.data.records;
        records.splice(e.currentTarget.dataset.index, 1);
        page.setData({
          "records": records
        })
        wx.showToast({
          title: '删除成功'
        })
      })
    });
  },
})