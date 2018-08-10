let Big = require('./big.js/big');

let writeConsumedEnergy = function (whereToWrite, id, power, value) {
  if (whereToWrite[id]) {
    whereToWrite[id] =  +Big(power).div(1000).times(value).plus(Big(whereToWrite[id])).toFixed(4).toString()
  } else {
    whereToWrite[id] = +Big(power).div(1000).times(value).toFixed(4).toString()
  }
};

module.exports = writeConsumedEnergy;