import {
  FontCatalogConfig, MapEnv, TextStyleDefinition, Theme, ViewRanges
} from 'app/arca/datasource-protocol'
import {
  EarthConstants, GeoBox, GeoCoordinates, GeoCoordLike, GeoPolygon, isGeoBoxExtentLike, Projection,
  ProjectionType, sphereProjection
} from 'app/arca/geoutils'
import {
  AnimatedExtrusionHandler, CameraMovementDetector, CameraUtils, createDefaultClipPlanesEvaluator, DataSource,
  DEFAULT_FOV_CALCULATION, ElevationProvider, ElevationRangeSource, EventDispatcher, FovCalculation,
  FrameStats, IMapRenderingManager, LookAtParams, MapAnchors, MapRenderingManager, MapViewEventNames,
  MapViewFog, MapViewUtils, MAX_FOV_DEG, MIN_FOV_DEG, PerformanceStatistics, PoiManager, PoiTableManager,
  PolarTileDataSource, RenderEvent, TextElementsRenderer, Tile, VisibleTileSet, VisibleTileSetOptions
} from 'app/arca/mapview'
import { BackgroundDataSource } from 'app/arca/mapview/BackgroundDataSource'
import { FrustumIntersection } from 'app/arca/mapview/FrustumIntersection'
import { TileGeometryManager } from 'app/arca/mapview/geometry/TileGeometryManager'
import { MapViewEnvironment } from 'app/arca/mapview/MapViewEnvironment'
import { MapViewTaskScheduler } from 'app/arca/mapview/MapViewTaskScheduler'
import { MapViewThemeManager } from 'app/arca/mapview/MapViewThemeManager'
import { ScreenProjector } from 'app/arca/mapview/ScreenProjector'
import { MapViewState } from 'app/arca/mapview/text/MapViewState'
import { TileObjectRenderer } from 'app/arca/mapview/TileObjectsRenderer'
import { assert, getOptionValue, LoggerManager, PerformanceTimer, TaskQueue } from 'app/arca/utils'
import * as THREE from 'three'
import { defaultOmvDataSource } from './defaultOmvDataSource'
import { MapViewDefaults } from './MapViewDefaults'
import { MapViewOptions } from './MapViewOptions'

const logger = LoggerManager.instance.create('MapView')
const DEFAULT_CAM_NEAR_PLANE = 0.1
const DEFAULT_CAM_FAR_PLANE = 4000000
const DEFAULT_MIN_ZOOM_LEVEL = 1
const DEFAULT_MAX_ZOOM_LEVEL = 20

const cache = {
  vector2: [new THREE.Vector2()],
  vector3: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()],
  rayCaster: new THREE.Raycaster(),
  groundPlane: new THREE.Plane(),
  groundSphere: new THREE.Sphere(undefined, EarthConstants.EQUATORIAL_RADIUS),
  matrix4: [new THREE.Matrix4(), new THREE.Matrix4()],
  transform: [
    {
      position: new THREE.Vector3(),
      xAxis: new THREE.Vector3(),
      yAxis: new THREE.Vector3(),
      zAxis: new THREE.Vector3(),
    },
  ],
  color: new THREE.Color(),
}

export class MapView extends EventDispatcher {
  /**
   * Keep the events here to avoid a global reference to MapView (and thus prevent garbage collection).
   */
  private readonly UPDATE_EVENT: RenderEvent = { type: MapViewEventNames.Update }
  private readonly RENDER_EVENT: RenderEvent = { type: MapViewEventNames.Render }
  private readonly DID_RENDER_EVENT: RenderEvent = { type: MapViewEventNames.AfterRender }
  private readonly FIRST_FRAME_EVENT: RenderEvent = { type: MapViewEventNames.FirstFrame }
  private readonly FRAME_COMPLETE_EVENT: RenderEvent = {
    type: MapViewEventNames.FrameComplete,
  }

  private readonly THEME_LOADED_EVENT: RenderEvent = {
    type: MapViewEventNames.ThemeLoaded,
  }

  private readonly ANIMATION_STARTED_EVENT: RenderEvent = {
    type: MapViewEventNames.AnimationStarted,
  }

  private readonly ANIMATION_FINISHED_EVENT: RenderEvent = {
    type: MapViewEventNames.AnimationFinished,
  }

  private readonly MOVEMENT_STARTED_EVENT: RenderEvent = {
    type: MapViewEventNames.MovementStarted,
  }

  private readonly MOVEMENT_FINISHED_EVENT: RenderEvent = {
    type: MapViewEventNames.MovementFinished,
  }

  private readonly CONTEXT_LOST_EVENT: RenderEvent = {
    type: MapViewEventNames.ContextLost,
  }

  private readonly CONTEXT_RESTORED_EVENT: RenderEvent = {
    type: MapViewEventNames.ContextRestored,
  }

  private readonly COPYRIGHT_CHANGED_EVENT: RenderEvent = {
    type: MapViewEventNames.CopyrightChanged,
  }

  private readonly DISPOSE_EVENT: RenderEvent = { type: MapViewEventNames.Dispose }

  /**
   * The instance of {@link MapRenderingManager} managing the rendering of the map. It is a public
   * property to allow access and modification of some parameters of the rendering process at
   * runtime.
   */
  readonly mapRenderingManager: IMapRenderingManager

  private m_renderLabels: boolean = true

  private readonly m_screenProjector: ScreenProjector

  private m_visibleTiles: VisibleTileSet
  private readonly m_visibleTileSetOptions: VisibleTileSetOptions
  private readonly m_tileObjectRenderer: TileObjectRenderer

  private m_elevationSource?: DataSource
  private m_elevationRangeSource?: ElevationRangeSource
  private m_elevationProvider?: ElevationProvider
  private m_visibleTileSetLock: boolean = false
  private readonly m_tileGeometryManager: TileGeometryManager

  private m_tileWrappingEnabled: boolean = true

  private readonly m_camera: THREE.PerspectiveCamera
  private readonly m_options: MapViewOptions
  private readonly m_renderer: THREE.WebGLRenderer

  /**
   * Relative to eye camera.
   *
   * This camera is internal camera used to improve precision
   * when rendering geometries.
   */
  private readonly m_rteCamera = new THREE.PerspectiveCamera()

  private m_zoomLevel: number = DEFAULT_MIN_ZOOM_LEVEL
  private m_minZoomLevel: number = DEFAULT_MIN_ZOOM_LEVEL
  private m_maxZoomLevel: number = DEFAULT_MAX_ZOOM_LEVEL

  private m_yaw = 0
  private m_pitch = 0
  private m_roll = 0
  private m_targetDistance = 0
  private m_targetGeoPos = GeoCoordinates.fromObject(MapViewDefaults.target!)
  // Focus point world coords may be calculated after setting projection, use dummy value here.
  private readonly m_targetWorldPos = new THREE.Vector3()
  private readonly m_viewRanges: ViewRanges = {
    near: DEFAULT_CAM_NEAR_PLANE,
    far: DEFAULT_CAM_FAR_PLANE,
    minimum: DEFAULT_CAM_NEAR_PLANE,
    maximum: DEFAULT_CAM_FAR_PLANE,
  }

  private m_pointOfView?: THREE.PerspectiveCamera

  private m_pixelToWorld?: number
  private m_pixelRatio?: number

  /** Default scene for map objects and map anchors */
  private readonly m_scene: THREE.Scene
  /** Separate scene for overlay map anchors */
  private readonly m_overlayScene: THREE.Scene = new THREE.Scene()
  /** Root node of [[m_scene]] that gets cleared every frame. */
  private readonly m_sceneRoot = new THREE.Object3D()
  /** Root node of [[m_overlayScene]] that gets cleared every frame. */
  private readonly m_overlaySceneRoot = new THREE.Object3D()

  private readonly m_mapAnchors: MapAnchors = new MapAnchors()

  private m_animationCount: number = 0
  private m_animationFrameHandle: number | undefined
  private m_drawing: boolean = false
  private m_updatePending: boolean = false
  private m_frameNumber = 0

  private m_textElementsRenderer: TextElementsRenderer

  private m_forceCameraAspect: number | undefined = undefined

  // type any as it returns different types depending on the environment
  private m_taskSchedulerTimeout: any = undefined

  private m_previousFrameTimeStamp?: number
  private m_firstFrameRendered = false
  private m_firstFrameComplete = false

  private readonly m_env: MapEnv = new MapEnv({})

  private readonly m_poiManager: PoiManager = new PoiManager(this)
  private readonly m_poiTableManager: PoiTableManager = new PoiTableManager(this)
  private readonly m_collisionDebugCanvas: HTMLCanvasElement | undefined

  //
  // sources
  //
  private readonly m_tileDataSources: DataSource[] = []
  private readonly m_connectedDataSources = new Set<string>()
  private readonly m_failedDataSources = new Set<string>()
  private readonly m_polarDataSource?: PolarTileDataSource
  private readonly m_enablePolarDataSource: boolean = true

  private m_enableMixedLod: boolean | undefined
  private readonly m_lodMinTilePixelSize: number | undefined

  private m_taskScheduler: MapViewTaskScheduler
  private readonly m_themeManager: MapViewThemeManager
  private readonly m_sceneEnvironment: MapViewEnvironment

  // Detection of camera movement and scene change:
  private readonly m_movementDetector: CameraMovementDetector

  private m_thisFrameTilesChanged: boolean | undefined
  private m_lastTileIds: string = ''
  private readonly m_animatedExtrusionHandler: AnimatedExtrusionHandler

  // `true` if dispose() has been called on `MapView`.
  private m_disposed = false

  constructor(options: MapViewOptions) {
    super()

    this.m_options = options
    this.m_renderer = options.renderer
    this.m_options.maxFps = this.m_options.maxFps ?? 0
    this.m_scene = options.scene

    this.m_visibleTileSetOptions = {
      ...MapViewDefaults,
      clipPlanesEvaluator: createDefaultClipPlanesEvaluator(),
    }

    this.m_tileObjectRenderer = new TileObjectRenderer(this.m_env, this.m_renderer)
    this.setupRenderer(this.m_tileObjectRenderer)

    this.m_options.fovCalculation =
      this.m_options.fovCalculation === undefined
        ? DEFAULT_FOV_CALCULATION
        : this.m_options.fovCalculation
    this.m_options.fovCalculation.fov = THREE.MathUtils.clamp(
      this.m_options.fovCalculation!.fov,
      MIN_FOV_DEG,
      MAX_FOV_DEG
    )

    const { width, height } = this.getCanvasClientSize()
    const aspect = width / height
    this.m_camera = options.camera
    this.m_camera.aspect = aspect
    this.m_camera.fov = DEFAULT_FOV_CALCULATION.fov
    this.m_camera.near = DEFAULT_CAM_NEAR_PLANE
    this.m_camera.far = DEFAULT_CAM_FAR_PLANE
    console.log('so this camera far is', this.camera.far)

    this.m_camera.up.set(0, 0, 1)
    this.setFovOnCamera(this.m_options.fovCalculation, height)
    this.projection.projectPoint(this.m_targetGeoPos, this.m_targetWorldPos)
    this.m_screenProjector = new ScreenProjector(this.m_camera)

    // Scheduler must be initialized before VisibleTileSet.
    this.m_taskScheduler = new MapViewTaskScheduler(this.maxFps)
    // @ts-ignore
    this.m_tileGeometryManager = new TileGeometryManager(this)

    this.m_visibleTiles = this.createVisibleTileSet()
    this.m_sceneEnvironment = new MapViewEnvironment(this, options)
    this.fog.enabled = true

    // setup camera with initial position
    this.setupCamera()

    this.m_movementDetector = new CameraMovementDetector(
      300, //this.m_options.movementThrottleTimeout,
      () => this.movementStarted(),
      () => this.movementFinished()
    )

    this.mapRenderingManager = new MapRenderingManager(
      width,
      height,
      undefined, //, this.m_options.dynamicPixelRatio,
      undefined //mapPassAntialiasSettings
    )

    this.m_animatedExtrusionHandler = new AnimatedExtrusionHandler(this)

    this.m_themeManager = new MapViewThemeManager(this, this.m_uriResolver)
    this.m_textElementsRenderer = this.createTextRenderer()
    this.setTheme(MapViewDefaults.theme)

    // setup camera????

    this.addDataSource(defaultOmvDataSource)

    console.log('Current target:', this.target)
  }

  /**
   * Adds a new {@link DataSource} to this `MapView`.
   *
   * @remarks
   * `MapView` needs at least one {@link DataSource} to display something.
   * @param dataSource - The data source.
   */
  async addDataSource(dataSource: DataSource): Promise<void> {
    const twinDataSource = this.getDataSourceByName(dataSource.name)
    if (twinDataSource !== undefined) {
      throw new Error(
        `A DataSource with the name "${dataSource.name}" already exists in this MapView.`
      )
    }

    // @ts-ignore
    dataSource.attach(this)
    dataSource.setEnableElevationOverlay(this.m_elevationProvider !== undefined)
    const conflictingDataSource = this.m_tileDataSources.find(
      (ds) => ds.addGroundPlane === true && !(ds instanceof BackgroundDataSource)
    )
    if (dataSource.addGroundPlane === true && conflictingDataSource !== undefined) {
      // eslint-disable-next-line no-console
      console.warn(
        `The DataSources ${dataSource.name} and ${conflictingDataSource.name} both have a ground plane added, this will cause problems with the fallback logic, see HARP-14728 & HARP-15488.`
      )
    }
    this.m_tileDataSources.push(dataSource)
    this.m_sceneEnvironment?.updateBackgroundDataSource()

    try {
      await dataSource.connect()

      const alreadyRemoved = !this.m_tileDataSources.includes(dataSource)
      if (alreadyRemoved) {
        return
      }
      dataSource.addEventListener(MapViewEventNames.Update, () => {
        // console.tron.log('Update from datasource eventlistener thing')
        this.update()
      })

      const theme = await this.getTheme()
      // console.log('theme', theme)
      // dataSource.setLanguages(this.m_languages)

      if (theme !== undefined && theme.styles !== undefined) {
        await dataSource.setTheme(theme)
        // console.tron.log('dataSource setTheme!')
      }

      this.m_connectedDataSources.add(dataSource.name)

      this.dispatchEvent({
        type: MapViewEventNames.DataSourceConnect,
        dataSourceName: dataSource.name,
      })
      // console.tron.log(this)
      this.update()
    } catch (error) {
      // error is a string if a promise was rejected.
      // logger.error(`Failed to connect to datasource ${dataSource.name}: ${error.message ?? error}`)

      this.m_failedDataSources.add(dataSource.name)
      // console.tron.log('failed?')
      this.dispatchEvent({
        type: MapViewEventNames.DataSourceConnect,
        dataSourceName: dataSource.name,
        error,
      })
    }
  }

  /**
   * Returns `true` if this `MapView` is constantly redrawing the scene.
   */
  get animating(): boolean {
    return this.m_animationCount > 0
  }

  /**
   * The THREE.js camera used by this `MapView` to render the main scene.
   *
   * @remarks
   * When modifying the camera all derived properties like:
   * - {@link MapView.target}
   * - {@link MapView.zoomLevel}
   * - {@link MapView.tilt}
   * - {@link MapView.heading}
   * could change.
   * These properties are cached internally and will only be updated in the next animation frame.
   * FIXME: Unfortunately THREE.js is not dispatching any events when camera properties change
   * so we should have an API for enforcing update of cached values.
   */
  get camera(): THREE.PerspectiveCamera {
    return this.m_camera
  }

  /**
   * The HTML canvas element used by this `MapView`.
   */
  get canvas(): HTMLCanvasElement {
    return this.m_options.canvas
  }

  /**
   * Check if the set of visible tiles changed since the last frame.
   *
   * May be called multiple times per frame.
   *
   * Equality is computed by creating a string containing the IDs of the tiles.
   */
  private checkIfTilesChanged() {
    if (this.m_thisFrameTilesChanged !== undefined) {
      return this.m_thisFrameTilesChanged
    }
    const renderList = this.m_visibleTiles.dataSourceTileList

    const tileIdList: string[] = []

    tileIdList.length = 0

    renderList.forEach(({ dataSource, renderedTiles }) => {
      renderedTiles.forEach((tile) => {
        tileIdList.push(dataSource.name + '-' + tile.tileKey.mortonCode())
      })
    })

    tileIdList.sort()

    const newTileIds = tileIdList.join('#')

    if (newTileIds !== this.m_lastTileIds) {
      this.m_lastTileIds = newTileIds
      this.m_thisFrameTilesChanged = true
    } else {
      this.m_thisFrameTilesChanged = false
    }

    return this.m_thisFrameTilesChanged
  }

  /**
   * Clear the tile cache.
   *
   * @remarks
   * Remove the {@link Tile} objects created by cacheable
   * {@link DataSource}s. If a {@link DataSource} name is
   * provided, this method restricts the eviction the {@link DataSource} with the given name.
   *
   * @param dataSourceName - The name of the {@link DataSource}.
   * @param filter Optional tile filter
   */
  clearTileCache(dataSourceName?: string, filter?: (tile: Tile) => boolean) {
    if (this.m_visibleTiles === undefined) {
      // This method is called in the shadowsEnabled function, which is initialized in the
      // setupRenderer function,
      return
    }
    if (dataSourceName !== undefined) {
      const dataSource = this.getDataSourceByName(dataSourceName)
      if (dataSource) {
        this.m_visibleTiles.clearTileCache(dataSource, filter)
        dataSource.clearCache()
      }
    } else {
      this.m_visibleTiles.clearTileCache(undefined, filter)
      this.m_tileDataSources.forEach((dataSource) => dataSource.clearCache())
    }

    if (this.m_elevationProvider !== undefined) {
      this.m_elevationProvider.clearCache()
    }
  }

  /**
   * The HTML canvas element used by this `MapView`.
   */
  get collisionDebugCanvas(): HTMLCanvasElement | undefined {
    return this.m_collisionDebugCanvas
  }

  private createTextRenderer(): TextElementsRenderer {
    return new TextElementsRenderer(
      new MapViewState(this, this.checkIfTilesChanged.bind(this)),
      this.m_screenProjector,
      this.m_poiManager,
      this.m_renderer,
      [this.imageCache, this.userImageCache],
      this.m_options
    )
  }

  private createVisibleTileSet(): VisibleTileSet {
    assert(this.m_tileGeometryManager !== undefined)

    if (this.m_visibleTiles) {
      // Dispose of all resources before the old instance is replaced.
      this.m_visibleTiles.clearTileCache()
      this.m_visibleTiles.disposePendingTiles()
    }

    const enableMixedLod =
      this.m_enableMixedLod === undefined
        ? this.projection.type === ProjectionType.Spherical
        : this.m_enableMixedLod

    this.m_visibleTiles = new VisibleTileSet(
      new FrustumIntersection(
        this.m_camera,
        // @ts-ignore
        this,
        this.m_visibleTileSetOptions.extendedFrustumCulling,
        this.m_tileWrappingEnabled,
        enableMixedLod,
        this.m_lodMinTilePixelSize
      ),
      this.m_tileGeometryManager,
      this.m_visibleTileSetOptions,
      this.taskQueue
    )
    return this.m_visibleTiles
  }

  /**
   * Returns {@link DataSource}s displayed by this `MapView`.
   */
  get dataSources(): DataSource[] {
    return this.m_tileDataSources
  }

  /**
   * Is `true` if dispose() as been called on `MapView`.
   */
  get disposed(): boolean {
    return this.m_disposed
  }

  /**
   * Returns the elevation provider.
   */
  get elevationProvider(): ElevationProvider | undefined {
    return this.m_elevationProvider
  }

  private extractAttitude() {
    const camera = this.m_camera
    const projection = this.projection

    const cameraPos = cache.vector3[1]
    const transform = cache.transform[0]
    const tangentSpaceMatrix = cache.matrix4[1]
    // 1. Build the matrix of the tangent space of the camera.
    cameraPos.setFromMatrixPosition(camera.matrixWorld) // Ensure using world position.
    projection.localTangentSpace(this.m_targetGeoPos, transform)
    tangentSpaceMatrix.makeBasis(transform.xAxis, transform.yAxis, transform.zAxis)

    // 2. Change the basis of matrixWorld to the tangent space to get the new base axes.
    cache.matrix4[0].copy(tangentSpaceMatrix).invert().multiply(camera.matrixWorld)
    transform.xAxis.setFromMatrixColumn(cache.matrix4[0], 0)
    transform.yAxis.setFromMatrixColumn(cache.matrix4[0], 1)
    transform.zAxis.setFromMatrixColumn(cache.matrix4[0], 2)

    // 3. Deduce orientation from the base axes.
    let yaw = 0
    let pitch = 0
    let roll = 0

    // Decompose rotation matrix into Z0 X Z1 Euler angles.
    const epsilon = 1e-10
    const d = transform.zAxis.dot(cameraPos.set(0, 0, 1))
    if (d < 1.0 - epsilon) {
      if (d > -1.0 + epsilon) {
        yaw = Math.atan2(transform.zAxis.x, -transform.zAxis.y)
        pitch = Math.acos(transform.zAxis.z)
        roll = Math.atan2(transform.xAxis.x, transform.yAxis.z)
      } else {
        // Looking bottom-up with space.z.z == -1.0
        yaw = -Math.atan2(-transform.yAxis.x, transform.xAxis.x)
        pitch = 180
        roll = 0
      }
    } else {
      // Looking top-down with space.z.z == 1.0
      yaw = Math.atan2(-transform.yAxis.x, transform.xAxis.x)
      pitch = 0.0
      roll = 0.0
    }

    return {
      yaw,
      pitch,
      roll,
    }
  }

  /**
   * Public access to {@link MapViewFog} allowing to toggle it by setting its `enabled` property.
   */
  get fog(): MapViewFog {
    return this.m_sceneEnvironment.fog
  }

  /**
   * The position in geo coordinates of the center of the scene.
   * @internal
   */
  get geoCenter(): GeoCoordinates {
    return this.projection.unprojectPoint(this.m_camera.position).normalized()
  }

  /**
   * Get canvas client size in css/client pixels.
   *
   * Supports canvases not attached to DOM, which have 0 as `clientWidth` and `clientHeight` by
   * calculating it from actual canvas size and current pixel ratio.
   */
  private getCanvasClientSize(): { width: number; height: number } {
    const { clientWidth, clientHeight } = this.canvas
    if (
      clientWidth === 0 ||
      clientHeight === 0 ||
      typeof clientWidth !== 'number' ||
      typeof clientHeight !== 'number'
    ) {
      const pixelRatio = this.m_renderer.getPixelRatio()
      return {
        width: Math.round(this.canvas.width / pixelRatio),
        height: Math.round(this.canvas.height / pixelRatio),
      }
    } else {
      return { width: clientWidth, height: clientHeight }
    }
  }

  /**
   * Returns the unique {@link DataSource} matching the given name.
   */
  getDataSourceByName(dataSourceName: string): DataSource | undefined {
    return this.m_tileDataSources.find((ds) => ds.name === dataSourceName)
  }

  /**
   * Returns the list of the enabled data sources.
   */
  private getEnabledTileDataSources(): DataSource[] {
    // ### build this list once decoders && datasources are ready

    const enabledDataSources: DataSource[] = []

    for (const dataSource of this.m_tileDataSources) {
      if (this.isDataSourceEnabled(dataSource)) {
        enabledDataSources.push(dataSource)
      }
    }

    return enabledDataSources
  }

  /**
   * Returns the currently set `Theme` as a `Promise` as it might be still loading/updating.
   */
  async getTheme(): Promise<Theme> {
    return await this.m_themeManager.getTheme()
  }

  /**
   * Returns heading angle in degrees.
   */
  get heading(): number {
    return -THREE.MathUtils.radToDeg(this.m_yaw)
  }

  /**
   * Set the heading angle of the map.
   * @param heading -: New heading angle in degrees.
   */
  set heading(heading: number) {
    this.lookAtImpl({ heading })
  }

  /**
   * Returns true if the specified {@link DataSource} is enabled.
   */
  isDataSourceEnabled(dataSource: DataSource): boolean {
    return (
      dataSource.enabled &&
      dataSource.ready() &&
      this.m_connectedDataSources.has(dataSource.name) &&
      dataSource.isVisible(this.zoomLevel)
    )
  }

  /**
   * Returns the status of frustum culling after each update.
   */
  get lockVisibleTileSet(): boolean {
    return this.m_visibleTileSetLock
  }

  private lookAtImpl(params: Partial<LookAtParams>): void {
    const tilt = Math.min(getOptionValue(params.tilt, this.tilt), MapViewUtils.MAX_TILT_DEG)
    const heading = getOptionValue(params.heading, this.heading)
    const distance =
      params.zoomLevel !== undefined
        ? MapViewUtils.calculateDistanceFromZoomLevel(
            this,
            THREE.MathUtils.clamp(params.zoomLevel, this.m_minZoomLevel, this.m_maxZoomLevel)
          )
        : params.distance !== undefined
        ? params.distance
        : this.m_targetDistance

    let target: GeoCoordinates | undefined
    if (params.bounds !== undefined) {
      let geoPoints: GeoCoordLike[]

      if (params.bounds instanceof GeoBox) {
        target = params.target ? GeoCoordinates.fromObject(params.target) : params.bounds.center
        geoPoints = MapViewUtils.geoBoxToGeoPoints(params.bounds)
      } else if (params.bounds instanceof GeoPolygon) {
        target = params.bounds.getCentroid()
        geoPoints = params.bounds.coordinates
      } else if (isGeoBoxExtentLike(params.bounds)) {
        target = params.target ? GeoCoordinates.fromObject(params.target) : this.target
        const box = GeoBox.fromCenterAndExtents(target, params.bounds)
        geoPoints = MapViewUtils.geoBoxToGeoPoints(box)
      } else if (Array.isArray(params.bounds)) {
        geoPoints = params.bounds
        if (params.target !== undefined) {
          target = GeoCoordinates.fromObject(params.target)
        }
      } else {
        throw Error("#lookAt: Invalid 'bounds' value")
      }
      if (
        // if the points are created from the corners of the geoBox don't cluster them
        !(params.bounds instanceof GeoBox || params.bounds instanceof GeoPolygon) &&
        this.m_tileWrappingEnabled &&
        this.projection.type === ProjectionType.Planar
      ) {
        // In flat projection, with wrap around enabled, we should detect clusters of
        // points around  anti-meridian and possible move some points to sibling worlds.
        //
        // Here, we fit points into minimal geo box taking world wrapping into account.
        geoPoints = MapViewUtils.wrapGeoPointsToScreen(geoPoints, target!)
      }
      const worldPoints = geoPoints.map((point) =>
        this.projection.projectPoint(GeoCoordinates.fromObject(point), new THREE.Vector3())
      )
      const worldTarget = new THREE.Vector3()
      if (target! === undefined) {
        const box = new THREE.Box3().setFromPoints(worldPoints)
        box.getCenter(worldTarget)
        this.projection.scalePointToSurface(worldTarget)
        target = this.projection.unprojectPoint(worldTarget)
      } else {
        this.projection.projectPoint(target, worldTarget)
      }

      if (params.zoomLevel !== undefined || params.distance !== undefined) {
        return this.lookAtImpl({
          tilt,
          heading,
          distance,
          target,
        })
      }

      return this.lookAtImpl(
        MapViewUtils.getFitBoundsLookAtParams(target, worldTarget, worldPoints, {
          tilt,
          heading,
          minDistance: MapViewUtils.calculateDistanceFromZoomLevel(this, this.maxZoomLevel),
          projection: this.projection,
          camera: this.camera,
        })
      )
    }
    target = params.target !== undefined ? GeoCoordinates.fromObject(params.target) : this.target

    // MapViewUtils#setRotation uses pitch, not tilt, which is different in sphere projection.
    // But in sphere, in the tangent space of the target of the camera, pitch = tilt. So, put
    // the camera on the target, so the tilt can be passed to getRotation as a pitch.
    MapViewUtils.getCameraRotationAtTarget(
      this.projection,
      target,
      -heading,
      tilt,
      this.camera.quaternion
    )
    MapViewUtils.getCameraPositionFromTargetCoordinates(
      target,
      distance,
      -heading,
      tilt,
      this.projection,
      this.camera.position
    )
    this.camera.updateMatrixWorld(true)

    // Make sure to update all properties that are accessible via API (e.g. zoomlevel) b/c
    // otherwise they would be updated as recently as in the next animation frame.
    this.updateLookAtSettings()
    this.update()
  }

  /**
   * The node in this MapView's scene containing the user {@link MapAnchor}s.
   *
   * @remarks
   * All (first level) children of this node will be positioned in world space according to the
   * [[MapAnchor.geoPosition]].
   * Deeper level children can be used to position custom objects relative to the anchor node.
   */
  get mapAnchors(): MapAnchors {
    return this.m_mapAnchors
  }

  /**
   * Visit each tile in visible, rendered, and cached sets.
   *
   * @remarks
   *  * Visible and temporarily rendered tiles will be marked for update and retained.
   *  * Cached but not rendered/visible will be evicted.
   *
   * @param dataSource - If passed, only the tiles from this {@link DataSource} instance
   * are processed. If `undefined`, tiles from all {@link DataSource}s are processed.
   * @param filter Optional tile filter
   */
  markTilesDirty(dataSource?: DataSource, filter?: (tile: Tile) => boolean) {
    this.m_visibleTiles.markTilesDirty(dataSource, filter)
    this.update()
  }

  /**
   * The minimum zoom level.
   */
  get minZoomLevel(): number {
    return this.m_minZoomLevel
  }

  /**
   * The minimum zoom level.
   */
  set minZoomLevel(zoomLevel: number) {
    this.m_minZoomLevel = zoomLevel
    this.update()
  }

  /**
   * The maximum zoom level. Default is 14.
   */
  get maxZoomLevel(): number {
    return this.m_maxZoomLevel
  }

  /**
   * The maximum zoom level.
   */
  set maxZoomLevel(zoomLevel: number) {
    this.m_maxZoomLevel = zoomLevel
    this.update()
  }

  get maxFps(): number {
    //this cannot be undefined, as it is defaulting to 0 in the constructor
    return this.m_options.maxFps as number
  }

  private movementStarted() {
    this.m_textElementsRenderer.movementStarted()

    this.MOVEMENT_STARTED_EVENT.time = Date.now()
    this.dispatchEvent(this.MOVEMENT_STARTED_EVENT)
  }

  private movementFinished() {
    this.m_textElementsRenderer.movementFinished()

    this.MOVEMENT_FINISHED_EVENT.time = Date.now()
    this.dispatchEvent(this.MOVEMENT_FINISHED_EVENT)

    // render at the next possible time.
    if (!this.animating) {
      if (this.m_movementFinishedUpdateTimerId !== undefined) {
        clearTimeout(this.m_movementFinishedUpdateTimerId)
      }
      this.m_movementFinishedUpdateTimerId = setTimeout(() => {
        this.m_movementFinishedUpdateTimerId = undefined
        this.update()
      }, 0)
    }
  }

  /**
   * The THREE.js overlay scene
   */
  get overlayScene(): THREE.Scene {
    return this.m_overlayScene
  }

  get pixelRatio(): number {
    if (this.m_pixelRatio !== undefined) {
      return this.m_pixelRatio
    }
    return typeof window !== 'undefined' && window.devicePixelRatio !== undefined
      ? window.devicePixelRatio
      : 1.0
  }

  /**
   * Returns the ratio between a pixel and a world unit for the current camera (in the center of
   * the camera projection).
   */
  get pixelToWorld(): number {
    if (this.m_pixelToWorld === undefined) {
      // At this point fov calculation should be always defined.
      assert(this.m_options.fovCalculation !== undefined)
      // NOTE: Look at distance is the distance to camera focus (and pivot) point.
      // In screen space this point is located in the center of canvas.
      // Given that zoom level is not modified (clamped by camera pitch), the following
      // formulas are all equivalent:
      // lookAtDistance = (EQUATORIAL_CIRCUMFERENCE * focalLength) / (256 * zoomLevel^2);
      // lookAtDistance = abs(cameraPos.z) / cos(cameraPitch);
      // Here we may use precalculated target distance (once pre frame):
      const lookAtDistance = this.m_targetDistance
      const focalLength = CameraUtils.getFocalLength(this.m_camera)
      assert(focalLength !== undefined)

      // Find world space object size that corresponds to one pixel on screen.
      this.m_pixelToWorld = CameraUtils.convertScreenToWorldSize(focalLength!, lookAtDistance, 1)
    }
    return this.m_pixelToWorld
  }

  /**
   * @hidden
   * @internal
   * Get the {@link PoiManager} that belongs to this `MapView`.
   */
  get poiManager(): PoiManager {
    return this.m_poiManager
  }

  /**
   * @hidden
   * Get the array of {@link PoiTableManager} that belongs to this `MapView`.
   */
  get poiTableManager(): PoiTableManager {
    return this.m_poiTableManager
  }

  /**
   * The projection used to project geo coordinates to world coordinates.
   */
  get projection(): Projection {
    return sphereProjection
  }

  /**
   * The THREE.js `WebGLRenderer` used by this scene.
   */
  get renderer(): THREE.WebGLRenderer {
    return this.m_renderer
  }

  /**
   * Renders the current frame.
   */
  render(frameStartTime: number): void {
    // private
    if (this.m_drawing) {
      return
    }

    if (this.disposed) {
      logger.warn('render(): MapView has been disposed of.')
      return
    }

    // this.RENDER_EVENT.time = frameStartTime
    // this.dispatchEvent(this.RENDER_EVENT)

    this.m_tileObjectRenderer.prepareRender()

    ++this.m_frameNumber

    let currentFrameEvent: FrameStats | undefined
    const stats = PerformanceStatistics.instance
    const gatherStatistics: boolean = stats.enabled
    if (gatherStatistics) {
      currentFrameEvent = stats.currentFrame

      // if (this.m_previousFrameTimeStamp !== undefined) {
      //   // In contrast to fullFrameTime we also measure the application code
      //   // for the FPS. This means FPS != 1000 / fullFrameTime.
      //   const timeSincePreviousFrame = frameStartTime - this.m_previousFrameTimeStamp
      //   currentFrameEvent.setValue('render.fps', 1000 / timeSincePreviousFrame)
      // }

      // We store the last frame statistics at the beginning of the next frame b/c additional
      // work (i.e. geometry creation) is done outside of the animation frame but still needs
      // to be added to the `fullFrameTime` (see [[TileGeometryLoader]]).
      stats.storeAndClearFrameInfo()

      currentFrameEvent = currentFrameEvent as FrameStats
      currentFrameEvent.setValue('renderCount.frameNumber', this.m_frameNumber)
    }

    this.m_previousFrameTimeStamp = frameStartTime

    let setupTime: number | undefined
    let cullTime: number | undefined
    let textPlacementTime: number | undefined
    let drawTime: number | undefined
    let textDrawTime: number | undefined
    let endTime: number | undefined

    this.m_renderer.info.reset()

    this.m_updatePending = false
    this.m_thisFrameTilesChanged = undefined

    this.m_drawing = true

    // if (this.m_renderer.getPixelRatio() !== this.pixelRatio) {
    //   this.m_renderer.setPixelRatio(this.pixelRatio)
    // }

    this.updateCameras()
    this.updateEnv()

    this.m_renderer.clear()

    // clear the scenes
    this.m_sceneRoot.children.length = 0
    this.m_overlaySceneRoot.children.length = 0

    if (gatherStatistics) {
      setupTime = PerformanceTimer.now()
    }

    // TBD: Update renderList only any of its params (camera, etc...) has changed.
    if (!this.lockVisibleTileSet) {
      const viewRangesStatus = this.m_visibleTiles.updateRenderList(
        this.storageLevel,
        Math.floor(this.zoomLevel),
        this.getEnabledTileDataSources(),
        this.m_frameNumber,
        this.m_elevationRangeSource
      )
      // View ranges has changed due to features (with elevation) that affects clip planes
      // positioning, update cameras with new clip planes positions.
      if (viewRangesStatus.viewRangesChanged) {
        this.updateCameras(viewRangesStatus.viewRanges)
      }
    }

    if (gatherStatistics) {
      cullTime = PerformanceTimer.now()
    }

    const renderList = this.m_visibleTiles.dataSourceTileList

    // no need to check everything if we're not going to create text renderer.
    renderList.forEach(({ zoomLevel, renderedTiles }) => {
      renderedTiles.forEach((tile) => {
        this.m_tileObjectRenderer.render(
          tile,
          zoomLevel,
          this.zoomLevel,
          this.m_camera.position,
          this.m_sceneRoot
        )

        //We know that rendered tiles are visible (in the view frustum), so we update the
        //frame number, note we don't do this for the visibleTiles because some may still be
        //loading (and therefore aren't visible in the sense of being seen on the screen).
        //Note also, this number isn't currently used anywhere so should be considered to be
        //removed in the future (though could be good for debugging purposes).
        tile.frameNumLastVisible = this.m_frameNumber
      })
    })

    this.m_mapAnchors.update(
      this.projection,
      this.camera.position,
      this.m_sceneRoot,
      this.m_overlaySceneRoot
    )

    this.m_animatedExtrusionHandler.update(this.zoomLevel)

    if (currentFrameEvent !== undefined) {
      // Make sure the counters all have a value.
      currentFrameEvent.addValue('renderCount.numTilesRendered', 0)
      currentFrameEvent.addValue('renderCount.numTilesVisible', 0)
      currentFrameEvent.addValue('renderCount.numTilesLoading', 0)

      // Increment the counters for all data sources.
      renderList.forEach(({ zoomLevel, renderedTiles, visibleTiles, numTilesLoading }) => {
        currentFrameEvent!.addValue('renderCount.numTilesRendered', renderedTiles.size)
        currentFrameEvent!.addValue('renderCount.numTilesVisible', visibleTiles.length)
        currentFrameEvent!.addValue('renderCount.numTilesLoading', numTilesLoading)
      })
    }

    if (this.m_movementDetector.checkCameraMoved(this, frameStartTime)) {
      //FIXME: Shouldn't we use target here?
      const { latitude, longitude, altitude } = this.geoCenter
      this.dispatchEvent({
        type: MapViewEventNames.CameraPositionChanged,
        latitude,
        longitude,
        altitude,
        // FIXME: Can we remove yaw, pitch and roll
        yaw: this.m_yaw,
        pitch: this.m_pitch,
        roll: this.m_roll,
        tilt: this.tilt,
        heading: this.heading,
        zoom: this.zoomLevel,
      })
    }

    // The camera used to render the scene.
    const camera = this.m_pointOfView !== undefined ? this.m_pointOfView : this.m_rteCamera

    if (this.renderLabels && !this.m_pointOfView) {
      this.m_textElementsRenderer.placeText(renderList, frameStartTime)
    }

    if (gatherStatistics) {
      textPlacementTime = PerformanceTimer.now()
    }

    this.mapRenderingManager.render(this.m_renderer, this.m_scene, camera, !this.isDynamicFrame)

    if (gatherStatistics) {
      drawTime = PerformanceTimer.now()
    }

    if (this.renderLabels && !this.m_pointOfView) {
      this.m_textElementsRenderer.renderText(this.m_viewRanges.maximum)
    }

    if (this.m_overlaySceneRoot.children.length > 0) {
      this.m_renderer.render(this.m_overlayScene, camera)
    }

    if (gatherStatistics) {
      textDrawTime = PerformanceTimer.now()
    }

    if (!this.m_firstFrameRendered) {
      this.m_firstFrameRendered = true

      if (gatherStatistics) {
        stats.appResults.set('firstFrame', frameStartTime)
      }

      this.FIRST_FRAME_EVENT.time = frameStartTime
      this.dispatchEvent(this.FIRST_FRAME_EVENT)
    }

    this.m_visibleTiles.disposePendingTiles()

    this.m_drawing = false

    // do this post paint therefore use a Timeout, if it has not been executed cancel and
    // create a new one
    if (this.m_taskSchedulerTimeout !== undefined) {
      clearTimeout(this.m_taskSchedulerTimeout)
    }
    this.m_taskSchedulerTimeout = setTimeout(() => {
      this.m_taskSchedulerTimeout = undefined
      this.m_taskScheduler.processPending(frameStartTime)
    }, 0)

    if (currentFrameEvent !== undefined) {
      endTime = PerformanceTimer.now()

      const frameRenderTime = endTime - frameStartTime

      currentFrameEvent.setValue('render.setupTime', setupTime! - frameStartTime)
      currentFrameEvent.setValue('render.cullTime', cullTime! - setupTime!)
      currentFrameEvent.setValue('render.textPlacementTime', textPlacementTime! - cullTime!)
      currentFrameEvent.setValue('render.drawTime', drawTime! - textPlacementTime!)
      currentFrameEvent.setValue('render.textDrawTime', textDrawTime! - drawTime!)
      currentFrameEvent.setValue('render.cleanupTime', endTime - textDrawTime!)
      currentFrameEvent.setValue('render.frameRenderTime', frameRenderTime)

      // Initialize the fullFrameTime with the frameRenderTime If we also create geometry in
      // this frame, this number will be increased in the TileGeometryLoader.
      currentFrameEvent.setValue('render.fullFrameTime', frameRenderTime)
      currentFrameEvent.setValue('render.geometryCreationTime', 0)

      // Add THREE.js statistics
      stats.addWebGLInfo(this.m_renderer.info)

      // Add memory statistics
      // FIXME:
      // This will only measure the memory of the rendering and not of the geometry creation.
      // Assuming the garbage collector is not kicking in immediately we will at least see
      // the geometry creation memory consumption accounted in the next frame.
      stats.addMemoryInfo()
    }

    this.DID_RENDER_EVENT.time = frameStartTime
    this.dispatchEvent(this.DID_RENDER_EVENT)

    // After completely rendering this frame, it is checked if this frame was the first complete
    // frame, with no more tiles, geometry and labels waiting to be added, and no animation
    // running. The initial placement of text in this render call may have changed the loading
    // state of the TextElementsRenderer, so this has to be checked again.
    // HARP-10919: Fading is currently ignored by the frame complete event.
    if (!this.isDynamicFrame) {
      if (this.m_firstFrameComplete === false) {
        this.m_firstFrameComplete = true
        if (gatherStatistics) {
          stats.appResults.set('firstFrameComplete', frameStartTime)
        }
      }

      this.FRAME_COMPLETE_EVENT.time = frameStartTime
      this.dispatchEvent(this.FRAME_COMPLETE_EVENT)
    }
  }

  /**
   * @returns Whether label rendering is enabled.
   */
  get renderLabels() {
    return this.m_renderLabels
  }

  /**
   * Enables or disables rendering of labels.
   * @param value - `true` to enable labels `false` to disable them.
   */
  set renderLabels(value: boolean) {
    this.m_renderLabels = value
  }

  /**
   * Render loop callback that should only be called by [[requestAnimationFrame]].
   * Will trigger [[requestAnimationFrame]] again if updates are pending or  animation is running.
   * @param frameStartTime - The start time of the current frame
   */
  private renderLoop(frameStartTime: number) {
    // Render loop shouldn't run when synchronous rendering is enabled or if `MapView` has been
    // disposed of.
    if (this.disposed) {
      // this.m_options.synchronousRendering === true ||
      return
    }

    this.render(frameStartTime)

    // if (this.maxFps === 0) {
    //   // Render with max fps
    //   this.render(frameStartTime)
    // } else {
    //   // Limit fps by skipping frames

    //   // Magic ingredient to compensate time flux.
    //   const fudgeTimeInMs = 3
    //   const frameInterval = 1000 / this.maxFps
    //   const previousFrameTime =
    //     this.m_previousFrameTimeStamp === undefined ? 0 : this.m_previousFrameTimeStamp
    //   const targetTime = previousFrameTime + frameInterval - fudgeTimeInMs

    //   if (frameStartTime >= targetTime) {
    //     this.render(frameStartTime)
    //   }
    // }

    // Continue rendering if update is pending or animation is running
    if (this.isDynamicFrame) {
      this.m_animationFrameHandle = requestAnimationFrame(this.handleRequestAnimationFrame)
    } else {
      // Stop rendering if no update is pending
      this.m_animationFrameHandle = undefined
    }
  }

  /**
   * @internal
   * @param fontCatalogs
   * @param textStyles
   * @param defaultTextStyle
   */
  public async resetTextRenderer(
    fontCatalogs?: FontCatalogConfig[],
    textStyles?: TextStyleDefinition[],
    defaultTextStyle?: TextStyleDefinition
  ): Promise<void> {
    console.log('skipping resetTextRenderer')
    // await this.m_textElementsRenderer.updateFontCatalogs(fontCatalogs)
    // await this.m_textElementsRenderer.updateTextStyles(textStyles, defaultTextStyle)
    this.update()
  }

  /**
   * Resize the HTML canvas element and the THREE.js `WebGLRenderer`.
   *
   * @param width - The new width.
   * @param height - The new height.
   */
  resize(width: number, height: number) {
    this.m_renderer.setSize(width, height, false)
    if (this.m_renderer.getPixelRatio() !== this.pixelRatio) {
      this.m_renderer.setPixelRatio(this.pixelRatio)
    }

    if (this.mapRenderingManager !== undefined) {
      this.mapRenderingManager.setSize(width, height)
    }

    if (this.collisionDebugCanvas !== undefined) {
      this.collisionDebugCanvas.width = width
      this.collisionDebugCanvas.height = height
    }

    this.updateCameras()
    this.update()

    this.dispatchEvent({
      type: MapViewEventNames.Resize,
      size: {
        width,
        height,
      },
    })
  }

  /**
   * The THREE.js scene used by this `MapView`.
   */
  get scene(): THREE.Scene {
    return this.m_scene
  }

  /**
   * The MapViewEnvironment used by this `MapView`.
   * @internal
   */
  get sceneEnvironment(): MapViewEnvironment {
    return this.m_sceneEnvironment
  }

  /**
   * Sets the field of view calculation, and applies it immediately to the camera.
   *
   * @param fovCalculation - How to calculate the FOV
   * @param height - Viewport height.
   */
  private setFovOnCamera(fovCalculation: FovCalculation, height: number) {
    // console.tron.log('What the fuck is this')
    // console.tron.log(height)
    // console.tron.log(fovCalculation)
    const fovRad = THREE.MathUtils.degToRad(fovCalculation.fov)

    if (fovCalculation.type === 'fixed') {
      CameraUtils.setVerticalFov(this.m_camera, fovRad, height)
      return
    }

    let focalLength = CameraUtils.getFocalLength(this.m_camera)
    if (focalLength === undefined) {
      CameraUtils.setVerticalFov(this.m_camera, fovRad, height)
      focalLength = CameraUtils.getFocalLength(this.m_camera)
    }
    CameraUtils.setFocalLength(this.m_camera, focalLength!, height)
  }

  /**
   * Changes the `Theme`used by this `MapView`to style map elements.
   */
  async setTheme(theme: Theme | string): Promise<Theme> {
    const newTheme = await this.m_themeManager.setTheme(theme)

    // this.THEME_LOADED_EVENT.time = Date.now()
    // this.dispatchEvent(this.THEME_LOADED_EVENT)
    this.update()
    return newTheme
  }

  private setupCamera() {
    assert(this.m_visibleTiles !== undefined)

    this.m_options.target = GeoCoordinates.fromObject(
      getOptionValue(this.m_options.target, MapViewDefaults.target)
    )
    // ensure that look at target has height of 0
    ;(this.m_options.target as GeoCoordinates).altitude = 0
    this.m_options.tilt = getOptionValue(this.m_options.tilt, MapViewDefaults.tilt)

    this.m_options.heading = getOptionValue(this.m_options.heading, MapViewDefaults.heading)

    this.m_options.zoomLevel = getOptionValue(this.m_options.zoomLevel, MapViewDefaults.zoomLevel)

    this.lookAtImpl(this.m_options)

    // ### move & customize
    const { width, height } = this.getCanvasClientSize()
    this.resize(width, height)
  }

  private setupRenderer(tileObjectRenderer: TileObjectRenderer) {
    this.m_scene.add(this.m_sceneRoot)
    this.m_overlayScene.add(this.m_overlaySceneRoot)

    this.shadowsEnabled = this.m_options.enableShadows ?? false

    tileObjectRenderer.setupRenderer()
  }

  get shadowsEnabled(): boolean {
    return this.m_options.enableShadows === true
  }

  set shadowsEnabled(enabled: boolean) {
    // shadowMap is undefined if we are testing (three.js always set it to be defined).
    if (this.m_renderer.shadowMap === undefined || enabled === this.m_renderer.shadowMap.enabled) {
      return
    }
    this.m_options.enableShadows = enabled
    // There is a bug in three.js where this doesn't currently work once enabled.
    this.m_renderer.shadowMap.enabled = enabled
    // TODO: Make this configurable. Note, there is currently issues when using the
    // VSMShadowMap type, this should be investigated if this type is requested.
    this.m_renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.clearTileCache()
  }

  /**
   * Returns the storage level for the given camera setup.
   * @remarks
   * Actual storage level of the rendered data also depends
   * on {@link DataSource.storageLevelOffset}.
   */
  get storageLevel(): number {
    return THREE.MathUtils.clamp(
      Math.floor(this.m_zoomLevel),
      this.m_minZoomLevel,
      this.m_maxZoomLevel
    )
  }

  /**
   * Get geo coordinates of camera focus (target) point.
   *
   * @remarks
   * This point is not necessarily on the ground, i.e.:
   *  - if the tilt is high and projection is {@link @here/harp-geoutils#sphereProjection}`
   *  - if the camera was modified directly and is not pointing to the ground.
   * In any case the projection of the target point will be in the center of the screen.
   *
   * @returns geo coordinates of the camera focus point.
   */
  get target(): GeoCoordinates {
    return this.m_targetGeoPos
  }

  get taskQueue(): TaskQueue {
    return this.m_taskScheduler.taskQueue
  }

  /**
   * Returns tilt angle in degrees.
   */
  get tilt(): number {
    return THREE.MathUtils.radToDeg(this.m_pitch)
  }

  /**
   * Set the tilt angle of the map.
   * @param tilt -: New tilt angle in degrees.
   */
  set tilt(tilt: number) {
    this.lookAtImpl({ tilt })
  }

  /**
   * Requests a redraw of the scene.
   */
  update() {
    if (this.disposed) {
      logger.warn('update(): MapView has been disposed of.')
      return
    }

    // this.dispatchEvent(this.UPDATE_EVENT)

    // Skip if update is already in progress
    if (this.m_updatePending) {
      return
    }

    // Set update flag
    this.m_updatePending = true

    // this.startRenderLoop()
  }

  /**
   * Updates the camera and the projections and resets the screen collisions,
   * note, setupCamera must be called before this is called.
   *
   * @remarks
   * @param viewRanges - optional parameter that supplies new view ranges, most importantly
   * near/far clipping planes distance. If parameter is not provided view ranges will be
   * calculated from [[ClipPlaneEvaluator]] used in {@link VisibleTileSet}.
   */
  private updateCameras(viewRanges?: ViewRanges) {
    // Update look at settings first, so that other components (e.g. ClipPlanesEvaluator) get
    // the up to date tilt, targetDistance, ...
    this.m_camera.updateMatrixWorld(false)
    this.updateLookAtSettings()

    const { width, height } = this.m_renderer.getSize(cache.vector2[0])
    this.m_camera.aspect =
      this.m_forceCameraAspect !== undefined ? this.m_forceCameraAspect : width / height
    this.setFovOnCamera(this.m_options.fovCalculation!, height)

    // When calculating clip planes account for the highest building on the earth,
    // multiplying its height by projection scaling factor. This approach assumes
    // constantHeight property of extruded polygon technique is set as default false,
    // otherwise the near plane margins will be bigger then required, but still correct.
    const projectionScale = this.projection.getScaleFactor(this.camera.position)
    const maxGeometryHeightScaled =
      projectionScale *
      this.m_tileDataSources.reduce((r, ds) => Math.max(r, ds.maxGeometryHeight), 0)

    const minGeometryHeightScaled =
      projectionScale *
      this.m_tileDataSources.reduce((r, ds) => Math.min(r, ds.minGeometryHeight), 0)

    // console.log(maxGeometryHeightScaled, minGeometryHeightScaled)

    // Copy all properties from new view ranges to our readonly object.
    // This allows to keep all view ranges references valid and keeps up-to-date
    // information within them. Works the same as copping all properties one-by-one.
    Object.assign(
      this.m_viewRanges,
      viewRanges === undefined
        ? this.m_visibleTiles.updateClipPlanes(maxGeometryHeightScaled, minGeometryHeightScaled)
        : viewRanges
    )
    this.m_camera.near = this.m_viewRanges.near
    this.m_camera.far = this.m_viewRanges.far

    this.m_camera.updateProjectionMatrix()

    // Update the "relative to eye" camera. Copy the public camera parameters
    // and place the "relative to eye" at the world's origin.
    this.m_rteCamera.copy(this.m_camera)
    this.m_rteCamera.position.setScalar(0)
    this.m_rteCamera.updateMatrixWorld(true)

    this.m_textElementsRenderer?.updateCamera()

    this.m_screenProjector.update(this.camera, width, height)

    this.m_pixelToWorld = undefined
    this.m_sceneEnvironment.update()
  }

  /**
   * Update `Env` instance used for style `Expr` evaluations.
   */
  private updateEnv() {
    this.m_env.entries.$zoom = this.m_zoomLevel

    // This one introduces unnecessary calculation of pixelToWorld, even if it's barely
    // used in our styles.
    this.m_env.entries.$pixelToMeters = this.pixelToWorld

    this.m_env.entries.$frameNumber = this.m_frameNumber
  }

  /**
   * Derive the look at settings (i.e. target, zoom, ...) from the current camera.
   */
  private updateLookAtSettings() {
    let { target, distance, final } = MapViewUtils.getTargetAndDistance(
      this.projection,
      this.camera,
      this.elevationProvider
    )
    if (!final) {
      this.update()
    }
    if (this.geoMaxBounds) {
      ;({ target, distance } = MapViewUtils.constrainTargetAndDistanceToViewBounds(
        target,
        distance,
        this
      ))
    }

    this.m_targetWorldPos.copy(target)
    this.m_targetGeoPos = this.projection.unprojectPoint(this.m_targetWorldPos)
    this.m_targetDistance = distance
    this.m_zoomLevel = MapViewUtils.calculateZoomLevelFromDistance(this, this.m_targetDistance)

    const { yaw, pitch, roll } = this.extractAttitude()
    this.m_yaw = yaw
    this.m_pitch = pitch
    this.m_roll = roll
  }

  /**
   * Returns `true` if an update has already been requested, such that after a currently rendering
   * frame, the next frame will be rendered immediately.
   */
  get updatePending(): boolean {
    return this.m_updatePending
  }

  /**
   * Get object describing frustum planes distances and min/max visibility range for actual
   * camera setup.
   *
   * @remarks
   * Near and far plane distance are self explanatory while minimum and maximum visibility range
   * describes the extreme near/far planes distances that may be achieved with current camera
   * settings, meaning at current zoom level (ground distance) and any possible orientation.
   * @note Visibility is directly related to camera [[ClipPlaneEvaluator]] used and determines
   * the maximum possible distance of camera far clipping plane regardless of tilt, but may change
   * whenever zoom level changes. Distance is measured in world units which may be approximately
   * equal to meters, but this depends on the distortion related to projection type used.
   * @internal
   */
  get viewRanges(): ViewRanges {
    return this.m_viewRanges
  }

  /**
   * Returns the zoom level for the given camera setup.
   */
  get zoomLevel(): number {
    return this.m_zoomLevel
  }
}
