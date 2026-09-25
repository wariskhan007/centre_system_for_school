import React, { useState } from 'react';
import { UserPlus, CheckCircle, Clock, XCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { AdmissionApplication } from '../../types/index.ts';
import { formatDate } from '../../utils/formatters.ts';

export const AdmissionsView: React.FC = () => {
  const { admissions, classes, refreshAllData, showToast, currentUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [applicantName, setApplicantName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [fatherContact, setFatherContact] = useState('');
  const [fatherCnic, setFatherCnic] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [desiredClassId, setDesiredClassId] = useState(classes[0]?.id || 'cls-9');
  const [previousSchool, setPreviousSchool] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !fatherName.trim() || !fatherContact.trim()) {
      showToast('Please fill all required application fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: applicantName.trim(),
          fatherName: fatherName.trim(),
          fatherContact: fatherContact.trim(),
          fatherCnic: fatherCnic.trim(),
          dob,
          gender,
          desiredClassId,
          previousSchool: previousSchool.trim(),
          notes: notes.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to create application');

      await refreshAllData();
      showToast('Admission application submitted successfully', 'success');
      setShowAddModal(false);
      // Reset form
      setApplicantName('');
      setFatherName('');
      setFatherContact('');
      setFatherCnic('');
      setNotes('');
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStage = async (id: string, stage: AdmissionApplication['stage']) => {
    try {
      const res = await fetch(`/api/admissions/${id}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      if (res.ok) {
        await refreshAllData();
        showToast(`Application moved to ${stage}`, 'success');
      }
    } catch {
      showToast('Failed to update stage', 'error');
    }
  };

  const handleEnrollNow = async (app: AdmissionApplication) => {
    // Quick enroll converts application into permanent student
    try {
      const payload = {
        fullName: app.applicantName,
        dob: app.dob,
        gender: app.gender,
        fatherName: app.fatherName,
        fatherCnic: app.fatherCnic,
        fatherContact: app.fatherContact,
        admissionClassId: app.desiredClassId,
        currentClassId: app.desiredClassId,
        currentSectionId: 'sec-9a',
        previousSchool: app.previousSchool,
        admissionDate: new Date().toISOString().split('T')[0],
        bFormNumber: app.bFormNumber || '',
        status: 'active',
        houseStreet: 'Peshawar',
        tehsil: 'Peshawar',
        district: 'Peshawar',
        province: 'Khyber Pakhtunkhwa',
        emergencyContact: app.fatherName,
        emergencyRelation: 'Father',
        emergencyPhone: app.fatherContact,
      };

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await handleUpdateStage(app.id, 'Enrolled');
        showToast(`Student ${app.applicantName} enrolled successfully!`, 'success');
      }
    } catch {
      showToast('Failed to enroll student', 'error');
    }
  };

  const getClassName = (clsId: string) => classes.find((c) => c.id === clsId)?.name || clsId;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Admission Management</h2>
          <p className="text-xs text-slate-500">
            Intake workflow: Application → Verification → Approval → Student Registration.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Application</span>
        </button>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {admissions.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No admission applications recorded for the upcoming session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Application #</th>
                  <th className="py-3 px-4">Applicant & Father</th>
                  <th className="py-3 px-4">Desired Class</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {admissions.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {app.applicationNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{app.applicantName}</div>
                      <div className="text-[11px] text-slate-500">
                        Father: {app.fatherName} ({app.gender})
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{getClassName(app.desiredClassId)}</td>
                    <td className="py-3 px-4 font-mono">{app.fatherContact}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(app.applicationDate)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          app.stage === 'Enrolled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.stage === 'Admission Approved'
                            ? 'bg-blue-100 text-blue-800'
                            : app.stage === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {app.stage === 'Application' && (
                          <button
                            onClick={() => handleUpdateStage(app.id, 'Verification')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                          >
                            Verify Docs
                          </button>
                        )}
                        {app.stage === 'Verification' && (
                          <button
                            onClick={() => handleUpdateStage(app.id, 'Admission Approved')}
                            className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-medium"
                          >
                            Approve
                          </button>
                        )}
                        {app.stage === 'Admission Approved' && (
                          <button
                            onClick={() => handleEnrollNow(app)}
                            className="px-2.5 py-1 bg-emerald-800 text-white hover:bg-emerald-900 rounded text-[11px] font-medium flex items-center gap-1 shadow-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Enroll Student</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">New Admission Application</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateApplication} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Applicant Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. Danyal Zahid"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Father Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="e.g. Zahid Hussain"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Father Contact <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fatherContact}
                    onChange={(e) => setFatherContact(e.target.value)}
                    placeholder="+92 300 0000000"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Father CNIC</label>
                  <input
                    type="text"
                    value={fatherCnic}
                    onChange={(e) => setFatherCnic(e.target.value)}
                    placeholder="17301-0000000-0"
                    className="w-full px-3 py-1.5 font-mono border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Desired Class</label>
                  <select
                    value={desiredClassId}
                    onChange={(e) => setDesiredClassId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Previous School (if any)</label>
                <input
                  type="text"
                  value={previousSchool}
                  onChange={(e) => setPreviousSchool(e.target.value)}
                  placeholder="e.g. Frontier Science Academy"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Evaluation & Entrance Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Test score, interview notes..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
