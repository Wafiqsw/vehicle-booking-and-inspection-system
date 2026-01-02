'use client';

import React, { useState, useEffect } from 'react';
import { FaCamera } from 'react-icons/fa';
import Link from 'next/link';

interface InspectionItem {
  name: string;
  functional: boolean;
  broken: boolean;
  remark: string;
}

interface VehicleImages {
  left: File | null;
  right: File | null;
  front: File | null;
  rear: File | null;
  top: File | null;
  frontTyre: File | null;
  rearTyre: File | null;
}

export interface InspectionFormData {
  inspectionType: 'pre' | 'post';
  inspectionDate: string;
  vehicleRegNo: string;
  vehicleModel: string;
  project: string;
  currentMileage: string;
  nextServiceDate: string;
  inspectionItems: InspectionItem[];
  vehicleImages: VehicleImages;
}

interface VehicleInspectionFormProps {
  bookingId: string;
  inspectionType: 'pre' | 'post';
  isReadOnly?: boolean;
  staffName?: string; // For receptionist view
  initialData?: Partial<InspectionFormData>;
  onSubmit: (data: InspectionFormData) => void;
  onCancel: () => void;
  autoFillData?: {
    plateNumber?: string;
    vehicle?: string;
    project?: string;
  };
}

const VehicleInspectionForm: React.FC<VehicleInspectionFormProps> = ({
  bookingId,
  inspectionType,
  isReadOnly = false,
  staffName,
  initialData,
  onSubmit,
  onCancel,
  autoFillData,
}) => {
  const [inspectionDate, setInspectionDate] = useState(initialData?.inspectionDate || '');
  const [vehicleRegNo, setVehicleRegNo] = useState(initialData?.vehicleRegNo || '');
  const [vehicleModel, setVehicleModel] = useState(initialData?.vehicleModel || '');
  const [project, setProject] = useState(initialData?.project || '');
  const [currentMileage, setCurrentMileage] = useState(initialData?.currentMileage || '');
  const [nextServiceDate, setNextServiceDate] = useState(initialData?.nextServiceDate || '');

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>(
    initialData?.inspectionItems || [
      { name: 'Remote control', functional: false, broken: false, remark: '' },
      { name: 'Brakes', functional: false, broken: false, remark: '' },
      { name: 'Steering', functional: false, broken: false, remark: '' },
      { name: 'Auto/Manual /Transaxle Operation', functional: false, broken: false, remark: '' },
      { name: 'Engine Accelerates and Cruises', functional: false, broken: false, remark: '' },
      { name: 'Body Panel Inspection', functional: false, broken: false, remark: '' },
      { name: 'Bumper Inspection (Front & Back)', functional: false, broken: false, remark: '' },
      { name: 'Doors Inspection', functional: false, broken: false, remark: '' },
      { name: 'Roof Inspection', functional: false, broken: false, remark: '' },
      { name: 'Exterior Lights (Back/Side/Front)', functional: false, broken: false, remark: '' },
      { name: 'Safety Belts', functional: false, broken: false, remark: '' },
      { name: 'Air Conditioning System', functional: false, broken: false, remark: '' },
      { name: 'Radio', functional: false, broken: false, remark: '' },
      { name: 'Navigation System', functional: false, broken: false, remark: '' },
      { name: 'Tires / Wheels Condition', functional: false, broken: false, remark: '' },
    ]
  );

  const [vehicleImages, setVehicleImages] = useState<VehicleImages>(
    initialData?.vehicleImages || {
      left: null,
      right: null,
      front: null,
      rear: null,
      top: null,
      frontTyre: null,
      rearTyre: null,
    }
  );

  const [imagePreview, setImagePreview] = useState<{ [key: string]: string }>({
    left: '',
    right: '',
    front: '',
    rear: '',
    top: '',
    frontTyre: '',
    rearTyre: '',
  });

  // Auto-fill fields from booking data and set today's date
  useEffect(() => {
    if (!isReadOnly && !initialData) {
      // Set today's date in YYYY-MM-DD format
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setInspectionDate(formattedDate);
    }

    if (autoFillData) {
      if (autoFillData.plateNumber) setVehicleRegNo(autoFillData.plateNumber);
      if (autoFillData.vehicle) setVehicleModel(autoFillData.vehicle);
      if (autoFillData.project) setProject(autoFillData.project);
    }
  }, [autoFillData, isReadOnly, initialData]);

  const handleItemChange = (index: number, field: 'functional' | 'broken' | 'remark', value: boolean | string) => {
    const newItems = [...inspectionItems];
    if (field === 'functional' && value === true) {
      newItems[index].functional = true;
      newItems[index].broken = false;
    } else if (field === 'broken' && value === true) {
      newItems[index].broken = true;
      newItems[index].functional = false;
    } else if (field === 'remark') {
      newItems[index].remark = value as string;
    }
    setInspectionItems(newItems);
  };

  const handleImageUpload = (position: keyof VehicleImages, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVehicleImages(prev => ({ ...prev, [position]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => ({ ...prev, [position]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    let completed = 0;
    let total = 6 + inspectionItems.length + 7; // Basic fields + inspection items + images

    if (inspectionDate) completed++;
    if (vehicleRegNo) completed++;
    if (vehicleModel) completed++;
    if (project) completed++;
    if (currentMileage) completed++;
    if (nextServiceDate) completed++;

    inspectionItems.forEach(item => {
      if (item.functional || item.broken) {
        completed++;
      }
    });

    Object.values(vehicleImages).forEach(img => {
      if (img !== null) {
        completed++;
      }
    });

    return Math.round((completed / total) * 100);
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!inspectionDate) errors.push('Inspection Date is required');
    if (!vehicleRegNo) errors.push('Vehicle Registration Number is required');
    if (!vehicleModel) errors.push('Vehicle Model is required');
    if (!project) errors.push('Project is required');
    if (!currentMileage) errors.push('Vehicle Mileage is required');
    if (!nextServiceDate) errors.push('Next Service Date is required');

    const uncheckedItems = inspectionItems.filter(item => !item.functional && !item.broken);
    if (uncheckedItems.length > 0) {
      errors.push(`Please check all inspection items (${uncheckedItems.length} remaining)`);
    }

    const missingImages = Object.entries(vehicleImages)
      .filter(([_, file]) => file === null)
      .map(([position]) => position);

    if (missingImages.length > 0) {
      errors.push(`Please upload all vehicle images (${missingImages.length} missing)`);
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();

    if (errors.length > 0) {
      alert('Please complete all required fields:\n\n' + errors.join('\n'));
      return;
    }

    const formData: InspectionFormData = {
      inspectionType,
      inspectionDate,
      vehicleRegNo,
      vehicleModel,
      project,
      currentMileage,
      nextServiceDate,
      inspectionItems,
      vehicleImages,
    };

    onSubmit(formData);
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      {!isReadOnly && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Form Completion</span>
            <span className="text-sm font-semibold text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                progress === 100
                  ? 'bg-green-500'
                  : progress >= 75
                  ? 'bg-blue-500'
                  : progress >= 50
                  ? 'bg-yellow-500'
                  : 'bg-orange-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {progress === 100
              ? 'All fields completed! Ready to submit.'
              : `Complete all required fields to submit the form.`}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 space-y-6">
        {/* Inspection Type Selection */}
        <div className="pb-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Vehicle Inspection
          </h2>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Inspection Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-not-allowed opacity-60">
              <input
                type="radio"
                name="inspectionType"
                value="pre"
                checked={inspectionType === 'pre'}
                disabled
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">Pre-Trip Inspection</span>
            </label>
            <label className="flex items-center gap-2 cursor-not-allowed opacity-60">
              <input
                type="radio"
                name="inspectionType"
                value="post"
                checked={inspectionType === 'post'}
                disabled
                className="w-4 h-4 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-900">Post-Trip Inspection</span>
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {isReadOnly
              ? 'This form has been submitted and is in view-only mode.'
              : `This form is locked to ${inspectionType === 'pre' ? 'Pre-Trip' : 'Post-Trip'} inspection mode.`
            }
          </p>
        </div>

        {/* Staff Name (Receptionist View Only) */}
        {isReadOnly && staffName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff Name
            </label>
            <p className="text-base font-semibold text-gray-900">{staffName}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspection Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              required
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 ${
                inspectionType === 'pre' ? 'focus:ring-blue-500' : 'focus:ring-orange-500'
              } focus:border-transparent text-sm ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Reg. No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={vehicleRegNo}
              onChange={(e) => setVehicleRegNo(e.target.value)}
              required
              disabled={isReadOnly}
              placeholder="e.g. ABC 1234"
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 ${
                inspectionType === 'pre' ? 'focus:ring-blue-500' : 'focus:ring-orange-500'
              } focus:border-transparent text-sm ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              required
              disabled
              placeholder="e.g. Toyota Hilux"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-sm text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              required
              disabled
              placeholder="e.g. Highland Towers Construction"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-sm text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Mileage <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={currentMileage}
              onChange={(e) => setCurrentMileage(e.target.value)}
              required
              disabled={isReadOnly}
              placeholder="e.g. 50000"
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 ${
                inspectionType === 'pre' ? 'focus:ring-blue-500' : 'focus:ring-orange-500'
              } focus:border-transparent text-sm ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Service Date
            </label>
            <input
              type="date"
              value={nextServiceDate}
              onChange={(e) => setNextServiceDate(e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 ${
                inspectionType === 'pre' ? 'focus:ring-blue-500' : 'focus:ring-orange-500'
              } focus:border-transparent text-sm ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        {/* Inspection Checklist Table */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Inspection Checklist
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Company Vehicles
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody>
                {inspectionItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                      {item.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <div className="flex justify-center">
                        <div className="inline-flex rounded-lg overflow-hidden border-2 border-gray-200">
                          <button
                            type="button"
                            onClick={() => handleItemChange(index, 'functional', true)}
                            disabled={isReadOnly}
                            className={`px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                              isReadOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                            } ${
                              item.functional
                                ? 'bg-emerald-50 text-emerald-700 border-l-4 border-l-emerald-500'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            Functional
                          </button>
                          <div className="w-px bg-gray-200"></div>
                          <button
                            type="button"
                            onClick={() => handleItemChange(index, 'broken', true)}
                            disabled={isReadOnly}
                            className={`px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                              isReadOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                            } ${
                              item.broken
                                ? 'bg-rose-50 text-rose-700 border-r-4 border-r-rose-500'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            Broken
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <input
                        type="text"
                        value={item.remark}
                        onChange={(e) => handleItemChange(index, 'remark', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm transition-all duration-200 ${
                          isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                        }`}
                        placeholder="Enter remark..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Condition */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Vehicle Condition</h2>
          <p className="text-sm text-gray-600 mb-4">
            {isReadOnly ? 'Vehicle images from different angles' : 'Please upload images of the vehicle from different angles'}
          </p>

          {/* Vehicle Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(['left', 'right', 'front', 'rear', 'top', 'frontTyre', 'rearTyre'] as const).map((position) => (
              <div key={position}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {position === 'frontTyre' ? 'Front Tyre' : position === 'rearTyre' ? 'Rear Tyre' : `${position} View`}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors">
                  {imagePreview[position] ? (
                    <div className="relative h-48 bg-gray-100">
                      <img src={imagePreview[position]} alt={`${position} view`} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center bg-gray-50">
                      <FaCamera className="w-12 h-12 text-gray-300 mb-2" />
                      <span className="text-sm text-gray-400">No image uploaded</span>
                    </div>
                  )}
                  {!isReadOnly && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(position, e)}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          {!isReadOnly && (
            <button
              type="submit"
              className={`w-full sm:w-auto px-6 py-3 text-white font-medium rounded-lg transition-colors ${
                inspectionType === 'pre'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              Submit {inspectionType === 'pre' ? 'Pre' : 'Post'}-Trip Inspection
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
          >
            {isReadOnly ? 'Close' : 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleInspectionForm;
