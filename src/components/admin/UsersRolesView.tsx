import React, { useState } from 'react';
import {
  Shield,
  UserPlus,
  Edit2,
  CheckCircle2,
  XCircle,
  Save,
  X,
  Phone,
  Mail,
  UserCheck,
  Power,
  Key,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { User, UserRole } from '../../types/index.ts';

export const UsersRolesView: React.FC = () => {
  const { users, currentUser, refreshAllData, showToast } = useApp();

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states for Add/Edit
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Teacher');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const rolesList: { role: UserRole; desc: string }[] = [
    { role: 'Super Administrator', desc: 'Full unlimited access across all modules, settings, and database backups.' },
    { role: 'School Administrator', desc: 'Institutional management of students, admissions, and examinations.' },
    { role: 'Principal / Head Teacher', desc: 'Authority for withdrawals (SLCs), promotion approvals, and gazettes.' },
    { role: 'Teacher', desc: 'Class attendance marking, marks entry, and question bank authoring.' },
    { role: 'Accountant', desc: 'Fee invoicing, fee deposit collection, dues ledger, and financial receipts.' },
    { role: 'Examination Officer', desc: 'Exam schedules, grading policies, and question paper approvals.' },
    { role: 'Receptionist / Data Entry Operator', desc: 'Admission intake registration and visitor logging.' },
    { role: 'HR / Staff Manager', desc: 'Staff directory, employee appointments, and faculty attendance.' },
    { role: 'Read-Only User', desc: 'Inspection mode for governors, auditors, or department officials.' },
  ];

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setUsername(user.username);
    setEmail(user.email);
    setPhone(user.phone || '');
    setRole(user.role);
    setStatus(user.status);
  };

  const handleToggleStatus = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update user status');
      await refreshAllData();
      showToast(`User "${user.name}" status changed to ${newStatus.toUpperCase()}`, 'success');
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, 'error');
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim()) {
      showToast('Please fill all required user fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        // Update user
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            username: username.trim(),
            email: email.trim(),
            phone: phone.trim(),
            role,
            status,
          }),
        });

        if (!res.ok) throw new Error('Failed to update user account');

        await refreshAllData();
        showToast(`User account for "${name}" updated successfully!`, 'success');
        setEditingUser(null);
      } else {
        // Create user
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            username: username.trim(),
            email: email.trim(),
            phone: phone.trim(),
            role,
            status,
            permissions: ['view', 'create', 'edit'],
          }),
        });

        if (!res.ok) throw new Error('Failed to create user account');

        await refreshAllData();
        showToast(`New user "${name}" created successfully!`, 'success');
        setShowAddUserModal(false);
      }
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Users & Role-Based Access Control</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage system users, edit profile details, assign administrative roles, and toggle active/inactive account status.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setName('');
            setUsername('');
            setEmail('');
            setPhone('');
            setRole('Teacher');
            setStatus('active');
            setShowAddUserModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User Account</span>
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolesList.map((r) => {
          const count = users.filter((u) => u.role === r.role).length;
          return (
            <div
              key={r.role}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                    {count} {count === 1 ? 'user' : 'users'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-3">{r.role}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Security Tier</span>
                <span className="font-semibold text-emerald-800">RBAC Enforced</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-900 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>System Users & Operators ({users.length})</span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
              Live Database
            </span>
          </div>
          <span className="text-slate-500 text-[11px] font-normal">
            Click the Edit icon on any row to change name, role, email, or toggle account status
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        {u.phone && <div className="text-[11px] text-slate-400 font-mono">{u.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">{u.username}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={(e) => handleToggleStatus(u, e)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-transform active:scale-95 cursor-pointer border ${
                        u.status === 'active'
                          ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                          : 'bg-rose-100/80 text-rose-800 border-rose-300 hover:bg-rose-200'
                      }`}
                      title="Click to toggle Active / Inactive status"
                    >
                      {u.status === 'active' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>Active (Click to Deactivate)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-700" />
                          <span>Inactive (Click to Activate)</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-colors shadow-2xs border border-emerald-200 cursor-pointer"
                        title="Edit user details, role, and account status"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit User</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add User Modal */}
      {(editingUser || showAddUserModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {editingUser ? `Edit User: ${editingUser.name}` : 'Create New User Account'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingUser ? 'Modify credentials, operational role, or toggle active status' : 'Assign role and security permissions'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setShowAddUserModal(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Waris Khan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. waris.khan"
                    className="w-full px-3 py-2 font-mono border border-slate-200 rounded-lg outline-none focus:border-emerald-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@ses.edu.pk"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Assigned Operational Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold text-emerald-950 bg-emerald-50/40"
                >
                  {rolesList.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Account Status</label>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${
                    status === 'active'
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="userStatus"
                      checked={status === 'active'}
                      onChange={() => setStatus('active')}
                      className="text-emerald-700"
                    />
                    <span>Active (Authorized)</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${
                    status === 'inactive'
                      ? 'border-rose-500 bg-rose-50/80 text-rose-900 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="userStatus"
                      checked={status === 'inactive'}
                      onChange={() => setStatus('inactive')}
                      className="text-rose-700"
                    />
                    <span>Inactive (Suspended)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setShowAddUserModal(false);
                  }}
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
                  <span>{submitting ? 'Saving...' : 'Save User Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
