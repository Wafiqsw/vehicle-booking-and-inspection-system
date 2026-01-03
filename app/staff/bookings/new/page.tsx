'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, BookingForm, BookingFormData } from '@/components';
import { staffNavLinks } from '@/constant';
import { MdArrowBack } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAllDocuments, createDocument, getDocument } from '@/firebase/firestore';
import { Vehicle, Booking, User } from '@/types';
import { isVehicleAvailableForRange } from '@/libs/vehicleAvailabilityChecker';

const NewBooking = () => {
  const { user, loading } = useAuth({
    redirectTo: '/staff/auth',
    requiredRole: ['Staff', 'Receptionist', 'Admin']
  });

  const router = useRouter();
  const [formData, setFormData] = useState<BookingFormData>({
    vehicleId: '',
    bookingDate: '',
    returnDate: '',
    project: '',
    destination: '',
    passengers: 1,
  });

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch vehicles, bookings, and user profile
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setDataLoading(true);
        const [vehiclesData, bookingsData, userDoc] = await Promise.all([
          getAllDocuments('vehicles'),
          getAllDocuments('bookings'),
          getDocument('users', user.uid)
        ]);

        // Set user profile
        if (userDoc) {
          setUserProfile({
            id: userDoc.id || user.uid,
            email: userDoc.email || user.email || '',
            firstName: userDoc.firstName || '',
            lastName: userDoc.lastName || '',
            phoneNumber: userDoc.phoneNumber || '',
            role: userDoc.role || 'Staff',
            createdAt: userDoc.createdAt?.toDate ? userDoc.createdAt.toDate() : new Date(),
            updatedAt: userDoc.updatedAt?.toDate ? userDoc.updatedAt.toDate() : new Date(),
          });
        }

        // Map vehicles to Vehicle type
        setVehicles(vehiclesData.map((doc: any): Vehicle => ({
          id: doc.id,
          plateNumber: doc.plateNumber || '',
          brand: doc.brand || '',
          model: doc.model || '',
          year: doc.year || new Date().getFullYear(),
          type: doc.type || 'Pickup Truck',
          fuelType: doc.fuelType || 'Diesel',
          seatCapacity: doc.seatCapacity || 5,
          maintenanceStatus: doc.maintenanceStatus || false,
          createdAt: doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(),
          updatedAt: doc.updatedAt?.toDate ? doc.updatedAt.toDate() : new Date(),
        })));

        // Map bookings to Booking type
        const mappedBookings = bookingsData.map((doc: any): Booking => ({
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
          vehicle: doc.vehicle || { id: '', brand: '', model: '', plateNumber: '', type: '', fuelType: '', year: 0, seatCapacity: 0, maintenanceStatus: false },
          rejectionReason: doc.rejectionReason
        }));

        setBookings(mappedBookings);

      } catch (error: any) {
        console.error('Error fetching data:', error);
        alert('Error loading data: ' + error.message);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || !user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'passengers' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicleId || !formData.bookingDate || !formData.returnDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate dates
    const start = new Date(formData.bookingDate);
    const end = new Date(formData.returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      alert('Booking date cannot be in the past');
      return;
    }

    if (end < start) {
      alert('Return date must be after booking date');
      return;
    }

    // Check availability
    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    if (!selectedVehicle) {
      alert('Selected vehicle not found');
      return;
    }

    const isAvailable = isVehicleAvailableForRange(
      selectedVehicle,
      start,
      end,
      bookings
    );

    if (!isAvailable) {
      alert('Vehicle is not available for the selected dates. Please choose another vehicle or date range.');
      return;
    }

    // Validate passengers against vehicle capacity
    if (formData.passengers > selectedVehicle.seatCapacity) {
      alert(`Vehicle capacity is ${selectedVehicle.seatCapacity} passengers. Please reduce the number of passengers or choose a larger vehicle.`);
      return;
    }

    try {
      setIsLoading(true);

      // Create booking in Firestore
      await createDocument('bookings', {
        vehicle: selectedVehicle,
        bookingDate: start,
        returnDate: end,
        project: formData.project,
        destination: formData.destination,
        passengers: formData.passengers,
        bookingStatus: false, // Pending approval
        keyCollectionStatus: false,
        keyReturnStatus: false,
        bookedBy: {
          id: user.uid,
          firstName: userProfile?.firstName || '',
          lastName: userProfile?.lastName || '',
          email: user.email || '',
          phoneNumber: userProfile?.phoneNumber || '',
          role: userProfile?.role || 'Staff',
        },
        managedBy: null,
        approvedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      alert('Booking request submitted successfully! Your request is pending admin approval.');
      router.push('/staff/bookings');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      alert('Error creating booking: ' + error.message);
    } finally {
      setIsLoading(false);
    }
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
        {dataLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading available vehicles...</p>
          </div>
        ) : (
          <BookingForm
            formData={formData}
            onSubmit={handleSubmit}
            onChange={handleInputChange}
            vehicles={vehicles}
            bookings={bookings}
            isLoading={isLoading}
            submitLabel="Submit Booking Request"
            cancelHref="/staff/bookings"
          />
        )}

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Booking Process</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select your booking dates first to see available vehicles</li>
                <li>• Only vehicles available for your entire date range will be shown</li>
                <li>• Your booking request will be sent to the admin for approval</li>
                <li>• Ensure passenger count does not exceed vehicle capacity</li>
                <li>• Complete pre-trip and post-trip inspection forms once approved</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewBooking;
