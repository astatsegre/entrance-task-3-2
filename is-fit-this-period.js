let isFitThisPeriod = function(from, to, power, duration, schedule){
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
};

module.exports = isFitThisPeriod;