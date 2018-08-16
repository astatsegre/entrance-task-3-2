let Big = require('./big.js/big');
let handleCandidates = require('./modules/handle-candidates');
let writeConsumedEnergy = require('./modules/write-consumed-energy');
let getTimeCandidates = require('./modules/get-time-candidates');


function getRecomendation(inputData) {
  let schedule = [];
  for (let i = 0; i < 24; i++) {
    schedule.push({gadgets: [], remainingValue:inputData.maxPower})
  }

  let deviceConsumedEnergy = {};

  //<<< разделяем периоды на день, ночь, день + ночь
  let sortedByValuePeriods = inputData.rates.sort((a, b) => a.value - b.value);

  let daySortedPeriods = [];
  let nightSortedPeriods = [];

  sortedByValuePeriods.forEach((period) => {
    let day = {from: null, to: null};
    let night = {from: null, to: null};
    let convertedTo = period.to < period.from ? period.to + 24 : period.to;
    for (let i = period.from; i < convertedTo; i++) {
      let convertedI = i > 23 ? i - 24 : i;

      if (convertedI >= 7 && convertedI < 21 ) {
        if (day.from === null && night.from === null) day.from = convertedI;
        if (day.from === null && night.from !== null) {
          night.to = convertedI;
          night.value = period.value;
          nightSortedPeriods.push(night);
          night = {from: null, to: null};
          if (i + 1 !== convertedTo) day.from = convertedI;
        }
      } else {
        if (day.from === null && night.from === null) night.from = convertedI;
        if (day.from !== null && night.from === null) {
          day.to = convertedI;
          day.value = period.value;
          daySortedPeriods.push(day);
          day = {from: null, to: null};
          if (i + 1 !== convertedTo) night.from = convertedI;
        }
      }
      // записываем в промежуточный schedule стоимость часа, чтобы в конце посчитать
      schedule[convertedI].value = period.value;
    }
    if (day.from !== null) {
      day.to = period.to;
      day.value = period.value;
      daySortedPeriods.push(day)
    }
    if (night.from !== null) {
      night.to = period.to;
      night.value = period.value;
      nightSortedPeriods.push(night)
    }
  });
  //разделяем периоды на день, ночь, день + ночь >>>

  //сразу обрабатываем устройства, которые работают круглые сутки
  let gadgetsWithoutDuration24 = inputData.devices.filter((device) => {
    if (device.duration === 24) {
      schedule.map((hour) => {
        hour.gadgets.push(device.id);
        hour.remainingValue = hour.remainingValue - device.power;
        writeConsumedEnergy(deviceConsumedEnergy, device.id, device.power, hour.value)
      });
      return false
    } else {
      return true
    }
  });
  

  //<<< разделяем устройства на день, ночь, день + ночь
  let dayModeGadgets = [];
  let nightModeGadgets = [];
  let dayNightModeGadgets = gadgetsWithoutDuration24.filter((device) => {
    if (device.mode === 'day') {
      dayModeGadgets.push(device);
      return false
    }
    if (device.mode === 'night') {
      nightModeGadgets.push(device);
      return false
    }
    if (device.mode && device.mode !== 'day' && device.mode !== 'night') {
      throw new Error('unknown device mode')
    }
    return true
  });
  //разделяем устройства на день, ночь, день + ночь >>>

  //<<< сортируем по мощности по убыванию
  dayModeGadgets.sort((a, b) => a.power - b.power);
  nightModeGadgets.sort((a, b) => a.power - b.power);
  dayNightModeGadgets.sort((a, b) => a.power - b.power);
  //сортируем по мощности по убыванию >>>
  
  //обрабатывает дневные устройства, используя только дневные периоды
  dayModeGadgets.forEach((device) => {
    let timeCandidates = getTimeCandidates(daySortedPeriods, device, schedule);
    
    //отфильтровываем периоды, которые не подходят для mode === 'day'
    timeCandidates = timeCandidates.filter((time) => time.start < time.end && time.start >= 7 && time.start < 21 && time.end > 7 && time.end < 21);

    handleCandidates(timeCandidates, device, schedule, deviceConsumedEnergy)
  });

  //обрабатывает ночные устройства, используя только ночные периоды
  nightModeGadgets.forEach((device) => {
    let timeCandidates = getTimeCandidates(nightSortedPeriods, device, schedule);

    //отфильтровываем периоды, которые не подходят для mode === 'night'
    timeCandidates = timeCandidates.filter((time) => {
      return (time.start < time.end && (time.start < 23 && time.end > 21) || (time.start < 7 && time.end > 0)) ||
        (time.start > time.end && (time.start >= 21 && time.end < 7))
    });

    handleCandidates(timeCandidates, device, schedule, deviceConsumedEnergy)
  });

  //обрабатываем устройства без mode
  dayNightModeGadgets.forEach((device) => {
    let timeCandidates = getTimeCandidates(sortedByValuePeriods, device, schedule);
    handleCandidates(timeCandidates, device, schedule, deviceConsumedEnergy)
  });

  let finalObject = {schedule:{}, consumedEnergy: {value: null, devices: deviceConsumedEnergy}};
  schedule.forEach((item, i) => {
    finalObject.schedule[i] = item.gadgets
  });
  for (let key in deviceConsumedEnergy) {
    if (finalObject.consumedEnergy.value === null) {
      finalObject.consumedEnergy.value = deviceConsumedEnergy[key]
    } else {
      finalObject.consumedEnergy.value = +Big(finalObject.consumedEnergy.value).plus(Big(deviceConsumedEnergy[key]))
    }
   }
 return finalObject;
}

module.exports = getRecomendation;