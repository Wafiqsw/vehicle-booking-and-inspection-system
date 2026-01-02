'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navLinks: NavLink[];
  title?: string;
  accountHref?: string; // URL to the account management page
}

const Sidebar: React.FC<SidebarProps> = ({ navLinks, title = "Vehicle Booking and Inspection", accountHref }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 shadow-lg ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Image
                src="/logo.png"
                alt="MIE Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className={`flex flex-col transition-all duration-300 whitespace-nowrap ${
              isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'
            }`}>
              <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
              <span className="text-xs text-gray-500">MIE Industrial SDN BHD</span>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 bg-blue-600 border border-blue-500 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
          aria-label="Toggle Sidebar"
        >
          <svg
            className={`w-4 h-4 text-white transition-transform ${
              isOpen ? 'rotate-0' : 'rotate-180'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {navLinks.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={index}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={!isOpen ? link.label : ''}
              >
                <div
                  className={`flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                  }`}
                >
                  {link.icon}
                </div>
                {isOpen && (
                  <span className="text-sm font-medium truncate">{link.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white transition-all duration-300">
          {accountHref ? (
            <Link href={accountHref}>
              {isOpen ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 cursor-pointer hover:bg-gray-100 hover:border-gray-300">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-medium text-gray-900 truncate">My Account</p>
                    <p className="text-xs text-gray-500 truncate">Manage profile & settings</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </Link>
          ) : (
            <>
              {isOpen ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-medium text-gray-900 truncate">User Account</p>
                    <p className="text-xs text-gray-500 truncate">Internal User</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div className={`transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`} />
    </>
  );
};

export { Sidebar };