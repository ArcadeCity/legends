import { Physics } from '@react-three/cannon'
import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Player } from './Player'

export const MultiplayerDemo = () => {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      <Physics>
        <Player />
      </Physics>

      <OrbitControls />
    </Canvas>
  )
}
