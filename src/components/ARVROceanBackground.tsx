import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';

// Extend Three.js with custom shaders
extend({
  ShaderMaterial: THREE.ShaderMaterial,
  PlaneGeometry: THREE.PlaneGeometry,
  SphereGeometry: THREE.SphereGeometry
});

// Natural Ocean Surface with subtle AR enhancement
function ARNaturalOcean() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Realistic ocean with subtle AR glow
  const oceanMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        time: { value: 0 },
        deepColor: { value: new THREE.Color(0x006994) }, // Deep crystal blue
        surfaceColor: { value: new THREE.Color(0x00bfff) }, // Brilliant turquoise
        glowColor: { value: new THREE.Color(0x40e0d0) }, // Bright turquoise glow
        opacity: { value: 0.88 }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          vUv = uv;

          // Natural ocean waves
          vec3 pos = position;
          float wave1 = sin(pos.x * 0.3 + time * 0.6) * 0.4;
          float wave2 = sin(pos.y * 0.2 + time * 0.4) * 0.3;
          float wave3 = sin((pos.x + pos.y) * 0.15 + time * 0.8) * 0.2;

          pos.z += wave1 + wave2 + wave3;

          // Calculate normal for realistic lighting
          float dx = cos(pos.x * 0.3 + time * 0.6) * 0.4 * 0.3;
          float dy = cos(pos.y * 0.2 + time * 0.4) * 0.3 * 0.2;
          vNormal = normalize(vec3(-dx, -dy, 1.0));

          vPosition = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 deepColor;
        uniform vec3 surfaceColor;
        uniform vec3 glowColor;
        uniform float opacity;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          // Natural depth-based color mixing
          float depth = smoothstep(-2.0, 2.0, vPosition.z);
          vec3 waterColor = mix(deepColor, surfaceColor, depth);

          // Subtle wave foam
          float foam = smoothstep(0.3, 0.8, vPosition.z) * 0.3;
          waterColor = mix(waterColor, vec3(0.9, 0.95, 1.0), foam);

          // Very subtle AR glow at edges
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), 1.5);
          vec3 glow = glowColor * fresnel * 0.2;

          // Caustic-like patterns (very subtle)
          float caustics = sin(vUv.x * 20.0 + time) * sin(vUv.y * 15.0 + time * 1.2) * 0.05 + 0.95;

          vec3 finalColor = (waterColor + glow) * caustics;

          gl_FragColor = vec4(finalColor, opacity);
        }
      `
    });
  }, []);

  // Natural ocean animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      oceanMaterial.uniforms.time.value = clock.getElapsedTime();

      // Gentle ocean movement
      meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.01;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[120, 120, 128, 128]} />
      <primitive object={oceanMaterial} attach="material" />
    </mesh>
  );
}

// Natural underwater bubbles and marine life
function UnderwaterBubbles() {
  const bubblesRef = useRef<THREE.Points>(null);
  const count = 60;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 25 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      sizes[i] = Math.random() * 0.3 + 0.1;
    }

    return { positions, sizes };
  }, []);

  useFrame(({ clock }) => {
    if (bubblesRef.current) {
      const time = clock.getElapsedTime();

      // Natural bubble rising motion
      const positions = bubblesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // Bubbles rise naturally
        positions[i3 + 1] += 0.01;

        // Slight side-to-side drift
        positions[i3] += Math.sin(time + i) * 0.002;
        positions[i3 + 2] += Math.cos(time + i * 0.7) * 0.001;

        // Reset when bubbles reach surface
        if (positions[i3 + 1] > 20) {
          positions[i3 + 1] = -10;
          positions[i3] = (Math.random() - 0.5) * 60;
          positions[i3 + 2] = (Math.random() - 0.5) * 60;
        }
      }
      bubblesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={bubblesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles.positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={particles.sizes}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color={new THREE.Color(0.8, 0.9, 1)}
        transparent
        opacity={0.6}
      />
    </points>
  );
}

// Underwater caustics and light rays
function UnderwaterCaustics() {
  const causticsRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (causticsRef.current) {
      const time = clock.getElapsedTime();

      // Natural caustic animation
      causticsRef.current.material.opacity = 0.2 + Math.sin(time * 0.5) * 0.1;
      causticsRef.current.rotation.z = time * 0.01;

      // Shift caustic patterns naturally
      if (causticsRef.current.material.map) {
        causticsRef.current.material.map.offset.x = Math.sin(time * 0.1) * 0.1;
        causticsRef.current.material.map.offset.y = Math.cos(time * 0.15) * 0.05;
      }
    }
  });

  return (
    <mesh ref={causticsRef} position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial
        color={new THREE.Color(0.5, 0.8, 1)}
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}


// Realistic human diver (scuba diver, not swimmer)
function OceanDiver() {
  const diverRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const bubbleRef = useRef<THREE.Points>(null);
  const tankRef = useRef<THREE.Mesh>(null);

  // Create air bubbles from breathing apparatus
  const bubbleParticles = useMemo(() => {
    const count = 25;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (diverRef.current) {
      const time = clock.getElapsedTime();

      // Slow, methodical underwater exploration movement
      const swimSpeed = 0.08;
      const pathRadius = 25;
      diverRef.current.position.x = Math.sin(time * swimSpeed) * pathRadius;
      diverRef.current.position.z = Math.cos(time * swimSpeed) * (pathRadius * 0.8);

      // Diver moves underwater, occasionally surfacing
      const depthCycle = Math.sin(time * 0.1) * 0.5 + 0.5; // 0 to 1
      const baseDepth = -3; // Deeper underwater
      const surfaceDepth = -1.5; // Near surface
      diverRef.current.position.y = baseDepth + (surfaceDepth - baseDepth) * depthCycle + Math.sin(time * 0.5) * 0.2;

      // Face direction of movement and look around
      const directionX = Math.cos(time * swimSpeed) * swimSpeed;
      const directionZ = -Math.sin(time * swimSpeed) * swimSpeed * 0.8;
      diverRef.current.rotation.y = Math.atan2(directionX, directionZ) + Math.sin(time * 0.3) * 0.3; // Look around

      // Body orientation in water
      if (bodyRef.current) {
        bodyRef.current.rotation.x = Math.sin(time * 0.3) * 0.2 - 0.2; // Slight downward tilt
        bodyRef.current.rotation.z = Math.sin(time * 0.4) * 0.1;
      }

      // Slow, deliberate arm movements for underwater navigation
      if (leftArmRef.current && rightArmRef.current) {
        const armSpeed = 0.8;
        leftArmRef.current.rotation.x = Math.sin(time * armSpeed) * 0.4 - 0.2;
        leftArmRef.current.rotation.z = Math.sin(time * armSpeed * 0.7) * 0.3;

        rightArmRef.current.rotation.x = Math.sin(time * armSpeed + Math.PI * 0.3) * 0.4 - 0.2;
        rightArmRef.current.rotation.z = -Math.sin(time * armSpeed * 0.7) * 0.3;
      }

      // Slow, powerful fin kicks
      if (leftLegRef.current && rightLegRef.current) {
        const kickSpeed = 1.2;
        leftLegRef.current.rotation.x = Math.sin(time * kickSpeed) * 0.5;
        rightLegRef.current.rotation.x = Math.sin(time * kickSpeed + Math.PI * 0.6) * 0.5;
      }

      // Head movement looking around underwater
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(time * 0.4) * 0.4; // Look left/right
        headRef.current.rotation.x = Math.sin(time * 0.3) * 0.2; // Look up/down
      }

      // Animate breathing bubbles
      if (bubbleRef.current) {
        const positions = bubbleRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < bubbleParticles.length; i += 3) {
          positions[i + 1] += 0.02; // Bubbles rise faster
          positions[i] += Math.sin(time + i) * 0.001; // Slight drift

          if (positions[i + 1] > 3) {
            positions[i + 1] = 0;
            positions[i] = (Math.random() - 0.5) * 0.5;
          }
        }
        bubbleRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={diverRef} position={[0, -1.5, 0]} scale={[0.5, 0.5, 0.5]}>
      {/* Human body in wetsuit */}
      <mesh ref={bodyRef} position={[0, 0, 0]} rotation={[-0.2, 0, 0]}>
        <capsuleGeometry args={[0.8, 2.5, 16, 24]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Human head with diving mask */}
      <mesh ref={headRef} position={[0, 1.4, 0.3]}>
        <sphereGeometry args={[0.6, 24, 20]} />
        <meshStandardMaterial
          color="#d4a574"
          roughness={0.6}
          metalness={0.0}
        />
      </mesh>

      {/* Diving mask (realistic) */}
      <mesh position={[0, 1.4, 0.7]} scale={[1.1, 0.8, 0.6]}>
        <sphereGeometry args={[0.5, 16, 12]} />
        <meshStandardMaterial
          color="#2563eb"
          transparent
          opacity={0.8}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>

      {/* Mask frame */}
      <mesh position={[0, 1.4, 0.7]}>
        <torusGeometry args={[0.45, 0.05, 8, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Breathing regulator */}
      <mesh position={[0, 1.2, 0.8]}>
        <cylinderGeometry args={[0.1, 0.12, 0.2, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Air hose */}
      <mesh position={[0.3, 1.0, 0.6]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#1f2937" roughness={0.6} />
      </mesh>

      {/* Scuba tank on back */}
      <mesh ref={tankRef} position={[0, 0.5, -0.5]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1.5, 12]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Tank valve */}
      <mesh position={[0, 1.3, -0.5]}>
        <cylinderGeometry args={[0.05, 0.08, 0.15, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Left arm with wetsuit */}
      <group ref={leftArmRef} position={[-1.0, 0.9, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.5, 0]} rotation={[0, 0, -0.1]}>
          <capsuleGeometry args={[0.28, 0.9, 12, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
        {/* Forearm */}
        <mesh position={[-0.1, -1.0, 0]} rotation={[0, 0, -0.05]}>
          <capsuleGeometry args={[0.22, 0.8, 12, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
        {/* Hand with diving glove */}
        <mesh position={[-0.15, -1.5, 0]}>
          <sphereGeometry args={[0.18, 12, 10]} />
          <meshStandardMaterial color="#000000" roughness={0.6} />
        </mesh>
      </group>

      {/* Right arm with wetsuit */}
      <group ref={rightArmRef} position={[1.0, 0.9, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.5, 0]} rotation={[0, 0, 0.1]}>
          <capsuleGeometry args={[0.28, 0.9, 12, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0.1, -1.0, 0]} rotation={[0, 0, 0.05]}>
          <capsuleGeometry args={[0.22, 0.8, 12, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
        {/* Hand with diving glove */}
        <mesh position={[0.15, -1.5, 0]}>
          <sphereGeometry args={[0.18, 12, 10]} />
          <meshStandardMaterial color="#000000" roughness={0.6} />
        </mesh>
      </group>

      {/* Left leg with wetsuit */}
      <group ref={leftLegRef} position={[-0.4, -1.6, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.6, 0]}>
          <capsuleGeometry args={[0.35, 1.2, 12, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
        {/* Calf */}
        <mesh position={[0, -1.4, 0]}>
          <capsuleGeometry args={[0.28, 1.0, 12, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
        {/* Diving fin */}
        <mesh position={[0, -2.1, 0.6]}>
          <boxGeometry args={[0.7, 0.2, 1.4]} />
          <meshStandardMaterial color="#1e40af" roughness={0.3} metalness={0.1} />
        </mesh>
      </group>

      {/* Right leg with wetsuit */}
      <group ref={rightLegRef} position={[0.4, -1.6, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.6, 0]}>
          <capsuleGeometry args={[0.35, 1.2, 12, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
        {/* Calf */}
        <mesh position={[0, -1.4, 0]}>
          <capsuleGeometry args={[0.28, 1.0, 12, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
        {/* Diving fin */}
        <mesh position={[0, -2.1, 0.6]}>
          <boxGeometry args={[0.7, 0.2, 1.4]} />
          <meshStandardMaterial color="#1e40af" roughness={0.3} metalness={0.1} />
        </mesh>
      </group>

      {/* Air bubbles from regulator */}
      <points ref={bubbleRef} position={[0, 1.2, 1.0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={bubbleParticles}
            count={bubbleParticles.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color={new THREE.Color(0.9, 0.95, 1)}
          transparent
          opacity={0.7}
        />
      </points>

      {/* BCD vest details */}
      <mesh position={[0, 0.3, 0.2]}>
        <boxGeometry args={[1.2, 1.8, 0.3]} />
        <meshStandardMaterial color="#4b5563" roughness={0.5} />
      </mesh>

      {/* Weight belt */}
      <mesh position={[0, -0.5, 0.1]}>
        <cylinderGeometry args={[0.9, 0.9, 0.1, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.3} roughness={0.7} />
      </mesh>
    </group>
  );
}

// Realistic animated sky with volumetric clouds
function AnimatedSky() {
  const skyRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Advanced sky material with atmospheric scattering
  const skyMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: {
        time: { value: 0 },
        sunPosition: { value: new THREE.Vector3(30, 40, -20) },
        topColor: { value: new THREE.Color(0x1e90ff) }, // Brilliant sky blue
        horizonColor: { value: new THREE.Color(0x87ceeb) }, // Clear sky blue
        sunColor: { value: new THREE.Color(0xffffff) }, // Pure white sun
        atmosphereColor: { value: new THREE.Color(0xb0e0e6) }, // Powder blue atmosphere
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 sunPosition;
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform vec3 sunColor;
        uniform vec3 atmosphereColor;
        varying vec3 vWorldPosition;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          vec3 direction = normalize(vWorldPosition);
          float elevation = direction.y;

          // Sky gradient based on elevation
          float gradientFactor = smoothstep(-0.2, 0.8, elevation);
          vec3 skyColor = mix(horizonColor, topColor, gradientFactor);

          // Atmospheric scattering near horizon
          float horizon = 1.0 - abs(elevation);
          float atmosphere = pow(horizon, 3.0) * 0.6;
          skyColor = mix(skyColor, atmosphereColor, atmosphere);

          // Sun glow effect
          vec3 sunDir = normalize(sunPosition);
          float sunDot = max(dot(direction, sunDir), 0.0);
          float sunGlow = pow(sunDot, 150.0) * 2.0;
          float sunHalo = pow(sunDot, 15.0) * 0.3;

          skyColor += sunColor * sunGlow;
          skyColor += atmosphereColor * sunHalo;

          // Subtle cloud shadows in sky
          float cloudShadow = sin(vUv.x * 8.0 + time * 0.1) * sin(vUv.y * 6.0 + time * 0.07) * 0.02 + 0.98;
          skyColor *= cloudShadow;

          gl_FragColor = vec4(skyColor, 1.0);
        }
      `
    });
  }, []);

  useFrame(({ clock }) => {
    if (skyRef.current) {
      skyMaterial.uniforms.time.value = clock.getElapsedTime();
    }

    // Animate clouds with more realistic movement
    if (cloudsRef.current) {
      const time = clock.getElapsedTime();
      cloudsRef.current.children.forEach((cloud, index) => {
        const windSpeed = 0.005 + (index % 3) * 0.002;
        cloud.position.x += windSpeed;
        cloud.position.z += Math.sin(time * 0.1 + index) * 0.001;

        // Gentle vertical bobbing
        cloud.position.y += Math.sin(time * 0.3 + index * 2) * 0.002;

        // Reset cloud position when it goes too far
        if (cloud.position.x > 100) {
          cloud.position.x = -100;
          cloud.position.z = (Math.random() - 0.5) * 120;
        }
      });
    }
  });

  return (
    <group>
      {/* Realistic sky dome */}
      <mesh ref={skyRef} position={[0, 0, 0]}>
        <sphereGeometry args={[200, 64, 32]} />
        <primitive object={skyMaterial} attach="material" />
      </mesh>

      {/* Volumetric clouds with realistic shapes */}
      <group ref={cloudsRef}>
        {Array.from({ length: 12 }).map((_, i) => {
          const cloudParts = Math.floor(Math.random() * 4) + 3; // 3-6 parts per cloud
          const isNearSun = i < 3; // First 3 clouds will be positioned near the sun
          return (
            <group
              key={i}
              position={
                isNearSun
                  ? [
                      15 + Math.random() * 15, // Near sun X position (20)
                      25 + Math.random() * 15, // Near sun Y position (30)
                      -10 + Math.random() * 10 // In front of sun Z position (-15)
                    ]
                  : [
                      (Math.random() - 0.5) * 160,
                      20 + Math.random() * 15,
                      (Math.random() - 0.5) * 160
                    ]
              }
            >
              {Array.from({ length: cloudParts }).map((_, j) => (
                <mesh
                  key={j}
                  position={[
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 8
                  ]}
                  scale={[
                    1.5 + Math.random() * 3,
                    0.6 + Math.random() * 0.8,
                    1.5 + Math.random() * 3
                  ]}
                  rotation={[
                    Math.random() * 0.3,
                    Math.random() * Math.PI * 2,
                    Math.random() * 0.3
                  ]}
                >
                  <sphereGeometry args={[3, 16, 12]} />
                  <meshLambertMaterial
                    color="#ffffff" // Pure bright white clouds
                    transparent
                    opacity={isNearSun ? 0.95 : 0.9 + Math.random() * 0.1} // Higher opacity for sun-blocking clouds
                    fog={false}
                  />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>

      {/* Atmospheric haze layer */}
      <mesh ref={atmosphereRef} position={[0, 5, 0]}>
        <sphereGeometry args={[180, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.3]} />
        <meshBasicMaterial
          color="#e6f7ff" // Clear blue atmosphere
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// Realistic sun with corona and atmospheric effects
function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (sunRef.current) {
      const time = clock.getElapsedTime();
      // Gentle sun glow animation
      sunRef.current.material.emissiveIntensity = 1.2 + Math.sin(time * 0.5) * 0.1;
    }

    if (coronaRef.current) {
      const time = clock.getElapsedTime();
      coronaRef.current.rotation.z += 0.001;
      coronaRef.current.material.opacity = 0.3 + Math.sin(time * 0.7) * 0.1;
    }

    if (glowRef.current) {
      const time = clock.getElapsedTime();
      glowRef.current.rotation.z -= 0.0005;
      glowRef.current.material.opacity = 0.15 + Math.sin(time * 0.3) * 0.05;
    }
  });

  return (
    <group position={[15, 25, -5]}>
      {/* Sun core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[6, 24, 16]} />
        <meshBasicMaterial
          color="#ffff00" // Bright yellow sun
          emissive="#ffff00" // Yellow emission
          emissiveIntensity={3.0}
        />
      </mesh>

      {/* Sun corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[8, 24, 16]} />
        <meshBasicMaterial
          color="#ffff88" // Bright yellow corona
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Sun glow/atmosphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[12, 16, 12]} />
        <meshBasicMaterial
          color="#ffff66" // Bright yellow glow
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Sun rays */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 6,
              Math.sin(angle) * 6,
              0
            ]}
            rotation={[0, 0, angle]}
          >
            <planeGeometry args={[0.5, 8]} />
            <meshBasicMaterial
              color="#ffff00" // Bright yellow sun rays
              transparent
              opacity={0.5}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Subtle AR data overlays (minimal)
function SubtleAROverlays() {
  const overlayRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (overlayRef.current) {
      const time = clock.getElapsedTime();

      // Very gentle breathing animation
      overlayRef.current.children.forEach((child, index) => {
        if (child.material) {
          child.material.opacity = 0.3 + Math.sin(time + index * 0.5) * 0.1;
        }
      });
    }
  });

  return (
    <group ref={overlayRef} position={[0, 5, 10]}>
      {/* Minimal data indicators */}
      <mesh position={[-20, 0, 0]}>
        <ringGeometry args={[3, 3.2, 32]} />
        <meshBasicMaterial
          color="#4682b4"
          transparent
          opacity={0.3}
        />
      </mesh>

      <mesh position={[20, 0, 0]}>
        <ringGeometry args={[2.5, 2.7, 32]} />
        <meshBasicMaterial
          color="#00bfff"
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

// Main AR/VR Ocean Background Component
interface ARVROceanBackgroundProps {
  className?: string;
}

export default function ARVROceanBackground({ className = "" }: ARVROceanBackgroundProps) {
  const isLaunch = className.includes('launch');

  return (
    <div
      className={`fixed ${className}`}
      style={{
        zIndex: -100,
        top: isLaunch ? '0px' : '60px',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: isLaunch ? '100vh' : 'calc(100vh - 60px)',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}
    >
      {/* Crystal clear sky and ocean gradient */}
      <div
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(circle at 35% 8%, rgba(255, 255, 255, 0.6) 0%, transparent 45%),
            radial-gradient(circle at 65% 12%, rgba(230, 247, 255, 0.5) 0%, transparent 55%),
            radial-gradient(circle at 20% 25%, rgba(176, 224, 230, 0.3) 0%, transparent 60%),
            linear-gradient(to bottom,
              #1e90ff 0%,
              #00bfff 18%,
              #87ceeb 35%,
              #b0e0e6 50%,
              #00bfff 65%,
              #1e90ff 78%,
              #006994 90%,
              #003d5c 100%
            )
          `
        }}
      />

      {/* 3D AR/VR Ocean Scene */}
      <Suspense fallback={null}>
        <Canvas
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          camera={{
            position: [0, 3, 20],
            fov: 60,
            far: 1000,
            aspect: window.innerWidth / window.innerHeight
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
          }}
          onCreated={(state) => {
            console.log('Canvas created successfully');
            state.gl.setClearColor('#87CEEB', 0);
            state.gl.setSize(window.innerWidth, window.innerHeight);
          }}
          onError={(error) => {
            console.error('Canvas error:', error);
          }}
        >
          {/* Bright clear day ambient lighting */}
          <ambientLight intensity={1.0} color="#ffffff" />

          {/* Brilliant sun daylight */}
          <directionalLight
            position={[30, 40, -20]}
            intensity={2.0}
            color="#ffffff"
            castShadow
          />

          {/* Clear sky reflection */}
          <hemisphereLight
            skyColor="#87ceeb"
            groundColor="#00bfff"
            intensity={0.8}
          />

          {/* Crystal clear atmospheric light */}
          <pointLight
            position={[0, 40, 0]}
            intensity={0.5}
            color="#ffffff"
            distance={150}
          />

          {/* Animated sky with clouds */}
          <AnimatedSky />

          {/* Sun in the sky */}
          <Sun />

          {/* Natural Ocean Surface with subtle AR glow */}
          <ARNaturalOcean />


          {/* Natural underwater bubbles */}
          <UnderwaterBubbles />

          {/* Underwater caustics */}
          <UnderwaterCaustics />

          {/* Minimal AR overlays */}
          <SubtleAROverlays />

          {/* Crystal clear visibility */}
          <fog attach="fog" args={['#87ceeb', 50, 200]} />
        </Canvas>
      </Suspense>

      {/* Subtle water texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            repeating-linear-gradient(
              45deg,
              transparent 0px,
              transparent 100px,
              rgba(70, 130, 180, 0.02) 100px,
              rgba(70, 130, 180, 0.02) 102px
            )
          `,
          mixBlendMode: 'multiply'
        }}
      />
    </div>
  );
}