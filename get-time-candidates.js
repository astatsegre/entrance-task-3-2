let isFitThisPeriod = require('./is-fit-this-period');

let getTimeCandidates = function (periods, device, schedule) {
  let timeCandidates = []
  periods.some((time) => {
    let result = isFitThisPeriod(time.from, time.to, device.power, device.duration, schedule);
    // полностью влезает в период
    if (result.start !== null && result.end !== null) {
      timeCandidates.push({start: result.start, end: result.end});
      return true
    }
    // полностью не влезает, но есть кандидат слева по времени
    if (result.end === null && result.firstBreak !== time.from) {
      let leftResult = isFitThisPeriod(result.firstBreak - device.duration, result.firstBreak, device.power, device.duration, schedule)
      if (leftResult.start && leftResult.end) {
        timeCandidates.push({start: leftResult.start, end: leftResult.end});
      }
    }
    //полностью не влезает, но есть кандидат справа по времени
    if (result.start !== null && result.end === null) {
      let rightResult = isFitThisPeriod(result.start, result.start + device.duration, device.power, device.duration, schedule)
      if (rightResult.start && rightResult.end) {
        timeCandidates.push({start: rightResult.start, end: rightResult.end});
      }
    }
  });
  return timeCandidates
};

module.exports = getTimeCandidates;