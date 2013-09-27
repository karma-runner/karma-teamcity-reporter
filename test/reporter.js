var chai = require('chai');
var should = require('chai').should();
var sinon = require("sinon");
var sinonaChai = require("sinon-chai");
var TeamCityReporter = require('./../index')['reporter:teamcity'][1];

chai.use(sinonaChai);

describe('TeamCity reporter', function(){
  var reporter;
  var mosaic = {id: 'id', name: "Mosaic"};

  beforeEach(function(done){
    reporter = new TeamCityReporter(function(instance){
      instance.write = sinon.spy();
    });
    done();
  });

  it('should not produce messages without browsers', function(done){
    reporter.onRunStart([]);
    reporter.onRunComplete([]);
    reporter.write.should.not.been.called;
    done();
  });

  it('should produce messages without tests', function(done){
    reporter.onRunStart([mosaic]);
    reporter.onRunComplete([]);
    reporter.write.should.have.been.calledWith('##teamcity[blockOpened name=\'Mosaic\']\n');
    reporter.write.should.have.been.calledWith('##teamcity[blockClosed name=\'Mosaic\']\n');
    done();
  });

  it('should produce messages with one test', function(done){
    reporter.onRunStart([mosaic]);
    reporter.specSuccess(mosaic, {description: 'SampleTest', time: 2, suite: ['Suite 1']});
    reporter.onRunComplete([]);
    reporter.write.should.have.been.calledWith('##teamcity[blockOpened name=\'Mosaic\']\n');
    reporter.write.should.have.been.calledWith('##teamcity[blockClosed name=\'Mosaic\']\n');
    reporter.write.should.have.been.calledWith('##teamcity[testSuiteStarted name=\'Suite 1.Mosaic\']\n\
##teamcity[testStarted name=\'SampleTest\']\n\
##teamcity[testFinished name=\'SampleTest\' duration=\'2\']\n\
##teamcity[testSuiteFinished name=\'Suite 1.Mosaic\']\n');
    done();
  });

});
