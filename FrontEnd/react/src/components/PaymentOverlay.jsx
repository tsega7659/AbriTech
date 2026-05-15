import { motion } from 'framer-motion';

/** Non-full-screen version of the standard loading experience */
export default function PaymentOverlay({ message = 'Please wait…' }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Subtle Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-white/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 flex flex-col items-center overflow-hidden"
      >
        {/* Animated Rings Container */}
        <div className="relative h-24 w-24 mb-8">
          {/* Outer Ring - Blue */}
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#00B4D8] border-r-[#00B4D8]/30" style={{ animationDuration: '1.5s' }}></div>

          {/* Inner Ring - Yellow */}
          <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-b-[#FDB813] border-l-[#FDB813]/30" style={{ animationDuration: '1s', animationDirection: 'reverse' }}></div>

          {/* Center Pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-ping rounded-full bg-[#00B4D8]"></div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-3">
          <h3 className="text-xl font-black tracking-[0.2em] text-[#00B4D8] animate-pulse uppercase">
            ABRITECH
          </h3>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-bold text-gray-500">{message}</span>
            <div className="flex gap-0.5">
              <span className="h-1.5 w-1.5 bg-[#00B4D8] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-1.5 w-1.5 bg-[#00B4D8] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-1.5 w-1.5 bg-[#00B4D8] rounded-full animate-bounce"></span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
