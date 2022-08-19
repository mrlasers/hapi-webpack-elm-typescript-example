import Path from 'path'
import Webpack from 'webpack'
import WebpackDevMiddleware from 'webpack-dev-middleware'
import WebpackHotMiddleware from 'webpack-hot-middleware'

import Hapi from '@hapi/hapi'

import Config, { buildMode } from '../webpack.config'

console.log('SERVER!!!!:', buildMode)

async function init() {
  const server = Hapi.server({
    port: 8000,
    host: 'localhost',
  })

  await server.register([
    { plugin: require('blipp'), options: { showAuth: true } },
  ])

  if (buildMode === 'production') {
    const path = Path.resolve(__dirname, '../public')
    console.log('adding inert and public route', __dirname, path)
    await server.register(require('@hapi/inert'))

    server.route([
      // {
      //   method: 'GET',
      //   path: '/{file}.js',

      //   handler: {
      //     directory: {
      //       path: Path.join(__dirname, '../public'),
      //     },
      //   },
      // },
      {
        method: 'GET',
        path: '/{file*}',
        options: {
          files: {
            relativeTo: Path.join(__dirname, '../public'),
          },
        },
        handler: (request, h) => {
          const { file } = request.params
          return !!file.match(/\.(js|css)$/)
            ? h.file(`../public/${file}`)
            : h.file('../public/index.html')
        },
      },
    ])
  }

  if (buildMode === 'development') {
    const compiler = Webpack(Config)
    // compiler.apply(new DashboardPlugin())

    const devMiddleware = WebpackDevMiddleware(compiler, {
      publicPath: Config.output.publicPath,
    })
    const hotMiddleware = WebpackHotMiddleware(compiler)

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
          const filename = Path.join(compiler.outputPath, 'index.html')
          compiler.outputFileSystem.readFile(filename, (err, result) => {
            if (err) {
              return reject(err)
            }

            return resolve(h.response(result).type('text/html'))
          })
        })
      },
    })
  }

  // server.route({
  //   method: 'GET',
  //   path: '/',
  //   handler: (request, h) => {
  //     return 'hi'
  //   },
  // })

  await server.start()

  console.log(`Server running on ${server.info.uri}...`)
}

init()
