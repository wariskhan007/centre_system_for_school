import React, { useState } from 'react';
import { X, Save, User, Briefcase, GraduationCap, MapPin, DollarSign, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Staff, StaffCategory } from '../../types/index.ts';

interface EditStaffModalProps {
  staffMember: Staff;
  onClose: () => void;
}

export const EditStaffModal: React.FC<EditStaffModalProps> = ({ staffMember, onClose }) => {
  const { refreshAllData, showToast } = useApp();

  const [name, setName] = useState(staffMember.name);
  const [fatherName, setFatherName] = useState(staffMember.fatherName || staffMember.fatherOrHusbandName || '');
  const [designation, setDesignation] = useState(staffMember.designation);
  const [department, setDepartment] = useState(staffMember.department);
  const [category, setCategory] = useState<StaffCategory>(staffMember.category);
  const [bpsPayScale, setBpsPayScale] = useState(staffMember.bpsPayScale || 'BPS-17');
  const [contact, setContact] = useState(staffMember.contact);
  const [email, setEmail] = useState(staffMember.email || '');
  const [cnic, setCnic] = useState(staffMember.cnic);
  const [status, setStatus] = useState<Staff['status']>(staffMember.status);
  const [monthlySalary, setMonthlySalary] = useState<number>(staffMember.monthlySalary || 45000);
  const [address, setAddress] = useState(staffMember.address);
  const [qualification, setQualification] = useState(staffMember.qualification);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !designation.trim() || !contact.trim()) {
      showToast('Please fill all required staff fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/staff/${staffMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          fatherName: fatherName.trim(),
          designation: designation.trim(),
          department: department.trim(),
          category,
          bpsPayScale,
          contact: contact.trim(),
          email: email.trim(),
          cnic: cnic.trim(),
          status,
          monthlySalary: Number(monthlySalary),
          address: address.trim(),
          qualification: qualification.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to update staff member record');

      await refreshAllData();
      showToast(`Staff record for "${name}" updated successfully!`, 'success');
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Edit Staff Member: {staffMember.name}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Employee ID: {staffMember.employeeId} · Update designation, pay scale, or status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
          {/* Status Radio Selector Banner */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="block text-slate-700 font-bold mb-2">Staff Employment Status</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Active', 'On Leave', 'Resigned', 'Retired'] as const).map((st) => (
                <label
                  key={st}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                    status === st
                      ? st === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                        : st === 'On Leave'
                        ? 'bg-amber-50 text-amber-800 border-amber-400'
                        : 'bg-rose-50 text-rose-800 border-rose-400'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="staffStatus"
                    checked={status === st}
                    onChange={() => setStatus(st)}
                    className="sr-only"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-600 font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Father / Husband Name</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-600 font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Designation & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Designation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Teacher"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-600 font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Science & Mathematics"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-600 font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Staff Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StaffCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-600 font-bold text-slate-800 bg-slate-50"
              >
                <option value="Teaching Staff">Teaching Staff</option>
                <option value="Non-Teaching Staff">Non-Teaching Staff</option>
                <option value="Administration">Administration</option>
                <option value="Support Staff">Support Staff</option>
              </select>
            </div>
          </div>

          {/* Pay Scale & Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">BPS Pay Scale</label>
              <input
                type="text"
                value={bpsPayScale}
                onChange={(e) => setBpsPayScale(e.target.value)}
                placeholder="e.g. BPS-17"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-600 font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Monthly Basic Salary (PKR)</label>
              <input
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-600 font-mono text-slate-900"
              />
            </div>
          </div>

          {/* CNIC, Contact & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">CNIC (13 Digits)</label>
              <input
                type="text"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="17301-1234567-1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-600 font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Contact Phone</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-600 font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@ses.edu.pk"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-600 text-slate-900"
              />
            </div>
          </div>

          {/* Qualification & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Highest Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. M.Sc Physics (Peshawar University)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-600 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Residential Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Gandi Chowk Lakki Marwat"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-600 text-slate-900"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-bold flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Save Staff Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
