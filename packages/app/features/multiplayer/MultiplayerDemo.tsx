import { Suspense } from 'react'
import { Box, OrbitControls, Torus } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { Player } from './Player'

export const MultiplayerDemo = () => {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      <Suspense fallback={null}>
        <Physics>
          <RigidBody colliders={'hull'} restitution={2}>
            <Torus>
              <meshStandardMaterial color="blue" />
            </Torus>
          </RigidBody>

          <RigidBody colliders={'hull'} restitution={2}>
            <Torus args={[1, 0.5, 16, 100]}>
              <meshStandardMaterial color="orange" />
            </Torus>
          </RigidBody>

          <RigidBody position={[0, -2, 0]} type="kinematicPosition">
            {/* Add a green material */}
            <Box args={[20, 0.5, 20]}>
              <meshStandardMaterial color="green" />
            </Box>
          </RigidBody>
        </Physics>
      </Suspense>

      <OrbitControls />
    </Canvas>
  )
}
