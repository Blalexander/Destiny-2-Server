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

// getSecond(4, 4611686018470723268, 2305843009301006557);
// function getSecond(mtype, mid, chid) {
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

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // let insertionObj = {gamesPlayed: saveThis, masterArr: payload};

    // pg.collection.insert(insertionObj, onInsert);
  
    // function onInsert(err, docs) {
    //   if (err) {
    //     console.log("Error!", err);
    //   } else {
    //     console.info("PGCRs were successfully stored.", docs.length);
    //   }
    // }
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    res.json(payload);
  })
  // .catch(err => {
  //   console.error(err);
  //   res.status(500).json({
  //     message: "Something went wrong while querying Bungie"
  //   });
  // });
})/*?+*/


// let theArrrr = [ 1153409123, 1815340083, 399506119, 806094750, 2748633318 ];
// getAllDaStuff(theArrrr);
// function getAllDaStuff(something) {
//   console.log(something);
//   allGames = [];
//   return new Promise(function(resolve, reject) {
//     something.forEach(refId => {
//       axios
//       .get(
//         `https://www.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/${refId}/`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
//           }
//         }
//       )
//       .then(payload => {
//         console.log(payload.data.Response);
 
//         let refIdForPGCR = payload.data.Response.activityDetails.instanceId;
//         let entriesForPGCR = payload.data.Response.entries
//         let bigArray = [];

//         entriesForPGCR.forEach(async function(entry) {
//           let nameForPGCR = entry.characterId;
//           bigArray.push(nameForPGCR);
//           console.log("STARTING");

//           const xpvar = await fff();
          
//           function fff() {
//             return new Promise(resolve => {
//               PGCR.findOne({characterId: nameForPGCR}).then(load => {
//                 if(load === null) { //inserts if not there
//                   console.log(nameForPGCR, " has no record.  Inserting record now.");
//                   // let insertionObj = {characterId: nameForPGCR, referenceIdsForGamesPlayed: [refIdForPGCR], gameEntries: entry};
//                   let insertionObj = {characterId: nameForPGCR, referenceIdsForGamesPlayed: [refIdForPGCR]};
//                   resolve(pg.collection.insert(insertionObj, onInsert));
                
//                   function onInsert(err) {
//                     if (err) {
//                       console.log("Error!", err);
//                     } else {
//                       console.info("PGCRs were successfully stored.");
//                     }
//                   }
//                 }
//                 else if(load.referenceIdsForGamesPlayed.includes(refIdForPGCR)) { 
//                   console.log("Record for " + refIdForPGCR + " in " + nameForPGCR + " found!");
//                   resolve(pg.collection.update({characterId: nameForPGCR}, {$push: {referenceIdsForGamesPlayed: refIdForPGCR}}));
//                   // console.log("Game already in character's history!");
//                 }
//                 else { //updates if account present but no ref id yet
//                   console.log("Record found for account, updating history now!");
//                   resolve(pg.collection.update({characterId: nameForPGCR}, {$push: {referenceIdsForGamesPlayed: refIdForPGCR}}));
//                 }
//               })
//             })
//           }
        
//           return xpvar;
//         })

//         return(allGames);
//       })
//       .then(payload => {
//         if(keepTrackOfHowMany == payload.length) {
//           console.log("resolving payload");
//           resolve(payload);
//         }
//       })
//       .catch(err => {
//         console.error(err);
//         err.status(500).json({
//           message: "Something went wrong while querying Bungie"
//         });
//       });
//     })
//   })
// }

//YO THE CHARACTERID YOU'RE USING IS PROBABLY FOR THE OVERALL ACCOUNT/THE ID IS WRONG

// getFromDB();
// function getFromDB() {
router.get('/hope', jsonParser, (req, res) => {
  // console.log(req.body);
  // const myCursor = PGCR.find({}, {gamesPlayed: { $slice: 2 }}); 
  // const myCursor = PGCR.find({}, {period: 1}); //returns IDs of containing object
  // const myCursor = PGCR.find({}, {referenceId: 2047813119}); 

  // myCursor
  // PGCR.find({}, {referenceId: 2047813119})
  // PGCR.find({}, {displayName: "sirDumpsalot"})
  // PGCR.find({characterId: "2305843009403725857"}) // GETS ENTIRE CHARACTER OBJECT



  let myCursor = PGCR.find({characterId: "2305843009301006557"}); // GETS ENTIRE CHARACTER OBJECT RETURNS NULL
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

          await PGCR.findOne({characterId: nameForPGCR}).then(load => {
            if(load === null) {
              console.log(nameForPGCR, " has no record.  Inserting record now.");
              let insertionObj = {characterId: nameForPGCR, referenceIdsForGamesPlayed: [refIdForPGCR]};
              pg.collection.insert(insertionObj);
            
              // function onInsert(err) {
              //   if (err) {
              //     console.log("Error!", err);
              //   } else {
              //     console.info("PGCRs were successfully stored.");
              //   }
              // }

              return console.log("wasnt there!");
            }
            else if(load.referenceIdsForGamesPlayed.includes(refIdForPGCR)) { 
              console.log("Record for " + refIdForPGCR + " in " + nameForPGCR + " found!");
              pg.collection.update({characterId: nameForPGCR}, {$push: {referenceIdsForGamesPlayed: refIdForPGCR}});
              
              return console.log("was there!");
            }
            else {
              console.log("Record found for account ID: " + nameForPGCR + " updating history now!");
              pg.collection.update({characterId: nameForPGCR}, {$push: {referenceIdsForGamesPlayed: refIdForPGCR}});

              return console.log("was there x2!");
            }
          })
        }

        return console.log("reached the end!", entryIterator);
      })
      .then(() => {
        console.log("bigArray.unique", bigArray.unique().length);
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





// function getAllDaStuff(something) {
//   allGames = [];
//   return new Promise(function(resolve, reject) {
//     something.forEach(refId => {
//       axios
//       .get(
//         `https://www.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/${refId}/`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
//           }
//         }
//       )
//       .then(payload => {
//         console.log(payload.data.Response.period);
//         allGames.push(payload.data);
//         console.log("KTOHM: ", keepTrackOfHowMany, "allGames: ", allGames.length);
//         return(allGames);
//       })
//       .then(payload => {
//         if(keepTrackOfHowMany == payload.length) {
//           console.log("resolving payload");
//           resolve(payload);
//         }
//       })
//       .catch(err => {
//         allGames.push("404");
//         console.log("Throwing a 404!");
//         return(allGames);
//       });
//     })
//   })
// }


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

// router.use('*', function (req, res) {
//   res.status(404).json({ message: 'Not Found' });
// });

module.exports = router;



// if(load === null) { //inserts if not there
//   console.log(nameForPGCR, " has no record.  Inserting record now.");
//   // let insertionObj = {characterId: nameForPGCR, referenceIdsForGamesPlayed: [refIdForPGCR], gameEntries: entry};
//   let insertionObj = {characterId: nameForPGCR, referenceIdsForGamesPlayed: [refIdForPGCR]};
//   pg.collection.insert(insertionObj, onInsert);

//   function onInsert(err) {
//     if (err) {
//       console.log("Error!", err);
//     } else {
//       console.info("PGCRs were successfully stored.");
//     }
//   }
// }
// else if(load.referenceIdsForGamesPlayed.includes(refIdForPGCR)) { 
//   console.log("Record for " + refIdForPGCR + " in " + nameForPGCR + " found!");
//   pg.collection.update({characterId: nameForPGCR}, {$push: {referenceIdsForGamesPlayed: refIdForPGCR}});
//   // console.log("Game already in character's history!");
// }
// else { //updates if account present but no ref id yet
//   console.log("Record found for account, updating history now!");
//   pg.collection.update({characterId: nameForPGCR}, {$push: {referenceIdsForGamesPlayed: refIdForPGCR}});
// }
// return bigArray;
// })///////////////////////////////////////THAT ALL WORKS ^, NOW, CONDENSE RESULTS AFTER EACH TIMES IT'S RUN //OR MAKE EACH SAVE A PROMISE AND AVOID ANY CHECKING AFTERWARD (BETTEREST?)
// .then(biggie => {
// biggie.forEach(charId => {
//   PGCR.find({characterId: charId}).then(loads => {
//     if(loads.length > 1) {
//       pg.collection.update({characterId: charId}, {$push: {referenceIdsForGamesPlayed: refIdForPGCR}});
//     }
//   })
// })
// })