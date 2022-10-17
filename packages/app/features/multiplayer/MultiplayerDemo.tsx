import { Suspense } from 'react'
import { Environment, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Skybox } from '../grid/Skybox'
import { Effects } from './Effects'
import { Ground } from './Ground'
import { Player } from './Player'

export const MultiplayerDemo = () => {
  return (
    <Canvas shadows>
      <Suspense fallback={null}>
        <Physics>
          <directionalLight
            castShadow
            position={[10, 10, 10]}
            shadow-camera-bottom={-40}
            shadow-camera-top={40}
            shadow-camera-left={-40}
            shadow-camera-right={40}
            shadow-mapSize-width={1024}
            shadow-bias={-0.0001}
          />
          <Environment preset="apartment" />
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
