import { useRef } from 'react'
import { Box } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, RigidBodyApi, Vector3Array } from '@react-three/rapier'
import { Boxman } from './Boxman'
import { usePersonControls } from './usePersonControls'

export const Player = () => {
  const player = useRef<RigidBodyApi>(null)
  const { forward, backward, left, right, jump } = usePersonControls()
  const torque = 0.2
  useFrame(() => {
    if (player.current) {
      // const vector3array: Vector3Array = [0, 0, forward ? -torque : backward ? torque : 0]
      // player.current.applyImpulse(vector3array, [0, 0, 0])
      // player.current.applyTorqueImpulse({
      //   x: (right ? torque : 0) + (left ? -torque : 0),
      //   y: 0,
      //   z: (forward ? torque : 0) + (backward ? -torque : 0),
      // })
      // if (jump) player.current.applyTorqueImpulse({ x: 0, y: 5 * torque, z: 0 })

      player.current.applyImpulse({
        x: (right ? torque : 0) + (left ? -torque : 0),
        y: 0,
        z: (forward ? -torque : 0) + (backward ? torque : 0),
      })

      if (jump) player.current.applyImpulse({ x: 0, y: 2 * torque, z: 0 })
    }
  })
  return (
    <RigidBody ref={player} position={[0, 4, 0]} colliders={'hull'} restitution={0.1}>
      <Box args={[1.5, 0.2, 3]}>
        {/* Make the box invisible */}
        <meshBasicMaterial attach="material" color="blue" transparent opacity={0.4} />
        <Boxman />
      </Box>
    </RigidBody>
  )
}
