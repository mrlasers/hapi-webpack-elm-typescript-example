"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const webpack_dev_middleware_1 = __importDefault(require("webpack-dev-middleware"));
const webpack_hot_middleware_1 = __importDefault(require("webpack-hot-middleware"));
const boom_1 = __importDefault(require("@hapi/boom"));
const hapi_1 = __importDefault(require("@hapi/hapi"));
const webpack_config_1 = __importStar(require("../webpack.config"));
console.log("SERVER!!!!:", webpack_config_1.buildMode);
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const server = hapi_1.default.server({
            port: 8000,
            host: "localhost",
        });
        yield server.register([
            { plugin: require("blipp"), options: { showAuth: true } },
        ]);
        server.route({
            method: "GET",
            path: "/text",
            handler: (request, h) => {
                return `It's a bunch of text!`;
            },
        });
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
                    ];
                    const { id } = request.params;
                    console.log("/dogs route", id);
                    return id
                        ? h.response({ dog: "we'll put a dog here" })
                        : h.response(allDogs);
                },
            },
        ]);
        if (true || webpack_config_1.buildMode === "production") {
            const path = path_1.default.resolve(__dirname, "../public");
            console.log("adding inert and public route", __dirname, path);
            yield server.register(require("@hapi/inert"));
            server.route([
                {
                    method: "GET",
                    path: "/{file}.{ext}",
                    options: {
                        files: {
                            relativeTo: path_1.default.join(__dirname, "../public"),
                        },
                    },
                    handler: (request, h) => {
                        const { file, ext } = request.params;
                        console.log("/{file}.{ext}:", file, ext);
                        switch (ext) {
                            default:
                                return h.file("../public/index.html");
                            case "css":
                                return h.file(file + "." + ext).type("text/css");
                            case "js":
                                return h
                                    .file(file + "." + ext)
                                    .type("text/javascript")
                                    .code(200);
                        }
                    },
                },
                {
                    method: "GET",
                    path: "/{any*}",
                    options: {
                        files: {
                            relativeTo: path_1.default.join(__dirname, "../public"),
                        },
                    },
                    handler: (request, h) => {
                        return h.file("../public/index.html");
                    },
                },
            ]);
        }
        if (webpack_config_1.buildMode === "development") {
            const compiler = (0, webpack_1.default)(webpack_config_1.default);
            const devMiddleware = (0, webpack_dev_middleware_1.default)(compiler, {
                publicPath: webpack_config_1.default.output.publicPath,
            });
            const hotMiddleware = (0, webpack_hot_middleware_1.default)(compiler);
            server.ext({
                type: "onRequest",
                method: (request, h) => {
                    return new Promise((resolve, reject) => {
                        devMiddleware(request.raw.req, request.raw.res, (err) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve(h.continue);
                        });
                    });
                },
            });
            server.ext({
                type: "onRequest",
                method: (request, h) => {
                    return new Promise((resolve, reject) => {
                        hotMiddleware(request.raw.req, request.raw.res, (err) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve(h.continue);
                        });
                    });
                },
            });
            server.ext({
                type: "onPreResponse",
                method: (request, h) => {
                    if (isRequestHandled(request))
                        return h.continue;
                    return new Promise((resolve, reject) => {
                        const filename = path_1.default.join(compiler.outputPath, "index.html");
                        compiler.outputFileSystem.readFile(filename, (err, result) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve(h.response(result).type("text/html"));
                        });
                    });
                },
            });
        }
        yield server.start().catch(console.error);
        console.log(`Server running on ${server.info.uri}...`);
    });
}
init();
function isRequestHandled({ response }) {
    if (boom_1.default.isBoom(response)) {
        return response.output.statusCode !== 404;
    }
    return (response === null || response === void 0 ? void 0 : response.statusCode) !== 404;
}
//# sourceMappingURL=server.js.map