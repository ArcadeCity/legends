import { useBox } from '@react-three/cannon'
import { useFrame, useThree } from '@react-three/fiber'

export const Player = () => {
  const { camera } = useThree()
  const [ref] = useBox(() => ({
    mass: 1,
    type: 'Dynamic',
    args: [1, 1, 1],
    position: [0, 5, 0],
  }))
  useFrame(() => {
    if (!ref || !ref.current) return
    ref.current.position.set(camera.position.x, camera.position.y, camera.position.z)
  })
  return (
    <mesh ref={ref}>
      <boxBufferGeometry attach="geometry" />
      <meshStandardMaterial attach="material" color="hotpink" />
    </mesh>
  )
}
