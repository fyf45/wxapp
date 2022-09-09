export default {
  onBTOpened(e) {
    getApp().keepScreenOn(true);
    this.start();
  },
  onBTOpenedError(e) {},
  onBTOpenedComplete(e) {},

  onBTStarted(e) {
    /*wx.getConnectedBluetoothDevices({
      services: this.filter.service_uuid,
      success: this.raiseEvent.bind(this, "onBTDevicesFound")
    })
    wx.getBluetoothDevices({
      success: this.raiseEvent.bind(this, "onBTDevicesFound")
    })*/
  },
  onBTStartedError(e) {},
  onBTStartedComplete(e) {},
  onBTStartTimeout(e) {
    this.stop();
  },

  onBTStopped(e) {},
  onBTStoppedError(e) {},
  onBTStoppedComplete(e) {
    delete this.stopping;
  },

  onBTClosed(e) {
    getApp().keepScreenOn(true);
  },
  onBTClosedError(e) {},
  onBTClosedComplete(e) {
    if (this.isRestarting) {
      delete this.isRestarting;
      this.open();
    }
  },

  onBTDevicesFound(e) {
    let devices = e.detail.devices;
    let that = this;
    if (devices && devices.length > 0) {
      devices.forEach(newDev => {
        if (that.validate(newDev)) {
          that.raiseEvent("onBleDeviceFound", newDev);
        }
      });
    }
  },

  onBTStateChanged(e) {
    this.state = e.detail;
  }
}