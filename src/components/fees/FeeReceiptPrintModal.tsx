import React from 'react';
import { X, Printer, School } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { FeeInvoice } from '../../types/index.ts';
import { formatPKR, formatDate } from '../../utils/formatters.ts';

interface FeeReceiptPrintModalProps {
  invoice: FeeInvoice | null;
  onClose: () => void;
}

export const FeeReceiptPrintModal: React.FC<FeeReceiptPrintModalProps> = ({
  invoice,
  onClose,
}) => {
  const { students, classes, settings } = useApp();

  if (!invoice) return null;
  const student = students.find((s) => s.id === invoice.studentId);
  const className = classes.find((c) => c.id === student?.currentClassId)?.name || 'Class';

  const handlePrint = () => {
    window.print();
  };

  const copies = ['BANK COPY', 'SCHOOL COPY', 'STUDENT COPY'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header toolbar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Official Pakistani 3-Part Fee Challan
            </h3>
            <p className="text-xs text-slate-500">
              Bank Copy · School Office Copy · Student Copy
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-lg shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Challan Receipt</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable 3-fold container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 print:bg-white print:p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
            {copies.map((copyTitle) => (
              <div
                key={copyTitle}
                className="bg-white p-4 border border-dashed border-slate-300 rounded-lg shadow-xs flex flex-col justify-between text-[11px] leading-tight print:border-slate-400 print:shadow-none print:rounded-none"
              >
                <div>
                  {/* School Heading */}
                  <div className="text-center border-b border-slate-200 pb-2 mb-2">
                    <div className="font-bold text-xs uppercase text-slate-900 tracking-tight">
                      {settings?.name || 'ABC SCHOOL'}
                    </div>
                    <div className="text-[10px] text-slate-500">{settings?.address || 'XYZ'}</div>
                    <div className="mt-1 font-semibold text-[10px] bg-slate-100 py-0.5 rounded text-slate-700 font-mono">
                      {copyTitle}
                    </div>
                  </div>

                  {/* Challan Metadata */}
                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Challan #:</span>
                      <span className="font-mono font-bold text-slate-900">{invoice.invoiceNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Month:</span>
                      <span className="font-semibold text-slate-800">{invoice.month}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Issue Date:</span>
                      <span>{formatDate(invoice.issueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Due Date:</span>
                      <span className="font-semibold text-rose-700">{formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>

                  <hr className="border-slate-100 my-1.5" />

                  {/* Student Details */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Student:</span>
                      <span className="font-bold text-slate-900">{student?.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Father:</span>
                      <span>{student?.fatherName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Admission #:</span>
                      <span className="font-mono">{student?.admissionNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Class & Roll:</span>
                      <span>{className} (Roll #{student?.rollNumber})</span>
                    </div>
                  </div>

                  {/* Fee Particulars */}
                  <table className="w-full text-left mb-2 border-t border-b border-slate-200 py-1">
                    <tbody>
                      <tr>
                        <td className="py-1 text-slate-600">Tuition Fee:</td>
                        <td className="py-1 text-right font-mono font-medium">
                          {formatPKR(invoice.tuitionFee)}
                        </td>
                      </tr>
                      {Boolean(invoice.transportFee) && (
                        <tr>
                          <td className="py-1 text-slate-600">Transport:</td>
                          <td className="py-1 text-right font-mono font-medium">
                            {formatPKR(invoice.transportFee)}
                          </td>
                        </tr>
                      )}
                      {Boolean(invoice.examFee) && (
                        <tr>
                          <td className="py-1 text-slate-600">Exam / Lab:</td>
                          <td className="py-1 text-right font-mono font-medium">
                            {formatPKR(invoice.examFee)}
                          </td>
                        </tr>
                      )}
                      {Boolean(invoice.discountAmount) && (
                        <tr className="text-emerald-700">
                          <td className="py-1">Concession:</td>
                          <td className="py-1 text-right font-mono">
                            -{formatPKR(invoice.discountAmount)}
                          </td>
                        </tr>
                      )}
                      <tr className="border-t border-slate-200 font-bold text-slate-900">
                        <td className="py-1.5">Net Payable:</td>
                        <td className="py-1.5 text-right font-mono">
                          {formatPKR(invoice.netPayable)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 text-emerald-800 font-semibold">Amount Paid:</td>
                        <td className="py-1 text-right font-mono font-bold text-emerald-800">
                          {formatPKR(invoice.paidAmount)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 text-rose-700 font-semibold">Balance:</td>
                        <td className="py-1 text-right font-mono font-bold text-rose-700">
                          {formatPKR(invoice.remainingAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Signatures */}
                <div className="pt-6 border-t border-slate-200 mt-4 flex justify-between text-[9px] text-slate-400">
                  <div className="text-center">
                    <div className="border-t border-slate-300 w-16 pt-0.5">Cashier / Bank</div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-slate-300 w-16 pt-0.5">Principal / Bursar</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
