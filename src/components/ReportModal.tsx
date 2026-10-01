import React, { useState } from 'react';
import { DailyDiningRecord } from '../types/dining';
import { formatBengaliDate, getDayName, isFeastDay, toBengaliDigits, formatTaka } from '../utils/bengaliNumbers';
import { Printer, Copy, Check, ShieldAlert, CheckCircle2, Calendar, UserCheck } from 'lucide-react';

interface ReportModalProps {
  record: DailyDiningRecord;
  onUpdateRecord: (updated: DailyDiningRecord) => void;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  record,
  onUpdateRecord,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [managerName, setManagerName] = useState(record.managerName || 'এস. এ. এম. মাফিউল আলম অর্ণব');
  const [assistantName, setAssistantName] = useState(record.assistantManagerName || 'সহকারী ডাইনিং ম্যানেজার');

  const isFeast = isFeastDay(record.date);
  const dayName = getDayName(record.date);

  // Financial Calculations
  const totalBorderCollection = record.borderCount * record.borderRate;
  const marketTotal = record.items.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
  const directTotal = Object.values(record.directExpenses).reduce((a, b) => a + (b || 0), 0);
  const totalDayExpense = marketTotal + directTotal;
  const netSavings = totalBorderCollection - totalDayExpense;

  // Regular day rule: save at least 1,500 TK
  const TARGET_DAILY_SAVING = 1500;
  const maxSafeExpense = totalBorderCollection - TARGET_DAILY_SAVING;

  const isDirectCashLoan = totalDayExpense > totalBorderCollection;
  const directCashLoanAmount = isDirectCashLoan ? totalDayExpense - totalBorderCollection : 0;

  const isSavingsTargetBreached = !isFeast && (totalDayExpense > maxSafeExpense);
  const savingsDeficitAmount = isSavingsTargetBreached ? Math.max(0, TARGET_DAILY_SAVING - netSavings) : 0;

  const showRedAlert = isDirectCashLoan || (!isFeast && isSavingsTargetBreached);

  // Category Aggregates
  const categoryMap: Record<string, number> = {};
  record.items.forEach((item) => {
    let cat = item.category as string;
    if (cat === 'শাক') cat = 'সবজি';
    categoryMap[cat] = (categoryMap[cat] || 0) + item.totalPrice;
  });

  const categories = [
    'মুদি', 'মাছ', 'মুরগি', 'গরু', 'খাসি', 'সবজি', 'ডিম', 'মশলা',
    'যাতায়াত', 'কাঠ', 'ডাইনিং ম্যানেজার নাস্তা', 'বিবিধ'
  ];

  // Print Report Handler
  const handlePrint = () => {
    // Save signature names first
    onUpdateRecord({
      ...record,
      managerName,
      assistantManagerName: assistantName,
    });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Copy plain text format for Hall Facebook/WhatsApp groups
  const handleCopyTextReport = () => {
    onUpdateRecord({
      ...record,
      managerName,
      assistantManagerName: assistantName,
    });

    const statusText = isDirectCashLoan
      ? `🚨 [রেডমার্ক সতর্কবার্তা] বাজেট অতিক্রান্ত! সরাসরি লোনে আছি: ${formatTaka(directCashLoanAmount)}`
      : isSavingsTargetBreached
      ? `⚠️ [সতর্কবার্তা] ফিস্ট সেভিংস লক্ষ্যমাত্রা অপূর্ণ! ঘাটতি: ${formatTaka(savingsDeficitAmount)}`
      : `✅ [বাজেট সফল] আজকের ফিস্ট সেভিংস: ${formatTaka(netSavings)}`;

    const textReport = [
      `=======================================`,
      `🏢 খান জাহান আলী হল — ডাইনিং ও বাজার রিপোর্ট`,
      `খুলনা প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয় (KUET)`,
      `Made By S.A.M. Mafiul Alam Arnob - BECM 2K22`,
      `=======================================`,
      `📅 তারিখ: ${formatBengaliDate(record.date)}`,
      `📋 দিন: ${dayName} ${isFeast ? '(✨ সাপ্তাহিক ফিস্ট ডে)' : '(সাধারণ দিন)'}`,
      `👥 সক্রিয় বর্ডার: ${toBengaliDigits(record.borderCount)} জন (প্রতি বর্ডার: ${toBengaliDigits(record.borderRate)} ৳)`,
      `💰 মোট বর্ডার জমা: ${formatTaka(totalBorderCollection)}`,
      `🛒 মোট বাজার খরচ: ${formatTaka(marketTotal)}`,
      `🚚 অন্যান্য/অপারেশনাল খরচ: ${formatTaka(directTotal)}`,
      `💳 সর্বমোট খরচ: ${formatTaka(totalDayExpense)}`,
      `💵 নিট জমা/উদ্বৃত্ত: ${formatTaka(netSavings)}`,
      `${statusText}`,
      `---------------------------------------`,
      `📊 খাতভিত্তিক মোট ব্যয়:`,
      ...categories.map((cat) => {
        const amt = ['যাতায়াত', 'কাঠ', 'ডাইনিং ম্যানেজার নাস্তা', 'বিবিধ'].includes(cat)
          ? record.directExpenses[cat] || 0
          : categoryMap[cat] || 0;
        return ` • ${cat}: ${formatTaka(amt)}`;
      }),
      record.extraPaymentType && record.extraPaymentType !== 'নেই' && (record.extraPaymentAmount || 0) > 0
        ? `⚖️ ${record.extraPaymentType}: ${formatTaka(record.extraPaymentAmount || 0)}${record.extraPaymentNotes ? ` (${record.extraPaymentNotes})` : ''}`
        : '',
      `---------------------------------------`,
      `🥬 বিস্তারিত বাজার তালিকা (${toBengaliDigits(record.items.length)} টি):`,
      ...record.items.map((it, i) => {
        return ` ${i + 1}. ${it.name} (${it.category}) — ${toBengaliDigits(it.quantity)} ${it.unit} × ${toBengaliDigits(it.unitPrice)} ৳ = ${formatTaka(it.totalPrice)}`;
      }),
      record.meatFishStock.length > 0 ? `---------------------------------------` : '',
      record.meatFishStock.length > 0 ? `🐟 মাছ ও মাংস স্টক ও অবশিষ্ট পিস:` : '',
      ...record.meatFishStock.map((s) => {
        return ` • ${s.name}: মোট ${toBengaliDigits(s.totalPieces)} পিস, সার্ভড ${toBengaliDigits(s.piecesServed)} পিস | অবশিষ্ট: ${toBengaliDigits(s.remainingPieces)} পিস (${toBengaliDigits(s.remainingKg)} কেজি) [${s.storageNote || 'সংরক্ষিত'}]`;
      }),
      `=======================================`,
      `✍️ ডাইনিং ম্যানেজার: ${managerName}`,
      `✍️ সহকারী ডাইনিং ম্যানেজার: ${assistantName}`,
      `=======================================`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(textReport).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden my-auto print:max-h-none print:shadow-none print:border-none print:m-0 print:p-0 print:w-full">
        
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-sm">
              📄 অফিসিয়াল রিপোর্ট ও ডাউনলোড ভিউ
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>তারিখ:</span>
              <input
                type="date"
                value={record.date}
                onChange={(e) => {
                  if (e.target.value) {
                    onUpdateRecord({ ...record, date: e.target.value });
                  }
                }}
                className="bg-slate-800 text-white text-xs px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTextReport}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি সম্পন্ন!' : 'পুরো রিপোর্ট কপি করুন'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>পিডিএফ / প্রিন্ট ডাউনলোড</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white px-2 py-1 text-base font-bold ml-1 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-report" className="p-4 sm:p-8 overflow-y-auto space-y-6 flex-1 print:p-2 print:overflow-visible">
          
          {/* Header on top requested by user */}
          <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
            <div className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
              Made By S.A.M. Mafiul Alam Arnob - BECM 2K22
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              খান জাহান আলী হল
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              খুলনা প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয় (KUET)
            </p>
            <div className="inline-block mt-1 px-3 py-0.5 bg-slate-100 rounded text-xs font-bold text-slate-800 border border-slate-300">
              দৈনিক ডাইনিং ও বাজার খরচের হিসাব বিবরণী
            </div>
          </div>

          {/* Date & Border Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">তারিখ ও বার:</span>
              <span className="font-bold text-slate-900">{formatBengaliDate(record.date)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">দিনের ধরণ:</span>
              <span className="font-bold text-slate-900">
                {isFeast ? '🍗 সাপ্তাহিক ফিস্ট' : 'সাধারণ দিন'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">সক্রিয় বর্ডার ও মিল রেট:</span>
              <div className="font-bold text-slate-900 font-mono flex items-center gap-1">
                <span>{toBengaliDigits(record.borderCount)} জন</span>
                <span>
                  (দর:{' '}
                  <span className="hidden print:inline">{toBengaliDigits(record.borderRate)} ৳</span>
                  <input
                    type="number"
                    min="1"
                    value={record.borderRate}
                    onChange={(e) =>
                      onUpdateRecord({
                        ...record,
                        borderRate: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="w-12 px-1 py-0 border border-slate-300 focus:border-emerald-600 rounded text-center text-xs font-bold text-emerald-800 print:hidden"
                    title="ক্লিক করে মিল রেট এডিট করুন"
                  />
                  <span className="print:hidden">৳</span>)
                </span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">মোট বর্ডার জমা:</span>
              <span className="font-bold text-emerald-800 font-mono text-sm">
                {formatTaka(totalBorderCollection)}
              </span>
            </div>
          </div>

          {/* RED ALERT / FINANCIAL WARNING (Spec: "রিপোর্ট জেনারেশনে একটা রেডমার্ক আসবে টাকা ক্রস করলে বেশি হয়ে গেছে কত টাকা লোনে আছি এটাও দেখাবে") */}
          {showRedAlert ? (
            <div className="bg-red-50 border border-red-500 rounded-lg p-3 text-red-900 print:border-red-600 shadow-2xs">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0"></span>
                <span className="font-bold text-xs sm:text-sm text-red-700 uppercase">
                  রেডমার্ক নোটিশ: ডাইনিং বাজেট অতিক্রান্ত!
                </span>
              </div>
              <div className="text-xs font-medium space-y-0.5 pl-4">
                {isDirectCashLoan ? (
                  <p className="text-red-900 font-semibold">
                    আজকের মোট খরচে সরাসরি <span className="font-bold underline text-red-700">{formatTaka(directCashLoanAmount)} লোনে আছি</span> (খরচ জমার চেয়ে বেশি হয়েছে)।
                  </p>
                ) : (
                  <p className="text-red-900 font-semibold">
                    ফিস্টের জন্য নির্ধারিত দৈনিক ১৫০০ টাকা সঞ্চয়ের শর্ত পূরণ হয়নি। ঘাটতি / লোনের পরিমাণ: <span className="font-bold underline text-red-700">{formatTaka(savingsDeficitAmount)}</span>
                  </p>
                )}
                <p className="text-[11px] text-red-700">
                  মোট জমা: {formatTaka(totalBorderCollection)} · মোট খরচ: {formatTaka(totalDayExpense)} · নিট ব্যালেন্স: {formatTaka(netSavings)}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-emerald-950 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">
                  {isFeast
                    ? 'ফিস্ট ব্যালেন্স সন্তোষজনক'
                    : 'সফল বাজেট: মঙ্গলবার ও শুক্রবারের ফিস্টের জন্য দৈনিক ১৫০০ ৳ সঞ্চয়ের লক্ষ্যমাত্রা অর্জিত!'}
                </span>
              </div>
              <div className="font-bold font-mono text-emerald-800">
                আজকের উদ্বৃত্ত: +{formatTaka(netSavings)}
              </div>
            </div>
          )}

          {/* Financial Summary 4 Cards */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-500 block">মোট বর্ডার আয়</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {formatTaka(totalBorderCollection)}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-500 block">সর্বমোট খরচ</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {formatTaka(totalDayExpense)}
              </span>
            </div>
            <div className={`p-2.5 rounded-lg border ${netSavings >= 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
              <span className="text-[10px] block font-medium">নিট উদ্বৃত্ত / (ঘাটতি)</span>
              <span className="text-sm font-bold font-mono">
                {formatTaka(netSavings)}
              </span>
            </div>
          </div>

          {/* Category-wise Expense Breakdown Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b pb-1">
              খাতভিত্তিক খরচের সারসংক্ষেপ:
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
              {categories.map((cat) => {
                const amt = ['যাতায়াত', 'কাঠ', 'ডাইনিং ম্যানেজার নাস্তা', 'বিবিধ'].includes(cat)
                  ? record.directExpenses[cat] || 0
                  : categoryMap[cat] || 0;
                return (
                  <div key={cat} className="p-2 bg-slate-50 rounded border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-600 block truncate">{cat}</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">{formatTaka(amt)}</span>
                  </div>
                );
              })}
            </div>

            {/* Extra Payment / Due to Pay (অতিরিক্ত টাকা প্রদান / টাকা দেয়া বাকি) in Report */}
            {record.extraPaymentType && record.extraPaymentType !== 'নেই' && (record.extraPaymentAmount || 0) > 0 && (
              <div className="mt-2.5 p-2.5 bg-amber-50/80 border border-amber-300 rounded-lg text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚖️</span>
                  <div>
                    <span className="font-bold text-amber-950">
                      {record.extraPaymentType}: <span className="font-mono text-sm underline text-amber-900">{formatTaka(record.extraPaymentAmount || 0)}</span>
                    </span>
                    {record.extraPaymentNotes && (
                      <span className="text-[11px] text-amber-800 ml-1.5 font-normal">
                        ({record.extraPaymentNotes})
                      </span>
                    )}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-amber-900 border border-amber-300 shrink-0">
                  {record.extraPaymentType === 'টাকা দেওয়া বাকি (বকেয়া)' ? 'বকেয়া দায়' : 'অগ্রিম/অতিরিক্ত'}
                </span>
              </div>
            )}
          </div>

          {/* Detailed Itemized Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b pb-1">
              বিস্তারিত বাজারের তালিকা ও ভাউচার বিবরণ:
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5 w-8 text-center">নং</th>
                    <th className="py-2 px-2.5">পণ্য</th>
                    <th className="py-2 px-2.5">বিভাগ</th>
                    <th className="py-2 px-2.5 text-right">পরিমাণ</th>
                    <th className="py-2 px-2.5 text-right">একক দর</th>
                    <th className="py-2 px-2.5 text-right">মোট টাকা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {record.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-1.5 px-2.5 text-center text-slate-500 font-mono">
                        {toBengaliDigits(index + 1)}
                      </td>
                      <td className="py-1.5 px-2.5 font-medium text-slate-900">
                        {item.name}
                        {item.notes && <span className="text-[10px] text-slate-500 ml-1">({item.notes})</span>}
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-600 text-[10px]">
                        {item.category}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono">
                        {toBengaliDigits(item.quantity)} {item.unit}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono">
                        {item.unitPrice ? `${toBengaliDigits(item.unitPrice)} ৳` : '-'}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900">
                        {formatTaka(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                  {record.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        কোনো পণ্য বাজারে নেই
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
                  <tr>
                    <td colSpan={5} className="py-2 px-2.5 text-right text-slate-700">
                      বাজারের মোট মূল্য:
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-emerald-800">
                      {formatTaka(marketTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Fish, Meat & Major Food Stock Table */}
          {record.meatFishStock.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b pb-1">
                মাছ, মাংস ও খাদ্য সামগ্রী ইনভেন্টরি ও অবশিষ্ট স্টক:
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-1.5 px-2.5">আইটেম ও ক্যাটাগরি</th>
                      <th className="py-1.5 px-2.5 text-right">মোট ওজন</th>
                      <th className="py-1.5 px-2.5 text-right">কেজিতে পিস/রেট</th>
                      <th className="py-1.5 px-2.5 text-right">মোট পরিমাণ</th>
                      <th className="py-1.5 px-2.5 text-right">সার্ভ করা/ব্যবহৃত</th>
                      <th className="py-1.5 px-2.5 text-right font-bold text-teal-900">বেচে গেছে (পিস/ইউনিট)</th>
                      <th className="py-1.5 px-2.5 text-right font-bold text-teal-900">বেচে গেছে (কেজি)</th>
                      <th className="py-1.5 px-2.5">সংরক্ষণ নোট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {record.meatFishStock.map((s) => (
                      <tr key={s.id}>
                        <td className="py-1.5 px-2.5 font-sans font-bold text-slate-900">
                          {s.name} <span className="text-[10px] text-slate-500 font-normal">({s.category})</span>
                        </td>
                        <td className="py-1.5 px-2.5 text-right">{toBengaliDigits(s.totalWeightKg)} কেজি</td>
                        <td className="py-1.5 px-2.5 text-right">{toBengaliDigits(s.piecesPerKg)}</td>
                        <td className="py-1.5 px-2.5 text-right">{toBengaliDigits(s.totalPieces)}</td>
                        <td className="py-1.5 px-2.5 text-right">{toBengaliDigits(s.piecesServed)}</td>
                        <td className="py-1.5 px-2.5 text-right font-bold text-teal-800">{toBengaliDigits(s.remainingPieces)}</td>
                        <td className="py-1.5 px-2.5 text-right font-bold text-teal-800">{toBengaliDigits(s.remainingKg)} কেজি</td>
                        <td className="py-1.5 px-2.5 font-sans text-[11px] text-slate-600">{s.storageNote || 'সংরক্ষিত'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Official Signatures Section (Requested: "নিচে ডাইনিং ম্যানেজারের সাইন দেয়ার জায়গা থাকবে") */}
          <div className="pt-10 mt-8 border-t-2 border-slate-300">
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              
              {/* Dining Manager Signature */}
              <div className="space-y-2">
                <div className="h-12 flex items-end justify-center">
                  <div className="w-40 border-b-2 border-slate-600 border-dashed"></div>
                </div>
                <div className="print:hidden">
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="ম্যানেজারের নাম"
                    className="text-center font-bold text-xs text-slate-900 border-b border-slate-300 focus:outline-none w-44"
                  />
                </div>
                <div className="hidden print:block font-bold text-slate-900">
                  {managerName}
                </div>
                <div className="font-semibold text-slate-700">
                  ডাইনিং ম্যানেজারের স্বাক্ষর
                </div>
                <div className="text-[10px] text-slate-500">
                  খান জাহান আলী হল, কুয়েট
                </div>
              </div>

              {/* Assistant Manager / Audit Signature */}
              <div className="space-y-2">
                <div className="h-12 flex items-end justify-center">
                  <div className="w-40 border-b-2 border-slate-600 border-dashed"></div>
                </div>
                <div className="print:hidden">
                  <input
                    type="text"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    placeholder="সহকারী ম্যানেজারের নাম"
                    className="text-center font-bold text-xs text-slate-900 border-b border-slate-300 focus:outline-none w-44"
                  />
                </div>
                <div className="hidden print:block font-bold text-slate-900">
                  {assistantName}
                </div>
                <div className="font-semibold text-slate-700">
                  সহকারী ডাইনিং ম্যানেজার / নিরীক্ষক
                </div>
                <div className="text-[10px] text-slate-500">
                  ডাইনিং ব্যবস্থাপনা কমিটি
                </div>
              </div>

              {/* Hall Provost / Assistant Provost Signature */}
              <div className="space-y-2">
                <div className="h-12 flex items-end justify-center">
                  <div className="w-40 border-b-2 border-slate-600 border-dashed"></div>
                </div>
                <div className="font-bold text-slate-900 pt-1">
                  স্বাক্ষর ও সীল
                </div>
                <div className="font-semibold text-slate-700">
                  হল প্রাধ্যক্ষ / সহকারী প্রভোস্ট
                </div>
                <div className="text-[10px] text-slate-500">
                  খান জাহান আলী হল, কুয়েট
                </div>
              </div>

            </div>
          </div>

          {/* Footer watermark note in print */}
          <div className="text-center text-[10px] text-slate-400 pt-6 border-t border-slate-200">
            রিপোর্ট প্রস্তুত সময়: {new Date().toLocaleTimeString()} · খান জাহান আলী হল ডাইনিং ম্যানেজমেন্ট সিস্টেম · Developed by S.A.M. Mafiul Alam Arnob (BECM 2K22)
          </div>

        </div>

        {/* Modal Bottom Close */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
