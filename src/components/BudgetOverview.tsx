import React from 'react';
import { Users, TrendingUp, DollarSign, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toBengaliDigits, formatTaka, isFeastDay, getDayName } from '../utils/bengaliNumbers';

interface BudgetOverviewProps {
  currentDate: string;
  borderCount: number;
  borderRate: number;
  totalMarketExpense: number;
  totalDirectExpense: number;
  onBorderCountChange: (count: number) => void;
  onBorderRateChange: (rate: number) => void;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  currentDate,
  borderCount,
  borderRate,
  totalMarketExpense,
  totalDirectExpense,
  onBorderCountChange,
  onBorderRateChange,
}) => {
  const isFeast = isFeastDay(currentDate);
  const dayName = getDayName(currentDate);

  const totalExpense = totalMarketExpense + totalDirectExpense;
  const totalBorderCollection = borderCount * borderRate;
  const netSavings = totalBorderCollection - totalExpense;

  // Regular day saving requirement: 1,500 TK
  const TARGET_DAILY_SAVING = 1500;
  const maxSafeExpense = totalBorderCollection - TARGET_DAILY_SAVING;

  // Loan and over-budget checks
  const isDirectCashLoan = totalExpense > totalBorderCollection;
  const directCashLoanAmount = isDirectCashLoan ? totalExpense - totalBorderCollection : 0;

  // On regular days, check if target 1500 TK savings is breached
  const isSavingsTargetBreached = !isFeast && (totalExpense > maxSafeExpense);
  const savingsDeficitAmount = isSavingsTargetBreached ? Math.max(0, TARGET_DAILY_SAVING - netSavings) : 0;

  const hasWarning = isDirectCashLoan || (!isFeast && isSavingsTargetBreached);

  return (
    <div className="space-y-3">
      {/* 4. Simple, clean, user-friendly alert banner (easy & polite) */}
      {hasWarning && (
        <div className="bg-red-50/90 border border-red-200 text-red-900 rounded-lg px-3.5 py-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
            <span className="text-red-800">
              {isDirectCashLoan ? (
                <>
                  <strong className="text-red-900">বাজেট অতিক্রম:</strong> আজকের মোট খরচ আদায়কৃত জমার চেয়ে <strong>{formatTaka(directCashLoanAmount)}</strong> বেশি (লোনে আছি)।
                </>
              ) : (
                <>
                  <strong className="text-red-900">ফিস্ট সেভিংস নোট:</strong> সাধারণ দিনের ১৫০০ ৳ সঞ্চয়ের লক্ষ্যমাত্রা থেকে <strong>{formatTaka(savingsDeficitAmount)}</strong> ঘাটতি রয়েছে।
                </>
              )}
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white text-red-700 font-mono font-bold text-[11px] border border-red-200">
              {isDirectCashLoan ? `লোন: ${formatTaka(directCashLoanAmount)}` : `ঘাটতি: ${formatTaka(savingsDeficitAmount)}`}
            </span>
          </div>
        </div>
      )}

      {/* Feast Day subtle note */}
      {isFeast && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-900 rounded-lg px-3 py-1.5 text-xs flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <span>🍗</span>
            <span><strong>আজ {dayName} (সাপ্তাহিক ফিস্ট):</strong> জমানো ফিস্ট ফান্ডের টাকা সমন্বয় হবে।</span>
          </span>
          <span className="text-[11px] font-semibold text-amber-800">ফিস্ট স্পেশাল মিল</span>
        </div>
      )}

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        
        {/* Card 1: Active Borders & Meal Rate (এডিটযোগ্য) */}
        <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium flex items-center gap-1 text-[11px]">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              বর্ডার ও মিল রেট
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-semibold">
              এডিটযোগ্য
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[10px] text-slate-500 font-medium">সক্রিয় বর্ডার:</span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={borderCount}
                  onChange={(e) => onBorderCountChange(Math.max(0, parseInt(e.target.value) || 0))}
                  className="text-lg sm:text-xl font-bold text-slate-900 w-16 border-b border-dashed border-slate-300 focus:border-blue-600 focus:outline-none py-0 font-mono"
                  title="সক্রিয় বর্ডার সংখ্যা পরিবর্তন করুন"
                />
                <span className="text-[11px] text-slate-500">জন</span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] text-slate-500 font-medium">মিল রেট (৳):</span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={borderRate}
                  onChange={(e) => onBorderRateChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-lg sm:text-xl font-bold text-emerald-800 w-14 border-b border-dashed border-emerald-400 focus:border-emerald-600 focus:outline-none py-0 font-mono bg-emerald-50/50 rounded-xs px-0.5"
                  title="মিল রেট এডিট করুন (ক্লিক করে পরিবর্তন করুন)"
                />
                <span className="text-[11px] font-bold text-emerald-700">৳</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 mt-1 truncate">
            * বর্ডার বা মিল রেটে ক্লিক করে পরিবর্তন করুন
          </div>
        </div>

        {/* Card 2: Total Collection */}
        <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 mb-1 font-medium flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            মোট বর্ডার জমা (আয়)
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono">
            {formatTaka(totalBorderCollection)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {toBengaliDigits(borderCount)} জন × {toBengaliDigits(borderRate)} ৳
          </div>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 mb-1 font-medium flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-amber-600" />
            আজকের মোট খরচ
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono ${totalExpense > totalBorderCollection ? 'text-red-600' : 'text-slate-900'}`}>
            {formatTaka(totalExpense)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            বাজার: {formatTaka(totalMarketExpense)} · অন্য: {formatTaka(totalDirectExpense)}
          </div>
        </div>

        {/* Card 4: Net Balance / Savings */}
        <div className={`rounded-lg p-3 border shadow-2xs ${
          isDirectCashLoan
            ? 'bg-red-50/70 border-red-200 text-red-900'
            : isSavingsTargetBreached
            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
        }`}>
          <div className="text-[11px] mb-1 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {isDirectCashLoan ? 'ঘাটতি / লোন' : 'আজকের নিট জমা'}
            </span>
            {!isFeast && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-white/80 text-slate-600">
                টার্গেট ১৫০০৳
              </span>
            )}
          </div>

          <div className={`text-xl sm:text-2xl font-bold font-mono ${
            isDirectCashLoan ? 'text-red-700' : netSavings >= 1500 ? 'text-emerald-700' : 'text-amber-800'
          }`}>
            {isDirectCashLoan ? `-${formatTaka(directCashLoanAmount)}` : `+${formatTaka(netSavings)}`}
          </div>

          <div className="text-[10px] mt-1 font-medium flex items-center gap-1 truncate">
            {isDirectCashLoan ? (
              <span className="text-red-700">বাজেট অতিক্রম (লোনে আছি)</span>
            ) : isSavingsTargetBreached ? (
              <span className="text-amber-800">১৫০০৳ জমার চেয়ে কম</span>
            ) : (
              <span className="text-emerald-700">লক্ষ্যমাত্রা অর্জিত</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
