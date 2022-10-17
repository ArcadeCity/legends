import { sockTest } from 'app/features/map/sockTest'
import { MultiplayerDemo } from 'app/features/multiplayer/MultiplayerDemo'
import { useEffect } from 'react'

export default function Multi() {
  useEffect(() => {
    sockTest()
  }, [])
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <MultiplayerDemo />
    </div>
  )
}
