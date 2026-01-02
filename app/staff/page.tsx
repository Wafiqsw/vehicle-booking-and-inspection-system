'use client';

import React from 'react';
import { Sidebar, Chip } from '@/components';
import { staffNavLinks } from '@/constant';
import { FaCar } from 'react-icons/fa';
import { MdPending, MdCheckCircle, MdOutlineChecklist } from 'react-icons/md';
import { IoAlertCircleOutline } from 'react-icons/io5';
import Link from 'next/link';

const StaffDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your booking overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Bookings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaCar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">3</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <MdPending className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Approved Bookings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">9</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <MdCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/staff/bookings/new" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaCar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">New Booking</p>
                <p className="text-sm text-gray-600">Request a vehicle</p>
              </div>
            </Link>
            <Link href="/staff/bookings" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <MdCheckCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">View Bookings</p>
                <p className="text-sm text-gray-600">Check your requests</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Bookings and To-Do Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inspection To-Do List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col" style={{ maxHeight: '600px' }}>
            <div className="p-6 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <MdOutlineChecklist className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Inspection Forms To-Do</h2>
                <p className="text-xs text-gray-500">Based on your bookings</p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-3">
                {/* To-Do Item 1 */}
                <Link href="/staff/bookings/BK-004/inspection?type=pre" className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50/30 hover:bg-blue-100/50 hover:border-blue-300 transition-all cursor-pointer group">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">Submit Pre-Trip Inspection for Isuzu D-Max</p>
                    <p className="text-xs text-gray-600 mt-1">Booking Date: Jan 12, 2025 • Penang Bridge Maintenance</p>
                  </div>
                  <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* To-Do Item 2 */}
                <Link href="/staff/bookings/BK-001/inspection?type=post" className="flex items-center gap-3 p-3 border border-green-200 rounded-lg bg-green-50/30 hover:bg-green-100/50 hover:border-green-300 transition-all cursor-pointer group">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-green-700">Submit Post-Trip Inspection for Toyota Hilux</p>
                    <p className="text-xs text-gray-600 mt-1">Booking Date: Jan 5, 2025 • Highland Towers Construction</p>
                  </div>
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* To-Do Item 3 */}
                <Link href="/staff/bookings/BK-003/inspection?type=post" className="flex items-center gap-3 p-3 border border-green-200 rounded-lg bg-green-50/30 hover:bg-green-100/50 hover:border-green-300 transition-all cursor-pointer group">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-green-700">Submit Post-Trip Inspection for Nissan Navara</p>
                    <p className="text-xs text-gray-600 mt-1">Booking Date: Jan 10, 2025 • Johor Bahru Mall Renovation</p>
                  </div>
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <IoAlertCircleOutline className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  Complete inspection forms before and after each booking
                </p>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Toyota Hilux
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Jan 5, 2025
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Chip variant="success">Approved</Chip>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Highland Towers Construction
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Ford Ranger
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Jan 8, 2025
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Chip variant="pending">Pending</Chip>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Sunway Development Project
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Nissan Navara
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Jan 10, 2025
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Chip variant="success">Approved</Chip>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Johor Bahru Mall Renovation
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;