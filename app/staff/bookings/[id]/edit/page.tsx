'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, BookingForm, BookingFormData } from '@/components';
import { staffNavLinks } from '@/constant';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Mock booking data
const bookingData: { [key: string]: any } = {
  'BK-001': {
    id: 'BK-001',
    vehicleId: 'VH-001',
    vehicle: 'Toyota Hilux',
    plateNumber: 'ABC 1234',
    bookingDate: '2025-01-05',
    returnDate: '2025-01-06',
    project: 'Highland Towers Construction',
    purpose: 'Site Visit',
    destination: 'Kuala Lumpur',
    passengers: 3,
    status: 'Approved',
    notes: 'Need vehicle for client site visit and equipment delivery.',
    keyCollectionStatus: 'Not Collected',
  },
  'BK-002': {
    id: 'BK-002',
    vehicleId: 'VH-002',
    vehicle: 'Ford Ranger',
    plateNumber: 'DEF 5678',
    bookingDate: '2025-01-08',
    returnDate: '2025-01-09',
    project: 'Sunway Development Project',
    purpose: 'Client Meeting',
    destination: 'Selangor',
    passengers: 2,
    status: 'Pending',
    notes: 'Meeting with potential client to discuss new project.',
    keyCollectionStatus: 'Not Collected',
  },
  'BK-003': {
    id: 'BK-003',
    vehicleId: 'VH-003',
    vehicle: 'Nissan Navara',
    plateNumber: 'GHI 9012',
    bookingDate: '2025-01-10',
    returnDate: '2025-01-11',
    project: 'Johor Bahru Mall Renovation',
    purpose: 'Material Delivery',
    destination: 'Johor',
    passengers: 2,
    status: 'Approved',
    notes: 'Delivery of construction materials to site.',
    keyCollectionStatus: 'Ready to Collect',
  },
  'BK-004': {
    id: 'BK-004',
    vehicleId: 'VH-004',
    vehicle: 'Isuzu D-Max',
    plateNumber: 'JKL 3456',
    bookingDate: '2025-01-12',
    returnDate: '2025-01-13',
    project: 'Penang Bridge Maintenance',
    purpose: 'Site Inspection',
    destination: 'Penang',
    passengers: 4,
    status: 'Approved',
    notes: 'Routine site inspection and safety audit.',
    keyCollectionStatus: 'Not Collected',
  },
  'BK-005': {
    id: 'BK-005',
    vehicleId: 'VH-005',
    vehicle: 'Mitsubishi Triton',
    plateNumber: 'MNO 7890',
    bookingDate: '2025-01-15',
    returnDate: '2025-01-16',
    project: 'Melaka Heritage Site Restoration',
    purpose: 'Equipment Transport',
    destination: 'Melaka',
    passengers: 1,
    status: 'Pending',
    notes: 'Transport heavy equipment to new site location.',
    keyCollectionStatus: 'Not Collected',
  }
};

const EditBooking = () => {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const booking = bookingData[bookingId];

  const [formData, setFormData] = useState<BookingFormData>({
    vehicleId: '',
    bookingDate: '',
    returnDate: '',
    project: '',
    destination: '',
    passengers: '',
    notes: '',
  });

  // Check if booking can be edited - only allow before admin approval
  const canEdit = booking?.status === 'Pending';

  useEffect(() => {
    if (booking) {
      setFormData({
        vehicleId: booking.vehicleId,
        bookingDate: booking.bookingDate,
        returnDate: booking.returnDate,
        project: booking.project,
        destination: booking.destination,
        passengers: booking.passengers.toString(),
        notes: booking.notes || '',
      });
    }
  }, [booking]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form updated:', formData);
    alert('Booking updated successfully!');
    router.push(`/staff/bookings/${bookingId}`);
  };

  if (!booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Booking Not Found</h1>
            <p className="text-gray-600 mt-2">The booking you're trying to edit doesn't exist.</p>
            <Link
              href="/staff/bookings"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Bookings
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Cannot Edit Booking</h1>
            <p className="text-gray-600 mt-2">This booking cannot be edited because it has already been approved or rejected by admin.</p>
            <Link
              href={`/staff/bookings/${bookingId}`}
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Booking Details
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <MdArrowBack className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Booking</h1>
          <p className="text-gray-600 mt-2">Update your vehicle booking and inspection details (Booking ID: {bookingId})</p>
        </div>

        {/* Booking Form */}
        <BookingForm
          formData={formData}
          onSubmit={handleSubmit}
          onChange={handleInputChange}
          submitLabel="Update Booking"
          cancelHref={`/staff/bookings/${bookingId}`}
        />

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Important Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You can only edit this booking while it has "Pending" status</li>
                <li>• Once admin approves or rejects the booking, you cannot edit it anymore</li>
                <li>• Changes to your booking will be sent to admin for review again</li>
                <li>• Please ensure all information is accurate before updating</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditBooking;
