<div align="center">
  <img src="./readme/logo.png" alt="MIE Industrial Logo" width="200">

  # Vehicle Booking and Inspection System

  <p>A comprehensive internal vehicle booking and inspection management system for MIE Industrial SDN BHD.</p>
  <p>This system streamlines the process of booking company vehicles, managing inspections, and tracking key collection/return processes.</p>
</div>

## 📋 Table of Contents

- [Features](#features)
- [System Overview](#system-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Future Enhancements](#future-enhancements)

## ✨ Features

### Staff Portal
- Create and manage vehicle booking requests
- Submit pre-inspection and post-inspection forms with photos
- View booking history and status
- Edit pending bookings
- Track key collection and return status

### Receptionist Portal
- Manage key collection and return processes
- View all bookings and their inspection forms
- Access booking history
- Track key management records

### Admin Portal
- Approve or reject booking requests
- Manage vehicle fleet (add, edit, delete vehicles)
- Manage staff accounts (create, edit, suspend accounts)
- View comprehensive booking history
- Oversee all system operations

### General Features
- Role-based authentication and access control
- Responsive design for mobile and desktop
- Real-time booking status updates
- PDF generation for inspection reports
- Image upload for vehicle inspections
- Comprehensive search and filtering

## 📸 System Overview

<div align="center">
  <img src="./readme/system.png" alt="System Overview" width="800">
  <p><i>Vehicle Booking and Inspection System Interface</i></p>
</div>

## 🛠️ Tech Stack

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

</div>

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **PDF Generation:** @react-pdf/renderer
- **Icons:** React Icons (Material Design, Font Awesome)
- **Date Handling:** Native JavaScript Date API
- **Image Handling:** Next.js Image Component
- **Authentication:** Firebase Authentication (to be implemented)
- **Database:** Firestore (to be implemented)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vehicle-booking
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build for Production

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
vehicle-booking/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin portal pages
│   │   ├── auth/                 # Admin authentication
│   │   ├── bookings/             # Booking management
│   │   ├── history/              # Booking history
│   │   ├── staffs/               # Staff management
│   │   ├── vehicles/             # Vehicle management
│   │   └── account/              # Account settings
│   ├── receptionist/             # Receptionist portal pages
│   │   ├── auth/                 # Receptionist authentication
│   │   ├── bookings/             # Key management & inspections
│   │   ├── history/              # Booking history
│   │   └── account/              # Account settings
│   ├── staff/                    # Staff portal pages
│   │   ├── auth/                 # Staff authentication
│   │   ├── bookings/             # Booking requests
│   │   ├── history/              # Booking history
│   │   └── account/              # Account settings
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage (portal selection)
│   └── globals.css               # Global styles
├── components/                   # Reusable React components
│   ├── BookingForm.tsx           # Booking request form
│   ├── BookingTable.tsx          # Booking list table
│   ├── LoginForm.tsx             # Authentication form
│   ├── ManageAccountForm.tsx     # Account management
│   ├── PortalCard.tsx            # Portal selection card
│   ├── Sidebar.tsx               # Navigation sidebar
│   ├── StaffForm.tsx             # Staff creation/edit form
│   ├── VehicleForm.tsx           # Vehicle creation/edit form
│   ├── VehicleInspectionForm.tsx # Inspection form with photos
│   └── index.ts                  # Component exports
├── constant/                     # Constants and configurations
│   ├── navLinks.ts               # Navigation links for each role
│   └── index.ts                  # Constant exports
├── libs/                         # Library utilities
│   └── InspectionFormRenderer.tsx # PDF report generator
├── public/                       # Static assets
│   └── logo.png                  # Company logo
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── README.md                     # Project documentation
```

## 👥 User Roles

### Staff
- Create vehicle booking requests
- Submit pre-inspection forms before pickup
- Submit post-inspection forms after return
- View and manage their own bookings
- Track booking status and key collection

### Receptionist
- Manage key collection status
- Manage key return status
- View all booking inspections
- Access booking history

### Admin
- Full system access
- Approve/reject booking requests
- Manage vehicle fleet
- Manage staff accounts
- View all bookings and reports
- System configuration

## 🔮 Future Enhancements

- [ ] Firebase Authentication integration
- [ ] Firestore database integration
- [ ] Real-time notifications
- [ ] Email notifications for booking updates
- [ ] Advanced reporting and analytics
- [ ] Vehicle maintenance tracking
- [ ] Fuel consumption tracking
- [ ] GPS integration for vehicle tracking
- [ ] Mobile app version
- [ ] Multi-language support

## 📝 Documentation Files

Additional documentation available:
- [Firebase Integration Guide](./FIREBASE_INTEGRATION.md)
- [Password Management Guide](./PASSWORD_MANAGEMENT.md)

## 🤝 Contributing

This is an internal project for MIE Industrial SDN BHD. For any issues or suggestions, please contact the development team.

## 📄 License

Internal use only - MIE Industrial SDN BHD

---

**Built with ❤️ for MIE Industrial SDN BHD**
