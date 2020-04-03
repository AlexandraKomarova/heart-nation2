const express = require("express")
const router = express.Router()
const auth = require("../../middleware/auth")
const { check, validationResult } = require("express-validator")

const User = require("../../models/User")
const Profile = require("../../models/Profile")
const Post = require("../../models/Post")

// POST api/posts
// create a post
// public

router.post("/", [auth, [
  check("text", "Text is required").not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const user = await User.findById(req.user.id).select('-password')

    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    })

    const post = await newPost.save()
    res.json(post)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// GET api/posts
// get all posts
// private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 })
    res.json(posts)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// GET api/posts/:id
// get post ny id
// private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if(!post) return res.status(404).json({ msg: "Post not found" })

    res.json(post)
  } catch (err) {
    console.error(err.message)
    if(err.kind === "ObjectId") return res.status(404).json({ msg: "Post not found" })
    res.status(500).send("Server error")
  }
})

// DELETE api/posts/:id
// delete a post
// private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if(!post) return res.status(404).json({ msg: "Post not found" })

    //check the user is the owner of the post
    if (post.user.toString() !== req.user.id) return res.status(401).json({ msg: "User not authorized" })

    await post.remove()
      res.json({ msg: "Post removed"})
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// PUT api/posts/like:id
// like a post
// private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    //check if the post was already liked by the user who's trying to like so they can't multiple likes to one post
    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) return res.status(400).json({ msg: "Post already liked" })

    post.likes.unshift({ user: req.user.id })

    await post.save()

    res.json(post.likes)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// PUT api/posts/unlike:id
// unlike a post
// private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    //check if the post was already liked 
    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) return res.status(400).json({ msg: "Post has not yet been liked" })

    // get remove index
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)

    post.likes.splice(removeIndex, 1)

    await post.save()

    res.json(post.likes)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// POST api/posts/comment/:id
// comment on a post
// private

router.post("/comment/:id", [auth, [
  check("text", "Text is required").not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const user = await User.findById(req.user.id).select('-password')
    const post = await Post.findById(req.params.id)

    const newComment = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    }

    post.comments.unshift(newComment)

    await post.save()
    res.json(post.comments)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// DELETE api/posts/comment/:id/:comment_id
// delete comment on a post
// private

// router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id)

//     // pull out comment
//     const comment = post.comments.find(comment => comment.id === req.params.comment_id)

//     // make sure comment exists 
//     if (!comment) return res.status(404).json({ msg: "Comment does not exist"})

//     // make sure the user who's deleting the comment is the user who made the comment
//     if(comment.user.toString() !== req.user.id) return res.status(401).json({ msg: "User not authorized" })

//     const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id)

//     post.likes.splice(removeIndex, 1)

//     await post.save()

//     res.json(post.comments)
//     } catch (err) {
//     console.error(err.message)
//     res.status(500).send("Server error")
//   }
// })

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await post.save();

    return res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});


module.exports = router