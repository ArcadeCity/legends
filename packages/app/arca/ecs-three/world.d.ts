import { System, SystemConstructor, World } from 'app/arca/ecs'
import { ECSYThreeEntity } from './entity.js'
import { ECSYThreeSystem } from './system.js'

export class ECSYThreeWorld extends World {
  getSystem<S extends System>(System: SystemConstructor<S>): S
  getSystems(): Array<ECSYThreeSystem>
  createEntity(name?: string): ECSYThreeEntity
}
