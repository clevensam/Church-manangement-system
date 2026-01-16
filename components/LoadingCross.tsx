import React from 'react';

const LoadingCross: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[120px] p-6 animate-in fade-in duration-500">
      <div className="relative mb-4">
        {/* Divine Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-emerald-400/20 blur-xl rounded-full animate-pulse"></div>
        
        {/* The Cross */}
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className="w-14 h-14 text-emerald-600 relative z-10 drop-shadow-lg"
          style={{ 
             filter: 'drop-shadow(0px 4px 6px rgba(5, 150, 105, 0.2))',
             animation: 'pulse-glow 2s infinite ease-in-out'
          }}
        >
          {/* Latin Cross Geometry */}
          <path d="M10.5 2h3v6h6v3h-6v11h-3v-11h-6v-3h6z" />
        </svg>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-bold text-emerald-800 tracking-[0.3em] uppercase opacity-80 animate-pulse">
            Inapakia
        </span>
        {/* Subtle Progress Indicator */}
        <div className="h-0.5 w-12 bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-1/3 animate-[slide_1.5s_infinite_ease-in-out] rounded-full"></div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingCross;