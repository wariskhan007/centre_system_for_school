import React, { useState } from 'react';
import { Receipt, Plus, Search, DollarSign, Printer, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { FeeInvoice } from '../../types/index.ts';
import { formatPKR, formatDate } from '../../utils/formatters.ts';

interface FeeInvoicesViewProps {
  onCollectPayment: (invoice: FeeInvoice) => void;
  onPrintReceipt: (invoice: FeeInvoice) => void;
}

export const FeeInvoicesView: React.FC<FeeInvoicesViewProps> = ({
  onCollectPayment,
  onPrintReceipt,
}) => {
  const { feeInvoices, students, classes, refreshAllData, showToast, currentUser } = useApp();

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Form state for generating an invoice
  const [studentId, setStudentId] = useState('');
  const [month, setMonth] = useState('September 2026');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('2026-10-10');
  const [tuitionFee, setTuitionFee] = useState(4500);
  const [admissionFee, setAdmissionFee] = useState(0);
  const [examFee, setExamFee] = useState(0);
  const [transportFee, setTransportFee] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const activeStudents = students.filter((s) => s.status === 'active');

  const filteredInvoices = feeInvoices.filter((inv) => {
    const student = students.find((s) => s.id === inv.studentId);
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      inv.invoiceNo.toLowerCase().includes(q) ||
      student?.fullName.toLowerCase().includes(q) ||
      student?.admissionNumber.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'all' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      showToast('Select a student for the fee invoice', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/fees/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          academicYearId: 'ay-2026-2027',
          month,
          issueDate,
          dueDate,
          tuitionFee: Number(tuitionFee),
          admissionFee: Number(admissionFee),
          examFee: Number(examFee),
          transportFee: Number(transportFee),
          discountAmount: Number(discountAmount),
        }),
      });

      if (!res.ok) throw new Error('Failed to generate invoice');

      await refreshAllData();
      showToast('Fee Challan invoice generated successfully', 'success');
      setShowGenerateModal(false);
      setStudentId('');
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStudent = (sId: string) => students.find((s) => s.id === sId);
  const getClassName = (cId?: string) => classes.find((c) => c.id === cId)?.name || 'Class';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Fee Management (PKR)</h2>
          <p className="text-xs text-slate-500">
            Monthly tuition challans, admission fees, receipt generation, and fee dues tracking.
          </p>
        </div>

        {currentUser.permissions.includes('view_financial') && (
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Fee Challan</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Challan No, Student Name, Roll No..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 focus:bg-white text-slate-800"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 text-slate-800"
          >
            <option value="all">All Payment Statuses</option>
            <option value="Paid">Paid Only</option>
            <option value="Partial">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue Challans</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No fee challans recorded. Click "Generate Fee Challan" or load demo data.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Challan / Inv #</th>
                  <th className="py-3 px-4">Student & Class</th>
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Remaining</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInvoices.map((inv) => {
                  const student = getStudent(inv.studentId);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-emerald-900">
                        {inv.invoiceNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{student?.fullName || 'Student'}</div>
                        <div className="text-[11px] text-slate-400">
                          {student?.admissionNumber} · {getClassName(student?.currentClassId)}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{inv.month}</td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(inv.dueDate)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 font-mono">
                        {formatPKR(inv.netPayable)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-700 font-mono">
                        {formatPKR(inv.paidAmount)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-rose-700 font-mono">
                        {formatPKR(inv.remainingAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'Overdue'
                              ? 'bg-rose-100 text-rose-800'
                              : inv.status === 'Partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.remainingAmount > 0 && currentUser.permissions.includes('view_financial') && (
                            <button
                              onClick={() => onCollectPayment(inv)}
                              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-[11px] font-medium shadow-xs"
                            >
                              Collect Fee
                            </button>
                          )}
                          <button
                            onClick={() => onPrintReceipt(inv)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Print 3-Part Challan Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Fee Challan Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Issue Fee Challan</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleGenerateInvoice} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select Student <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="">-- Choose active student --</option>
                  {activeStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNumber} - {getClassName(s.currentClassId)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Billing Month</label>
                  <input
                    type="text"
                    required
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    placeholder="e.g. October 2026"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tuition Fee (PKR)</label>
                  <input
                    type="number"
                    value={tuitionFee}
                    onChange={(e) => setTuitionFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Transport Fee (PKR)</label>
                  <input
                    type="number"
                    value={transportFee}
                    onChange={(e) => setTransportFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Exam / Lab Fee (PKR)</label>
                  <input
                    type="number"
                    value={examFee}
                    onChange={(e) => setExamFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount (PKR)</label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between font-semibold text-slate-900">
                <span>Net Payable:</span>
                <span className="font-mono text-emerald-800">
                  {formatPKR(tuitionFee + transportFee + examFee - discountAmount)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 font-medium"
                >
                  {submitting ? 'Generating...' : 'Issue Challan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
