import { ECSYThreeEntity, ECSYThreeWorld, initializeFromMap } from 'app/arca/ecs-three'
import { EarthConstants, GeoCoordinates, sphereProjection } from 'app/arca/geoutils'
import { MapControls } from 'app/arca/map-controls'
import {
  AtmosphereLightMode,
  MapAnchor,
  MapView,
  MapViewAtmosphere,
  MapViewEventNames,
} from 'app/arca/mapview'
import { OmvTileDecoder } from 'app/arca/omv-datasource/index-worker'
import { UI } from 'app/arca/ui'
import { APIFormat, VectorTileDataSource } from 'app/arca/vectortile-datasource'
import * as THREE from 'three'
// import { Api } from './api'
import { Rotating } from './components/Rotating'
import { RotationSystem } from './systems/RotatingSystem'

export default class Realgame {
  // private api: Api
  private camera: THREE.PerspectiveCamera
  private canvas: HTMLCanvasElement
  private initialized: boolean = false
  public mapView: MapView
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private sceneEntity: ECSYThreeEntity
  private ui: UI
  private world: ECSYThreeWorld

  // constructor(canvasId: string = 'arcade') {
  constructor(canvas: HTMLCanvasElement, renderer?: THREE.WebGLRenderer) {
    this.canvas = canvas
    if (renderer) {
      // console.log('setting renderer')
      this.renderer = renderer
    }

    this.initializeUI()
    // this.initializeApi()
    this.initializeMap()
    // this.initializeEcs()

    this.initAustinScene()
    // this.createTestBeacons()
    // setTimeout(() => {
    //   this.initGlobeZoom()
    // }, 1000)
  }

  public initGlobeZoom() {
    // this.mapView.flyTo(
    //   new GeoCoordinates(30.275846826877412, -97.74038700531217),
    //   EarthConstants.EQUATORIAL_RADIUS * 1.6
    // )
    const mapView = this.mapView
    mapView.addEventListener(MapViewEventNames.AfterRender, () => {
      mapView.lookAt({
        target: new GeoCoordinates(mapView.geoCenter.latitude, mapView.geoCenter.longitude + 0.05),
        // latitu/de: mapView.geoCenter.latitude + 0.0001,
        // longitude: mapView.geoCenter.longitude,
        //
        // zoomLevel: mapView.zoomLevel + 0.0001,
      })
      mapView.update()
    })
  }

  public initAustinScene() {
    this.mapView.lookAt({
      // distance: EarthConstants.EQUATORIAL_RADIUS * 0.3,
      target: new GeoCoordinates(30.2652, -97.7451),
      zoomLevel: 18,
      tilt: 40,
    })
    // Rotate
    setTimeout(() => {
      const mapView = this.mapView
      mapView.addEventListener(MapViewEventNames.AfterRender, () => {
        mapView.lookAt({
          heading: mapView.heading + 0.02,
        })
        mapView.update()
      })
    }, 1000)
  }

  /**
   * Create some test Beacons
   */
  private createTestBeacons() {
    const addBox = (evt) => {
      const geometry = new THREE.BoxGeometry(100, 100, 100)
      const material = new THREE.MeshStandardMaterial({
        color: 0x00ff00fe,
      })
      const cube: MapAnchor = new THREE.Mesh(geometry, material)
      cube.renderOrder = 100000
      const geoPosition = this.mapView.getGeoCoordinatesAt(evt.pageX, evt.pageY)
      cube.anchor = geoPosition
      this.world
        .createEntity()
        .addComponent(Rotating, { speed: 5 })
        .addObject3DComponent(cube, this.sceneEntity)
      this.mapView.mapAnchors.add(cube)
      this.mapView.update()
    }
    window.addEventListener('click', addBox)
  }

  /**
   * Grab approximate user location
   */
  public async navToApproximateUserLocation() {
    // console.log('skipping navToApproximateUserLocation')
    // const { lat, lon } = await this.api.fetchApproximateUserLocation()
    // this.mapView.flyTo(
    // new GeoCoordinates(lat, lon),
    // EarthConstants.EQUATORIAL_RADIUS * 0.8
    // EarthConstants.EQUATORIAL_RADIUS * 0.4
    // )
    // this.mapView.lookAt({
    //     target: new GeoCoordinates(lat, lon),
    //     zoomLevel: 9,
    // })
  }

  public flyToLatLon(lat, lon) {
    // this.mapView.renderLabels = true
    // console.log('going there', lat, lon)
    this.mapView.endAnimation()
    this.mapView.flyTo(
      new GeoCoordinates(lat, lon),
      EarthConstants.EQUATORIAL_RADIUS * 0.15
      // EarthConstants.EQUATORIAL_RADIUS * 0.4
    )
    // this.mapView.lookAt({
    //     target: new GeoCoordinates(lat, lon),
    //     zoomLevel: 9,
    // })
  }

  /**
   * Initialize API
   */
  private initializeApi() {
    // this.api = new Api()
  }

  /**
   * Set up entity component system
   */
  private initializeEcs() {
    // Initialize the default sets of entities and systems
    const { sceneEntity, world } = initializeFromMap(this.camera, this.renderer, this.scene)
    this.sceneEntity = sceneEntity
    this.world = world
    this.world.registerComponent(Rotating)
    this.world.registerSystem(RotationSystem)
    this.mapView.world = world
    this.mapView.sceneEntity = sceneEntity
  }

  /**
   * Create Arca map
   */
  private initializeMap() {
    this.mapView = new MapView({
      canvas: this.canvas,
      projection: sphereProjection,
      // renderer: this.renderer,
      theme: '/resources/arcade-globe.json',
      zoomLevel: 1,
    })
    this.mapView.addEventListener('datasource-connect', () => {
      if (this.initialized) return
      this.initialized = true
      // this.navToApproximateUserLocation()
      setTimeout(() => {
        this.ui.hideOverlay()
      }, 1250)
    })
    this.camera = this.mapView.camera
    this.renderer = this.mapView.renderer
    this.scene = this.mapView.scene
    this.mapView.resize(window.innerWidth, window.innerHeight)

    window.addEventListener('resize', () => {
      this.mapView.resize(window.innerWidth, window.innerHeight)
    })

    this.mapView.renderLabels = false

    this.mapView.lookAt({
      distance: EarthConstants.EQUATORIAL_RADIUS * 2.4,
      target: new GeoCoordinates(0, -97.74038700531217),
      // zoomLevel: 18,
      // tilt: 45,
    })

    // Atmosphere
    const { camera, projection, mapAnchors } = this.mapView
    const updateCallback = () => this.mapView.update()
    const atmosphere = new MapViewAtmosphere(
      mapAnchors,
      camera,
      projection,
      this.mapView.renderer.capabilities,
      updateCallback
    )
    atmosphere.lightMode = AtmosphereLightMode.LightDynamic

    this.mapView.addDataSource(
      new VectorTileDataSource({
        baseUrl: 'https://vector.hereapi.com/v2/vectortiles/base/mc',
        apiFormat: APIFormat.XYZOMV,
        styleSetName: 'tilezen',
        maxDataLevel: 18,
        authenticationCode: apikey,
        copyrightInfo: [
          {
            id: 'here.com',
            year: new Date().getFullYear(),
            label: 'HERE',
            link: 'https://legal.here.com/terms',
          },
        ],
        decoder: new OmvTileDecoder(),
      })
    )

    const mapControls = new MapControls(this.mapView)
    mapControls.enabled = false
    // mapControls.maxTiltAngle = 60
    // mapControls.maxZoomLevel = 14

    // this.mapView.loadPostEffects('resources/effects_test.json')
  }

  /**
   * Initialize UI
   */
  private initializeUI() {
    this.ui = new UI()
    this.ui.setParent(this)
  }
}

const apikey = '_ZQeCfAB3nJFJ4E7JJ7W-CwSSW3vvUh6032RY85_OVs'
