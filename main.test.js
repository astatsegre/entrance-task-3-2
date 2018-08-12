const getRecomendation = require('./main');
let inputData = require('./inputs/input');
let inputData2 = require('./inputs/input-2');
let inputUnableToFit = require('./inputs/input-unable-to-fit');
let inputUnableToFitByTime = require('./inputs/input-unable-to-fit-by-time');


test('basic test total value with data from task', () => {
  expect(getRecomendation(inputData).consumedEnergy.value).toBe(38.939);
});

test('test one device value', () => {
  expect(getRecomendation(inputData2).consumedEnergy.devices['C515D887EDBBE669B2FDAC62F571E9E9']).toBe(43.04);
});

test('test signature of consumedEnergy', () => {
  expect(getRecomendation(inputData2).consumedEnergy).toEqual(
    {value: 60.459,
      devices: {
      "F972B82BA56A70CC579945773B6866FB": 5.1015,
        "C515D887EDBBE669B2FDAC62F571E9E9": 43.04,
        "02DDD23A85DADDD71198305330CC386D": 5.398,
        "1E6276CC231716FE8EE8BC908486D41E": 5.398,
        "7D9DC84AD110500D284B33C82FE6E85E": 1.5215
    }
  });
});

test('error, when unable to fit because of too high power', () => {
  function cantFitTest() {
    getRecomendation(inputUnableToFit)
  }
  expect(cantFitTest).toThrowError('device with id C515D887EDBBE669B2FDAC62F571E9E9 cant be included in schedule')
});

test('error, when unable to fit because off too high duration for day mode gadget', () => {
  function cantFitTest() {
    getRecomendation(inputUnableToFitByTime)
  }
  expect(cantFitTest).toThrowError('device with id C515D887EDBBE669B2FDAC62F571E9E9 cant be included in schedule')
});
