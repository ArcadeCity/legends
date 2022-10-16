import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { Component } from '../ecs/Component'
import { FiniteStateMachine } from '../FiniteStateMachine'

export class NPC extends Component {
  animations: any
  bones: any
  glb: GLTF | null
  mixer: THREE.AnimationMixer | null
  stateMachine: FiniteStateMachine | null

  constructor() {
    super()
    this.animations = {}
    this.glb = null
    this.mixer = null
    this.stateMachine = null
  }

  Update(timeInSeconds) {
    if (!this.stateMachine) {
      return
    }

    if (this.mixer) {
      this.mixer.update(timeInSeconds)
    }
  }
}
