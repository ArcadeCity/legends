import { useEffect } from 'react'

export const ArcaMapScreen = () => {
  useEffect(() => {
    console.log(helloWorld())
    // console.log(MapView)
    const mapview = new MapView()
    console.log(mapview)
    // console.log(helloWorld())
  }, [])

  return (
    <canvas id="realgame" style={{ height: '100vh', width: '100vw', backgroundColor: 'green' }} />
  )
}
