import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'
import SockJS from 'sockjs-client'
import { Hud } from '../hud/Hud'

export function MapScreen() {
  useEffect(() => {
    var sock = new SockJS('https://realgame-dev.arcade.city/echo')
    sock.onopen = function () {
      console.log('open')
      sock.send('test')
    }

    sock.onmessage = function (e) {
      console.log('message', e.data)
      sock.close()
    }

    sock.onclose = function () {
      console.log('close')
    }
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
