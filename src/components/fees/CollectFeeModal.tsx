import React, { useState } from 'react';
import { X, CheckCircle, Receipt, DollarSign, Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { FeeInvoice, FeePayment } from '../../types/index.ts';
import { formatPKR } from '../../utils/formatters.ts';

interface CollectFeeModalProps {
  invoice: FeeInvoice | null;
  onClose: () => void;
  onReceiptReady: (invoice: FeeInvoice) => void;
}

export const CollectFeeModal: React.FC<CollectFeeModalProps> = ({
  invoice,
  onClose,
  onReceiptReady,
}) => {
  const { students, refreshAllData, showToast } = useApp();

  const [amountPaid, setAmountPaid] = useState<number>(invoice ? invoice.remainingAmount : 0);
  const [paymentMethod, setPaymentMethod] = useState<FeePayment['paymentMethod']>('Cash');
  const [bankReference, setBankReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (invoice) {
      setAmountPaid(invoice.remainingAmount);
    }
  }, [invoice]);

  if (!invoice) return null;
  const student = students.find((s) => s.id === invoice.studentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountPaid || amountPaid <= 0) {
      showToast('Enter a valid payment amount', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/fees/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amountPaid: Number(amountPaid),
          paymentMethod,
          bankReference: bankReference.trim(),
          remarks: remarks.trim(),
        }),
      });

      if (!res.ok) throw new Error('Payment collection failed');

      const data = await res.json();
      await refreshAllData();
      showToast(
        `Payment of PKR ${amountPaid} recorded. Receipt #${data.payment.receiptNo} generated!`,
        'success'
      );
      onReceiptReady(data.updatedInvoice);
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Collect Fee Deposit</h3>
            <p className="text-xs text-slate-500">Challan #{invoice.invoiceNo} · {invoice.month}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Student Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block text-[11px]">Student</span>
            <span className="font-semibold text-slate-900 text-sm">{student?.fullName}</span>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Roll No: {student?.rollNumber} · Admission: {student?.admissionNumber}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Net Payable</span>
              <span className="font-mono font-bold text-slate-800 text-xs">
                {formatPKR(invoice.netPayable)}
              </span>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-lg">
              <span className="text-rose-600 block text-[10px]">Remaining Dues</span>
              <span className="font-mono font-bold text-rose-800 text-xs">
                {formatPKR(invoice.remainingAmount)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Deposit Amount (PKR) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              max={invoice.remainingAmount}
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              className="w-full px-3 py-2 font-mono font-bold text-base border border-slate-300 rounded-lg outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as FeePayment['paymentMethod'])}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none font-medium"
            >
              <option value="Cash">Cash (School Accounts Counter)</option>
              <option value="Bank Transfer">Bank Transfer (HBL / Meezan / NBP)</option>
              <option value="EasyPaisa">EasyPaisa (Merchant / QR)</option>
              <option value="JazzCash">JazzCash (Merchant / Till)</option>
              <option value="Cheque">Bank Cheque / Pay Order</option>
            </select>
          </div>

          {paymentMethod !== 'Cash' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Transaction ID / Cheque / Bank Ref No
              </label>
              <input
                type="text"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                placeholder="e.g. EP-887722 or HBL-FT-99120"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Paid in full / Deposited by father"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 font-medium shadow-xs"
            >
              {submitting ? 'Recording...' : 'Confirm Deposit & Issue Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
