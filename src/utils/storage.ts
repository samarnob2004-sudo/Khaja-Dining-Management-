import { DailyDiningRecord, NextDayPlanItem } from '../types/dining';

const STORAGE_KEY_PREFIX = 'kjah_dining_day_';
const PLAN_KEY_PREFIX = 'kjah_dining_plan_';
const DATES_LIST_KEY = 'kjah_dining_dates';

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getNextDateString = (dateStr: string): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const createDefaultRecord = (date: string): DailyDiningRecord => {
  return {
    date,
    borderCount: 165, // খাঁন জাহান আলী হলের সাধারণ সক্রিয় বর্ডার সংখ্যা
    borderRate: 60, // ৬০ টাকা প্রতি বর্ডার
    items: [],
    directExpenses: {
      'যাতায়াত': 0,
      'কাঠ': 0,
      'ডাইনিং ম্যানেজার নাস্তা': 0,
      'বিবিধ': 0,
    },
    directExpenseNotes: {
      'যাতায়াত': '',
      'কাঠ': '',
      'ডাইনিং ম্যানেজার নাস্তা': '',
      'বিবিধ': '',
    },
    extraPaymentType: 'নেই',
    extraPaymentAmount: 0,
    extraPaymentNotes: '',
    meatFishStock: [],
    managerName: '',
    assistantManagerName: '',
    notes: '',
  };
};

export const loadRecord = (date: string): DailyDiningRecord => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${date}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading record:', e);
  }
  return createDefaultRecord(date);
};

export const saveRecord = (record: DailyDiningRecord): void => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${record.date}`, JSON.stringify(record));
    
    // Update dates list
    const datesRaw = localStorage.getItem(DATES_LIST_KEY);
    let dates: string[] = datesRaw ? JSON.parse(datesRaw) : [];
    if (!dates.includes(record.date)) {
      dates.push(record.date);
      dates.sort((a, b) => b.localeCompare(a));
      localStorage.setItem(DATES_LIST_KEY, JSON.stringify(dates));
    }
  } catch (e) {
    console.error('Error saving record:', e);
  }
};

export const getAllSavedDates = (): string[] => {
  try {
    const datesRaw = localStorage.getItem(DATES_LIST_KEY);
    if (datesRaw) {
      return JSON.parse(datesRaw);
    }
  } catch (e) {
    console.error('Error fetching dates:', e);
  }
  return [];
};

export const loadNextDayPlan = (date: string): NextDayPlanItem[] => {
  try {
    const raw = localStorage.getItem(`${PLAN_KEY_PREFIX}${date}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading next day plan:', e);
  }
  return [];
};

export const saveNextDayPlan = (date: string, items: NextDayPlanItem[]): void => {
  try {
    localStorage.setItem(`${PLAN_KEY_PREFIX}${date}`, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving next day plan:', e);
  }
};

export const seedSampleDataIfEmpty = (): void => {
  const dates = getAllSavedDates();
  if (dates.length > 0) return;

  const today = getTodayDateString();
  const sampleRecord: DailyDiningRecord = {
    date: today,
    borderCount: 170,
    borderRate: 60,
    items: [
      { id: '1', name: 'আলু', category: 'সবজি', quantity: 25, unit: 'কেজি', unitPrice: 32, totalPrice: 800 },
      { id: '2', name: 'পটল', category: 'সবজি', quantity: 10, unit: 'কেজি', unitPrice: 40, totalPrice: 400 },
      { id: '3', name: 'কাঁচা মরিচ', category: 'মশলা', quantity: 1.5, unit: 'কেজি', unitPrice: 120, totalPrice: 180 },
      { id: '4', name: 'রুই মাছ', category: 'মাছ', quantity: 28, unit: 'কেজি', unitPrice: 220, totalPrice: 6160 },
      { id: '5', name: 'পেঁয়াজ', category: 'মশলা', quantity: 6, unit: 'কেজি', unitPrice: 70, totalPrice: 420 },
      { id: '6', name: 'সয়াবিন তেল', category: 'মুদি', quantity: 5, unit: 'লিটার', unitPrice: 165, totalPrice: 825 }
    ],
    directExpenses: {
      'যাতায়াত': 120,
      'কাঠ': 350,
      'ডাইনিং ম্যানেজার নাস্তা': 80,
      'বিবিধ': 50,
    },
    directExpenseNotes: {
      'যাতায়াত': 'দৌলতপুর বাজার অটোভাড়া',
      'কাঠ': 'রান্নার লাকড়ি খরচ',
      'ডাইনিং ম্যানেজার নাস্তা': 'চা ও বিস্কুট',
      'বিবিধ': 'পলিথিন ও লবণ',
    },
    meatFishStock: [
      {
        id: 'stock-1',
        name: 'রুই মাছ',
        category: 'মাছ',
        totalWeightKg: 28,
        piecesPerKg: 6,
        totalPieces: 168,
        piecesServed: 165,
        remainingPieces: 3,
        remainingKg: 0.5,
        storageNote: 'ডাইনিং ফ্রিজে ৩ পিস সংরক্ষিত'
      }
    ],
    managerName: 'এস. এ. এম. মাফিউল আলম অর্ণব',
    assistantManagerName: 'সহকারী ম্যানেজার',
    notes: 'আজকের বাজার দৌলতপুর থেকে সম্পন্ন হয়েছে। মাছের সাইজ ভালো ছিল।'
  };

  saveRecord(sampleRecord);

  // Sample next day plan
  const tomorrow = getNextDateString(today);
  const samplePlan: NextDayPlanItem[] = [
    { id: 'p1', name: 'ব্রয়লার মুরগি', category: 'মুরগি', estimatedQuantity: '৩৫ কেজি', estimatedPrice: 6650 },
    { id: 'p2', name: 'আলু', category: 'সবজি', estimatedQuantity: '৩০ কেজি', estimatedPrice: null },
    { id: 'p3', name: 'রসুন', category: 'মশলা', estimatedQuantity: '৩ কেজি', estimatedPrice: 750 },
    { id: 'p4', name: 'আদা', category: 'মশলা', estimatedQuantity: '২.৫ কেজি', estimatedPrice: null }
  ];
  saveNextDayPlan(tomorrow, samplePlan);
};
