var util = require('util')

var escapeMessage = function (message) {
  if (message === null || message === undefined) {
    return ''
  }

  return message.toString()
    .replace(/\|/g, '||')
    .replace(/'/g, "|'")
    .replace(/\n/g, '|n')
    .replace(/\r/g, '|r')
    .replace(/\u0085/g, '|x')
    .replace(/\u2028/g, '|l')
    .replace(/\u2029/g, '|p')
    .replace(/\[/g, '|[')
    .replace(/\]/g, '|]')
}

var hashString = function (s) {
  var hash = 0
  var i
  var chr
  var len

  if (s === 0) return hash
  for (i = 0, len = s.length; i < len; i++) {
    chr = s.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return hash
}

var formatMessage = function () {
  var args = Array.prototype.slice.call(arguments)

  for (var i = args.length - 1; i > 0; i--) {
    args[i] = escapeMessage(args[i])
  }

  return util.format.apply(null, args) + '\n'
}

var TeamcityReporter = function (baseReporterDecorator) {
  baseReporterDecorator(this)
  var self = this

  this.TEST_IGNORED = "##teamcity[testIgnored name='%s' flowId='']"
  this.SUITE_START = "##teamcity[testSuiteStarted name='%s' flowId='']"
  this.SUITE_END = "##teamcity[testSuiteFinished name='%s' flowId='']"
  this.TEST_START = "##teamcity[testStarted name='%s' flowId='']"
  this.TEST_FAILED = "##teamcity[testFailed name='%s' message='FAILED' details='%s' flowId='']"
  this.TEST_END = "##teamcity[testFinished name='%s' duration='%s' flowId='']"
  this.BLOCK_OPENED = "##teamcity[blockOpened name='%s' flowId='']"
  this.BLOCK_CLOSED = "##teamcity[blockClosed name='%s' flowId='']"

  var reporter = this
  var initializeBrowser = function (browser) {
    reporter.browserResults[browser.id] = {
      name: browser.name,
      log: [],
      lastSuite: null,
      flowId: 'karmaTC' + hashString(browser.name + ((new Date()).getTime())) + browser.id
    }
  }

  this.onRunStart = function (browsers) {
    this.write(formatMessage(this.BLOCK_OPENED, 'JavaScript Unit Tests'))

    this.browserResults = {}
    // Support Karma 0.10 (TODO: remove)
    browsers.forEach(initializeBrowser)
  }

  this.onBrowserStart = function (browser) {
    initializeBrowser(browser)
  }

  this.specSuccess = function (browser, result) {
    var log = this.getLog(browser, result)
    var testName = result.description

    log.push(formatMessage(this.TEST_START, testName))
    log.push(formatMessage(this.TEST_END, testName, result.time))
  }

  this.specFailure = function (browser, result) {
    var log = this.getLog(browser, result)
    var testName = result.description

    log.push(formatMessage(this.TEST_START, testName))
    log.push(formatMessage(this.TEST_FAILED, testName, result.log.join('\n\n')))
    log.push(formatMessage(this.TEST_END, testName, result.time))
  }

  this.specSkipped = function (browser, result) {
    var log = this.getLog(browser, result)
    var testName = result.description

    log.push(formatMessage(this.TEST_IGNORED, testName))
  }

  this.onRunComplete = function () {
    Object.keys(this.browserResults).forEach(function (browserId) {
      var browserResult = self.browserResults[browserId]
      var log = browserResult.log
      if (browserResult.lastSuite) {
        log.push(formatMessage(self.SUITE_END, browserResult.lastSuite))
      }

      self.flushLogs(browserResult)
    })
    self.write(formatMessage(self.BLOCK_CLOSED, 'JavaScript Unit Tests'))
  }

  this.getLog = function (browser, result) {
    var browserResult = this.browserResults[browser.id]
    var suiteName = browser.name
    var moduleName = result.suite.join(' ')

    if (moduleName) {
      suiteName = moduleName.concat('.', suiteName)
    }

    var log = browserResult.log
    if (browserResult.lastSuite !== suiteName) {
      if (browserResult.lastSuite) {
        log.push(formatMessage(this.SUITE_END, browserResult.lastSuite))
      }
      this.flushLogs(browserResult)
      browserResult.lastSuite = suiteName
      log.push(formatMessage(this.SUITE_START, suiteName))
    }
    return log
  }

  this.flushLogs = function (browserResult) {
    while (browserResult.log.length > 0) {
      var line = browserResult.log.shift()
      line = line.replace("flowId=''", "flowId='" + browserResult.flowId + "'")

      self.write(line)
      if (browserResult.log.length > 0) {
        self.write(' ')
      }
    }
  }
}

TeamcityReporter.$inject = ['baseReporterDecorator']

module.exports = {
  'reporter:teamcity': ['type', TeamcityReporter]
}
