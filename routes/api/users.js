const express = require("express")
const router = express.Router()
const gravatar = require("gravatar")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("config")
const { check, validationResult } = require("express-validator")
const User = require("../../models/User")

// POST api/users
// register user
// public
router.post("/", [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 })
],
  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }); 

  const { name, email, password } = req.body

  try {
    let user =  await User.findOne({ email })

    // user already exists
    if (user) return res.status(400).json({ errors: [{ msg: "User already exists" }] })

    // get the pic if the email used for signup has a pic
    const avatar = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "mm"
    })

    // create new user
    user = new User({
      name, 
      email,
      avatar, 
      password
    })

    // hash the password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    // save the user to db
    await user.save()
    
    // get the payload with user id
    const payload = { user: {id: user.id} }

    // sign the token, pass the payload, pass the secret
    // send the token back
    // change to 3600 (1hr) for production
    jwt.sign(payload, config.get("jwtSecret"), { expiresIn: 360000 }, (err, token) => {
      if (err) throw err
      // if no err send the token back to the client
      res.json({ token })
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

module.exports = router