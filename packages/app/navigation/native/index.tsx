import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { MapScreen } from 'app/features/map/MapScreen'

const Stack = createNativeStackNavigator<{
  map: undefined
}>()

export function NativeNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="map"
        component={MapScreen}
        options={{
          title: 'Map',
        }}
      />
    </Stack.Navigator>
  )
}
