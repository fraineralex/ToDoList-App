const moment = require("moment");

/* This is a function that takes a date and returns a string of the time since the date. */
exports.GetDate = (date) => {
  date.toString().slice(0, -5);
  const time = moment(date, "YYYYMMDD, h:mm:ss").startOf("second").fromNow();
  return time.charAt(0).toUpperCase() + time.slice(1);
};

/* This is a function that takes a date and returns a boolean if the date is expired or not. */
exports.IsExpired = (date) => {
  if(date){
  const expirationDate = Date.parse(date);
  const dateNow = Date.parse(moment().toDate()) + 300000;

  /* This is a conditional statement that checks if the expiration date is less than or equal to the
  current date. If it is, it returns true, otherwise it returns false. */
  if (expirationDate <= dateNow) {
    return true;
  } else {
    return false;
  }
}else{
  return false
}
};

/* This is a function that takes a date and returns a string of the minutes since the date. */
exports.GetMinutes = (date) => {
  date.toString().slice(0, -5);
  const time = moment(date, "YYYYMMDD, h:mm:ss").startOf("minutes").fromNow();
  return time.slice(2, time.length)
};
