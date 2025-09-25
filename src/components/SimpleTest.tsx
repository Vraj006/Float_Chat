import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SimpleTest = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('Starting simple Three.js test...');

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create a simple cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Create moving lights
    const light1Geometry = new THREE.SphereGeometry(0.1);
    const light1Material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const light1 = new THREE.Mesh(light1Geometry, light1Material);
    light1.position.set(-2, 0, 0);
    scene.add(light1);

    const light2Geometry = new THREE.SphereGeometry(0.1);
    const light2Material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const light2 = new THREE.Mesh(light2Geometry, light2Material);
    light2.position.set(2, 0, 0);
    scene.add(light2);

    console.log('Scene created, starting animation...');

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate cube
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      // Move lights
      light1.position.x = Math.sin(Date.now() * 0.001) * 3;
      light2.position.x = Math.cos(Date.now() * 0.001) * 3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default SimpleTest;