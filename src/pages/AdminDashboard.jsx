import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import StatusBadge from '../components/StatusBadge';
import { 
  ShieldCheck, 
  UserCheck, 
  Check, 
  X, 
  CheckCircle2 
} from 'lucide-react';

export default function AdminDashboard() {
  const { applications, instrument, lmos, assignLMO } = useAppStore();
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignedSuccessToast, setAssignedSuccessToast] = useState(null);

  const lmoOfficer = lmos[0] || {
    id: "LMO-027",
    name: "Rajesh Sharma",
    specialization: ["Weighing Instruments"],
    distance: "4.2 km",
    workload: 6,
    authorized: true
  };

  const handleOpenAssignModal = (appId) => {
    setSelectedAppId(appId);
    setShowAssignModal(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedAppId) return;
    assignLMO(selectedAppId, lmoOfficer.id);
    setShowAssignModal(false);
    setAssignedSuccessToast(`Officer ${lmoOfficer.id} (${lmoOfficer.name}) assigned successfully to ${selectedAppId}!`);
    setTimeout(() => setAssignedSuccessToast(null), 4000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutralSlate pb-16">
      {/* Navy Header */}
      <div className="bg-navy-900 text-white border-b border-navy-800 py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Department Administration Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Applications Management
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Verify, route, and assign field officers for on-site weighing & measuring instrument verification
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-navy-800 text-slate-300 border border-navy-700 px-3 py-1.5 rounded-lg">
              Jurisdiction: <strong>Telangana Zone-1</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Success Alert Toast */}
        {assignedSuccessToast && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{assignedSuccessToast}</span>
          </div>
        )}

        {/* White Card with Table of Pending Applications */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-navy-900">
                Active Verification Requests
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review incoming verification petitions and dispatch qualified Legal Metrology Officers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {applications.length} Total Applications
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Application</th>
                  <th scope="col" className="px-6 py-4">Instrument</th>
                  <th scope="col" className="px-6 py-4">Owner</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-navy-900 text-xs">{app.id}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Type: {app.verifyType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-bold text-slate-800">{app.instrumentId}</div>
                      <div className="text-[11px] text-slate-500">{instrument.type}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-semibold text-navy-900">ABC Traders</div>
                      <div className="text-slate-400">{instrument.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                      {app.lmoAssigned && (
                        <div className="text-[11px] font-semibold text-blue-600 mt-1">
                          Officer: {app.lmoAssigned}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'PENDING_ASSIGNMENT' || app.status === 'PENDING' ? (
                        <button
                          onClick={() => handleOpenAssignModal(app.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accentBlue hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-sm transform active:scale-95"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assign</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenAssignModal(app.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-all"
                        >
                          <span>Re-assign</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign LMO Officer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-navy-900">
                  Assign Legal Metrology Officer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target Application: <span className="font-mono font-bold text-navy-900">{selectedAppId}</span>
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recommended LMO Card */}
            <div className="mt-5 space-y-4">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>AI Algorithmic Dispatch: Best Officer Match Recommended</span>
              </div>

              <div className="bg-slate-50 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-navy-900 text-emerald-400 flex items-center justify-center font-black text-sm shadow-md">
                      {lmoOfficer.id}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-navy-900 text-base">
                        {lmoOfficer.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Senior Legal Metrology Inspector
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Recommended
                  </span>
                </div>

                {/* Qualification Checkmarks */}
                <div className="space-y-1.5 text-xs text-slate-700 my-4 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Authorized for this instrument type ({instrument.type})</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Available nearby within inspection radius</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Low current workload capacity score</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                      Distance to Site
                    </span>
                    <span className="text-lg font-black text-navy-900">{lmoOfficer.distance}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                      Current Workload
                    </span>
                    <span className="text-lg font-black text-navy-900">{lmoOfficer.workload} inspections</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              {/* Assign Officer Button (Green) */}
              <button
                type="button"
                onClick={handleConfirmAssign}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all transform active:scale-95"
              >
                Assign Officer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
