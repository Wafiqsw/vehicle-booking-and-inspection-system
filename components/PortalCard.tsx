import React from 'react';
import Link from 'next/link';

interface PortalCardProps {
  href: string;
  title: string;
  icon: React.ReactNode;
}

export const PortalCard: React.FC<PortalCardProps> = ({ href, title, icon }) => {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl border border-gray-200 p-8 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group">
        <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors border border-blue-200">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>

        <div className="text-gray-600 text-sm font-medium group-hover:text-blue-600 transition-colors">
          Access Portal →
        </div>
      </div>
    </Link>
  );
};
