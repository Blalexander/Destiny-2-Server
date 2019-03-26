'use strict';
const axios = require("axios");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { PGCR } = require("./models");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

mongoose.connect("mongodb://blake:blake1@ds131903.mlab.com:31903/node-capstone", function(err) {
    if (err) {
        console.log('Not connected to the database: ' + err);
    } else {
        console.log('Successfully connected to MongoDB')
    }
});

const pg = PGCR();

router.get("/second", (req, res) => {
  // const pg = PGCR();
  keepTrackOfHowMany = 0;
  allResponses = [];
  let saveThis;
  axios
  .get(
    `https://www.bungie.net/Platform/Destiny2/${req.query.mtype}/Account/${req.query.mid}/Character/${req.query.chid}/Stats/Activities/?mode=5&count=5`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
      }
    }
  )
  .then(payload => {
    keepTrackOfHowMany = payload.data.Response.activities.length;
    console.log("KTOHM: ", keepTrackOfHowMany);
    payload.data.Response.activities.forEach(activity => {
      allResponses.push(activity.activityDetails.referenceId);
    })
    console.log("allResponses: ", allResponses);
    saveThis = allResponses;
    return saveThis;
    //responds with an array of reference Ids
  })
  .then(activityArrayPayload => 
    getAllDaStuff(activityArrayPayload)
  )
  .then(payload => {
    console.log("got here last");
    // res.json(payload);

    // const pg = new PGCR();
    let insertionObj = {gamesPlayed: saveThis, masterArr: payload};

    return pg.collection.insert(insertionObj, onInsert);
  
    function onInsert(err, docs) {
      if (err) {
        console.log("Error!", err);
      } else {
        console.info("PGCRs were successfully stored.", docs.length);
      }
    }
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong while querying Bungie"
    });
  });
})






router.get('/hope', jsonParser, (req, res) => {
  // console.log(req.body);
  // const myCursor = PGCR.find({}, {gamesPlayed: { $slice: 2 }}); 
  // const myCursor = PGCR.find({}, {period: 1}); //returns IDs of containing object
  // const myCursor = PGCR.find({}, {referenceId: 2047813119}); 

  // myCursor
  // return PGCR.find({}, {referenceId: 2047813119})

  PGCR.find({}, {masterArr: { $slice: 5 }})
    .then(load => {
      res.json(load);
      console.log(load);
    })
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
})







function getAllDaStuff(something) {
  allGames = [];
  return new Promise(function(resolve, reject) {
    something.forEach(refId => {
      axios
      .get(
        `https://www.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/${refId}/`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
          }
        }
      )
      .then(payload => {
        console.log(payload.data.Response.period);
        allGames.push(payload.data);
        console.log("KTOHM: ", keepTrackOfHowMany, "allGames: ", allGames.length);
        return(allGames);
      })
      .then(payload => {
        if(keepTrackOfHowMany == payload.length) {
          console.log("resolving payload");
          resolve(payload);
        }
      })
      .catch(err => {
        allGames.push("404");
        console.log("Throwing a 404!");
        res.status(500).json({
          message: "Something went wrong while querying Bungie"
        })
        return(allGames);
      });
    })
  })
}


let keepTrackOfHowMany = 0;

let firstResponse;
let secondResponse;
let allResponses = [];
let allGames = [];
let membershipType;
let membershipId;


router.get("/first", (req, res) => {
  console.log("req.query", req.query)
  var mname = req.query.mname.replace("#", "%23");

  let searchUrl = `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/${req.query.mtype}/${mname}`;
  console.log("searchUrl: ", searchUrl);

  axios
    .get(
      // `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/${req.query.mtype}/${req.query.mname}`,
      searchUrl,
      // `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/4/Girthquake%2311226`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
        }
      }
    )
    .then(payload => {
      firstResponse = payload.data.Response;
      console.log("firstResponse: ", firstResponse);
      membershipType = firstResponse[0].membershipType;
      membershipId = firstResponse[0].membershipId;
      console.log(membershipType, membershipId);
    
      //RES .JSON SOMEWHERE

      axios
      .get(
        `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=200`,
        // searchUrl,
        // `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/4/Girthquake%2311226`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
          }
        }
      )
      .then(payload2 => {
        secondResponse = payload2.data.Response;
        let nameAndCharacters = Object.assign({}, firstResponse, secondResponse);
        res.json(nameAndCharacters);
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({
          message: "Something went wrong while querying Bungie"
        });
      });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({
          message: "Something went wrong while querying Bungie"
        });
    });
});

// router.use('*', function (req, res) {
//   res.status(404).json({ message: 'Not Found' });
// });

module.exports = router;