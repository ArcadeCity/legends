import { sockTest } from 'app/features/map/sockTest'
import { useEffect } from 'react'

export default function SockTest() {
  useEffect(() => {
    sockTest()
  }, [])
  return <p>sock test</p>
}
