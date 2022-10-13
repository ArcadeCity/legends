import { Component, Types } from 'app/arca/ecs'

export class Object3DComponent extends Component {}

Object3DComponent.schema = {
  value: { type: Types.Ref },
}
