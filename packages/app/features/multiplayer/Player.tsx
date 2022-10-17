import { Box } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export const Player = () => {
  return (
    <RigidBody position={[0, 4, 0]} colliders={'hull'} restitution={0.3}>
      <Box>
        <meshStandardMaterial color="darkorange" />
      </Box>
    </RigidBody>
  )
}
