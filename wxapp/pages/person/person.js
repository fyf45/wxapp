import {
  Formatter
} from "../../utils/utils.js"
let app = getApp();
let user = app.getUser();
let pageLoaded = false;
Page({
  data: {
    showRegisterDialog: false,
    occupations: app.globalData.occupations,
    genderData: app.globalData.genders,
    gender: user.gender,
    region: [,,],
    birthday_start: Formatter.formatDate(new Date(new Date() - 100 * 365 * 24 * 60 * 60 * 1000)),
    birthday_end: Formatter.formatDate(new Date(new Date() - 3 * 365 * 24 * 60 * 60 * 1000)),
    menus: [{
        id: 1,
        name: "历史艾灸记录",
        url: "../subPages/historyRecord/historyRecord"
      },
      {
        id: 2,
        name: "贝壳兑换",
        url: "../subPages/convert/convert"
      },
      {
        id: 3,
        name: "收货地址",
        url: "../subPages/addressList/addressList"
      },
      {
        id: 4,
        name: "帮助与反馈",
        url: "../subPages/contact/contact"
      },
      {
        id: 5,
        name: "关于我们",
        url: "../subPages/about/about"
      }
    ],
  },
  onLoad: function() {
    let user = app.getUser();
    this.setData({
      userInfo: {
        name: user.nickName,
        avatar: user.avatarUrl || "/static/image/person/head.jpg",
        cowry: user.cowry,
        level: user.level || 1,
        levelName: user.levelName,
      },
      region: user.province ? [user.province, user.city, user.district] : [,,],
    }) 
  },
  onShow: function() {
    if (app.globalData.refreshAvatar) { 
      app.globalData.refreshAvatar = false;
      this.onLoad();
    } else if (pageLoaded) {
      let user = app.getUser();
      this.setData({
        userInfo: Object.assign(this.data.userInfo, {
          cowry: user.cowry,
          level: user.level || 1,
          levelName: user.levelName
        })
      })
    }
    pageLoaded = true;
  },
  bindUserInfo: function(e) {
    if (e.detail.userInfo) {
      app.invokeAPI("userinfo", e.detail, function (result) {
        app.setUser(result.data);
        this.onLoad();
        this.setData({
          gender: result.data.gender,
          showRegisterDialog: true
        })
      }.bind(this), function (err) {
        app.showError("授权失败！");
      }.bind(this));
    } else {
      app.showError("授权失败！");
    }
  },
  closeRegisterDialog: function () {
    this.setData({
      showRegisterDialog: false
    })
  },
  openLocation: function () {
    var page = this;
    if (!this.data.region) {
      app.getLocation().then(function (addr) {
        page.setData({
          region: [addr.province, addr.city, addr.district]
        })
      }).catch(function (err) {
        // do nothing if not fetch any location.
      });
    }
  },
  bindBirthdayChange: function (e) {
    let value = e.detail.value;
    this.setData({
      birthday: value
    })
  },

  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },

  bindGenderChange: function (e) {
    this.setData({
      gender: e.detail.value
    })
  },

  bindOccupationChange: function (e) {
    this.setData({
      occupation: e.detail.value
    })
  },
  bindRegister: function () {
    let data = this.data;
    let page = this;
    app.invokeAPI("register", {
      "province": data.region[0],
      "city": data.region[1],
      "district": data.region[2],
      "occupation": data.occupation,
      "gender": data.gender,
      "birthday": data.birthday
    }, function (res) {
      page.setData({
        showRegisterDialog: false
      })
      app.setUser(res.data);
      wx.showToast({
        title: '注册成功',
      })
    }, function (err) {
      app.showError("注册失败");
    })
  },
  previewImage: function (e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.src],
    })
  },
})