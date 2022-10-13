import { GeoCoordinates, mercatorProjection } from 'app/arca/geoutils'
import { ResourceComputationType } from 'app/arca/mapview'
import arcade from './arcade.json'

/**
 * Default settings used by {@link MapView} collected in one place.
 * @internal
 */
export const MapViewDefaults = {
  projection: mercatorProjection,
  addBackgroundDatasource: true,

  maxVisibleDataSourceTiles: 100,
  extendedFrustumCulling: true,

  tileCacheSize: 200,
  resourceComputationType: ResourceComputationType.EstimationInMb,
  quadTreeSearchDistanceUp: 3,
  quadTreeSearchDistanceDown: 2,

  pixelRatio:
    typeof window !== 'undefined' && window.devicePixelRatio !== undefined
      ? window.devicePixelRatio
      : 1.0,
  target: new GeoCoordinates(25, 0),
  zoomLevel: 5,
  tilt: 0,
  heading: 0,
  // theme:
  //   'https://raw.githubusercontent.com/heremaps/harp.gl/master/%40here/harp-map-theme/resources/berlin_tilezen_base.json',
  theme: arcade,
  maxTilesPerFrame: 0,
}
