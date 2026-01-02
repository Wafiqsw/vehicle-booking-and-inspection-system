'use client';

import { LoginForm } from '@/components';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdArrowBack } from 'react-icons/md';

export default function AdminAuthPage() {
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    try {
      // TODO: Implement Firebase Authentication
      // const auth = getAuth();
      // const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // const user = userCredential.user;

      // Verify user role from Firestore
      // const userDoc = await getDoc(doc(db, 'users', user.uid));
      // if (userDoc.exists() && userDoc.data().role === 'Admin') {
      //   router.push('/admin/bookings');
      // } else {
      //   throw new Error('Unauthorized access. Please use admin credentials.');
      // }

      console.log('Admin login:', { email });

      // Simulate successful login
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/admin/bookings');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Invalid email or password');
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement password reset
    // const auth = getAuth();
    // await sendPasswordResetEmail(auth, email);

    console.log('Forgot password');
    alert('Password reset will be implemented with Firebase Authentication');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <MdArrowBack className="w-5 h-5" />
          Back
        </Link>
      </div>

      {/* Login Form - Centered */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <LoginForm
          onSubmit={handleLogin}
          onForgotPassword={handleForgotPassword}
          userType="Admin"
        />
      </div>
    </div>
  );
}
