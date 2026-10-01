import React, { useState } from 'react';
import { FishMeatStockItem, BazaarItem } from '../types/dining';
import { toBengaliDigits } from '../utils/bengaliNumbers';
import { Fish, Plus, Trash2, Refrigerator, RefreshCw, Calculator, Edit3, Sparkles } from 'lucide-react';

interface FishMeatInventoryProps {
  stockItems: FishMeatStockItem[];
  bazaarItems: BazaarItem[];
  borderCount: number;
  onUpdateStock: (items: FishMeatStockItem[]) => void;
}

// Preset categories requested by the user: চাল, ডাল, মাছ, মুরগি, গরু, খাসি, চিংড়ি, আলু, পেঁয়াজ
interface StockCategoryPreset {
  category: string;
  defaultName: string;
  icon: string;
  defaultPiecesPerKg: number;
  unitLabel: string;
  bazaarMatchKeyword: string;
}

const STOCK_CATEGORY_PRESETS: StockCategoryPreset[] = [
  { category: 'মাছ', defaultName: 'রুই মাছ', icon: '🐟', defaultPiecesPerKg: 6, unitLabel: 'পিস/কেজি', bazaarMatchKeyword: 'মাছ' },
  { category: 'মুরগি', defaultName: 'ব্রয়লার মুরগি', icon: '🍗', defaultPiecesPerKg: 8, unitLabel: 'পিস/কেজি', bazaarMatchKeyword: 'মুরগি' },
  { category: 'গরু', defaultName: 'গরুর মাংস', icon: '🥩', defaultPiecesPerKg: 18, unitLabel: 'পিস/কেজি', bazaarMatchKeyword: 'গরু' },
  { category: 'খাসি', defaultName: 'খাসির মাংস', icon: '🍖', defaultPiecesPerKg: 18, unitLabel: 'পিস/কেজি', bazaarMatchKeyword: 'খাসি' },
  { category: 'চিংড়ি', defaultName: 'চিংড়ি মাছ', icon: '🦐', defaultPiecesPerKg: 25, unitLabel: 'পিস/কেজি', bazaarMatchKeyword: 'চিংড়ি' },
  { category: 'চাল', defaultName: 'মিনিকেট চাল', icon: '🍚', defaultPiecesPerKg: 1, unitLabel: 'মিল পরিবেশন/কেজি', bazaarMatchKeyword: 'চাল' },
  { category: 'ডাল', defaultName: 'মসুর ডাল', icon: '🥣', defaultPiecesPerKg: 1, unitLabel: 'মিল পরিবেশন/কেজি', bazaarMatchKeyword: 'ডাল' },
  { category: 'আলু', defaultName: 'আলু', icon: '🥔', defaultPiecesPerKg: 6, unitLabel: 'পিস/কেজি', bazaarMatchKeyword: 'আলু' },
  { category: 'পেঁয়াজ', defaultName: 'পেঁয়াজ', icon: '🧅', defaultPiecesPerKg: 8, unitLabel: 'পিস/কেজি', bazaarMatchKeyword: 'পেঁয়াজ' },
];

export const FishMeatInventory: React.FC<FishMeatInventoryProps> = ({
  stockItems,
  bazaarItems,
  borderCount,
  onUpdateStock,
}) => {
  // New entry form state
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<string>('মাছ');
  const [name, setName] = useState('রুই মাছ');
  const [category, setCategory] = useState<string>('মাছ');
  const [totalWeightKg, setTotalWeightKg] = useState<string>('');
  const [piecesPerKg, setPiecesPerKg] = useState<string>('6');
  const [piecesServed, setPiecesServed] = useState<string>(borderCount ? borderCount.toString() : '165');
  const [storageNote, setStorageNote] = useState('');

  // Handle auto-selecting category from preset buttons / dropdown
  const handleSelectPresetCategory = (preset: StockCategoryPreset) => {
    setSelectedPresetCategory(preset.category);
    setCategory(preset.category);
    setPiecesPerKg(preset.defaultPiecesPerKg.toString());

    // Check if this item exists in today's bazaar items to auto-populate weight
    const matchInBazaar = bazaarItems.find(
      (b) =>
        b.name.includes(preset.bazaarMatchKeyword) ||
        b.category.includes(preset.bazaarMatchKeyword) ||
        b.name.toLowerCase().includes(preset.category.toLowerCase())
    );

    if (matchInBazaar) {
      setName(matchInBazaar.name);
      setTotalWeightKg(matchInBazaar.quantity.toString());
      setStorageNote(matchInBazaar.notes ? `বাজার থেকে: ${matchInBazaar.notes}` : 'ডাইনিং স্টকে সংরক্ষিত');
    } else {
      setName(preset.defaultName);
      setStorageNote('');
    }

    setPiecesServed(borderCount ? borderCount.toString() : '165');
  };

  // Live auto-calculation in form
  const formWeight = parseFloat(totalWeightKg) || 0;
  const formPerKg = parseFloat(piecesPerKg) || 0;
  const formTotalPieces = Math.round(formWeight * formPerKg);
  const formServed = parseInt(piecesServed) || 0;
  const formRemPieces = Math.max(0, formTotalPieces - formServed);
  const formRemKg = formPerKg > 0 ? Math.round((formRemPieces / formPerKg) * 100) / 100 : 0;

  const handleAddStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const weight = parseFloat(totalWeightKg) || 0;
    const perKg = parseFloat(piecesPerKg) || 1;
    const served = parseInt(piecesServed) || 0;
    const totalPcs = Math.round(weight * perKg);
    const remPcs = Math.max(0, totalPcs - served);
    const remKg = perKg > 0 ? Math.round((remPcs / perKg) * 100) / 100 : 0;

    const newItem: FishMeatStockItem = {
      id: `stock-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      category,
      totalWeightKg: weight,
      piecesPerKg: perKg,
      totalPieces: totalPcs,
      piecesServed: served,
      remainingPieces: remPcs,
      remainingKg: remKg,
      storageNote: storageNote.trim() || undefined,
    };

    onUpdateStock([...stockItems, newItem]);

    // reset
    setTotalWeightKg('');
    setStorageNote('');
  };

  const handleDelete = (id: string) => {
    onUpdateStock(stockItems.filter((s) => s.id !== id));
  };

  // Instant update functions for click-to-edit:
  const handleUpdateWeight = (id: string, newWeight: number) => {
    const updated = stockItems.map((item) => {
      if (item.id === id) {
        const totalPcs = Math.round(newWeight * item.piecesPerKg);
        const remPcs = Math.max(0, totalPcs - item.piecesServed);
        const remKg = item.piecesPerKg > 0 ? Math.round((remPcs / item.piecesPerKg) * 100) / 100 : 0;
        return {
          ...item,
          totalWeightKg: newWeight,
          totalPieces: totalPcs,
          remainingPieces: remPcs,
          remainingKg: remKg,
        };
      }
      return item;
    });
    onUpdateStock(updated);
  };

  const handleUpdatePerKg = (id: string, newPerKg: number) => {
    const updated = stockItems.map((item) => {
      if (item.id === id) {
        const totalPcs = Math.round(item.totalWeightKg * newPerKg);
        const remPcs = Math.max(0, totalPcs - item.piecesServed);
        const remKg = newPerKg > 0 ? Math.round((remPcs / newPerKg) * 100) / 100 : 0;
        return {
          ...item,
          piecesPerKg: newPerKg,
          totalPieces: totalPcs,
          remainingPieces: remPcs,
          remainingKg: remKg,
        };
      }
      return item;
    });
    onUpdateStock(updated);
  };

  const handleUpdateItemServed = (id: string, newServed: number) => {
    const updated = stockItems.map((item) => {
      if (item.id === id) {
        const remPcs = Math.max(0, item.totalPieces - newServed);
        const remKg = item.piecesPerKg > 0 ? Math.round((remPcs / item.piecesPerKg) * 100) / 100 : 0;
        return {
          ...item,
          piecesServed: newServed,
          remainingPieces: remPcs,
          remainingKg: remKg,
        };
      }
      return item;
    });
    onUpdateStock(updated);
  };

  const handleUpdateRemainingPieces = (id: string, newRemPcs: number) => {
    const updated = stockItems.map((item) => {
      if (item.id === id) {
        const remKg = item.piecesPerKg > 0 ? Math.round((newRemPcs / item.piecesPerKg) * 100) / 100 : 0;
        return {
          ...item,
          remainingPieces: newRemPcs,
          remainingKg: remKg,
          piecesServed: Math.max(0, item.totalPieces - newRemPcs),
        };
      }
      return item;
    });
    onUpdateStock(updated);
  };

  const handleUpdateNote = (id: string, newNote: string) => {
    const updated = stockItems.map((item) => {
      if (item.id === id) {
        return { ...item, storageNote: newNote };
      }
      return item;
    });
    onUpdateStock(updated);
  };

  // Helper to get category icon
  const getCategoryIcon = (cat: string) => {
    const found = STOCK_CATEGORY_PRESETS.find((p) => p.category === cat);
    return found ? found.icon : '📦';
  };

  return (
    <div id="inventory-section" className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden scroll-mt-20">
      
      {/* Header */}
      <div className="p-3 sm:p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-100 text-teal-800 rounded-md">
            <Fish className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight flex items-center gap-1.5">
              <span>৩. মাছ-মাংস ও ইনভেন্টরি স্টক (পিস ও কেজি হিসাব)</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              ক্যাটাগরি সিলেক্ট করলেই আইটেম স্বয়ংক্রিয়ভাবে বসে যাবে এবং অবশিষ্ট পিস ও কেজি হিসাব হবে
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
          <Refrigerator className="w-3.5 h-3.5 text-teal-600" />
          <span className="font-semibold text-[11px]">ডাইনিং এক্সট্রা স্টক</span>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-4">
        
        {/* Category Auto-Select Bar (Requested: চাল, ডাল, মাছ, মুরগি, গরু, খাসি, চিংড়ি, আলু, পেঁয়াজ) */}
        <div className="bg-teal-50/60 p-2.5 sm:p-3 rounded-lg border border-teal-200">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-teal-950 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>ক্যাটাগরি থেকে অটো-সিলেক্ট করুন (১-ক্লিকে নাম ও দর সেট হবে):</span>
            </span>
            <span className="text-[10px] text-teal-700 font-medium hidden sm:inline">
              * ক্লিক করলে নাম ও আজকের বাজার তথ্য অটো বসে যাবে
            </span>
          </div>

          {/* Preset Buttons Grid */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {STOCK_CATEGORY_PRESETS.map((p) => {
              const isActive = category === p.category;
              return (
                <button
                  key={p.category}
                  type="button"
                  onClick={() => handleSelectPresetCategory(p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-teal-100 hover:text-teal-900 border border-teal-200'
                  }`}
                >
                  <span>{p.icon}</span>
                  <span>{p.category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form with Auto-Filled Name & Inputs */}
        <form onSubmit={handleAddStockItem} className="bg-slate-50/70 p-3 sm:p-3.5 rounded-lg border border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
            
            {/* Auto Category Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                ক্যাটাগরি *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const found = STOCK_CATEGORY_PRESETS.find((p) => p.category === e.target.value);
                  if (found) {
                    handleSelectPresetCategory(found);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none font-semibold text-teal-900"
              >
                {STOCK_CATEGORY_PRESETS.map((p) => (
                  <option key={p.category} value={p.category}>
                    {p.icon} {p.category}
                  </option>
                ))}
                <option value="ডিম">🥚 ডিম</option>
                <option value="অন্যান্য">📦 অন্যান্য</option>
              </select>
            </div>

            {/* Item Name (Auto Populated from Category or Bazaar, Editable) */}
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                আইটেমের নাম (অটো বসেছে, এডিটযোগ্য) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: রুই মাছ / ব্রয়লার মুরগি / আলু"
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>

            {/* Total Weight in Kg */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                মোট ওজন (কেজি) *
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={totalWeightKg}
                onChange={(e) => setTotalWeightKg(e.target.value)}
                placeholder="কেজি"
                className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none font-mono"
              />
            </div>

            {/* Pieces Per Kg */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                কেজিতে পিস সংখ্যা *
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={piecesPerKg}
                onChange={(e) => setPiecesPerKg(e.target.value)}
                placeholder="পিস/কেজি"
                className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none font-mono font-bold"
              />
            </div>

            {/* Pieces Served */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                সার্ভ করা পিস *
              </label>
              <input
                type="number"
                min="0"
                required
                value={piecesServed}
                onChange={(e) => setPiecesServed(e.target.value)}
                placeholder="সার্ভ করা পিস"
                className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none font-mono"
              />
            </div>

          </div>

          {/* Live Auto Calculation Notice Strip */}
          {formWeight > 0 && formPerKg > 0 && (
            <div className="mt-2.5 p-2 bg-teal-50 rounded border border-teal-200 text-xs flex items-center justify-between flex-wrap gap-2 text-teal-950">
              <div className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-teal-600" />
                <span>
                  স্বয়ংক্রিয় মোট পিস: <strong>{toBengaliDigits(formTotalPieces)} পিস</strong>
                </span>
                <span className="text-teal-400">·</span>
                <span>
                  সার্ভ করা: <strong>{toBengaliDigits(formServed)} পিস</strong>
                </span>
              </div>
              <div className="font-bold text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200">
                বেচে গেছে (অবশিষ্ট): {toBengaliDigits(formRemPieces)} পিস ({toBengaliDigits(formRemKg)} কেজি)
              </div>
            </div>
          )}

          <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200">
            <input
              type="text"
              value={storageNote}
              onChange={(e) => setStorageNote(e.target.value)}
              placeholder="স্টক সংরক্ষণ মন্তব্য (যেমন: ডাইনিং ডিপ ফ্রিজে সংরক্ষিত)"
              className="text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-md focus:outline-none flex-1"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>স্টকে যুক্ত করুন</span>
            </button>
          </div>
        </form>

        {/* Stock Items Table with Live Click-to-Edit */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">
                সংরক্ষিত স্টক ও অবশিষ্ট হিসাব
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({toBengaliDigits(stockItems.length)} টি)
              </span>
            </div>
            <span className="text-[11px] text-teal-700 font-medium flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              টেবিলের যেকোনো মান ক্লিক করে সরাসরি এডিট করুন
            </span>
          </div>

          {stockItems.length === 0 ? (
            <div className="text-center py-6 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs">
              <p className="font-medium text-slate-700">কোনো স্টক আইটেম এখনো যুক্ত করা হয়নি</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                উপরে ক্যাটাগরি (চাল, ডাল, মাছ, মুরগি, গরু, খাসি, চিংড়ি, আলু, পেঁয়াজ) ক্লিক করে দ্রুত যুক্ত করুন
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2 px-2.5">ক্যাটাগরি ও নাম</th>
                    <th className="py-2 px-2.5 text-right">মোট ওজন (কেজি)</th>
                    <th className="py-2 px-2.5 text-right">কেজিতে পিস</th>
                    <th className="py-2 px-2.5 text-right">মোট পিস</th>
                    <th className="py-2 px-2.5 text-right">সার্ভ করা পিস</th>
                    <th className="py-2 px-2.5 text-right bg-teal-50 text-teal-900 font-bold">বেচে গেছে (পিস)</th>
                    <th className="py-2 px-2.5 text-right bg-teal-50 text-teal-900 font-bold">বেচে গেছে (কেজি)</th>
                    <th className="py-2 px-2.5">সংরক্ষণ নোট</th>
                    <th className="py-2 px-2.5 text-center w-10">মুছুন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {stockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Name & Icon */}
                      <td className="py-1.5 px-2.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{getCategoryIcon(item.category)}</span>
                          <span>{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({item.category})</span>
                        </div>
                      </td>

                      {/* Weight (Kg) - Editable */}
                      <td className="py-1.5 px-2.5 text-right font-mono">
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          value={item.totalWeightKg}
                          onChange={(e) => handleUpdateWeight(item.id, parseFloat(e.target.value) || 0)}
                          className="w-16 px-1 py-0.5 text-right border border-slate-200 hover:border-slate-400 focus:border-teal-500 rounded text-xs font-mono"
                          title="ক্লিক করে ওজন এডিট করুন"
                        />
                      </td>

                      {/* Pieces per Kg - Editable */}
                      <td className="py-1.5 px-2.5 text-right font-mono">
                        <input
                          type="number"
                          step="any"
                          min="1"
                          value={item.piecesPerKg}
                          onChange={(e) => handleUpdatePerKg(item.id, parseFloat(e.target.value) || 1)}
                          className="w-12 px-1 py-0.5 text-right border border-slate-200 hover:border-slate-400 focus:border-teal-500 rounded font-bold text-xs"
                          title="ক্লিক করে কেজিতে পিস এডিট করুন"
                        />
                      </td>

                      {/* Total Pieces - Auto Calculated */}
                      <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-800">
                        {toBengaliDigits(item.totalPieces)}
                      </td>

                      {/* Pieces Served - Editable */}
                      <td className="py-1.5 px-2.5 text-right font-mono">
                        <input
                          type="number"
                          min="0"
                          value={item.piecesServed}
                          onChange={(e) => handleUpdateItemServed(item.id, parseInt(e.target.value) || 0)}
                          className="w-14 px-1 py-0.5 text-right border border-blue-300 focus:border-blue-600 rounded font-bold text-xs"
                          title="ক্লিক করে সার্ভ করা পিস এডিট করুন"
                        />
                      </td>

                      {/* Remaining Pieces (বেচে গেছে পিস) - Auto Calculated & Editable on click */}
                      <td className="py-1.5 px-2.5 text-right font-mono font-bold text-teal-800 bg-teal-50/50">
                        <input
                          type="number"
                          min="0"
                          value={item.remainingPieces}
                          onChange={(e) => handleUpdateRemainingPieces(item.id, parseInt(e.target.value) || 0)}
                          className="w-14 px-1 py-0.5 text-right border border-teal-300 bg-white focus:border-teal-600 rounded font-bold text-xs text-teal-900"
                          title="ক্লিক করে অবশিষ্ট পিস এডিট করতে পারেন"
                        />
                      </td>

                      {/* Remaining Kg (বেচে গেছে কেজি) - Auto Calculated */}
                      <td className="py-1.5 px-2.5 text-right font-mono font-extrabold text-teal-800 bg-teal-50/50">
                        {toBengaliDigits(item.remainingKg)} কেজি
                      </td>

                      {/* Note - Editable */}
                      <td className="py-1.5 px-2.5 text-slate-600 text-[11px]">
                        <input
                          type="text"
                          value={item.storageNote || ''}
                          onChange={(e) => handleUpdateNote(item.id, e.target.value)}
                          placeholder="সংরক্ষণ স্থান..."
                          className="w-full px-1 py-0.5 border border-transparent hover:border-slate-200 focus:border-teal-500 rounded text-[11px]"
                        />
                      </td>

                      {/* Delete */}
                      <td className="py-1.5 px-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
