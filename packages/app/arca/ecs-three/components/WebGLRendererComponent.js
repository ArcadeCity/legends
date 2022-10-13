import { Component, Types } from 'app/arca/ecs'

export class WebGLRendererComponent extends Component {}
WebGLRendererComponent.schema = {
  renderer: { type: Types.Ref },
  scene: { type: Types.Ref },
  camera: { type: Types.Ref },
}
