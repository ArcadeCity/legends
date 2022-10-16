import { StyleSheet, Text, View } from 'react-native'
import { monofont } from './Hud'

export const QuestComplete = () => {
  return (
    <View
      style={{
        position: 'absolute',
        flex: 1,
        justifyContent: 'center',
        zIndex: 9992,
        alignItems: 'center',
        top: 0,
        left: 0,
        right: 0,
        bottom: -600,
      }}
    >
      <Text style={{ ...styles.hudText, fontSize: 30, fontWeight: '700', letterSpacing: 2 }}>
        QUEST COMPLETE!
      </Text>
      <Text style={{ ...styles.hudText, fontSize: 24, marginTop: 10 }}>You earned 100 sats</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9990,
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
  },
  hudItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 10,
  },
  hudText: {
    color: 'white',
    fontSize: 20,
    fontFamily: monofont,
  },
})
