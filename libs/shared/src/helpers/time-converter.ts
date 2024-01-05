export function convertIsoToUnixTimestamp(isoDateTime: string) {
  if (!isoDateTime) {
    throw new Error('Invalid input: ISO dateTime string is required.');
  }

  const date = new Date(isoDateTime);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid input: The provided string is not a valid ISO dateTime.');
  }

  return Math.floor(date.getTime() / 1000);
}
