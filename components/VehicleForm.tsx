import React from 'react';

export interface VehicleFormData {
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  fuelType: string;
  capacity: number;
  status: 'Available' | 'In Use' | 'Maintenance';
  manualMaintenanceMode?: boolean;
}

interface VehicleFormProps {
  formData: Partial<VehicleFormData>;
  onChange: (data: Partial<VehicleFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
  isLoading?: boolean;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  mode,
  isLoading = false,
}) => {
  const handleInputChange = (field: keyof VehicleFormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plate Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plate Number *
          </label>
          <input
            type="text"
            required
            value={formData.plateNumber || ''}
            onChange={(e) => handleInputChange('plateNumber', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ABC 1234"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
          <input
            type="text"
            required
            value={formData.brand || ''}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Toyota"
          />
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
          <input
            type="text"
            required
            value={formData.model || ''}
            onChange={(e) => handleInputChange('model', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Hilux"
          />
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
          <input
            type="number"
            required
            min="1900"
            max={new Date().getFullYear() + 1}
            value={formData.year || new Date().getFullYear()}
            onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
          <select
            required
            value={formData.type || 'Pickup Truck'}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Pickup Truck">Pickup Truck</option>
            <option value="Van">Van</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Truck">Truck</option>
          </select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuel Type *
          </label>
          <select
            required
            value={formData.fuelType || 'Diesel'}
            onChange={(e) => handleInputChange('fuelType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Diesel">Diesel</option>
            <option value="Petrol">Petrol</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capacity (seats) *
          </label>
          <input
            type="number"
            required
            min="1"
            max="20"
            value={formData.capacity || 5}
            onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Manual Maintenance Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maintenance Mode
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.manualMaintenanceMode || false}
              onChange={(e) => handleInputChange('manualMaintenanceMode', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              Keep vehicle in maintenance mode
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            When enabled, vehicle will always show as "Maintenance" regardless of bookings
          </p>
        </div>
      </div>

      <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : mode === 'create' ? 'Add Vehicle' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;
