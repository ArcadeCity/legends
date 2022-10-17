import { LUTCubeLoader } from 'postprocessing'
import { useLoader } from '@react-three/fiber'
import { Bloom, EffectComposer, LUT, Vignette } from '@react-three/postprocessing'

export function Effects() {
  const texture = useLoader(LUTCubeLoader, '/F-6800-STD.cube')
  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.42} mipmapBlur luminanceSmoothing={0.2} intensity={1.25} />
      <Vignette eskil={true} offset={0.01} darkness={0.8} />
      <LUT lut={texture} />
    </EffectComposer>
  )
}
