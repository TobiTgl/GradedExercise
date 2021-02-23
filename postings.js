const uuidv4 = require('uuid/v4');
//const router = express.Router();

let postings = [
  {
    id: 1,
    userId: 1,
    title: "Used car",
    category: "Cars",
    images: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/daniel-golson-volvo-940-1557174566.jpg?crop=1.00xw:0.595xh;0,0.331xh&resize=1200:*",
    price: 1999.99,
    date: "2021-02-22",
    deliveryType: "Pick up from dealer",
    sellerUsername: "testeruser",
    sellerContact: "tester@user.com",
    location: "Oulu"
  },
  {
    id: 2,
    userId: 2,
    title: "Pink flowers",
    category: "flowers",
    images: "https://res.cloudinary.com/tobitgl/image/upload/v1613407379/sample.jpg",
    price: 20.21,
    date: "2021-02-29",
    deliveryType: "Next day delivery",
    sellerUsername: "flowerfreak1000",
    sellerContact: "flowers@web.nl",
    location: "Amsterdam, NL"
  },
  {
    id: 3,
    userId: 2,
    title: "Dancing banana figure",
    category: "Toys",
    images: "https://res.cloudinary.com/tobitgl/image/upload/v1613563336/ff7f8f7bfbc7cce9a2caf1effb65b5f5.png",
    price: 49.99,
    date: "2020-12-31",
    deliveryType: "Standard DHL",
    sellerUsername: "tekpsterfi",
    sellerContact: "tekp@ster.fi",
    location: "Shenzen, China"
  },
  {
    id:43,
    userId: 2,
    title: "Dancing banana figure",
    category: "Toys",
    images: "https://res.cloudinary.com/tobitgl/image/upload/v1613563336/ff7f8f7bfbc7cce9a2caf1effb65b5f5.png",
    price: 49.99,
    date: "2020-12-31",
    deliveryType: "Standard DHL",
    sellerUsername: "tekpsterfi",
    sellerContact: "tekp@ster.fi",
    location: "Shenzen, China"
  },
  {
    id: 5,
    userId: 2,
    title: "Dancing banana figure",
    category: "Toys",
    images: "https://res.cloudinary.com/tobitgl/image/upload/v1613563336/ff7f8f7bfbc7cce9a2caf1effb65b5f5.png",
    price: 49.99,
    date: "2020-12-31",
    deliveryType: "Standard DHL",
    sellerUsername: "tekpsterfi",
    sellerContact: "tekp@ster.fi",
    location: "Shenzen, China"
  },
];


module.exports = {
  insertPostings: (title, category,  userId, images, price, date, deliveryType, sellerUsername, sellerContact, location) => {
    postings.push({
      id: uuidv4(),
      userId,
      title,
      category,
      images,
      price,
      date,
      deliveryType,
      sellerUsername,
      sellerContact,
      location
    });
  },

  getAllPostings: () => postings,
  getSinglePostings: (id) => postings.filter(t => t.id == id),
  getAllUserPostings: (userId) => postings.filter(t => t.userId == userId),
  getPostings: (postingsId) => postings.find(t => t.id == postingsId),
  deletePostings: (postingId) => postings = postings.filter(t => t.id != postingId),
  getPostingsByCategory: (category) => postings.filter(t => t.category == category),
  getPostingsByLocation: (location) => postings.filter(t => t.location == location),
  getPostingsByDate: (date) => postings.filter(t => t.date == date),
  editPostings: (postingId, newData) => postings.splice(postings.indexOf(postingId), 1, newData)
}

//module.exports = router;