const chai = require('chai');
const expect = require('chai').expect;
chai.use(require('chai-http'));
chai.use(require('chai-json-schema-ajv'))
const apiAddress = "http://localhost:4000";
const server = require('../server');
const exampleJsonSchema = require('./schemas/users.json');
const userCreatedSchema = require('./schemas/userCreated.json');
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoyLCJlbWFpbCI6ImpvaG5AbWFpbC5jb20ifSwiaWF0IjoxNjEzNTU2MTMxLCJleHAiOjE2MTM2NDI1MzF9.JxPHJdtoIwX5yjOcMuxm43aePLrWfmpVWzDWB97hzAg'

describe('Demonstration of tests', function() {
    before(function () {
      // start the server
      server.start();
      
    });
  
    after(function () {
      // close the server
      server.close();
    })

    describe('Testing route GET /', function() {

        it('Should return successfull response', async function() {
    
          // prepare http request
          // send the request to our server
          await chai.request(apiAddress).get('/')
            .then(response => {
              expect(response).to.have.status(200);
            })
            .catch(error => {
              throw error;
            })
        })
      })

describe('User registration tests (Route POST /register)', function() {
    it('should reject (status 400) the request if fields are missing', async function() {
      await chai.request(apiAddress)
        .post('/register')
        .send({
          username: "foo",
          password: "bar",
          email: "test@example.com"
        })
        .then(response => {
          expect(response.status).to.equal(400);
        })
        .catch(error => {
          throw error
        });

      await chai.request(apiAddress)
        .post('/register')
        .send({
          password: "foo",
          email: "test@example.com"
        })
        .then(response => {
          expect(response.status).to.equal(400);
        })
        .catch(error => {
          throw error
        });
        
        await chai.request(apiAddress)
        .post('/register')
        .send({
          username: "foo",
          password: "foo"
        })
        .then(response => {
          expect(response.status).to.equal(400);
        })
        .catch(error => {
          throw error
        });
    });

    it('should reject (status 400) the request if username is empty', async function() {
      await chai.request(apiAddress)
        .post('/register')
        .send({
          username: "",
          password: "foo",
          email: "test@example.com"
        })
        .then(response => {
          expect(response.status).to.equal(400);
        })
        .catch(error => {
          throw error
        });
    });
    it('should reject (status 400) the request if password is too short(6 chars)', async function() {
      await chai.request(apiAddress)
        .post('/register')
        .send({
          username: "foobar",
          password: "123",
          email: "test@example.com"
        })
        .then(response => {
          expect(response.status).to.equal(400);
        })
        .catch(error => {
          throw error
        });
    })
    it('should response with user ID if all information is correct', async function() {
      await chai.request(apiAddress)
        .post('/register')
        .send({
          username: "foobar",
          password: "123456",
          email: "test@example.com"
        })
        .then(response => {
          expect(response.status).to.equal(201);
          // validate response body with JSON Schema)
          expect(response.body).to.be.jsonSchema(userCreatedSchema);
        })
        .catch(error => {
          throw error
        });
    })
  })

  describe('Getting postings Test (Route GET /items)', function() {

    it('Should return successfull response with all postings', async function() {

      
      await chai.request(apiAddress).get('/items')
        .then(response => {
          expect(response).to.have.status(200);
        })
        .catch(error => {
          throw error;
        })
    })

    it('Should return successfull response with all postings filtered by category', async function() {

      
        await chai.request(apiAddress).get('/items?category=test')
          .then(response => {
            expect(response).to.have.status(200);
          })
          .catch(error => {
            throw error;
          })
      })

      it('Should return successfull response with all postings filtered by location', async function() {

      
        await chai.request(apiAddress).get('/items?location=test')
          .then(response => {
            expect(response).to.have.status(200);
          })
          .catch(error => {
            throw error;
          })
      })
      it('Should return successfull response with all postings filtered by date', async function() {

      
        await chai.request(apiAddress).get('/items?date=2021')
          .then(response => {
            expect(response).to.have.status(200);
          })
          .catch(error => {
            throw error;
          })
      })

      it('Should return 204 when misspelled category or category not existing', async function() {

      
        await chai.request(apiAddress).get('/items?category=notexisting')
          .then(response => {
            expect(response).to.have.status(204);
          })
          .catch(error => {
            throw error;
          })
      })

      it('Should return 204 when misspelled location or category not existing', async function() {

      
        await chai.request(apiAddress).get('/items?location=notexisting')
          .then(response => {
            expect(response).to.have.status(204);
          })
          .catch(error => {
            throw error;
          })
      })

      it('Should return 204 when misspelled date or category not existing', async function() {

      
        await chai.request(apiAddress).get('/items?date=notexisting')
          .then(response => {
            expect(response).to.have.status(204);
          })
          .catch(error => {
            throw error;
          })
      })
  })

  describe('User login tests (Route POST /login)', function() {

    it('should accept user login when correct username and password', async function() {
        await chai.request(apiAddress)
          .post('/login')
          .set({"Authorization": 'Basic dGVzdGVyOnRlc3RlcnBhc3N3b3Jk'})
          .then(response => {
            expect(response.status).to.equal(200);
          })
          .catch(error => {
            throw error
          });
  

})



    it('should reject (status 401) the request if user not authorized (wrong password, username or user does not exist)', async function() {
      await chai.request(apiAddress)
        .post('/login')
        .send({
          username: "johntho",
          password: "johndoepasswortt",
          
        })
        .then(response => {
          expect(response.status).to.equal(401);
        })
        .catch(error => {
          throw error
        });
    })

    
})


describe('Creating posts test (Route POST /items)', function() {

    it('should let logged in user create posting', async function() {
        await chai.request(apiAddress)
          .post('/items')
          .set({ "Authorization": `Bearer ${token}` })
          .field('Content-Type', 'multipart/form-data')
          .field('title', 'titletest')
          .field('category','test')
          .field('id','testid')
          .field('userId','testuserId')
          .field('price','200')
          .field('date','2020-01-25T00:00:00')
          .field('deliveryType','testdelivery')
          .field('sellerUsername','testusername')
          .field('sellerContact','testcontact')
          .field('location','testlocation')
          .attach('images', 'C:/Users/tobia/Documents/mobileapplications/gradedexerciseAPI/uploads/skinedit12.png', 'skinedit12.png')
          .then(response => {
            expect(response.status).to.equal(201);
          })
          .catch(error => {
            throw error
          });
  
        })

        it('should return 400 when field is missing e.g. price', async function() {
            await chai.request(apiAddress)
              .post('/items')
              .set({ "Authorization": `Bearer ${token}` })
              .field('Content-Type', 'multipart/form-data')
              .field('title', 'titletest')
              .field('category','test')
              .field('id','testid')
              .field('userId','testuserId')
              .field('date','2020-01-25T00:00:00')
              .field('deliveryType','testdelivery')
              .field('sellerUsername','testusername')
              .field('sellerContact','testcontact')
              .field('location','testlocation')
              .attach('images', 'C:/Users/tobia/Documents/mobileapplications/gradedexerciseAPI/uploads/skinedit12.png', 'skinedit12.png')
              .then(response => {
                expect(response.status).to.equal(400);
              })
              .catch(error => {
                throw error
              });
      
            })
})

describe('Editing postings test (Route PUT /items/:id)', function() {

    it('should let logged in user edit own postings', async function() {
        await chai.request(apiAddress)
          .put('/items/1')
          .set({ "Authorization": `Bearer ${token}` })
          .field('Content-Type', 'multipart/form-data')
          .field('title', 'titletestnew')
          .field('category','testnew')
          .field('id','testidnew')
          .field('userId', 3)
          .field('price', 200)
          .field('date','2020-01-25T00:00:01')
          .field('deliveryType','testdeliverynew')
          .field('sellerUsername','testusernamenew')
          .field('sellerContact','testcontactnew')
          .field('location','testlocationnew')
          .attach('images', 'C:/Users/tobia/Documents/mobileapplications/gradedexerciseAPI/uploads/skinedit12.png', 'skinedit12.png')
          .then(response => {
            expect(response.status).to.equal(201);
          })
          .catch(error => {
            throw error
          });
  
        })

        it('should return 400 when field is missing e.g. category', async function() {
            await chai.request(apiAddress)
              .put('/items/1')
              .set({ "Authorization": `Bearer ${token}` })
              .field('Content-Type', 'multipart/form-data')
              .field('title', 'titletestnew')
              .field('id','testidnew')
              .field('userId', 3)
              .field('price', 200)
              .field('date','2020-01-25T00:00:01')
              .field('deliveryType','testdeliverynew')
              .field('sellerUsername','testusernamenew')
              .field('sellerContact','testcontactnew')
              .field('location','testlocationnew')
              .attach('images', 'C:/Users/tobia/Documents/mobileapplications/gradedexerciseAPI/uploads/skinedit12.png', 'skinedit12.png')
              .then(response => {
                expect(response.status).to.equal(400);
              })
              .catch(error => {
                throw error
              });
      
            })
})


describe('Delete postings (Route DELETE /items/:id)', function() {

    it('should let logged in user delete posting', async function() {
        await chai.request(apiAddress)
          .delete('/items/1')
          .set({ "Authorization": `Bearer ${token}` })
          .then(response => {
            expect(response.status).to.equal(200);
          })
          .catch(error => {
            throw error
          });
  

})
   
})
})