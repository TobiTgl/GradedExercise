const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const multer  = require('multer')
const multerUpload = multer({ dest: 'uploads/' })
const app = express();
const postings = require('./services/postings');
const users = require('./services/users');
const port = 4000;
const cors = require('cors');
const exampleJsonSchema = require('./test/schemas/users.json');
const Ajv = require('ajv').default;
require('dotenv').config()
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
      console.log(file)
      cb(null, file.originalname)
    }
  })
  
app.use(cors());
app.use(express.json());

let currentUser;
let currentUserName;
let currentUserEmail;

app.get('/', (req, res) => {
    res.status(200);
    res.send('Hello World!')
  })

//post register

const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
  function(username, password, done) {

    const user = users.getUserByName(username);
    currentUser = user.id
    currentUserName=user.username
    currentUserEmail=user.email
    //console.log(currentUser)
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

app.post('/register',
        (req, res) => {

    const ajv = new Ajv();
    const validate = ajv.compile(require('./test/schemas/users.json'));
    const valid = validate(req.body);
    if(valid == true) {
        // Do something to create the user and save the information

        res.status(201);
        res.json({
        id: 678696
        })
    } else {
        res.status(400);
        res.send(validate.errors.map(e => e.message));
    }

  //console.log(req.body)
  const hashedPassword = bcrypt.hashSync(req.body.password, 6);
  //console.log(hashedPassword);
  users.addUser(req.body.username, req.body.email, hashedPassword);

  //res.status(201).json({ status: "created" });
});


//login
app.post('/login', passport.authenticate('basic', {session: false}), (req, res)=>{
  //console.log('test');
  res.sendStatus(200);
})

//post items 
app.post('/uploadCloudinary', (req, res, next) => {
    const upload = multer({ storage }).single('images')
    upload(req, res, function(err) {
      if (err) {
        return res.send(err)
      }
      console.log('file uploaded to server')
      console.log(req.file)
  
      // SEND FILE TO CLOUDINARY
      const cloudinary = require('cloudinary').v2
      cloudinary.config({
        cloud_name: process.env.cloudname,
        api_key: process.env.APIKey,
        api_secret: process.env.APISecret
      })
      
      const path = req.file.path
      const uniqueFilename = new Date().toISOString()
  
      cloudinary.uploader.upload(
        path,
        { public_id: `${req.file.filename}`, tags: `blog` }, // directory and tags are optional
        function(err, image) {
          if (err) return res.send(err)
          console.log('file uploaded to Cloudinary')
          // remove file from server
          const fs = require('fs')
          fs.unlinkSync(path)
          // return image details
          res.json(image)
        console.log(uniqueFilename)
        }
      )
    })
  })

app.post('/items', 
  passport.authenticate('jwt', { session: false }),  multerUpload.any('testFile'),
  (req, res) => {

    let filetype = req.files[0].mimetype

    let filetypeCut = filetype.substr(6, filetype.length)

    //console.log(filetypeCut)

    let url = 'https://res.cloudinary.com/tobitgl/image/upload/v1613488845/' + req.files[0].filename + '.' + filetypeCut

    //console.log(url)
    
/*
       req.files.forEach(f => {
      fs.renameSync(f.path, './uploads/' + f.originalname)
    })
*/
    //console.log('POST /items');
    //console.log(req.body);
    if(('category' in req.body) && ( 'title' in req.body)&& ( 'path' in req.files[0])&& ( 'price' in req.body)&& ( 'date' in req.body)&& ( 'deliveryType' in req.body)&&( 'location' in req.body)) {
      req.files.forEach(f => {
        postings.insertPostings(req.body.title, req.body.category,  currentUser, url, req.body.price, req.body.date, req.body.deliveryType, currentUserName, currentUserEmail, req.body.location);
      
      })
      
    }
    else {
      res.sendStatus(400);
      return
    }

    //console.log(req.files)
    //console.log(url)
    
    const upload = multer({ storage }).single('images')

    upload(req, res, function(err) {
        if (err) {
          return res.send(err)
        }
        //console.log('file uploaded to server')
        //console.log(req.files)
    
        // SEND FILE TO CLOUDINARY
        const cloudinary = require('cloudinary').v2
        cloudinary.config({
            cloud_name: process.env.cloudname,
            api_key: process.env.APIKey,
            api_secret: process.env.APISecret
        })
        
        const path = req.files[0].path
        
        res.sendStatus(201);
        
        cloudinary.uploader.upload(
          path,
          { public_id: `${req.files[0].filename}`, tags: `blog` }, // directory and tags are optional
          function(err, image) {
            if (err) return res.send(err)
            //console.log('file uploaded to Cloudinary')
            // remove file from server
            const fs = require('fs')
            fs.unlinkSync(path)
            // return image details
            //res.json(image)
          
          }
        )
      })

      
    
})

app.post('/upload', multerUpload.single('testFile'), (req, res) => {
  console.log(req.file);

  fs.rename(req.file.path, './uploads/' + req.file.originalname, function (err) {
      if (err) throw err;
      console.log('renamed complete');
      res.send("Test");
    });
});

app.post('/multiple', multerUpload.array('testFiles', 4), (req, res) => {
console.log(req.files);

req.files.forEach(f => {
  fs.renameSync(f.path, './uploads/' + f.originalname)
})

res.send("Completed");

});

//get items & filtered by category location and date

app.get('/items', (req, res) => {
  
  let category = req.query.category
  let location = req.query.location
  let date = req.query.date
 
  if(category != undefined){
    const t = postings.getPostingsByCategory(category);
    if(t.length == 0){
        res.sendStatus(204)
    }else{
        
    res.json(t);
    }
  }else if (location != undefined){
    const t = postings.getPostingsByLocation(location);
    if(t.length == 0){
        res.sendStatus(204)
    }else{
        
    res.json(t);
    }

  }else if (date != undefined){
    const t = postings.getPostingsByDate(date);
    if(t.length == 0){
        res.sendStatus(204)
    }else{
        
    res.json(t);
    }

}else{

    const t = postings.getAllPostings();
    res.json(t);
  }
  
});

//Get single item from

app.get('/items/:id', (req, res) => {
           
      const t = postings.getSinglePostings(req.params.id);
      res.json(t);
  
  });


//get user/{userId}

app.get('/users/:id', (req, res) => {
           
    const t = users.getUser(req.params.id);
    res.json(t);

});

app.get('/users', (req, res) => {
           
  const t = users.getAllUsers();
  res.json(t);

});

//put items/{itemId}

app.put('/items/:id', multerUpload.any('testFile'), (req, res) => {

  req.files.forEach(f => {
    fs.renameSync(f.path, './uploads/' + f.originalname)
  })

  //console.log('PUT /items');
  //console.log(req.body);
  
  let newData = {
    id: req.params.id,
    title: req.body.title, 
    category: req.body.category,  
    userId: req.body.userId, 
    images: req.files[0].path, 
    price: req.body.price, 
    date: req.body.date, 
    deliveryType: req.body.deliveryType, 
    sellerUsername:req.body.sellerUsername, 
    sellerContact: req.body.sellerContact, 
    location: req.body.location

  }; 
  if(('category' in req.body) && ( 'title' in req.body)&& ( 'path' in req.files[0])&& ( 'price' in req.body)&& ( 'date' in req.body)&& ( 'deliveryType' in req.body)&& ( 'sellerUsername' in req.body)&& ( 'sellerContact' in req.body)&& ( 'location' in req.body)) {
    req.files.forEach(f => {
      postings.editPostings(req.params.id, newData);
    
    })
    //postings.insertPostings(req.body.title, req.body.category,  req.body.userId, req.files[0].path, req.body.price, req.body.date, req.body.deliveryType, req.body.sellerUsername, req.body.sellerContact, req.body.location);
   // res.json(postings.getAllUserPostings(req.user.id));
   res.sendStatus(201);
  }
  else {
    res.sendStatus(400);
  }
  
  /*
  const t = postings.editPostings(req.params.id, req.body);
    res.json(t);
*/

});

//delete item/{itemId}

app.delete('/items/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  
  //postings.postings = postings.deletePostings(req.params.id);
  const t = postings.deletePostings(req.params.id);
    res.json(t);


});

const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtSecretKey = require('./jwt-key.json');


let options = {}

options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

options.secretOrKey = jwtSecretKey.secret;

passport.use(new JwtStrategy(options, function(jwt_payload, done) {
  
  const now = Date.now() / 1000;
  if(jwt_payload.exp > now) {
    done(null, jwt_payload.user);
  }
  else {// expired
    done(null, false);
  }
}));

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
    const token = jwt.sign(payload, jwtSecretKey.secret, options);

    return res.json({ token });
})

let serverInstance = null;

module.exports = {
  start: function() {
    serverInstance =  app.listen(process.env.PORT || 4000)
    
  },
  close: function() {
    serverInstance.close();
  },
}