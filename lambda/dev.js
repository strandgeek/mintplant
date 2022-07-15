const express = require('express')
const dotenv = require('dotenv')

dotenv.config()

const { handler } = require('./index')

const app = express()

app.get(['/', '/*'], async (req, res) => {
  try {    
    const result = await handler()
    return res.status(result.statusCode).send(result.body);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    })
  }
})


app.listen(4444, () => {
  console.log('Lambda Dev is running at http://localhost:4444')
})
