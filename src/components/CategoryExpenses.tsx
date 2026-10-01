import React from 'react';
import { BazaarItem } from '../types/dining';
import { formatTaka, toBengaliDigits } from '../utils/bengaliNumbers';
import { Truck, Flame, Coffee, Package, PieChart } from 'lucide-react';

interface CategoryExpensesProps {
  items: BazaarItem[];
  directExpenses: Record<string, number>;
  directExpenseNotes: Record<string, string>;
  onDirectExpenseChange: (category: string, amount: number, note?: string) => void;
  extraPaymentType?: 'অতিরিক্ত টাকা প্রদান' | 'টাকা দেওয়া বাকি (বকেয়া)' | 'নেই';
  extraPaymentAmount?: number;
  extraPaymentNotes?: string;
  onExtraPaymentChange?: (
    type: 'অতিরিক্ত টাকা প্রদান' | 'টাকা দেওয়া বাকি (বকেয়া)' | 'নেই',
    amount: number,
    notes: string
  ) => void;
}

export const CategoryExpenses: React.FC<CategoryExpensesProps> = ({
  items,
  directExpenses,
  directExpenseNotes,
  onDirectExpenseChange,
  extraPaymentType = 'নেই',
  extraPaymentAmount = 0,
  extraPaymentNotes = '',
  onExtraPaymentChange,
}) => {
  // Aggregate items expense by category
  const itemExpensesByCategory: Record<string, number> = {};
  items.forEach((item) => {
    let cat = item.category as string;
    if (cat === 'শাক') cat = 'সবজি'; // group shak under sobji
    itemExpensesByCategory[cat] = (itemExpensesByCategory[cat] || 0) + item.totalPrice;
  });

  // Complete breakdown map
  const categoriesList = [
    { key: 'মুদি', label: 'মুদি (চাল, ডাল, তেল ইত্যাদি)', icon: '🍚', isDirect: false },
    { key: 'মাছ', label: 'মাছ', icon: '🐟', isDirect: false },
    { key: 'মুরগি', label: 'মুরগি', icon: '🍗', isDirect: false },
    { key: 'গরু', label: 'গরুর মাংস', icon: '🥩', isDirect: false },
    { key: 'খাসি', label: 'খাসির মাংস', icon: '🍖', isDirect: false },
    { key: 'সবজি', label: 'সবজি ও শাক', icon: '🥬', isDirect: false },
    { key: 'ডিম', label: 'ডিম', icon: '🥚', isDirect: false },
    { key: 'মশলা', label: 'মশলা সামগ্রী', icon: '🌶️', isDirect: false },
    { key: 'যাতায়াত', label: 'যাতায়াত (ভ্যান/অটোভাড়া)', icon: '🛺', isDirect: true },
    { key: 'কাঠ', label: 'কাঠ / জ্বালানি', icon: '🪵', isDirect: true },
    { key: 'ডাইনিং ম্যানেজার নাস্তা', label: 'ডাইনিং ম্যানেজার নাস্তা', icon: '☕', isDirect: true },
    { key: 'বিবিধ', label: 'বিবিধ খরচ', icon: '📦', isDirect: true },
  ];

  // Calculate total across all
  const totalDirect = Object.values(directExpenses).reduce((a, b) => a + (b || 0), 0);
  const totalMarket = items.reduce((a, b) => a + (b.totalPrice || 0), 0);
  const grandTotal = totalMarket + totalDirect;

  return (
    <div id="categories-section" className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden scroll-mt-20">
      {/* Header */}
      <div className="p-3 sm:p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 text-blue-800 rounded-md">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              ২. খাতসমূহ ও অপারেশনাল খরচ
            </h2>
            <p className="text-[11px] text-slate-500">
              যাতায়াত, কাঠ, ম্যানেজার নাস্তা এবং প্রতিটি খাতের মোট ব্যয়ের হিসাব
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Direct Expenses Entry Cards */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            অপারেশনাল ও নগদ খরচ (যাতায়াত, কাঠ, নাস্তা ও বিবিধ):
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* 1. Transport */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-blue-400 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  যাতায়াত
                </span>
                <span className="text-[10px] text-slate-500">ভ্যান / অটো</span>
              </div>
              <div className="relative mb-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={directExpenses['যাতায়াত'] || ''}
                  onChange={(e) =>
                    onDirectExpenseChange(
                      'যাতায়াত',
                      parseFloat(e.target.value) || 0,
                      directExpenseNotes['যাতায়াত']
                    )
                  }
                  placeholder="০"
                  className="w-full text-base font-bold font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">৳</span>
              </div>
              <input
                type="text"
                value={directExpenseNotes['যাতায়াত'] || ''}
                onChange={(e) =>
                  onDirectExpenseChange(
                    'যাতায়াত',
                    directExpenses['যাতায়াত'] || 0,
                    e.target.value
                  )
                }
                placeholder="বিবরণ (যেমন: বাজার আনা-নেওয়া)"
                className="w-full text-[11px] px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none"
              />
            </div>

            {/* 2. Fuel / Wood */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-amber-400 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  কাঠ
                </span>
                <span className="text-[10px] text-slate-500">রান্নার জ্বালানি</span>
              </div>
              <div className="relative mb-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={directExpenses['কাঠ'] || ''}
                  onChange={(e) =>
                    onDirectExpenseChange(
                      'কাঠ',
                      parseFloat(e.target.value) || 0,
                      directExpenseNotes['কাঠ']
                    )
                  }
                  placeholder="০"
                  className="w-full text-base font-bold font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">৳</span>
              </div>
              <input
                type="text"
                value={directExpenseNotes['কাঠ'] || ''}
                onChange={(e) =>
                  onDirectExpenseChange(
                    'কাঠ',
                    directExpenses['কাঠ'] || 0,
                    e.target.value
                  )
                }
                placeholder="বিবরণ (যেমন: লাকড়ি ক্রয়)"
                className="w-full text-[11px] px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none"
              />
            </div>

            {/* 3. Dining Manager Refreshment */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-emerald-400 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-emerald-600" />
                  ডাইনিং ম্যানেজার নাস্তা
                </span>
                <span className="text-[10px] text-slate-500">চা/নাস্তা</span>
              </div>
              <div className="relative mb-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={directExpenses['ডাইনিং ম্যানেজার নাস্তা'] || ''}
                  onChange={(e) =>
                    onDirectExpenseChange(
                      'ডাইনিং ম্যানেজার নাস্তা',
                      parseFloat(e.target.value) || 0,
                      directExpenseNotes['ডাইনিং ম্যানেজার নাস্তা']
                    )
                  }
                  placeholder="০"
                  className="w-full text-base font-bold font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">৳</span>
              </div>
              <input
                type="text"
                value={directExpenseNotes['ডাইনিং ম্যানেজার নাস্তা'] || ''}
                onChange={(e) =>
                  onDirectExpenseChange(
                    'ডাইনিং ম্যানেজার নাস্তা',
                    directExpenses['ডাইনিং ম্যানেজার নাস্তা'] || 0,
                    e.target.value
                  )
                }
                placeholder="বিবরণ (যেমন: সকালের চা ও নাস্তা)"
                className="w-full text-[11px] px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none"
              />
            </div>

            {/* 4. Miscellaneous */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-purple-400 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-purple-600" />
                  বিবিধ
                </span>
                <span className="text-[10px] text-slate-500">অন্যান্য</span>
              </div>
              <div className="relative mb-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={directExpenses['বিবিধ'] || ''}
                  onChange={(e) =>
                    onDirectExpenseChange(
                      'বিবিধ',
                      parseFloat(e.target.value) || 0,
                      directExpenseNotes['বিবিধ']
                    )
                  }
                  placeholder="০"
                  className="w-full text-base font-bold font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">৳</span>
              </div>
              <input
                type="text"
                value={directExpenseNotes['বিবিধ'] || ''}
                onChange={(e) =>
                  onDirectExpenseChange(
                    'বিবিধ',
                    directExpenses['বিবিধ'] || 0,
                    e.target.value
                  )
                }
                placeholder="বিবরণ (যেমন: পলিথিন, সাবান ইত্যাদি)"
                className="w-full text-[11px] px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none"
              />
            </div>

            {/* 5. Extra Payment / Due to Pay (অতিরিক্ত টাকা প্রদান / টাকা দেয়া বাকি) requested by user */}
            <div className="sm:col-span-2 lg:col-span-4 bg-gradient-to-r from-amber-50/70 to-orange-50/70 p-3 sm:p-3.5 rounded-xl border border-amber-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">⚖️</span>
                  <span className="text-xs font-bold text-amber-950">
                    কোনো অতিরিক্ত টাকা প্রদান / টাকা দেওয়া বাকি (বকেয়া):
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {(['নেই', 'অতিরিক্ত টাকা প্রদান', 'টাকা দেওয়া বাকি (বকেয়া)'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onExtraPaymentChange?.(t, extraPaymentAmount, extraPaymentNotes)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                        extraPaymentType === t
                          ? t === 'নেই'
                            ? 'bg-slate-700 text-white'
                            : t === 'অতিরিক্ত টাকা প্রদান'
                            ? 'bg-blue-700 text-white shadow-xs'
                            : 'bg-red-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {extraPaymentType !== 'নেই' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-amber-900 mb-1">
                      {extraPaymentType}র পরিমাণ (৳):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={extraPaymentAmount || ''}
                        onChange={(e) =>
                          onExtraPaymentChange?.(
                            extraPaymentType,
                            parseFloat(e.target.value) || 0,
                            extraPaymentNotes
                          )
                        }
                        placeholder="টাকার পরিমাণ লিখুন"
                        className="w-full text-sm font-bold font-mono px-3 py-1.5 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">৳</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-amber-900 mb-1">
                      বিবরণ ও কারণ (রিপোর্টে উল্লেখ থাকবে):
                    </label>
                    <input
                      type="text"
                      value={extraPaymentNotes}
                      onChange={(e) =>
                        onExtraPaymentChange?.(
                          extraPaymentType,
                          extraPaymentAmount,
                          e.target.value
                        )
                      }
                      placeholder="যেমন: মাংসের দোকানে বকেয়া রয়েছে ৫০০ ৳ / অতিরিক্ত প্রদান ২০০ ৳"
                      className="w-full text-xs px-3 py-1.5 bg-white border border-amber-300 rounded-lg focus:outline-none text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Overall Breakdown Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              খাতভিত্তিক মোট খরচের পরিসংখ্যান:
            </h3>
            <span className="text-xs font-bold text-slate-800">
              সর্বমোট: <span className="font-mono text-emerald-700">{formatTaka(grandTotal)}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {categoriesList.map((cat) => {
              const amount = cat.isDirect
                ? (directExpenses[cat.key] || 0)
                : (itemExpensesByCategory[cat.key] || 0);

              const percentage = grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0;

              return (
                <div
                  key={cat.key}
                  className={`p-2.5 rounded-lg border text-xs transition-all ${
                    amount > 0 ? 'bg-white border-slate-300 shadow-xs' : 'bg-slate-50/50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-700 mb-1">
                    <span className="font-medium truncate flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.key}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {toBengaliDigits(percentage)}%
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="font-bold font-mono text-slate-900 text-sm">
                      {formatTaka(amount)}
                    </span>
                  </div>

                  {/* Progress line */}
                  <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1 rounded-full"
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
