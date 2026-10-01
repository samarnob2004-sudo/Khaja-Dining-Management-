/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DailyDiningRecord, BazaarItem, NextDayPlanItem, FishMeatStockItem } from './types/dining';
import {
  getTodayDateString,
  getNextDateString,
  loadRecord,
  saveRecord,
  loadNextDayPlan,
  saveNextDayPlan,
  seedSampleDataIfEmpty,
} from './utils/storage';
import { formatTaka, toBengaliDigits, isFeastDay } from './utils/bengaliNumbers';
import { Header } from './components/Header';
import { BudgetOverview } from './components/BudgetOverview';
import { BazaarEntry } from './components/BazaarEntry';
import { CategoryExpenses } from './components/CategoryExpenses';
import { FishMeatInventory } from './components/FishMeatInventory';
import { NextDayPlanner } from './components/NextDayPlanner';
import { ReportModal } from './components/ReportModal';
import { HistoryModal } from './components/HistoryModal';
import { ShoppingCart, PieChart, Fish, FileText, ShoppingBag, ArrowDown, Sparkles } from 'lucide-react';

export default function App() {
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [record, setRecord] = useState<DailyDiningRecord>(() => {
    seedSampleDataIfEmpty();
    return loadRecord(getTodayDateString());
  });

  const nextDayDate = getNextDateString(currentDate);
  const [nextDayPlan, setNextDayPlan] = useState<NextDayPlanItem[]>(() =>
    loadNextDayPlan(nextDayDate)
  );

  // Modals state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // When date changes, load that day's record and next day plan
  useEffect(() => {
    const loaded = loadRecord(currentDate);
    setRecord(loaded);
    const plan = loadNextDayPlan(getNextDateString(currentDate));
    setNextDayPlan(plan);
  }, [currentDate]);

  // Persist record on changes
  const updateAndSaveRecord = (updated: DailyDiningRecord) => {
    setRecord(updated);
    saveRecord(updated);
  };

  // Bazaar Items Handlers
  const handleAddItem = (item: Omit<BazaarItem, 'id'>) => {
    const newItem: BazaarItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated: DailyDiningRecord = {
      ...record,
      items: [newItem, ...record.items],
    };
    updateAndSaveRecord(updated);
  };

  const handleUpdateItem = (id: string, updatedFields: Partial<BazaarItem>) => {
    const updatedItems = record.items.map((it) =>
      it.id === id ? { ...it, ...updatedFields } : it
    );
    updateAndSaveRecord({ ...record, items: updatedItems });
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = record.items.filter((it) => it.id !== id);
    updateAndSaveRecord({ ...record, items: updatedItems });
  };

  const handleClearAllItems = () => {
    updateAndSaveRecord({ ...record, items: [] });
  };

  // Direct Expenses Handlers
  const handleDirectExpenseChange = (category: string, amount: number, note?: string) => {
    const newExpenses = { ...record.directExpenses, [category]: amount };
    const newNotes = { ...record.directExpenseNotes, [category]: note || '' };
    updateAndSaveRecord({
      ...record,
      directExpenses: newExpenses,
      directExpenseNotes: newNotes,
    });
  };

  const handleExtraPaymentChange = (
    type: 'অতিরিক্ত টাকা প্রদান' | 'টাকা দেওয়া বাকি (বকেয়া)' | 'নেই',
    amount: number,
    notes: string
  ) => {
    updateAndSaveRecord({
      ...record,
      extraPaymentType: type,
      extraPaymentAmount: amount,
      extraPaymentNotes: notes,
    });
  };

  // Border Settings
  const handleBorderCountChange = (count: number) => {
    updateAndSaveRecord({ ...record, borderCount: count });
  };

  const handleBorderRateChange = (rate: number) => {
    updateAndSaveRecord({ ...record, borderRate: rate });
  };

  // Meat / Fish Stock
  const handleUpdateStock = (stockItems: FishMeatStockItem[]) => {
    updateAndSaveRecord({ ...record, meatFishStock: stockItems });
  };

  // Next Day Planner Handlers
  const handleUpdateNextDayPlan = (items: NextDayPlanItem[]) => {
    setNextDayPlan(items);
    saveNextDayPlan(nextDayDate, items);
  };

  const handleApplyPlanToToday = (planItems: NextDayPlanItem[]) => {
    const convertedItems: BazaarItem[] = planItems.map((p) => {
      const qtyNum = parseFloat(p.estimatedQuantity) || 1;
      const unit = p.estimatedQuantity.replace(/[0-9.]/g, '').trim() || 'কেজি';
      const price = p.estimatedPrice || 0;
      return {
        id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: p.name,
        category: p.category,
        quantity: qtyNum,
        unit: unit || 'কেজি',
        unitPrice: price > 0 && qtyNum > 0 ? Math.round(price / qtyNum) : 0,
        totalPrice: price,
        notes: p.notes,
      };
    });

    updateAndSaveRecord({
      ...record,
      items: [...convertedItems, ...record.items],
    });
    setIsPlannerOpen(false);
  };

  // Smooth scroll helper
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Financial aggregates
  const totalMarketExpense = record.items.reduce((s, it) => s + (it.totalPrice || 0), 0);
  const totalDirectExpense = Object.values(record.directExpenses).reduce((a, b) => a + (b || 0), 0);
  const totalDayExpense = totalMarketExpense + totalDirectExpense;
  const totalBorderCollection = record.borderCount * record.borderRate;
  const netSavings = totalBorderCollection - totalDayExpense;

  const isFeast = isFeastDay(currentDate);
  const isDirectCashLoan = totalDayExpense > totalBorderCollection;

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-['Hind_Siliguri',sans-serif]">
      
      {/* Top Header */}
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenPlanner={() => setIsPlannerOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-5 py-3 sm:py-4 space-y-4 flex-1">
        
        {/* Budget Overview Card */}
        <BudgetOverview
          currentDate={currentDate}
          borderCount={record.borderCount}
          borderRate={record.borderRate}
          totalMarketExpense={totalMarketExpense}
          totalDirectExpense={totalDirectExpense}
          onBorderCountChange={handleBorderCountChange}
          onBorderRateChange={handleBorderRateChange}
        />

        {/* 3 Segments Quick Jump Navigation Header Bar */}
        <div className="sticky top-12 z-20 bg-white/95 backdrop-blur-xs rounded-xl border border-slate-200/90 p-1.5 shadow-xs flex items-center justify-between gap-1 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => scrollToSection('bazaar-section')}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 transition-all cursor-pointer whitespace-nowrap"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
              <span>১. দৈনিক বাজার তালিকা</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                {toBengaliDigits(record.items.length)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('categories-section')}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-slate-700 hover:text-blue-800 hover:bg-blue-50 transition-all cursor-pointer whitespace-nowrap"
            >
              <PieChart className="w-3.5 h-3.5 text-blue-600" />
              <span>২. খাতসমূহ ও অপারেশনাল খরচ</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('inventory-section')}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-slate-700 hover:text-teal-800 hover:bg-teal-50 transition-all cursor-pointer whitespace-nowrap"
            >
              <Fish className="w-3.5 h-3.5 text-teal-600" />
              <span>৩. মাছ-মাংস স্টক ও পিস হিসাব</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                {toBengaliDigits(record.meatFishStock.length)}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center text-[11px] text-slate-500 pr-2 shrink-0">
            <span>নিচে স্ক্রল করে তথ্য পূরণ করুন</span>
            <ArrowDown className="w-3 h-3 ml-1 text-slate-400" />
          </div>
        </div>

        {/* 3 Segments Rendered Sequentially on the Page */}

        {/* Segment 1: Bazaar Entry */}
        <section>
          <BazaarEntry
            items={record.items}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onClearAllItems={handleClearAllItems}
          />
        </section>

        {/* Segment 2: Category Breakdown & Direct Expenses */}
        <section>
          <CategoryExpenses
            items={record.items}
            directExpenses={record.directExpenses}
            directExpenseNotes={record.directExpenseNotes}
            onDirectExpenseChange={handleDirectExpenseChange}
            extraPaymentType={record.extraPaymentType}
            extraPaymentAmount={record.extraPaymentAmount}
            extraPaymentNotes={record.extraPaymentNotes}
            onExtraPaymentChange={handleExtraPaymentChange}
          />
        </section>

        {/* Segment 3: Fish & Meat Stock Inventory with Auto-Calculated Remaining Pieces & Click-to-Edit */}
        <section>
          <FishMeatInventory
            stockItems={record.meatFishStock}
            bazaarItems={record.items}
            borderCount={record.borderCount}
            onUpdateStock={handleUpdateStock}
          />
        </section>

        {/* Final Unified Report Generation Card at the bottom of the scroll */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                সকল সেগমেন্ট পূরণ সম্পন্ন হয়েছে?
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              বাজার তালিকা, অপারেশনাল খরচ ও মাছ-মাংস স্টক মিলিয়ে পূর্ণাঙ্গ ডাইনিং হিসাব রিপোর্ট ও স্বাক্ষর কপি তৈরি করুন
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>সব মিলিয়ে রিপোর্ট ও সাইন কপি জেনারেট করুন</span>
          </button>
        </section>

      </main>

      {/* Sticky Bottom Bar with Quick Summary and Report Trigger */}
      <footer className="bg-white border-t border-slate-200 sticky bottom-0 z-20 py-2 px-3 sm:px-4 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          <div className="flex items-center gap-3 sm:gap-5 text-xs flex-wrap justify-center sm:justify-start">
            <div>
              <span className="text-slate-500">বর্ডার আয়: </span>
              <strong className="text-slate-900 font-mono">{formatTaka(totalBorderCollection)}</strong>
            </div>
            <div>
              <span className="text-slate-500">মোট খরচ: </span>
              <strong className="text-slate-900 font-mono">{formatTaka(totalDayExpense)}</strong>
            </div>
            <div>
              <span className="text-slate-500">ব্যালেন্স: </span>
              <strong className={`font-mono ${isDirectCashLoan ? 'text-red-600' : 'text-emerald-700'}`}>
                {isDirectCashLoan ? `-${formatTaka(totalDayExpense - totalBorderCollection)} (লোন)` : `+${formatTaka(netSavings)}`}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlannerOpen(true)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
              <span>আগামীকালের ফর্দ</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>রিপোর্ট ও সাইন কপি</span>
            </button>
          </div>

        </div>
      </footer>

      {/* Report Modal with Signatures & Print/PDF */}
      {isReportOpen && (
        <ReportModal
          record={record}
          onUpdateRecord={updateAndSaveRecord}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Next Day Bazaar Planner Modal */}
      {isPlannerOpen && (
        <NextDayPlanner
          currentDate={currentDate}
          nextDayDate={nextDayDate}
          planItems={nextDayPlan}
          onUpdatePlan={handleUpdateNextDayPlan}
          onApplyPlanToToday={handleApplyPlanToToday}
          onClose={() => setIsPlannerOpen(false)}
        />
      )}

      {/* History & Feast Pool Modal */}
      {isHistoryOpen && (
        <HistoryModal
          currentDate={currentDate}
          onSelectDate={setCurrentDate}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

    </div>
  );
}
