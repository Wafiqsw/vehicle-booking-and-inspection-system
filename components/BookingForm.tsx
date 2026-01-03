import React, { useMemo } from 'react';
import Link from 'next/link';
import { Vehicle, Booking } from '@/types';
import { isVehicleAvailableForRange } from '@/libs/vehicleAvailabilityChecker';

export interface BookingFormData {
  vehicleId: string;
  bookingDate: string;
  returnDate: string;
  project: string;
  destination: string;
  passengers: number;
}

interface BookingFormProps {
  formData: BookingFormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  vehicles: Vehicle[]; // All vehicles from Firestore
  bookings: Booking[]; // All bookings from Firestore (to check availability)
  isLoading?: boolean; // Loading state for submit button
  submitLabel?: string;
  cancelHref?: string;
  cancelLabel?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({
  formData,
  onSubmit,
  onChange,
  vehicles,
  bookings,
  isLoading = false,
  submitLabel = 'Submit Booking Request',
  cancelHref = '/staff/bookings',
  cancelLabel = 'Cancel',
}) => {
  // Filter available vehicles based on selected dates
  const availableVehicles = useMemo(() => {
    // If no dates selected, show all vehicles
    if (!formData.bookingDate || !formData.returnDate) {
      return vehicles;
    }

    // Filter vehicles that are available for the selected date range
    const filtered = vehicles.filter((vehicle) => {
      return isVehicleAvailableForRange(
        vehicle,
        formData.bookingDate,
        formData.returnDate,
        bookings
      );
    });

    return filtered;
  }, [vehicles, bookings, formData.bookingDate, formData.returnDate]);

  // Check if selected vehicle is still available
  const isSelectedVehicleAvailable = useMemo(() => {
    if (!formData.vehicleId) return true;
    return availableVehicles.some((v) => v.id === formData.vehicleId);
  }, [formData.vehicleId, availableVehicles]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
      </div>

      <form onSubmit={onSubmit} className="p-6">
        <div className="space-y-4">
          {/* Booking Date and Return Date - Moved to top */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={onChange}
                required
                disabled={isLoading}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={onChange}
                required
                disabled={isLoading}
                min={formData.bookingDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Vehicle <span className="text-red-500">*</span>
            </label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={onChange}
              required
              disabled={isLoading || !formData.bookingDate || !formData.returnDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {!formData.bookingDate || !formData.returnDate
                  ? 'Please select dates first...'
                  : availableVehicles.length === 0
                    ? 'No vehicles available for selected dates'
                    : 'Choose a vehicle...'}
              </option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.plateNumber} ({vehicle.type})
                </option>
              ))}
            </select>
            {formData.vehicleId && !isSelectedVehicleAvailable && (
              <p className="mt-2 text-sm text-red-600">
                Selected vehicle is no longer available for these dates. Please choose another vehicle.
              </p>
            )}
            {formData.bookingDate && formData.returnDate && availableVehicles.length === 0 && (
              <p className="mt-2 text-sm text-orange-600">
                No vehicles available for the selected dates. Please try different dates.
              </p>
            )}
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="project"
              value={formData.project}
              onChange={onChange}
              required
              disabled={isLoading}
              placeholder="e.g., Highland Towers Construction"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Destination and Passengers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={onChange}
                required
                disabled={isLoading}
                placeholder="e.g., Kuala Lumpur"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passengers <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="passengers"
                value={formData.passengers}
                onChange={onChange}
                required
                disabled={isLoading}
                min="1"
                max="20"
                placeholder="e.g., 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex items-center gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {submitLabel}
          </button>
          <Link
            href={cancelHref}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            {cancelLabel}
          </Link>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
