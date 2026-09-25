import React, { useState } from 'react';
import {
  GraduationCap,
  UserPlus,
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  Briefcase,
  IdCard,
  Edit2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Staff, StaffCategory } from '../../types/index.ts';
import { formatDate } from '../../utils/formatters.ts';
import { EditStaffModal } from './EditStaffModal.tsx';

interface StaffListViewProps {
  onAddStaff: () => void;
  onOpenProfile: (staffId: string) => void;
  onPrintCard?: (staffId: string) => void;
}

export const StaffListView: React.FC<StaffListViewProps> = ({
  onAddStaff,
  onOpenProfile,
  onPrintCard,
}) => {
  const { staff, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingStaffMember, setEditingStaffMember] = useState<Staff | null>(null);

  const filteredStaff = staff.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.employeeId.toLowerCase().includes(q) ||
      m.cnic.toLowerCase().includes(q) ||
      m.designation.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Faculty & Staff Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Teaching faculty, administrative officers, and support staff records. Click the Edit icon on any staff member to update data or status.
          </p>
        </div>

        <button
          onClick={onAddStaff}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Name, Employee ID, CNIC, Department..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 focus:bg-white text-slate-800 font-medium"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 text-slate-800 font-medium"
          >
            <option value="all">All Staff Categories</option>
            <option value="Teaching Staff">Teaching Staff</option>
            <option value="Non-Teaching Staff">Non-Teaching Staff</option>
            <option value="Administration">Administration</option>
            <option value="Support Staff">Support Staff</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 text-slate-800 font-medium"
          >
            <option value="all">All Employment Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Resigned">Resigned</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            {staff.length === 0
              ? 'No staff members registered yet. Click "Add Staff Member" or load demo data.'
              : 'No staff members match the selected filter criteria.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Emp ID</th>
                  <th className="py-3 px-4">Designation & Dept</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pay Scale</th>
                  <th className="py-3 px-4">CNIC</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs shadow-2xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{member.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {member.qualification}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {member.employeeId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{member.designation}</div>
                      <div className="text-[11px] text-slate-400">{member.department}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{member.category}</td>
                    <td className="py-3 px-4 font-mono text-emerald-800 font-bold">
                      {member.bpsPayScale || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {member.cnic}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{member.contact}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          member.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : member.status === 'On Leave'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Staff Button with clear icon and tooltip */}
                        <button
                          onClick={() => setEditingStaffMember(member)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold transition-colors border border-blue-200 cursor-pointer shadow-2xs"
                          title="Edit staff member data, designation, pay scale, or status"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Staff ID Card Button */}
                        {onPrintCard && (
                          <button
                            onClick={() => onPrintCard(member.id)}
                            className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200"
                            title="Generate & Print Staff ID Card"
                          >
                            <IdCard className="w-4 h-4" />
                          </button>
                        )}

                        {/* View Full Profile */}
                        <button
                          onClick={() => onOpenProfile(member.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Staff Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Staff Modal */}
      {editingStaffMember && (
        <EditStaffModal
          staffMember={editingStaffMember}
          onClose={() => setEditingStaffMember(null)}
        />
      )}
    </div>
  );
};
