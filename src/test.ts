import { EnumEditOperations, findFirstGreaterOrEqual, measureEllapsedTime, ObservationRecord } from "@uwrl/qc-utils";
import { mockDatastream } from "./assets/mock";
import { generateDistinctRandomNumbers } from './utils'

const length: number = mockDatastream.phenomenonTime.length - 1
// Stage delete operation
const toDelete = 25000;
const toInsert = 25000;
const noDataValue = -999999
const randomIndexes = generateDistinctRandomNumbers(
  toDelete,
  0,
  mockDatastream.phenomenonTime.length - 1
);

const randomDatetimes = generateDistinctRandomNumbers(
  toInsert,
  new Date(mockDatastream.phenomenonTime[0] as string).getTime() + 1,
  new Date(mockDatastream.phenomenonTime[length - 1] as string).getTime() - 1
);

export const getJsRawData = () => {
  // Preprocess data
  const rawData: {
    datetimes: number[];
    dataValues: number[];
  } = {
    datetimes: mockDatastream.phenomenonTime.map((dateString) =>
      new Date(dateString).getTime()
    ),
    dataValues: [...mockDatastream.result],
  };
  return rawData
}

export const getQcRawData = () => {
  const rawData: {
    datetimes: number[];
    dataValues: number[];
  } = {
    datetimes: mockDatastream.phenomenonTime.map((dateString) =>
      new Date(dateString).getTime()
    ),
    dataValues: mockDatastream.result,
  };
  return rawData;
}

export const testRegularJS = async () => {
  console.info(`\n>>> Testing operation with regular JavaScript...`)

  let rawData = getJsRawData()

  console.info(`\tLoaded ${rawData.dataValues.length} element(s)`)
  const measurements = []

  // DELETE
  console.info(`Deleting ${randomIndexes.length} element(s)...`)
  let measurement = await measureEllapsedTime(() => {
    // Dispatching operation
    for (let i = randomIndexes.length - 1; i >= 0; i--) {
      const index: number = randomIndexes[i] as number
      rawData.datetimes.splice(index, 1);
      rawData.dataValues.splice(index, 1);
    }
  })

  console.assert(rawData.dataValues.length === mockDatastream.result.length - toDelete, "DELETE OPERATION: Result mismatch")
  measurements.push(measurement)
  // INSERT
  rawData = getJsRawData()
  console.info(`Inserting ${randomDatetimes.length} element(s)...`)
  measurement = await measureEllapsedTime(() => {
    // Insert from back to avoid invalidating indexes
    for (let i = randomDatetimes.length - 1; i >= 0; i--) {
      const val: number = randomDatetimes[i] as number
      const index = findFirstGreaterOrEqual(rawData.datetimes, val)

      rawData.datetimes.splice(index, 0, val);
      rawData.dataValues.splice(index, 0, noDataValue);
    }
  })

  console.assert(rawData.dataValues.length === mockDatastream.result.length + toInsert, "INSERT OPERATION: Result mismatch")
  measurements.push(measurement)

  return measurements
}

export const testQcUtils = async () => {
  console.info(`\n>>> Testing operation with QC-Utils...`)
  const measurements = []

  // Preprocess data (qc-utils will not modify the original array).
  const rawData = getQcRawData()
  // Instantiate ObservationRecord
  console.info('Loading data...')
  const obsRecord = await (new ObservationRecord(rawData));
  console.info(`\tLoaded ${obsRecord.dataX.length} element(s).`);

  // DELETE
  let measurement = await measureEllapsedTime(async () => {
    // Dispatching operation
    console.info(`Deleting ${randomIndexes.length} element(s)...`)
    await obsRecord.dispatch(EnumEditOperations.DELETE_POINTS, randomIndexes);
  })

  console.assert(obsRecord.dataX.length === mockDatastream.result.length - toDelete, "DELETE OPERATION - Result mismatch")
  measurements.push(measurement)

  await obsRecord.reload()
  // INSERT
  const toInsertCollection = randomDatetimes.map(d => [d, noDataValue])
  measurement = await measureEllapsedTime(async () => {
    // Dispatching operation
    console.info(`Inserting ${randomDatetimes.length} element(s)...`)
    await obsRecord.dispatch(EnumEditOperations.ADD_POINTS, toInsertCollection);
  })

  console.assert(obsRecord.dataX.length === mockDatastream.result.length + toInsert, "INSERT OPERATION - Result mismatch")
  measurements.push(measurement)

  return measurements
}

