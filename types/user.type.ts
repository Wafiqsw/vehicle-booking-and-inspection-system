export type User = {
    id: string;
    email: string;
    password?: string; // Temporary password (deleted when user changes password)
    tempPasswordStatus?: boolean; // Whether user is using temporary password
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role: 'Staff' | 'Admin' | 'Receptionist';
    createdAt?: Date;
    updatedAt?: Date;
}

export type Staff = User
export type Admin = User
export type Receptionist = User