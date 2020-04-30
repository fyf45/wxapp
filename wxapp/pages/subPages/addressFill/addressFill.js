let app = getApp();
Page({
  data: {
    address: {},
    errors: {}
  },
  bindDefaultRadioTap: function() {
    let address = this.data.address;
    address.address_default = !address.address_default;
    this.setData({
      "address": address
    })
  },
  bindLabelRadioTap: function(e) {
    let address = this.data.address;
    address.address_label = e.currentTarget.dataset.label;
    this.setData({
      "address": address
    })
  },
  bindInputCheck: function(e) {
    let address = this.data.address;
    let key = e.currentTarget.id;
    let value = e.detail.value;
    if (key == "address_mobile") {
      if (!(/^1[3456789]\d{9}$/.test(value))) {
        if (!this.data.errors["address_mobile"]) {
          if (e.type == "blur")
            app.showError("手机号错误");
          this.data.errors["address_mobile"] = e.currentTarget;
        }
      } else {
        delete this.data.errors["address_mobile"];
      }
    }
    address[key] = value;
    this.setData({
      "errors": this.data.errors,
      "errorsCount": Object.keys(this.data.errors).length,
      "address": address
    })
  },
  bindGetPhoneNumber: function(e) {
    e.detail.sessionKey = app.getUser().sessionKey;
    app.invokeAPI("phone", e.detail, function(res) {
      Object.assign(this.data.address, {
        "address_mobile": res.data.phoneNumber
      });
      this.setData({
        "address": this.data.address
      })
    }.bind(this))
  },

  bindRegionChange: function(e) {
    let address = this.data.address;
    address.address_province = e.detail.value[0];
    address.address_city = e.detail.value[1];
    address.address_county = e.detail.value[2];
    this.setData({
      "address": address
    })
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({
        address: app.globalData.address
      })
      app.globalData.address = null;
    } else if (options.needRespond) {
      this.setData({
        needRespond: true
      })
    }
  },
  bindSaveButton: function(e) {
    let address = this.data.address;
    app.invokeAPI("address", {
      "action": address.address_id ? "update" : "save",
      "addressId": address.address_id,
      "userName": address.address_user,
      "telNumber": address.address_mobile,
      "telephone": address.address_telephone,
      "provinceName": address.address_province,
      "cityName": address.address_city,
      "countyName": address.address_county,
      "detailInfo": address.address_detail,
      "label": address.address_label,
      "isDefault": address.address_default,
      "nationalCode": address.address_nation_code,
      "postalCode": address.address_postal_code
    }, function(res) {
      wx.showToast({
        title: '保存成功',
        success: function(res) {
          app.globalData.updateAddress = true;
          if (this.data.needRespond)
            app.globalData.currentAddress = address;
          wx.navigateBack({
            delta: 1
          })
        }.bind(this)
      })
    }.bind(this), function(err) {
      app.showError("保存失败,请重试");
    });
  }
})