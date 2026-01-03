'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, BookingForm, BookingFormData } from '@/components';
import { staffNavLinks } from '@/constant';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDocument, getAllDocuments, updateDocument } from '@/firebase/firestore';
import { Booking, Vehicle } from '@/types';

const EditBooking = () => {
  const { user, loading: authLoading } = useAuth({
    redirectTo: '/staff/auth',
    requiredRole: ['Staff', 'Admin', 'Receptionist']
  });

  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    vehicleId: '',
    bookingDate: '',
    returnDate: '',
    project: '',
    destination: '',
    passengers: 0,
  });

  // Fetch booking and related data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setDataLoading(true);

        // Fetch booking, vehicles, and all bookings in parallel
        const [bookingDoc, vehiclesData, bookingsData] = await Promise.all([
          getDocument('bookings', bookingId),
          getAllDocuments('vehicles'),
          getAllDocuments('bookings')
        ]);

        if (!bookingDoc) {
          setError('Booking not found');
          return;
        }

        // Map booking to Booking type
        const typedBooking: Booking = {
          id: bookingDoc.id,
          project: bookingDoc.project || '',
          destination: bookingDoc.destination || '',
          passengers: bookingDoc.passengers || 0,
          bookingStatus: bookingDoc.bookingStatus || false,
          keyCollectionStatus: bookingDoc.keyCollectionStatus || false,
          keyReturnStatus: bookingDoc.keyReturnStatus || false,
          bookingDate: bookingDoc.bookingDate?.toDate ? bookingDoc.bookingDate.toDate() : new Date(bookingDoc.bookingDate),
          returnDate: bookingDoc.returnDate?.toDate ? bookingDoc.returnDate.toDate() : new Date(bookingDoc.returnDate),
          createdAt: bookingDoc.createdAt?.toDate ? bookingDoc.createdAt.toDate() : new Date(),
          updatedAt: bookingDoc.updatedAt?.toDate ? bookingDoc.updatedAt.toDate() : new Date(),
          managedBy: bookingDoc.managedBy || null,
          approvedBy: bookingDoc.approvedBy || null,
          bookedBy: bookingDoc.bookedBy || null,
          vehicle: bookingDoc.vehicle || null,
          rejectionReason: bookingDoc.rejectionReason
        };

        setBooking(typedBooking);

        // Set form data
        setFormData({
          vehicleId: typedBooking.vehicle?.id || '',
          bookingDate: typedBooking.bookingDate.toISOString().split('T')[0],
          returnDate: typedBooking.returnDate.toISOString().split('T')[0],
          project: typedBooking.project,
          destination: typedBooking.destination,
          passengers: typedBooking.passengers,
        });

        // Map vehicles to Vehicle type
        const mappedVehicles = vehiclesData.map((doc: any): Vehicle => ({
          id: doc.id,
          plateNumber: doc.plateNumber || '',
          brand: doc.brand || '',
          model: doc.model || '',
          year: doc.year || 0,
          type: doc.type || '',
          fuelType: doc.fuelType || 'Diesel',
          seatCapacity: doc.seatCapacity || 5,
          maintenanceStatus: doc.maintenanceStatus || false,
          createdAt: doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(),
          updatedAt: doc.updatedAt?.toDate ? doc.updatedAt.toDate() : new Date(),
        }));

        setVehicles(mappedVehicles);

        // Map bookings to Booking type (excluding current booking for availability check)
        const mappedBookings = bookingsData
          .filter((doc: any) => doc.id !== bookingId) // Exclude current booking
          .map((doc: any): Booking => ({
            id: doc.id,
            project: doc.project || '',
            destination: doc.destination || '',
            passengers: doc.passengers || 0,
            bookingStatus: doc.bookingStatus || false,
            keyCollectionStatus: doc.keyCollectionStatus || false,
            keyReturnStatus: doc.keyReturnStatus || false,
            bookingDate: doc.bookingDate?.toDate ? doc.bookingDate.toDate() : new Date(doc.bookingDate),
            returnDate: doc.returnDate?.toDate ? doc.returnDate.toDate() : new Date(doc.returnDate),
            createdAt: doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(),
            updatedAt: doc.updatedAt?.toDate ? doc.updatedAt.toDate() : new Date(),
            managedBy: doc.managedBy || null,
            approvedBy: doc.approvedBy || null,
            bookedBy: doc.bookedBy || null,
            vehicle: doc.vehicle || null,
            rejectionReason: doc.rejectionReason
          }));

        setBookings(mappedBookings);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError('Error loading data: ' + error.message);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user, bookingId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'passengers' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!booking || !user) return;

    try {
      setIsSubmitting(true);

      // Find selected vehicle
      const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
      if (!selectedVehicle) {
        alert('Please select a valid vehicle');
        return;
      }

      // Validate passenger capacity
      if (formData.passengers > selectedVehicle.seatCapacity) {
        alert(`Vehicle capacity is ${selectedVehicle.seatCapacity} passengers. You entered ${formData.passengers} passengers.`);
        return;
      }

      // Update booking in Firestore
      await updateDocument('bookings', bookingId, {
        vehicle: selectedVehicle,
        bookingDate: new Date(formData.bookingDate),
        returnDate: new Date(formData.returnDate),
        project: formData.project,
        destination: formData.destination,
        passengers: formData.passengers,
      });

      alert('Booking updated successfully!');
      router.push(`/staff/bookings/${bookingId}`);
    } catch (error: any) {
      console.error('Error updating booking:', error);
      alert('Error updating booking: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) return null;

  // Check if booking can be edited - only allow before admin approval or rejection
  const canEdit = booking && !booking.bookingStatus && !booking.rejectionReason;

  // Show loading state
  if (dataLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />
        <main className="flex-1 p-8">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Loading booking details...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show error if booking not found
  if (error || !booking) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Booking Not Found</h1>
            <p className="text-gray-600 mt-2">{error || "The booking you're trying to edit doesn't exist."}</p>
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

  // Show message if booking cannot be edited
  if (!canEdit) {
    const getMessage = () => {
      if (booking.rejectionReason) {
        return 'This booking has been rejected by admin and cannot be edited. Please create a new booking instead.';
      }
      if (booking.bookingStatus) {
        return 'This booking has been approved by admin and cannot be edited anymore.';
      }
      return 'This booking cannot be edited at this time.';
    };

    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Staff Dashboard" navLinks={staffNavLinks} accountHref="/staff/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Cannot Edit Booking</h1>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">{getMessage()}</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Booking</h1>
          <p className="text-gray-600 mt-2">Update your vehicle booking details (Booking ID: {bookingId})</p>
        </div>

        {/* Booking Form */}
        <BookingForm
          formData={formData}
          onSubmit={handleSubmit}
          onChange={handleInputChange}
          vehicles={vehicles}
          bookings={bookings}
          isLoading={isSubmitting}
          submitLabel="Update Booking"
          cancelHref={`/staff/bookings/${bookingId}`}
        />

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Important Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You can only edit this booking while it has "Pending" status</li>
                <li>• Once admin approves or rejects the booking, you cannot edit it anymore</li>
                <li>• Changes to your booking will remain pending until admin reviews it</li>
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
