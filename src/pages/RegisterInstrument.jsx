import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function RegisterInstrument() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    instrument_number: '',
    instrument_type: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    capacity: '',
    capacity_unit: 'kg',
    accuracy_class: '',
    location: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdInstrumentNumber, setCreatedInstrumentNumber] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');

    if (
      !form.instrument_number ||
      !form.instrument_type ||
      !form.manufacturer ||
      !form.model ||
      !form.serial_number ||
      !form.capacity ||
      !form.accuracy_class ||
      !form.location
    ) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      const { data, error } = await supabase
        .from('instruments')
        .insert({
          instrument_number: form.instrument_number.trim(),
          instrument_type: form.instrument_type.trim(),
          manufacturer: form.manufacturer.trim(),
          model: form.model.trim(),
          serial_number: form.serial_number.trim(),
          capacity: Number(form.capacity),
          capacity_unit: form.capacity_unit,
          accuracy_class: form.accuracy_class.trim(),
          owner_id: user.id,
          location: form.location.trim(),
          registered_date: new Date().toISOString().split('T')[0],
          status: 'PENDING_VERIFICATION'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCreatedInstrumentNumber(data.instrument_number);
      setSuccess(true);

    } catch (error) {
      console.error('Instrument registration error:', error);

      if (error.code === '23505') {
        setErrorMessage(
          'Instrument number or serial number already exists.'
        );
      } else {
        setErrorMessage(
          error.message || 'Unable to register instrument.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutralSlate pb-16">

      {/* Header */}
      <div className="bg-navy-900 text-white border-b border-navy-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">

          <button
            onClick={() => navigate('/owner/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Register Measuring Instrument
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Register an instrument before applying for verification.
          </p>

        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Instrument Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Instrument Number *
              </label>

              <input
                type="text"
                name="instrument_number"
                value={form.instrument_number}
                onChange={handleChange}
                placeholder="Enter instrument registration number"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Instrument Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Instrument Type *
              </label>

              <input
                type="text"
                name="instrument_type"
                value={form.instrument_type}
                onChange={handleChange}
                placeholder="Example: Electronic Weighing Scale"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Manufacturer + Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Manufacturer *
                </label>

                <input
                  type="text"
                  name="manufacturer"
                  value={form.manufacturer}
                  onChange={handleChange}
                  placeholder="Manufacturer name"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Model *
                </label>

                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="Model number"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Serial Number *
              </label>

              <input
                type="text"
                name="serial_number"
                value={form.serial_number}
                onChange={handleChange}
                placeholder="Enter manufacturer's serial number"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Capacity *
                </label>

                <input
                  type="number"
                  min="0"
                  step="any"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="Enter capacity"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Capacity Unit *
                </label>

                <select
                  name="capacity_unit"
                  value={form.capacity_unit}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="mg">mg</option>
                  <option value="ton">ton</option>
                  <option value="L">L</option>
                  <option value="mL">mL</option>
                  <option value="m">m</option>
                  <option value="cm">cm</option>
                  <option value="mm">mm</option>
                  <option value="other">Other</option>
                </select>
              </div>

            </div>

            {/* Accuracy */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Accuracy Class *
              </label>

              <input
                type="text"
                name="accuracy_class"
                value={form.accuracy_class}
                onChange={handleChange}
                placeholder="Example: Class III"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Inspection / Premises Location *
              </label>

              <textarea
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter the location where the instrument is installed"
                rows="3"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                required
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-bold rounded-xl shadow-md"
              >
                <Save className="w-5 h-5" />

                {loading
                  ? 'Registering...'
                  : 'Register Instrument'}
              </button>

            </div>

          </form>

        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">

            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <h2 className="text-2xl font-black text-navy-900">
              Instrument Registered
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Your instrument has been successfully registered.
            </p>

            <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">
                Instrument Number
              </p>

              <p className="font-mono font-bold text-navy-900 mt-1">
                {createdInstrumentNumber}
              </p>
            </div>

            <button
              onClick={() => navigate('/owner/dashboard')}
              className="w-full mt-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl"
            >
              Back to Dashboard
            </button>

          </div>
        </div>
      )}

    </div>
  );
}