import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { 
  Plus, 
  Scale, 
  Eye, 
  FileCheck2, 
  AlertCircle, 
  Clock, 
  Layers,
  ArrowRight,
  Building2
} from 'lucide-react';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { owner, instrument, applications } = useAppStore();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutralSlate pb-16">
      {/* Navy Header */}
      <div className="bg-navy-900 text-white border-b border-navy-800 py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Owner Portal • ABC Traders (ID: {owner.id})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Good morning, {owner.name}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Registered Establishment: ABC Traders • Location: Hyderabad, Telangana
            </p>
          </div>

          {/* Green Primary Action Button */}
          <Link
            to="/owner/apply"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all transform active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>+ Apply for Verification</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Four Summary Cards in Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Instruments"
            value={owner.total}
            subtitle="Registered"
            borderColor="blue"
            icon={Layers}
          />
          <MetricCard
            title="Verified"
            value={owner.verified}
            subtitle="Compliant"
            borderColor="green"
            icon={FileCheck2}
          />
          <MetricCard
            title="Expiring Soon"
            value={owner.expiringsSoon}
            subtitle="< 30 days"
            borderColor="amber"
            icon={AlertCircle}
          />
          <MetricCard
            title="Pending Applications"
            value={owner.pendingApps}
            subtitle="In Review"
            borderColor="purple"
            icon={Clock}
          />
        </div>

        {/* Instruments Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <span>Registered Instruments</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official weighing and measuring devices under Legal Metrology Act, 2009
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full w-fit">
              Showing active inventory (1 of {owner.total})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">ID</th>
                  <th scope="col" className="px-6 py-4">Type</th>
                  <th scope="col" className="px-6 py-4">Model & Capacity</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-navy-900 text-xs">
                    {instrument.id}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <div>{instrument.type}</div>
                    <div className="text-xs text-slate-400">Mfg: {instrument.manufacturer}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="font-semibold text-slate-800">{instrument.model}</span>
                    <span className="text-slate-400"> • {instrument.capacity} (Class {instrument.accuracyClass})</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={instrument.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/owner/instrument/${instrument.id}`)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold transition-all shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Applications Status Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span>Verification Applications</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track real-time status of verification applications filed with the department
              </p>
            </div>
            <Link 
              to="/owner/apply"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>+ New Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Application ID</th>
                  <th scope="col" className="px-6 py-4">Instrument ID</th>
                  <th scope="col" className="px-6 py-4">Type</th>
                  <th scope="col" className="px-6 py-4">Preferred Date</th>
                  <th scope="col" className="px-6 py-4">Assigned LMO</th>
                  <th scope="col" className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-navy-900 text-xs">
                      {app.id}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {app.instrumentId}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      {app.verifyType}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {app.preferredDate}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {app.lmoAssigned ? (
                        <span className="font-semibold text-blue-600">{app.lmoAssigned}</span>
                      ) : (
                        <span className="text-slate-400 italic">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
