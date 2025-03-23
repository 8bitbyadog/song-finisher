"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Add type declarations
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

type ChallengeReward = 'momentum' | 'card' | 'achievement';

interface Challenge {
  id: string;
  name: string;
  timeLimit: number;
  reward: ChallengeReward;
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

interface TimerState {
  isActive: boolean;
  timeRemaining: number;
  intervalId: NodeJS.Timeout | null;
}

type CharacterAbilityAction = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  currentZone: string,
  currentCard?: Card,
  setCurrentCard?: React.Dispatch<React.SetStateAction<Card>>
) => void;

interface CharacterAbility {
  name: string;
  description: string;
  zoneBonus: string;
  specialAction: CharacterAbilityAction;
}

// Update character abilities with proper types
const CHARACTER_ABILITIES: Record<string, CharacterAbility> = {
  'eixi-3': {
    name: 'Spirit Conductor',
    description: 'Extra momentum in Fire zone, special performance cards',
    zoneBonus: 'fire',
    specialAction: (gameState: GameState, setGameState: React.Dispatch<React.SetStateAction<GameState>>, currentZone: string) => {
      if (currentZone === 'fire') {
        setGameState((prev: GameState) => ({
          ...prev,
          momentum: prev.momentum + 2
        }));
      }
    }
  },
  'dj-jammy': {
    name: 'Train Conductor',
    description: 'Faster movement, rhythm-based challenges',
    zoneBonus: 'air',
    specialAction: (gameState: GameState, setGameState: React.Dispatch<React.SetStateAction<GameState>>) => {
      if (gameState.currentChallenge?.id === 'rhythm') {
        setGameState((prev: GameState) => ({
          ...prev,
          timeRemaining: prev.timeRemaining + 60
        }));
      }
    }
  },
  'dream-girl': {
    name: 'Music Conductor',
    description: 'Better card draws, structure guidance',
    zoneBonus: 'earth',
    specialAction: (
      gameState: GameState,
      setGameState: React.Dispatch<React.SetStateAction<GameState>>,
      currentZone: string,
      currentCard?: Card,
      setCurrentCard?: React.Dispatch<React.SetStateAction<Card>>
    ) => {
      if (currentZone === 'earth' && currentCard && setCurrentCard) {
        const improvedCard: Card = {
          ...currentCard,
          rarity: currentCard.rarity === 'common' ? 'uncommon' : currentCard.rarity
        };
        setCurrentCard(improvedCard);
      }
    }
  },
  'sharkwitch': {
    name: 'Balanced Approach',
    description: 'Adaptive abilities, balanced rewards',
    zoneBonus: 'water',
    specialAction: (gameState: GameState, setGameState: React.Dispatch<React.SetStateAction<GameState>>) => {
      setGameState((prev: GameState) => ({
        ...prev,
        momentum: prev.momentum + 1,
        timeRemaining: prev.timeRemaining + 30
      }));
    }
  }
};

// Game constants
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

// Define zone boundaries for elemental sections
const ZONES = {
  earth: { x: [0, 4], y: [0, 4] },
  water: { x: [6, 10], y: [0, 4] },
  air: { x: [0, 4], y: [6, 10] },
  fire: { x: [6, 10], y: [6, 10] },
  neutral: { x: [5, 5], y: [5, 5] }
};

// Update zone challenges with proper types
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

// Update sample cards with proper types
const cards: Card[] = [
  { id: 'card-1', name: 'Structure Creates Freedom', rarity: 'common', element: 'earth', quote: `"Progress, not perfection, is what we should be asking of ourselves." - Julia Cameron` },
  { id: 'card-2', name: 'First Drafts Are Meant To Be Rough', rarity: 'uncommon', element: 'earth', quote: `"Done is better than good." - Elizabeth Gilbert` },
  { id: 'card-3', name: 'The Melody Is The Memory Device', rarity: 'rare', element: 'water', quote: `"To create is to bring something into existence that wasn't there before." - Rick Rubin` },
  { id: 'card-4', name: 'A Finished Demo Beats A Perfect Idea', rarity: 'legendary', element: 'air', quote: `"The most important thing about art is to work. Nothing else matters except sitting down every day and trying." - Steven Pressfield` }
];

export default function TestPage() {
  const [character, setCharacter] = useState<string>('eixi-3');
  const [track, setTrack] = useState<string>('earth');
  const [mode, setMode] = useState<string>('guitar');
  const [position, setPosition] = useState<Position>({ x: 5, y: 5 });
  const [showControls, setShowControls] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [currentCard, setCurrentCard] = useState<Card>(cards[0]);
  const [dice, setDice] = useState<number>(1);
  const [currentZone, setCurrentZone] = useState<string>('neutral');
  const [isRolling, setIsRolling] = useState<boolean>(false);
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
  const [timer, setTimer] = useState<TimerState>({
    isActive: false,
    timeRemaining: 0,
    intervalId: null
  });
  
  // Update state setters with proper types
  const handlePositionUpdate = (prev: Position, update: Partial<Position>): Position => ({
    ...prev,
    ...update
  });

  const handleGameStateUpdate = (prev: GameState, update: Partial<GameState>): GameState => ({
    ...prev,
    ...update
  });

  const handleTimerUpdate = (prev: TimerState, update: Partial<TimerState>): TimerState => ({
    ...prev,
    ...update
  });
  
  // Determine which zone the player is in based on position
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
      // Add zone transition animation by setting a class
      document.getElementById('map-container')?.classList.add('zone-fade');
      setTimeout(() => {
        document.getElementById('map-container')?.classList.remove('zone-fade');
      }, 500);
      
      setCurrentZone(newZone);
    }
  }, [position, currentZone]);
  
  // Update position setters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setPosition(prev => handlePositionUpdate(prev, { y: Math.max(0, prev.y - 1) }));
      } else if (e.key === 'ArrowDown') {
        setPosition(prev => handlePositionUpdate(prev, { y: Math.min(10, prev.y + 1) }));
      } else if (e.key === 'ArrowLeft') {
        setPosition(prev => handlePositionUpdate(prev, { x: Math.max(0, prev.x - 1) }));
      } else if (e.key === 'ArrowRight') {
        setPosition(prev => handlePositionUpdate(prev, { x: Math.min(10, prev.x + 1) }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Roll dice function
  const rollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      const newRoll = Math.floor(Math.random() * 6) + 1;
      setDice(newRoll);
      setIsRolling(false);
    }, 1000);
  };
  
  // Draw card function
  const drawCard = () => {
    setIsFlipping(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * cards.length);
      setCurrentCard(cards[randomIndex]);
      setIsFlipping(false);
    }, 500);
  };

  // Get cell class based on position and current zone
  const getCellClass = (x: number, y: number, baseClass: string) => {
    // Helper function to check if cell is in a zone
    const isInZone = (zone: string) => {
      const z = ZONES[zone as keyof typeof ZONES];
      return x >= z.x[0] && x <= z.x[1] && y >= z.y[0] && y <= z.y[1];
    };
    
    let cellClasses = baseClass;
    
    // Add pulse effect to landmarks
    if ((x === 2 && y === 2) || (x === 8 && y === 2) || (x === 2 && y === 8) || (x === 8 && y === 8)) {
      cellClasses += ' pulse-hover';
    }
    
    // If we're in a specific zone, mute colors of other zones
    if (currentZone !== 'neutral') {
      // If cell is in current zone, show normal color
      if (isInZone(currentZone)) {
        return cellClasses;
      }
      
      // If cell is in another elemental zone, mute its color
      if (isInZone('earth') || isInZone('water') || isInZone('air') || isInZone('fire')) {
        return `${cellClasses} opacity-30 grayscale`;
      }
    }
    
    // Default return if we're in neutral zone or cell isn't in any zone
    return cellClasses;
  };

  // Handle zone entry
  const handleZoneEntry = () => {
    if (currentZone !== 'neutral' && currentZone !== gameState.currentZone) {
      const challenges = ZONE_CHALLENGES[currentZone as keyof typeof ZONE_CHALLENGES];
      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
      
      setGameState((prev: GameState) => ({
        ...prev,
        currentZone,
        currentChallenge: randomChallenge,
        timeRemaining: randomChallenge.timeLimit
      }));
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameState.currentChallenge && !timer.isActive) {
      const intervalId = setInterval(() => {
        setTimer((prev: TimerState) => {
          if (prev.timeRemaining <= 1) {
            clearInterval(prev.intervalId!);
            return {
              isActive: false,
              timeRemaining: 0,
              intervalId: null
            };
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1
          };
        });
      }, 1000);

      setTimer({
        isActive: true,
        timeRemaining: gameState.timeRemaining,
        intervalId
      });
    }

    return () => {
      if (timer.intervalId) {
        clearInterval(timer.intervalId);
      }
    };
  }, [gameState.currentChallenge]);

  // Update character ability activation
  const activateCharacterAbility = () => {
    const ability = CHARACTER_ABILITIES[character];
    if (ability) {
      if (ability.name === 'Music Conductor' && currentCard && setCurrentCard) {
        ability.specialAction(gameState, setGameState, currentZone, currentCard, setCurrentCard);
      } else {
        ability.specialAction(gameState, setGameState, currentZone);
      }
    }
  };

  // Update game state setters
  const completeChallenge = () => {
    const { currentChallenge } = gameState;
    if (!currentChallenge) return;

    activateCharacterAbility();

    switch (currentChallenge.reward) {
      case 'momentum':
        setGameState(prev => handleGameStateUpdate(prev, {
          momentum: prev.momentum + 1
        }));
        break;
      case 'card':
        drawCard();
        break;
      case 'achievement':
        setGameState(prev => handleGameStateUpdate(prev, {
          achievements: [...prev.achievements, currentChallenge.id]
        }));
        break;
    }

    setGameState(prev => handleGameStateUpdate(prev, {
      currentChallenge: null,
      timeRemaining: 0
    }));
    setTimer(prev => handleTimerUpdate(prev, {
      isActive: false,
      timeRemaining: 0,
      intervalId: null
    }));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 text-white cursor-normal">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="pixel-button inline-block">
            Back to Home
          </Link>
          
          <div className="flex space-x-2">
            <button 
              className="pixel-button cursor-interact"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? '◀ Hide Sidebar' : 'Show Sidebar ▶'}
            </button>
            
            <button 
              className="pixel-button cursor-interact lg:hidden"
              onClick={() => setShowControls(!showControls)}
            >
              {showControls ? 'Hide Controls' : 'Show Controls'}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* Left Sidebar - Controls */}
          {showSidebar && (
            <div className="md:w-1/4 lg:w-1/5 space-y-4">
              <div className={`pixel-border bg-[#2d3748] p-4 ${showControls ? 'block' : 'hidden md:block'}`}>
                <h2 className="text-center mb-4 text-sm">Character</h2>
                <div className="grid grid-cols-2 gap-2">
                  {CHARACTERS.map(char => (
                    <button
                      key={char.id}
                      className={`p-2 text-xs text-center ${char.element}-bg ${character === char.id ? 'ring-2 ring-white' : ''} cursor-interact`}
                      onClick={() => setCharacter(char.id)}
                      onMouseEnter={() => setShowTooltip(`${char.name}: ${char.specialty}`)}
                      onMouseLeave={() => setShowTooltip('')}
                    >
                      <span className="bounce-anim inline-block">{char.name}</span>
                    </button>
                  ))}
                </div>
                {showTooltip && (
                  <div className="mt-2 text-xs text-center">
                    {showTooltip}
                  </div>
                )}
              </div>
              
              <div className={`pixel-border bg-[#2d3748] p-4 ${showControls ? 'block' : 'hidden md:block'}`}>
                <h2 className="text-center mb-4 text-sm">Elemental Track</h2>
                <div className="grid grid-cols-2 gap-2">
                  {TRACKS.map(t => (
                    <button
                      key={t.id}
                      className={`p-2 text-xs text-center ${t.id}-bg ${track === t.id ? 'ring-2 ring-white' : ''} cursor-interact`}
                      onClick={() => setTrack(t.id)}
                      onMouseEnter={() => setShowTooltip(t.description)}
                      onMouseLeave={() => setShowTooltip('')}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
                {showTooltip && (
                  <div className="mt-2 text-xs text-center">
                    {showTooltip}
                  </div>
                )}
              </div>
              
              <div className={`pixel-border bg-[#2d3748] p-4 ${showControls ? 'block' : 'hidden md:block'}`}>
                <h2 className="text-center mb-4 text-sm">Instrument Mode</h2>
                <div className="grid grid-cols-2 gap-2">
                  {MODES.map(m => (
                    <button
                      key={m.id}
                      className={`p-2 text-xs text-center ${mode === m.id ? 'ring-2 ring-white' : ''} cursor-interact`}
                      onClick={() => setMode(m.id)}
                    >
                      <span className="bounce-anim inline-block">{m.icon}</span> {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Center - Overworld Map */}
          <div className="flex-1 flex flex-col">
            <div className="pixel-border bg-[#2d3748] p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-center text-sm flex-1">Overworld Map</h2>
                <span className={`text-xs font-pixel px-2 py-1 ${currentZone}-bg inline-block`}>
                  {currentZone.charAt(0).toUpperCase() + currentZone.slice(1)} Zone
                </span>
              </div>
              
              <div id="map-container" className="w-full max-w-2xl mx-auto aspect-square relative overflow-hidden pixel-border">
                <div className={`absolute inset-0 grid grid-cols-11 grid-rows-11 ${track}-bg`}>
                  {/* Generate grid elements */}
                  {Array(11*11).fill(0).map((_, index) => {
                    const x = index % 11;
                    const y = Math.floor(index / 11);
                    const isPlayerPos = x === position.x && y === position.y;
                    
                    // Add special landmarks based on position
                    let cellContent = null;
                    let cellClass = "";
                    
                    if (x === 2 && y === 2) {
                      cellClass = "earth-bg";
                      cellContent = "E";
                    } else if (x === 8 && y === 2) {
                      cellClass = "water-bg";
                      cellContent = "W";
                    } else if (x === 2 && y === 8) {
                      cellClass = "air-bg";
                      cellContent = "A";
                    } else if (x === 8 && y === 8) {
                      cellClass = "fire-bg";
                      cellContent = "F";
                    } else if ((x === 5 && y === 2) || (x === 5 && y === 8) || (x === 2 && y === 5) || (x === 8 && y === 5)) {
                      cellClass = "bg-gray-700";
                      cellContent = "•";
                    } else if (x === 5 || y === 5) {
                      cellClass = "bg-gray-800";
                    }
                    
                    // Apply visual muting based on current zone
                    const finalCellClass = getCellClass(x, y, cellClass);
                    
                    return (
                      <div 
                        key={`${x}-${y}`} 
                        className={`border border-black ${finalCellClass} flex items-center justify-center text-xs transition-all duration-300 cursor-interact`}
                        onClick={() => setPosition({x, y})}
                      >
                        {isPlayerPos ? (
                          <div className={`w-full h-full flex items-center justify-center bg-yellow-500 text-black float-idle`}>
                            @
                          </div>
                        ) : cellContent}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-2 max-w-xs mx-auto">
                <div></div>
                <button className="pixel-button p-1 cursor-interact" onClick={() => setPosition(prev => ({ ...prev, y: Math.max(0, prev.y - 1) }))}>
                  ▲
                </button>
                <div></div>
                <button className="pixel-button p-1 cursor-interact" onClick={() => setPosition(prev => ({ ...prev, x: Math.max(0, prev.x - 1) }))}>
                  ◄
                </button>
                <div className="p-1 text-center text-xs">
                  Move
                </div>
                <button className="pixel-button p-1 cursor-interact" onClick={() => setPosition(prev => ({ ...prev, x: Math.min(10, prev.x + 1) }))}>
                  ►
                </button>
                <div></div>
                <button className="pixel-button p-1 cursor-interact" onClick={() => setPosition(prev => ({ ...prev, y: Math.min(10, prev.y + 1) }))}>
                  ▼
                </button>
                <div></div>
              </div>
            </div>
            
            {/* Game Tools */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Momentum Dice */}
              <div className="pixel-border bg-[#2d3748] p-4">
                <h2 className="text-center mb-2 text-sm">Momentum Dice</h2>
                <div className="flex justify-center mb-2">
                  <div className={`pixel-border h-16 w-16 flex items-center justify-center text-2xl ${isRolling ? 'dice-roll' : ''}`}>
                    {dice}
                  </div>
                </div>
                <button className="pixel-button w-full cursor-interact" onClick={rollDice} disabled={isRolling}>
                  Roll Dice
                </button>
                
                <div className="mt-2 text-xs">
                  {dice === 1 && "Write a chorus first"}
                  {dice === 2 && "Start with a beat"}
                  {dice === 3 && "Begin with a memory"}
                  {dice === 4 && "Use a random chord progression"}
                  {dice === 5 && "Sample something unexpected"}
                  {dice === 6 && "Change your instrument"}
                </div>
              </div>
              
              {/* Collectible Cards */}
              <div className="pixel-border bg-[#2d3748] p-4">
                <h2 className="text-center mb-2 text-sm">Collectible Cards</h2>
                <div className={`pixel-border ${currentCard.element}-bg p-2 mb-2 text-xs h-40 flex flex-col ${isFlipping ? 'card-flip' : ''} ${currentCard.rarity === 'legendary' ? 'holographic-shine' : ''}`}>
                  <div className="text-center font-bold mb-1">{currentCard.name}</div>
                  <div className="text-right text-[8px] mb-2">
                    <span className={`
                      ${currentCard.rarity === 'common' ? 'text-gray-300' : ''}
                      ${currentCard.rarity === 'uncommon' ? 'text-green-300' : ''}
                      ${currentCard.rarity === 'rare' ? 'text-blue-300' : ''}
                      ${currentCard.rarity === 'legendary' ? 'text-purple-300' : ''}
                    `}>
                      ★ {currentCard.rarity}
                    </span>
                  </div>
                  <div className="flex-grow text-[8px] italic">{currentCard.quote}</div>
                </div>
                <button className="pixel-button w-full cursor-interact" onClick={drawCard} disabled={isFlipping}>
                  Draw Card
                </button>
              </div>
              
              {/* Chiptune Creator */}
              <div className="pixel-border bg-[#2d3748] p-4">
                <h2 className="text-center mb-2 text-sm">Chiptune Creator</h2>
                <div className="space-y-2">
                  <div className="flex items-center text-xs">
                    <span className="w-12">Drums</span>
                    <input type="range" className="flex-grow cursor-interact" />
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="w-12">Bass</span>
                    <input type="range" className="flex-grow cursor-interact" />
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="w-12">Melody</span>
                    <input type="range" className="flex-grow cursor-interact" />
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="w-12">Vocals</span>
                    <input type="range" className="flex-grow cursor-interact" />
                  </div>
                </div>
                <button className="pixel-button w-full mt-2 cursor-interact">
                  Play
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Update Challenge Display with Timer */}
      {gameState.currentChallenge && (
        <div className="fixed bottom-4 right-4 pixel-border bg-[#2d3748] p-4">
          <h3 className="text-sm mb-2">{gameState.currentChallenge.name}</h3>
          <div className="text-xs mb-2">
            Time: {Math.floor(timer.timeRemaining / 60)}:{(timer.timeRemaining % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-xs mb-2">
            Character Ability: {CHARACTER_ABILITIES[character].name}
          </div>
          <button 
            className="pixel-button w-full cursor-interact"
            onClick={completeChallenge}
            disabled={timer.timeRemaining === 0}
          >
            Complete Challenge
          </button>
        </div>
      )}
      
      {/* Add Achievement Display */}
      {gameState.achievements.length > 0 && (
        <div className="fixed top-4 right-4 pixel-border bg-[#2d3748] p-4">
          <h3 className="text-sm mb-2">Achievements</h3>
          <div className="space-y-1">
            {gameState.achievements.map(achievement => (
              <div key={achievement} className="text-xs">
                {achievement}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 