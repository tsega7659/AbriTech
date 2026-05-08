import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import Loading from '../components/Loading';
import { CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get('tx_ref');
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!txRef) {
      setStatus('error');
      setMessage('Invalid payment reference.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await apiClient.get(`/payments/chapa/verify/${txRef}`);
        if (response.data.success) {
          setStatus('success');
          setTimeout(() => navigate('/dashboard/student'), 3000);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Payment verification failed.');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Payment verification failed.');
      }
    };

    verifyPayment();
  }, [txRef, navigate]);

  if (status === 'verifying') {
    return <Loading fullScreen={true} message="Verifying your payment..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl shadow-gray-200/50 border border-gray-100"
      >
        {status === 'success' ? (
          <>
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 mb-8 font-medium">Your course has been unlocked. Redirecting you to your dashboard...</p>
            <button 
              onClick={() => navigate('/dashboard/student')}
              className="w-full bg-[#00B4D8] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#0096B4] transition-all shadow-lg shadow-[#00B4D8]/20"
            >
              Go to Dashboard Now
            </button>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
              <XCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-500 mb-8 font-medium">{message}</p>
            <button 
              onClick={() => navigate('/courses')}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
            >
              Back to Courses
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
