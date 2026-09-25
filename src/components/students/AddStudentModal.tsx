import React, { useState } from 'react';
import { X, Save, User, MapPin, School, Phone, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { formatCNIC } from '../../utils/formatters.ts';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const { classes, sections, academicYears, settings, refreshAllData, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'personal' | 'parents' | 'address' | 'academic' | 'emergency'>('personal');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [nationality, setNationality] = useState('Pakistani');
  const [religion, setReligion] = useState('Islam');
  const [bFormNumber, setBFormNumber] = useState('');

  // Parent Info
  const [fatherName, setFatherName] = useState('');
  const [fatherCnic, setFatherCnic] = useState('');
  const [fatherContact, setFatherContact] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherCnic, setMotherCnic] = useState('');

  // Address
  const [houseStreet, setHouseStreet] = useState('');
  const [mohalla, setMohalla] = useState('');
  const [villageCity, setVillageCity] = useState('');
  const [tehsil, setTehsil] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState(settings?.province || 'Khyber Pakhtunkhwa');
  const [postalCode, setPostalCode] = useState('');

  // Academic
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [admissionClassId, setAdmissionClassId] = useState(classes[0]?.id || 'cls-9');
  const [currentClassId, setCurrentClassId] = useState(classes[0]?.id || 'cls-9');
  const [currentSectionId, setCurrentSectionId] = useState(sections[0]?.id || 'sec-9a');
  const [previousSchool, setPreviousSchool] = useState('');
  const [previousClass, setPreviousClass] = useState('');
  const [previousLeavingCertificateNo, setPreviousLeavingCertificateNo] = useState('');
  const [previousResult, setPreviousResult] = useState('');

  // Emergency
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Father');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !fatherName.trim() || !currentClassId) {
      showToast('Please fill in Student Name, Father Name, and Class', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        dob,
        gender,
        bloodGroup,
        nationality,
        religion,
        bFormNumber: bFormNumber.trim(),
        fatherName: fatherName.trim(),
        fatherCnic: fatherCnic.trim(),
        fatherContact: fatherContact.trim(),
        fatherOccupation: fatherOccupation.trim(),
        motherName: motherName.trim(),
        motherCnic: motherCnic.trim(),
        houseStreet: houseStreet.trim(),
        mohalla: mohalla.trim(),
        villageCity: villageCity.trim(),
        tehsil: tehsil.trim(),
        district: district.trim(),
        province,
        postalCode: postalCode.trim(),
        admissionDate,
        admissionClassId,
        currentClassId,
        currentSectionId,
        currentAcademicYearId: settings?.currentAcademicYearId || 'ay-2026-2027',
        previousSchool: previousSchool.trim(),
        previousClass: previousClass.trim(),
        previousLeavingCertificateNo: previousLeavingCertificateNo.trim(),
        previousResult: previousResult.trim(),
        emergencyContact: emergencyContact.trim() || fatherName,
        emergencyRelation,
        emergencyPhone: emergencyPhone.trim() || fatherContact,
        medicalNotes: medicalNotes.trim(),
        remarks: remarks.trim(),
        status: 'active',
      };

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to register student');
      }

      await refreshAllData();
      showToast(`Student ${fullName} registered successfully!`, 'success');
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'Error creating student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Student Admission & Registration</h3>
            <p className="text-xs text-slate-500">Official Pakistani School Student Record Form</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 border-b border-slate-200 bg-white flex space-x-6 text-xs font-medium">
          {[
            { id: 'personal', label: '1. Personal Details' },
            { id: 'parents', label: '2. Parents / Guardian' },
            { id: 'address', label: '3. Residential Address' },
            { id: 'academic', label: '4. Academic Enrollment' },
            { id: 'emergency', label: '5. Emergency & Medical' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Student Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Muhammad Hamza Khan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  B-Form / Form-B Number <span className="text-slate-400 font-normal">(NADRA)</span>
                </label>
                <input
                  type="text"
                  value={bFormNumber}
                  onChange={(e) => setBFormNumber(formatCNIC(e.target.value))}
                  placeholder="e.g. 17301-1234567-1"
                  className="w-full px-3 py-2 font-mono border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Religion</label>
                <input
                  type="text"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nationality</label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'parents' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Father Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="e.g. Iftikhar Ahmad Khan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Father CNIC</label>
                <input
                  type="text"
                  value={fatherCnic}
                  onChange={(e) => setFatherCnic(formatCNIC(e.target.value))}
                  placeholder="17301-1234567-1"
                  className="w-full px-3 py-2 font-mono border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Father Contact / Mobile</label>
                <input
                  type="text"
                  value={fatherContact}
                  onChange={(e) => setFatherContact(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Father Occupation</label>
                <input
                  type="text"
                  value={fatherOccupation}
                  onChange={(e) => setFatherOccupation(e.target.value)}
                  placeholder="e.g. Civil Servant, Businessman, Doctor"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mother Name</label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="e.g. Nadia Iftikhar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mother CNIC</label>
                <input
                  type="text"
                  value={motherCnic}
                  onChange={(e) => setMotherCnic(formatCNIC(e.target.value))}
                  placeholder="17301-7654321-2"
                  className="w-full px-3 py-2 font-mono border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">House / Street Address</label>
                <input
                  type="text"
                  value={houseStreet}
                  onChange={(e) => setHouseStreet(e.target.value)}
                  placeholder="e.g. House # 12, Street 3"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mohalla / Sector</label>
                <input
                  type="text"
                  value={mohalla}
                  onChange={(e) => setMohalla(e.target.value)}
                  placeholder="e.g. Sector D-2, Phase 1"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Village / City</label>
                <input
                  type="text"
                  value={villageCity}
                  onChange={(e) => setVillageCity(e.target.value)}
                  placeholder="e.g. Peshawar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tehsil</label>
                <input
                  type="text"
                  value={tehsil}
                  onChange={(e) => setTehsil(e.target.value)}
                  placeholder="e.g. Peshawar City"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Peshawar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Province</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
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
                <label className="block text-slate-700 font-semibold mb-1">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="25000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Admission Date</label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Admission Class</label>
                <select
                  value={admissionClassId}
                  onChange={(e) => setAdmissionClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Current Class</label>
                <select
                  value={currentClassId}
                  onChange={(e) => setCurrentClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Section</label>
                <select
                  value={currentSectionId}
                  onChange={(e) => setCurrentSectionId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Previous School History (If Transferred)
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Previous School Name</label>
                <input
                  type="text"
                  value={previousSchool}
                  onChange={(e) => setPreviousSchool(e.target.value)}
                  placeholder="e.g. Peshawar Model School"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Previous School SLC Number</label>
                <input
                  type="text"
                  value={previousLeavingCertificateNo}
                  onChange={(e) => setPreviousLeavingCertificateNo(e.target.value)}
                  placeholder="SLC-2025-098"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Previous Result / Grade</label>
                <input
                  type="text"
                  value={previousResult}
                  onChange={(e) => setPreviousResult(e.target.value)}
                  placeholder="88.5% (Grade A1)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Father / Uncle / Guardian name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Emergency Phone Number</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+92 300 0000000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Medical / Health Notes</label>
                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Allergies, chronic conditions, vision notes, etc."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Administrative Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Special instructions, scholarship notes, concessions..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex gap-2">
              {activeTab !== 'personal' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'parents') setActiveTab('personal');
                    else if (activeTab === 'address') setActiveTab('parents');
                    else if (activeTab === 'academic') setActiveTab('address');
                    else if (activeTab === 'emergency') setActiveTab('academic');
                  }}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Previous
                </button>
              )}
              {activeTab !== 'emergency' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'personal') setActiveTab('parents');
                    else if (activeTab === 'parents') setActiveTab('address');
                    else if (activeTab === 'address') setActiveTab('academic');
                    else if (activeTab === 'academic') setActiveTab('emergency');
                  }}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium"
                >
                  Next Step
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
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
                <span>{submitting ? 'Registering...' : 'Save & Register'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
