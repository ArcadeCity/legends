import { mercatorProjection, TileKey } from 'app/arca/geoutils'
import { decodeOmv } from 'app/arca/omv/decodeOmv'
import { DecodeInfo } from 'app/arca/vectortile-datasource/DecodeInfo'
import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { tiles, useLocalTile } from './tiles' // decodeOmv,

export const Tile = (props: any) => {
  const omv = useLocalTile(tiles.tile222)
  const { gl, scene } = useThree()
  const [meshes, setMeshes] = useState<any>()

  const doIt = async () => {
    if (!omv) return
    const objects = await decodeOmv(omv, gl)

    // console.log('Got objects:', objects)
    // console.log('Heres one:', objects[0])

    setMeshes(objects)

    // console.log(objects)
    // objects.forEach((object, index) => {
    //   scene.add(object)
    //   console.log('Added:', object)
    //   // if (index === 3) {
    //   //   const obj = object as THREE.Mesh
    //   //   obj.geometry.computeBoundingBox()
    //   //   scene.add(object)
    //   // }
    //   // console.log(object.getWorldPosition(new THREE.Vector3()))
    //   // if (index === 0) {
    //   //   // set the object material to green
    //   //   object.material = new THREE.MeshBasicMaterial({
    //   //     // blue
    //   //     color: 0xff0000,
    //   //     wireframe: true,
    //   //   })
    //   // } else if (index === 1) {
    //   //   // set the object material to green
    //   //   object.material = new THREE.MeshBasicMaterial({
    //   //     // green
    //   //     color: 0x00ff00,
    //   //     wireframe: true,
    //   //   })
    //   // } else if (index === 2) {
    //   //   // set the object material to green
    //   //   object.material = new THREE.MeshBasicMaterial({
    //   //     // green
    //   //     color: 0x0000ff,
    //   //     wireframe: true,
    //   //   })
    //   //   scene.add(object)

    //   // }
    // })
  }

  useEffect(() => {
    if (!omv) return
    // const tileKey = TileKey.fromRowColumnLevel(2, 2, 2)
    // const decodeInfo = new DecodeInfo(mercatorProjection, tileKey, 0)
    // console.log('decodeInfo:', decodeInfo)
    doIt()

    // console.log(decoded.layers.values())
    // console.log(decoded.toJSON())

    // console.log('Center:', decodeInfo.center)
    // console.log(decodeInfo.projectedBoundingBox)
    // console.log(decodeInfo.geoBox)
  }, [omv])

  // For each object in the scene, add it as an object3d inside a mesh
  if (!meshes) return <></>
  // return <></>

  const mesh = meshes[0]
  console.log('WHAT IS THIS:', mesh)
  console.log('object?', mesh.object)

  // return (
  //   <group {...props}>
  //     {meshes.map((mesh, index) => {
  //       console.log('is this a mesh?', mesh)
  //       if (!mesh.object) return <></>
  //       return <primitive key={index} object={mesh.object} position={[0, index, 0]} />
  //     })}
  //   </group>
  // )

  // return (
  //

  //   </group>
  // )

  return (
    <group>
      <primitive object={mesh} position={[0, 0, 2]} />
      <mesh {...props} scale={props.scale ?? 0.3}>
        <meshStandardMaterial color="blue" side={THREE.DoubleSide} />
        <planeGeometry args={[10, 10]} />
      </mesh>
    </group>
  )
}
