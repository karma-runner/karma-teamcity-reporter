var chai = require('chai')
var expect = require('chai').expect
var sinon = require('sinon')
var clock
chai.use(require('sinon-chai'))

var TeamCityReporter = require('./../index')['reporter:teamcity'][1]

describe('TeamCity reporter', function () {
  var reporter
  var mosaic = {id: 'id', name: 'Mosaic'}

  beforeEach(function () {
    reporter = new TeamCityReporter(function (instance) {
      instance.write = sinon.spy()
    })
    clock = sinon.useFakeTimers(new Date(2050, 9, 1, 0, 0, 0, 0).getTime())
  })

  afterEach(function () {
    clock.restore()
  })

  it('should produce 2 standard messages without browsers', function () {
    reporter.onRunStart([])
    reporter.onRunComplete([])
    expect(reporter.write).to.have.been.calledWith("##teamcity[blockOpened name='JavaScript Unit Tests' flowId='']\n")
    expect(reporter.write).to.have.been.calledWith("##teamcity[blockClosed name='JavaScript Unit Tests' flowId='']\n")
  })

  it('should produce 2 standard messages without tests', function () {
    reporter.onRunStart([mosaic])
    reporter.onRunComplete([])
    expect(reporter.write).to.have.been.calledWith("##teamcity[blockOpened name='JavaScript Unit Tests' flowId='']\n")
    expect(reporter.write).to.have.been.calledWith("##teamcity[blockClosed name='JavaScript Unit Tests' flowId='']\n")
  })

  it('should produce messages with one test', function () {
    reporter.onRunStart([mosaic])
    reporter.specSuccess(mosaic, {description: 'SampleTest', time: 2, suite: ['Suite 1']})
    reporter.onRunComplete([])
    expect(reporter.write).to.have.been.calledWith("##teamcity[blockOpened name='JavaScript Unit Tests' flowId='']\n")
    expect(reporter.write).to.have.been.calledWith("##teamcity[blockClosed name='JavaScript Unit Tests' flowId='']\n")
    expect(reporter.write).to.have.been.calledWith(
      "##teamcity[testSuiteStarted name='Suite 1.Mosaic' flowId='karmaTC-1448140806id']\n"
    )
    expect(reporter.write).to.have.been.calledWith(
      "##teamcity[testStarted name='SampleTest' flowId='karmaTC-1448140806id']\n"
    )
    expect(reporter.write).to.have.been.calledWith(
      "##teamcity[testFinished name='SampleTest' duration='2' flowId='karmaTC-1448140806id']\n"
    )
    expect(reporter.write).to.have.been.calledWith(
      "##teamcity[testSuiteFinished name='Suite 1.Mosaic' flowId='karmaTC-1448140806id']\n"
    )
  })
})
