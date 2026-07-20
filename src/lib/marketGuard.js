/**
 * Master Institutional Timing Safeguard for Indian Equity Exchanges (NSE/BSE)
 * Validates operational hours strictly between Monday - Friday, 09:15 AM to 03:30 PM IST
 */
export function checkIsMarketOpen() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const dateParts = parts.reduce((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = Number(part.value);
    }
    return acc;
  }, {});

  const { year, month, day, hour, minute, second } = dateParts;
  if ([year, month, day, hour, minute, second].some((value) => Number.isNaN(value))) {
    return false;
  }

  const currentIndianDateTimeNode = new Date(year, month - 1, day, hour, minute, second);
  const targetedDayOfWeek = currentIndianDateTimeNode.getDay(); // 0 = Sunday, 6 = Saturday
  const operationalHoursInt = currentIndianDateTimeNode.getHours();
  const operationalMinutesInt = currentIndianDateTimeNode.getMinutes();

  if (targetedDayOfWeek === 0 || targetedDayOfWeek === 6) {
    return false;
  }

  const calculatedTimelineMinutesPastMidnight = operationalHoursInt * 60 + operationalMinutesInt;
  const EXCHANGE_OPENING_TIME_MARKER = 9 * 60 + 15; // 09:15 AM IST
  const EXCHANGE_CLOSING_TIME_MARKER = 15 * 60 + 30; // 03:30 PM IST

  return (
    calculatedTimelineMinutesPastMidnight >= EXCHANGE_OPENING_TIME_MARKER &&
    calculatedTimelineMinutesPastMidnight <= EXCHANGE_CLOSING_TIME_MARKER
  );
}