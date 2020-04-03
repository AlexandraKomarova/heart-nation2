const express = require("express")
const router = express.Router()
const auth = require("../../middleware/auth")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("config")
const { check, validationResult } = require("express-validator")
const User = require("../../models/User")

// GET api/auth
// get user by token
// private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  } 
})

// POST api/auth
// authenticate user & get token
// public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(400).json({ errors: errors.array() });
    
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

    // in case user was not found
    if (!user) return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
  
    // compare text password to hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    
    // get the payload with user id
    const payload = { user: {id: user.id } };

    // sign the token, pass the payload, pass the secret
    // send the token back
    // change to 3600 (1hr) for production
    jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        // if no err send token back to client
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}
);

module.exports = router