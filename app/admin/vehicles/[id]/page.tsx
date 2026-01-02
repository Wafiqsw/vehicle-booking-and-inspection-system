'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar, VehicleForm, Chip } from '@/components';
import { adminNavLinks } from '@/constant';
import { MdArrowBack, MdEdit, MdClose } from 'react-icons/md';
import { FaCar } from 'react-icons/fa';

// Vehicle interface
interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  brand: string;
  year: number;
  type: string;
  status: 'Available' | 'In Use' | 'Maintenance';
  fuelType: string;
  capacity: number;
  manualMaintenanceMode?: boolean;
}

// Booking interface
interface Booking {
  id: string;
  plateNumber: string;
  staffName: string;
  project: string;
  bookingDate: string;
  returnDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

// Mock vehicles data
const mockVehicles: Vehicle[] = [
  {
    id: 'VH-001',
    plateNumber: 'ABC 1234',
    model: 'Hilux',
    brand: 'Toyota',
    year: 2022,
    type: 'Pickup Truck',
    status: 'Available',
    fuelType: 'Diesel',
    capacity: 5,
  },
  {
    id: 'VH-002',
    plateNumber: 'DEF 5678',
    model: 'Ranger',
    brand: 'Ford',
    year: 2023,
    type: 'Pickup Truck',
    status: 'Available',
    fuelType: 'Diesel',
    capacity: 5,
  },
  {
    id: 'VH-003',
    plateNumber: 'GHI 9012',
    model: 'Navara',
    brand: 'Nissan',
    year: 2021,
    type: 'Pickup Truck',
    status: 'Available',
    fuelType: 'Diesel',
    capacity: 5,
  },
  {
    id: 'VH-004',
    plateNumber: 'JKL 3456',
    model: 'D-Max',
    brand: 'Isuzu',
    year: 2022,
    type: 'Pickup Truck',
    status: 'Available',
    fuelType: 'Diesel',
    capacity: 5,
    manualMaintenanceMode: true,
  },
  {
    id: 'VH-005',
    plateNumber: 'MNO 7890',
    model: 'Triton',
    brand: 'Mitsubishi',
    year: 2023,
    type: 'Pickup Truck',
    status: 'Available',
    fuelType: 'Diesel',
    capacity: 5,
  },
];

// Mock bookings data
const mockBookings: Booking[] = [
  {
    id: 'BK-001',
    plateNumber: 'ABC 1234',
    staffName: 'Ahmad bin Abdullah',
    project: 'Highland Towers Construction',
    bookingDate: '2024-12-28',
    returnDate: '2025-01-05',
    status: 'Approved',
  },
  {
    id: 'BK-006',
    plateNumber: 'ABC 1234',
    staffName: 'Sarah binti Hassan',
    project: 'Kuala Lumpur Office Renovation',
    bookingDate: '2025-01-10',
    returnDate: '2025-01-15',
    status: 'Approved',
  },
  {
    id: 'BK-007',
    plateNumber: 'ABC 1234',
    staffName: 'Kumar Rajesh',
    project: 'Shah Alam Warehouse Setup',
    bookingDate: '2025-01-20',
    returnDate: '2025-01-25',
    status: 'Pending',
  },
  {
    id: 'BK-002',
    plateNumber: 'DEF 5678',
    staffName: 'Lee Wei Ming',
    project: 'Sunway Development Project',
    bookingDate: '2024-12-20',
    returnDate: '2024-12-30',
    status: 'Approved',
  },
  {
    id: 'BK-003',
    plateNumber: 'GHI 9012',
    staffName: 'Fatimah binti Yusof',
    project: 'Johor Bahru Mall Renovation',
    bookingDate: '2025-01-10',
    returnDate: '2025-01-15',
    status: 'Approved',
  },
];

const VehicleDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;

  const [showEditModal, setShowEditModal] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(
    mockVehicles.find((v) => v.id === vehicleId) || null
  );
  const [formData, setFormData] = useState<Partial<Vehicle>>(vehicle || {});

  if (!vehicle) {
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
    if (vehicle.manualMaintenanceMode) {
      return 'Maintenance';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeBooking = mockBookings.find((booking) => {
      if (booking.plateNumber !== vehicle.plateNumber || booking.status !== 'Approved') {
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

    return mockBookings
      .filter((booking) => {
        if (booking.plateNumber !== vehicle.plateNumber) {
          return false;
        }
        const bookingDate = new Date(booking.bookingDate);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= today;
      })
      .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
  };

  const handleEdit = () => {
    setFormData(vehicle);
    setShowEditModal(true);
  };

  const handleCancel = () => {
    setFormData(vehicle);
    setShowEditModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVehicle({ ...vehicle, ...formData } as Vehicle);
    setShowEditModal(false);
    alert('Vehicle updated successfully!');
  };

  const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'pending' | 'default' => {
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
                      <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 w-1/3">Capacity</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{vehicle.capacity} seats</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 w-1/3">Current Status</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <Chip variant={getStatusVariant(currentStatus)}>{currentStatus}</Chip>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600 bg-gray-50 w-1/3">Manual Maintenance Mode</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {vehicle.manualMaintenanceMode ? 'Enabled' : 'Disabled'}
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
                            <p className="text-sm text-gray-600 mt-1">{booking.staffName}</p>
                          </div>
                          <Chip variant={getStatusVariant(booking.status)}>{booking.status}</Chip>
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
                    {mockBookings.filter((b) => b.plateNumber === vehicle.plateNumber).length}
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
                  <span className="font-medium text-gray-900">Jan 1, 2024</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Last updated</span>
                  <span className="font-medium text-gray-900">Today</span>
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
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailsPage;
