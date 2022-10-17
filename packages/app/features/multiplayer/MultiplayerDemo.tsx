import { Suspense } from 'react'
import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Skybox } from '../grid/Skybox'
import { Effects } from './Effects'
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
      <Effects />
      <OrbitControls />
    </Canvas>
  )
}
