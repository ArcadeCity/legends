import { System } from 'app/arca/ecs'
import { ECSYThreeEntity, Object3DComponent } from 'app/arca/ecs-three'
import { Rotating } from 'app/arca/realgame/components/Rotating'

export class RotationSystem extends System {
  execute(delta) {
    this.queries.entities.results.forEach((entity: ECSYThreeEntity) => {
      let rotation = entity.getObject3D().rotation
      const rotating = entity.getComponent(Rotating)
      rotation.x += 0.5 * delta * rotating.speed
      rotation.y += 0.1 * delta * rotating.speed
    })
  }
}

RotationSystem.queries = {
  entities: {
    components: [Rotating, Object3DComponent],
  },
}
