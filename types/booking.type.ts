import { Staff, Admin, Receptionist } from "./user.type";
import { Vehicle } from "./vehicle.type";

export type Booking = {
    id: string;

    project: string;
    destination: string;
    passengers: number;
    bookingStatus: boolean;
    keyCollectionStatus: boolean;
    keyReturnStatus: boolean;
    bookingDate: Date;
    returnDate: Date;

    createdAt: Date;
    updatedAt: Date;

    managedBy: Receptionist;
    approvedBy: Admin;
    bookedBy: Staff;

    vehicle: Vehicle;
    rejectionReason?: string;
};