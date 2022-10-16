import { Character } from 'app/arca/characters/Character'
import * as Utils from 'app/arca/core/FunctionLibrary'
import { World } from 'app/arca/world/World'
import useStore, { setState } from 'app/features/grid/store'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'

// import { CharacterSpawnPoint } from '@/sketchbook/ts/world/CharacterSpawnPoint'

export const SpawnPoint = () => {
  const [player, setPlayer] = useState<Character | null>(null)

  const world = useStore((state) => state.world) as World

  const { scene } = useThree()

  const ref = useRef<any>()
  useEffect(() => {
    if (ref.current) {
      setState({ spawnPoint: ref.current })

      // const csp = new CharacterSpawnPoint(ref.current)
      // console.log(csp)
    }
  }, [ref])

  const gltf = useGLTF('/build/assets/Male_Casual.glb')
  // const gltf = useGLTF('/build/assets/boxman.glb')
  useEffect(() => {
    console.log('world:', world)
    if (!world || !scene || !ref || !ref.current) return
    const character = new Character(gltf)
    let worldPos = new THREE.Vector3()
    ref.current.getWorldPosition(worldPos)
    character.setPosition(worldPos.x, worldPos.y + 0.5, worldPos.z)
    let forward = Utils.getForward(ref.current)
    character.setOrientation(forward, true)
    scene.add(character)
    world.add(character)

    character.takeControl()
    setPlayer(character)
  }, [gltf, ref, scene, world])

  useFrame((_, delta) => {
    if (!player || !world) return
    // player.update(delta)
    world.update(delta, delta)
  })

  return (
    <group ref={ref} position={[1.5, 50, -11]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]} scale={[2, 0.05, 2]} castShadow receiveShadow>
        <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
        <meshStandardMaterial attach="material" color="blue" />
      </mesh>
    </group>
  )
}
