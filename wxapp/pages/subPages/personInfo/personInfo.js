import {
  Formatter
} from "../../../utils/utils.js"
let app = getApp();
let user = app.getUser();
let needUpload = false;
Page({
  data: {
    avatar: '',
    cWidth: 0,
    cHeight: 0,
    occupations: app.globalData.occupations,
    genderData: app.globalData.genders,
    birthday_start: Formatter.formatDate(new Date(new Date() - 100 * 365 * 24 * 60 * 60 * 1000)),
    birthday_end: Formatter.formatDate(new Date(new Date() - 3 * 365 * 24 * 60 * 60 * 1000)),
  },
  bindAvatarChange: function(e) {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 指定只能为压缩图，首先进行一次默认压缩
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(photo) {
        //-----返回选定照片的本地文件路径列表，获取照片信息-----------
        wx.getImageInfo({
          src: photo.tempFilePaths[0],
          success: function(res) {
            //---------利用canvas压缩图片--------------
            var ratio = 2;
            var canvasWidth = res.width //图片原始长宽
            var canvasHeight = res.height
            while (canvasWidth > 400 || canvasHeight > 400) { // 保证宽高在400以内
              canvasWidth = Math.trunc(res.width / ratio)
              canvasHeight = Math.trunc(res.height / ratio)
              ratio++;
            }
            that.setData({
              cWidth: canvasWidth,
              cHeight: canvasHeight
            })

            //----------绘制图形并取出图片路径--------------
            var ctx = wx.createCanvasContext('canvas')
            ctx.drawImage(res.path, 0, 0, canvasWidth, canvasHeight)
            ctx.draw(false, setTimeout(function() {
              wx.canvasToTempFilePath({
                canvasId: 'canvas',
                destWidth: canvasWidth,
                destHeight: canvasHeight,
                success: function(res) {
                  that.setData({
                    avatar: res.tempFilePath
                  })
                  needUpload = true;
                },
                fail: function(res) {}
              })
            }, 500))
          }, //留一定的时间绘制canvas
          fail: function(res) {
            console.log(res.errMsg)
          }
        })
      }
    })
  },
  openLocation: function() {
    var page = this;
    if (!this.data.region) {
      app.getLocation().then(function(addr) {
        page.setData({
          region: [addr.province, addr.city, addr.district]
        })
      }).catch(function(err) {});
    }
  },
  onLoad: function() {
    let user = app.getUser();
    this.setData({
      name: user.nickName,
      gender: user.gender,
      birthday: user.birthday,
      occupation: user.occupation,
      region: user.province ? [user.province, user.city, user.district] : "",
      avatar: user.avatarUrl || "/static/image/person/head.jpg",
    })
  },
  bindRegionChange: function(e) {
    this.setData({
      region: e.detail.value
    })
  },
  bindBirthdayChange: function(e) {
    this.setData({
      birthday: e.detail.value
    })
  },
  bindGenderChange: function(e) {
    this.setData({
      gender: e.detail.value
    })
  },
  bindOccupationChange: function(e) {
    this.setData({
      occupation: e.detail.value
    })
  },
  bindSave: function(e) {
    let data = this.data;
    let page = this;

    if (needUpload) {
      app.uploadFile(this.data.avatar, function(res) {
        page.setData({
          "avatar": res.data[data.avatar.substring(data.avatar.lastIndexOf("/") + 1)]
        });
        needUpload = false;
        app.globalData.refreshAvatar = true;
        page.saveProfile(data);
      }, function(err) {
        app.showError("保存失败");
      });
    } else {
      this.saveProfile(data);
    }
  },
  saveProfile: function(data) {
    app.invokeAPI("register", {
      "avatar": data.avatar,
      "province": data.region[0],
      "city": data.region[1],
      "district": data.region[2],
      "occupation": data.occupation,
      "gender": data.gender,
      "birthday": data.birthday
    }, function(res) {
      app.setUser(res.data);
      wx.showToast({
        title: '保存成功',
      })
      wx.navigateBack({
        delta: 1
      })
    }, function(err) {
      app.showError("保存失败");
    })
  }
})