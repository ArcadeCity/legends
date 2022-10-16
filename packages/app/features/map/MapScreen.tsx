import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import { Hud } from '../hud/Hud'
import { sockTest } from './sockTest'

export function MapScreen() {
  useEffect(() => {
    sockTest()
  }, [])
  return (
    <>
      <WebView style={styles.container} source={{ uri: 'https://vmap.arcade.city' }} />
      <Hud />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
