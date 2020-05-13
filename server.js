require("dotenv").config();


const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const morgan = require('morgan');

app.use(morgan('common'));

app.use(express.static("public"));
app.use(cors());


const bungieRoute = require("./routes/bungieRouter");
app.use("/bungie", bungieRoute);

// const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.json({ok: true});
});

// app.get('/api/*', (req, res) => {
//   res.json({ok: true});
// });

const { PORT } = require("./config");
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
