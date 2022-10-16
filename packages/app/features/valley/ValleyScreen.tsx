import { store } from 'app/arca/store'
import { Realgame } from 'app/arca/valley/Realgame'
import { Hud } from 'arca/valley/hud'
import { PerspectiveCamera } from 'three'
import { Canvas } from '@react-three/fiber/native'

export const ValleyScreen = () => {
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
