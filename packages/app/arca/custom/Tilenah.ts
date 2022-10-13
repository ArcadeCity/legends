import { DecodedTile } from '../datasource-protocol'
import { MapView, TileObject } from '../mapview'

export class Tile {
  /**
   * A list of the THREE.js objects stored in this `Tile`.
   */
  readonly objects: TileObject[] = []
  private m_decodedTile?: DecodedTile
  private m_mapView: MapView

  constructor() {
    console.log('Tile constructed.')
    this.m_mapView = new MapView()
  }

  get mapView(): MapView {
    return this.m_mapView
  }

  /**
   * Gets the decoded tile; it is removed after geometry handling.
   */
  get decodedTile(): DecodedTile | undefined {
    return this.m_decodedTile
  }

  /**
   * Applies the decoded tile to the tile.
   *
   * @remarks
   * If the geometry is empty, then the tile's forceHasGeometry flag is set.
   * Map is updated.
   * @param decodedTile - The decoded tile to set.
   */
  set decodedTile(decodedTile: DecodedTile | undefined) {
    this.m_decodedTile = decodedTile
    // this.invalidateResourceInfo()

    if (decodedTile === undefined) {
      return
    }

    // if (decodedTile.geometries.length === 0) {
    //   this.forceHasGeometry(true)
    // }

    // If the decoder provides a more accurate bounding box than the one we computed from
    // the flat geo box we take it instead. Otherwise, if an elevation range was set, elevate
    // bounding box to match the elevated geometry.
    // this.m_maxGeometryHeight = decodedTile.boundingBox
    //   ? undefined
    //   : decodedTile.maxGeometryHeight ?? 0
    // this.m_minGeometryHeight = decodedTile.boundingBox
    //   ? undefined
    //   : decodedTile.minGeometryHeight ?? 0
    // this.elevateGeoBox()
    // this.updateBoundingBox(decodedTile.boundingBox)

    // const stats = PerformanceStatistics.instance
    // if (stats.enabled && decodedTile.decodeTime !== undefined) {
    //   stats.currentFrame.addValue('decode.decodingTime', decodedTile.decodeTime)
    //   stats.currentFrame.addValue('decode.decodedTiles', 1)
    // }

    // if (decodedTile.copyrightHolderIds !== undefined) {
    //   this.copyrightInfo = decodedTile.copyrightHolderIds.map((id) => ({ id }))
    // }

    // this.dataSource.requestUpdate()
  }
}
