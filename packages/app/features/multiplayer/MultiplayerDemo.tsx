import { Suspense } from 'react'
import { Box, OrbitControls, Torus } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { Player } from './Player'

export const MultiplayerDemo = () => {
  return (
    <Canvas>
      {/* <ambientLight /> */}
      {/* <pointLight position={[10, 10, 10]} /> */}

      <Suspense fallback={null}>
        <Physics>
          <RigidBody colliders={'hull'} restitution={2}>
            <Torus />
          </RigidBody>

          <RigidBody position={[0, -2, 0]} type="kinematicPosition">
            <Box args={[20, 0.5, 20]} />
          </RigidBody>
        </Physics>
      </Suspense>

      <OrbitControls />
    </Canvas>
  )
}
