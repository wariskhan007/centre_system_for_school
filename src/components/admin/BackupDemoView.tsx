import React, { useState } from 'react';
import { Database, Download, Upload, Sparkles, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const BackupDemoView: React.FC = () => {
  const { students, staff, feeInvoices, seedDemoData, resetToZeroData, showToast } = useApp();
  const [restoring, setRestoring] = useState(false);

  const handleExportBackup = () => {
    window.location.href = '/api/backup/export';
    showToast('Database backup downloaded successfully', 'success');
  };

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      if (!res.ok) throw new Error('Database restoration failed');

      window.location.reload();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'Error restoring database', 'error');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Database Backup & Demo Environment</h2>
        <p className="text-xs text-slate-500">
          Export full relational database snapshots, restore backups, and manage Zero-Data compliance.
        </p>
      </div>

      {/* Backup and Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Backup */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Export Institutional Database</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Generates a complete JSON relational snapshot containing all students, academic history, staff, examination papers, attendance, and fee ledgers.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Full Backup (JSON)</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Restore from Backup</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload a valid ABC School database backup file to restore records. Existing state will be safely replaced with verified snapshot data.
            </p>
          </div>

          <label className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
            <Upload className="w-4 h-4" />
            <span>{restoring ? 'Restoring...' : 'Upload & Restore File'}</span>
            <input
              type="file"
              accept=".json"
              disabled={restoring}
              onChange={handleFileRestore}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Zero Data & Demo Data Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
          Pakistani Demo Data & Strict Zero-Data Controls
        </h3>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-2">
          <div className="font-semibold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Operational Separation Principle</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            In strict production deployment, schools start with zero students, zero staff, and zero fee invoices. For trial runs, demonstration, and staff training, you can load realistic Pakistani school sample data or reset back to zero anytime.
          </p>
          <div className="pt-2 font-mono text-[11px] text-slate-500">
            Current Records: {students.length} Students · {staff.length} Staff · {feeInvoices.length} Invoices
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={seedDemoData}
            className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Seed Pakistani Demo Records</span>
          </button>

          <button
            onClick={resetToZeroData}
            className="flex-1 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-rose-600" />
            <span>Reset to Strict Zero-Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
