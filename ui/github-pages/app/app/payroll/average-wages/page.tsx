'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, Download, Search, TrendingUp } from 'lucide-react';
import { useAuth } from '@/src/lib/hooks/useAuth';
import type { CommissionAverageAuditRecord } from '@/src/lib/employees/queries';
import { fetchCommissionAverageAuditRecords } from '@/src/lib/employees/queries';

function currentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function fmtMoney(value: number) {
  return new Intl.NumberFormat('zh-HK', { style: 'currency', currency: 'HKD', maximumFractionDigits: 2 }).format(value || 0);
}

function fmtNumber(value: number, digits = 2) {
  return new Intl.NumberFormat('zh-HK', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value || 0);
}

function sourceLabel(source: CommissionAverageAuditRecord['source']) {
  if (source === 'seed_plus_payroll') return '歷史+HRMS';
  if (source === 'seed') return '歷史資料';
  if (source === 'payroll') return 'HRMS';
  return '未有資料';
}

function sourceClass(source: CommissionAverageAuditRecord['source']) {
  if (source === 'seed_plus_payroll') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (source === 'seed') return 'bg-amber-50 text-amber-700 ring-amber-200';
  if (source === 'payroll') return 'bg-blue-50 text-blue-700 ring-blue-200';
  return 'bg-slate-50 text-slate-500 ring-slate-200';
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function downloadExcel(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const table = `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body>${table}</body></html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function AverageWagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedMonth = searchParams?.get('month') ?? undefined;
  const selectedMonth = requestedMonth && /^\d{4}-\d{2}$/.test(requestedMonth) ? requestedMonth : currentYearMonth();
  const [records, setRecords] = useState<CommissionAverageAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | CommissionAverageAuditRecord['source']>('all');
  const [onlyWithAlSh, setOnlyWithAlSh] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCommissionAverageAuditRecords(user, selectedMonth)
      .then((rows) => {
        if (!cancelled) setRecords(rows);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load average wages.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedMonth, user]);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return records.filter((record) => {
      if (sourceFilter !== 'all' && record.source !== sourceFilter) return false;
      if (onlyWithAlSh && record.alShDays <= 0) return false;
      if (!normalizedQuery) return true;
      return [record.employeeCode, record.displayName, record.branchName, record.mappingSourceCode, record.mappingStatus]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });
  }, [onlyWithAlSh, query, records, sourceFilter]);

  const totals = useMemo(() => records.reduce((acc, record) => ({
    totalEmployees: acc.totalEmployees + 1,
    sourcedEmployees: acc.sourcedEmployees + (record.source === 'none' ? 0 : 1),
    alShEmployees: acc.alShEmployees + (record.alShDays > 0 ? 1 : 0),
    alShPay: acc.alShPay + record.finalAlShAverageCommissionPay,
  }), { totalEmployees: 0, sourcedEmployees: 0, alShEmployees: 0, alShPay: 0 }), [records]);

  const handleMonthChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set('month', value);
    router.replace(`/app/payroll/average-wages?${params.toString()}`);
  };

  const handleExportExcel = () => {
    const monthSet = new Set<string>();
    filteredRecords.forEach((record) => record.monthlyBreakdown.forEach((entry) => monthSet.add(entry.yearMonth)));
    const months = Array.from(monthSet).sort();
    const headers = [
      '員工編號', '姓名', '分店', '資料來源', '計至月份', '歷史/Seed總佣金', '歷史/Seed日數', 'HRMS月數', 'HRMS月佣金合計', 'HRMS日數', '365總佣金', '合資格日數', '平均佣金/日', 'AL日數', 'SH日數', 'AL/SH日數', '應補金額', '狀態', '備註',
      ...months.flatMap((month) => [`${month}佣金`, `${month}日數`]),
    ];
    const rows = filteredRecords.map((record) => {
      const monthly = new Map(record.monthlyBreakdown.map((entry) => [entry.yearMonth, entry]));
      return [record.employeeCode, record.displayName, record.branchName ?? '', sourceLabel(record.source), record.cutoffMonth, record.seedTotalCommission, record.seedEligibleDays, record.monthlySourceCount, record.monthlySourceTotal, record.monthlySourceDays, record.totalCommission, record.eligibleDays, record.dailyAverageCommission, record.annualLeaveDays, record.statutoryHolidayDays, record.alShDays, record.finalAlShAverageCommissionPay, record.complianceStatus === 'ok' ? '正常' : '需確認', record.complianceRemark ?? '', ...months.flatMap((month) => {
        const entry = monthly.get(month);
        return [entry?.commissionAmount ?? 0, entry?.eligibleDays ?? 0];
      })];
    });
    downloadExcel(`365日平均佣金_${selectedMonth}.xls`, headers, rows);
  };

  if (!user) {
    return <div className="flex min-h-[60vh] items-center justify-center text-slate-500">載入中...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={`/app/payroll?month=${selectedMonth}`} className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#B38E18]">
            <ArrowLeft className="h-4 w-4" /> 返回 Payroll
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">365日平均佣金</h1>
          <p className="mt-1 text-sm text-slate-500">只顯示有佣金相關設定或歷史佣金資料的員工；普通時薪/日薪員工不顯示。</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <label className="mb-1 block text-xs font-medium text-slate-500">薪酬所屬月份</label>
          <input type="month" value={selectedMonth} onChange={(event) => handleMonthChange(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500"><CalendarDays className="h-4 w-4" /> 佣金相關員工</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totals.totalEmployees}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500"><TrendingUp className="h-4 w-4" /> 有平均資料</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{totals.sourcedEmployees}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-slate-500">本月有 AL/SH</div>
          <div className="mt-2 text-2xl font-bold text-blue-700">{totals.alShEmployees}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold tracking-wide text-slate-500">本月補償合計</div>
          <div className="mt-2 text-2xl font-bold text-[#B38E18]">{fmtMoney(totals.alShPay)}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋員工編號、姓名、分店..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
          </div>
          <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as typeof sourceFilter)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]">
            <option value="all">所有資料來源</option>
            <option value="seed_plus_payroll">歷史+HRMS</option>
            <option value="seed">歷史資料</option>
            <option value="payroll">HRMS</option>
            <option value="none">未有資料</option>
          </select>
          <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700">
            <input type="checkbox" checked={onlyWithAlSh} onChange={(event) => setOnlyWithAlSh(event.target.checked)} className="rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]" />
            只睇有 AL/SH
          </label>
          <button type="button" onClick={handleExportExcel} disabled={filteredRecords.length === 0} className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" />
            匯出詳細 Excel
          </button>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-3 py-3">員工</th>
                <th className="px-3 py-3">資料來源</th>
                <th className="px-3 py-3 text-right">平均佣金/日</th>
                <th className="px-3 py-3 text-right">AL/SH日數</th>
                <th className="px-3 py-3 text-right">應補金額</th>
                <th className="px-3 py-3">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-500">載入中...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-500">沒有符合條件的佣金員工資料</td></tr>
              ) : filteredRecords.map((record) => (
                <tr key={record.employeeCode} className="hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <Link href={`/app/people?id=${record.employeeCode}`} className="font-semibold text-[#B38E18] hover:underline">{record.employeeCode}</Link>
                    <div className="text-xs text-slate-500">{record.displayName} · {record.branchName ?? '未設定分店'}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${sourceClass(record.source)}`}>{sourceLabel(record.source)}</span>
                    <div className="mt-1 text-xs text-slate-500">計至 {record.cutoffMonth}</div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold text-slate-900">{fmtMoney(record.dailyAverageCommission)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">{record.alShDays > 0 ? `${fmtNumber(record.alShDays, 1)}日` : '—'}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-bold text-[#B38E18]">{record.alShDays > 0 ? fmtMoney(record.finalAlShAverageCommissionPay) : '—'}</td>
                  <td className="max-w-xs px-3 py-3">
                    <div className="text-xs font-semibold text-slate-700">{record.source === 'none' ? '需確認' : '正常'}</div>
                    <div className="text-xs text-slate-500">歷史總佣金 {fmtMoney(record.totalCommission)} / {fmtNumber(record.eligibleDays, 0)}日</div>
                    {record.complianceRemark ? <div className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">{record.complianceRemark}</div> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
