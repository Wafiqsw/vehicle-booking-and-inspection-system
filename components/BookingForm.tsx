import React from 'react';
import Link from 'next/link';

// Available vehicles mock data
export const availableVehicles = [
  { id: 'VH-001', name: 'Toyota Hilux', type: 'Pickup Truck', status: 'Available' },
  { id: 'VH-002', name: 'Ford Ranger', type: 'Pickup Truck', status: 'Available' },
  { id: 'VH-003', name: 'Nissan Navara', type: 'Pickup Truck', status: 'Available' },
  { id: 'VH-004', name: 'Isuzu D-Max', type: 'Pickup Truck', status: 'Available' },
  { id: 'VH-005', name: 'Mitsubishi Triton', type: 'Pickup Truck', status: 'Available' },
];

export interface BookingFormData {
  vehicleId: string;
  bookingDate: string;
  returnDate: string;
  project: string;
  destination: string;
  passengers: string;
  notes: string;
}

interface BookingFormProps {
  formData: BookingFormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  submitLabel?: string;
  cancelHref?: string;
  cancelLabel?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({
  formData,
  onSubmit,
  onChange,
  submitLabel = 'Submit Booking Request',
  cancelHref = '/staff/bookings',
  cancelLabel = 'Cancel',
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
      </div>

      <form onSubmit={onSubmit} className="p-6">
        <div className="space-y-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            >
              <option value="">Choose a vehicle...</option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} - {vehicle.type}
                </option>
              ))}
            </select>
          </div>

          {/* Booking Date and Return Date */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
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
              placeholder="e.g., Highland Towers Construction"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
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
                placeholder="e.g., Kuala Lumpur"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
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
                min="1"
                max="10"
                placeholder="e.g., 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={onChange}
              rows={3}
              placeholder="Any special requirements or additional information..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex items-center gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
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
