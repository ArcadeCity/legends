import Realgame from 'app/arca/realgame/Realgame2'
import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { useStore, useThree } from '@react-three/fiber'

export const MapViewCanvasComponent = (props: any) => {
  const { camera, gl, scene } = useThree()
  const store = useStore()
  const [map, setMap] = useState<Realgame>()
  useEffect(() => {
    if (!store) return
    setMap(
      new Realgame({
        canvas: gl.domElement,
        renderer: gl,
        scene,
        camera: camera as THREE.PerspectiveCamera,
      })
    )
    console.log('Realgame initialized.')
  }, [store])

  // useFrame((_, delta) => {
  //   map?.update()
  // })

  return <></>
}
