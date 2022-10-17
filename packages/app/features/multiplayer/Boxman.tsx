import React, { useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'

const path = '/build/assets/boxman.glb'

export function Boxman(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF(path)
  const { actions } = useAnimations(animations, group)
  if (!nodes || !nodes.game_man) return <></>
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" scale={0.38}>
          <primitive object={nodes.root} />
          <skinnedMesh
            name="game_man"
            geometry={nodes.game_man.geometry}
            material={materials.Boxman}
            skeleton={nodes.game_man.skeleton}
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(path)
