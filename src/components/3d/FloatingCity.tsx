import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Box, Cylinder, Sphere } from "@react-three/drei";
import * as THREE from "three";

function Building({ position, scale, isGlass }: { position: [number, number, number], scale: [number, number, number], isGlass?: boolean }) {
  return (
    <group position={position}>
      <Box args={scale} castShadow receiveShadow>
        {isGlass ? (
          <meshPhysicalMaterial 
            color="#e0e7ff" 
            metalness={0.9} 
            roughness={0.1} 
            transparent 
            opacity={0.8} 
            transmission={0.9} 
            ior={1.5}
          />
        ) : (
          <meshStandardMaterial 
            color="#1e1b4b" 
            metalness={0.4} 
            roughness={0.8} 
          />
        )}
      </Box>

      <Box args={[scale[0] * 0.8, 0.2, scale[2] * 0.8]} position={[0, scale[1] / 2 + 0.1, 0]} castShadow>
        <meshStandardMaterial color="#4c1d95" metalness={0.6} roughness={0.4} />
      </Box>

      {!isGlass && scale[1] > 2 && (
        <mesh position={[0, 0, scale[2] / 2 + 0.01]}>
          <planeGeometry args={[scale[0] * 0.6, scale[1] * 0.8]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.4} wireframe />
        </mesh>
      )}
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Cylinder args={[0.05, 0.05, 0.4]} position={[0, 0.2, 0]} castShadow>
        <meshStandardMaterial color="#3f2c20" />
      </Cylinder>
      <Sphere args={[0.25, 8, 8]} position={[0, 0.5, 0]} castShadow>
        <meshStandardMaterial color="#10b981" roughness={0.9} />
      </Sphere>
    </group>
  );
}

export function FloatingCity() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  const cityData = useMemo(() => {
    const buildings = [];
    const trees = [];
    const gridSize = 4;
    const spacing = 1.5;

    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        if (Math.abs(x) < 1 && Math.abs(z) < 1) continue;

        const isStreet = Math.abs(x) % 2 === 0 || Math.abs(z) % 2 === 0;

        if (!isStreet) {
          const height = 1 + Math.random() * 3 + (4 - Math.max(Math.abs(x), Math.abs(z))) * 0.5;
          const width = 0.8 + Math.random() * 0.4;
          const depth = 0.8 + Math.random() * 0.4;
          buildings.push({
            position: [x * spacing, height / 2, z * spacing] as [number, number, number],
            scale: [width, height, depth] as [number, number, number],
            isGlass: Math.random() > 0.7
          });
        } else {
          if (Math.random() > 0.8) {
            trees.push({
              position: [x * spacing + (Math.random() - 0.5), 0, z * spacing + (Math.random() - 0.5)] as [number, number, number]
            });
          }
        }
      }
    }
    return { buildings, trees };
  }, []);

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
        
        <Cylinder args={[8, 7.5, 0.5, 64]} position={[0, -0.25, 0]} receiveShadow>
          <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
        </Cylinder>
        <Cylinder args={[7.8, 7.8, 0.52, 64]} position={[0, -0.25, 0]} receiveShadow>
          <meshStandardMaterial color="#064e3b" roughness={1} metalness={0} />
        </Cylinder>

        <group position={[0, 0, 0]}>
          <Cylinder args={[1.5, 1.8, 6, 8]} position={[0, 3, 0]} castShadow receiveShadow>
            <meshPhysicalMaterial 
              color="#ffffff" 
              metalness={0.8} 
              roughness={0.1} 
              transparent 
              opacity={0.7} 
              transmission={1} 
              ior={1.4}
            />
          </Cylinder>
          <Cylinder args={[1.4, 1.4, 6.1, 8]} position={[0, 3, 0]}>
            <meshBasicMaterial color="#d946ef" wireframe transparent opacity={0.3} />
          </Cylinder>
          
          <mesh position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.5, 0.05, 16, 100]} />
            <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.2, 0.03, 16, 100]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={2} />
          </mesh>
        </group>

        {cityData.buildings.map((b, i) => (
          <Building key={`b-${i}`} position={b.position} scale={b.scale} isGlass={b.isGlass} />
        ))}

        {cityData.trees.map((t, i) => (
          <Tree key={`t-${i}`} position={t.position} />
        ))}

        {Array.from({ length: 15 }).map((_, i) => {
          const angle = (i / 15) * Math.PI * 2;
          const radius = 3 + Math.random() * 4;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 1 + Math.random() * 4;

          return (
            <Float key={`car-${i}`} speed={5 + Math.random() * 5} rotationIntensity={0} floatIntensity={0} floatingRange={[-0.5, 0.5]}>
              <Sphere args={[0.08, 8, 8]} position={[x, y, z]}>
                <meshStandardMaterial 
                  color={i % 2 === 0 ? "#f43f5e" : "#38bdf8"} 
                  emissive={i % 2 === 0 ? "#f43f5e" : "#38bdf8"}
                  emissiveIntensity={3}
                />
              </Sphere>
            </Float>
          );
        })}

      </Float>
    </group>
  );
}
