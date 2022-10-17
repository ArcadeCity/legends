import { Suspense } from 'react'
import { Box, OrbitControls, Torus } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { Skybox } from '../grid/Skybox'
import { Ground } from './Ground'
import { Player } from './Player'

export const MultiplayerDemo = () => {
  return (
    <Canvas>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} />

      <Suspense fallback={null}>
        <Physics>
          <Player />
          <Ground />
        </Physics>
      </Suspense>

      <Skybox />
      <OrbitControls />
    </Canvas>
  )
}
