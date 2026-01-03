import React from 'react';

const Loading = ({ fullScreen = true, message = 'Loading...' }) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md transition-all duration-500">
                <div className="relative flex flex-col items-center">
                    {/* Animated Logo/Spinner Container */}
                    <div className="relative h-24 w-24">
                        {/* Outer Ring - Blue */}
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#00B4D8] border-r-[#00B4D8]/30" style={{ animationDuration: '1.5s' }}></div>

                        {/* Inner Ring - Yellow */}
                        <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-[#FDB813] border-l-[#FDB813]/30" style={{ animationDuration: '1s', animationDirection: 'reverse' }}></div>

                        {/* Center Pulse */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-4 w-4 animate-ping rounded-full bg-[#00B4D8]"></div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="mt-8 flex flex-col items-center gap-2">
                        <h3 className="text-xl font-bold tracking-widest text-[#00B4D8] animate-pulse">
                            ABRITECH
                        </h3>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-500">{message}</span>
                            <span className="flex gap-1">
                                <span className="bg-[#00B4D8] h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="bg-[#00B4D8] h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="bg-[#00B4D8] h-1.5 w-1.5 rounded-full animate-bounce"></span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Inline version
    return (
        <div className="flex w-full items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#00B4D8]"></div>
                    <div className="absolute inset-1 animate-spin rounded-full border-4 border-transparent border-b-[#FDB813]" style={{ animationDirection: 'reverse' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-500 animate-pulse">{message}</span>
            </div>
        </div>
    );
};

export default Loading;
