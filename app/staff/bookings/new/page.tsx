'use client';

import React, { useState } from 'react';
import { Sidebar, BookingForm, BookingFormData } from '@/components';
import { staffNavLinks } from '@/constant';
import { MdArrowBack } from 'react-icons/md';
import { useRouter } from 'next/navigation';

const NewBooking = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<BookingFormData>({
    vehicleId: '',
    bookingDate: '',
    returnDate: '',
    project: '',
    destination: '',
    passengers: '',
    notes: '',
  });

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
    console.log('Form submitted:', formData);
    alert('Booking request submitted successfully!');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />

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
          <h1 className="text-3xl font-bold text-gray-900">New Booking Request</h1>
          <p className="text-gray-600 mt-2">Fill in the details to request a vehicle booking and inspection</p>
        </div>

        {/* Booking Form */}
        <BookingForm
          formData={formData}
          onSubmit={handleSubmit}
          onChange={handleInputChange}
          submitLabel="Submit Booking Request"
          cancelHref="/staff/bookings"
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
                <li>• Your booking request will be sent to the admin for approval</li>
                <li>• You will be notified once your request is approved or rejected</li>
                <li>• Please ensure all information is accurate before submitting</li>
                <li>• Remember to complete pre-trip and post-trip inspection forms</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewBooking;
