/**
 * Deterministic date formatting for YouTh Brain News
 * Ensures identical output between Node.js SSR and any browser client on any OS,
 * eliminating Next.js hydration mismatches completely.
 */

const NE_DAYS = [
  'आइतबार',
  'सोमबार',
  'मंगलबार',
  'बुधबार',
  'बिहीबार',
  'शुक्रबार',
  'शनिबार',
];

const NE_MONTHS = [
  'जनवरी',
  'फेब्रुअरी',
  'मार्च',
  'अप्रिल',
  'मे',
  'जुन',
  'जुलाई',
  'अगस्ट',
  'सेप्टेम्बर',
  'अक्टोबर',
  'नोभेम्बर',
  'डिसेम्बर',
];

const EN_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const EN_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function toNepaliDigits(input: number | string): string {
  const map: { [key: string]: string } = {
    '0': '०',
    '1': '१',
    '2': '२',
    '3': '३',
    '4': '४',
    '5': '५',
    '6': '६',
    '7': '७',
    '8': '८',
    '9': '९',
  };
  return input.toString().replace(/[0-9]/g, (ch) => map[ch] || ch);
}

/**
 * Format full date for header (e.g. 'आइतबार, २५ अक्टोबर २०२६' or 'Sunday, 25 October 2026')
 */
export function formatHeaderDate(dateInput: Date | string = new Date(), locale: string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const dayOfWeek = d.getDay();
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();

  if (locale === 'ne') {
    return `${NE_DAYS[dayOfWeek]}, ${toNepaliDigits(day)} ${NE_MONTHS[month]} ${toNepaliDigits(year)}`;
  }

  return `${EN_DAYS[dayOfWeek]}, ${day} ${EN_MONTHS[month]} ${year}`;
}

/**
 * Format article date for cards and lists (e.g. '२५ अक्टोबर २०२६' or '25 Oct 2026')
 */
export function formatArticleDate(dateInput: Date | string | null | undefined, locale: string): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();

  if (locale === 'ne') {
    return `${toNepaliDigits(day)} ${NE_MONTHS[month]} ${toNepaliDigits(year)}`;
  }

  return `${day} ${EN_MONTHS_SHORT[month]} ${year}`;
}
