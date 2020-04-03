const mongoose = require("mongoose")
const config = require("config")
const chalk = require("chalk")
const db = config.get("mongoURI")

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    console.log(chalk.green.inverse("mongo connected"))
  } catch (err) {
    console.error(err.message)
    //exit process with failure
    process.exit(1)
  }
}

module.exports = connectDB