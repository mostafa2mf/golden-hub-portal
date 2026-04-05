import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

const TorusKnot = () => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.08;
    ref.current.rotation.y = state.clock.elapsedTime * 0.12;
  });
  return (
    <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.6}>
      <mesh ref={ref} position={[0, 0, -2]} scale={1.6}>
        <torusKnotGeometry args={[1, 0.35, 200, 32, 2, 3]} />
        <MeshDistortMaterial
          color="#b8860b"
          emissive="#5a4106"
          emissiveIntensity={0.15}
          roughness={0.15}
          metalness={0.95}
          distort={0.08}
          speed={0.8}
          envMapIntensity={1.2}
        />
      </mesh>
    </Float>
  );
};

const OrbitRings = () => {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.15;
  });

  const rings = useMemo(() => [
    { radius: 2.8, tube: 0.008, rotation: [0.5, 0, 0] as [number, number, number], opacity: 0.6 },
    { radius: 3.2, tube: 0.006, rotation: [0.8, 0.3, 0] as [number, number, number], opacity: 0.4 },
    { radius: 3.6, tube: 0.005, rotation: [1.2, 0.6, 0.2] as [number, number, number], opacity: 0.25 },
  ], []);

  return (
    <group ref={groupRef} position={[0, 0, -2]}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={ring.rotation}>
          <torusGeometry args={[ring.radius, ring.tube, 64, 128]} />
          <meshStandardMaterial
            color="#c9982e"
            emissive="#c9982e"
            emissiveIntensity={0.5}
            transparent
            opacity={ring.opacity}
            metalness={1}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

const FloatingGems = () => {
  const groupRef = useRef<THREE.Group>(null!);

  const gems = useMemo(() => 
    Array.from({ length: 6 }, (_, i) => ({
      position: [
        Math.cos((i / 6) * Math.PI * 2) * 4.5,
        Math.sin((i / 6) * Math.PI * 2) * 2.5 + (Math.random() - 0.5),
        -3 - Math.random() * 2,
      ] as [number, number, number],
      scale: 0.08 + Math.random() * 0.06,
      speed: 0.5 + Math.random() * 0.5,
    })),
    []
  );

  useFrame((state) => {
    groupRef.current.rotation.z = state.clock.elapsedTime * 0.015;
  });

  return (
    <group ref={groupRef}>
      {gems.map((gem, i) => (
        <Float key={i} speed={gem.speed} rotationIntensity={0.6} floatIntensity={1.2}>
          <mesh position={gem.position} scale={gem.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color="#daa520"
              emissive="#8b6914"
              emissiveIntensity={0.4}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const Particles = () => {
  const ref = useRef<THREE.Points>(null!);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 6;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = Math.sin(theta) * r - 3;
    }
    return pos;
  }, []);

  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#daa520" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
};

const Scene = () => (
  <>
    <ambientLight intensity={0.1} />
    <directionalLight position={[5, 8, 5]} intensity={0.5} color="#ffeaa7" />
    <pointLight position={[-3, 4, 2]} intensity={0.2} color="#daa520" distance={15} />
    <pointLight position={[4, -2, -1]} intensity={0.15} color="#b8860b" distance={12} />
    <spotLight position={[0, 6, 4]} intensity={0.3} angle={0.4} penumbra={0.8} color="#ffd700" />

    <TorusKnot />
    <OrbitRings />
    <FloatingGems />
    <Particles />

    <Environment preset="night" />
  </>
);

const LandingBackground3D = () => (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  </div>
);

export default LandingBackground3D;
