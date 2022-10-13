import {
  Attachment, BufferAttribute, Geometry, getArrayConstructor, InterleavedBufferAttribute
} from 'app/arca/datasource-protocol'
import { getBufferAttribute } from 'app/arca/mapview/DecodedTileHelpers'
import * as THREE from 'three'

export class AttachmentCache {
  readonly bufferAttributes = new Map<BufferAttribute, THREE.BufferAttribute>()

  readonly interleavedAttributes = new Map<
    InterleavedBufferAttribute,
    Array<{ name: string; attribute: THREE.InterleavedBufferAttribute }>
  >()
}

export class AttachmentInfo {
  constructor(
    readonly geometry: Geometry,
    readonly info: Attachment,
    readonly cache: AttachmentCache
  ) {}

  getBufferAttribute(description: BufferAttribute): THREE.BufferAttribute {
    if (this.cache.bufferAttributes.has(description)) {
      return this.cache.bufferAttributes.get(description)!
    }
    const attribute = getBufferAttribute(description)
    this.cache.bufferAttributes.set(description, attribute)
    return attribute
  }

  getInterleavedBufferAttributes(description: InterleavedBufferAttribute) {
    const interleavedAttributes = this.cache.interleavedAttributes.get(description)

    if (interleavedAttributes) {
      return interleavedAttributes
    }

    const ArrayCtor = getArrayConstructor(description.type)
    const buffer = new ArrayCtor(description.buffer)
    const interleavedBuffer = new THREE.InterleavedBuffer(buffer, description.stride)

    const attrs = description.attributes.map((interleavedAttr) => {
      const attribute = new THREE.InterleavedBufferAttribute(
        interleavedBuffer,
        interleavedAttr.itemSize,
        interleavedAttr.offset,
        false
      )
      const name = interleavedAttr.name
      return { name, attribute }
    })

    this.cache.interleavedAttributes.set(description, attrs)
    return attrs
  }
}
