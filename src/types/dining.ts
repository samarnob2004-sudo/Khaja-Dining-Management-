export type ExpenseCategory = 
  | 'মুদি'
  | 'মাছ'
  | 'মুরগি'
  | 'গরু'
  | 'খাসি'
  | 'সবজি'
  | 'শাক'
  | 'ডিম'
  | 'মশলা'
  | 'যাতায়াত'
  | 'কাঠ'
  | 'ডাইনিং ম্যানেজার নাস্তা'
  | 'বিবিধ';

export interface BazaarItem {
  id: string;
  name: string;
  category: ExpenseCategory;
  quantity: number;
  unit: string; // 'কেজি', 'গ্রাম', 'পিস', 'হালি', 'লিটার', 'বান্ডিল', 'প্যাকেট'
  unitPrice: number; // টাকা প্রতি ইউনিট
  totalPrice: number;
  notes?: string;
}

export interface FishMeatStockItem {
  id: string;
  name: string;
  category: string; // 'চাল' | 'ডাল' | 'মাছ' | 'মুরগি' | 'গরু' | 'খাসি' | 'চিংড়ি' | 'আলু' | 'পেঁয়াজ' | 'ডিম' | string
  totalWeightKg: number; // মোট কেনা কেজি (বা মোট পরিমাণ)
  piecesPerKg: number; // প্রতি কেজিতে পিস / ইউনিট রেট
  totalPieces: number; // মোট পিস
  piecesServed: number; // ডাইনিংয়ে সার্ভ করা পিস / খরচ
  remainingPieces: number; // অবশিষ্ট পিস / পরিমাণ
  remainingKg: number; // অবশিষ্ট কেজি
  storageNote?: string; // যেমন: ফ্রিজে সংরক্ষিত / পরের বেলার জন্য
}

export interface NextDayPlanItem {
  id: string;
  name: string;
  category: ExpenseCategory;
  estimatedQuantity: string; // e.g. "১২ কেজি"
  estimatedPrice?: number | null; // ঐচ্ছিক আনুমানিক দাম বা খালি
  isPurchased?: boolean;
  notes?: string;
}

export interface DirectExpense {
  category: 'যাতায়াত' | 'কাঠ' | 'ডাইনিং ম্যানেজার নাস্তা' | 'বিবিধ';
  amount: number;
  details?: string;
}

export interface DailyDiningRecord {
  date: string; // YYYY-MM-DD
  borderCount: number; // বর্ডার সংখ্যা
  borderRate: number; // প্রতি বর্ডার খরচ (সাধারণত ৬০ টাকা)
  items: BazaarItem[];
  directExpenses: Record<string, number>; // যাতায়াত, কাঠ, ডাইনিং ম্যানেজার নাস্তা, বিবিধ
  directExpenseNotes: Record<string, string>;
  extraPaymentType?: 'অতিরিক্ত টাকা প্রদান' | 'টাকা দেওয়া বাকি (বকেয়া)' | 'নেই';
  extraPaymentAmount?: number;
  extraPaymentNotes?: string;
  meatFishStock: FishMeatStockItem[];
  managerName?: string;
  assistantManagerName?: string;
  notes?: string;
}
