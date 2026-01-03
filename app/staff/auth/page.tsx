'use client';

import { LoginForm } from '@/components';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdArrowBack } from 'react-icons/md';
import { signIn } from '@/firebase/auth';
import { getDocument } from '@/firebase/firestore';

export default function StaffAuthPage() {
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    try {
      // Sign in with Firebase
      const userCredential = await signIn(email, password);
      const user = userCredential.user;

      // Verify user role from Firestore
      const userDoc = await getDocument('users', user.uid);

      if (userDoc) {
        router.push('/staff');
      } else {
        throw new Error('Unauthorized access. Please use staff credentials.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Invalid email or password');
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement password reset
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
          userType="Staff"
        />
      </div>
    </div>
  );
}
