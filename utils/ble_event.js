let app = getApp();
export default {
  createEventCallBack(event, ...params) {
    let callback = {
      success: function(res) {
        this.raiseEvent(event, res, params);
      }.bind(this),
      fail: function(err) {
        this.raiseEvent(event + "Error", err, params);
      }.bind(this),
      complete: function(res) {
        this.raiseEvent(event + "Complete", res, params);
      }.bind(this)
    };
    params.forEach(param => Object.assign(callback, param));
    return callback;
  },
  registerEvents() {
    this.handlers = [];
    wx.onBluetoothDeviceFound(this.onBluetoothDeviceFound.bind(this));
    wx.onBluetoothAdapterStateChange(this.onBluetoothAdapterStateChange.bind(this));
    wx.onBLEConnectionStateChange(this.onBLEConnectionStateChange.bind(this));
    wx.onBLECharacteristicValueChange(this.onBLECharacteristicValueChange.bind(this));
    this.registerHandler(this);
  },
  registerHandler(newHandler, thisArgs) {
    if (this.handlers.every(handler => handler != newHandler)) {
      newHandler.__thisArgs = thisArgs || this;
      this.handlers.push(newHandler);
    }
  },
  unRegisterEvents() {
    if (app.isFunction(wx.offBluetoothDeviceFound)) {
      wx.offBluetoothDeviceFound(this.onBluetoothDeviceFound)
    }
    if (app.isFunction(wx.offBluetoothAdapterStateChange)) {
      wx.offBluetoothAdapterStateChange(this.onBluetoothAdapterStateChange)
    }
    if (app.isFunction(wx.offBLEConnectionStateChange)) {
      wx.offBLEConnectionStateChange(this.onBLEConnectionStateChange)
    }
    if (app.isFunction(wx.offBLECharacteristicValueChange)) {
      wx.offBLECharacteristicValueChange(this.onBLECharacteristicValueChange)
    }
  },
  raiseEvent(event, eventObj, eventParams) {
    if (event.endsWith("Error")) {
      app.error(`[${event}]`, eventObj);
    } else if (event.endsWith("Complete")) {
      app.info(`[${event}]`, eventObj);
    } else {
      app.debug(`[${event}]`, eventObj);
    }
    for (let handler of this.handlers) {
      let method = handler[event];
      let thisArgs = handler.__thisArgs;
      let param = {
        type: event,
        detail: eventObj,
        params: eventParams
      };
      if (method && typeof(method) == "function") {
        if (method.call(thisArgs, param) == false)
          break;
      }
    }
  },
  onBluetoothDeviceFound: function(res) {
    this.raiseEvent("onBTDevicesFound", res);
  },
  onBluetoothAdapterStateChange: function(res) {
    this.raiseEvent("onBTStateChanged", res);
  },
  onBLEConnectionStateChange: function(res) {
    this.raiseEvent("onBleConnectionStateChanged", res);
  },
  onBLECharacteristicValueChange: function(res) {
    this.raiseEvent("onBleCharacteristicValueChanged", res);
  },
}