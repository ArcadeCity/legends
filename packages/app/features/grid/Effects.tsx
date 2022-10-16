import { LUTCubeLoader } from 'postprocessing'
import { useEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { Bloom, EffectComposer, LUT, SSR, Vignette } from '@react-three/postprocessing'
import { setState } from './store'

export default function Effects() {
  const texture = useLoader(LUTCubeLoader, '/F-6800-STD.cube')
  useEffect(() => {
    setState({ loadedEffects: true })
  }, [])
  const enabled = true
  return (
    enabled && (
      <EffectComposer disableNormalPass>
        {/* <SSR /> */}
        <Bloom luminanceThreshold={0.22} mipmapBlur luminanceSmoothing={0.1} intensity={1.95} />
        <Vignette eskil={true} offset={0.05} darkness={1.5} />
        <LUT lut={texture} />
      </EffectComposer>
    )
  )
}
