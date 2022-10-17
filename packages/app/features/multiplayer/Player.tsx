import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, RigidBodyApi, Vector3Array } from '@react-three/rapier'
import { Boxman } from './Boxman'
import { usePersonControls } from './usePersonControls'

export const Player = () => {
  const player = useRef<RigidBodyApi>(null)
  const { forward, backward, left, right, jump } = usePersonControls()
  const torque = 0.001
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
    }
  })
  return (
    <RigidBody ref={player} position={[0, 4, 0]} colliders={'hull'} restitution={0.3}>
      <Boxman />
    </RigidBody>
  )
}
