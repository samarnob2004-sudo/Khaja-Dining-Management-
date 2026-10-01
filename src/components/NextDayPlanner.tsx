import React, { useState } from 'react';
import { NextDayPlanItem, ExpenseCategory } from '../types/dining';
import { PRESET_ITEMS, CATEGORY_LIST } from '../data/presetItems';
import { formatBengaliDate, toBengaliDigits, formatTaka } from '../utils/bengaliNumbers';
import { ShoppingBag, Plus, Trash2, CheckSquare, Square, Copy, Check, ArrowRight, Printer } from 'lucide-react';

interface NextDayPlannerProps {
  currentDate: string;
  nextDayDate: string;
  planItems: NextDayPlanItem[];
  onUpdatePlan: (items: NextDayPlanItem[]) => void;
  onApplyPlanToToday: (items: NextDayPlanItem[]) => void;
  onClose: () => void;
}

export const NextDayPlanner: React.FC<NextDayPlannerProps> = ({
  currentDate,
  nextDayDate,
  planItems,
  onUpdatePlan,
  onApplyPlanToToday,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('সবজি');
  const [estimatedQuantity, setEstimatedQuantity] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  // Quick preset selector
  const [searchPreset, setSearchPreset] = useState('');

  const filteredPresets = PRESET_ITEMS.filter((p) =>
    p.name.toLowerCase().includes(searchPreset.toLowerCase().trim())
  ).slice(0, 16);

  const handleSelectPreset = (p: typeof PRESET_ITEMS[0]) => {
    setName(p.name);
    setCategory(p.category);
    if (!estimatedQuantity) {
      setEstimatedQuantity(`৫ ${p.defaultUnit}`);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const priceNum = estimatedPrice.trim() !== '' ? parseFloat(estimatedPrice) : null;

    const newItem: NextDayPlanItem = {
      id: `plan-${Date.now()}`,
      name: name.trim(),
      category,
      estimatedQuantity: estimatedQuantity.trim() || 'প্রয়োজনমতো',
      estimatedPrice: priceNum,
      isPurchased: false,
      notes: notes.trim() || undefined,
    };

    onUpdatePlan([...planItems, newItem]);

    setName('');
    setEstimatedQuantity('');
    setEstimatedPrice('');
    setNotes('');
  };

  const handleTogglePurchased = (id: string) => {
    const updated = planItems.map((item) =>
      item.id === id ? { ...item, isPurchased: !item.isPurchased } : item
    );
    onUpdatePlan(updated);
  };

  const handleDeleteItem = (id: string) => {
    onUpdatePlan(planItems.filter((item) => item.id !== id));
  };

  // Copy plain text format for WhatsApp / Manager SMS
  const handleCopyList = () => {
    const lines = [
      `🛒 খান জাহান আলী হল — পরের দিনের বাজার ফর্দ`,
      `তারিখ: ${formatBengaliDate(nextDayDate)}`,
      `Made By S.A.M. Mafiul Alam Arnob - BECM 2K22`,
      `---------------------------------------`,
      ...planItems.map((item, i) => {
        const pr = item.estimatedPrice ? ` [আনুমানিক: ${item.estimatedPrice} ৳]` : '';
        const note = item.notes ? ` (${item.notes})` : '';
        return `${i + 1}. ${item.name} — ${item.estimatedQuantity}${pr}${note}`;
      }),
      `---------------------------------------`,
      `* দাম বাজারে গিয়ে যাচাই করে কেনা হবে।`,
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const totalEstimatedPrice = planItems.reduce(
    (sum, item) => sum + (item.estimatedPrice || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                পরের দিনের বাজার তালিকা ও ফর্দ প্রস্তুতকারক
              </h2>
              <p className="text-xs text-slate-300">
                বাজারের সম্ভাব্য তারিখ: {formatBengaliDate(nextDayDate)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Preset Selector */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-bold text-slate-700">দ্রুত পণ্য যোগ করুন:</span>
              <input
                type="text"
                value={searchPreset}
                onChange={(e) => setSearchPreset(e.target.value)}
                placeholder="পণ্য খুঁজুন..."
                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs w-40"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {filteredPresets.map((p, idx) => (
                <button
                  key={`${p.name}-${idx}`}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="px-2 py-1 bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 rounded text-[11px] cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form to add item */}
          <form onSubmit={handleAddItem} className="bg-teal-50/50 p-4 rounded-xl border border-teal-200 space-y-3">
            <div className="text-xs font-bold text-teal-900">
              পরের দিনের জন্য প্রয়োজনীয় পণ্য যোগ করুন (দাম ঐচ্ছিক/খালি রাখা যাবে):
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  পণ্যের নাম *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: আলু, রুই মাছ, মুরগি"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  বিভাগ
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full text-xs px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none"
                >
                  {CATEGORY_LIST.filter(c => !['যাতায়াত', 'কাঠ', 'ডাইনিং ম্যানেজার নাস্তা', 'বিবিধ'].includes(c)).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  আনুমানিক পরিমাণ *
                </label>
                <input
                  type="text"
                  required
                  value={estimatedQuantity}
                  onChange={(e) => setEstimatedQuantity(e.target.value)}
                  placeholder="যেমন: ২৫ কেজি / ২০ পিস / ২ হালি"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  আনুমানিক দাম (টাকা) — <span className="text-teal-700">খালি রাখা যাবে</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  placeholder="খালি রাখতে পারেন"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="বাজারের বিশেষ নির্দেশনা / দোকানদার নোট (ঐচ্ছিক)"
                className="text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg flex-1"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>তালিকায় যোগ করুন</span>
              </button>
            </div>
          </form>

          {/* List of Plan Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                বাজারের ফর্দ ({toBengaliDigits(planItems.length)} টি পণ্য):
              </h3>
              {totalEstimatedPrice > 0 && (
                <div className="text-xs font-bold text-slate-700">
                  মোট আনুমানিক বাজেট: <span className="font-mono text-teal-800">{formatTaka(totalEstimatedPrice)}</span>
                </div>
              )}
            </div>

            {planItems.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                কোনো পণ্য তালিকায় নেই। আগামীকালের প্রয়োজনীয় বাজারের তালিকা তৈরি করতে উপরের ফর্মটি ব্যবহার করুন।
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">চেক</th>
                      <th className="py-2.5 px-3">পণ্যের নাম</th>
                      <th className="py-2.5 px-3">বিভাগ</th>
                      <th className="py-2.5 px-3">আনুমানিক পরিমাণ</th>
                      <th className="py-2.5 px-3 text-right">আনুমানিক দাম</th>
                      <th className="py-2.5 px-3">নোট</th>
                      <th className="py-2.5 px-3 text-center w-12">মুছুন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {planItems.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          item.isPurchased ? 'bg-emerald-50/50 text-slate-400 line-through' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePurchased(item.id)}
                            className="text-slate-500 hover:text-emerald-600 cursor-pointer"
                          >
                            {item.isPurchased ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {item.name}
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {item.estimatedQuantity}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {item.estimatedPrice ? (
                            <span className="font-bold text-teal-800">
                              {formatTaka(item.estimatedPrice)}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">খালি (যাচাই করে কেনা হবে)</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">
                          {item.notes || '-'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
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

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            * সকালের বাজারে নিয়ে যাওয়ার জন্য ফর্দটি কপি বা প্রিন্ট করতে পারেন
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyList}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে!' : 'ফর্দ কপি করুন (WhatsApp)'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintSlip}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট স্লিপ</span>
            </button>

            <button
              type="button"
              onClick={() => onApplyPlanToToday(planItems)}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="এই পণ্যগুলোকে বর্তমান দিনের বাজারে যুক্ত করুন"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>আজকের বাজারে রূপান্তর</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
