module.exports = function (grunt) {
  grunt.initConfig({
    pkgFile: 'package.json',
    simplemocha: {
      options: {
        ui: 'bdd',
        reporter: 'dot'
      },
      unit: {
        src: [
          'test/*.spec.js'
        ]
      }
    },
    karma: {
      options: {
        singleRun: true
      },
      simple: {
        configFile: 'examples/simple/karma.conf.js'
      }
    },
    'npm-contributors': {
      options: {
        commitMessage: 'chore: update contributors'
      }
    },
    bump: {
      options: {
        commitMessage: 'chore: release v%VERSION%',
        pushTo: 'upstream',
        commitFiles: [
          'package.json',
          'CHANGELOG.md'
        ]
      }
    },
    eslint: {
      target: [
        'index.js',
        'gruntfile.js',
        'test/*.js',
        'examples/**/karma.conf.js',
        'examples/**/*.spec.js'
      ]
    }
  })

  require('load-grunt-tasks')(grunt)

  grunt.registerTask('test', ['simplemocha', 'karma'])
  grunt.registerTask('default', ['eslint', 'test'])

  grunt.registerTask('release', 'Bump the version and publish to NPM.', function (type) {
    grunt.task.run([
      'npm-contributors',
      'bump-only:' + (type || 'patch'),
      'changelog',
      'bump-commit',
      'npm-publish'
    ])
  })
}
