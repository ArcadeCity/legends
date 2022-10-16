import SockJS from 'sockjs-client'

export const sockTest = () => {
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
}
