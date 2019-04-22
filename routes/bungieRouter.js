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
let allInstanceIds = [];
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
    res.json(payload.data)
    // keepTrackOfHowMany = payload.data.Response.activities.length;
    // console.log("KTOHM: ", keepTrackOfHowMany);
    // payload.data.Response.activities.forEach(activity => {
    //   allResponses.push(activity.activityDetails.instanceId);
    // })
    // console.log("allResponses: ", allResponses);
    // saveThis = allResponses;
    // return saveThis;
    //responds with an array of instance Ids
  })
  // .then(activityArrayPayload => 
  //   getAllDaStuff(activityArrayPayload)
  // )
  // .then(payload => {
  //   console.log("got here last");
  //   res.json(payload);
  // })
  .catch(err => {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong while querying Bungie"
    });
  });
})


let bigArray = [];

function getAllDaStuff(something) {
  console.log("something: ", something);
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
        allGames.push(payload.data);
        console.log(allGames);
      })
        
      //   let refIdForPGCR = payload.data.Response.activityDetails.instanceId;
      //   let gameForPGCR = payload.data.Response

        // PGCR.findOne({pgcrId: refIdForPGCR})
        // .then(load => {
          // if(load === null) {
          //   console.log(refIdForPGCR, " has no record.  Inserting record now.");
            
          //   let insertionObj = {pgcrId: refIdForPGCR, game: gameForPGCR};
          //   pg.collection.insert(insertionObj, onInsert);
              
          //   console.log("wasnt there!");

          //   function onInsert(err, docs) {
          //     if (err) {
          //       console.log("Error!", err);
          //     } else {
          //       console.info("loadouts were successfully stored.", docs.length);
          //     }
          //   }
          // }
          // else { 
          //   console.log("Record for " + refIdForPGCR + " found!");
          //   return console.log("was there!");
          // }
        //   })
      // })
      // .then(() => {
      //   let myCursor = PGCR.find({pgcrId: "3416381545"});
      //   myCursor.then(load => {
      //     res.json(load);
      //   })
      //   //find if any other games associated with chids, return them
      //   //.then return overall stats for community scores
      //   .catch(err => res.status(500).json({err}));
      // })
      .catch(err => {
        console.error(err);
        err.status(500).json({
          message: "Something went wrong while querying Bungie"
        });
      });
    })
    // return allGames;
    resolve(allGames);
  })
}



router.get('/hope', jsonParser, async (req, res) => {
  let qwerty = [];

    const overallGameStats = await PGCR.aggregate(
      [
        {
          $unwind:   {
            path: "$game.Response.entries",
            preserveNullAndEmptyArrays: false
          }
        },
        // {
        //   $match: {
        //     "game.Response.entries.player.destinyUserInfo.membershipId": membershipId
        //   }
        // },
        {
          $unwind:   {
            path: "$game.Response.entries.extended.weapons",
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $group: {
            _id: {
              date: "$game.Response.period",
              weapon: "$game.Response.entries.extended.weapons.referenceId" ,
              weaponKills: "$game.Response.entries.extended.weapons.values.uniqueWeaponKills.basic.value",
              weaponPrecisionKills: "$game.Response.entries.extended.weapons.values.uniqueWeaponPrecisionKills.basic.value",
              totalKills: "$game.Response.entries.values.kills.basic.value",
              totalDeaths: "$game.Response.entries.values.deaths.basic.value",
              totalAssists: "$game.Response.entries.values.assists.basic.value",
              totalScore: "$game.Response.entries.values.score.basic.value",
              victory: "$game.Response.entries.values.standing.basic.value",
              class: "$game.Response.entries.player.characterClass"
            },
            count: { $sum:1 } //counts how many different weapons were used each game
          }
        },
        {
          $group: {
            _id: "$_id.date",
            weaponStats: {
              $push: {
                weapon: "$_id.weapon",
                standardKills: "$_id.weaponKills",
                precisionKills: "$_id.weaponPrecisionKills"
              }
            },
            gameStats: {
              $first: {
                totalKills: "$_id.totalKills",
                totalDeaths: "$_id.totalDeaths",
                totalAssists: "$_id.totalAssists",
                totalScore: "$_id.totalScore",
                victory: "$_id.victory",
                class: "$_id.class"
              }
            }
          }
        },
        {
          $sort: {
            _id: 1 
          }
        },
      ]
    )
    qwerty.push(overallGameStats)
  
    const datesAndClasses = await PGCR.aggregate(
      [
        {
          $unwind:   {
            path: "$game.Response.entries",
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $group: { //only returning 3 responses per date? OHH, COUNT MUST BE # OF TIMES EACH OCCURED
            _id: {
              date: "$game.Response.period",
              class: "$game.Response.entries.player.characterClass"
            },
            count: { $sum:1 } 
          }
        },
        {
          $sort: {
            _id: 1 
          }
        },
      ]
    )
    qwerty.push(datesAndClasses)
  
    const wepsOverTime = await PGCR.aggregate(
      [
        {
          $unwind:   {
            path: "$game.Response.entries",
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $unwind:   {
            path: "$game.Response.entries.extended.weapons",
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $group: { 
            _id: {
              date: "$game.Response.period",
              // class: "$game.Response.entries.player.characterClass",
              weapon: "$game.Response.entries.extended.weapons.referenceId"
            },
            count: { $sum:1 } 
          }
        },
        {
          $group: {
            _id: "$_id.date",
            weaponStats: {
              $push: {
                weapon: "$_id.weapon",
                count: "$count"
              }
            },
          }
        },
        {
          $sort: {
            _id: 1 
          }
        },
      ]
    )
    qwerty.push(wepsOverTime)
  
    const wepPop = await PGCR.aggregate(
      [
        {
          $unwind:   {
            path: "$game.Response.entries",
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $unwind:   {
            path: "$game.Response.entries.extended.weapons",
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $group: { 
            _id: "$game.Response.entries.extended.weapons.referenceId",
            count: { $sum:1 } 
          }
        },
        {
          $sort: {
            _id: 1 
          }
        },
      ]
    )
    qwerty.push(wepPop)

  // return statsForAll;
  // statsForAll.then(loadr => res.json(loadr));
  res.json(qwerty);

});


let firstResponse;
let secondResponse;
let membershipType;
let membershipId;
let finalResponse = [];


router.get("/first", (req, res) => {
  allResponses = [];
  allGames = [];
  finalResponse = [];
  let revisedArray = [];
  let saveThis;
  console.log("req.query", req.query)
  var mname = req.query.mname.replace("#", "%23");

  let searchUrl = `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/${req.query.mtype}/${mname}`;
  console.log("searchUrl: ", searchUrl);

  axios
    .get(
      // `https://www.bungie.net/Platform/Destiny2/4/Account/4611686018468446032/Character/2305843009301017785/Stats/AggregateActivityStats/`,
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

      axios
      .get(
        `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=200`,
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
        finalResponse.push(nameAndCharacters);
        return nameAndCharacters;
        // res.json(nameAndCharacters);
      })
      .then(async function(payload3) {
        let idHolder = Object.keys(payload3.characters.data);
        console.log("idHolder: ", idHolder);
        await Promise.all(idHolder.map(async (chidd) => {
          await axios
          .get(
            `https://www.bungie.net/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${chidd}/Stats/Activities/?mode=5&count=1`,
            {
              headers: {
                "Content-Type": "application/json",
                "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
              }
            }
          )
          .then(payload5 => {
            payload5.data.Response.activities.forEach(activity => {
            allResponses.push(activity.activityDetails.instanceId);
          })})
        }))
        return allResponses;
      })

      .then(async function(checkEachRefId) {
        console.log("checkEachRefId: ", checkEachRefId)
        await Promise.all(checkEachRefId.map(async (eachId) => {
          // let instId = "game.Response.activityDetails.instanceId";
          await PGCR.findOne({"game.Response.activityDetails.instanceId": eachId})
          .then(load => {
            if(load === null) {
              console.log(eachId, " has no record.  Keeping it in the array.");
              revisedArray.push(eachId);
            }
            else { 
              console.log("Record for " + eachId + " found!  Not including in revised array");
            }
          })
        }))
        return revisedArray
      })

      .then(async function(activityArrayPayload) {
        console.log("activityArrayPayload: ", activityArrayPayload)
        await Promise.all(activityArrayPayload.map(async (refId) => {
          await axios
          .get(
            `https://www.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/${refId}/`,
            {
              headers: {
                "Content-Type": "application/json",
                "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
              }
            }
          )
          .then(activityArrayResponsePayload => allGames.push(activityArrayResponsePayload.data))
        }))
        return allGames;
      })

      .then(async function(payloadToBeSaved) {
        await Promise.all(payloadToBeSaved.map(async (eachGame) => {
          let insertionObj = {game: eachGame};
          pg.collection.insert(insertionObj, onInsert);

          function onInsert(err, docs) {
            if (err) {
              console.log("Error!", err);
            } else {
              console.info("loadouts were successfully stored.", docs.length);
            }
          }
        }))
      })


      //hunter = 671679327
      //warlock = 2271682572
      //titan = 3655393761
      // "4611686018470723268"
      .then(async function() { //can make multiple pipelines on backend that save data and update infrequently
        const overallGameStats = await PGCR.aggregate(
          [
            {
              $unwind:   {
                path: "$game.Response.entries",
                preserveNullAndEmptyArrays: false
              }
            },
            // {
            //   $match: {
            //     "game.Response.entries.player.destinyUserInfo.membershipId": membershipId
            //   }
            // },
            {
              $unwind:   {
                path: "$game.Response.entries.extended.weapons",
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $group: {
                _id: {
                  date: "$game.Response.period",
                  weapon: "$game.Response.entries.extended.weapons.referenceId" ,
                  weaponKills: "$game.Response.entries.extended.weapons.values.uniqueWeaponKills.basic.value",
                  weaponPrecisionKills: "$game.Response.entries.extended.weapons.values.uniqueWeaponPrecisionKills.basic.value",
                  totalKills: "$game.Response.entries.values.kills.basic.value",
                  totalDeaths: "$game.Response.entries.values.deaths.basic.value",
                  totalAssists: "$game.Response.entries.values.assists.basic.value",
                  totalScore: "$game.Response.entries.values.score.basic.value",
                  victory: "$game.Response.entries.values.standing.basic.value",
                  class: "$game.Response.entries.player.characterClass"
                },
                count: { $sum:1 } //counts how many different weapons were used each game
              }
            },
            {
              $group: {
                _id: "$_id.date",
                weaponStats: {
                  $push: {
                    weapon: "$_id.weapon",
                    standardKills: "$_id.weaponKills",
                    precisionKills: "$_id.weaponPrecisionKills"
                  }
                },
                gameStats: {
                  $first: {
                    totalKills: "$_id.totalKills",
                    totalDeaths: "$_id.totalDeaths",
                    totalAssists: "$_id.totalAssists",
                    totalScore: "$_id.totalScore",
                    victory: "$_id.victory",
                    class: "$_id.class"
                  }
                }
              }
            },
            {
              $sort: {
                _id: 1 
              }
            },
          ]
        )
        finalResponse.push(overallGameStats)

        const datesAndClasses = await PGCR.aggregate(
          [
            {
              $unwind:   {
                path: "$game.Response.entries",
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $group: { //only returning 3 responses per date? OHH, COUNT MUST BE # OF TIMES EACH OCCURED
                _id: {
                  date: "$game.Response.period",
                  class: "$game.Response.entries.player.characterClass"
                },
                count: { $sum:1 } 
              }
            },
            {
              $sort: {
                _id: 1 
              }
            },
          ]
        )
        finalResponse.push(datesAndClasses)

        const wepsOverTime = await PGCR.aggregate(
          [
            {
              $unwind:   {
                path: "$game.Response.entries",
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $unwind:   {
                path: "$game.Response.entries.extended.weapons",
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $group: { 
                _id: {
                  date: "$game.Response.period",
                  // class: "$game.Response.entries.player.characterClass",
                  weapon: "$game.Response.entries.extended.weapons.referenceId"
                },
                count: { $sum:1 } 
              }
            },
            {
              $group: {
                _id: "$_id.date",
                weaponStats: {
                  $push: {
                    weapon: "$_id.weapon",
                    count: "$count"
                  }
                },
              }
            },
            {
              $sort: {
                _id: 1 
              }
            },
          ]
        )
        finalResponse.push(wepsOverTime)

        const wepPop = await PGCR.aggregate(
          [
            {
              $unwind:   {
                path: "$game.Response.entries",
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $unwind:   {
                path: "$game.Response.entries.extended.weapons",
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $group: { 
                _id: "$game.Response.entries.extended.weapons.referenceId",
                count: { $sum:1 } 
              }
            },
            {
              $sort: {
                _id: 1 
              }
            },
          ]
        )
        finalResponse.push(wepPop)
      
        return finalResponse;
      })

      .then(accountGameData => {
        // finalResponse.push(accountGameData);
        return accountGameData;
      })

      .then(finalPayload => res.json(finalPayload))
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