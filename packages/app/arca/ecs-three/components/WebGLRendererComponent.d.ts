import { Component, RefPropType } from 'app/arca/ecs'
import { Camera, Object3D, WebGLRenderer } from 'three'
import { ECSYThreeEntity } from '../entity'

export class WebGLRendererComponent extends Component<WebGLRendererComponent> {
  renderer: WebGLRenderer
  scene: ECSYThreeEntity
  camera: ECSYThreeEntity

  static schema: {
    renderer: { type: RefPropType<WebGLRenderer> }
    scene: { type: RefPropType<Object3D> }
    camera: { type: RefPropType<Camera> }
  }
}
