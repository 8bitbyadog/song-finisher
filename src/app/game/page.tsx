"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Game Types
interface Position {
  x: number;
  y: number;
}

interface Card {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  element: string;
  quote: string;
}

interface GameState {
  character: string;
  track: string;
  mode: string;
  position: Position;
  currentZone: string;
  momentum: number;
  cards: Card[];
  achievements: string[];
  timeRemaining: number;
  currentChallenge: Challenge | null;
}

interface Challenge {
  id: string;
  name: string;
  timeLimit: number;
  reward: 'momentum' | 'card' | 'achievement';
}

// Game Constants
const CHARACTERS = [
  { id: 'eixi-3', name: 'Eixi 3', element: 'fire', specialty: 'Spirit Conductor' },
  { id: 'dj-jammy', name: 'DJ Jammy Jams', element: 'air', specialty: 'Train Conductor' },
  { id: 'dream-girl', name: 'Dream Girl', element: 'earth', specialty: 'Music Conductor' },
  { id: 'sharkwitch', name: 'Sharkwitch', element: 'water', specialty: 'Balanced Approach' }
];

const TRACKS = [
  { id: 'earth', name: 'Earth', description: 'Basic Song Structure - grounding, foundation' },
  { id: 'water', name: 'Water', description: 'Production - flow, emotion, depth' },
  { id: 'air', name: 'Air', description: 'Promotion - communication, sharing' },
  { id: 'fire', name: 'Fire', description: 'Live Performance - passion, energy' }
];

const MODES = [
  { id: 'guitar', name: 'Guitar', icon: '🎸' },
  { id: 'piano', name: 'Piano', icon: '🎹' },
  { id: 'ableton', name: 'Ableton', icon: '⚡' },
  { id: 'logic', name: 'Logic Pro', icon: '🔊' }
];

const ZONES = {
  earth: { x: [0, 4], y: [0, 4] },
  water: { x: [6, 10], y: [0, 4] },
  air: { x: [0, 4], y: [6, 10] },
  fire: { x: [6, 10], y: [6, 10] },
  neutral: { x: [5, 5], y: [5, 5] }
};

const ZONE_CHALLENGES: Record<string, Challenge[]> = {
  earth: [
    { id: 'chord-prog', name: 'Create a Chord Progression', timeLimit: 300, reward: 'momentum' },
    { id: 'rhythm', name: 'Write a Basic Rhythm', timeLimit: 180, reward: 'card' },
    { id: 'structure', name: 'Outline Song Structure', timeLimit: 240, reward: 'achievement' }
  ],
  water: [
    { id: 'mixing', name: 'Mix a Section', timeLimit: 300, reward: 'momentum' },
    { id: 'effects', name: 'Add Effects Chain', timeLimit: 180, reward: 'card' },
    { id: 'sound', name: 'Design a Sound', timeLimit: 240, reward: 'achievement' }
  ],
  air: [
    { id: 'social', name: 'Plan Social Post', timeLimit: 180, reward: 'momentum' },
    { id: 'release', name: 'Schedule Release', timeLimit: 240, reward: 'card' },
    { id: 'audience', name: 'Engage Audience', timeLimit: 300, reward: 'achievement' }
  ],
  fire: [
    { id: 'stage', name: 'Plan Stage Setup', timeLimit: 240, reward: 'momentum' },
    { id: 'performance', name: 'Practice Performance', timeLimit: 300, reward: 'card' },
    { id: 'energy', name: 'Energy Management', timeLimit: 180, reward: 'achievement' }
  ]
};

const cards: Card[] = [
  { id: 'card-1', name: 'Structure Creates Freedom', rarity: 'common', element: 'earth', quote: `"Progress, not perfection, is what we should be asking of ourselves." - Julia Cameron` },
  { id: 'card-2', name: 'First Drafts Are Meant To Be Rough', rarity: 'uncommon', element: 'earth', quote: `"Done is better than good." - Elizabeth Gilbert` },
  { id: 'card-3', name: 'The Melody Is The Memory Device', rarity: 'rare', element: 'water', quote: `"To create is to bring something into existence that wasn't there before." - Rick Rubin` },
  { id: 'card-4', name: 'A Finished Demo Beats A Perfect Idea', rarity: 'legendary', element: 'air', quote: `"The most important thing about art is to work. Nothing else matters except sitting down every day and trying." - Steven Pressfield` }
];

// Helper function to determine zone for a position
function getZoneForPosition(position: Position): string | null {
  if (position.x < 2 && position.y < 2) return 'earth';
  if (position.x >= 2 && position.y < 2) return 'water';
  if (position.x < 2 && position.y >= 2) return 'air';
  if (position.x >= 2 && position.y >= 2) return 'fire';
  return null;
}

export default function GamePage() {
  // Game State
  const [character, setCharacter] = useState<string>('eixi-3');
  const [track, setTrack] = useState<string>('earth');
  const [mode, setMode] = useState<string>('guitar');
  const [position, setPosition] = useState<Position>({ x: 5, y: 5 });
  const [currentZone, setCurrentZone] = useState<string>('neutral');
  const [dice, setDice] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentCard, setCurrentCard] = useState<Card>(cards[0]);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>({
    character: 'eixi-3',
    track: 'earth',
    mode: 'guitar',
    position: { x: 5, y: 5 },
    currentZone: 'neutral',
    momentum: 0,
    cards: [],
    achievements: [],
    timeRemaining: 0,
    currentChallenge: null
  });
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Zone Detection
  useEffect(() => {
    const { x, y } = position;
    
    let newZone = 'neutral';
    if (x >= ZONES.earth.x[0] && x <= ZONES.earth.x[1] && y >= ZONES.earth.y[0] && y <= ZONES.earth.y[1]) {
      newZone = 'earth';
    } else if (x >= ZONES.water.x[0] && x <= ZONES.water.x[1] && y >= ZONES.water.y[0] && y <= ZONES.water.y[1]) {
      newZone = 'water';
    } else if (x >= ZONES.air.x[0] && x <= ZONES.air.x[1] && y >= ZONES.air.y[0] && y <= ZONES.air.y[1]) {
      newZone = 'air';
    } else if (x >= ZONES.fire.x[0] && x <= ZONES.fire.x[1] && y >= ZONES.fire.y[0] && y <= ZONES.fire.y[1]) {
      newZone = 'fire';
    }
    
    if (newZone !== currentZone) {
      setCurrentZone(newZone);
      handleZoneEntry(newZone);
    }
  }, [position, currentZone]);

  // Handle Zone Entry
  const handleZoneEntry = (zone: string) => {
    if (zone !== 'neutral' && zone !== gameState.currentZone) {
      const challenges = ZONE_CHALLENGES[zone as keyof typeof ZONE_CHALLENGES];
      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
      
      setGameState(prev => ({
        ...prev,
        currentZone: zone,
        currentChallenge: randomChallenge,
        timeRemaining: randomChallenge.timeLimit
      }));
    }
  };

  // Game Actions
  const rollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      const newRoll = Math.floor(Math.random() * 6) + 1;
      setDice(newRoll);
      setIsRolling(false);
    }, 1000);
  };

  const drawCard = () => {
    setIsFlipping(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * cards.length);
      setCurrentCard(cards[randomIndex]);
      setIsFlipping(false);
    }, 500);
  };

  const completeChallenge = () => {
    const { currentChallenge } = gameState;
    if (!currentChallenge) return;

    switch (currentChallenge.reward) {
      case 'momentum':
        setGameState(prev => ({
          ...prev,
          momentum: prev.momentum + 1
        }));
        break;
      case 'card':
        drawCard();
        break;
      case 'achievement':
        setGameState(prev => ({
          ...prev,
          achievements: [...prev.achievements, currentChallenge.id]
        }));
        break;
    }

    setGameState(prev => ({
      ...prev,
      currentChallenge: null,
      timeRemaining: 0
    }));
  };

  useEffect(() => {
    // Start with the game board in its initial state
    const gameBoard = document.querySelector('.game-board');
    if (gameBoard) {
      gameBoard.classList.add('initial-state');
    }

    // After a short delay, transition to the game state
    setTimeout(() => {
      if (gameBoard) {
        gameBoard.classList.remove('initial-state');
        gameBoard.classList.add('game-state');
      }
      
      // Show the game content after the board is in position
      setTimeout(() => {
        setShowContent(true);
      }, 1000);
    }, 100);
  }, []);

  return (
    <div className="min-h-screen p-4 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl mb-8 text-center pixel-border p-4">
          Song Finisher
        </h1>
        
        <div className="relative">
          {/* Box Sides */}
          <div className="box-side box-side-left"></div>
          <div className="box-side box-side-right"></div>
          <div className="box-side box-side-top"></div>
          <div className="box-side box-side-bottom"></div>
          
          {/* Game Board */}
          <div className="game-board p-4">
            <div className={`game-content ${showContent ? 'visible' : ''}`}>
              {/* Character Selection */}
              <div className="mb-4 grid grid-cols-4 gap-4">
                {CHARACTERS.map(char => (
                  <button
                    key={char.id}
                    onClick={() => setCharacter(char.id)}
                    className={`pixel-border p-2 text-center ${
                      character === char.id ? 'bg-blue-900' : ''
                    }`}
                  >
                    <div className="text-sm mb-1">{char.name}</div>
                    <div className="text-xs opacity-75">{char.specialty}</div>
                  </button>
                ))}
              </div>

              {/* Game Map */}
              <div className="grid grid-cols-4 gap-1 mb-4">
                {Array.from({ length: 16 }).map((_, i) => {
                  const row = Math.floor(i / 4);
                  const col = i % 4;
                  const position = { x: col, y: row };
                  const isCurrentPosition = position.x === gameState.position.x && position.y === gameState.position.y;
                  const zone = getZoneForPosition(position);
                  
                  return (
                    <div
                      key={i}
                      className={`
                        aspect-square relative
                        ${zone ? `${zone}-bg` : 'bg-gray-800'}
                        ${isCurrentPosition ? 'ring-2 ring-yellow-400' : ''}
                        transition-all duration-300
                      `}
                    >
                      {isCurrentPosition && (
                        <div className="game-piece absolute inset-2" />
                      )}
                      {zone && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                          {zone}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Game Tools */}
              <div className="grid grid-cols-2 gap-4">
                <div className="pixel-border p-4">
                  <h2 className="text-lg mb-2">Momentum Dice</h2>
                  <div className="flex gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-white text-black flex items-center justify-center"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={rollDice}
                    className="pixel-button mt-2 w-full"
                  >
                    Roll Dice
                  </button>
                </div>

                <div className="pixel-border p-4">
                  <h2 className="text-lg mb-2">Cards</h2>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {cards.map((card, i) => (
                      <div
                        key={i}
                        className="card min-w-[120px] flex-shrink-0"
                      >
                        <div className="text-xs mb-1">{card.quote}</div>
                        <div className="text-[10px] opacity-75">
                          {card.rarity}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={drawCard}
                    className="pixel-button mt-2 w-full"
                  >
                    Draw Card
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Display */}
        {gameState.currentChallenge && (
          <div className="mt-4 pixel-border p-4">
            <h2 className="text-lg mb-2">Current Challenge</h2>
            <div className="text-sm mb-2">{gameState.currentChallenge.name}</div>
            <div className="w-full bg-gray-700 h-2">
              <div
                className="bg-blue-500 h-full transition-all duration-1000"
                style={{ width: `${(gameState.timeRemaining / gameState.currentChallenge.timeLimit) * 100}%` }}
              />
            </div>
            <div className="text-xs mt-1">
              Time: {gameState.timeRemaining}s / {gameState.currentChallenge.timeLimit}s
            </div>
            <button
              className="pixel-button w-full cursor-interact"
              onClick={completeChallenge}
            >
              Complete Challenge
            </button>
          </div>
        )}

        {/* Achievement Display */}
        {gameState.achievements.length > 0 && (
          <div className="mt-4 pixel-border p-4">
            <h2 className="text-lg mb-2">Achievements</h2>
            <div className="grid grid-cols-2 gap-2">
              {gameState.achievements.map(achievement => (
                <div
                  key={achievement}
                  className="text-sm"
                >
                  {achievement}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 