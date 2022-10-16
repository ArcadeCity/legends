import { Realgame } from 'app/arca/realgame'
import { store } from 'arca/store'
import { PerspectiveCamera } from 'three'
import { Hud } from 'views/hud/Hud'
import { Canvas } from '@react-three/fiber'

export const HomeScreen = () => {
  return (
    <>
      <Canvas
        onCreated={({ camera, gl, scene }) => {
          const realgame = new Realgame({
            camera: camera as PerspectiveCamera,
            renderer: gl,
            scene,
          })
          store.setState({ realgame })
        }}
      >
        <></>
      </Canvas>
      <Hud />
    </>
  )
}
