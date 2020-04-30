let Formatter = {
  appendzero: (obj) => { // 缺0补齐
    if (obj < 10) return "0" + "" + obj;
    else return obj;
  },
  formatDate: date => {
    if (date == null || !(date instanceof Date)) {
      date = new Date();
    }
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  },
  formatDateTime: date => {
    if (date == null || !(date instanceof Date)) {
      date = new Date();
    }
    return date.getFullYear() + "-" + Formatter.appendzero(date.getMonth() + 1) + "-" + Formatter.appendzero(date.getDate()) + " " + Formatter.appendzero(date.getHours()) + ":" + Formatter.appendzero(date.getMinutes()) + ":" + Formatter.appendzero(date.getSeconds());
  },
  formatLongDate: date => {
    if (date == null || !(date instanceof Date)) {
      date = new Date();
    }
    return date.getFullYear() + "年" + date.getMonth() + "月" + date.getDate() + "日";
  },
  formatNumber: (num, digits) => (num * 1 || 0).toFixed(digits)
}
module.exports = {
  Formatter
}