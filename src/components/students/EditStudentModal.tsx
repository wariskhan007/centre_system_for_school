import React, { useState } from 'react';
import { X, Save, User, MapPin, School, Phone, AlertCircle, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Student } from '../../types/index.ts';

interface EditStudentModalProps {
  student: Student;
  onClose: () => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, onClose }) => {
  const { classes, sections, refreshAllData, showToast } = useApp();

  const [fullName, setFullName] = useState(student.fullName);
  const [rollNumber, setRollNumber] = useState(student.rollNumber);
  const [currentClassId, setCurrentClassId] = useState(student.currentClassId);
  const [currentSectionId, setCurrentSectionId] = useState(student.currentSectionId);
  const [status, setStatus] = useState<Student['status']>(student.status);
  const [dob, setDob] = useState(student.dob);
  const [gender, setGender] = useState<Student['gender']>(student.gender);
  const [bloodGroup, setBloodGroup] = useState<Student['bloodGroup']>(student.bloodGroup || 'B+');
  const [fatherName, setFatherName] = useState(student.fatherName);
  const [fatherCnic, setFatherCnic] = useState(student.fatherCnic || '');
  const [fatherContact, setFatherContact] = useState(student.fatherContact || '');
  const [motherName, setMotherName] = useState(student.motherName || '');
  const [bFormNumber, setBFormNumber] = useState(student.bFormNumber || '');
  const [emergencyPhone, setEmergencyPhone] = useState(student.emergencyPhone || '');
  const [emergencyContact, setEmergencyContact] = useState(student.emergencyContact || '');
  const [houseStreet, setHouseStreet] = useState(student.houseStreet || '');
  const [villageCity, setVillageCity] = useState(student.villageCity || '');
  const [district, setDistrict] = useState(student.district || 'Lakki Marwat');
  const [tehsil, setTehsil] = useState(student.tehsil || 'Lakki Marwat');
  const [submitting, setSubmitting] = useState(false);

  const availableSections = sections.filter((sec) => sec.classId === currentClassId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !rollNumber.trim() || !fatherName.trim()) {
      showToast('Please fill all required student fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          rollNumber: rollNumber.trim(),
          currentClassId,
          currentSectionId,
          status,
          dob,
          gender,
          bloodGroup,
          fatherName: fatherName.trim(),
          fatherCnic: fatherCnic.trim(),
          fatherContact: fatherContact.trim(),
          motherName: motherName.trim(),
          bFormNumber: bFormNumber.trim(),
          emergencyPhone: emergencyPhone.trim(),
          emergencyContact: emergencyContact.trim(),
          houseStreet: houseStreet.trim(),
          villageCity: villageCity.trim(),
          district: district.trim(),
          tehsil: tehsil.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to update student record');

      await refreshAllData();
      showToast(`Student record for "${fullName}" updated successfully!`, 'success');
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
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Edit Student Profile: {student.fullName}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Admission No: {student.admissionNumber} · Roll #{student.rollNumber}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
          {/* Status Selector */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="block text-slate-700 font-bold mb-2">Student Enrollment Status</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['active', 'new', 'withdrawn', 'migrated', 'transferred'] as const).map((st) => (
                <label
                  key={st}
                  className={`flex items-center justify-center p-2 rounded-lg border text-center font-bold cursor-pointer uppercase text-[10px] tracking-wider transition-colors ${
                    status === st
                      ? st === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                        : st === 'new'
                        ? 'bg-blue-50 text-blue-800 border-blue-400'
                        : 'bg-rose-50 text-rose-800 border-rose-400'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="studentStatus"
                    checked={status === st}
                    onChange={() => setStatus(st)}
                    className="sr-only"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Academic Info: Class, Section, Roll */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Assigned Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={currentClassId}
                onChange={(e) => {
                  setCurrentClassId(e.target.value);
                  const firstSec = sections.find((sec) => sec.classId === e.target.value);
                  if (firstSec) setCurrentSectionId(firstSec.id);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-bold text-slate-900 bg-white"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Assigned Section <span className="text-rose-500">*</span>
              </label>
              <select
                value={currentSectionId}
                onChange={(e) => setCurrentSectionId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-bold text-slate-900 bg-white"
              >
                {availableSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    Section {sec.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Class Roll Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Student['gender'])}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as Student['bloodGroup'])}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-mono font-bold text-rose-700"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date of birth & B-Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">B-Form Number (NADRA)</label>
              <input
                type="text"
                value={bFormNumber}
                onChange={(e) => setBFormNumber(e.target.value)}
                placeholder="17301-1122334-1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Father Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Father Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Father CNIC</label>
              <input
                type="text"
                value={fatherCnic}
                onChange={(e) => setFatherCnic(e.target.value)}
                placeholder="17301-7654321-1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Father Phone Number</label>
              <input
                type="text"
                value={fatherContact}
                onChange={(e) => setFatherContact(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Emergency & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Emergency Contact Person</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. Uncle / Guardian"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Emergency Phone</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+92 301 9876543"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">City / Village</label>
              <input
                type="text"
                value={villageCity}
                onChange={(e) => setVillageCity(e.target.value)}
                placeholder="e.g. Lakki Marwat"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Street / House Address</label>
            <input
              type="text"
              value={houseStreet}
              onChange={(e) => setHouseStreet(e.target.value)}
              placeholder="e.g. Near Gandi Chowk Main Bazar"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 text-slate-900"
            />
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
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Save Student Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
