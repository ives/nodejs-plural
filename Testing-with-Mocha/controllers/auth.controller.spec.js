const assert = require('assert');
const authController = require('./auth.controller');

// Chai
const expect = require('chai').expect;
// Chai - should - must execute here so it adds itself to all obj prototypes
const should = require('chai').should();

const sinon = require('sinon');

// for Chai-as-promised
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
// Mount as middleware
chai.use(chaiAsPromised);
chai.should();


// This global hook will apply to other files too
beforeEach(function() {
  // console.log('GLOBAL BEFORE EACH>');
});
before(function() {
  // console.log('GLOBAL BEFORE>');
});

// Don't use Arrow functions if need to access Context via this.

describe('Auth Controller', function() {

  // beforeEach is a Hook
  beforeEach(function() {
    console.log('BEFORE>');
    authController.setRoles(['user']);
  });
  // use before() for global setups

  describe('isAuthorized', function() {

    // Optional - best to name the beforeEach function 
    // for stack trace info!
    beforeEach('Optional text for readability', function isAuthorizedBefore() {
      console.log('BEFORE isAuthorized>');
    });


    // it.only to ONLY do this one
    // it.skip to EXCLUDE
    it('Should return False if not authorised', function() {

      // Can also skip dynamically inside:
      //  if(ENV var === value) {
      //      this.skip(); }
      const isAuth = authController.isAuthorized('admin');
      // Chai: BDD national language
      expect(isAuth).to.be.false;

      // Chai: should - even better language
      // Appends itself to every Object.prototype
      isAuth.should.be.false;

    });
    it('Should return True if authorised', function() {
      authController.setRoles(['user', 'admin']);
      // Assert: built into Node, clunky
      assert.equal(true, authController.isAuthorized('admin'));
    });

    // Planned = PENDING tests
    it('putting a planned one here');
    it('will implement this later');
    it('should not allow a GET if not authorized');

  });

  // describe.only to ONLY do this one
  // describe.skip to EXCLUDE
  describe('ASYNC isAuthorized', function() {
    // Pass the optional done() to tell Mocha when to judge the evaluation
    // Put it inside the deferred funciton call
    it('ASYNC Should return False if not authorised', function(done) {

      // Access Mocha Context via this - can't be inside arrow FN
      this.timeout(3000);
      authController.isAuthorizedAsync('admin',
        function(isAuth) {
          assert.equal(false, isAuth);
          done();
        });
    });

    it('PROMISE Should return False if not authorised', function() {

      // Access Mocha Context via this - can't be inside arrow FN
      this.timeout(3000);

      // chai-as-promised :
      // should.eventually.be.true
      // to make wait for promise
      authController.isAuthorizedPromise('admin').should.eventually.be.false;
    });

  });

  describe('SINON SPY getIndex', function() {
    it('should render index', function() {

      // Problem: it takes req and res
      const req = {};
      const res = {
        render: sinon.spy()
      };
      // spy() can give us a fake funciton
      // benefit over empty obj is that we can track its execution
      authController.getIndex(req, res);

      res.render.calledOnce.should.be.true;
      res.render.calledTwice.should.be.false;

      // check passed arg values
      res.render.firstCall.args[0].should.equal('index');
      
    });
    
    // Can also sky on existing functions
    // say user obj has method login():

    // sinon.spy(user, 'login')
    // ... run it
    // check:
    // user.login.calledOnce.should.be.true;
  });

  describe('SINON STUB getHome', function() {

    var user = {};
    beforeEach(function() {
      // Re-created each time
      user = {
        roles: ['user'],
        isAuthorized: function (neededRole) {
          return this.roles.indexOf(neededRole) >= 0;
        }
      };
    });

    it('should render index if user is authed', function() {

      // STUBs replace a function and let us control it
      // I don't want user.isAuthorized to matter:
      var isAuth = sinon.stub(user, 'isAuthorized').returns(true);
      // - basically a listener on user Obj we created in beforeEach
      // - completely hijack and replace a function

      const req = {user: user};
      const res = {
        render: sinon.spy()
      };
      authController.homePage(req, res);
      
      // stub
      isAuth.calledOnce.should.be.true;

      // spy
      res.render.calledOnce.should.be.true;
      res.render.calledTwice.should.be.false;

      // check passed arg values
      res.render.firstCall.args[0].should.equal('index');

      // OR INSTEAD - let's MOCK the entire res object:
      var mock = sinon.mock(res);
      
    });

    it('ERROR  CASE - should render index if user is authed', function() {

      // STUBs emulates an error
      var isAuth = sinon.stub(user, 'isAuthorized').throws();
      const req = {user: user};
      const res = {
        render: sinon.spy()
      };
      authController.homePage(req, res);
      isAuth.calledOnce.should.be.true;
      res.render.calledOnce.should.be.true;
      res.render.calledTwice.should.be.false;
      // called with error 
      res.render.firstCall.args[0].should.equal('error');
      
    });   
    
    it('MOCKS should render index if user is authed', function() {

      var isAuth = sinon.stub(user, 'isAuthorized').returns(true);

      const req = {user: user};
      const res = {
        render: function(){}
      };
      // - render: function(){} so we don't spy twice
      
      // Let's MOCK the entire res object:
      var mock = sinon.mock(res);
      mock.expects('render').once().withExactArgs('index');

      authController.homePage(req, res);
      
      // stub - leaving it
      isAuth.calledOnce.should.be.true;
      
      // saves us lots of should statements
      mock.verify();

      
    });
    
  });


});