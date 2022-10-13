import { Component, Types } from 'app/arca/ecs'

export class Rotating extends Component<Rotating> {
  speed: number
}

Rotating.schema = {
  speed: { default: 1, type: Types.Number },
}
