"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreatGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any previous canvas (handles React StrictMode double mount)
    containerRef.current.innerHTML = "";

    const width = containerRef.current.clientWidth || 380;
    const height = containerRef.current.clientHeight || 380;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();

    // Outer Wireframe Sphere
    const outerGeo = new THREE.SphereGeometry(1.9, 20, 20);
    const outerMat = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.3,
    });
    const outerSphere = new THREE.Mesh(outerGeo, outerMat);
    group.add(outerSphere);

    // Inner Core Sphere
    const innerGeo = new THREE.SphereGeometry(1.6, 14, 14);
    const innerMat = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0x7c5cff,
      transparent: true,
      opacity: 0.2,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerSphere);

    // Threat Nodes
    const nodeCoords = [
      [1.4, 0.5, 0.8],
      [-1.1, 1.0, -0.6],
      [0.4, -1.5, 0.8],
      [-1.4, -0.6, -0.9],
      [0.8, 1.3, -0.8],
      [1.5, -0.4, -0.5],
    ];

    nodeCoords.forEach((coord, idx) => {
      const nodeGeo = new THREE.SphereGeometry(0.09, 10, 10);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0xff3b5c : 0x00ffa3,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(coord[0], coord[1], coord[2]);
      group.add(nodeMesh);
    });

    scene.add(group);

    let animationFrameId: number;

    const animate = () => {
      group.rotation.y += 0.006;
      group.rotation.x += 0.002;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      outerGeo.dispose();
      outerMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[350px] relative flex items-center justify-center overflow-hidden" />;
}
