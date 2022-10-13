import { com } from 'app/arca/vectortile-datasource/adapters/omv/proto/vector_tile'
import { Buffer } from 'buffer'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

export const decodeOmv = (omv: any) => {
  const payload = new Uint8Array(omv)
  const proto = com.mapbox.pb.Tile.decode(payload)
  return proto
}

export const tiles = {
  tile222: require('./tile222.omv'),
}

export const useLocalTile = (tile: any) => {
  const [asset, error] = useAssets([tile])
  const [blob, setBlob] = useState<Buffer | null>(null)
  useEffect(() => {
    ;(async () => {
      if (!asset) return

      if (Platform.OS === 'web') {
        console.log('lets try loading on web')

        await asset[0].downloadAsync()

        const assetArraybuffer = await rnget(asset[0].localUri)
        // const wat = await fetch(asset[0].localUri)
        console.log(assetArraybuffer)
        setBlob(assetArraybuffer)

        // const thisiswhat = tiles.tile222
        // console.log(asset[0])
      } else {
        const info = await FileSystem.readAsStringAsync(asset[0].localUri as string, {
          encoding: FileSystem.EncodingType.Base64,
        })
        const buff = Buffer.from(info, 'base64')
        setBlob(buff)
      }
    })()
  }, [asset])

  return blob
}

function rnget(url) {
  return new Promise((accept, reject) => {
    var req = new XMLHttpRequest()
    req.open('GET', url, true)
    req.responseType = 'arraybuffer'

    req.onload = function (event) {
      var resp = req.response
      if (resp) {
        accept(resp)
      }
    }

    req.send(null)
  })
}
