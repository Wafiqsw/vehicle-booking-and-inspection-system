'use client';

import React from 'react';
import { BlobProvider } from '@react-pdf/renderer';
import { MdPrint } from 'react-icons/md';
import InspectionFormPDF, { InspectionFormData } from '@/libs/InspectionFormRenderer';

interface PDFButtonProps {
  data: InspectionFormData;
  fileName: string;
}

export const PDFButton: React.FC<PDFButtonProps> = ({ data, fileName }) => {
  return (
    <BlobProvider document={<InspectionFormPDF data={data} />}>
      {({ blob, url, loading }) => {
        const handleClick = () => {
          if (url) {
            // Open PDF in new tab
            window.open(url, '_blank');
          }
        };

        return (
          <button
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400"
            disabled={loading || !url}
          >
            <MdPrint className="w-5 h-5" />
            {loading ? 'Generating PDF...' : 'View PDF'}
          </button>
        );
      }}
    </BlobProvider>
  );
};

export default PDFButton;
