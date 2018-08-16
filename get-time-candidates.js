let getTimeCandidates = function (periods, device, schedule) {
  let timeCandidates = [];
  periods.some((time) => {
    let result = isFitThisPeriod(time.from, time.to, device.power, device.duration, schedule);
    // полностью влезает в период
    if (result.start !== null && result.end !== null) {
      timeCandidates.push({start: result.start, end: result.end});
      return timeCandidates
    }
    // полностью не влезает, но есть кандидат слева по времени
    if (result.end === null && result.firstBreak !== time.from) {
      if (result.firstBreak !== null) {
        let leftResult = isFitThisPeriod(result.firstBreak - device.duration, result.firstBreak, device.power, device.duration, schedule);
        if (leftResult.start && leftResult.end) {
          timeCandidates.push({start: leftResult.start, end: leftResult.end});
        }
      }
      let leftResultFromStart = isFitThisPeriod(time.from - device.duration, time.from, device.power, device.duration, schedule);
      if (leftResultFromStart.start !== null && leftResultFromStart.end !== null) {
        timeCandidates.push({start: leftResultFromStart.start, end: leftResultFromStart.end});
      }
    }
    //полностью не влезает, но есть кандидат справа по времени
    if (result.start !== null && result.end === null) {
      let rightResult = isFitThisPeriod(result.start, result.start + device.duration, device.power, device.duration, schedule);
      if (rightResult.start !== null  && rightResult.end !== null) {
        timeCandidates.push({start: rightResult.start, end: rightResult.end});
      }
      let rightResultFromEndOfPeriod = isFitThisPeriod(time.to - 1, time.to -1 + device.duration, device.power, device.duration, schedule);
      if (rightResultFromEndOfPeriod.start !== null && rightResultFromEndOfPeriod.end !== null) {
        timeCandidates.push({start: rightResultFromEndOfPeriod.start, end: rightResultFromEndOfPeriod.end});
      }
    }
  });
  return timeCandidates
};

function isFitThisPeriod(from, to, power, duration, schedule){
  let result = {start: null, end: null, firstBreak: null};
  let convertedTo = from > to ? to + 24 : to;

  for (let i = from; i <= convertedTo; i++) {
    let currentTimeStep = i;
    if (i > 23) currentTimeStep = i - 24;
    if (i < 0) currentTimeStep = i + 24;

    //влезает по мощности в данный час
    if (schedule[currentTimeStep].remainingValue >= power) {
      if (result.start === null) {
        result.start = currentTimeStep
      }
      if ((from < 0 ? i + 24 : i) - result.start + 1 === duration) {
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