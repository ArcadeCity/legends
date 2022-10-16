import { LoadingManager } from '../core/LoadingManager'
import { World } from '../world/World'

export interface ISpawnPoint {
  spawn(loadingManager: LoadingManager, world: World): void
}
