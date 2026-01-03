'use client';

import { useState, useEffect } from 'react';
import { Sidebar, Chip, VehicleForm, VehicleFormData } from '@/components';
import { adminNavLinks } from '@/constant';
import { FaPlus, FaEdit, FaTrash, FaCar, FaSearch, FaEye } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getAllDocuments, createDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { Vehicle } from '@/types';
import { Booking } from '@/types/booking.type';
import { isVehicleAvailable } from '@/libs/vehicleAvailabilityChecker';



const ManageVehicles = () => {
  const { user, loading } = useAuth({
    redirectTo: '/admin/auth',
    requiredRole: 'Admin'
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<Partial<VehicleFormData>>({
    plateNumber: '',
    model: '',
    brand: '',
    year: new Date().getFullYear(),
    type: 'Pickup Truck',
    fuelType: 'Diesel',
    seatCapacity: 5,
    maintenanceStatus: false,
  });

  // Fetch vehicles and bookings from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setDataLoading(true);
        const [vehiclesData, bookingsData] = await Promise.all([
          getAllDocuments('vehicles'),
          getAllDocuments('bookings')
        ]);

        const vehiclesList: Vehicle[] = vehiclesData.map((doc: any) => ({
          id: doc.id,
          plateNumber: doc.plateNumber || '',
          brand: doc.brand || '',
          model: doc.model || '',
          year: doc.year || new Date().getFullYear(),
          type: doc.type || 'Pickup Truck',
          fuelType: doc.fuelType || 'Diesel',
          seatCapacity: doc.seatCapacity || 5,
          maintenanceStatus: doc.maintenanceStatus || false,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        }));

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

        setVehicles(vehiclesList);
        setBookings(bookingsList);
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

  // Calculate vehicle status based on bookings and current date
  const getVehicleStatus = (vehicle: Vehicle): 'Available' | 'In Use' | 'Maintenance' => {
    // If manually set to maintenance, keep it in maintenance
    if (vehicle.maintenanceStatus) {
      return 'Maintenance';
    }

    // Use the availability checker to determine if vehicle is available today
    const today = new Date();
    const available = isVehicleAvailable(vehicle, today, bookings);

    return available ? 'Available' : 'In Use';
  };

  // Get next booking date for a vehicle
  const getNextBooking = (vehicle: Vehicle): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the nearest future booking
    const futureBookings = bookings
      .filter((booking) => {
        // Check if booking is for this vehicle and is approved
        if (booking.vehicle?.id !== vehicle.id || !booking.bookingStatus) {
          return false;
        }
        const bookingDate = new Date(booking.bookingDate);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= today;
      })
      .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());

    if (futureBookings.length > 0) {
      return new Date(futureBookings[0].bookingDate).toLocaleDateString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    return '-';
  };

  // Filter vehicles with dynamic status
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const currentStatus = getVehicleStatus(vehicle);
    const matchesStatus = filterStatus === 'All' || currentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Statistics with dynamic status calculation
  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => getVehicleStatus(v) === 'Available').length,
    inUse: vehicles.filter((v) => getVehicleStatus(v) === 'In Use').length,
    maintenance: vehicles.filter((v) => getVehicleStatus(v) === 'Maintenance').length,
  };

  // Handle Create
  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      plateNumber: '',
      model: '',
      brand: '',
      year: new Date().getFullYear(),
      type: 'Pickup Truck',
      fuelType: 'Diesel',
      seatCapacity: 5,
      maintenanceStatus: false,
    });
    setShowModal(true);
  };

  // Handle Edit
  const handleEdit = (vehicle: Vehicle) => {
    setModalMode('edit');
    setSelectedVehicle(vehicle);
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
    setShowModal(true);
  };

  // Handle Delete
  const handleDelete = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      setIsLoading(true);

      // Delete from Firestore
      await deleteDocument('vehicles', vehicleToDelete.id);

      // Update local state
      setVehicles(vehicles.filter((v) => v.id !== vehicleToDelete.id));

      alert('Vehicle deleted successfully!');
      setShowDeleteModal(false);
      setVehicleToDelete(null);
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      alert('Error deleting vehicle: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'create') {
      try {
        setIsLoading(true);

        // Create vehicle in Firestore
        const vehicleId = await createDocument('vehicles', {
          plateNumber: formData.plateNumber!,
          brand: formData.brand!,
          model: formData.model!,
          year: formData.year!,
          type: formData.type!,
          fuelType: formData.fuelType!,
          seatCapacity: formData.seatCapacity!,
          maintenanceStatus: formData.maintenanceStatus || false,
        });

        // Add to local state
        const newVehicle: Vehicle = {
          id: vehicleId,
          plateNumber: formData.plateNumber!,
          brand: formData.brand!,
          model: formData.model!,
          year: formData.year!,
          type: formData.type!,
          fuelType: formData.fuelType!,
          seatCapacity: formData.seatCapacity!,
          maintenanceStatus: formData.maintenanceStatus || false,
        };

        setVehicles([...vehicles, newVehicle]);
        alert('Vehicle added successfully!');
        setShowModal(false);
        setFormData({});
      } catch (error: any) {
        console.error('Error creating vehicle:', error);
        alert('Error creating vehicle: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    } else if (modalMode === 'edit' && selectedVehicle) {
      try {
        setIsLoading(true);

        // Update in Firestore
        await updateDocument('vehicles', selectedVehicle.id, {
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
        setVehicles(
          vehicles.map((v) =>
            v.id === selectedVehicle.id
              ? { ...v, ...formData } as Vehicle
              : v
          )
        );

        alert('Vehicle updated successfully!');
        setShowModal(false);
        setSelectedVehicle(null);
      } catch (error: any) {
        console.error('Error updating vehicle:', error);
        alert('Error updating vehicle: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Get status variant for Chip component
  const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'default' => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'In Use':
        return 'info';
      case 'Maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Admin Dashboard" navLinks={adminNavLinks} accountHref="/admin/account" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Vehicles</h1>
          <p className="text-gray-600 mt-2">Add, edit, or remove vehicles from the system.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm text-gray-600">Total Vehicles</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm text-gray-600">Available</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.available}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm text-gray-600">In Use</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inUse}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm text-gray-600">Maintenance</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.maintenance}</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by plate number, model, or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
              </select>

              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                Add Vehicle
              </button>
            </div>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Booking
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500">Loading vehicles...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <FaCar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No vehicles found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => {
                    const currentStatus = getVehicleStatus(vehicle);
                    const nextBooking = getNextBooking(vehicle);
                    return (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{vehicle.plateNumber}</div>
                          <div className="text-xs text-gray-500">{vehicle.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.brand} {vehicle.model}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vehicle.year} • {vehicle.fuelType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vehicle.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Chip variant={getStatusVariant(currentStatus)}>
                            {currentStatus}
                          </Chip>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {nextBooking}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/vehicles/${vehicle.id}`}
                            className="text-green-600 hover:text-green-900 mr-4"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4 inline" />
                          </Link>
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            title="Edit Vehicle"
                          >
                            <FaEdit className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Vehicle"
                          >
                            <FaTrash className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Add New Vehicle' : 'Edit Vehicle'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <VehicleForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={() => setShowModal(false)}
              mode={modalMode}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && vehicleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Vehicle</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                {vehicleToDelete.brand} {vehicleToDelete.model} ({vehicleToDelete.plateNumber})
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVehicles;
