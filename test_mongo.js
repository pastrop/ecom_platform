var chai = require('chai');
var chaiHttp = require('chai-http');

global.environment = 'test';
var server = require('./server_mongo.js');
var Item = require('./models/item');
var seed = require('./db/seed');

var should = chai.should();
var app = server.app;

chai.use(chaiHttp);

describe('Shopping List', function() {
    before(function(done) {
        seed.run(function() {
            done();
        });
    });  // describe end

    it('should list items on GET', function(done) {
        chai.request(app)
            .get('/items')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.length(3);
                res.body[0].should.be.a('object');
                res.body[0].should.have.property('_id');
                res.body[0].should.have.property('name');
                res.body[0]._id.should.be.a('string');
                res.body[0].name.should.be.a('string');
                res.body[0].name.should.equal('Broad beans');
                res.body[1].name.should.equal('Tomatoes');
                res.body[2].name.should.equal('Peppers');               
                done();
            });
        }); // end to IT block



/*    it('should delete an item on delete', function(done){
     chai.request(app)
       .get('/items') //GET call to get item to DELETE
       .end(function(err, res) {
       var items = res.body;
       var itemName = items[0].name; 

        chai.request(app)
            .delete('/items/'+items[0]._id)
            .end(function(err,res){
                res.should.have.status(204);
                done();
        });
     });
    }); //end of IT block */



    after(function(done) {
        Item.remove(function() {
            done();
        });
    });
});//GET Test is DONE

describe('Post request test - Banana Man....', function() {
    before(function(done) {
        seed.run_banana(function() {
            done();
        });
    });
    it('should add an item on post', function(done){
        chai.request(app)
            .post('/items')
            .send({name:'banana'})
            .end(function(err,res){
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('_id');
                res.body.should.have.property('name');
                res.body.name.should.be.equal('banana');                 
//                res.body.id.should.be.equal(3);
                done();
            })

    }); // It Block ends

    it('should delete item being POSTed on delete', function(done){
        chai.request(app)
        .get('/items')
        .end(function(err,res){
        var id = res.body[0]._id;
        console.log('test_mongo '+JSON.stringify(res.body));
        chai.request(app)
            .delete('/items/'+id)
            .end(function(err,res){
                res.should.have.status(204);
                done();
            });
        });
    }); 

        after(function(done) {
        Item.remove(function() {
            done();
        });
    });
});  // POST&DELETE Tests are done

describe('PUT Endpoint - Modify Your Banana Man....', function() {
    before(function(done) {
        seed.run_banana(function() {
            done();
        });
    });
    it('should add an item on post', function(done){
        chai.request(app)
            .post('/items')
            .send({name:'banana'})
            .end(function(err,res){
                res.should.have.status(201);
                done();
            })

    }); // It Block ends

    it('Should Modify item being POSTed on PUT', function(done){
        chai.request(app)
        .get('/items')
        .end(function(err,res){
        var id = res.body[0]._id;
        console.log('test_mongo PUT'+JSON.stringify(res.body));
        console.log('test_mongo PUT id:'+id);
        chai.request(app)
            .put('/items/'+id)
            .send({name:'Papaya', id: id})
            .end(function(err,res){
                res.should.have.status(204);
                done();
            });
        });
    }); 

        after(function(done) {
        Item.remove(function() {
            done();
        });
    });
});    