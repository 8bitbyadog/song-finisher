"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Game Types
type Position = { x: number; y: number };
type GameState = {
  position: Position;
  momentum: number;
  cards: string[];
  achievements: string[];
  currentChallenge: any;
  timeRemaining: number;
  currentZone: string;
};

// Game Constants
const ZONES = {
  earth: { x: [0, 1], y: [0, 1] },
  water: { x: [2, 3], y: [0, 1] },
  air: { x: [0, 1], y: [2, 3] },
  fire: { x: [2, 3], y: [2, 3] }
};

const ZONE_CHALLENGES = {
  earth: [
    { id: 'earth-1', title: 'Ground Your Melody', description: 'Create a solid foundation for your song', timeLimit: 300 },
    { id: 'earth-2', title: 'Root Your Chords', description: 'Establish the core chord progression', timeLimit: 300 }
  ],
  water: [
    { id: 'water-1', title: 'Flow With the Rhythm', description: 'Let the rhythm guide your writing', timeLimit: 300 },
    { id: 'water-2', title: 'Dive Into Emotions', description: 'Express deep emotions in your lyrics', timeLimit: 300 }
  ],
  air: [
    { id: 'air-1', title: 'Float With Ideas', description: 'Let your creativity soar', timeLimit: 300 },
    { id: 'air-2', title: 'Breathe Life Into Lyrics', description: 'Add dynamic elements to your song', timeLimit: 300 }
  ],
  fire: [
    { id: 'fire-1', title: 'Ignite Your Passion', description: 'Channel your energy into the song', timeLimit: 300 },
    { id: 'fire-2', title: 'Polish Your Performance', description: 'Add finishing touches to your masterpiece', timeLimit: 300 }
  ]
};

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>({
    position: { x: 0, y: 0 },
    momentum: 0,
    cards: [],
    achievements: [],
    currentChallenge: null,
    timeRemaining: 0,
    currentZone: 'neutral'
  });

  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const handleMove = (x: number, y: number) => {
    setGameState(prev => ({
      ...prev,
      position: { x, y }
    }));
  };

  const rollDice = () => {
    setIsRolling(true);
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceRoll(roll);
    setGameState(prev => ({
      ...prev,
      momentum: roll
    }));
    setTimeout(() => setIsRolling(false), 1000);
  };

  const getZoneForPosition = (x: number, y: number): string => {
    if (x >= ZONES.earth.x[0] && x <= ZONES.earth.x[1] && y >= ZONES.earth.y[0] && y <= ZONES.earth.y[1]) return 'earth';
    if (x >= ZONES.water.x[0] && x <= ZONES.water.x[1] && y >= ZONES.water.y[0] && y <= ZONES.water.y[1]) return 'water';
    if (x >= ZONES.air.x[0] && x <= ZONES.air.x[1] && y >= ZONES.air.y[0] && y <= ZONES.air.y[1]) return 'air';
    if (x >= ZONES.fire.x[0] && x <= ZONES.fire.x[1] && y >= ZONES.fire.y[0] && y <= ZONES.fire.y[1]) return 'fire';
    return 'neutral';
  };

  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [diceRolls, setDiceRolls] = useState<{ [key: string]: number[] }>({
    earth: [],
    ocean: [],
    air: [],
    fire: []
  });

  const handleZoneClick = (zone: string) => {
    setSelectedZone(zone);
  };

  return (
    <main className="min-h-screen bg-wood p-8">
      <div className="max-w-4xl mx-auto">
        {/* Ornate Game Board */}
        <div className="game-board-container">
          <div className="ornate-frame">
            {/* Corner Orbs */}
            <div className="corner-orb top-left"></div>
            <div className="corner-orb top-right"></div>
            <div className="corner-orb bottom-left"></div>
            <div className="corner-orb bottom-right"></div>

            {/* Game Grid */}
            <div className="game-grid">
              {/* Earth Quadrant */}
              <div 
                className="quadrant earth-quadrant"
                onClick={() => handleZoneClick('earth')}
              >
                <div className="quadrant-content">
                  <div className="quadrant-art earth-art"></div>
                </div>
              </div>

              {/* Ocean Quadrant */}
              <div 
                className="quadrant ocean-quadrant"
                onClick={() => handleZoneClick('ocean')}
              >
                <div className="quadrant-content">
                  <div className="quadrant-art ocean-art"></div>
                </div>
              </div>

              {/* Air Quadrant */}
              <div 
                className="quadrant air-quadrant"
                onClick={() => handleZoneClick('air')}
              >
                <div className="quadrant-content">
                  <div className="quadrant-art air-art"></div>
                </div>
              </div>

              {/* Fire Quadrant */}
              <div 
                className="quadrant fire-quadrant"
                onClick={() => handleZoneClick('fire')}
              >
                <div className="quadrant-content">
                  <div className="quadrant-art fire-art"></div>
                </div>
              </div>

              {/* Center Medallion */}
              <div className="center-medallion">
                <div className="medallion-content"></div>
              </div>
            </div>
          </div>

          {/* Dice Areas */}
          <div className="dice-areas">
            <div className="dice-area earth-dice">
              <h3>EARTH</h3>
              <div className="dice-collection">
                {/* Earth themed dice */}
                <div className="die earth-die">B</div>
                <div className="die earth-die">E</div>
              </div>
            </div>

            <div className="dice-area ocean-dice">
              <h3>OCEAN</h3>
              <div className="dice-collection">
                {/* Ocean themed dice */}
                <div className="die ocean-die">O</div>
              </div>
            </div>

            <div className="dice-area air-dice">
              <h3>AIR</h3>
              <div className="dice-collection">
                {/* Air themed dice */}
                <div className="die air-die">A</div>
              </div>
            </div>

            <div className="dice-area fire-dice">
              <h3>FIRE</h3>
              <div className="dice-collection">
                {/* Fire themed dice */}
                <div className="die fire-die">F</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
