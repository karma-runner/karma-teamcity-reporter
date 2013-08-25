module.exports = (grunt) ->
  grunt.initConfig
    pkgFile: 'package.json'

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
          'test/*.coffee'
        ]

    'npm-contributors':
      options:
        commitMessage: 'chore: update contributors'

    bump:
      options:
        commitMessage: 'chore: release v%VERSION%'
        pushTo: 'upstream'


  grunt.loadNpmTasks 'grunt-simple-mocha'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-npm'
  grunt.loadNpmTasks 'grunt-bump'
  grunt.loadNpmTasks 'grunt-auto-release'

  grunt.registerTask 'test', ['simplemocha']
  grunt.registerTask 'default', ['jshint', 'simplemocha']
  grunt.registerTask 'release', 'Bump the version and publish to NPM.', (type) ->
    grunt.task.run [
      'npm-contributors',
      "bump:#{type||'patch'}",
      'npm-publish'
    ]
