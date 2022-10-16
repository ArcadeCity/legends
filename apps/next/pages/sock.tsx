import { useEffect } from 'react'
import SockJS from 'sockjs-client'

export default function SockTest() {
  useEffect(() => {
    var sock = new SockJS('http://realgame-dev.us-east-1.elasticbeanstalk.com/echo')
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
  return <p>sock test</p>
}