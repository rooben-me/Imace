import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

function ImagePoint({ position, imageData }) {
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return loader.load(imageData);
  }, [imageData]);

  const meshRef = useRef();

  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <planeGeometry />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}

export default function ThreeDGallery() {
  const { data: imagePoints, error: imagePointsError } = useSWR(
    "http://127.0.0.1:8000/image_points",
    fetcher
  );

  if (imagePointsError) return <div>Failed to load image points</div>;
  if (!imagePoints) return <div>Loading...</div>;

  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {imagePoints.map((point) => (
        <ImagePoint
          key={point.id}
          position={point.position}
          imageData={point.imageData}
        />
      ))}
      <OrbitControls />
    </Canvas>
  );
}
