import {
  Attachment, DecodedTile, Env, Expr, getPropertyValue, isSolidLineTechnique, needsVertexNormals
} from 'app/arca/datasource-protocol'
import { TileKey } from 'app/arca/geoutils'
import { buildObject, createMaterial, usesObject3D } from 'app/arca/mapview/DecodedTileHelpers'
import { Tile, TileObject } from 'app/arca/mapview/Tile'
import { isHighPrecisionLineMaterial, setShaderMaterialDefine, SolidLineMaterial } from 'app/arca/materials'
import { assert } from 'app/arca/utils'
import * as THREE from 'three'
import { AttachmentCache, AttachmentInfo } from './Attachments'

export class TileGeometer {
  private readonly m_capabilities: THREE.WebGLCapabilities

  constructor(capabilities: THREE.WebGLCapabilities) {
    console.log('[TileGeometer] Constructed.')
    this.m_capabilities = capabilities
  }

  buildGeometry(decodedTile: DecodedTile, tileKey: TileKey) {
    console.log('[TileGeometer] buildGeometry for tileKey:', tileKey)

    const onTextureCreated = () => {
      console.log('onNewTexture placeholder')
    }

    const objects = this.createObjects(decodedTile, onTextureCreated)
    console.log(`[TileGeometer] Created ${objects.length} objects`)

    return objects
  }

  createObjects(decodedTile: DecodedTile, onTextureCreated: () => void) {
    console.log('[TileGeometer] Creating objects.')

    const env: Env = new Env()
    const materials: THREE.Material[] = []
    const objects: TileObject[] = []

    for (const attachment of this.getAttachments(decodedTile)) {
      const srcGeometry = attachment.geometry
      const groups = attachment.info.groups
      const groupCount = groups.length

      console.log(`[TileGeometer] Creating objects for attachment with ${groupCount} groups`)

      for (let groupIndex = 0; groupIndex < groupCount; ) {
        const group = groups[groupIndex++]
        if (!group) continue
        const start = group.start
        const techniqueIndex = group.technique
        const technique = decodedTile.techniques[techniqueIndex]
        if (technique === undefined) continue

        let count = group.count

        if (!usesObject3D(technique)) {
          console.log('No use object3d - continuing')
          continue
        }

        let material: THREE.Material | undefined = materials[techniqueIndex]
        if (material === undefined) {
          material = createMaterial(
            this.m_capabilities,
            {
              technique,
              env,
              fog: false,
              shadowsEnabled: true,
            },
            onTextureCreated
          )
          if (material === undefined) {
            continue
          }

          materials[techniqueIndex] = material
        }

        const bufferGeometry = new THREE.BufferGeometry()

        srcGeometry.vertexAttributes?.forEach((vertexAttribute) => {
          const buffer = attachment.getBufferAttribute(vertexAttribute)
          bufferGeometry.setAttribute(vertexAttribute.name, buffer)
        })

        srcGeometry.interleavedVertexAttributes?.forEach((attr) => {
          attachment
            .getInterleavedBufferAttributes(attr)
            .forEach(({ name, attribute }) => bufferGeometry.setAttribute(name, attribute))
        })

        const index = attachment.info.index ?? srcGeometry.index
        if (index) {
          bufferGeometry.setIndex(attachment.getBufferAttribute(index))
        }

        if (!bufferGeometry.getAttribute('normal') && needsVertexNormals(technique)) {
          bufferGeometry.computeVertexNormals()
        }

        bufferGeometry.addGroup(start, count)

        if (isSolidLineTechnique(technique)) {
          // TODO: Unify access to shader defines via SolidLineMaterial setters
          assert(!isHighPrecisionLineMaterial(material))
          const lineMaterial = material as SolidLineMaterial
          if (bufferGeometry.getAttribute('color')) {
            setShaderMaterialDefine(lineMaterial, 'USE_COLOR', true)
            console.log('Hehe set that.')
          }
        }

        // Add the solid line outlines as a separate object.
        // const hasSolidLinesOutlines: boolean =
        //   isSolidLineTechnique(technique) && technique.secondaryWidth !== undefined

        // When the source geometry is split in groups, we
        // should create objects with an array of materials.
        const hasFeatureGroups =
          Expr.isExpr(technique.enabled) &&
          srcGeometry.featureStarts &&
          srcGeometry.featureStarts.length > 0

        const object = buildObject(
          technique,
          bufferGeometry,
          hasFeatureGroups ? [material] : material,
          undefined as unknown as Tile,
          false // elevationEnabled
        )

        object.renderOrder = getPropertyValue(technique.renderOrder, env)
        objects.push(object)
      }
    }

    return objects
  }

  /**
   * Gets the attachments of the given {@link app/arca/datasource-protocol#DecodedTile}.
   *
   * @param decodedTile - The {@link app/arca/datasource-protocol#DecodedTile}.
   */
  private *getAttachments(decodedTile: DecodedTile): Generator<AttachmentInfo> {
    const cache = new AttachmentCache()

    for (const geometry of decodedTile.geometries) {
      // the main attachment

      const mainAttachment: Attachment = {
        index: geometry.index,
        edgeIndex: geometry.edgeIndex,
        uuid: geometry.uuid,
        groups: geometry.groups,
      }

      yield new AttachmentInfo(geometry, mainAttachment, cache)

      if (geometry.attachments) {
        // the additional attachments
        for (const info of geometry.attachments) {
          yield new AttachmentInfo(geometry, info, cache)
        }
      }
    }
  }
}
