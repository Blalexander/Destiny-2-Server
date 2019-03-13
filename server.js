const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/api/*', (req, res) => {
  res.json({ok: true});
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = {app};



const cors = require('cors');
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
  next();
});


const router = express.Router();
const qs = require("querystring");

// GET request to http://localhost:3000/loadout/ works
app.get("/loadout", (req, res) => {
  console.log(req.query.search)
  axios
    .get(
      // `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/${req.query.membsType}/${req.query.search}`,
      `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/4/Girthquake%2311226`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
        }
      }
    )
    .then(payload => {
      res.json(payload.data);
      // getGuardianIds(payload.data);
    })
    // .then(guardianIds => {
    //   res.json(guardianIds);
    // })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        message: "Something went wrong while querying Bungie"
      });
    });
});

function getGuardianIds(userData) {
  let membershipType = userData.Response[0].membershipType;
  let membershipId = userData.Response[0].membershipId;
  return(
    router.get("/", (req, res) => {
      axios
        .get(
          `https://www.bungie.net/Platform/Destiny2/${
            membershipType
          }/Profile/${membershipId}/?components=200`,
          { //currently querying for loadout information -- could be removed?
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
            }
          }
        )
        .then(payload => {
          res.json(payload.data);
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({
            message: "Something went wrong while querying Bungie"
          });
        });
    })
  )
}

module.exports = router;
