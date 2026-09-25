import React, { useState } from 'react';
import { School, Save, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { SchoolSettings } from '../../types/index.ts';

export const SchoolSettingsView: React.FC = () => {
  const { settings, refreshAllData, showToast, currentUser } = useApp();

  const [form, setForm] = useState<SchoolSettings>(
    settings || {
      name: 'ABC School',
      address: 'XYZ',
      country: 'Pakistan',
      province: 'Khyber Pakhtunkhwa',
      district: 'Not Set',
      tehsil: 'Not Set',
      emisCode: 'Not Set',
      phone: 'Not Set',
      email: 'info@abcschool.edu.pk',
      website: 'https://abcschool.edu.pk',
      logo: '',
      defaultCurrency: 'PKR',
      currentAcademicYearId: 'ay-2026-2027',
      admissionPrefix: 'ABC-2026',
      studentIdPrefix: 'STU-2026',
      employeeIdPrefix: 'EMP',
      receiptPrefix: 'REC-2026',
      certificatePrefix: 'SLC-2026',
      paperHeaderInstructions: 'Attempt all questions. Overwriting or cutting will not be credited.',
      passingPercentage: 33,
    }
  );

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/school/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      await refreshAllData();
      showToast('School profile and configurations updated successfully!', 'success');
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Profile & Settings</h2>
        <p className="text-xs text-slate-500">
          Official identity, provincial location, EMIS registry code, and certificate prefix configurations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 text-xs">
        {/* Basic Identity */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2 flex items-center gap-2">
            <School className="w-4 h-4 text-emerald-700" />
            <span>School Identification</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">School Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-1.5 font-bold border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Campus / Address</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Country</label>
              <input
                type="text"
                disabled
                value={form.country}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Province</label>
              <select
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              >
                <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                <option value="Punjab">Punjab</option>
                <option value="Sindh">Sindh</option>
                <option value="Balochistan">Balochistan</option>
                <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                <option value="Azad Jammu & Kashmir">Azad Jammu & Kashmir</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">District</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tehsil</label>
              <input
                type="text"
                value={form.tehsil}
                onChange={(e) => setForm({ ...form, tehsil: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">EMIS Code</label>
              <input
                type="text"
                value={form.emisCode}
                onChange={(e) => setForm({ ...form, emisCode: e.target.value })}
                className="w-full px-3 py-1.5 font-mono border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Default Currency</label>
              <input
                type="text"
                disabled
                value={form.defaultCurrency}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-800"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">
            Institutional Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              />
            </div>
          </div>
        </div>

        {/* Numbering Formats */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">
            Automated Numbering & Prefix Formats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Admission No Prefix</label>
              <input
                type="text"
                value={form.admissionPrefix}
                onChange={(e) => setForm({ ...form, admissionPrefix: e.target.value })}
                className="w-full px-3 py-1.5 font-mono border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Student ID Prefix</label>
              <input
                type="text"
                value={form.studentIdPrefix}
                onChange={(e) => setForm({ ...form, studentIdPrefix: e.target.value })}
                className="w-full px-3 py-1.5 font-mono border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">SLC Certificate Prefix</label>
              <input
                type="text"
                value={form.certificatePrefix}
                onChange={(e) => setForm({ ...form, certificatePrefix: e.target.value })}
                className="w-full px-3 py-1.5 font-mono border border-slate-200 rounded-lg outline-none"
              />
            </div>
          </div>
        </div>

        {currentUser.permissions.includes('manage_settings') && (
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-medium flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
