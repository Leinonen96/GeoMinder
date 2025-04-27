/**
 * Combines separate date and time objects into a single Date object
 * @param {Date} date The date portion 
 * @param {Date} time The time portion
 * @returns {Date|null} Combined date and time or null if either input is missing
 */
export const combineDateAndTime = (date, time) => {
  if (!date || !time) return null;
  const combined = new Date(date);
  combined.setHours(
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds()
  );
  return combined;
};
