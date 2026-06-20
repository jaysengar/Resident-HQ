import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, PresentationControls, ContactShadows, BakeShadows, Preload } from "@react-three/drei";
import { FloatingCity } from "./FloatingCity";
import { ConnectionNodes } from "./ConnectionNodes";

export function SceneWrapper() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#09090b]">
      {/* Dynamic Purple/Blue Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#09090b]/40 pointer-events-none z-10" />

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 4, 16]} fov={45} />
        
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={2048} 
          shadow-bias={-0.0001}
        />
        <spotLight 
          position={[-10, 10, -5]} 
          intensity={2} 
          color="#a78bfa" 
          penumbra={1} 
        />
        <spotLight 
          position={[10, -10, 10]} 
          intensity={1} 
          color="#38bdf8" 
          penumbra={1} 
        />

        <Suspense fallback={null}>
          {/* Allow user to drag and rotate the entire city gently */}
          <PresentationControls 
            global 
            rotation={[0, 0.3, 0]} 
            polar={[-0.2, 0.2]} 
            azimuth={[-Math.PI / 4, Math.PI / 4]}
            config={{ mass: 2, tension: 400 }}
            snap={{ mass: 4, tension: 40 }}
          >
            <FloatingCity />
            <ConnectionNodes count={200} />
            
            {/* Fake shadow plane underneath the city */}
            <ContactShadows position={[0, -0.24, 0]} opacity={0.7} scale={20} blur={2} far={4} />
          </PresentationControls>

          <Environment preset="city" />
          <BakeShadows />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
