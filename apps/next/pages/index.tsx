import Realgame from 'app/arca/realgame/Realgame'
import { Hud } from 'app/features/hud/Hud'
import { useEffect } from 'react'

const Page = () => {
  useEffect(() => {
    const canvasElement = document.getElementById('realgame') as HTMLCanvasElement
    const realgame = new Realgame(canvasElement)
  }, [])
  return (
    <>
      <Hud />
      <canvas id="realgame" className="h-screen w-screen"></canvas>
      <div id="overlay">
        <div className="center">
          <div id="loader" className="lds-ripple">
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page

export async function getStaticProps() {
  return {
    props: {
      title: 'Arcade City',
    },
  }
}
