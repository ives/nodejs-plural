const assert = require('assert');
const should = require('chai').should();

// should can only be included in one test

describe('basic test', () => {
  it('should deal with Objects', () => {
    const obj = {name: 'Ives', gender: 'male'};
    const objB = {name: 'Ives', gender: 'male'};

    obj.should.have.property('name');
    obj.should.have.property('name').equal('Ives');

    // Compare Obj - use deep, else checks if instance of same Obj
    obj.should.deep.equal(objB);
  });


  it('should allow testing null', () => {
    const thisIsNull = null;
    
    // Propblem
    // won't attach should to sth that is null - this will fail
    // thisIsNull.should.not.exist;

    // SOLUTION
    // here explicitly using should as variable
    should.not.exist(thisIsNull);
  });

});