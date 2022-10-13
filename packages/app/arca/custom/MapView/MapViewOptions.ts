import { FovCalculation, LookAtParams } from 'app/arca/mapview'
import { TextElementsRendererOptions } from 'app/arca/mapview/text/TextElementsRendererOptions'
import * as THREE from 'three'

export interface MapViewOptions extends TextElementsRendererOptions, Partial<LookAtParams> {
  /**
   * Pass in the camera from r3f
   */
  camera: THREE.PerspectiveCamera

  /**
   * The canvas element used to render the scene.
   */
  canvas: HTMLCanvasElement

  /**
   * Enable shadows in the map. Shadows will only be casted on features that use the "standard"
   * or "extruded-polygon" technique in the map theme.
   * @default false
   */
  enableShadows?: boolean

  /**
   * How to calculate the Field of View, if not specified, then
   * [[DEFAULT_FOV_CALCULATION]] is used.
   */
  fovCalculation?: FovCalculation

  /**
   * Set maximum FPS (Frames Per Second). If VSync in enabled, the specified number may not be
   * reached, but instead the next smaller number than `maxFps` that is equal to the refresh rate
   * divided by an integer number.
   *
   * E.g.: If the monitors refresh rate is set to 60hz, and if `maxFps` is set to a value of `40`
   * (60hz/1.5), the actual used FPS may be 30 (60hz/2). For displays that have a refresh rate of
   * 60hz, good values for `maxFps` are 30, 20, 15, 12, 10, 6, 3 and 1. A value of `0` is ignored.
   */
  maxFps?: number

  /**
   * Pass in the renderer from r3f
   */
  renderer: THREE.WebGLRenderer

  /**
   * Pass in the scene from r3f
   */
  scene: THREE.Scene
}
