import React, { useEffect } from 'react'
import { CubeTextureLoader } from 'three'
import { useThree } from '@react-three/fiber'
import { setState } from './store'

export const Skybox = () => {
  const { scene } = useThree()

  useEffect(() => {
    scene.background = new CubeTextureLoader()
      .setPath('/resources/')
      .load(
        [
          'space-posx.jpg',
          'space-negx.jpg',
          'space-posy.jpg',
          'space-negy.jpg',
          'space-posz.jpg',
          'space-negz.jpg',
        ],
        () => {
          setState({ loadedSkybox: true })
        }
      )
  }, [scene])

  return <></>
}
