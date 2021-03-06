'use strict'

var fs = require('fs')
var path = require('path')
var pkg = require('../package.json')
var reactScriptsConfigDirname = path.resolve(__dirname, '..', '..', 'react-scripts-ts', 'config').replace(/\\/g, '/')
var log = function log (msg) { console.log('[' + pkg.name + '] ' + msg) }

function transformContent (wpConfigContentBuffer, userWebpackTransformerFilename) {
  var content = wpConfigContentBuffer.toString()
  if (content.match(userWebpackTransformerFilename)) return content
  return content
  .replace(/;/g, '')
  .replace(/(module\.exports\s*=)\s*([\S\s]*)/g, '$1 require("' + userWebpackTransformerFilename + '")($2)')
}

module.exports = function addRuntimeWebpackTransform (userWebpackTransformerFilename) {
  log('applying react-scripts webpack modification hooks')
  ;['webpack.config.dev.js', 'webpack.config.prod.js']
  .map(function getConfigFilenames (basename) { return path.resolve(reactScriptsConfigDirname, basename).replace(/\\/g, '/') })
  .map(function getConfigFileContents (filename) { return { filename, contentBuffer: fs.readFileSync(filename) } })
  .map(function transformConfigFileContent (meta) { return Object.assign(meta, { transformedContent: transformContent(meta.contentBuffer, userWebpackTransformerFilename) }) })
  .forEach(function persistTransformedConfig (meta) { return fs.writeFileSync(meta.filename, meta.transformedContent) })
}
