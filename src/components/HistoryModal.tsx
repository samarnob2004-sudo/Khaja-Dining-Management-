import React, { useState } from 'react';
import { getAllSavedDates, loadRecord } from '../utils/storage';
import { formatBengaliDate, getDayName, isFeastDay, formatTaka, toBengaliDigits } from '../utils/bengaliNumbers';
import { DailyDiningRecord } from '../types/dining';
import { History, Calendar, Download, Upload, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface HistoryModalProps {
  currentDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  currentDate,
  onSelectDate,
  onClose,
}) => {
  const dates = getAllSavedDates();
  const [importStatus, setImportStatus] = useState<string>('');

  // Load records for summary
  const records: DailyDiningRecord[] = dates.map((d) => loadRecord(d));

  // Compute feast savings stats
  let totalFeastSavingsAccumulated = 0;
  let regularDaysCount = 0;
  let targetRegularSavings = 0;

  records.forEach((rec) => {
    const isFeast = isFeastDay(rec.date);
    const borderCol = rec.borderCount * rec.borderRate;
    const mkt = rec.items.reduce((s, i) => s + (i.totalPrice || 0), 0);
    const dir = Object.values(rec.directExpenses).reduce((a, b) => a + (b || 0), 0);
    const totalExp = mkt + dir;
    const savings = borderCol - totalExp;

    if (!isFeast) {
      regularDaysCount += 1;
      targetRegularSavings += 1500;
      totalFeastSavingsAccumulated += savings;
    }
  });

  const handleExportBackup = () => {
    const allData: Record<string, any> = {};
    dates.forEach((d) => {
      allData[d] = loadRecord(d);
    });
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kjah_dining_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (typeof parsed === 'object') {
          Object.keys(parsed).forEach((k) => {
            if (parsed[k]?.date) {
              localStorage.setItem(`kjah_dining_day_${parsed[k].date}`, JSON.stringify(parsed[k]));
            }
          });
          setImportStatus('✅ ব্যাকআপ ডাটা সফলভাবে রিস্টোর হয়েছে!');
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        }
      } catch (err) {
        setImportStatus('❌ ফাইল ফরম্যাট সঠিক নয়');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                ডাইনিং হিসাবের ইতিহাস ও ফিস্ট ফান্ড ট্র্যাকার
              </h2>
              <p className="text-xs text-slate-300">
                খান জাহান আলী হল — অতীতের বাজারের বিবরণ ও সেভিংস রিপোর্ট
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Feast Savings Pool Monitor */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                  সাপ্তাহিক ফিস্ট সেভিংস ফান্ড অগ্রগতি:
                </span>
                <p className="text-xs text-amber-800 mt-0.5">
                  মঙ্গলবার ও শুক্রবারের ফিস্টের জন্য বাকি ৫ দিন গড়ে দৈনিক কমপক্ষে ১৫০০ ৳ সঞ্চয়ের হিসাব
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-600 block">মোট জমাকৃত ফিস্ট ফান্ড:</span>
                <span className={`text-xl font-bold font-mono ${totalFeastSavingsAccumulated >= targetRegularSavings ? 'text-emerald-700' : 'text-amber-800'}`}>
                  {formatTaka(totalFeastSavingsAccumulated)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200">
                <span className="text-slate-500 block text-[10px]">সাধারণ দিনের সংখ্যা:</span>
                <span className="font-bold text-slate-800 font-mono text-sm">
                  {toBengaliDigits(regularDaysCount)} দিন
                </span>
              </div>
              <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200">
                <span className="text-slate-500 block text-[10px]">লক্ষ্যমাত্রা (১৫০০ ৳/দিন):</span>
                <span className="font-bold text-slate-800 font-mono text-sm">
                  {formatTaka(targetRegularSavings)}
                </span>
              </div>
              <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200 col-span-2 sm:col-span-1">
                <span className="text-slate-500 block text-[10px]">ফান্ড অবস্থান:</span>
                <span className="font-bold font-mono text-sm">
                  {totalFeastSavingsAccumulated >= targetRegularSavings ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> উদ্বৃত্ত রয়েছে
                    </span>
                  ) : (
                    <span className="text-red-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> ঘাটতি: {formatTaka(targetRegularSavings - totalFeastSavingsAccumulated)}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Dates list table */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              সংরক্ষিত তারিখসমূহের তালিকা ({toBengaliDigits(records.length)} টি দিন):
            </h3>

            {records.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                কোনো সংরক্ষিত রেকর্ড নেই
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">তারিখ ও বার</th>
                      <th className="py-2.5 px-3">ধরণ</th>
                      <th className="py-2.5 px-3 text-right">বর্ডার জমা</th>
                      <th className="py-2.5 px-3 text-right">মোট খরচ</th>
                      <th className="py-2.5 px-3 text-right">সেভিংস / ব্যালেন্স</th>
                      <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {records.map((rec) => {
                      const isFeast = isFeastDay(rec.date);
                      const isCurrent = rec.date === currentDate;
                      const borderCol = rec.borderCount * rec.borderRate;
                      const mkt = rec.items.reduce((s, i) => s + (i.totalPrice || 0), 0);
                      const dir = Object.values(rec.directExpenses).reduce((a, b) => a + (b || 0), 0);
                      const totalExp = mkt + dir;
                      const net = borderCol - totalExp;

                      return (
                        <tr
                          key={rec.date}
                          className={`hover:bg-slate-50 transition-colors ${
                            isCurrent ? 'bg-blue-50/60 font-semibold' : ''
                          }`}
                        >
                          <td className="py-2 px-3">
                            <div className="font-bold text-slate-900">
                              {formatBengaliDate(rec.date)}
                            </div>
                            {isCurrent && (
                              <span className="text-[10px] text-blue-600 font-medium">
                                (বর্তমানে প্রদর্শিত হচ্ছে)
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {isFeast ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                                🍗 ফিস্ট
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                সাধারণ দিন
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            {formatTaka(borderCol)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            {formatTaka(totalExp)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            <span className={net >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                              {net >= 0 ? `+${formatTaka(net)}` : formatTaka(net)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectDate(rec.date);
                                onClose();
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                            >
                              <span>ওপেন</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Backup & Restore */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              ডাটা ব্যাকআপ ও রিস্টোর (অফলাইন নিরাপত্তা):
            </h4>
            <p className="text-xs text-slate-500">
              সকল দিনের হিসাব নিরাপদে কম্পিউটারে ব্যাকআপ হিসেবে সেভ করে রাখতে পারেন।
            </p>
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>সকল ডাটা ডাউনলোড (JSON)</span>
              </button>

              <label className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>ডাটা ফাইল রিস্টোর করুন</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
            {importStatus && (
              <div className="text-xs font-semibold text-emerald-700 mt-2">
                {importStatus}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
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
