let writeConsumedEnergy = require('./write-consumed-energy');

let handleCandidates = function (candidates, device, schedule, whereToWriteConsumed) {
  if (candidates.length === 0) throw new Error(`device with id ${device.id} cant be included in schedule`);

  let candidatesWithPrice = candidates.map((timePeriod) => {
    for (let i = timePeriod.start; i <= timePeriod.end; i++) {
      timePeriod.totalValue = timePeriod.totalValue ? timePeriod.totalValue + schedule[i].value : schedule[i].value
    }
    return timePeriod
  });

  candidatesWithPrice.sort((a, b) => a.totalValue - b.totalValue);
  let startTime = candidatesWithPrice[0].start;
  let convertedEndTime = startTime > candidatesWithPrice[0].end ? candidatesWithPrice[0].end + 24 : candidatesWithPrice[0].end;

  //записываем прибор в лучший промежуток + записываем потребление
  for (startTime; startTime <= convertedEndTime; startTime++) {
    let convertedStartTime = startTime > 23 ? startTime - 24 : startTime;
    schedule[convertedStartTime].gadgets.push(device.id);
    schedule[convertedStartTime].remainingValue = schedule[convertedStartTime].remainingValue - device.power;
    writeConsumedEnergy(whereToWriteConsumed, device.id, device.power, schedule[convertedStartTime].value)
  }
};

module.exports = handleCandidates;