module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      '*.js'
    ],

    browsers: ['Firefox'],

    reporters: ['teamcity'],

    plugins: [
      require('../../index'),
      'karma-firefox-launcher',
      'karma-mocha'
    ]
  })
}
