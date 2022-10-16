import { Canvas } from '@react-three/fiber'
import { CameraRig } from './CameraRig'
import { Skybox } from './Skybox'
import { SpawnPoint } from './SpawnPoint'

export const GridScene = () => {
  return (
    <Canvas
      style={{
        position: 'absolute',
        top: 0,
      }}
    >
      <Skybox />
      {/* <Druid position={[-0, 0, -20]} rotation={[0, 0, 0]} scale={2} /> */}
      <SpawnPoint />
      <rectAreaLight
        width={6}
        height={6}
        color={'#ffffff'}
        intensity={0.45}
        position={[-0, 0, -19]}
        lookAt={[-0, 10, -20]}
        penumbra={1}
        castShadow
      />
      <gridHelper args={[1000, 100, '#008080', '#008080']} />
      <mesh
        receiveShadow={true}
        scale={[1000, 1000, 1000]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.25, 0]}
      >
        <planeGeometry />
        <meshPhongMaterial color="black" receiveShadow />
      </mesh>
      <ambientLight intensity={0.5} />
      <hemisphereLight intensity={0.25} />
      <CameraRig />
      {/* <Effects /> */}
    </Canvas>
  )
}
