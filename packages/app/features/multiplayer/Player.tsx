import { useRef } from 'react'
import * as THREE from 'three'
import { Box, PerspectiveCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, RigidBodyApi, Vector3Array } from '@react-three/rapier'
import { Boxman } from './Boxman'
import { usePersonControls } from './usePersonControls'

let currentPosition = new THREE.Vector3()
let currentLookat = new THREE.Vector3()

export const Player = () => {
  const player = useRef<RigidBodyApi>(null)
  const box = useRef<THREE.Group>(null)
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

  useFrame((state, delta) => {
    if (box.current) {
      const idealOffset = _CalculateIdealOffset(box.current)
      const idealLookat = _CalculateIdealLookat(box.current)
      // console.log(idealLookat)

      const timeElapsed = delta
      // state.clock.getElapsedTime()
      // console.log(timeElapsed)

      const t = 1.0 - Math.pow(0.01, timeElapsed)

      currentPosition.lerp(idealLookat, 0.1)
      currentLookat.lerp(idealOffset, 0.1)

      state.camera.position.copy(currentPosition)
      state.camera.lookAt(currentLookat)

      // state.camera.position.lerp(idealOffset, 0.1)

      // state.camera.lookAt(idealLookat)

      state.camera.updateProjectionMatrix()

      // this._currentPosition.lerp(idealOffset, t)
      // this._currentLookat.lerp(idealLookat, t)

      // this._camera.position.copy(this._currentPosition)
      // this._camera.lookAt(this._currentLookat)

      // const position = new THREE.Vector3()
      // box.current.getWorldPosition(position)
      // // console.log(box.current.getWorldPosition(position))

      // // console.log('camera?', camera.position)
      // // camera.position.x = box.current.position.x
      // // console.log('BOX POSITION?', box.current.position)

      // // Put the camera a little behind and above the box via lerp for smooth animation.
      // state.camera.position.lerp(new THREE.Vector3(position.x, position.y + 2, position.z - 4), 0.1)

      // position.x = position.x + Math.sin(state.clock.getElapsedTime() * 0.2)
      // position.y = position.y + Math.cos(state.clock.getElapsedTime() * 0.2)
      // position.z = position.z + Math.cos(state.clock.getElapsedTime() * 0.2)
      // // position.z = Math.cos(state.clock.getElapsedTime() * 2)

      // state.camera.lookAt(position)
      // state.camera.updateProjectionMatrix()
      // camera.position.x = position.x - 2
      // camera.position.y = position.y + 2
      // camera.position.z = position.z - 2

      // camera.lookAt(position)
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

const _CalculateIdealOffset = (target: THREE.Group) => {
  const idealOffset = new THREE.Vector3(-0, 1, -4)

  const position = new THREE.Vector3()
  target.getWorldPosition(position)

  idealOffset.applyQuaternion(target.quaternion)
  idealOffset.add(position)

  return idealOffset
}

const _CalculateIdealLookat = (target: THREE.Group) => {
  const idealLookat = new THREE.Vector3(0, 2, 7)

  const position = new THREE.Vector3()
  target.getWorldPosition(position)

  idealLookat.applyQuaternion(target.quaternion)
  idealLookat.add(position)
  return idealLookat
}
