import ble from "../../../utils/ble.js"

const mapping = {
  "8881": "switch",
  "8882": "temperature",
  "8883": "targetTemperature",
  "8884": "battery",
  "8885": "maxRunningTime",
  "8886": "runningTime",
  "8887": "detailId"
}

const DATA_REFRESH_TIME_SPAN = 200;
let app = getApp();
let timeoutHandler = 0;
let ADJUST_DELAY_TIMEOUT = 500;
let MOX_STATE_STORAGE_KEY = app.globalData.MOX_STATE_STORAGE_KEY;
let isPulling = false;

let btConfig = {
  MAX_DEVICES_LIMIT: 6,
};

let btFilter = {
  service_uuid: ['8880'],
  min_rssi: -75,
  name_pattern: /^CC\-[1-8]$/
};

Page({
  data: {
    RSSI_MIN: btFilter.min_rssi,
    RSSI_MAX: -44,
    switch_disabled: false,
    ossurl: app.ossurl,
    userAgreed: true,
    moxType: 0,
    SIGNAL_BARS: 5,
    noticeItems: app.globalData.moxNoticeItems,
    announceItems: app.globalData.moxAnnounceItems,
    noDeviceDetected: false,
    currentDeviceIndex: -1,
    currentIndex: -1,
    MOX_MINIMUM_TEMPERATURE: 40,
    MOX_MAXIMUM_TEMPERATURE: 56,
    MOX_DEFAULT_DURATION: 30,
  },
  /** User Driven Event Area */
  bindAgreeRadioTap: function () {
    this.setData({
      userAgreed: !this.data.userAgreed
    })
  },
  bindAgreeButtonTap: function () {
    app.invokeAPI("agree", null, function (res) {
      let user = app.getUser();
      user.agreed = true;
      app.setUser(user);
      this.setData({
        agreed: app.getUser().agreed
      })

    }.bind(this))
  },
  bindDeviceTap: function (e) {
    let index = e.type == "tap" ? e.currentTarget.dataset.index : e.detail.current;
    this.isDeviceTapping = true;
    this.connect(index);
  },
  bindSwiperChange: function (e) {
    if (!this.isDeviceTapping)
      this.bindDeviceTap(e);
    delete this.isDeviceTapping;
  },
  bindSetAcupoint: function (e) {
    let acupoint = this.data.therapy_details[e.currentTarget.dataset.index];
    let targetIndex = e.currentTarget.dataset.index;
    let device = this.data.devices[this.data.currentDeviceIndex];
    this.setData({
      currentIndex: targetIndex
    })
    if (acupoint.selected)
      return;
    if (!device.switch) {
      if (device.acupoint) {
        device.acupoint.selected = false;
        device.acupoint.deviceId = null;
        device.acupoint = null;
      }
      acupoint.selected = true;
      device.acupoint = acupoint;
      acupoint.deviceId = device.deviceId;
      device.targetTemperature = parseInt(acupoint.detail_temperature) || 0;
      device.maxRunningTime = acupoint.detail_total_seconds;
      device.runningTime = acupoint.detail_current_seconds;
      this.write(this.data.currentDeviceIndex, btFilter.service_uuid[0], "8883", device.targetTemperature, 1);
      this.write(this.data.currentDeviceIndex, btFilter.service_uuid[0], "8885", device.maxRunningTime, 2);
      this.write(this.data.currentDeviceIndex, btFilter.service_uuid[0], "8886", device.runningTime, 2);
      this.write(this.data.currentDeviceIndex, btFilter.service_uuid[0], "8887", acupoint.detail_id, 2);
      this.setData(this.data);
    } else {
      app.showError('请先关闭灸头');
    }
  },
  bindScanButtonTap: function (e) {
    this.setData({
      currentDeviceIndex: -1,
      noDeviceDetected: false,
    })
    wx.setNavigationBarTitle({
      title: this.data.solution_name,
    });
    app.showLoading('正在初始化');
    ble.restart();
  },
  bindRemoveAcupoint: function (e) {
    let device = this.data.devices[this.data.currentDeviceIndex];
    if (!device.switch && device.acupoint) {
      device.acupoint.selected = false;
      device.acupoint.deviceId = null;
      device.acupoint = null;
      this.setData(this.data);
      this.write(this.data.currentDeviceIndex, btFilter.service_uuid[0], "8887", 0, 2);
    }
  },
  bindDeviceAcupointTap: function (e) {
    let acupoint = this.data.devices[this.data.currentDeviceIndex].acupoint;
    if (acupoint) {
      wx.navigateTo({
        url: '../acupointDetails/acupointDetails?name=' + acupoint.detail_acupoint,
      })
    }
  },
  bindAdjustTargetTemperature: function (e) {
    if (timeoutHandler > 0) {
      clearTimeout(timeoutHandler);
      timeoutHandler = 0;
    }
    let device = this.data.devices[this.data.currentDeviceIndex];
    let offset = e.currentTarget.dataset.offset * 1;
    if (!device.targetTemperature)
      device.targetTemperature = this.data.MOX_MINIMUM_TEMPERATURE;
    device.targetTemperature += offset;
    if (device.targetTemperature > this.data.MOX_MAXIMUM_TEMPERATURE)
      device.targetTemperature = this.data.MOX_MAXIMUM_TEMPERATURE;
    if (device.targetTemperature < this.data.MOX_MINIMUM_TEMPERATURE)
      device.targetTemperature = this.data.MOX_MINIMUM_TEMPERATURE;
    this.setData(this.data);
    timeoutHandler = setTimeout(function () {
      this.write(this.data.currentDeviceIndex, btFilter.service_uuid[0], "8883", device.targetTemperature, 1);
      this.read(this.data.currentDeviceIndex, btFilter.service_uuid[0], "8882");
    }.bind(this), ADJUST_DELAY_TIMEOUT);

  },
  bindTherapyFinishTap: function (e) {
    let therapyId = this.data.therapyId;
    let lastTherapy = this.data.therapy_day == this.data.solution_days;
    this.setData({
      switch_disabled: true
    })
    app.invokeAPI("therapy", {
      "action": "process",
      "therapyId": therapyId
    }, function () {
      this.data.devices.forEach((device, index) => this.write(index, btFilter.service_uuid[0], "8881", 0, 1), this);
      this.reportAllDevice();
      if (lastTherapy) {
        this.setData({
          showShare: true
        })
      } else {
        wx.reLaunch({
          url: '/pages/subPages/programsType/programsType',
        })
      }
    }.bind(this))
  },
  bindCloseShareTap: function (e) {
    wx.reLaunch({
      url: '/pages/subPages/programsType/programsType',
    })
  },
  bindShareTap: function (e) {
    wx.redirectTo({
      url: '/pages/subPages/appraise/appraise?therapyId=' + this.options.therapyId,
    })
  },
  bindSwitchTap: function (e) {
    let index = e.currentTarget.dataset.index;
    let value = e.currentTarget.dataset.value;
    this.write(index, btFilter.service_uuid[0], "8881", value, 1);
  },
  connect: function (index) {
    let device = ble.devices[index];
    ble.connect(device);
    this.setData({
      currentDeviceIndex: index
    })
  },
  write: function (index, serviceId, prop, value, byteLength = 1) {
    if (index < 0 || index + 1 > ble.devices.length)
      return;
    let device = ble.devices[index];
    if (device.services && device.services.length > 0) {
      device.services.forEach(service => {
        if (serviceId && !service.uuid.includes(serviceId)) {
          return;
        }
        if (service && service.characteristics && service.characteristics.length > 0) {
          service.characteristics.forEach(char => {
            if (prop && !char.uuid.includes(prop)) {
              return;
            }
            app.showLoading('正在执行');
            ble.writeCharacteristicValue(char, value, byteLength);
          })
        }
      })
    }
  },
  read: function (index, serviceId, prop) {
    if (index < 0 || index + 1 >= ble.devices.length)
      return;
    let device = ble.devices[index];
    if (device.services && device.services.length > 0) {
      device.services.forEach(service => {
        if (serviceId && !service.uuid.includes(serviceId)) {
          return;
        }
        if (service && service.characteristics && service.characteristics.length > 0) {
          service.characteristics.forEach(char => {
            if (prop && !char.uuid.includes(prop)) {
              return;
            }
            ble.readCharacteristicValue(char);
          })
        }
      })
    }
  },
  reportAllDevice() {
    let devices = this.data.devices || [];
    devices.forEach(device => this.reportDevice(device), this);
  },
  reportDevice(device) {
    if (device.runningTime > 0) {
      app.invokeAPI("therapy", {
        "action": "report",
        "therapyId": this.data.therapyId,
        "device": device,
        "therapyDay": this.data.therapy_day,
        "solutionDays": this.data.solution_days,
        "solutionName": this.data.solution_name,
        "solutionId": this.data.solution_id,
      });
      this.write(this.data.currentDeviceIndex, btFilter.service_uuid[0], "8886", 0, 2);
      this.write(this.data.currentDeviceIndex, btFilter.service_uuid[0], "8887", 0, 2);
    }
  },
  onLoad: function (options) {
    this.setData({
      "agreed": app.getUser().agreed ? true : false,
      "moxType": options.therapy ? 1 : 0,
      "therapyId": options.therapy,
      products: app.globalData.products,
      bluetoothOff: false
    })
    ble.init(btConfig, btFilter);
    ble.registerHandler(this, this);
    app.globalData.currentPage = this;
    if (this.data.moxType) {
      app.loadPageData(this, "therapy", {
        "action": "mox",
        "therapyId": this.data.therapyId
      }, function () {
        this.bindScanButtonTap();
      }.bind(this), function () {
        wx.reLaunch({
          url: "/pages/index/index",
        })
      }, null, "正在加载方案");
    } else {
      this.bindScanButtonTap();
    }
  },
  onUnload: function () {
    app.globalData.currentPage = null;
    ble.stop();
    ble.close();
    ble.destroy();
  },
  onPullDownRefresh: function () {
    this.isPulling = true;
    this.setData({
      noDeviceDetected: false
    })
    ble.restart();
  },
  onBTOpened: function (e) {
    this.setData({
      bluetoothOff: false
    })
  },
  onBTOpenedError: function (e) {
    wx.hideLoading();
    this.setData({
      bluetoothOff: true
    })
  },
  onBTStartTimeout: function (e) {
    wx.hideLoading();
    this.setData({
      noDeviceDetected: true
    })
  },
  onBTStarted: function (e) {
    app.showLoading('正在搜索');
  },
  onBTStartedError: function (e) {
    wx.hideLoading();
    this.setData({
      noDeviceDetected: true
    })
  },
  onBTOpenedComplete: function (e) {
    if (this.isPulling) {
      wx.stopPullDownRefresh();
      delete this.isPulling;
    }
  },
  onBTClosed: function (e) {
    this.setData({
      devices: [],
      currentDeviceIndex: -1
    })
  },
  onBleDeviceFound: function (e) {
    let dev = e.detail;
    dev.name = dev.name || dev.localName;
    dev.model = dev.name.replace("CC-", "");
    dev.strength = dev.RSSI < this.data.RSSI_MIN ? 0 : dev.RSSI < this.data.RSSI_MAX ? Math.ceil((dev.RSSI - this.data.RSSI_MIN) * this.data.SIGNAL_BARS / (this.data.RSSI_MAX - this.data.RSSI_MIN)) : this.data.SIGNAL_BARS;
    this.bindDevices();

    ble.connect(dev);
    if (this.data.currentDeviceIndex < 0) {
      this.connect(0);
    }
  },
  onBleConnecting: function (e) {
    app.showLoading(`正在连接${e.detail.model}号`);
  },
  onBleConnected: function (e) {
    if (ble.devices.every(dev => dev.connected))
      wx.hideLoading();
  },
  onBleConnectedError: function (e) {
    //app.showError("连接失败，请重试！");
  },
  onBleRemoved: function (e) {
    this.bindDevices();
    if (ble.devices.every(dev => dev.connected))
      wx.hideLoading();
  },
  onBleConnectionStateChanged: function (e) {
    this.bindDevices();
  },
  onBleCharacteristicValueArrived: function (e) {
    let char = e.detail.characteristic;
    let device = e.detail.device;
    let charId = char.uuid.substring(4, 8);
    let key = mapping[charId];
    let originValue = device[key];
    let newValue = char.value;
    if (newValue != originValue) {
      device[key] = newValue;
      this.onDeviceValueChanged(device, key, originValue);
      this.bindDevices();
    }
  },
  onBleWriteCharacteristicValueComplete(e) {
    wx.hideLoading();
  },
  onBleReadCharacteristicValueComplete(e) {
    wx.hideLoading();
  },
  onDeviceValueChanged(device, key, originValue) {
    if (key == "switch") {
      if (originValue) {
        this.reportDevice(device);
      }
    }
    if (device.switch && device.detailId > 0 && !device.acupoint) {
      let acupoint = this.data.therapy_details.find(acupoint => acupoint.detail_id == device.detailId);
      if (acupoint) {
        acupoint.selected = true;
        acupoint.deviceId = device.deviceId;
        device.acupoint = acupoint;
        this.setData({
          therapy_details: this.data.therapy_details
        })
      }
    }
  },
  bindDevices: function () {
    if (!this.isBindingDevice) {
      this.isBindingDevice = setTimeout(function () {
        this.setData({
          devices: ble.devices
        })
        delete this.isBindingDevice;
      }.bind(this), DATA_REFRESH_TIME_SPAN);
    }
  }
})