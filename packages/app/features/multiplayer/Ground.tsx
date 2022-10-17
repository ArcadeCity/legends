import { Box } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export const Ground = () => {
  return (
    <RigidBody position={[0, -2, 0]} type="kinematicPosition">
      <Box args={[20, 0.5, 20]}>
        <meshStandardMaterial color="darkgreen" />
      </Box>
    </RigidBody>
  )
}
