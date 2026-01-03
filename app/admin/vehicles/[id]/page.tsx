'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar, VehicleForm, Chip } from '@/components';
import { adminNavLinks } from '@/constant';
import { MdArrowBack, MdEdit, MdClose } from 'react-icons/md';
import { FaCar } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { getDocument, updateDocument, getAllDocuments } from '@/firebase/firestore';
import { Vehicle } from '@/types';
import { Booking } from '@/types/booking.type';
import { VehicleFormData } from '@/components/VehicleForm';



const VehicleDetailsPage = () => {
  const { user, loading } = useAuth({
    redirectTo: '/admin/auth',
    requiredRole: 'Admin'
  });

  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;

  const [showEditModal, setShowEditModal] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formData, setFormData] = useState<Partial<VehicleFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicle and bookings from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setDataLoading(true);
        setError(null);

        const [vehicleData, bookingsData] = await Promise.all([
          getDocument('vehicles', vehicleId),
          getAllDocuments('bookings')
        ]);

        if (!vehicleData) {
          setError('Vehicle not found');
          return;
        }

        const vehicleObj: Vehicle = {
          id: vehicleData.id,
          plateNumber: vehicleData.plateNumber || '',
          brand: vehicleData.brand || '',
          model: vehicleData.model || '',
          year: vehicleData.year || new Date().getFullYear(),
          type: vehicleData.type || 'Pickup Truck',
          fuelType: vehicleData.fuelType || 'Diesel',
          seatCapacity: vehicleData.seatCapacity || 5,
          maintenanceStatus: vehicleData.maintenanceStatus || false,
          createdAt: vehicleData.createdAt,
          updatedAt: vehicleData.updatedAt,
        };

        const bookingsList: Booking[] = bookingsData.map((doc: any) => ({
          id: doc.id,
          project: doc.project || '',
          destination: doc.destination || '',
          passengers: doc.passengers || 0,
          bookingStatus: doc.bookingStatus || false,
          keyCollectionStatus: doc.keyCollectionStatus || false,
          keyReturnStatus: doc.keyReturnStatus || false,
          bookingDate: doc.bookingDate?.toDate ? doc.bookingDate.toDate() : new Date(doc.bookingDate),
          returnDate: doc.returnDate?.toDate ? doc.returnDate.toDate() : new Date(doc.returnDate),
          createdAt: doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(doc.createdAt),
          updatedAt: doc.updatedAt?.toDate ? doc.updatedAt.toDate() : new Date(doc.updatedAt),
          managedBy: doc.managedBy || null,
          approvedBy: doc.approvedBy || null,
          bookedBy: doc.bookedBy || null,
          vehicle: doc.vehicle || null,
          rejectionReason: doc.rejectionReason || undefined,
        }));

        setVehicle(vehicleObj);
        setBookings(bookingsList);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user, vehicleId]);

  if (loading || !user) return null;

  if (dataLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />
        <main className="flex-1 p-8">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Loading vehicle details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />
        <main className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Not Found</h1>
            <p className="text-gray-600 mt-2">The vehicle you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/admin/vehicles')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Vehicles
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Get vehicle status based on bookings
  const getVehicleStatus = (): 'Available' | 'In Use' | 'Maintenance' => {
    if (vehicle.maintenanceStatus) {
      return 'Maintenance';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeBooking = bookings.find((booking) => {
      // Check if booking is for this vehicle and is approved
      if (booking.vehicle?.id !== vehicle.id || !booking.bookingStatus) {
        return false;
      }

      const bookingDate = new Date(booking.bookingDate);
      const returnDate = new Date(booking.returnDate);
      bookingDate.setHours(0, 0, 0, 0);
      returnDate.setHours(0, 0, 0, 0);

      return today >= bookingDate && today <= returnDate;
    });

    return activeBooking ? 'In Use' : 'Available';
  };

  // Get upcoming bookings for this vehicle
  const getUpcomingBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings
      .filter((booking) => {
        if (booking.vehicle?.id !== vehicle.id) {
          return false;
        }
        const bookingDate = new Date(booking.bookingDate);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= today;
      })
      .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
  };

  const handleEdit = () => {
    // Map Vehicle to VehicleFormData
    setFormData({
      plateNumber: vehicle.plateNumber,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      fuelType: vehicle.fuelType,
      seatCapacity: vehicle.seatCapacity,
      maintenanceStatus: vehicle.maintenanceStatus,
    });
    setShowEditModal(true);
  };

  const handleCancel = () => {
    setFormData(vehicle);
    setShowEditModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Update in Firestore
      await updateDocument('vehicles', vehicle.id, {
        plateNumber: formData.plateNumber,
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        type: formData.type,
        fuelType: formData.fuelType,
        seatCapacity: formData.seatCapacity,
        maintenanceStatus: formData.maintenanceStatus,
      });

      // Update local state
      setVehicle({ ...vehicle, ...formData } as Vehicle);
      setShowEditModal(false);
      alert('Vehicle updated successfully!');
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      alert('Error updating vehicle: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string | boolean): 'success' | 'info' | 'warning' | 'pending' | 'default' => {
    if (typeof status === 'boolean') {
      return status ? 'success' : 'pending';
    }
    switch (status) {
      case 'Available':
        return 'success';
      case 'In Use':
        return 'info';
      case 'Maintenance':
        return 'warning';
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'pending';
      case 'Rejected':
        return 'warning';
      default:
        return 'default';
    }
  };

  const currentStatus = getVehicleStatus();
  const upcomingBookings = getUpcomingBookings();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <MdArrowBack className="w-5 h-5" />
            Back to Vehicles
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-gray-600 mt-2">{vehicle.plateNumber}</p>
            </div>
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <MdEdit className="w-5 h-5" />
              Edit Vehicle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Vehicle Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Vehicle Information</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 w-1/3">Vehicle ID</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{vehicle.id}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 w-1/3">Plate Number</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{vehicle.plateNumber}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 w-1/3">Brand</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{vehicle.brand}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 w-1/3">Model</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{vehicle.model}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 w-1/3">Year</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{vehicle.year}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 w-1/3">Type</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{vehicle.type}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 w-1/3">Fuel Type</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{vehicle.fuelType}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 w-1/3">Seat Capacity</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{vehicle.seatCapacity} seats</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 w-1/3">Current Status</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <Chip variant={getStatusVariant(currentStatus)}>{currentStatus}</Chip>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 w-1/3">Maintenance Mode</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {vehicle.maintenanceStatus ? 'Enabled' : 'Disabled'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
              </div>
              <div className="p-6">
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No upcoming bookings for this vehicle</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{booking.project}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {booking.bookedBy?.firstName} {booking.bookedBy?.lastName}
                            </p>
                          </div>
                          <Chip variant={getStatusVariant(booking.bookingStatus ? 'Approved' : booking.rejectionReason ? 'Rejected' : 'Pending')}>
                            {booking.bookingStatus ? 'Approved' : booking.rejectionReason ? 'Rejected' : 'Pending'}
                          </Chip>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Booking Date</p>
                            <p className="font-medium text-gray-900">
                              {new Date(booking.bookingDate).toLocaleDateString('en-MY', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Return Date</p>
                            <p className="font-medium text-gray-900">
                              {new Date(booking.returnDate).toLocaleDateString('en-MY', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">Booking ID: {booking.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {bookings.filter((b) => b.vehicle?.id === vehicle.id).length}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Upcoming Bookings</p>
                  <p className="text-2xl font-bold text-green-900">{upcomingBookings.length}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 mb-1">Vehicle ID</p>
                  <p className="text-lg font-bold text-purple-900">{vehicle.id}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Vehicle Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Added on</span>
                  <span className="font-medium text-gray-900">
                    {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Last updated</span>
                  <span className="font-medium text-gray-900">
                    {vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Status</span>
                  <Chip variant={getStatusVariant(currentStatus)}>{currentStatus}</Chip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Edit Vehicle</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            <VehicleForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              mode="edit"
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailsPage;
