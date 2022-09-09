import ajax from "utils/http.js"
import API from "utils/api.js"
import QQMapWX from "utils/qqmap-wx-jssdk.min.js"

const isDebug = false;
const map = new QQMapWX({
  key: "ISSBZ-5TM3W-FEXRN-OYBLA-2RYK7-IVBRU"
});

App({
  isDebug: false,
  ossurl: API.oss,
  globalData: {
    isDebug: isDebug,
    isIphoneX: false,
    occupations: ['科研人员', '工程技术人员', '农业技术人员', '飞机和船舶技术人员（飞行员、船舶指挥员）', '医师；药剂师，护理师', '经济/金融', '军人', '法律专业人员', '教学/文学人员', '医疗卫生辅助服务人员', '体育/安保/消防', '艺术工作人员', '新闻工作人员', '行政办公人员', '农、林、牧、渔生产人员', '生产加工', '采购销售人员', '仓储人员', '餐饮/酒店/旅游/健身娱乐', '运输（公路、铁路、航空、水上）服务人员', '社会服务和居民生活服务人员'],
    genders: ['其他', '男', '女'],
    cowrySource: {
      "register": "注册贝壳用户获得",
      "mox": "通过使用小贝壳艾灸获得",
      "share": "通过微信分享获得",
      "purchase": "通过贝壳兑换使用",
      "gift": "通过系统赠送获得",
      "comment": "通过评价方案获得",
      "promote": "通过分享新用户获得"
    },
    orderStates: ['审核中', '正在发货', '已发货', '已完成'],
    MOX_STATE_STORAGE_KEY: "lastMoxState",
    moxNoticeItems: ["1、施灸中请勿让艾瑶珠和手机距离过远，以免造成连接中断。",
      "2、请保持艾瑶珠电量充足，以免因其电量不足造成艾灸中断。"
    ],
    moxAnnounceItems: [
      "1、以下部位禁止施灸：关节，皮薄，肌少，筋肉结聚处，妊娠期妇女的腰骶部，下腹部，男女乳头，阴部，睾丸，大血管处，心脏部位，眼球。",
      "2、以下情景禁止施灸：极度疲劳。过饥过饱，酒醉，大汗淋漓，情绪不稳，身患某些传染病，高热，昏迷，抽风，或身体极度衰竭，形瘦骨立。",
      "3、请勿艾灸直接暴露在外的部位，如颜面。以免形成瘢痕，影响美观。",
      "4、老人、未成年人、无自理能力的人请在监护人指导下使用。",
      "5、请注意施灸的时长与温度，防止低温灼伤。不宜追求强烈灸感，以温热而无灼痛为宜",
      "6、火热及阴虚体质者，谨慎使用艾灸。",
      "7、糖尿病患者慎灸或者在专业人士指导下使用。",
      "8、破损性皮肤病，皮肤损伤者，禁用。瘢痕体质者慎用或在专业人士指导下使用。",
      "9、严重高血压患者慎用(收缩压大于180mmHg,舒张压大于110 mmHg)。",
      "10、青光眼患者发病期间眼压增高者，禁用。"
    ],
    massageNoticeItems: ["长按3秒震动开关开机",
      "点击震动开关循环调节档位",
      "(绿、黄、红三色灯表示轻、中、重三个档位)",
      "再次长按3秒开关关机"
    ]
  },
  ab2hex(buffer) {
    let ab = new Uint8Array(buffer);
    let result = 0;
    for (let i = 0; i < ab.length; i++) {
      let bit = ab[i];
      result += bit << (i * 8);
    }
    return result;
  },
  hex2ab(number, byteLength) {
    var byteLength = byteLength || (number > 0 ? Math.ceil(Math.log(number + 1) / Math.log(256)) : 1);
    var buffer = new ArrayBuffer(byteLength);
    var dataView = new DataView(buffer);
    for (var i = 0; i < byteLength; i++) {
      var digit = (number & (0xff << i * 8)) >> i * 8;
      dataView.setUint8(i, digit);
    }
    return buffer;
  },
  isFunction: function (cb) {
    return cb && typeof (cb) == "function";
  },
  log: function (level, message, optionalParams) {
    if (isDebug && this.isFunction(console[level])) {
      if (message)
        console[level](new Date().toISOString(), message);
      if (optionalParams && optionalParams[0])
        console[level](optionalParams);
    }
  },
  debug: function (message, ...optionalParams) {
    this.log("warn", message, optionalParams);
  },
  warn: function (message, ...optionalParams) {
    this.log("warn", message, optionalParams);
  },
  info: function (message, ...optionalParams) {
    this.log("info", message, optionalParams);
  },
  error: function (message, ...optionalParams) {
    this.log("error", message, optionalParams);
  },
  table: function (...optionalParams) {
    this.log("table", null, optionalParams);
  },
  showLoading(msg) {
    wx.showLoading({
      title: msg,
      mask: true,
    })
  },
  hideTips() {
    wx.hideLoading();
  },
  onLaunch: function (options) {
    this.login();
  },
  onShow: function (res) {
    this.reportDevice();
  },
  showError: function (errMsg) {
    wx.showToast({
      "title": errMsg,
      "image": "/static/icon/error.png",
      "mask": true
    })
  },
  setUser: function (user) {
    wx.setStorageSync('user', user);
  },
  getUser: function () {
    return wx.getStorageSync("user");
  },
  login: function () {
    let app = this;
    wx.checkSession({
      success() {
        let user = app.getUser();
        if (!user) {
          app.doLogin();
        }
      },
      fail() {
        app.doLogin();
      }
    })
    wx.getSystemInfo({
      success: function (res) {
        app.globalData.deviceInfo = res;
        app.globalData.isIphoneX = res.model.indexOf('iPhone X') >= 0;
      },
    })
  },
  reportDevice: function () {
    let deviceInfo = this.globalData.deviceInfo;
    let user = this.getUser();
    if (deviceInfo && user) {
      ajax(API.device, deviceInfo);
      ajax(API.access, wx.getLaunchOptionsSync());
    } else {
      setTimeout(this.reportDevice.bind(this), 500);
    }
  },
  keepScreenOn: function (screenOn) {
    if (wx.setKeepScreenOn) {
      wx.setKeepScreenOn({
        keepScreenOn: screenOn,
      })
    }
  },
  doLogin() {
    let app = this;
    wx.login({
      success(res) {
        if (res.code) {
          ajax(API.login + "?code=" + res.code).then(function (result) {
            app.setUser(result);
            wx.hideLoading();
          }).catch(function (err) {
            app.showError("服务器已停机！");
          });
        } else {
          app.showError("登陆已失效");
        }
      }
    })
  },
  loadPageHTML: function (page, uri, loadingText) {
    let app = this;
    this.checkCompatibilities(page);
    ajax(API[uri] || uri, {}, true, true, loadingText).then(function (res) {
      page.setData({
        html: res
      });
    }).catch(function (err) {
      // console.error(err);
      app.showError("页面加载失败");
    });
  },
  loadJSON: function (page, uri, callback, loadingText) {
    let app = this;
    this.checkCompatibilities(page);
    ajax(API[uri] || uri, {}, true, true, loadingText).then(function (res) {
      res = JSON.parse(res);
      page.setData(res);
      if (callback && typeof (callback) == "function") {
        callback.call(page, res);
      }
    }).catch(function (err) {
      // console.error(err);
      app.showError("数据加载失败");
    });
  },
  loadPageData: function (page, uri, params, callback, errorCallback, recordsRender, loadingText) {
    let app = this;
    let args = arguments;
    this.checkCompatibilities(page);
    if (!this.getUser()) {
      setTimeout(function () {
        app.loadPageData.apply(app, args);
      }, 200);
      return;
    }
    ajax(API[uri] || uri, params, true, false, loadingText).then(function (res) {
      if (recordsRender && typeof (recordsRender) == "function" && res.data.records && res.data.size) {
        let records = [];
        for (let i = 0; i < res.data.records.length; i++) {
          if (recordsRender(res.data.records[i]))
            records.push(res.data.records[i]);
        }
        res.data.records = records;
      }
      page.setData(res.data);
      if (callback)
        callback.call(page, res.data);
    }).catch(function (err) {
      if (err.statusCode > 400) {
        app.showError("服务器维护中");
        return;
      }
      if (errorCallback)
        errorCallback.call(page, err.data);
      else
        app.showError("数据加载失败");
    });
  },
  checkCompatibilities: function (page) {
    if (this.globalData.isIphoneX) {
      page.setData({
        btuBottom: "68rpx",
      })
    }
  },
  invokeAPI: function (uri, params, callback, errorHandler, showLoading, loadingText) {
    var app = this;
    if (showLoading != false) {
      this.showLoading(loadingText || '正在执行操作');
    }
    ajax(API[uri] || uri, params, false).then(function (res) {
      wx.hideLoading();
      if (callback) {
        callback(res);
      } else if (showLoading) {
        wx.showToast({
          title: '执行成功！',
        })
      }
    }).catch(function (err) {
      wx.hideLoading();
      // console.error(err);
      if (errorHandler)
        errorHandler(err);
      else
        app.showError("操作失败");
    });
  },
  resolveLocation: function () {
    return new Promise(function (resolve, reject) {
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          map.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude
            },
            success: function (res) {
              if (res.status == 0) {
                let addr = res.result.address_component;
                resolve(addr);
              }
            },
            fail: function (err) {
              // console.error(err);
              reject(err);
            }
          })
        },
      })
    });
  },
  uploadFile: function (file, successCallback, failCallback) {
    this.showLoading('正在上传');
    wx.uploadFile({
      url: API.oss,
      filePath: file,
      name: 'file',
      success: function (res) {
        wx.hideLoading();
        res.data = JSON.parse(res.data);
        if (res.statusCode == 200 && res.data.errorCode == 0) {
          if (successCallback) {
            successCallback(res.data);
          } else {
            wx.showToast({
              title: '文件上传成功',
            })
          }
        } else {
          if (failCallback) {
            failCallback(res);
          } else {
            getApp().showError("文件上传失败！");
          }
        }
      },
      fail: function (err) {
        wx.hideLoading();
        // console.error(err);
        if (failCallback) {
          failCallback(err);
        } else {
          getApp().showError("文件上传失败！");
        }
      }
    })
  },
  confirm: function (message, callback, cancelCallback, title) {
    wx.showModal({
      title: title || '提示',
      content: message,
      success: (res) => {
        if (res.confirm) {
          if (callback) {
            callback();
          }
        } else if (res.cancel) {
          if (cancelCallback)
            cancelCallback();
        }
      }
    })
  },
  getLocation: function () {
    let app = this;
    return new Promise(function (resolve, reject) {
      wx.getSetting({
        success: function (res) {
          if (!res.authSetting['scope.userLocation']) {
            wx.authorize({
              scope: 'scope.userLocation',
              success() {
                app.resolveLocation().then(function (res) {
                  resolve(res);
                }).catch(function (err) {
                  reject(err);
                });
              },
              fail(err) {
                reject(err);
              }
            })
          } else {
            app.resolveLocation().then(function (res) {
              resolve(res);
            }).catch(function (err) {
              reject(err);
            });
          }
        },
        fail: function (err) {
          reject(err);
        }
      })
    })
  }
})

Array.prototype.remove = function (item, predicate) {
  predicate = predicate || function (element, index, array) {
    return element == item;
  }
  let indexOf = this.findIndex(predicate, this);
  if (indexOf >= 0) {
    this.splice(indexOf, 1);
  }
  return this;
}