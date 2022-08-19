import Path from 'path'
import Webpack from 'webpack'
import WebpackDevMiddleware from 'webpack-dev-middleware'
import WebpackHotMiddleware from 'webpack-hot-middleware'

import Hapi from '@hapi/hapi'

import * as Config from '../webpack.config'

const host = 'localhost'
const port = 666
const compiler = Webpack(Config.devConfig)
// compiler.apply(new DashboardPlugin())

const devMiddleware = WebpackDevMiddleware(compiler, {
  publicPath: Config.devConfig.output.publicPath,
})
const hotMiddleware = WebpackHotMiddleware(compiler)

async function init() {
  const server = Hapi.server({
    port: 8666,
    host: 'localhost',
  })

  server.ext({
    type: 'onRequest',
    method: (request, h) => {
      return new Promise((resolve, reject) => {
        devMiddleware(request.raw.req, request.raw.res, (err) => {
          if (err) {
            return reject(err)
          }
          return resolve(h.continue)
        })
      })
    },
  })

  server.ext({
    type: 'onRequest',
    method: (request, h) => {
      return new Promise((resolve, reject) => {
        hotMiddleware(request.raw.req, request.raw.res, (err) => {
          if (err) {
            return reject(err)
          }

          return resolve(h.continue)
        })
      })
    },
  })

  server.ext({
    type: 'onPreResponse',
    method: (request, h) => {
      return new Promise((resolve, reject) => {
        devMiddleware(request.raw.req, request.raw.res, (err) => {
          if (err) {
            return reject('fucking shit')
          }

          return resolve(h.redirect('/'))
        })
      })
    },
  })

  // server.ext({
  //   type: 'onRequest',
  //   method: function (request, h) {
  //     const result = devMiddleware(request.raw.req, request.raw.res, (err) => {
  //       console.log('webpack dev middleware')

  //       if (err) {
  //         console.error('webpack dev middleware error')
  //         return h.response('oops')
  //       }

  //       return h.continue
  //     })

  //     return 'onRequest handler returned this'
  //   },
  // })

  // server.ext('onPreResponse', (request, h) => {
  //   const response = new Promise((resolve, reject) => {
  //     const filename = Path.join(compiler.outputPath, 'index.html')
  //     return compiler.outputFileSystem.readFile(filename, (err, result) => {
  //       if (err) {
  //         return reject('oops, error')
  //       }

  //       // const response = h.response(result).header('content-type', 'text/html')

  //       // return resolve(response)

  //       // return resolve(h.response('result').type('text/html'))
  //     })
  //   })

  //   // return h
  //   //   .response('<p>fuck you, bitch</p>')
  //   //   .header('cache-contorl', 'no-cache')
  //   //   .type('text/html')

  //   return h.continue
  // })

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return 'hi'
    },
  })

  await server.start()

  console.log(`Server running on ${server.info.uri}...`)
}

init()
