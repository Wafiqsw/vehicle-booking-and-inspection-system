import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface CreateUserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'Staff' | 'Admin' | 'Receptionist';
}

interface CreateUserResponse {
    success: boolean;
    userId: string;
    tempPassword: string;
}

export const createUser = onCall(
    async (request): Promise<CreateUserResponse> => {
        const data = request.data as CreateUserData;

        // Check if caller is authenticated
        if (!request.auth) {
            throw new Error('User must be authenticated to create users');
        }

        // Check if caller is admin
        const callerDoc = await admin
            .firestore()
            .collection('users')
            .doc(request.auth.uid)
            .get();

        const callerRole = callerDoc.data()?.role;

        if (callerRole !== 'Admin') {
            throw new Error('Only admins can create users');
        }

        try {
            // Create user with Admin SDK (no sign-in side effects!)
            const userRecord = await admin.auth().createUser({
                email: data.email,
                password: data.password,
                displayName: `${data.firstName} ${data.lastName}`,
            });

            // Save user data to Firestore
            await admin
                .firestore()
                .collection('users')
                .doc(userRecord.uid)
                .set({
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber,
                    role: data.role,
                    password: data.password, // Store temp password
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

            // Set custom claims for role-based access
            await admin.auth().setCustomUserClaims(userRecord.uid, {
                role: data.role,
            });

            return {
                success: true,
                userId: userRecord.uid,
                tempPassword: data.password,
            };
        } catch (error: any) {
            console.error('Error creating user:', error);

            if (error.code === 'auth/email-already-exists') {
                throw new Error('Email address is already in use');
            }

            throw new Error(`Failed to create user: ${error.message}`);
        }
    }
);
