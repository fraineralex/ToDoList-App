const moment = require("moment");

exports.GetDate = (date) => {
  date.toString().slice(0, -5);
  const time = moment(date, "YYYYMMDD, h:mm:ss").startOf("second").fromNow();
  return time.charAt(0).toUpperCase() + time.slice(1);
};

exports.IsExpired = (date) => {
  if(date){
  const expirationDate = Date.parse(date);
  const dateNow = Date.parse(moment().toDate()) + 300000;

  if (expirationDate <= dateNow) {
    return true;
  } else {
    return false;
  }
}else{
  return false
}
};

exports.GetMinutes = (date) => {
  date.toString().slice(0, -5);
  const time = moment(date, "YYYYMMDD, h:mm:ss").startOf("minutes").fromNow();
  return time.slice(2, time.length)
};
