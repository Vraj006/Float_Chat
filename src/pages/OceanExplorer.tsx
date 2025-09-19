import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Compass, Gauge, ChevronUp, ChevronDown, RotateCcw, Waves, Fish, Anchor, Navigation, Zap, Battery, Target, AlertTriangle, Radar, Eye, EyeOff, X } from 'lucide-react';
import { motion } from 'framer-motion';

const OceanExplorer = () => {
  const [submarinePosition, setSubmarinePosition] = useState({ x: 0, y: 50, z: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [depth, setDepth] = useState(10);
  const [heading, setHeading] = useState(0);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [isSonarPanelOpen, setIsSonarPanelOpen] = useState(true);
  const [isMissionBriefingOpen, setIsMissionBriefingOpen] = useState(true);
  const [speed, setSpeed] = useState(0);
  const [battery, setBattery] = useState(100);
  const [hullIntegrity, setHullIntegrity] = useState(100);
  const [sonarActive, setSonarActive] = useState(false);
  const [oxygenLevel, setOxygenLevel] = useState(100);
  const [currentStrength, setCurrentStrength] = useState({ x: 0.5, y: 0, z: 0.3 });
  const [collectedSamples, setCollectedSamples] = useState(0);
  const [missionProgress, setMissionProgress] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [keysPressed, setKeysPressed] = useState(new Set());
  const [showControlsHelp, setShowControlsHelp] = useState(false);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const oceanRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Keyboard controls
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    setKeysPressed(prev => new Set([...prev, event.key.toLowerCase()]));
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setKeysPressed(prev => {
      const newSet = new Set(prev);
      newSet.delete(event.key.toLowerCase());
      return newSet;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Game loop with physics simulation
  useEffect(() => {
    const gameLoop = () => {
      setGameTime(prev => prev + 1);

      // Process keyboard input
      setVelocity(prevVel => {
        let newVel = { ...prevVel };
        const acceleration = 0.5;
        const maxSpeed = 8;

        // Forward/Backward (W/S or Up/Down arrows)
        if (keysPressed.has('w') || keysPressed.has('arrowup')) {
          newVel.z += Math.cos(heading * Math.PI / 180) * acceleration;
          newVel.x += Math.sin(heading * Math.PI / 180) * acceleration;
        }
        if (keysPressed.has('s') || keysPressed.has('arrowdown')) {
          newVel.z -= Math.cos(heading * Math.PI / 180) * acceleration;
          newVel.x -= Math.sin(heading * Math.PI / 180) * acceleration;
        }

        // Depth control (Q/E or Space/Shift)
        if (keysPressed.has('q') || keysPressed.has(' ')) {
          newVel.y += acceleration * 0.5;
        }
        if (keysPressed.has('e') || keysPressed.has('shift')) {
          newVel.y -= acceleration * 0.5;
        }

        // Apply friction and ocean current
        newVel.x = newVel.x * 0.95 + currentStrength.x * 0.1;
        newVel.y = newVel.y * 0.9;
        newVel.z = newVel.z * 0.95 + currentStrength.z * 0.1;

        // Limit max speed
        const totalSpeed = Math.sqrt(newVel.x * newVel.x + newVel.y * newVel.y + newVel.z * newVel.z);
        if (totalSpeed > maxSpeed) {
          const factor = maxSpeed / totalSpeed;
          newVel.x *= factor;
          newVel.y *= factor;
          newVel.z *= factor;
        }

        return newVel;
      });

      // Turning (A/D or Left/Right arrows)
      setHeading(prevHeading => {
        let newHeading = prevHeading;
        if (keysPressed.has('a') || keysPressed.has('arrowleft')) {
          newHeading += 3;
        }
        if (keysPressed.has('d') || keysPressed.has('arrowright')) {
          newHeading -= 3;
        }
        return newHeading % 360;
      });

      // UI Toggle shortcuts
      if (keysPressed.has('h')) {
        setShowControlsHelp(prev => !prev);
        keysPressed.delete('h'); // Prevent rapid toggling
      }
      if (keysPressed.has('m')) {
        setIsMissionBriefingOpen(prev => !prev);
        keysPressed.delete('m');
      }
      if (keysPressed.has('n')) {
        setIsSonarPanelOpen(prev => !prev);
        keysPressed.delete('n');
      }
      if (keysPressed.has('c')) {
        setIsControlPanelOpen(prev => !prev);
        keysPressed.delete('c');
      }
      if (keysPressed.has('i')) {
        setIsImmersiveMode(prev => {
          const newMode = !prev;
          if (newMode) {
            setIsSonarPanelOpen(false);
            setIsMissionBriefingOpen(false);
            setIsControlPanelOpen(false);
          } else {
            setIsSonarPanelOpen(true);
            setIsMissionBriefingOpen(true);
            setIsControlPanelOpen(true);
          }
          return newMode;
        });
        keysPressed.delete('i');
      }

      // Update position based on velocity
      setSubmarinePosition(prevPos => {
        const newPos = {
          x: Math.max(-300, Math.min(300, prevPos.x + velocity.x)),
          y: Math.max(10, Math.min(90, prevPos.y + velocity.y)),
          z: Math.max(-300, Math.min(300, prevPos.z + velocity.z))
        };
        return newPos;
      });

      // Update depth
      setDepth(Math.abs(submarinePosition.y - 50) + 10);

      // Update speed indicator
      setSpeed(Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z));

      // Battery consumption based on activity
      setBattery(prev => {
        let consumption = 0.02; // Base consumption
        if (speed > 5) consumption += 0.05; // High speed
        if (sonarActive) consumption += 0.1; // Sonar usage
        return Math.max(0, prev - consumption);
      });

      // Hull integrity effects from depth pressure
      setHullIntegrity(prev => {
        const pressureDamage = depth > 80 ? 0.05 : 0;
        return Math.max(0, prev - pressureDamage);
      });

      // Oxygen consumption
      setOxygenLevel(prev => Math.max(0, prev - 0.03));

      // Random current changes
      if (gameTime % 300 === 0) {
        setCurrentStrength({
          x: (Math.random() - 0.5) * 2,
          y: 0,
          z: (Math.random() - 0.5) * 2
        });
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [keysPressed, heading, velocity, submarinePosition, speed, sonarActive, depth, gameTime]);

  // Enhanced submarine movement with physics
  const moveSubmarine = (direction: string) => {
    const impulse = 2;

    setVelocity(prevVel => {
      let newVel = { ...prevVel };

      switch (direction) {
        case 'forward':
          newVel.z += Math.cos(heading * Math.PI / 180) * impulse;
          newVel.x += Math.sin(heading * Math.PI / 180) * impulse;
          break;
        case 'backward':
          newVel.z -= Math.cos(heading * Math.PI / 180) * impulse;
          newVel.x -= Math.sin(heading * Math.PI / 180) * impulse;
          break;
        case 'left':
          setHeading(prev => (prev + 15) % 360);
          break;
        case 'right':
          setHeading(prev => (prev - 15) % 360);
          break;
        case 'up':
          newVel.y += impulse * 0.7;
          break;
        case 'down':
          newVel.y -= impulse * 0.7;
          break;
      }

      return newVel;
    });
  };

  // Sonar scanning function
  const toggleSonar = () => {
    setSonarActive(!sonarActive);
  };

  // Sample collection function
  const collectSample = () => {
    if (depth > 30 && battery > 10) {
      setCollectedSamples(prev => prev + 1);
      setBattery(prev => prev - 5);
      setMissionProgress(prev => Math.min(100, prev + 20));
    }
  };

  // Emergency surface function
  const emergencySurface = () => {
    setVelocity({ x: 0, y: 5, z: 0 });
    setSubmarinePosition(prev => ({ ...prev, y: 90 }));
    setBattery(prev => Math.max(0, prev - 20));
  };

  // Get system status color
  const getStatusColor = (value: number, isReverse = false) => {
    if (isReverse) {
      if (value > 70) return 'text-red-400';
      if (value > 40) return 'text-yellow-400';
      return 'text-green-400';
    }
    if (value > 70) return 'text-green-400';
    if (value > 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Detect nearby objects
  const nearbyObjects = () => {
    const objects = [];
    const range = sonarActive ? 100 : 50;

    // Check ARGO floats
    const argoFloats = [
      { x: 120, y: 25, z: 80, label: 'ARGO-α' },
      { x: -180, y: 45, z: -60, label: 'ARGO-β' },
      { x: 220, y: 65, z: 120, label: 'ARGO-γ' },
      { x: -140, y: 35, z: -120, label: 'ARGO-δ' },
      { x: 160, y: 55, z: -80, label: 'ARGO-ε' }
    ];

    argoFloats.forEach(argo => {
      const distance = Math.sqrt(
        Math.pow(argo.x - submarinePosition.x, 2) +
        Math.pow(argo.y - submarinePosition.y, 2) +
        Math.pow(argo.z - submarinePosition.z, 2)
      );
      if (distance < range) {
        objects.push({ type: 'ARGO', label: argo.label, distance: distance.toFixed(0) });
      }
    });

    return objects;
  };

  // Generate realistic underwater particles
  const generateParticles = (count: number) => {
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      x: Math.random() * 200 - 100,
      y: Math.random() * 150 + 20,
      z: Math.random() * 200 - 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2
    }));
  };

  const particles = generateParticles(30);

  return (
    <motion.div
      className="h-screen w-full relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        background: `
          radial-gradient(circle at 50% 0%, rgba(0, 150, 255, 0.3) 0%, transparent 50%),
          linear-gradient(180deg,
            rgba(0, 100, 200, 0.8) 0%,
            rgba(0, 80, 160, 0.9) 20%,
            rgba(0, 60, 120, 0.95) 40%,
            rgba(0, 40, 80, 0.98) 60%,
            rgba(0, 20, 40, 1) 80%,
            rgba(0, 10, 20, 1) 100%
          )
        `
      }}
    >
      <Navbar />

      {/* 3D Ocean Environment */}
      <div
        ref={oceanRef}
        className="h-full w-full pt-16 relative"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%'
        }}
      >
        {/* Water Caustics Effect */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${20 + Math.random() * 40}%`,
                width: `${50 + Math.random() * 100}px`,
                height: `${30 + Math.random() * 60}px`,
                background: `radial-gradient(ellipse, rgba(0, 200, 255, 0.6) 0%, transparent 70%)`,
                animation: `caustics ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
                filter: 'blur(1px)'
              }}
            />
          ))}
        </div>

        {/* 3D Water Layers */}
        {Array.from({ length: 6 }).map((_, layer) => (
          <div
            key={layer}
            className="absolute w-full pointer-events-none"
            style={{
              height: '200px',
              top: `${15 + layer * 12}%`,
              background: `linear-gradient(90deg,
                transparent 0%,
                rgba(0, 150, 255, ${0.1 - layer * 0.015}) 20%,
                rgba(0, 120, 200, ${0.15 - layer * 0.02}) 50%,
                rgba(0, 150, 255, ${0.1 - layer * 0.015}) 80%,
                transparent 100%
              )`,
              transform: `
                translateZ(${-layer * 50}px)
                rotateX(${5 + layer * 2}deg)
                translateY(${Math.sin(Date.now() * 0.001 + layer) * 5}px)
              `,
              animation: `wave ${4 + layer * 0.5}s ease-in-out infinite`,
              animationDelay: `${layer * 0.3}s`
            }}
          />
        ))}

        {/* Realistic Submarine */}
        <div
          className="absolute transition-all duration-1000 ease-out z-30"
          style={{
            left: `calc(50% + ${submarinePosition.x}px)`,
            top: `calc(45% + ${submarinePosition.y}px)`,
            transform: `
              translateX(-50%) translateY(-50%)
              rotate(${heading}deg)
              scale(${Math.max(0.6, 1.2 - depth * 0.01)})
              perspective(800px)
              rotateY(${speed * 2}deg)
              rotateX(${Math.sin(depth * 0.1) * 3}deg)
            `,
            filter: `
              drop-shadow(0 ${10 + depth}px ${20 + depth * 2}px rgba(0, 0, 0, 0.4))
              brightness(${Math.max(0.4, 1 - depth * 0.02)})
            `
          }}
        >
          {/* Advanced Submarine SVG with damage effects */}
          <div className="relative">
            <svg width="140" height="60" viewBox="0 0 140 60" className="drop-shadow-2xl">
              {/* Submarine shadow/depth effect */}
              <ellipse cx="72" cy="35" rx="50" ry="18" fill="rgba(0, 0, 0, 0.3)" />

              {/* Main hull with metallic gradient */}
              <defs>
                <linearGradient id="hullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={hullIntegrity > 70 ? "#4a5568" : hullIntegrity > 40 ? "#8b4513" : "#dc2626"} />
                  <stop offset="30%" stopColor={hullIntegrity > 70 ? "#2d3748" : hullIntegrity > 40 ? "#654321" : "#991b1b"} />
                  <stop offset="70%" stopColor={hullIntegrity > 70 ? "#1a202c" : hullIntegrity > 40 ? "#4a2c17" : "#7f1d1d"} />
                  <stop offset="100%" stopColor={hullIntegrity > 70 ? "#0d1117" : hullIntegrity > 40 ? "#2d1810" : "#450a0a"} />
                </linearGradient>
                <radialGradient id="lightGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={battery > 20 ? "#ffd700" : "#dc2626"} />
                  <stop offset="70%" stopColor={battery > 20 ? "#ffed4e" : "#f87171"} />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id="sonarGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00ff88" />
                  <stop offset="70%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>

              <ellipse cx="70" cy="30" rx="55" ry="18" fill="url(#hullGradient)" stroke="#4a5568" strokeWidth="2" />

              {/* Hull details */}
              <ellipse cx="70" cy="28" rx="50" ry="15" fill="none" stroke="#6b7280" strokeWidth="1" opacity="0.6" />
              <ellipse cx="70" cy="32" rx="45" ry="12" fill="none" stroke="#374151" strokeWidth="1" opacity="0.4" />

              {/* Damage indicators */}
              {hullIntegrity < 70 && (
                <>
                  <circle cx="85" cy="25" r="2" fill="#dc2626" opacity="0.8" />
                  <circle cx="55" cy="35" r="1.5" fill="#f59e0b" opacity="0.6" />
                </>
              )}
              {hullIntegrity < 40 && (
                <>
                  <circle cx="90" cy="30" r="3" fill="#dc2626" opacity="0.9" />
                  <path d="M75,20 L85,25" stroke="#dc2626" strokeWidth="2" />
                </>
              )}

              {/* Conning tower with realistic details */}
              <rect x="55" y="12" width="30" height="20" rx="8" fill="url(#hullGradient)" stroke="#374151" strokeWidth="1.5" />
              <rect x="58" y="15" width="24" height="14" rx="4" fill="#1f2937" stroke="#4b5563" strokeWidth="1" />

              {/* Periscope with sonar indicator */}
              <rect x="68" y="8" width="4" height="8" rx="2" fill="#374151" />
              <circle cx="70" cy="8" r="2" fill={sonarActive ? "url(#sonarGradient)" : battery > 20 ? "#ef4444" : "#7f1d1d"} className={sonarActive || battery > 20 ? "animate-pulse" : ""} />

              {/* Propeller with rotation effect */}
              <g transform="translate(15, 30)">
                <circle cx="0" cy="0" r="6" fill="#374151" opacity="0.8" />
                <path d="M-5,0 L5,0 M0,-5 L0,5" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                  <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    from="0"
                    to="360"
                    dur={`${Math.max(0.5, 2 - Math.abs(speed) * 0.1)}s`}
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              {/* Submarine lights with realistic glow */}
              <circle cx="120" cy="20" r="4" fill="url(#lightGradient)" className={battery > 10 ? "animate-pulse" : ""} opacity={battery > 10 ? 1 : 0.3} />
              <circle cx="120" cy="40" r="4" fill="url(#lightGradient)" className={battery > 10 ? "animate-pulse" : ""} opacity={battery > 10 ? 1 : 0.3} />
              <circle cx="115" cy="30" r="3" fill="#87ceeb" opacity={battery > 10 ? 0.8 : 0.2} className={battery > 10 ? "animate-pulse" : ""} />

              {/* Hull markings */}
              <text x="70" y="35" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">
                FLOATCHAT-1
              </text>
            </svg>

            {/* Enhanced submarine light beams */}
            <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <div
                className={`w-40 h-20 transition-opacity duration-300 ${battery > 10 ? 'opacity-40' : 'opacity-10'}`}
                style={{
                  background: battery > 10 ? `conic-gradient(from 0deg at 0% 50%,
                    transparent 0deg,
                    rgba(255, 255, 136, ${depth > 50 ? 0.3 : 0.6}) 15deg,
                    rgba(255, 255, 200, ${depth > 50 ? 0.2 : 0.4}) 30deg,
                    rgba(255, 255, 136, ${depth > 50 ? 0.3 : 0.6}) 45deg,
                    transparent 60deg
                  )` : 'none',
                  borderRadius: '0 50% 50% 0',
                  animation: battery > 10 ? 'lightSweep 4s ease-in-out infinite' : 'none'
                }}
              />
              {/* Sonar sweep effect */}
              {sonarActive && (
                <div
                  className="absolute inset-0 w-60 h-60 opacity-30"
                  style={{
                    background: `conic-gradient(from 0deg at 0% 50%,
                      transparent 0deg,
                      rgba(0, 255, 136, 0.4) 30deg,
                      rgba(0, 255, 200, 0.2) 60deg,
                      transparent 90deg
                    )`,
                    borderRadius: '0 50% 50% 0',
                    animation: 'sonarSweep 2s linear infinite'
                  }}
                />
              )}
            </div>

            {/* Enhanced bubble trail based on speed */}
            {Array.from({ length: Math.max(3, Math.floor(speed * 2)) }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-60 animate-bounce"
                style={{
                  left: `${-20 - i * (8 + speed)}px`,
                  top: `${15 + Math.sin(Date.now() * 0.005 + i) * 10}px`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${1.5 + i * 0.3 - speed * 0.1}s`,
                  opacity: Math.max(0.3, 1 - depth * 0.01)
                }}
              />
            ))}

            {/* Damage sparks */}
            {hullIntegrity < 50 && Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`spark-${i}`}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${10 + i * 15}px`,
                  top: `${20 + Math.sin(Date.now() * 0.01 + i) * 5}px`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* 3D Argo Floats with realistic placement */}
        {[
          { x: 120, y: 25, z: 80, label: 'ARGO-α' },
          { x: -180, y: 45, z: -60, label: 'ARGO-β' },
          { x: 220, y: 65, z: 120, label: 'ARGO-γ' },
          { x: -140, y: 35, z: -120, label: 'ARGO-δ' },
          { x: 160, y: 55, z: -80, label: 'ARGO-ε' }
        ].map((argo, index) => (
          <div
            key={index}
            className="absolute transition-all duration-700 z-20"
            style={{
              left: `calc(50% + ${argo.x}px)`,
              top: `calc(35% + ${argo.y}px)`,
              transform: `
                translateX(-50%) translateY(-50%)
                translateZ(${argo.z}px)
                scale(${Math.max(0.5, 1 - Math.abs(argo.z) * 0.002)})
                rotateY(${argo.z * 0.1}deg)
              `,
              filter: `brightness(${Math.max(0.6, 1 - Math.abs(argo.z) * 0.003)})`
            }}
          >
            <div className="relative">
              {/* Advanced Argo Float design */}
              <div className="relative">
                <div
                  className="w-6 h-16 bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 rounded-full border-2 border-orange-700 shadow-lg"
                  style={{
                    animation: `float ${2.5 + index * 0.3}s ease-in-out infinite`,
                    animationDelay: `${index * 0.4}s`
                  }}
                >
                  {/* Float details */}
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-red-500 rounded-full"></div>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-orange-300 rounded-full"></div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-orange-700 rounded-full"></div>
                </div>

                {/* Antenna with realistic detail */}
                <div className="absolute -top-3 left-1/2 w-1 h-6 bg-gray-700 transform -translate-x-1/2 rounded-full"></div>
                <div className="absolute -top-4 left-1/2 w-2 h-2 bg-green-400 rounded-full transform -translate-x-1/2 animate-pulse shadow-lg shadow-green-400/50"></div>

                {/* Data transmission effect */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-green-300 rounded-full animate-ping"
                      style={{
                        left: `${Math.sin(i * Math.PI * 2 / 3) * 8}px`,
                        top: `${Math.cos(i * Math.PI * 2 / 3) * 8}px`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Enhanced label */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                <div className="text-xs text-cyan-300 font-bold whitespace-nowrap bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                  {argo.label}
                </div>
                <div className="text-xs text-green-400 mt-1">ACTIVE</div>
              </div>
            </div>
          </div>
        ))}

        {/* Interactive Fish Schools that react to submarine */}
        {[
          { x: 100, y: 35, z: 40, count: 8, color: 'blue', species: 'Tuna', fearRadius: 80 },
          { x: -150, y: 55, z: -30, count: 12, color: 'cyan', species: 'Sardines', fearRadius: 60 },
          { x: 180, y: 45, z: 80, count: 6, color: 'indigo', species: 'Barracuda', fearRadius: 100 },
          { x: -120, y: 65, z: -80, count: 15, color: 'teal', species: 'Anchovies', fearRadius: 50 },
          { x: 140, y: 25, z: 60, count: 10, color: 'blue', species: 'Mackerel', fearRadius: 70 }
        ].map((school, schoolIndex) => {
          const submarineDistance = Math.sqrt(
            Math.pow(school.x - submarinePosition.x, 2) +
            Math.pow(school.y - submarinePosition.y, 2) +
            Math.pow(school.z - submarinePosition.z, 2)
          );
          const isScared = submarineDistance < school.fearRadius;
          const fleeDirection = isScared ? {
            x: (school.x - submarinePosition.x) / submarineDistance * 50,
            y: (school.y - submarinePosition.y) / submarineDistance * 30,
            z: (school.z - submarinePosition.z) / submarineDistance * 50
          } : { x: 0, y: 0, z: 0 };

          return (
            <div key={schoolIndex} className="absolute">
              {Array.from({ length: school.count }).map((_, fishIndex) => {
                const individualFear = isScared ? Math.random() * 0.5 + 0.5 : 0;
                const fishX = school.x + Math.sin(Date.now() * 0.003 + fishIndex * 0.5) * (isScared ? 20 : 40) + fleeDirection.x * individualFear;
                const fishY = school.y + Math.cos(Date.now() * 0.002 + fishIndex * 0.3) * (isScared ? 15 : 25) + fleeDirection.y * individualFear;
                const fishZ = school.z + Math.sin(Date.now() * 0.002 + fishIndex) * (isScared ? 10 : 20) + fleeDirection.z * individualFear;

                return (
                  <div
                    key={fishIndex}
                    className="absolute z-15 transition-all duration-500"
                    style={{
                      left: `calc(50% + ${fishX}px)`,
                      top: `calc(40% + ${fishY}px)`,
                      transform: `
                        translateX(-50%) translateY(-50%)
                        translateZ(${fishZ}px)
                        scale(${(0.8 + Math.sin(Date.now() * 0.004 + fishIndex) * 0.3) * (isScared ? 0.7 : 1)})
                        scaleX(${(Math.sin(Date.now() * 0.003 + fishIndex) > 0 ? 1 : -1) * (isScared ? -1 : 1)})
                        rotateY(${Math.sin(Date.now() * 0.002 + fishIndex) * 15 + (isScared ? 180 : 0)}deg)
                      `,
                      filter: `brightness(${0.7 + Math.sin(Date.now() * 0.001 + fishIndex) * 0.3})`,
                      opacity: isScared ? 0.8 : 1
                    }}
                  >
                    <Fish className={`h-3 w-3 text-${school.color}-400 drop-shadow-lg ${isScared ? 'animate-ping' : ''}`} />
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Large Predator Fish */}
        {[
          { x: 250, y: 80, z: 150, species: 'Shark' },
          { x: -200, y: 90, z: -100, species: 'Giant Grouper' }
        ].map((predator, index) => {
          const predatorDistance = Math.sqrt(
            Math.pow(predator.x - submarinePosition.x, 2) +
            Math.pow(predator.y - submarinePosition.y, 2) +
            Math.pow(predator.z - submarinePosition.z, 2)
          );
          const isNearby = predatorDistance < 150;

          return (
            <div
              key={index}
              className="absolute z-20 transition-all duration-1000"
              style={{
                left: `calc(50% + ${predator.x + Math.sin(Date.now() * 0.001 + index) * 80}px)`,
                top: `calc(40% + ${predator.y + Math.cos(Date.now() * 0.0008 + index) * 40}px)`,
                transform: `
                  translateX(-50%) translateY(-50%)
                  translateZ(${predator.z + Math.sin(Date.now() * 0.0005 + index) * 30}px)
                  scale(${isNearby ? 1.2 : 1})
                  rotateY(${Math.sin(Date.now() * 0.001 + index) * 30}deg)
                `,
                filter: `brightness(${isNearby ? 1.2 : 0.8}) drop-shadow(0 0 ${isNearby ? 20 : 10}px rgba(255, 0, 0, ${isNearby ? 0.5 : 0.2}))`
              }}
            >
              <div className={`text-6xl ${isNearby ? 'animate-pulse' : ''}`}>
                {predator.species === 'Shark' ? '🦈' : '🐟'}
              </div>
            </div>
          );
        })}

        {/* 3D Coral Reef with depth */}
        {[
          { x: 80, y: 120, z: 60, type: 'brain' },
          { x: -120, y: 125, z: -40, type: 'staghorn' },
          { x: 200, y: 115, z: 100, type: 'table' },
          { x: -180, y: 130, z: -90, type: 'elkhorn' },
          { x: 160, y: 110, z: -60, type: 'finger' },
          { x: -80, y: 135, z: 80, type: 'pillar' }
        ].map((coral, index) => (
          <div
            key={index}
            className="absolute z-10"
            style={{
              left: `calc(50% + ${coral.x}px)`,
              top: `calc(40% + ${coral.y}px)`,
              transform: `
                translateX(-50%) translateY(-50%)
                translateZ(${coral.z}px)
                scale(${Math.max(0.6, 1.2 - Math.abs(coral.z) * 0.003)})
                rotateY(${coral.z * 0.2}deg)
              `,
              filter: `brightness(${Math.max(0.4, 0.8 - Math.abs(coral.z) * 0.002)})`
            }}
          >
            <div
              className={`
                ${coral.type === 'brain' ? 'w-8 h-6 bg-pink-500 rounded-full' : ''}
                ${coral.type === 'staghorn' ? 'w-6 h-10 bg-orange-400 rounded-t-full' : ''}
                ${coral.type === 'table' ? 'w-10 h-4 bg-purple-500 rounded-full' : ''}
                ${coral.type === 'elkhorn' ? 'w-7 h-8 bg-yellow-500 rounded-t-lg' : ''}
                ${coral.type === 'finger' ? 'w-4 h-12 bg-red-500 rounded-full' : ''}
                ${coral.type === 'pillar' ? 'w-5 h-14 bg-green-500 rounded-t-full' : ''}
                opacity-80 shadow-lg transform rotate-${index * 15}
              `}
              style={{
                animation: `sway ${3 + index * 0.5}s ease-in-out infinite`,
                animationDelay: `${index * 0.2}s`
              }}
            />
          </div>
        ))}

        {/* Underwater Terrain - Seafloor */}
        <div className="absolute bottom-0 left-0 right-0 h-32 z-5">
          {/* Seafloor base */}
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background: `linear-gradient(180deg,
                transparent 0%,
                rgba(101, 67, 33, 0.3) 20%,
                rgba(101, 67, 33, 0.6) 60%,
                rgba(62, 39, 35, 0.9) 100%
              )`
            }}
          />

          {/* Seafloor texture and rocks */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${i * 4}%`,
                width: `${8 + Math.random() * 12}px`,
                height: `${15 + Math.random() * 25}px`,
                background: `radial-gradient(circle, rgba(101, 67, 33, 0.8), rgba(62, 39, 35, 0.9))`,
                borderRadius: '50% 50% 0 0',
                transform: `translateX(${Math.sin(i * 0.5) * 20}px) rotateZ(${Math.random() * 20 - 10}deg)`,
                filter: `brightness(${0.6 + Math.random() * 0.4})`
              }}
            />
          ))}

          {/* Underwater plants */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`plant-${i}`}
              className="absolute bottom-0"
              style={{
                left: `${5 + i * 6}%`,
                width: '3px',
                height: `${20 + Math.random() * 40}px`,
                background: `linear-gradient(0deg, rgba(34, 139, 34, 0.8), rgba(0, 100, 0, 0.6))`,
                borderRadius: '50% 50% 0 0',
                transform: `translateX(${Math.sin(Date.now() * 0.002 + i) * 15}px) rotateZ(${Math.sin(Date.now() * 0.003 + i) * 10}deg)`,
                animation: `sway ${3 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        {/* Enhanced Particle System with Marine Snow */}
        {particles.map((particle) => {
          const isMarineSnow = particle.id % 3 === 0;
          return (
            <div
              key={particle.id}
              className="absolute z-5 animate-bounce"
              style={{
                left: `calc(50% + ${particle.x + Math.sin(Date.now() * 0.001 * particle.speed) * 30}px)`,
                top: `calc(30% + ${particle.y + Math.cos(Date.now() * 0.001 * particle.speed) * 20}px)`,
                transform: `
                  translateX(-50%) translateY(-50%)
                  translateZ(${particle.z}px)
                  scale(${particle.size * (isMarineSnow ? 0.5 : 0.3)})
                `,
                animationDuration: `${2 + particle.speed}s`,
                animationDelay: `${particle.id * 0.1}s`,
                opacity: particle.opacity * (depth > 60 ? 1.5 : 1)
              }}
            >
              <div
                className={`w-1 h-1 rounded-full ${isMarineSnow ? 'bg-yellow-200' : 'bg-white'}`}
                style={{
                  boxShadow: `0 0 4px rgba(255, 255, 255, 0.6)`,
                  filter: isMarineSnow ? 'blur(0.5px)' : 'none'
                }}
              />
            </div>
          );
        })}

        {/* Bioluminescent Plankton */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`plankton-${i}`}
            className="absolute z-5"
            style={{
              left: `calc(50% + ${Math.sin(Date.now() * 0.002 + i * 0.5) * 200}px)`,
              top: `calc(30% + ${Math.cos(Date.now() * 0.0015 + i * 0.3) * 150}px)`,
              transform: `scale(${0.5 + Math.sin(Date.now() * 0.003 + i) * 0.3})`,
              opacity: depth > 40 ? 0.8 : 0.3
            }}
          >
            <div
              className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"
              style={{
                boxShadow: '0 0 8px rgba(0, 255, 255, 0.8)',
                filter: 'blur(1px)',
                animationDuration: `${1 + Math.random() * 2}s`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          </div>
        ))}
      </div>

      {/* Enhanced Control Panel */}
      {!isImmersiveMode && isControlPanelOpen && (
        <motion.div
          className="absolute bottom-6 left-6 right-6 lg:right-auto lg:w-96"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card border-primary/30 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Anchor className="h-5 w-5 text-primary" />
                  Deep Sea Control
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsControlPanelOpen(false)}
                  className="text-white/70 hover:text-white"
                >
                  ×
                </Button>
              </div>

              {/* Enhanced Status Display with Game Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="text-center">
                  <Gauge className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <div className="text-xs text-white/70">Depth</div>
                  <div className="text-lg font-bold text-primary">{depth.toFixed(1)}m</div>
                </div>
                <div className="text-center">
                  <Compass className="h-5 w-5 mx-auto mb-2 text-accent" />
                  <div className="text-xs text-white/70">Heading</div>
                  <div className="text-lg font-bold text-accent">{Math.round(heading)}°</div>
                </div>
                <div className="text-center">
                  <Zap className="h-5 w-5 mx-auto mb-2 text-yellow-400" />
                  <div className="text-xs text-white/70">Speed</div>
                  <div className="text-lg font-bold text-yellow-400">{speed.toFixed(1)}</div>
                </div>
                <div className="text-center">
                  <Target className="h-5 w-5 mx-auto mb-2 text-green-400" />
                  <div className="text-xs text-white/70">Samples</div>
                  <div className="text-lg font-bold text-green-400">{collectedSamples}</div>
                </div>
              </div>

              {/* System Status */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                <div className="text-center">
                  <Battery className={`h-4 w-4 mx-auto mb-1 ${getStatusColor(battery)}`} />
                  <div className="text-white/70">Battery</div>
                  <div className={`font-bold ${getStatusColor(battery)}`}>{battery.toFixed(0)}%</div>
                </div>
                <div className="text-center">
                  <AlertTriangle className={`h-4 w-4 mx-auto mb-1 ${getStatusColor(hullIntegrity)}`} />
                  <div className="text-white/70">Hull</div>
                  <div className={`font-bold ${getStatusColor(hullIntegrity)}`}>{hullIntegrity.toFixed(0)}%</div>
                </div>
                <div className="text-center">
                  <Waves className={`h-4 w-4 mx-auto mb-1 ${getStatusColor(oxygenLevel)}`} />
                  <div className="text-white/70">O₂</div>
                  <div className={`font-bold ${getStatusColor(oxygenLevel)}`}>{oxygenLevel.toFixed(0)}%</div>
                </div>
              </div>

              {/* Mission Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>Mission Progress</span>
                  <span>{missionProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${missionProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Controls Instructions with Toggle */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white/80">Controls</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowControlsHelp(!showControlsHelp)}
                    className="text-white/70 hover:text-white p-1 h-6 w-6"
                  >
                    {showControlsHelp ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
                {showControlsHelp && (
                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="text-xs text-white/80 font-mono">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>WASD / Arrows: Move</div>
                        <div>Q/Space: Surface</div>
                        <div>E/Shift: Dive</div>
                        <div>Click buttons below</div>
                      </div>
                      <div className="border-t border-white/20 pt-2">
                        <div className="text-xs text-cyan-300 font-medium mb-1">UI Toggles:</div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div>H: Toggle Help</div>
                          <div>M: Mission Brief</div>
                          <div>N: Sonar Panel</div>
                          <div>C: Controls</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Movement Controls */}
              <div className="space-y-3">
                <div className="flex justify-center">
                  <Button
                    variant="ocean"
                    size="sm"
                    onClick={() => moveSubmarine('forward')}
                    className="px-6 bg-gradient-to-r from-blue-600 to-blue-500"
                    disabled={battery < 5}
                  >
                    ↑ AHEAD
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="ocean"
                    size="sm"
                    onClick={() => moveSubmarine('left')}
                    className="px-4 bg-gradient-to-r from-purple-600 to-purple-500"
                    disabled={battery < 5}
                  >
                    ← PORT
                  </Button>

                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="ocean"
                      size="sm"
                      onClick={() => moveSubmarine('up')}
                      className="px-3 bg-gradient-to-r from-green-600 to-green-500"
                      disabled={battery < 5}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ocean"
                      size="sm"
                      onClick={() => moveSubmarine('down')}
                      className="px-3 bg-gradient-to-r from-red-600 to-red-500"
                      disabled={battery < 5}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ocean"
                    size="sm"
                    onClick={() => moveSubmarine('right')}
                    className="px-4 bg-gradient-to-r from-purple-600 to-purple-500"
                    disabled={battery < 5}
                  >
                    STBD →
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="ocean"
                    size="sm"
                    onClick={() => moveSubmarine('backward')}
                    className="px-6 bg-gradient-to-r from-orange-600 to-orange-500"
                    disabled={battery < 5}
                  >
                    ↓ ASTERN
                  </Button>
                </div>
              </div>

              {/* Action Controls */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSonar}
                  className={`flex items-center gap-2 ${sonarActive ? 'bg-green-600/20 border-green-500' : ''}`}
                  disabled={battery < 10}
                >
                  <Radar className="h-4 w-4" />
                  {sonarActive ? 'SONAR ON' : 'SONAR'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={collectSample}
                  className="flex items-center gap-2"
                  disabled={depth < 30 || battery < 10}
                >
                  <Target className="h-4 w-4" />
                  SAMPLE
                </Button>
              </div>

              {/* Emergency Controls */}
              <div className="mt-4 flex justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={emergencySurface}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  EMERGENCY SURFACE
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Toggle Control Panel */}
      {!isImmersiveMode && !isControlPanelOpen && (
        <motion.div
          className="absolute bottom-6 left-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ocean"
            size="lg"
            onClick={() => setIsControlPanelOpen(true)}
            className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500"
            title="Show Controls (Press C)"
          >
            <Navigation className="h-5 w-5" />
          </Button>
        </motion.div>
      )}

      {/* Main UI Control Bar */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/40 backdrop-blur-lg rounded-full border border-white/20 px-4 py-2">
          <div className="flex items-center gap-3">
            {/* Immersive Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsImmersiveMode(!isImmersiveMode);
                if (!isImmersiveMode) {
                  setIsSonarPanelOpen(false);
                  setIsMissionBriefingOpen(false);
                  setIsControlPanelOpen(false);
                  setShowControlsHelp(false);
                } else {
                  setIsSonarPanelOpen(true);
                  setIsMissionBriefingOpen(true);
                  setIsControlPanelOpen(true);
                }
              }}
              className="text-white/80 hover:text-white px-3"
              title={isImmersiveMode ? "Show All UI (I)" : "Hide All UI (I)"}
            >
              {isImmersiveMode ? (
                <><Eye className="h-4 w-4 mr-1" />Show UI</>
              ) : (
                <><EyeOff className="h-4 w-4 mr-1" />Hide All</>
              )}
            </Button>

            <div className="w-px h-4 bg-white/20"></div>

            {/* Individual Panel Toggles */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMissionBriefingOpen(!isMissionBriefingOpen)}
              className={`text-white/80 hover:text-white px-2 ${isMissionBriefingOpen ? 'bg-green-500/20' : ''}`}
              title="Toggle Mission Brief (M)"
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSonarPanelOpen(!isSonarPanelOpen)}
              className={`text-white/80 hover:text-white px-2 ${isSonarPanelOpen ? 'bg-cyan-500/20' : ''}`}
              title="Toggle Sonar Panel (N)"
            >
              <Radar className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
              className={`text-white/80 hover:text-white px-2 ${isControlPanelOpen ? 'bg-blue-500/20' : ''}`}
              title="Toggle Controls (C)"
            >
              <Navigation className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControlsHelp(!showControlsHelp)}
              className={`text-white/80 hover:text-white px-2 ${showControlsHelp ? 'bg-yellow-500/20' : ''}`}
              title="Toggle Help (H)"
            >
              {showControlsHelp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Immersive Mode Indicator */}
      {isImmersiveMode && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg border border-white/20 px-3 py-1">
            <div className="text-xs text-white/80 flex items-center gap-2">
              <EyeOff className="h-3 w-3" />
              Immersive Mode - Press I to show UI
            </div>
          </div>
        </div>
      )}

      {/* Advanced Sonar Display */}
      {!isImmersiveMode && isSonarPanelOpen && (
        <div className="absolute top-20 right-6 w-80 hidden lg:block">
          <Card className="glass-card border-accent/30 backdrop-blur-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Waves className="h-5 w-5 text-accent" />
                  Sonar Systems
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSonarPanelOpen(false)}
                  className="text-white/70 hover:text-white p-1 h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Water Temp:</span>
                <span className="text-blue-400 font-medium">{(4.2 - depth * 0.1).toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Pressure:</span>
                <span className="text-cyan-400 font-medium">{(1 + depth * 0.1).toFixed(1)} atm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Current:</span>
                <span className="text-green-400 font-medium">{currentStrength.x.toFixed(1)} / {currentStrength.z.toFixed(1)} kn</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Visibility:</span>
                <span className="text-yellow-400 font-medium">{Math.max(5, 120 - depth * 2 - (100 - battery) * 0.5).toFixed(0)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Hull Status:</span>
                <span className={getStatusColor(hullIntegrity)}>{hullIntegrity > 70 ? 'SECURE' : hullIntegrity > 40 ? 'DAMAGED' : 'CRITICAL'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Life Support:</span>
                <span className={getStatusColor(oxygenLevel)}>{oxygenLevel > 70 ? 'OPTIMAL' : oxygenLevel > 40 ? 'STABLE' : 'CRITICAL'}</span>
              </div>

              {/* Sonar Contacts */}
              {sonarActive && (
                <div className="mt-3 border-t border-white/20 pt-3">
                  <div className="text-sm font-medium text-green-400 mb-2">SONAR CONTACTS</div>
                  {nearbyObjects().length > 0 ? (
                    nearbyObjects().map((obj, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-white/70">{obj.type}:</span>
                        <span className="text-cyan-400">{obj.label} ({obj.distance}m)</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-white/50">No contacts detected</div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Sonar Panel Toggle Button */}
      {!isImmersiveMode && !isSonarPanelOpen && (
        <div className="absolute top-20 right-6 hidden lg:block">
          <Button
            variant="ocean"
            size="sm"
            onClick={() => setIsSonarPanelOpen(true)}
            className="bg-gradient-to-r from-cyan-600 to-cyan-500 p-2"
            title="Show Sonar Panel"
          >
            <Radar className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Mission Briefing */}
      {!isImmersiveMode && isMissionBriefingOpen && (
        <div className="absolute top-20 left-6 max-w-sm">
          <Card className="glass-card border-green-500/30 backdrop-blur-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-bold text-green-400 flex items-center gap-2">
                  🌊 Deep Sea Mission
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMissionBriefingOpen(false)}
                  className="text-white/70 hover:text-white p-1 h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            <p className="text-sm text-white/80 mb-3">
              Deep sea exploration mission! Collect samples while managing resources and avoiding hazards.
            </p>
            <div className="text-xs text-cyan-300">
              • Use WASD/Arrows + Q/E for full 3D control<br/>
              • Monitor battery, hull integrity & oxygen<br/>
              • Activate sonar to detect nearby objects<br/>
              • Collect samples at depth &gt;30m<br/>
              • Manage realistic submarine physics<br/>
              • Watch for marine life reactions<br/>
              • Deeper = darker, more dangerous<br/>
              • Press H/M/N/C to toggle UI panels<br/>
              • Press I for immersive mode<br/>
              • Emergency surface if systems fail
            </div>

            {/* Game Tips */}
            {battery < 30 && (
              <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-xs text-yellow-200">
                ⚠️ Low battery! Reduce speed and sonar usage.
              </div>
            )}
            {hullIntegrity < 50 && (
              <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-200">
                🚨 Hull damage detected! Consider emergency surface.
              </div>
            )}
            {oxygenLevel < 40 && (
              <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-200">
                💨 Oxygen critical! Surface immediately!
              </div>
            )}
            {missionProgress < 100 && collectedSamples < 5 && depth > 20 && (
              <div className="mt-3 p-2 bg-blue-500/20 border border-blue-500/50 rounded text-xs text-blue-200">
                🎯 Mission: Collect {5 - collectedSamples} more samples to complete objectives.
              </div>
            )}
            {nearbyObjects().length > 0 && sonarActive && (
              <div className="mt-3 p-2 bg-green-500/20 border border-green-500/50 rounded text-xs text-green-200">
                📡 {nearbyObjects().length} object(s) detected on sonar.
              </div>
            )}
            {depth > 80 && hullIntegrity > 50 && (
              <div className="mt-3 p-2 bg-purple-500/20 border border-purple-500/50 rounded text-xs text-purple-200">
                🌊 Extreme depth reached! You're in the abyss zone.
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      )}

      {/* Mission Briefing Toggle Button */}
      {!isImmersiveMode && !isMissionBriefingOpen && (
        <div className="absolute top-20 left-6">
          <Button
            variant="ocean"
            size="sm"
            onClick={() => setIsMissionBriefingOpen(true)}
            className="bg-gradient-to-r from-green-600 to-green-500 p-2"
            title="Show Mission Briefing"
          >
            <Target className="h-4 w-4" />
          </Button>
        </div>
      )}
      {/* CSS for new animations */}
      <style>{`
        @keyframes sonarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes currentFlow {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(5px) translateY(-2px); }
          50% { transform: translateX(-3px) translateY(4px); }
          75% { transform: translateX(8px) translateY(1px); }
        }

        @keyframes depthPressure {
          0%, 100% { transform: scale(1) rotateZ(0deg); }
          50% { transform: scale(0.98) rotateZ(0.5deg); }
        }

        @keyframes abyssGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(138, 43, 226, 0.3); }
          50% { box-shadow: 0 0 40px rgba(138, 43, 226, 0.6); }
        }
      `}</style>
    </motion.div>
  );
};

export default OceanExplorer;