import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

/** Softer, more spacious success / error card for payment return page */
export default function PaymentStatusCard({ status, message, onPrimary, primaryLabel }) {
  const isSuccess = status === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[420px] rounded-[3rem] bg-white p-12 text-center shadow-[0_30px_70px_rgba(0,0,0,0.04)] border border-slate-50"
    >
      <div className={`mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] relative ${
        isSuccess ? 'bg-emerald-50/50 text-emerald-500' : 'bg-rose-50/50 text-rose-500'
      }`}>
        <div className={`absolute inset-0 blur-3xl opacity-30 ${isSuccess ? 'bg-emerald-400' : 'bg-rose-400'}`} />
        <div className={`relative w-full h-full rounded-[2.5rem] border border-white/50 flex items-center justify-center`}>
          {isSuccess ? (
            <CheckCircle2 className="h-11 w-11" strokeWidth={1.5} />
          ) : (
            <XCircle className="h-11 w-11" strokeWidth={1.5} />
          )}
        </div>
      </div>

      <div className="space-y-3 mb-12 px-2">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          {isSuccess ? 'Payment Successful' : 'Payment Failed'}
        </h1>
        <p className="text-slate-500 font-medium leading-relaxed text-base">
          {isSuccess
            ? 'Your enrollment is complete. You can now access all course materials and start learning.'
            : message || 'We couldn\'t process your payment. Please try again or contact our support team.'}
        </p>
      </div>

      <button
        type="button"
        onClick={onPrimary}
        className="group relative flex w-full items-center justify-center gap-3 rounded-[1.75rem] bg-slate-900 py-5 text-base font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98] shadow-[0_15px_30px_rgba(0,0,0,0.1)]"
      >
        {primaryLabel}
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
      </button>
      
      {isSuccess && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div 
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-1 h-1 bg-slate-300 rounded-full"
              />
            ))}
          </div>
          <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">
            Auto-Redirecting
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
