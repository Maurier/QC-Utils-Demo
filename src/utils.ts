export function generateDistinctRandomNumbers(
  amount: number,
  min: number,
  max: number
) {
  const rangeSize = max - min + 1;
  if (amount > rangeSize) {
    throw `Range error: there aren't ${amount} distinct numbers between ${min} and ${max}`;
  }
  const result = new Set<number>();

  while (result.size < amount) {
    const randomNumber = Math.floor(Math.random() * rangeSize) + min;
    result.add(randomNumber);
  }

  return Array.from(result).sort((a, b) => a - b);
}