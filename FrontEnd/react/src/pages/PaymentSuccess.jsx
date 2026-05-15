import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../lib/apiClient';
import PaymentStatusCard from '../components/PaymentStatusCard';

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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00B4D8]/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FDB813]/5 rounded-full blur-[100px] -ml-48 -mb-48" />

      <AnimatePresence mode="wait">
        {status === 'verifying' ? (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center"
          >
             {/* Standard Dual-Ring Spinner */}
            <div className="relative h-24 w-24 mb-8">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#00B4D8] border-r-[#00B4D8]/30" style={{ animationDuration: '1.5s' }}></div>
              <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-b-[#FDB813] border-l-[#FDB813]/30" style={{ animationDuration: '1s', animationDirection: 'reverse' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 animate-ping rounded-full bg-[#00B4D8]"></div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <h3 className="text-2xl font-black tracking-[0.2em] text-[#00B4D8] animate-pulse uppercase">
                ABRITECH
              </h3>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-bold text-gray-500">Confirming payment…</span>
                <div className="flex gap-0.5">
                  <span className="h-1.5 w-1.5 bg-[#00B4D8] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 bg-[#00B4D8] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 bg-[#00B4D8] rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="status"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <PaymentStatusCard
              status={status}
              message={message}
              onPrimary={() =>
                navigate(status === 'success' ? '/dashboard/student' : '/courses')
              }
              primaryLabel={status === 'success' ? 'Go to dashboard' : 'Back to courses'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
