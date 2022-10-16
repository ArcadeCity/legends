import { MapScreen } from 'app/features/map/MapScreen'
import { ValleyScreen } from 'app/features/valley/ValleyScreen'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator<{
  valley: undefined
  map: undefined
}>()

export function NativeNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="valley" component={ValleyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="map" component={MapScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}
