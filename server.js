const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');

app.use(express.static("public"));
app.use(cors());


const bungieRoute = require("./routes/bungieRouter");
app.use("/bungie", bungieRoute);

const PORT = process.env.PORT || 3000;

app.get('/api/*', (req, res) => {
  res.json({ok: true});
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));





// const cors = require('cors');
const {CLIENT_ORIGIN} = require('./config');

// app.use(
//     cors({
//         origin: CLIENT_ORIGIN
//     })
// );

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization,authorization');
  if (req.method === "OPTIONS") {
    return res.send(204);
  }
  next();
});


const router = express.Router();

module.exports = {app};
