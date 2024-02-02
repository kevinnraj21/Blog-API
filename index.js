import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();
const port = 4000;

// In-memory data store
// let posts = [
//   {
//     id: 1,
//     title: "The Rise of Decentralized Finance",
//     content:
//       "Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading.",
//     author: "Alex Thompson",
//     date: "2024-01-04T10:00:00Z",
//   },
//   {
//     id: 2,
//     title: "The Impact of Artificial Intelligence on Modern Businesses",
//     content:
//       "Artificial Intelligence (AI) is no longer a concept of the future. It's very much a part of our present, reshaping industries and enhancing the capabilities of existing systems. From automating routine tasks to offering intelligent insights, AI is proving to be a boon for businesses. With advancements in machine learning and deep learning, businesses can now address previously insurmountable problems and tap into new opportunities.",
//     author: "Mia Williams",
//     date: "2024-01-05T14:30:00Z",
//   },
//   {
//     id: 3,
//     title: "Sustainable Living: Tips for an Eco-Friendly Lifestyle",
//     content:
//       "Sustainability is more than just a buzzword; it's a way of life. As the effects of climate change become more pronounced, there's a growing realization about the need to live sustainably. From reducing waste and conserving energy to supporting eco-friendly products, there are numerous ways we can make our daily lives more environmentally friendly. This post will explore practical tips and habits that can make a significant difference.",
//     author: "Samuel Green",
//     date: "2024-01-06T09:15:00Z",
//   },
// ];

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/blog-postDB");
const postSchema = new mongoose.Schema({
  id:Number,
  title:{ type:String, require:[true, "Please enter a Title to your blog-post"]},
  content:String,
  author:String,
  date:String
});
const BlogPost = mongoose.model("blogpost", postSchema);

const defaultPost = [{
  id: 1,
  title: "The Rise of Decentralized Finance",
  content:
    "Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading.",
  author: "Alex Thompson",
  date: "Mon Jan 22 2024 20:12:19 GMT+0530 (India Standard Time)",
}];
let lastId = 1;

//CHALLENGE 1: GET All posts
app.get("/posts", async(req,res)=>{
  // console.log(posts);
  const result = await BlogPost.find({});
  if(result.length===0){
    BlogPost.insertMany(defaultPost);
    res.json(defaultPost);
  }
  else{
    res.json(result);
  }
});

//CHALLENGE 2: GET a specific post by id
app.get("/posts/:id", async(req,res)=>{
  const id = parseInt(req.params.id);
  const post = await BlogPost.findOne({id:id});
  if(post)
    res.json(post);
  else
    res.status(404).json({error:`Post with id: ${id} not found.`});
})

//CHALLENGE 3: POST a new post
app.post("/posts", (req,res)=>{
  const newPost = new BlogPost({
    id: lastId+1,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    date: new Date()
  });
  newPost.save();
  lastId = lastId+1;
  res.status(201).json(newPost);
});

//CHALLENGE 4: PATCH a post when you just want to update one parameter
app.patch("/posts/:id", async(req,res)=>{
  const id = parseInt(req.params.id);

  try{
    const post = await BlogPost.findOne({id:id});
    // console.log(req.body);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const updatedPost = {
      id: id,
      title: req.body.title || post.title,
      content: req.body.content || post.content,
      author: req.body.author || post.author,
      date: post.date
    };
    const updated = await BlogPost.findOneAndReplace({id:id}, updatedPost, {new: true});
    // console.log(updatedPost);
    res.status(200).json(updated);

  } catch(error){
    console.log("Error updating post", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//CHALLENGE 5: DELETE a specific post by providing the post id.
app.delete("/posts/:id", async(req,res)=>{
  const id = parseInt(req.params.id);
  try{
    const deleted = await BlogPost.deleteOne({id:id});
    res.status(200).json(deleted);
  } 
  catch(error){
    console.log("Error deleting post", error);
    res.status(500).json({ message: "Internal server error" });
  }
})

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
