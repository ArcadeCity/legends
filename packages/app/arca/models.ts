export const models = {
  druid: require('../../../apps/expo/assets/models/druid.glb'),
  grass: {
    platform: require('../../../apps/expo/assets/models/grass-platform.glb'),
    tile: require('../../../apps/expo/assets/models/grass-tile.glb'),
  },
  man: require('../../../apps/expo/assets/models/Male_Casual.glb'),
  paladin: {
    model: require('../../../apps/expo/assets/models/paladin.glb'),
    texture: require('../../../apps/expo/assets/models/paladin.png'),
  },
  slime: require('../../../apps/expo/assets/models/Slime.glb'),
}

export type ModelName = keyof typeof models
