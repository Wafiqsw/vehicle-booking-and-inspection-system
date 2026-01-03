import { Booking } from "./booking.type";

export type PartInspection = {
    functionalStatus: boolean;
    remark?: string;
};

export type Inspection = {
    id: string;

    inspectionFormType: 'pre' | 'post';
    inspectionDate: Date;
    nextVehicleServiceDate: Date;
    vehicleMilleage: number;

    // Vehicle Parts Inspection
    parts: {
        remoteControl: PartInspection;
        brakes: PartInspection;
        steering: PartInspection;
        operation: PartInspection;
        engine: PartInspection;
        panelInspection: PartInspection;
        bumper: PartInspection;
        doors: PartInspection;
        roof: PartInspection;
        exteriorLights: PartInspection;
        safetyBelts: PartInspection;
        airConditioning: PartInspection;
        radio: PartInspection;
        navigationSystem: PartInspection;
        tires: PartInspection;
    };

    // Vehicle Images
    images: {
        vehicleLeft?: string;
        vehicleRight?: string;
        vehicleFront?: string;
        vehicleRear?: string;
        tyreFront?: string;
        tyreRear?: string;
    };

    createdAt: Date;
    updatedAt: Date;

    booking: Booking;
};
