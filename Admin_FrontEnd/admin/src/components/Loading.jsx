import React from 'react';

const Loading = ({ fullScreen = true, message = 'Loading...', size = 'default' }) => {
    // Unified version (used for both fullScreen and inline, with different wrappers)
    const LoadingContent = () => (
        <div className="relative flex flex-col items-center">
            {/* Animated Logo/Spinner Container */}
            <div className={`relative ${fullScreen ? 'h-24 w-24' : (size === 'small' ? 'h-8 w-8' : 'h-16 w-16')}`}>
                {/* Outer Ring - Blue */}
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#00B4D8] border-r-[#00B4D8]/30" style={{ animationDuration: '1.5s' }}></div>

                {/* Inner Ring - Yellow */}
                <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-b-[#FDB813] border-l-[#FDB813]/30" style={{ animationDuration: '1s', animationDirection: 'reverse' }}></div>

                {/* Center Pulse */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`${fullScreen ? 'h-4 w-4' : (size === 'small' ? 'h-1 w-1' : 'h-2 w-2')} animate-ping rounded-full bg-[#00B4D8]`}></div>
                </div>
            </div>

            {/* Text Content */}
            {size !== 'small' && (
                <div className={`${fullScreen ? 'mt-8' : 'mt-4'} flex flex-col items-center gap-2`}>
                    <h3 className={`${fullScreen ? 'text-xl' : 'text-sm'} font-bold tracking-widest text-[#00B4D8] animate-pulse uppercase`}>
                        ABRITECH
                    </h3>
                    <div className="flex items-center gap-1">
                        <span className={`${fullScreen ? 'text-sm' : 'text-[10px]'} font-medium text-gray-500`}>{message}</span>
                        <span className="flex gap-0.5">
                            <span className={`${fullScreen ? 'h-1.5 w-1.5' : 'h-1 w-1'} bg-[#00B4D8] rounded-full animate-bounce [animation-delay:-0.3s]`}></span>
                            <span className={`${fullScreen ? 'h-1.5 w-1.5' : 'h-1 w-1'} bg-[#00B4D8] rounded-full animate-bounce [animation-delay:-0.15s]`}></span>
                            <span className={`${fullScreen ? 'h-1.5 w-1.5' : 'h-1 w-1'} bg-[#00B4D8] rounded-full animate-bounce`}></span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md transition-all duration-500">
                <LoadingContent />
            </div>
        );
    }

    // Inline version
    return (
        <div className="flex w-full items-center justify-center py-12">
            <LoadingContent />
        </div>
    );
};

export default Loading;
