const uuidv4 = require('uuid/v4');


let postings = [
  {
    id: 1,
    userId: 1,
    title: "test",
    category: "test",
    images: "test",
    price: 200,
    date: "2021",
    deliveryType: "test",
    sellerUsername: "tester",
    sellerContact: "test",
    location: "test"
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
  getAllUserPostings: (userId) => postings.filter(t => t.userId == userId),
  getPostings: (postingsId) => postings.find(t => t.id == postingsId),
  deletePostings: (postingId) => postings.filter(t => t.id != postingId)
}