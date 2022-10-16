import create from 'zustand'
import shallow from 'zustand/shallow'

const useStoreImpl = create(() => {
  return {
    router: null,
    dom: null,
    ready: false,
    loadedWizard: false,
    loadedSkybox: false,
    loadedEffects: false,
    showLoginQR: false,
    showWithdrawQR: true,
    pubkey: null,
    walletUrl: null,
    walletBalance: 0,
    treasuryBalance: 0,
    spawnPoint: null,
    world: null,
  }
})

const useStore = (sel) => useStoreImpl(sel, shallow)
Object.assign(useStore, useStoreImpl)

const { getState, setState } = useStoreImpl

export { getState, setState }
export default useStore
