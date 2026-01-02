'use client';

import { Sidebar, Chip } from '@/components';
import { receptionistNavLinks } from '@/constant';
import { FaKey } from 'react-icons/fa';
import { MdRemoveRedEye, MdCheckCircle } from 'react-icons/md';
import { IoAlertCircleOutline } from 'react-icons/io5';
import Link from 'next/link';

const ReceptionistDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Receptionist Dashboard" navLinks={receptionistNavLinks} accountHref="/receptionist/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your key management overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Bookings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Keys Not Collected */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Keys Not Collected</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">2</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Keys Out */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Keys Out</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">2</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Keys Returned */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Keys Returned</p>
                <p className="text-3xl font-bold text-green-600 mt-2">1</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/receptionist/bookings" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaKey className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Manage Bookings</p>
                <p className="text-sm text-gray-600">Handle key collection & return</p>
              </div>
            </Link>
            <Link href="/receptionist/history" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <MdCheckCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Booking History</p>
                <p className="text-sm text-gray-600">View past bookings</p>
              </div>
            </Link>
          </div>
        </div>

        {/* To-Do Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Collection Date */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col" style={{ maxHeight: '600px' }}>
            <div className="p-6 border-b border-gray-200 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Key Collection Date</h2>
                <p className="text-xs text-gray-500">Upcoming key collections</p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-3">
                {/* Collection Item 1 */}
                <Link href="/receptionist/bookings" className="flex items-center gap-3 p-3 border border-yellow-200 rounded-lg bg-yellow-50/30 hover:bg-yellow-100/50 hover:border-yellow-300 transition-all cursor-pointer group">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-yellow-700">Ahmad Zaki - Toyota Hilux (ABC 1234)</p>
                    <p className="text-xs text-gray-600 mt-1">Collection Date: Jan 5, 2025 • Highland Towers Construction</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Chip variant="success">Pre-Inspection: Submitted</Chip>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-yellow-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Collection Item 2 */}
                <Link href="/receptionist/bookings" className="flex items-center gap-3 p-3 border border-yellow-200 rounded-lg bg-yellow-50/30 hover:bg-yellow-100/50 hover:border-yellow-300 transition-all cursor-pointer group">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-yellow-700">Fatimah Zahra - Isuzu D-Max (JKL 3456)</p>
                    <p className="text-xs text-gray-600 mt-1">Collection Date: Jan 12, 2025 • Penang Bridge Maintenance</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Chip variant="error">Pre-Inspection: Not Submitted</Chip>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-yellow-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <IoAlertCircleOutline className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  Only hand out keys for bookings with completed pre-trip inspection forms
                </p>
              </div>
            </div>
          </div>

          {/* Key Return Date */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col" style={{ maxHeight: '600px' }}>
            <div className="p-6 border-b border-gray-200 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaKey className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Key Return Date</h2>
                <p className="text-xs text-gray-500">Expected key returns</p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-3">
                {/* Return Item 1 */}
                <Link href="/receptionist/booking" className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50/30 hover:bg-blue-100/50 hover:border-blue-300 transition-all cursor-pointer group">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">Sarah Lee - Ford Ranger (DEF 5678)</p>
                    <p className="text-xs text-gray-600 mt-1">Return Date: Jan 9, 2025 • Sunway Development Project</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Chip variant="error">Post-Inspection: Not Submitted</Chip>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Return Item 2 */}
                <Link href="/receptionist/booking" className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50/30 hover:bg-blue-100/50 hover:border-blue-300 transition-all cursor-pointer group">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">David Tan - Mitsubishi Triton (MNO 7890)</p>
                    <p className="text-xs text-gray-600 mt-1">Return Date: Jan 16, 2025 • Melaka Heritage Site Restoration</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Chip variant="error">Post-Inspection: Not Submitted</Chip>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <IoAlertCircleOutline className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  Verify post-trip inspection forms are completed before accepting key returns
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* New Inspection Forms */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <MdRemoveRedEye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recently Submitted Inspection Forms</h2>
              <p className="text-xs text-gray-500">New forms received</p>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {/* Form Notification 1 */}
              <div className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50/30">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Pre-Trip Inspection - Ahmad Zaki</p>
                  <p className="text-xs text-gray-600 mt-1">Toyota Hilux (ABC 1234) • Submitted 2 hours ago</p>
                </div>
                <Link
                  href="/receptionist/bookings/BK-001/inspection?type=pre"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium text-xs transition-colors"
                >
                  <MdRemoveRedEye className="w-3 h-3" />
                  View Form
                </Link>
              </div>

              {/* Form Notification 2 */}
              <div className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50/30">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Post-Trip Inspection - Kumar Rajan</p>
                  <p className="text-xs text-gray-600 mt-1">Nissan Navara (GHI 9012) • Submitted 5 hours ago</p>
                </div>
                <Link
                  href="/receptionist/bookings/BK-003/inspection?type=post"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium text-xs transition-colors"
                >
                  <MdRemoveRedEye className="w-3 h-3" />
                  View Form
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReceptionistDashboard;
