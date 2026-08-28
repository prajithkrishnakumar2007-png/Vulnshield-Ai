"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface RiskOrbProps {
  score?: number;
}

export default function RiskOrb({ score = 68.5 }: RiskOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any previous canvas (handles React StrictMode double mount)
    containerRef.current.innerHTML = "";

    const width = 80;
    const height = 80;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const isCritical = score >= 70;
    const isMedium = score >= 40 && score < 70;
    const orbColor = isCritical ? 0xff3b5c : isMedium ? 0xffb800 : 0x00e5ff;
    const speed = isCritical ? 0.035 : isMedium ? 0.02 : 0.012;

    const geometry = new THREE.IcosahedronGeometry(1.3, isCritical ? 1 : 2);
    const material = new THREE.MeshBasicMaterial({
      color: orbColor,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationFrameId: number;
    let clock = 0;

    const animate = () => {
      clock += 0.04;
      mesh.rotation.y += speed;
      mesh.rotation.x += speed * 0.5;

      const scale = 1 + Math.sin(clock) * 0.05;
      mesh.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [score]);

  return <div ref={containerRef} className="w-20 h-20 relative flex items-center justify-center flex-shrink-0" />;
}
