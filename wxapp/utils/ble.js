import event from "ble_event"
import bleHandler from "ble_event_handler"
import btHandler from "bt_event_handler"
import bleOptions from "ble_config"

let ble = {
  init(btConfig, btFilter) {
    this.config = Object.assign(this.config, btConfig);
    this.filter = Object.assign(this.filter, btFilter);
    this.registerEvents();
  },
  open() {
    this.clearState();
    wx.openBluetoothAdapter(this.createEventCallBack("onBTOpened", {
      "mode": "central"
    }));
    return this;
  },
  start() {
    this.startTimeoutDetect();
    wx.startBluetoothDevicesDiscovery(this.createEventCallBack("onBTStarted", {
      //services: this.filter.service_uuid,
      allowDuplicatesKey: this.config.allowDuplicatesKey,
      interval: this.config.BT_SCAN_INTERVAL
    }));
    return this;
  },
  validate(device) {
    if (!device)
      return false;
    if (this.filter.name_pattern && (this.filter.name_pattern.test(device.name) == false || this.filter.name_pattern.test(device.localName) == false)) {
      return false;
    }
    if (this.filter.min_rssi && device.RSSI < this.filter.min_rssi)
      return false;
    return true;
  },
  connect(device) {
    if (!device.connected && !device.connecting) {
      this.raiseEvent("onBleConnecting", device);
      wx.createBLEConnection(this.createEventCallBack("onBleConnected", {
        deviceId: device.deviceId,
        device: device,
        timeout: this.config.BLE_CONN_TIMEOUT
      }));
    }
    return this;
  },
  getServices(device) {
    wx.getBLEDeviceServices(this.createEventCallBack("onBleGetServices", {
      deviceId: device.deviceId,
      device: device
    }));
    return this;
  },
  getCharacteristics(service) {
    wx.getBLEDeviceCharacteristics(this.createEventCallBack("onBleGetCharacteristics", {
      deviceId: service.deviceId,
      serviceId: service.uuid,
      service: service
    }));
    return this;
  },
  writeCharacteristicValue(characteristic, value, byteLength) {
    wx.writeBLECharacteristicValue(this.createEventCallBack("onBleWriteCharacteristicValue", {
      deviceId: characteristic.deviceId,
      serviceId: characteristic.serviceId,
      characteristicId: characteristic.uuid,
      characteristic: characteristic,
      value: getApp().hex2ab(value, byteLength || 1)
    }))
    return this;
  },
  readCharacteristicValue(characteristic) {
    wx.readBLECharacteristicValue(this.createEventCallBack("onBleReadCharacteristicValue", {
      deviceId: characteristic.deviceId,
      serviceId: characteristic.serviceId,
      characteristicId: characteristic.uuid,
      characteristic: characteristic
    }));
    return this;
  },
  notifyCharacteristicValue(characteristic) {
    wx.notifyBLECharacteristicValueChange(this.createEventCallBack("onBleNotifyCharacteristicValue", {
      deviceId: characteristic.deviceId,
      serviceId: characteristic.serviceId,
      characteristicId: characteristic.uuid,
      characteristic: characteristic,
      state: true
    }));
    return this;
  },
  disconnect(device) {
    if (device) {
      if (device.connected) {
        wx.closeBLEConnection(this.createEventCallBack("onBleDisconnected", {
          deviceId: device.deviceId
        }));
      }
      this.devices.remove(device);
      this.raiseEvent("onBleRemoved", device);
      if (this.devices.length == 0) {
        this.raiseEvent("onBTStartedError");
      }
    }
    return this;
  },
  restart() {
    this.isRestarting = true;
    this.close();
    return this;
  },
  stop() {
    if (this.state.discovering && !this.stopping) {
      this.stopping = true;
      wx.stopBluetoothDevicesDiscovery(this.createEventCallBack("onBTStopped"));
    }
    return this;
  },
  close() {
    this.clearTimeoutDetect();
    wx.closeBluetoothAdapter(this.createEventCallBack("onBTClosed"))
    return this;
  },
  destroy() {
    this.unRegisterEvents();
    return this;
  }
}

export default Object.assign(ble, {
  clearTimeoutDetect() {
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
      delete this.timeoutHandler;
    }
  },
  startTimeoutDetect() {
    this.timeoutHandler = setTimeout(function() {
      this.raiseEvent("onBTStartTimeout");
    }.bind(this), this.config.BT_SCAN_TIMEOUT);
  },
  clearState() {
    this.devices = [];
    this.state = {
      available: false,
      discovering: false
    }
  }
}, bleOptions, event, bleHandler, btHandler);