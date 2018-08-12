let getTimeCandidates = function (periods, device, schedule) {
  let timeCandidates = [];
  periods.some((time) => {
    let result = isFitThisPeriod(time.from, time.to, device.power, device.duration, schedule);
    // полностью влезает в период
    if (result.start !== null && result.end !== null) {
      timeCandidates.push({start: result.start, end: result.end});
      return true
    }
    // полностью не влезает, но есть кандидат слева по времени
    if (result.end === null && result.firstBreak !== time.from) {
      let leftResult = isFitThisPeriod(result.firstBreak - device.duration, result.firstBreak, device.power, device.duration, schedule);
      if (leftResult.start && leftResult.end) {
        timeCandidates.push({start: leftResult.start, end: leftResult.end});
      }
    }
    //полностью не влезает, но есть кандидат справа по времени
    if (result.start !== null && result.end === null) {
      let rightResult = isFitThisPeriod(result.start, result.start + device.duration, device.power, device.duration, schedule);
      if (rightResult.start && rightResult.end) {
        timeCandidates.push({start: rightResult.start, end: rightResult.end});
      }
    }
  });
  return timeCandidates
};

function isFitThisPeriod(from, to, power, duration, schedule){
  let result = {start: null, end: null, firstBreak: null};
  let convertedTo = from > to ? to + 24 : to;

  for (from; from <= convertedTo; from++) {
    let currentTimeStep = from;
    if (from > 23) currentTimeStep = from - 24;
    if (from < 0) currentTimeStep = from + 24;

    //влезает по мощности в данный час
    if (schedule[currentTimeStep].remainingValue >= power) {
      if (result.start === null) {
        result.start = currentTimeStep
      }
      if (from - result.start + 1 === duration) {
        result.end = currentTimeStep;
        break
      } else {
        if (currentTimeStep === to) break
      }
      //не влезает по мощности в данный час
    } else {
      result.start = null;
      if (!result.firstBreak) {
        result.firstBreak = currentTimeStep;
      }
      if (currentTimeStep === to) break
    }
  }
  return result
}

module.exports = getTimeCandidates;