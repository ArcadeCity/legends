// import { Tile } from '../custom/Tile'
import arcade from 'app/arca/custom/MapView/arcade.json'
import { WebGLRenderer } from 'three'
import { TileGeometer } from '../custom/TileGeometer/TileGeometer'
import { DecodedTile, getStyles, Styles } from '../datasource-protocol'
import { StyleSetEvaluator } from '../datasource-protocol/StyleSetEvaluator'
import { mercatorProjection, TileKey } from '../geoutils'
import { Tile } from '../mapview'
import { TileGeometryCreator } from '../mapview/geometry/TileGeometryCreator'
import { ThemeLoader } from '../mapview/ThemeLoader'
import { OmvDataSource } from '../omv-datasource/OmvDataSource'
import { OmvFeatureFilter, OmvGeometryType } from '../vectortile-datasource'
import { OmvDataAdapter } from '../vectortile-datasource/adapters/omv/OmvDataAdapter'
import {
  VectorTileDataProcessor, VectorTileDataProcessorOptions
} from '../vectortile-datasource/VectorTileDecoder'
import {
  FeatureAttributes, GeometryCommands, isClosePathCommand, isLineToCommand, isMoveToCommand, OmvVisitor,
  visitOmv
} from './OmvData'
// import { OmvDataAdapter } from './OmvDataAdapter'
import { com } from './proto/vector_tile'

export const decodeOmv = async (data: Uint8Array, gl: WebGLRenderer) => {
  const theme = arcade as any
  const styles = theme.styles as Styles

  const tileKey = TileKey.fromRowColumnLevel(2, 2, 2)
  // const decodeInfo = new DecodeInfo(mercatorProjection, tileKey, 0)
  // const tileKey = new TileKey(0, 0, 2)
  const storageLevelOffset = 1
  const styleSetEvaluator = new StyleSetEvaluator({ styleSet: getStyles(styles) })
  const adapter = new OmvDataAdapter()
  // const datasource = new OmvDataSource()
  adapter.configure({}, styleSetEvaluator)
  const filter = new FakeFeatureFilter()
  const processor = new VectorTileDataProcessor(
    tileKey,
    mercatorProjection, // ??
    styleSetEvaluator,
    adapter,
    { storageLevelOffset } as VectorTileDataProcessorOptions,
    filter
  )
  const decodedTile: DecodedTile = processor.getDecodedTile(data)

  const geometer = new TileGeometer(gl.capabilities)
  return geometer.buildGeometry(decodedTile, tileKey)

  // console.log('got decoded tile:', decodedTile)

  // console.log('capabilities:', gl.capabilities)

  // const creator = TileGeometryCreator.instance as TileGeometryCreator
  // creator.initDecodedTile(decodedTile)

  // console.log('Creator:', creator)
  // creator.setCapabilities(gl.capabilities)

  // return decodedTile
  // const tile = new Tile(tileKey)
  // tile.decodedTile = decodedTile

  // await creator.createAllGeometries(tile, decodedTile)

  // console.log('tile:', tile)
  // return tile.objects
}

class FakeFeatureFilter implements OmvFeatureFilter {
  hasKindFilter: boolean = true

  wantsLayer(layer: string, level: number): boolean {
    return true
  }

  wantsPointFeature(layer: string, geometryType: OmvGeometryType, level: number): boolean {
    return true
  }

  wantsLineFeature(layer: string, geometryType: OmvGeometryType, level: number): boolean {
    return true
  }

  wantsPolygonFeature(layer: string, geometryType: OmvGeometryType, level: number): boolean {
    return true
  }

  wantsKind(kind: string | string[]): boolean {
    return true
  }
}
