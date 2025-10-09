import { EnumEditOperations, measureEllapsedTime, ObservationRecord } from "@uwrl/qc-utils";
import { mockDatastream } from "./assets/mock";
import { generateDistinctRandomNumbers } from './utils'

// Stage delete operation
const toDelete = 25000;
const randomIndexes = generateDistinctRandomNumbers(
  toDelete,
  0,
  mockDatastream.phenomenonTime.length - 1
);

export const testRegularJS = async () => {
  console.info(`\n>>> Testing operation with regular JavaScript...`)
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

  console.info(`\tLoaded ${rawData.dataValues.length} element(s)`)

  console.info(`Deleting ${randomIndexes.length} element(s)...`)
  measureEllapsedTime(() => {
    // Dispatching operation
    for (let i = randomIndexes.length - 1; i >= 0; i--) {
      const index: number = randomIndexes[i] as number
      rawData.datetimes.splice(index, 1);
      rawData.dataValues.splice(index, 1);
    }
  })

  console.assert(rawData.dataValues.length === mockDatastream.result.length - toDelete, "Result mismatch")
}

export const testQcUtils = async () => {
  console.info(`\n>>> Testing operation with QC-Utils...`)
  // Preprocess data (qc-utils will not modify the original array).
  const rawData: {
    datetimes: number[];
    dataValues: number[];
  } = {
    datetimes: mockDatastream.phenomenonTime.map((dateString) =>
      new Date(dateString).getTime()
    ),
    dataValues: mockDatastream.result,
  };

  // Instantiate ObservationRecord
  console.info('Loading data...')
  const obsRecord = await (new ObservationRecord(rawData));
  console.info(`\tLoaded ${obsRecord.dataX.length} element(s).`);

  // Dispatching operation
  console.info(`Deleting ${randomIndexes.length} element(s)...`)
  await obsRecord.dispatch(EnumEditOperations.DELETE_POINTS, randomIndexes);

  console.assert(obsRecord.dataX.length === mockDatastream.result.length - toDelete, "Result mismatch")
}

