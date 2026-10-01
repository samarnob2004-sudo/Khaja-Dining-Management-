import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, FileText, ShoppingBag, History, Sparkles } from 'lucide-react';
import { getDayName, isFeastDay } from '../utils/bengaliNumbers';
import { getNextDateString } from '../utils/storage';

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  onOpenReport: () => void;
  onOpenPlanner: () => void;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  onOpenReport,
  onOpenPlanner,
  onOpenHistory,
}) => {
  const dayName = getDayName(currentDate);
  const isFeast = isFeastDay(currentDate);

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    onDateChange(`${yr}-${mo}-${dy}`);
  };

  const handleNextDay = () => {
    onDateChange(getNextDateString(currentDate));
  };

  const handleToday = () => {
    const d = new Date();
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    onDateChange(`${yr}-${mo}-${dy}`);
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-xs">
      {/* Sleek Credit Line */}
      <div className="bg-emerald-800/90 text-emerald-100 px-3 py-0.5 text-[11px] font-medium text-center flex items-center justify-center gap-1.5 border-b border-emerald-700/50">
        <Sparkles className="w-3 h-3 text-emerald-300" />
        <span>Made By S.A.M. Mafiul Alam Arnob - BECM 2K22</span>
        <span className="hidden sm:inline text-emerald-400">·</span>
        <span className="hidden sm:inline text-emerald-200">খান জাহান আলী হল (KUET) ডাইনিং</span>
      </div>

      {/* Slim Compact Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 sm:py-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0 tracking-tighter">
              KJA
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  খান জাহান আলী হল
                </span>
                {isFeast ? (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                    🍗 ফিস্ট ডে ({dayName})
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                    {dayName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center Date Navigator */}
          <div className="flex items-center bg-slate-800/90 rounded-md p-0.5 border border-slate-700 text-xs">
            <button
              onClick={handlePrevDay}
              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="পূর্ববর্তী দিন"
              type="button"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            
            <div className="flex items-center gap-1 px-1.5">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="পরবর্তী দিন"
              type="button"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleToday}
              className="ml-0.5 px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-medium transition-colors cursor-pointer"
              type="button"
            >
              আজ
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenPlanner}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="পরের দিনের বাজার তালিকা"
              type="button"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">পরের দিন</span> ফর্দ
            </button>

            <button
              onClick={onOpenHistory}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="হিসাবের ইতিহাস"
              type="button"
            >
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">ইতিহাস</span>
            </button>

            <button
              onClick={onOpenReport}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              title="রিপোর্ট জেনারেট ও প্রিন্ট"
              type="button"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>রিপোর্ট</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
