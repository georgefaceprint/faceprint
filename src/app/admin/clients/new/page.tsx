import { createClient } from './actions';
import Link from 'next/link';

export default function NewClientPage() {
  const provinces = [
    'Gauteng',
    'Western Cape',
    'KwaZulu-Natal',
    'Eastern Cape',
    'Free State',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex items-center space-x-4">
        <Link href="/admin/clients" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Clients
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-white">Register a Client</h2>
        <p className="text-gray-400 mt-1">Add a new customer to the database. All fields marked with an asterisk (*) are required.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl">
        <form action={createClient} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Customer / Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                required
                placeholder="e.g. Acme Corp"
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Contact Person Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactName"
                required
                placeholder="e.g. John Doe"
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="client@example.com"
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Cell / Office Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="e.g. 082 123 4567"
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Province <span className="text-red-500">*</span>
              </label>
              <select
                name="state"
                required
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
              >
                <option value="">Select Province...</option>
                {provinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Town / City
              </label>
              <input
                type="text"
                name="city"
                placeholder="e.g. Johannesburg"
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="addressLine1"
                required
                placeholder="e.g. 123 Business Park, Main Road"
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-[rgba(255,255,255,0.05)]">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2"
            >
              REGISTER
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
