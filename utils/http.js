import CryptoJS from "crypto-js.js"

let aesKey = CryptoJS.enc.Utf8.parse('cc-^&2gE^fEB3S@4');
let aesIV = CryptoJS.enc.Utf8.parse('a@Fq10Wg^jNz*Adg');
let reJSON = /^\{.*?\}$/;

function encrypt(plaintext) {
  return CryptoJS.AES.encrypt(plaintext, aesKey, {
    iv: aesIV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
};

function decrypt(ciphertext) {
  return CryptoJS.AES.decrypt(ciphertext, aesKey, {
    iv: aesIV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8);
};

export default function ajax(uri, data, showLoading, isPlainText, loadingText) {
  if (uri) {
    return new Promise((resolve, reject) => {
      if (showLoading) {
        getApp().showLoading(loadingText || '数据加载中');
      }
      let user = wx.getStorageSync("user");
      wx.request({
        "url": uri,
        "data": data,
        "dataType": "text",
        "header": {
          'content-type': 'application/json; charset=utf-8',
          'cookie': wx.getStorageSync("cookie"),
          'open-id': user ? user.openId : "",
          'session-key': user ? user.sessionKey : ""
        },
        method: isPlainText ? "GET" : "POST",
        success(res) {
          var cookie = res.header["Set-Cookie"];
          if (cookie != null) {
            wx.setStorageSync("cookie", res.header["Set-Cookie"]);
          }
          if (res.statusCode == 200) {
            if (isPlainText) {
              resolve(res.data);
            } else {
              if (!reJSON.test(res.data))
                res.data = decrypt(res.data);
              let data = JSON.parse(res.data);
              let user = data.user;
              if (user) {
                wx.setStorage({
                  key: 'user',
                  data: user
                })
              }
              if (data.errorCode) {
                reject(data)
              } else {
                resolve(data);
              }
            }
          } else {
            let err = {
              "statusCode": res.statusCode,
              "data": res.data
            }
            // console.error(err);
            reject(err)
          }
        },
        fail(err) {
          reject(err);
        },
        complete() {
          if (showLoading) {
            wx.hideLoading();
          }
        }
      })
    });
  } else {
    return new Promise((resolve, reject) => {
      reject("No uri indicated while http request.");
    });
  }
}