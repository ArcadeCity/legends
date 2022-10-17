import { useRef } from 'react'
import * as THREE from 'three'
import { Box, PerspectiveCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, RigidBodyApi, Vector3Array } from '@react-three/rapier'
import { Boxman } from './Boxman'
import { usePersonControls } from './usePersonControls'

export const Player = () => {
  const player = useRef<RigidBodyApi>(null)
  const box = useRef<Group>(null)
  const { forward, backward, left, right, jump } = usePersonControls()
  const torque = 0.2

  const camera = useThree((state) => state.camera)

  // useThree(({ camera }) => {
  //   camera.position.y = 8
  //   // camera.lookAt(0, 0, 0)

  //   // if we have a box ref, look at it.
  //   if (box.current) {
  //     camera.lookAt(box.current.position)
  //   }
  // })

  useFrame(() => {
    if (box.current) {
      const position = new THREE.Vector3()
      box.current.getWorldPosition(position)
      // console.log(box.current.getWorldPosition(position))

      // console.log('camera?', camera.position)
      // camera.position.x = box.current.position.x
      // console.log('BOX POSITION?', box.current.position)
      camera.lookAt(position)
    }

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
      <group ref={box}>
        <Box args={[1.5, 0.2, 3]}>
          {/* Make the box invisible */}
          <meshBasicMaterial attach="material" color="blue" transparent opacity={0.4} />
          <Boxman />
        </Box>
      </group>
    </RigidBody>
  )
}
