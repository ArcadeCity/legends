export const images = {
  bitcoin: require('../../../apps/expo/assets/images/bitcoin.png'),
  druid: require('../../../apps/expo/assets/models/druid.png'),
  skybox: {
    negx: require('../../../apps/expo/assets/images/terrain/space-negx.jpg'),
    negy: require('../../../apps/expo/assets/images/terrain/space-negy.jpg'),
    negz: require('../../../apps/expo/assets/images/terrain/space-negz.jpg'),
    posx: require('../../../apps/expo/assets/images/terrain/space-posx.jpg'),
    posy: require('../../../apps/expo/assets/images/terrain/space-posy.jpg'),
    posz: require('../../../apps/expo/assets/images/terrain/space-posz.jpg'),
  },
}

export type ImageName = keyof typeof images
