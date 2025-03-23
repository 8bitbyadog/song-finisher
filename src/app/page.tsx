"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [isOpening, setIsOpening] = useState(false);
  const router = useRouter();

  const handleOpenBox = () => {
    setIsOpening(true);
    // After animation completes, navigate to game
    setTimeout(() => {
      router.push('/game');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className={`relative w-[600px] h-[600px] ${isOpening ? 'opening-animation' : ''}`}>
        {/* Game Box Container */}
        <div className="absolute inset-0 bg-[#2C1810] border-8 border-[#8B4513] transform-gpu">
          {/* Box Front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <h1 className="text-6xl font-bold text-[#FFD700] mb-8 text-center font-pixel">
              Song Finisher
            </h1>
            <div className="w-32 h-32 mb-8 relative">
              {/* Musical Note Symbol */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#FFD700] rounded-full relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-8 bg-[#FFD700] rounded-t-full"></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-8 bg-[#FFD700] rounded-b-full"></div>
                </div>
              </div>
            </div>
            <button
              onClick={handleOpenBox}
              className="px-8 py-4 bg-[#FFD700] text-[#2C1810] font-bold rounded-lg
                       hover:bg-[#FFA500] transition-colors duration-300
                       transform hover:scale-105 active:scale-95"
            >
              Open Box
            </button>
          </div>

          {/* Box Sides */}
          <div className="absolute inset-0 transform-gpu">
            <div className="absolute inset-0 bg-[#8B4513] transform -translate-x-full rotate-y-90 origin-right"></div>
            <div className="absolute inset-0 bg-[#8B4513] transform translate-x-full -rotate-y-90 origin-left"></div>
            <div className="absolute inset-0 bg-[#8B4513] transform -translate-y-full rotate-x-90 origin-bottom"></div>
            <div className="absolute inset-0 bg-[#8B4513] transform translate-y-full -rotate-x-90 origin-top"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
