import Realgame from 'app/arca/realgame/Realgame'

export class UI {
  parent: Realgame | null

  constructor() {
    this.parent = null
  }

  setParent(p: Realgame) {
    this.parent = p
  }

  hideOverlay() {
    const overlay = document.getElementById('overlay') as HTMLElement
    const loader = document.getElementById('loader') as HTMLElement
    loader.style.display = 'none'
    overlay.classList.add('our-hidden')
  }
}
