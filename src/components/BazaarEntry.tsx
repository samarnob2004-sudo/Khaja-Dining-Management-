import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Edit2, ShoppingCart, Check, Tag, AlertTriangle } from 'lucide-react';
import { BazaarItem, ExpenseCategory } from '../types/dining';
import { PRESET_ITEMS, CATEGORY_LIST, UNITS } from '../data/presetItems';
import { toBengaliDigits, formatTaka } from '../utils/bengaliNumbers';

interface BazaarEntryProps {
  items: BazaarItem[];
  onAddItem: (item: Omit<BazaarItem, 'id'>) => void;
  onUpdateItem: (id: string, updated: Partial<BazaarItem>) => void;
  onDeleteItem: (id: string) => void;
  onClearAllItems?: () => void;
}

export const BazaarEntry: React.FC<BazaarEntryProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onClearAllItems,
}) => {
  // Catalog search & filter states
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>('সকল');

  // New item form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('সবজি');
  const [quantity, setQuantity] = useState<string>('1');
  const [unit, setUnit] = useState<string>('কেজি');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [totalPriceManual, setTotalPriceManual] = useState<string>('');
  const [isManualTotal, setIsManualTotal] = useState<boolean>(false);
  const [notes, setNotes] = useState('');

  // Editing state for existing item in list
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editTotal, setEditTotal] = useState('');

  // Confirm clear all dialog state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter existing items in today's table
  const [tableFilter, setTableFilter] = useState('');

  // Filtered preset items
  const filteredPresets = useMemo(() => {
    return PRESET_ITEMS.filter((item) => {
      const matchCat =
        selectedCatalogCategory === 'সকল' ||
        item.category === selectedCatalogCategory ||
        (selectedCatalogCategory === 'মাংস' && (item.category === 'মুরগি' || item.category === 'গরু' || item.category === 'খাসি'));
      const matchSearch = item.name.toLowerCase().includes(catalogSearch.toLowerCase().trim());
      return matchCat && matchSearch;
    }).slice(0, 36);
  }, [catalogSearch, selectedCatalogCategory]);

  // Handle selecting preset item to populate form
  const handleSelectPreset = (preset: typeof PRESET_ITEMS[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setUnit(preset.defaultUnit);
    if (preset.defaultUnitPrice) {
      setUnitPrice(preset.defaultUnitPrice.toString());
      const qtyNum = parseFloat(quantity) || 1;
      setTotalPriceManual((qtyNum * preset.defaultUnitPrice).toString());
    } else {
      setUnitPrice('');
      setTotalPriceManual('');
      setIsManualTotal(false);
    }
  };

  // Auto calculate total
  const calculatedTotal = useMemo(() => {
    if (isManualTotal && totalPriceManual !== '') {
      return parseFloat(totalPriceManual) || 0;
    }
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(unitPrice) || 0;
    return Math.round(q * p * 100) / 100;
  }, [quantity, unitPrice, isManualTotal, totalPriceManual]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const q = parseFloat(quantity) || 0;
    const p = parseFloat(unitPrice) || 0;
    const total = isManualTotal && totalPriceManual ? parseFloat(totalPriceManual) || 0 : q * p;

    onAddItem({
      name: name.trim(),
      category,
      quantity: q,
      unit,
      unitPrice: p,
      totalPrice: total,
      notes: notes.trim() || undefined,
    });

    // Reset inputs
    setName('');
    setUnitPrice('');
    setTotalPriceManual('');
    setIsManualTotal(false);
    setNotes('');
  };

  const handleStartEdit = (item: BazaarItem) => {
    setEditingId(item.id);
    setEditQty(item.quantity.toString());
    setEditPrice(item.unitPrice.toString());
    setEditTotal(item.totalPrice.toString());
  };

  const handleSaveEdit = (id: string) => {
    const q = parseFloat(editQty) || 0;
    const p = parseFloat(editPrice) || 0;
    const t = editTotal !== '' ? parseFloat(editTotal) : q * p;
    onUpdateItem(id, {
      quantity: q,
      unitPrice: p,
      totalPrice: t,
    });
    setEditingId(null);
  };

  const handleConfirmClearAll = () => {
    if (onClearAllItems) {
      onClearAllItems();
    }
    setShowClearConfirm(false);
  };

  const filteredItems = useMemo(() => {
    if (!tableFilter) return items;
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(tableFilter.toLowerCase()) ||
        it.category.includes(tableFilter)
    );
  }, [items, tableFilter]);

  const totalMarketSum = items.reduce((sum, it) => sum + (it.totalPrice || 0), 0);

  return (
    <div id="bazaar-section" className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden scroll-mt-20">
      
      {/* Header Bar */}
      <div className="p-3 sm:p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-md">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              ১. দৈনিক বাজার এন্ট্রি ও তালিকা
            </h2>
            <p className="text-[11px] text-slate-500">
              সবজি, শাক, মাছ, মাংস, ডিম, মশলা ও মুদি পণ্যের হিসাব
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 mr-1.5">বাজার মোট:</span>
            <span className="text-base sm:text-lg font-bold text-emerald-700 font-mono">
              {formatTaka(totalMarketSum)}
            </span>
          </div>

          {/* 1-Click Clear All Button requested by user */}
          {items.length > 0 && onClearAllItems && (
            <div>
              {showClearConfirm ? (
                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 p-1 rounded-md text-xs">
                  <span className="text-[11px] text-red-800 font-semibold px-1">মুছবেন?</span>
                  <button
                    type="button"
                    onClick={handleConfirmClearAll}
                    className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold cursor-pointer"
                  >
                    হ্যাঁ, সব মুছুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-1.5 py-0.5 bg-white border border-slate-300 text-slate-700 rounded text-[11px] cursor-pointer"
                  >
                    বাতিল
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="px-2.5 py-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                  title="আজকের বাজার তালিকার সব কিছু এক ক্লিকে মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>সব পণ্য মুছুন</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-4">
        
        {/* Preset Catalog Chips */}
        <div className="bg-slate-50/70 rounded-lg p-2.5 sm:p-3 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>ক্যাটালগ থেকে দ্রুত পছন্দ করুন:</span>
            </div>

            {/* Catalog search */}
            <div className="relative w-full sm:w-52">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="পণ্য খুঁজুন (আলু, রুই, মুরগি)..."
                className="w-full text-xs pl-6 pr-2 py-1 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-thin text-xs">
            {['সকল', 'সবজি', 'শাক', 'মাছ', 'মুরগি', 'গরু', 'খাসি', 'ডিম', 'মশলা', 'মুদি'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCatalogCategory(cat)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCatalogCategory === cat
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-1 mt-1.5 max-h-28 overflow-y-auto p-1 bg-white rounded-md border border-slate-200">
            {filteredPresets.map((preset, idx) => (
              <button
                key={`${preset.name}-${idx}`}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                  name === preset.name
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200'
                }`}
              >
                <span>{preset.name}</span>
                <span className="text-[9px] opacity-70">({preset.defaultUnit})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Add Product Form */}
        <form onSubmit={handleFormSubmit} className="bg-slate-50/60 p-3 sm:p-3.5 rounded-lg border border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
            
            {/* Product Name */}
            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                পণ্যের নাম *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: আলু / রুই মাছ / সয়াবিন তেল"
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                বিভাগ *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none"
              >
                {CATEGORY_LIST.filter(c => !['যাতায়াত', 'কাঠ', 'ডাইনিং ম্যানেজার নাস্তা', 'বিবিধ'].includes(c)).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity & Unit */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                পরিমাণ ও একক *
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="পরিমাণ"
                  className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none font-mono"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="text-xs px-1 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none shrink-0"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                একক দর (৳)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={unitPrice}
                onChange={(e) => {
                  setUnitPrice(e.target.value);
                  setIsManualTotal(false);
                }}
                placeholder="দর"
                className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none font-mono"
              />
            </div>

            {/* Total Price */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-medium text-slate-600">
                  মোট টাকা (৳) *
                </label>
                <button
                  type="button"
                  onClick={() => setIsManualTotal(!isManualTotal)}
                  className="text-[9px] text-blue-600 hover:underline"
                >
                  {isManualTotal ? 'অটো' : 'ম্যানুয়াল'}
                </button>
              </div>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={isManualTotal ? totalPriceManual : calculatedTotal || ''}
                onChange={(e) => {
                  setIsManualTotal(true);
                  setTotalPriceManual(e.target.value);
                }}
                placeholder="মোট"
                className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none font-mono font-bold text-slate-900"
              />
            </div>

          </div>

          <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="মন্তব্য (ঐচ্ছিক, যেমন: ছোট রুই / কাঁচাবাজারের রশিদ)"
              className="text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-md focus:outline-none flex-1"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>বাজারে যোগ করুন</span>
            </button>
          </div>
        </form>

        {/* Current Day's Bazaar Items Table */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">
                আজকের বাজারের আইটেম
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({toBengaliDigits(items.length)} টি)
              </span>
            </div>

            {/* Filter table items */}
            {items.length > 4 && (
              <div className="relative w-full sm:w-48">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                <input
                  type="text"
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  placeholder="তালিকা ফিল্টার..."
                  className="w-full text-xs pl-6 pr-2 py-1 bg-white border border-slate-300 rounded-md focus:outline-none"
                />
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-6 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs">
              <p className="font-medium text-slate-700">আজকের বাজারে কোনো পণ্য নেই</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                উপরের ক্যাটালগ থেকে ক্লিক করে বা সরাসরি লিখে পণ্য যুক্ত করুন
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2 px-2.5 w-8 text-center">নং</th>
                    <th className="py-2 px-2.5">পণ্য</th>
                    <th className="py-2 px-2.5">বিভাগ</th>
                    <th className="py-2 px-2.5 text-right">পরিমাণ</th>
                    <th className="py-2 px-2.5 text-right">দর</th>
                    <th className="py-2 px-2.5 text-right">মোট টাকা</th>
                    <th className="py-2 px-2.5 text-center w-16">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredItems.map((item, index) => {
                    const isEditing = editingId === item.id;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-1.5 px-2.5 text-center text-slate-400 font-mono text-[11px]">
                          {toBengaliDigits(index + 1)}
                        </td>
                        <td className="py-1.5 px-2.5">
                          <span className="font-semibold text-slate-900">{item.name}</span>
                          {item.notes && (
                            <span className="text-[10px] text-slate-500 ml-1">({item.notes})</span>
                          )}
                        </td>
                        <td className="py-1.5 px-2.5">
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              step="any"
                              value={editQty}
                              onChange={(e) => setEditQty(e.target.value)}
                              className="w-14 px-1 py-0.5 text-right border border-emerald-400 rounded text-xs"
                            />
                          ) : (
                            <span>
                              {toBengaliDigits(item.quantity)} {item.unit}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              step="any"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-14 px-1 py-0.5 text-right border border-emerald-400 rounded text-xs"
                            />
                          ) : (
                            <span>
                              {item.unitPrice ? `${toBengaliDigits(item.unitPrice)} ৳` : '-'}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900">
                          {isEditing ? (
                            <input
                              type="number"
                              step="any"
                              value={editTotal}
                              onChange={(e) => setEditTotal(e.target.value)}
                              className="w-16 px-1 py-0.5 text-right border border-emerald-400 rounded text-xs font-bold"
                            />
                          ) : (
                            formatTaka(item.totalPrice)
                          )}
                        </td>
                        <td className="py-1.5 px-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {isEditing ? (
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(item.id)}
                                className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                title="সংরক্ষণ"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(item)}
                                className="p-0.5 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                                title="সম্পাদনা"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onDeleteItem(item.id)}
                              className="p-0.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
                  <tr>
                    <td colSpan={5} className="py-2 px-2.5 text-right text-slate-700 text-xs">
                      বাজার মোট:
                    </td>
                    <td className="py-2 px-2.5 text-right text-emerald-800 font-mono text-sm">
                      {formatTaka(totalMarketSum)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
