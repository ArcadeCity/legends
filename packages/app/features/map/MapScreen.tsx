import { StyleSheet, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { Hud } from '../hud/Hud'

export function MapScreen() {
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
