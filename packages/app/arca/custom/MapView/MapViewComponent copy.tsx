import { MapView } from 'app/arca/mapview/MapView2'
import { useEffect, useState } from 'react'
import { PerspectiveCamera } from 'three'
import { useFrame, useStore, useThree } from '@react-three/fiber'
import { defaultOmvDataSource } from './defaultOmvDataSource'
import { MapViewDefaults } from './MapViewDefaults'

// import { MapView } from './MapView'

export const MapViewComponent = (props: any) => {
  const { camera, gl, scene } = useThree()
  const store = useStore()
  const [map, setMap] = useState<MapView>()
  useEffect(() => {
    if (!store) return
    console.log('STORE IS WHAT:', store.getState().camera)
    setMap(
      new MapView({
        canvas: gl.domElement,
        camera: camera as PerspectiveCamera,
        renderer: gl,
        scene,
      })
    )
    console.log('MapView initialized.')
  }, [store])

  useEffect(() => {
    if (!map) return

    // @ts-ignore
    map.setTheme(MapViewDefaults.theme)
    console.log('set theme?')

    // map.addDataSource(defaultOmvDataSource)
    // console.log('set data source?')
  }, [map])

  // useFrame((_, delta) => {
  //   map?.update()
  // })

  return <></>
}
