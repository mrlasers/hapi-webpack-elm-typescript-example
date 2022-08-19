import Path from 'path'
import Webpack from 'webpack'
import WebpackDevMiddleware from 'webpack-dev-middleware'
import WebpackHotMiddleware from 'webpack-hot-middleware'

import Boom from '@hapi/boom'
import Hapi from '@hapi/hapi'

import Config, { buildMode } from '../webpack.config'

console.log("SERVER!!!!:", buildMode)

type routeExt = Hapi.RouteExtObject

async function init() {
  const server = Hapi.server({
    port: 8000,
    host: "localhost",
  })

  await server.register([
    { plugin: require("blipp"), options: { showAuth: true } },
  ])

  // API routes
  server.route({
    method: "GET",
    path: "/text",
    handler: (request, h) => {
      return `It's a bunch of text!`
    },
  })

  server.route([
    {
      method: "GET",
      path: "/dogs/{id*}",
      handler: (request, h) => {
        const allDogs = [
          {
            id: 1,
            name: "Kodabears",
            age: 7,
            breed: "Husky Mix",
          },
          {
            id: 1,
            name: "Coral",
            age: 6,
            breed: "Chihuahua Mix",
          },
        ]

        const { id } = request.params

        console.log("/dogs route", id)

        return id
          ? h.response({ dog: "we'll put a dog here" })
          : h.response(allDogs)
      },
    },
  ])

  if (true || buildMode === "production") {
    const path = Path.resolve(__dirname, "../public")
    console.log("adding inert and public route", __dirname, path)
    await server.register(require("@hapi/inert"))

    server.route([
      {
        method: "GET",
        path: "/{file}.{ext}",
        options: {
          files: {
            relativeTo: Path.join(__dirname, "../public"),
          },
        },
        handler: (request, h) => {
          const { file, ext } = request.params

          console.log("/{file}.{ext}:", file, ext)

          switch (ext) {
            default:
              return h.file("../public/index.html")
            case "css":
              return h.file(file + "." + ext).type("text/css")
            case "js":
              return h
                .file(file + "." + ext)
                .type("text/javascript")
                .code(200)
          }
        },
      },
      {
        method: "GET",
        path: "/{any*}",
        options: {
          files: {
            relativeTo: Path.join(__dirname, "../public"),
          },
        },
        handler: (request, h) => {
          return h.file("../public/index.html")
        },
      },
    ])
  }

  if (buildMode === "development") {
    const compiler = Webpack(Config)
    // compiler.apply(new DashboardPlugin())

    const devMiddleware = WebpackDevMiddleware(compiler, {
      publicPath: Config.output.publicPath,
    })
    const hotMiddleware = WebpackHotMiddleware(compiler)

    server.ext({
      type: "onRequest",
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
      type: "onRequest",
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
      type: "onPreResponse",

      method: (request, h) => {
        if (isRequestHandled(request)) return h.continue

        return new Promise((resolve, reject) => {
          const filename = Path.join(compiler.outputPath, "index.html")
          compiler.outputFileSystem.readFile(filename, (err, result) => {
            if (err) {
              return reject(err)
            }

            return resolve(h.response(result).type("text/html"))
          })
        })
      },
    })
  }

  await server.start().catch(console.error)

  console.log(`Server running on ${server.info.uri}...`)
}

init()

function isRequestHandled({ response }: Hapi.Request): boolean {
  if (Boom.isBoom(response)) {
    return response.output.statusCode !== 404
  }

  return response?.statusCode !== 404
}
