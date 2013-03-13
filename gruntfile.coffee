module.exports = (grunt) ->
  grunt.initConfig
    jshint:
      all: ['index.js']
      options:
        jshintrc: '.jshintrc'
    simplemocha:
      options:
        ui: 'bdd'
        reporter: 'dot'
      unit:
        src: [
          'test/*.js'
        ]


  grunt.loadNpmTasks 'grunt-simple-mocha'
  grunt.loadNpmTasks 'grunt-contrib-jshint'

  grunt.registerTask 'default', ['jshint', 'simplemocha']
