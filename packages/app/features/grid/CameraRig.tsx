import { useRef } from 'react'
import { PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import useStore from './store'

export const CameraRig = () => {
  const ref = useRef<any>()
  const pubkey = useStore((state) => state.pubkey)
  const howClose = pubkey ? -12 : -6
  useFrame(() => {
    if (ref.current.position.z > howClose) {
      ref.current.position.z -= 0.02
    }
  })
  return (
    <>
      {/* @ts-ignore */}
      <PerspectiveCamera ref={ref} makeDefault position={[0, 2, 10]} lookAt={[-0, 0, -20]} />
    </>
  )
}
