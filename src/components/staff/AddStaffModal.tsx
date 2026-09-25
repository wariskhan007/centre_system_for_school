import React, { useState } from 'react';
import { X, Save, User, Briefcase, GraduationCap, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { StaffCategory } from '../../types/index.ts';
import { formatCNIC } from '../../utils/formatters.ts';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose }) => {
  const { classes, refreshAllData, showToast } = useApp();

  const [name, setName] = useState('');
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [cnic, setCnic] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [qualification, setQualification] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Science');
  const [category, setCategory] = useState<StaffCategory>('Teaching Staff');
  const [bpsPayScale, setBpsPayScale] = useState('BPS-17');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [employmentType, setEmploymentType] = useState<'Permanent' | 'Contract' | 'Visiting'>('Permanent');
  const [subjectSpecialization, setSubjectSpecialization] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cnic.trim() || !contact.trim() || !designation.trim()) {
      showToast('Please fill all required staff fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        fatherOrHusbandName: fatherOrHusbandName.trim(),
        dob,
        gender,
        cnic: cnic.trim(),
        contact: contact.trim(),
        email: email.trim(),
        address: address.trim(),
        qualification: qualification.trim(),
        designation: designation.trim(),
        department: department.trim(),
        category,
        bpsPayScale,
        joiningDate,
        employmentType,
        subjectSpecialization: subjectSpecialization.trim(),
        assignedClassIds: [],
        assignedSectionIds: [],
        emergencyContact: emergencyContact.trim(),
        status: 'Active',
      };

      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create staff member');

      await refreshAllData();
      showToast(`Staff member "${name}" registered successfully`, 'success');
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
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Add Staff / Faculty Member</h3>
            <p className="text-xs text-slate-500">Employment record & appointment details</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Syed Usman Shah"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Father / Husband Name</label>
              <input
                type="text"
                value={fatherOrHusbandName}
                onChange={(e) => setFatherOrHusbandName(e.target.value)}
                placeholder="e.g. Syed Anwar Shah"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                CNIC Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={cnic}
                onChange={(e) => setCnic(formatCNIC(e.target.value))}
                placeholder="17301-1234567-1"
                className="w-full px-3 py-1.5 font-mono border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Contact / Mobile <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@abcschool.edu.pk"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StaffCategory)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              >
                <option value="Teaching Staff">Teaching Staff</option>
                <option value="Non-Teaching Staff">Non-Teaching Staff</option>
                <option value="Administration">Administration</option>
                <option value="Support Staff">Support Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Designation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Science Teacher (Physics)"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Science / Mathematics / Languages"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Pay Scale / BPS</label>
              <select
                value={bpsPayScale}
                onChange={(e) => setBpsPayScale(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none font-mono"
              >
                {['BPS-11', 'BPS-14', 'BPS-16', 'BPS-17', 'BPS-18', 'BPS-19', 'BPS-20'].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Academic Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. M.Sc. Physics (UoP), B.Ed"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Specialization</label>
              <input
                type="text"
                value={subjectSpecialization}
                onChange={(e) => setSubjectSpecialization(e.target.value)}
                placeholder="e.g. Physics / Calculus"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Joining Date</label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as typeof employmentType)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              >
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
                <option value="Visiting">Visiting</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Residential Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House, Street, Area, City"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-medium flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : 'Register Staff Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
