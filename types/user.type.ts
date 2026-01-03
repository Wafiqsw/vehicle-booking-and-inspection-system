export type User = {
    id: string;
    email: string;
    password?: string; // Temporary password (deleted when user changes password)
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