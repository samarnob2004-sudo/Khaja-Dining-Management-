export const toBengaliDigits = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '০';
  const banglaDigits: Record<string, string> = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
    '.': '.',
    '-': '-'
  };
  return num.toString().replace(/[0-9.-]/g, (match) => banglaDigits[match] || match);
};

export const formatTaka = (amount: number): string => {
  const rounded = Math.round(amount * 100) / 100;
  const parts = rounded.toLocaleString('en-IN').split('.');
  const intPart = toBengaliDigits(parts[0]);
  if (parts.length > 1 && parts[1] !== '00') {
    return `${intPart}.${toBengaliDigits(parts[1])} ৳`;
  }
  return `${intPart} ৳`;
};

export const formatBengaliDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const days = [
    'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
  ];

  const dayName = days[date.getDay()];
  const day = toBengaliDigits(date.getDate());
  const monthName = months[date.getMonth()];
  const year = toBengaliDigits(date.getFullYear());

  return `${dayName}, ${day} ${monthName} ${year}`;
};

export const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  return days[date.getDay()];
};

export const isFeastDay = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const day = date.getDay();
  // 2 = Tuesday (মঙ্গলবার), 5 = Friday (শুক্রবার)
  return day === 2 || day === 5;
};
