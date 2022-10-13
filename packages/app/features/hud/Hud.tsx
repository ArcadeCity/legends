import { View } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

export const Hud = () => (
  <View
    style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: 'transparent' }}
  >
    <XStack
      flex={1}
      flexWrap="wrap"
      backgroundColor="transparent"
      // hoverStyle={{
      //   backgroundColor: 'transparent',
      // }}
      // media query
      $gtSm={{
        flexDirection: 'column',
        flexWrap: 'nowrap',
      }}
    >
      <YStack space="$3">
        <Text color="white">Hello</Text>

        <Text color="white">World</Text>
      </YStack>
    </XStack>
  </View>
)
