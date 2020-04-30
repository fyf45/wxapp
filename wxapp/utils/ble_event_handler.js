export default {
  onBleDeviceFound(e) {
    let newDev = e.detail;
    let originDev = this.devices.find(dev => dev.deviceId && dev.deviceId == newDev.deviceId);
    if (originDev) {
      originDev = Object.assign(originDev, newDev);
      return false;
    } else if (this.config.MAX_DEVICES_LIMIT > 0 && this.devices.length >= this.config.MAX_DEVICES_LIMIT) {
      return false;
    } else {
      this.devices.push(newDev);
      this.clearTimeoutDetect();
    }
  },
  onBleConnecting(e) {
    if (this.state.discovering) {
      this.stop();
    }
    e.detail.connecting = true;
  },
  onBleConnected(e) {
    let deviceId = e.params[0].deviceId;
    let device = e.params[0].device; //this.devices.find(target => target.deviceId == deviceId);
    if (device) {
      device.connected = true;
      delete device.connecting;
      this.getServices(device);
    }
  },
  onBleConnectedError(e) {
    let deviceId = e.params[0].deviceId;
    let device = e.params[0].device; //this.devices.find(target => target.deviceId == deviceId);
    device.retry = (device.retry || 0) + 1;
    if (this.config.BLE_CONN_RETRY_TIMES > 0 && device.retry >= this.config.BLE_CONN_RETRY_TIMES) {
      this.disconnect(device);
      return false;
    } else {
      delete device.connecting;
      this.connect(device);
    }
  },
  onBleConnectedComplete(e) {
    let device = e.params[0];
    delete device.connecting;
  },

  onBleGetServices(e) {
    let deviceId = e.params[0].deviceId;
    let device = e.params[0].device; //this.devices.find(target => target.deviceId == deviceId);
    device.services = [];
    let filters = this.filter.service_uuid;
    e.detail.services.forEach(service => {
      let uuid = service.uuid;
      let newService = Object.assign({
        deviceId: deviceId
      }, service);
      if (filters && filters.length > 0 && !filters.some(filter => uuid.includes(filter)))
        return;
      device.services.push(newService);
      this.getCharacteristics(newService);
    }, this);

  },
  onBleGetServicesError(e) {},
  onBleGetServicesComplete(e) {},

  onBleGetCharacteristics(e) {
    let service = e.params[0].service; 
    service.characteristics = [];
    e.detail.characteristics.forEach(char => {
      let newChar = Object.assign({
        serviceId: service.uuid,
        deviceId: service.deviceId
      }, char);
      service.characteristics.push(newChar);
      if (char.properties.notify || char.properties.indicate) {
        this.notifyCharacteristicValue(newChar);
      }
      if (char.properties.read) {
        this.readCharacteristicValue(newChar);
      }
    }, this);
  },
  onBleGetCharacteristicsError(e) {},
  onBleGetCharacteristicsComplete(e) {},

  onBleWriteCharacteristicValue(e) {
    let characteristic = e.params[0].characteristic;
    if (characteristic.properties.read) {
      this.readCharacteristicValue(characteristic);
    }
  },
  onBleWriteCharacteristicValueError(e) {},
  onBleWriteCharacteristicValueComplete(e) {},

  onBleReadCharacteristicValue(e) {},
  onBleReadCharacteristicValueError(e) {},
  onBleReadCharacteristicValueComplete(e) {},

  onBleNotifyCharacteristicValue(e) { },
  onBleNotifyCharacteristicValueError(e) { },
  onBleNotifyCharacteristicValueComplete(e) { },

  onBleDisconnected(e) {},
  onBleDisconnectedError(e) {},
  onBleDisconnectedComplete(e) {},

  onBleConnectionStateChanged(e) {
    let target = e.detail;
    let device = this.devices.find(dev => dev.deviceId == target.deviceId);
    if (device) {
      device.connected = target.connected;
    }
  },

  onBleCharacteristicValueChanged(e) {
    let targetCharacteristic = e.detail;
    let device = this.devices.find(dev => dev.deviceId == targetCharacteristic.deviceId);
    if (device && device.services && device.services.length > 0) {
      let service = device.services.find(service => service.uuid == targetCharacteristic.serviceId);
      if (service && service.characteristics && service.characteristics.length > 0) {
        let characteristic = service.characteristics.find(char => char.uuid == targetCharacteristic.characteristicId);
        if (characteristic) {
          characteristic.value = getApp().ab2hex(targetCharacteristic.value);
          this.raiseEvent("onBleCharacteristicValueArrived", {
            device: device,
            service: service,
            characteristic: characteristic
          });
        }
      }
    }
  },

  onBleCharacteristicValueArrived(e) {}
}