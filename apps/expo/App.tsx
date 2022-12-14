import 'expo-dev-client'
import React from 'react'
import { NativeNavigation } from 'app/navigation/native'
import { Provider } from 'app/provider'
import { useFonts } from 'expo-font'
import { useExpoUpdates } from './lib/useExpoUpdates'
import { StatusBar } from 'expo-status-bar'

export default function App() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useExpoUpdates(3)

  if (!loaded) {
    return null
  }

  return (
    <Provider>
      <NativeNavigation />
      <StatusBar style="light" />
    </Provider>
  )
}
