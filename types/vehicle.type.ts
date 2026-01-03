export type Vehicle = {
    id: string;
    plateNumber: string;
    brand: string;
    model: string;
    year: number;
    type: string;
    fuelType: string;
    seatCapacity: number;
    maintenanceStatus: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};