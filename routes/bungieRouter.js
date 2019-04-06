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


let keepTrackOfHowMany = 0;
let allResponses = [];
let allGames = [];
let childId;
const pg = PGCR();

router.get("/second", (req, res) => {
  keepTrackOfHowMany = 0;
  allResponses = [];
  let saveThis;
  childId = req.query.chid;
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
    // console.log(payload.data);
    keepTrackOfHowMany = payload.data.Response.activities.length;
    console.log("KTOHM: ", keepTrackOfHowMany);
    payload.data.Response.activities.forEach(activity => {
      allResponses.push(activity.activityDetails.instanceId);
    })
    console.log("allResponses: ", allResponses);
    saveThis = allResponses;
    return saveThis;
    //responds with an array of instance Ids
  })
  .then(activityArrayPayload => 
    getAllDaStuff(activityArrayPayload)
  )
  .then(payload => {
    console.log("got here last");
    res.json(payload);
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong while querying Bungie"
    });
  });
})


let bigArray = [];

function getAllDaStuff(something) {
  console.log(something);
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
        
        let refIdForPGCR = payload.data.Response.activityDetails.instanceId;
        let gameForPGCR = payload.data.Response

        PGCR.findOne({pgcrId: refIdForPGCR})
        .then(load => {
          if(load === null) {
            console.log(refIdForPGCR, " has no record.  Inserting record now.");
            
            let insertionObj = {pgcrId: refIdForPGCR, game: gameForPGCR};
            pg.collection.insert(insertionObj, onInsert);
              
            console.log("wasnt there!");

            function onInsert(err, docs) {
              if (err) {
                console.log("Error!", err);
              } else {
                console.info("loadouts were successfully stored.", docs.length);
              }
            }
          }
          else { 
            console.log("Record for " + refIdForPGCR + " found!");
            return console.log("was there!");
          }
          })
      })
      // .then(() => {
      //   let myCursor = PGCR.find({pgcrId: "3416381545"});
      //   myCursor.then(load => {
      //     res.json(load);
      //   })
      //   .catch(err => res.status(500).json({err}));
      // })
      .catch(err => {
        console.error(err);
        err.status(500).json({
          message: "Something went wrong while querying Bungie"
        });
      });
    })
    resolve("finished");
  })
}



router.get('/hope', jsonParser, (req, res) => {
  // let myCursor = PGCR.find({pgcrId: "3416381545"});
  // myCursor.then(load => {
  //   res.json(load);
  // })
  // .catch(err => res.status(500).json({err}));


  // {
  //   pgcrId: "3416381545"
  // }

  // {
  //   path: "$game.entries",
  //   includeArrayIndex: '<<string>>',
  //   preserveNullAndEmptyArrays: true
  // }

  const thisItem = PGCR.aggregate(
    [
      {
        $match: {pgcrId: "3416381545"}
      },
      {
        $unwind: {
          path: "$game.entries",
          includeArrayIndex: "arrayIndex",
          preserveNullAndEmptyArrays: true
        }
      },
    ]
  )

  thisItem.then(loadr => res.json(loadr));
});




let firstResponse;
let secondResponse;
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

module.exports = router;