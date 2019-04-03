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

const pg = PGCR();

router.get("/second", (req, res) => {
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

router.get('/hope', jsonParser, (req, res) => {
  // console.log(req.body);
  // const myCursor = PGCR.find({}, {gamesPlayed: { $slice: 2 }}); 
  // const myCursor = PGCR.find({}, {period: 1}); //returns IDs of containing object
  // const myCursor = PGCR.find({}, {referenceId: 2047813119}); 

  // myCursor
  // PGCR.find({}, {referenceId: 2047813119})
  // PGCR.find({}, {displayName: "sirDumpsalot"})
  // PGCR.find({characterId: "2305843009403725857"}) // GETS ENTIRE CHARACTER OBJECT



  let myCursor = PGCR.find({characterId: "2305843009301006557"});
  myCursor.then(load => {
    res.json(load);
  })
  .catch(err => res.status(500).json({err}));



    // load === null ? console.log("null!") : console.log("oh yeah1!");
    // load === undefined ? console.log("undefined!") : console.log("oh yeah2!");

  // const thisItem = pg.collection.aggregate(
  //   [
  //     {
  //       $match: {characterId: "2305843009301006557"}
  //     },
  //     {
  //       $group: {
  //         characterId:'$characterId',
  //         referenceIdsForGamesPlayed:{$addToSet: '$referenceIdsForGamesPlayed'}
  //       }
  //     }
  //     // {
  //     //   $project: {
  //     //     "characterId":1,
  //     //     "referenceIdsForGamesPlayed":1
  //     //   }
  //     // }
  //   ]
  // );

  // console.log(thisItem);
  // return thisItem;
});

let bigArray = [];



function getAllDaStuff(something) {
  console.log(something);
  allGames = [];
  let entryIterator = 0;
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
      .then(async function(payload) {
        let refIdForPGCR = payload.data.Response.activityDetails.instanceId;
        let entriesForPGCR = payload.data.Response.entries;

        for (let entry of entriesForPGCR) {
          console.log("start of FOR OF");
          entryIterator++;
          let nameForPGCR = entry.characterId;
          bigArray.push(nameForPGCR);

          //TWO STAGES.  first inserts all, then second updates any that need it.


          await PGCR.findOne({characterId: nameForPGCR}).then(async function(load) {
            if(load === null) {
              console.log(nameForPGCR, " has no record.  Inserting record now.");
              
              let editedEntry = {[refIdForPGCR]: entry};
              let insertionObj = {characterId: nameForPGCR, gameEntries: [editedEntry]};
              let insertionItem = await pg.collection.insert(insertionObj);
                
              console.log("wasnt there!");
              insertionItem;
            }
            else if(load.gameEntries.includes(refIdForPGCR)) { 
              console.log("Record for " + refIdForPGCR + " in " + nameForPGCR + " found!");
              return console.log("was there!");
            }
            else {
              console.log("Record found for account ID: " + nameForPGCR + " updating history now!");
              let editedEntry = {[refIdForPGCR]: entry};
              let updateItem = await pg.collection.update({characterId: nameForPGCR}, {$push: {gameEntries: editedEntry}});
              console.log("was there x2!");
              updateItem;
            }
          })
          .then(() => {
            console.log("anotha one");
          })
        }

        return console.log("reached the end!", entryIterator);
      })
      .then(() => {
        console.log("bigArray.unique", bigArray.unique().length);
        resolve("heyo");
      })
      .catch(err => {
        console.error(err);
        err.status(500).json({
          message: "Something went wrong while querying Bungie"
        });
      });
    })
  })
}

Array.prototype.unique = function() {
  return this.filter(function (value, index, self) { 
    return self.indexOf(value) === index;
  });
}







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