'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

type YearMonthPickerProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  lang?: 'zh-TW' | 'zh-CN' | 'en';
  className?: string;
};

function parseYearMonth(value: string) {
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  return { year, month };
}

function formatYearMonth(value: string, lang: YearMonthPickerProps['lang']) {
  const { year, month } = parseYearMonth(value);
  if (lang === 'en') {
    return `${year}-${String(month).padStart(2, '0')}`;
  }
  return `${year}年${String(month).padStart(2, '0')}月`;
}

function toYearMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export default function YearMonthPicker({ value, onChange, label, lang = 'zh-TW', className }: YearMonthPickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => parseYearMonth(value).year);

  const current = useMemo(() => parseYearMonth(value), [value]);

  useEffect(() => {
    if (!open) {
      setViewYear(current.year);
    }
  }, [current.year, open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const monthLabels = useMemo(() => Array.from({ length: 12 }, (_, index) => index + 1), []);

  const selectMonth = (month: number) => {
    onChange(toYearMonth(viewYear, month));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="flex h-full w-full flex-col justify-center rounded-xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-[#D4AF37] hover:shadow-md"
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold tracking-tight text-slate-900">{formatYearMonth(value, lang)}</span>
          <CalendarDays className="h-5 w-5 text-slate-400" />
        </div>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-[19rem] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/80">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setViewYear((currentYear) => currentYear - 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#D4AF37] hover:text-[#B38E18]"
              aria-label="Previous year"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-semibold text-slate-900">{viewYear}</div>
            <button
              type="button"
              onClick={() => setViewYear((currentYear) => currentYear + 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#D4AF37] hover:text-[#B38E18]"
              aria-label="Next year"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {monthLabels.map((month) => {
              const isActive = current.year === viewYear && current.month === month;
              const monthText = lang === 'en' ? String(month).padStart(2, '0') : `${String(month).padStart(2, '0')}月`;
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => selectMonth(month)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-[#D4AF37] text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-700 hover:border-[#D4AF37] hover:text-[#B38E18]'}`}
                >
                  {monthText}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
