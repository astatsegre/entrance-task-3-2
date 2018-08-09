let data = {
  "devices": [
    {
      "id": "F972B82BA56A70CC579945773B6866FB",
      "name": "Посудомоечная машина",
      "power": 950,
      "duration": 3,
      "mode": "night"
    },
    {
      "id": "C515D887EDBBE669B2FDAC62F571E9E9",
      "name": "Духовка",
      "power": 2000,
      "duration": 2,
      "mode": "day"
    },
    {
      "id": "02DDD23A85DADDD71198305330CC386D",
      "name": "Холодильник",
      "power": 50,
      "duration": 24
    },
    {
      "id": "1E6276CC231716FE8EE8BC908486D41E",
      "name": "Термостат",
      "power": 50,
      "duration": 24
    },
    {
      "id": "7D9DC84AD110500D284B33C82FE6E85E",
      "name": "Кондиционер",
      "power": 850,
      "duration": 1
    }
  ],
  "rates": [
    {
      "from": 7,
      "to": 10,
      "value": 6.46
    },
    {
      "from": 10,
      "to": 17,
      "value": 5.38
    },
    {
      "from": 17,
      "to": 21,
      "value": 6.46
    },
    {
      "from": 21,
      "to": 23,
      "value": 5.38
    },
    {
      "from": 23,
      "to": 7,
      "value": 1.79
    }
  ],
  "maxPower": 2100
};

function getRecomendation(inputData) {
  let schedule = [
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower},
    {gadgets: [], remainingValue:inputData.maxPower}
  ];

  let gadgetsWithoutDuration24 = inputData.devices.filter((device) => {
    if (device.duration === 24) {
      schedule.map((hour) => {
        hour.gadgets.push(device.id);
        hour.remainingValue = hour.remainingValue - device.power
      });
      return false
    } else {
      return true
    }
  });

  //разделяем устройства с разными значениями mode
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

  //сортируем по мощности по убыванию
  dayModeGadgets.sort((a, b) => a.power - b.power);
  nightModeGadgets.sort((a, b) => a.power - b.power);
  dayNightModeGadgets.sort((a, b) => a.power - b.power);

  let firstCheapSortedRates = inputData.rates.sort((a, b) => a.value - b.value);

  dayModeGadgets.forEach((device) => {
    let candidates = [];
    firstCheapSortedRates.some((time) => {
      let result = isFitThisPeriod(time.from, time.to, device.power, device.duration, schedule)
      console.log('result', result)
      if (result.start !== null && result.end !== null) {
        console.log('влезли!');
        candidates.push({start: result.start, end: result.end});
        return true
      }
      if (result.end === null && result.firstBreak !== time.from) {
        console.log('есть варик слева')
        let leftResult = isFitThisPeriod(result.firstBreak - device.duration, result.firstBreak, device.power, device.duration, schedule)
        if (leftResult.start && leftResult.end) {
          candidates.push({start: leftResult.start, end: leftResult.end});
        }
      }
      if (result.start !== null && result.end === null) {
        console.log('есть варик справа')
        let rightResult = isFitThisPeriod(result.start, result.start + device.duration, device.power, device.duration, schedule)
        if (rightResult.start && rightResult.end) {
          candidates.push({start: rightResult.start, end: rightResult.end});
        }
      }
      if (result.start === null && result.firstBreak === time.from) {
        console.log('вообще вариков нет!')
      }
    })
    console.log('candidates', candidates)
  });
}

function isFitThisPeriod(from, to, power, duration, schedule){
  let result = {start: null, end: null, firstBreak: null};
  let convertedTo = from > to ? to + 24 : to

  for (from; from <= convertedTo; from++) {
    let currentTimeStep = from;
    if (from > 23) currentTimeStep = from - 24;
    if (from < 0) currentTimeStep = from + 24;

    //влезает по мощности в данный час
    if (schedule[currentTimeStep].remainingValue >= power) {
      if (result.start) {
        if (from - result.start + 1 === duration) {
          result.end = currentTimeStep;
          break
        } else {
          if (currentTimeStep === to) break
        }
      } else {
        result.start = currentTimeStep
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



getRecomendation(data);