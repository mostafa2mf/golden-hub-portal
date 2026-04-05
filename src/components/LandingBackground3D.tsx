import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const GoldSphere = ({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
  });
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.5}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color="#c9982e"
          emissive="#8b6914"
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.9}
          distort={0.25}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
};

const Particles = () => {
  const ref = useRef<THREE.Points>(null!);
  const count = 120;

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      sz[i] = Math.random() * 0.03 + 0.01;
    }
    return [pos, sz];
  }, []);

  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#c9982e" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
};

const GoldRing = ({ position, scale }: { position: [number, number, number]; scale: number }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.15;
    ref.current.rotation.z = state.clock.elapsedTime * 0.1;
  });
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.8}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusGeometry args={[1, 0.02, 16, 80]} />
        <meshStandardMaterial color="#c9982e" emissive="#8b6914" emissiveIntensity={0.4} metalness={1} roughness={0.2} />
      </mesh>
    </Float>
  );
};

const Scene = () => (
  <>
    <ambientLight intensity={0.15} />
    <directionalLight position={[5, 5, 5]} intensity={0.4} color="#ffd700" />
    <pointLight position={[-4, 3, 2]} intensity={0.3} color="#c9982e" />
    <pointLight position={[3, -2, -3]} intensity={0.15} color="#8b6914" />

    <GoldSphere position={[-3.5, 1.5, -2]} scale={0.7} speed={1.2} />
    <GoldSphere position={[4, -1, -3]} scale={0.5} speed={0.8} />
    <GoldSphere position={[1.5, 2.5, -4]} scale={0.35} speed={1.5} />

    <GoldRing position={[-2, -1.5, -2]} scale={1.8} />
    <GoldRing position={[3.5, 1.8, -3]} scale={1.2} />

    <Particles />
  </>
);

const LandingBackground3D = () => (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
    <Canvas
      camera={{ position: [0, 0, 6], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  </div>
);

export default LandingBackground3D;
