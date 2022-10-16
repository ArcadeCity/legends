import * as CANNON from 'cannon'
import * as _ from 'lodash'
import * as THREE from 'three'
import { CannonDebugRenderer } from '@/arca/cannon/CannonDebugRenderer'
import { Character } from '../characters/Character'
import { CameraOperator } from '../core/CameraOperator'
import { InputManager } from '../core/InputManager'
import { LoadingManager } from '../core/LoadingManager'
import { IUpdatable } from '../interfaces/IUpdatable'
import { IWorldEntity } from '../interfaces/IWorldEntity'
import { Scenario } from './Scenario'

export class World {
  public renderer: THREE.WebGLRenderer
  public camera: THREE.PerspectiveCamera
  public composer: any
  // public stats: Stats
  public graphicsWorld: THREE.Scene
  // public sky: Sky
  public physicsWorld: CANNON.World
  public parallelPairs: any[]
  public physicsFrameRate: number
  public physicsFrameTime: number
  public physicsMaxPrediction: number
  public clock: THREE.Clock
  public renderDelta: number
  public logicDelta: number
  public requestDelta: number
  public sinceLastFrame: number
  public justRendered: boolean
  public params: any
  public inputManager: InputManager
  public cameraOperator: CameraOperator
  public timeScaleTarget: number = 1
  // public console: InfoStack
  public cannonDebugRenderer: CannonDebugRenderer
  public scenarios: Scenario[] = []
  public characters: Character[] = []
  // public vehicles: Vehicle[] = []
  // public paths: Path[] = []
  // public scenarioGUIFolder: any
  public updatables: IUpdatable[] = []

  private lastScenarioID: string

  constructor(
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene
  ) {
    this.camera = camera as THREE.PerspectiveCamera
    this.renderer = renderer
    this.graphicsWorld = scene

    // const scope = this

    // Physics
    this.physicsWorld = new CANNON.World()
    this.physicsWorld.gravity.set(0, -9.81, 0)
    this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld)
    this.physicsWorld.solver.iterations = 10
    this.physicsWorld.allowSleep = true

    this.physicsFrameRate = 60
    this.physicsFrameTime = 1 / this.physicsFrameRate
    this.physicsMaxPrediction = this.physicsFrameRate

    this.params = {
      Pointer_Lock: true,
      Mouse_Sensitivity: 0.3,
      Time_Scale: 1,
      Shadows: true,
      FXAA: true,
      Debug_Physics: false,
      Debug_FPS: false,
      Sun_Elevation: 50,
      Sun_Rotation: 145,
    }

    this.inputManager = new InputManager(this, this.renderer.domElement)
    this.cameraOperator = new CameraOperator(
      this,
      this.camera,
      this.params.Mouse_Sensitivity
    )

    const planeGeometry = new THREE.PlaneGeometry(25, 25)

    // create black material
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    })
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)

    planeMesh.rotateX(-Math.PI / 2)
    planeMesh.receiveShadow = true
    scene.add(planeMesh)
    const planeShape = new CANNON.Plane()
    const planeBody = new CANNON.Body({ mass: 0 })
    planeBody.addShape(planeShape)
    planeBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    )
    this.physicsWorld.addBody(planeBody)
  }

  public add(worldEntity: IWorldEntity): void {
    worldEntity.addToWorld(this)
    this.registerUpdatable(worldEntity)
  }

  public clearEntities(): void {
    for (let i = 0; i < this.characters.length; i++) {
      this.remove(this.characters[i])
      i--
    }

    // for (let i = 0; i < this.vehicles.length; i++) {
    //   this.remove(this.vehicles[i])
    //   i--
    // }
  }

  public launchScenario(
    scenarioID: string,
    loadingManager?: LoadingManager
  ): void {
    this.lastScenarioID = scenarioID

    this.clearEntities()

    // Launch default scenario
    if (!loadingManager) loadingManager = new LoadingManager(this)
    for (const scenario of this.scenarios) {
      if (scenario.id === scenarioID || scenario.spawnAlways) {
        scenario.launch(loadingManager, this)
      }
    }
  }

  public registerUpdatable(registree: IUpdatable): void {
    this.updatables.push(registree)
    this.updatables.sort((a, b) => (a.updateOrder > b.updateOrder ? 1 : -1))
  }

  public remove(worldEntity: IWorldEntity): void {
    worldEntity.removeFromWorld(this)
    this.unregisterUpdatable(worldEntity)
  }

  public restartScenario(): void {
    console.log('restartScenariow hy')
    if (this.lastScenarioID !== undefined) {
      document.exitPointerLock()
      this.launchScenario(this.lastScenarioID)
    } else {
      console.warn("Can't restart scenario. Last scenarioID is undefined.")
    }
  }

  public setTimeScale(value: number): void {
    this.params.Time_Scale = value
    this.timeScaleTarget = value
  }

  public unregisterUpdatable(registree: IUpdatable): void {
    _.pull(this.updatables, registree)
  }

  // Update
  // Handles all logic updates.
  public update(timeStep: number, unscaledTimeStep: number): void {
    this.updatePhysics(timeStep)

    // Update registred objects
    this.updatables.forEach((entity) => {
      entity.update(timeStep, unscaledTimeStep)
    })

    // Lerp time scale
    this.params.Time_Scale = THREE.MathUtils.lerp(
      this.params.Time_Scale,
      this.timeScaleTarget,
      0.2
    )

    // Physics debug
    if (this.params.Debug_Physics) this.cannonDebugRenderer.update()
  }

  public updateControls(controls: any): void {
    let html = ''
    html += '<h2 class="controls-title">Controls:</h2>'

    controls.forEach((row) => {
      html += '<div class="ctrl-row">'
      row.keys.forEach((key) => {
        if (key === '+' || key === 'and' || key === 'or' || key === '&')
          html += '&nbsp;' + key + '&nbsp;'
        else html += '<span class="ctrl-key">' + key + '</span>'
      })

      html += '<span class="ctrl-desc">' + row.desc + '</span></div>'
    })

    // console.log(html)
    // document.getElementById('controls').innerHTML = html
  }

  public updatePhysics(timeStep: number): void {
    // Step the physics world
    this.physicsWorld.step(this.physicsFrameTime, timeStep)

    // this.characters.forEach((char) => {
    //   if (this.isOutOfBounds(char.characterCapsule.body.position)) {
    //     this.outOfBoundsRespawn(char.characterCapsule.body)
    //   }
    // })

    // this.vehicles.forEach((vehicle) => {
    //   if (this.isOutOfBounds(vehicle.rayCastVehicle.chassisBody.position)) {
    //     let worldPos = new THREE.Vector3()
    //     vehicle.spawnPoint.getWorldPosition(worldPos)
    //     worldPos.y += 1
    //     this.outOfBoundsRespawn(
    //       vehicle.rayCastVehicle.chassisBody,
    //       Utils.cannonVector(worldPos)
    //     )
    //   }
    // })
  }
}
