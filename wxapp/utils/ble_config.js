export default {
  devices: [],
  state: {
    available: false,
    discovering: false
  },
  config: {
    MAX_DEVICES_LIMIT: -1,
    BT_SCAN_INTERVAL: 1000,
    BT_SCAN_TIMEOUT: 10000,
    BLE_CONN_TIMEOUT: 5000,
    BLE_CONN_RETRY_TIMES: 3,
    allowDuplicatesKey: false,
  },
  filter: {
    service_uuid: [],
    min_rssi: undefined,
    name_pattern: undefined
  }
}