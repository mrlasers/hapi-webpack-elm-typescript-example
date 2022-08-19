const { Elm } = require('../client/elm/Main.elm')

Elm.Main.init({
  node: document.getElementById('app'),
})

console.log('hello, world!')
