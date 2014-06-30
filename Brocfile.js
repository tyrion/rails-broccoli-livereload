var compileSass = require('broccoli-sass')
var sassHelpers = require('broccoli-sass-helpers')

var paths = ['vendor/assets/stylesheets', 'app/assets/stylesheets']

var appCss = sassHelpers('app/assets/stylesheets', {
  files: ['application.scss']
})
var styles = compileSass([appCss].concat(paths),
    '/application.scss',
    'assets/application.css');

module.exports = styles
