import { ShapeUtils, Vector2 } from 'three'
import { ValueMap } from '../misc'
import { VectorTileDataProcessor } from '../vectortile-datasource/VectorTileDecoder'
import { IGeometryProcessor, IPolygonGeometry } from './IGeometryProcessor'
import {
  FeatureAttributes, GeometryCommands, isClosePathCommand, isLineToCommand, isMoveToCommand, OmvVisitor,
  visitOmv
} from './OmvData'
import { com } from './proto/vector_tile'

export class OmvDataAdapter implements OmvVisitor {
  private readonly m_geometryCommands = new GeometryCommands()
  private m_layer!: com.mapbox.pb.Tile.ILayer
  private m_processor!: IGeometryProcessor

  constructor() {
    this.m_processor = new VectorTileDataProcessor()
  }

  visitLayer?(layer: com.mapbox.pb.Tile.ILayer): boolean {
    this.m_layer = layer
    console.log('visitLayer', layer.name)
    if (layer.name === 'water' || layer.name === 'landuse') {
      return true
    }
    return false
  }

  endVisitLayer?(layer: com.mapbox.pb.Tile.ILayer): void {
    console.log('endVisitLayer', layer.name)
  }

  visitPointFeature?(feature: com.mapbox.pb.Tile.IFeature): void {
    console.log('visitPointFeature')
  }

  visitLineFeature?(feature: com.mapbox.pb.Tile.IFeature): void {
    console.log('visitLineFeature')
  }

  visitPolygonFeature?(feature: com.mapbox.pb.Tile.IFeature): void {
    console.log('visitPolygonFeature')

    if (feature.geometry === undefined) {
      console.log('No polygon geometry - returning')
    }

    const layerName = this.m_layer.name
    const layerExtents = this.m_layer.extent ?? 4096

    const geometry: IPolygonGeometry[] = []
    let currentPolygon: IPolygonGeometry | undefined
    let currentRing: Vector2[]
    let exteriorWinding: number | undefined
    this.m_geometryCommands.accept(feature.geometry, {
      type: 'Polygon',
      visitCommand: (command) => {
        if (isMoveToCommand(command)) {
          currentRing = [command.position]
        } else if (isLineToCommand(command)) {
          currentRing.push(command.position)
        } else if (isClosePathCommand(command)) {
          if (currentRing !== undefined && currentRing.length > 0) {
            const currentRingWinding = Math.sign(ShapeUtils.area(currentRing))
            // Winding order from XYZ spaces might be not MVT spec compliant, see HARP-11151.
            // We take the winding of the very first ring as reference.
            if (exteriorWinding === undefined) {
              exteriorWinding = currentRingWinding
            }
            // MVT spec defines that each exterior ring signals the beginning of a new polygon.
            // see https://github.com/mapbox/vector-tile-spec/tree/master/2.1
            if (currentRingWinding === exteriorWinding) {
              // Create a new polygon and push it into the collection of polygons
              currentPolygon = { rings: [] }
              geometry.push(currentPolygon)
            }
            // Push the ring into the current polygon
            currentRing.push(currentRing[0].clone())
            currentPolygon?.rings.push(currentRing)
          }
        }
      },
    })
    if (geometry.length === 0) {
      return
    }

    checkWinding(geometry)

    const properties: ValueMap = {}

    this.m_processor.processPolygonFeature(
      layerName,
      layerExtents,
      geometry,
      properties,
      decodeFeatureId(feature, properties)
    )
  }
}

// /**
//  * An interface to represent polygon geometries.
//  */
// export interface IPolygonGeometry {
//   /**
//    * The rings of this polygon (specified in local webMercator space).
//    */
//   readonly rings: Vector2[][]
// }

// Ensures ring winding follows Mapbox Vector Tile specification: outer rings must be clockwise,
// inner rings counter-clockwise.
// See https://docs.mapbox.com/vector-tiles/specification/
function checkWinding(multipolygon: IPolygonGeometry[]) {
  const firstPolygon = multipolygon[0]

  if (firstPolygon === undefined || firstPolygon.rings.length === 0) {
    return
  }

  // Opposite sign to ShapeUtils.isClockWise, since webMercator tile space has top-left origin.
  // For example:
  // Given the ring = [(1,2), (2,2), (2,1), (1,1)]
  // ShapeUtils.area(ring) > 0    -> false
  // ShapeUtils.isClockWise(ring) -> true
  // ^
  // |  1,2 -> 2,2
  // |          |
  // |  1,1 <- 2,1
  // |_______________>
  //
  // Tile space axis
  //  ______________>
  // |  1,1 <- 2,1
  // |          |
  // |  1,2 ->  2,2
  // V
  const isOuterRingClockWise = ShapeUtils.area(firstPolygon.rings[0]) > 0

  if (!isOuterRingClockWise) {
    for (const polygon of multipolygon) {
      for (const ring of polygon.rings) {
        ring.reverse()
      }
    }
  }
}

function decodeFeatureId(
  feature: com.mapbox.pb.Tile.IFeature,
  properties: ValueMap
  // logger?: any // ILogger
): number | string | undefined {
  if (properties.id !== undefined && properties.id !== null) {
    return properties.id as number | string
  }
  if (feature.hasOwnProperty('id')) {
    const id = feature.id
    if (typeof id === 'number') {
      return id
    } else if (id) {
      // if (logger !== undefined && id.greaterThan(Number.MAX_SAFE_INTEGER)) {
      //     logger.error(
      //         "Invalid ID: Larger than largest available Number in feature: ",
      //         feature
      //     );
      // }
      return id.toNumber()
    }
  }

  return undefined
}
