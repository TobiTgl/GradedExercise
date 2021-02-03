const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const postings = require('./services/postings');
const users = require('./services/users');
const port = 4000;

app.use(express.json());

app.get('/', (req, res) => res.send('This route is not protected'));

//post register

/*********************************************
 * HTTP Basic Authentication
 * Passport module used
 * http://www.passportjs.org/packages/passport-http/
 ********************************************/
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
  function(username, password, done) {

    const user = users.getUserByName(username);
    if(user == undefined) {
      // Username not found
      console.log("HTTP Basic username not found");
      return done(null, false, { message: "HTTP Basic username not found" });
    }

    /* Verify password match */
    if(bcrypt.compareSync(password, user.password) == false) {
      // Password does not match
      console.log("HTTP Basic password not matching username");
      return done(null, false, { message: "HTTP Basic password not found" });
    }
    return done(null, user);
  }
));

app.get('/httpBasicProtectedResource',
        passport.authenticate('basic', { session: false }),
        (req, res) => {
  res.json({
    yourProtectedResource: "profit"
  });
});

app.post('/registerBasic',
        (req, res) => {

  if('username' in req.body == false ) {  
    res.status(400);
    res.json({status: "Missing username from body"})
    return;
  }
  if('password' in req.body == false ) {
    res.status(400);
    res.json({status: "Missing password from body"})
    return;
  }
  if('email' in req.body == false ) {
    res.status(400);
    res.json({status: "Missing email from body"})
    return;
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 6);
  console.log(hashedPassword);
  users.addUser(req.body.username, req.body.email, hashedPassword);

  res.status(201).json({ status: "created" });
});

//post items 
app.post('/items', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log('POST /items');
    console.log(req.body);
    if(('category' in req.body) && ( 'title' in req.body)&& ( 'images' in req.body)&& ( 'price' in req.body)&& ( 'date' in req.body)&& ( 'deliveryType' in req.body)&& ( 'sellerUsername' in req.body)&& ( 'sellerContact' in req.body)&& ( 'location' in req.body)) {
      postings.insertPostings(req.body.title, req.body.category,  req.body.userId, req.body.images, req.body.price, req.body.date, req.body.deliveryType, req.body.sellerUsername, req.body.sellerContact, req.body.location);
      res.json(postings.getAllUserPostings(req.user.id));
    }
    else {
      res.sendStatus(400);
    }
    
})


//get items
app.get('/items', (req, res) => {
  
  const t = postings.getAllPostings();
    res.json(t);


});




//get user/{userId}


//put items


//put items/{itemId}


//delete item/{itemId}

app.delete('/items/:id', (req, res) => {
  
  const t = postings.deletePostings(req.params.id);
    res.json(t);

  
});




/*********************************************
 * API KEY DEMO
 ********************************************/
app.get('/apiKeyGenerate/:userId', (req, res) => {
  const userId = req.params.userId;
  let apiKey = users.getApiKey(userId);
  if(apiKey === false) // user not found
  {
    res.sendStatus(400);
  }
  if(apiKey === null)
  {
    apiKey = users.resetApiKey(userId)
  }
  res.json({
    apiKey
  })
});

function checkForApiKey(req, res, next)
{
  const receivedKey = req.get('X-Api-Key');
  if(receivedKey === undefined) {
    return res.status(400).json({ reason: "X-Api-Key header missing"});
  }

  const user = users.getUserWithApiKey(receivedKey);
  if(user === undefined) {
    return res.status(400).json({ reason: "Incorrect api key"});
  }

  req.user = user;

  // pass the control to the next handler in line
  next();
}

app.get('/apiKeyProtectedResource', checkForApiKey, (req, res) => {
  res.json({
    yourResource: "foo"
  })
});




/*********************************************
 * JWT authentication
 * Passport module is used, see documentation
 * http://www.passportjs.org/packages/passport-jwt/
 ********************************************/
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtSecretKey = require('./jwt-key.json');


let options = {}

/* Configure the passport-jwt module to expect JWT
   in headers from Authorization field as Bearer token */
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

/* This is the secret signing key.
   You should NEVER store it in code  */
options.secretOrKey = jwtSecretKey.secret;

passport.use(new JwtStrategy(options, function(jwt_payload, done) {
  console.log("Processing JWT payload for token content:");
  console.log(jwt_payload);


  /* Here you could do some processing based on the JWT payload.
  For example check if the key is still valid based on expires property.
  */
  const now = Date.now() / 1000;
  if(jwt_payload.exp > now) {
    done(null, jwt_payload.user);
  }
  else {// expired
    done(null, false);
  }
}));


app.get(
  '/jwtProtectedResource',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log("jwt");
    res.json(
      {
        status: "Successfully accessed protected resource with JWT",
        user: req.user
      }
    );
  }
);

app.get('/postingsJWT', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log('GET /postingsJWT')    
    const t = postings.getAllUserPostings(req.user.id);
    res.json(t);
})

/*
Body JSON structure example
{
	"description": "Example todo",
	"dueDate": "25-02-2020"
}
*/
app.post('/postingsJWT', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log('POST /postingsJWT');
    console.log(req.body);
    if(('description' in req.body) && ( 'dueDate' in req.body)) {
      postings.insertPostings(req.body.description, req.body.dueDate, req.user.id);
      res.json(postings.getAllUserPostings(req.user.id));
    }
    else {
      res.sendStatus(400);
    }
    
})

app.get(
  '/loginForJWT',
  passport.authenticate('basic', { session: false }),
  (req, res) => {
    const body = {
      id: req.user.id,
      email : req.user.email
    };

    const payload = {
      user : body
    };

    const options = {
      expiresIn: '1d'
    }

    /* Sign the token with payload, key and options.
       Detailed documentation of the signing here:
       https://github.com/auth0/node-jsonwebtoken#readme */
    const token = jwt.sign(payload, jwtSecretKey.secret, options);

    return res.json({ token });
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))