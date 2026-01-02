import React from "react";
import { NavLink } from "@/components";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaCar, FaCarSide, FaUserAlt } from "react-icons/fa";
import { MdOutlineCalendarMonth } from "react-icons/md";


// Staff Navigation Links that will be registered into the sidebar navigation

export const staffNavLinks: NavLink[] = [
  { href: "/staff", label: "Dashboard", icon: <LuLayoutDashboard /> },
  { href: "/staff/bookings", label: "My Bookings", icon: <FaCar /> },
  { href: "/staff/history", label: "My Booking History", icon: <MdOutlineCalendarMonth/> },
];

// Receptionist Navigation Links
export const receptionistNavLinks: NavLink[] = [
  { href: "/receptionist", label: "Dashboard", icon: <LuLayoutDashboard /> },
  { href: "/receptionist/bookings", label: "Manage Bookings", icon: <FaCar /> },
  { href: "/receptionist/history", label: "Booking History", icon: <MdOutlineCalendarMonth/>},
];

// Admin Navigation Links
export const adminNavLinks: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: <LuLayoutDashboard />  },
  { href: "/admin/vehicles", label: "Manage Vehicles", icon: <FaCarSide /> },
  { href: "/admin/bookings", label: "Manage Bookings", icon: <FaCar /> },
  { href: "/admin/staffs", label: "Manage Staffs", icon: <FaUserAlt /> },
  { href: "/admin/history", label: "Booking History", icon: <MdOutlineCalendarMonth/> },
];