import { Alert, View } from 'react-native'
import { Button, Text, XStack, YStack } from 'tamagui'
import { SheetDemo } from '../home/screen'

export const Hud = () => {
  return (
    <View
      style={{
        position: 'absolute',
        height: '100%',
        width: '100%',
        backgroundColor: 'transparent',
      }}
      pointerEvents="box-none"
    >
      <XStack
        flex={1}
        backgroundColor="transparent"
        flexDirection="column"
        justifyContent="flex-end"
        alignItems="center"
        marginBottom={60}
        pointerEvents="box-none"
      >
        <YStack space="$3" pointerEvents="auto">
          <SheetDemo />
        </YStack>
      </XStack>
    </View>
  )
}
