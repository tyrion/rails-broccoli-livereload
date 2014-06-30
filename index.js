var fs = require('fs')
var sane = require('sane')
var broccoli = require('broccoli')
var Watcher = require('broccoli-sane-watcher')
var tinylr = require('tiny-lr')
var ncp = require('ncp')
var path = require('path')

var port = process.env.LR_PORT || process.env.PORT || 35729
var appRoot = process.env.APP_ROOT || process.cwd()
var brocfile = process.env.BROCFILE || path.join(__dirname, 'Brocfile.js')

console.log('     SRC', __filename)
console.log('    PORT', port)
console.log('APP_ROOT', appRoot)
console.log('BROCFILE', require.resolve(brocfile), '\n')

process.chdir(appRoot)

var railsWatcher = sane(appRoot, [
    'app/views/**/*.+(erb|haml|slim)',
    'app/helpers/**/*.rb',
    'public/**/*.+(css|js|html)',
    'config/locales/**/*.yml',
    '+(app|lib|vendor)/assets/**/*.+(js|html)'
])

railsWatcher.on('change', function(path) {
  console.log('file changed: '+path)
  var files = [/^public/.test(path) ? path.substring(7) : '*']
  server.changed({body: {files: files}})
})

var tree = require(brocfile)
var builder = new broccoli.Builder(tree)

var broccoliWatcher = new Watcher(builder, {verbose: true})
broccoliWatcher.on('change', function(hash) {
  console.log('Build finished in ' + Math.round(hash.totalTime / 1e6) + ' ms')

  ncp(hash.directory, path.join(appRoot, 'public'))
  return hash
})

broccoliWatcher.on('error', function(error) {
  console.log('ERROR', error.message)
})

var server = new tinylr.Server
server.listen(port, function() {
  console.log("Listening on %d", port)
})


process.addListener('exit', function () {
  builder.cleanup()
})
// We register these so the 'exit' handler removing temp dirs is called
process.on('SIGINT', function () {
  process.exit(1)
})
process.on('SIGTERM', function () {
  process.exit(1)
})
