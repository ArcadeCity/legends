import { Box } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export const Ground = () => {
  return (
    <RigidBody position={[0, -2, 0]} type="kinematicPosition">
      <Box receiveShadow args={[40, 0.5, 40]}>
        <shadowMaterial opacity={0.7} />
        <meshStandardMaterial color="darkgreen" />
      </Box>
    </RigidBody>
  )
}
