import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

function TableModel() {
  return (
    <mesh rotation-x={-Math.PI/2} position={[0,-0.2,0]}>
      <cylinderGeometry args={[4,4,0.5,32]} />
      <meshStandardMaterial metalness={0.2} roughness={0.6} color="#0b6623" />
    </mesh>
  );
}

function SilhouettePlane({ index }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime + index) * 0.05;
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.3 + index) * 0.02;
  });
  return (
    <mesh ref={ref} position={[index-3, 1.2, -6]}>
      <planeGeometry args={[2,3]} />
      <meshStandardMaterial transparent opacity={0.5} color="#0a0a0a" />
    </mesh>
  );
}

export default function TableScene({ room, myId }) {
  return (
    <Canvas camera={{ position: [0,3.5,6], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5,10,5]} />
      <fog attach="fog" args={['#000016', 6, 18]} />
      <TableModel />
      {/* silhouettes in background */}
      {Array.from({length:6}).map((_,i)=>(<SilhouettePlane key={i} index={i} />))}
      <OrbitControls enablePan={false} />
      <Html position={[0,1,0]}>
        <div style={{color:'#fff', textAlign:'center'}}>
          <strong>Stół Pokerowy</strong>
          <div>Stage: {room?.stage || 'waiting'}</div>
        </div>
      </Html>
    </Canvas>
  );
}
