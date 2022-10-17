import { Suspense } from 'react'
import { Box, OrbitControls, Torus } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { Player } from './Player'

export const MultiplayerDemo = () => {
  return (
    <Canvas>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} />

      <Suspense fallback={null}>
        <Physics>
          <Player />

          <RigidBody position={[0, -2, 0]} type="kinematicPosition">
            {/* Add a green material */}
            <Box args={[20, 0.5, 20]}>
              <meshStandardMaterial color="darkgreen" />
            </Box>
          </RigidBody>
        </Physics>
      </Suspense>

      <OrbitControls />
    </Canvas>
  )
}
