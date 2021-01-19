// 'use strict';
const axios = require("axios");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { PGCR } = require("./models");
const { Mani } = require("./models");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

mongoose.connect("mongodb://blake:blake1@ds131903.mlab.com:31903/node-capstone", function(err) {
    if (err) {
        console.log('Not connected to the database: ' + err);
    } else {
        console.log('Successfully connected to MongoDB')
    }
});


let sent = false;
let dataHolder;

// let updatedManifestUrl = axios
//   .get('https://www.bungie.net/Platform/Destiny2/Manifest/',
//   {
//   headers: {
//     "Content-Type": "application/json",
//     "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
//   }
// }).then(manifestRoutes => {
//   // console.log('https://www.bungie.net' + manifestRoutes.data.Response.jsonWorldContentPaths.en)
//   return 'https://www.bungie.net' +  manifestRoutes.data.Response.jsonWorldContentPaths.en
// }).catch(() => {
//   console.log("Woops!  Error retrieving manifest URLs")
// })

console.log("Starting...")
async function axiosRes(wepPop) { 
  if(sent === false) {
    // updatedManifestUrl = String(updatedManifestUrl)
    const returnItem = await axios
    .get(
      'https://www.bungie.net/common/destiny2_content/json/en/aggregate-9e74fb2c-ebb2-4e5b-8378-d7ea4b5dd54a.json',
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
        }
      }
    )
    .then(payload => {
      console.log("Success!")
      // qwerty.push(payload)
      // return payload.data.DestinyInventoryItemDefinition
      let newItem = payload.data.DestinyInventoryItemDefinition
      let plugRoute = payload.data.DestinyPlugSetDefinition
      let socketArray = [];
      let newishObj = {};
      let newestObj = {};
      let statObj = {};
      let medalsObj = {};
      let eachPlayerStatAverages = { 
        "Sidearm": {},
        "Auto Rifle": {},
        "Pulse Rifle": {},
        "Combat Bow": {},
        "Scout Rifle": {},
        "Hand Cannon": {},
        "Sniper Rifle": {},
        "Submachine Gun": {},
        "Trace Rifle": {},
        "Fusion Rifle": {},
        "Linear Fusion Rifle": {},
        "Grenade Launcher": {},
        "Shotgun": {},
        "Rocket Launcher": {},
        "Sword": {},
        "Machine Gun": {},
        "All Types": {
          count: 0
        }
      };

      // for(let unprocessedMedalGroups in medals) {
      //   for(let eachMedalGroup in unprocessedMedalGroups) {
      //     if(medalsObj)
      //   }
      // }

      for(let entry in wepPop) {
        let idToUse = wepPop[entry]._id;
        console.log("idToUse", idToUse)
        let intSocketsVals = newItem[idToUse].sockets.socketEntries.map((eachSocket, indy) => {
          if(indy === 0) {
            if(!socketArray.includes(eachSocket.singleInitialItemHash))
            {
              socketArray.push(eachSocket.singleInitialItemHash)
            }
            return eachSocket.singleInitialItemHash
          }
          // return eachSocket.singleInitialItemHash
        })
        let varSocketsVals = newItem[idToUse].sockets.socketEntries.map(eachSocket => {
          // if(eachSocket.reusablePlugItems.length != 100) {
          //   if(eachSocket.reusablePlugItems.length != 0) {
          //     let hashMaker = eachSocket.reusablePlugItems.map(eachPlugItem => { 
          //       // console.log(eachPlugItem)
          //       if(!socketArray.includes(eachPlugItem.plugItemHash)) { //specifically for gathering socket defs
          //         socketArray.push(eachPlugItem.plugItemHash)
          //       }
          //       return eachPlugItem.plugItemHash
          //     })
          //     return hashMaker
          //   }
          //   else {
              if(eachSocket.randomizedPlugSetHash) {
                let hashMaker = plugRoute[eachSocket.randomizedPlugSetHash].reusablePlugItems.map(eachPlugItem => { //reusable
                  // console.log(eachPlugItem)
                  if(!socketArray.includes(eachPlugItem.plugItemHash)) { //specifically for gathering socket defs
                    socketArray.push(eachPlugItem.plugItemHash)
                  }
                  return eachPlugItem.plugItemHash
                })
                return hashMaker
              }
              else if(eachSocket.reusablePlugSetHash) {
                let hashMaker = plugRoute[eachSocket.reusablePlugSetHash].reusablePlugItems.map(eachPlugItem => { //reusable
                  // console.log(eachPlugItem)
                  if(!socketArray.includes(eachPlugItem.plugItemHash)) { //specifically for gathering socket defs
                    socketArray.push(eachPlugItem.plugItemHash)
                  }
                  return eachPlugItem.plugItemHash
                })
                return hashMaker
              }
            // }
          // }
        })
        let allSocketDefs = socketArray.forEach(es => { //FINISH
          if(newItem[es]) {
            newestObj[es] = {
              socketName: newItem[es].displayProperties.name,
              socketDesc: newItem[es].displayProperties.description,
              socketIcon: newItem[es].displayProperties.icon,
              socketType: newItem[es].itemTypeDisplayName,
            }
          }
        })
        let statDefinitions = Object.keys(newItem[idToUse].stats.stats);
        let revisedDefs = statDefinitions.forEach(eachStat => {
          if(!statObj[eachStat]) {
            // statArray.push(eachStat);
            statObj[payload.data.DestinyStatDefinition[eachStat].displayProperties.name] = {
              statHash:  eachStat,
              statDesc: payload.data.DestinyStatDefinition[eachStat].displayProperties.description
            }
          }
        })
        newishObj[idToUse] = {
          weaponHash: idToUse,
          weaponName: newItem[idToUse].displayProperties.name,
          weaponDescription: newItem[idToUse].displayProperties.description,
          weaponIcon: newItem[idToUse].displayProperties.icon,
          weaponScreenshot: newItem[idToUse].screenshot,
          weaponType: newItem[idToUse].itemTypeDisplayName,
          weaponTier: newItem[idToUse].inventory.tierType,
          ammoType: newItem[idToUse].equippingBlock.ammoType,
          damageType: newItem[idToUse].damageTypeHashes,
          itemCategories: newItem[idToUse].itemCategoryHashes,
          intSockets: intSocketsVals, 
          varSockets: varSocketsVals,
          weaponValues: newItem[idToUse].stats.stats,
          playerPerformances: wepPop[entry]
        };
      }
      newishObj.socketDefs = newestObj
      newishObj.statDefs = statObj

      for (let eachWeaponKey in newishObj) {
        let wepType = newishObj[eachWeaponKey].weaponType;
    
        if(wepType) {
          if(eachPlayerStatAverages[wepType].count === undefined) {
            eachPlayerStatAverages[wepType].count = 1;
          }
          else {
            eachPlayerStatAverages[wepType].count++;
            eachPlayerStatAverages["All Types"].count++;
          }
    
          for (let eachWepPlayerStat in newishObj[eachWeaponKey].playerPerformances) {
            if(eachWepPlayerStat !== "_id" && eachWepPlayerStat !== "totalCount") {
              if(eachPlayerStatAverages[wepType][eachWepPlayerStat] === undefined) {
                eachPlayerStatAverages[wepType][eachWepPlayerStat] = newishObj[eachWeaponKey].playerPerformances[eachWepPlayerStat]
                if(eachPlayerStatAverages["All Types"][eachWepPlayerStat] === undefined) {
                  eachPlayerStatAverages["All Types"][eachWepPlayerStat] = newishObj[eachWeaponKey].playerPerformances[eachWepPlayerStat]
                }
              }
              else {
                eachPlayerStatAverages[wepType][eachWepPlayerStat] += newishObj[eachWeaponKey].playerPerformances[eachWepPlayerStat]
                eachPlayerStatAverages["All Types"][eachWepPlayerStat] += newishObj[eachWeaponKey].playerPerformances[eachWepPlayerStat]
              }
            }
          }
    
          for (let eachWepPlayerStat in newishObj[eachWeaponKey].weaponValues) {
            if(eachWepPlayerStat !== "_id" && eachWepPlayerStat !== "totalCount") {
              if(eachPlayerStatAverages[wepType][eachWepPlayerStat] === undefined) {
                eachPlayerStatAverages[wepType][eachWepPlayerStat] = newishObj[eachWeaponKey].weaponValues[eachWepPlayerStat].value
                if(eachPlayerStatAverages["All Types"][eachWepPlayerStat] === undefined) {
                  eachPlayerStatAverages["All Types"][eachWepPlayerStat] = newishObj[eachWeaponKey].weaponValues[eachWepPlayerStat].value
                }
              }
              else {
                eachPlayerStatAverages[wepType][eachWepPlayerStat] += newishObj[eachWeaponKey].weaponValues[eachWepPlayerStat].value
                eachPlayerStatAverages["All Types"][eachWepPlayerStat] += newishObj[eachWeaponKey].weaponValues[eachWepPlayerStat].value
              }
            }
          }
    
        }
      }
    
      for(let eachWepType in eachPlayerStatAverages) {
        for(let eachWepStat in eachPlayerStatAverages[eachWepType]) {
          if(eachWepStat !== "count") {
            eachPlayerStatAverages[eachWepType][eachWepStat] /= eachPlayerStatAverages[eachWepType].count
          }
        }
        eachPlayerStatAverages[eachWepType].kdAvg = (eachPlayerStatAverages[eachWepType].killsAvg + eachPlayerStatAverages[eachWepType].assistsAvg) / eachPlayerStatAverages[eachWepType].deathsAvg
      }

      // console.log(newishObj.socketDefs)
      newishObj.playerAvgs = eachPlayerStatAverages
      sent = true;
      dataHolder = newishObj
      return newishObj
    })
    return returnItem
  }
  else if (sent === true) {
    const returnItem = dataHolder;
    return returnItem
  }
  return dataHolder
}


let keepTrackOfHowMany = 0;
let allResponses = [];
let allGames = [];
let allInstanceIds = [];
let childId;
const pg = PGCR();
const Mfst = Mani();



router.get("/second", (req, res) => {
  keepTrackOfHowMany = 0;
  allResponses = [];
  let saveThis;
  childId = req.query.chid;
  axios
  .get(
    // `https://www.bungie.net/Platform/Destiny2/${req.query.mtype}/Account/${req.query.mid}/Character/${req.query.chid}/Stats/Activities/?mode=5&count=5`,
    'https://www.bungie.net/common/destiny2_content/json/en/aggregate-0a10bfd0-2d5d-4d4c-9804-0a20e4e23da9.json',
    // {
    //   headers: {
    //     "Content-Type": "application/json",
    //     "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
    //   }
    // }
  )
  .then(payload => {
    // let thisItem = payload.DestinyClassDefinition[671679327].hash;
    // let thisItem = payload.data.DestinyInventoryItemDefinition;
    // let thisItem = payload.data.DestinyStatDefinition;
    let thisItem = payload.data.DestinyActivityDefinition;
    let thisItem2 = Object.keys(thisItem);
    let insertionObj = {manifest: thisItem};
    // Mfst.collection.insert(insertionObj, onInsert);

    let weaponTypes = ["Sidearm", "Auto Rifle", "Pulse Rifle", "Combat Bow", "Scout Rifle", "Hand Cannon", "Sniper Rifle", "Submachine Gun", "Trace Rifle", "Linear Fusion Rifle", "Grenade Launcher", "Shotgun", "Rocket Launcher", "Sword", "Machine Gun", "Fusion Rifle"];

    let wepObj = {};

    thisItem2.forEach(item => {
      // console.log(item)
      // if(weaponTypes.includes(thisItem[item].itemTypeDisplayName)) {
      //   return wepObj[item] = {
      //     "weaponName": thisItem[item].displayProperties.name,
      //     "weaponIcon": thisItem[item].displayProperties.icon,
      //     "weaponType": thisItem[item].itemTypeDisplayName,
      //     "weaponTier": thisItem[item].inventory.tierType,
      //     "ammoType": thisItem[item].equippingBlock.ammoType,
      //     "itemCategories": thisItem[item].itemCategoryHashes,
      //     "weaponValues": thisItem[item].stats.stats,
      //     "weaponIntrinsicSocket": thisItem[item].sockets.socketEntries[0].singleInitialItemHash
      //   };

        // wepObj[item] = {
        //   "name": thisItem[item].displayProperties.name,
        //   "description": thisItem[item].displayProperties.description
        // }

      if(thisItem[item].isPvP === true) {
        return wepObj[item] = {
          "locationName": thisItem[item].displayProperties.name,
          "locationDescription": thisItem[item].displayProperties.description,
          "locationImage": thisItem[item].pgcrImage
        }

      //   // return Mfst.collection.insert({manifest: finalItem}, onInsert);
      }
      else {
        return("nope")
      }
    })

    // function onInsert(err, docs) {
    //   if (err) {
    //     console.log("Error!", err);
    //   } else {
    //     console.info("Manifest was successfully stored.", docs.length);
    //   }
    // }

    // res.json("done!");
    // console.log(payload.data);
    res.status(200).json(wepObj)
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



router.get('/hoping', jsonParser, async (req, res) => {
  // const manifest = await fetch('https://www.bungie.net/common/destiny2_content/json/en/aggregate-b9ff7c84-35cc-4e9b-be1e-a23739d514c2.json',).then(res => {
  //   return res.json()
  // });
  axios
  .get(
    'https://www.bungie.net/common/destiny2_content/json/en/aggregate-f2cf75d7-0de6-4488-aad0-2fa02a0ac343.json',
    {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
      }
    }
  )
  .then(payload => {
    let thisThing = Object.keys(payload.data.DestinyInventoryItemDefinition) //this works!!
    res.json(thisThing)
  })
  // res.json(manifest)
})

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
              grenadeKills: "$game.Response.entries.extended.values.weaponKillsGrenade.basic.value",
              meleeKills: "$game.Response.entries.extended.values.weaponKillsMelee.basic.value",
              abilityKills: "$game.Response.entries.extended.values.weaponKillsAbility.basic.value",
              superKills: "$game.Response.entries.extended.values.weaponKillsSuper.basic.value",
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
    // qwerty.push(overallGameStats)
  
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
    // qwerty.push(datesAndClasses)
  
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
    // qwerty.push(wepsOverTime)
  
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
            _id: {
              primaryWep: "$game.Response.entries.extended.weapons.referenceId",
              pAssists: "$game.Response.entries.values.assists.basic.value",
              pScore: "$game.Response.entries.values.score.basic.value",
              pKills: "$game.Response.entries.values.kills.basic.value",
              pWepKills: "$game.Response.entries.extended.weapons.values.uniqueWeaponKills.basic.value",
              pWepPrecKills: "$game.Response.entries.extended.weapons.values.uniqueWeaponKillsPrecisionKills.basic.value",
              grenadeKills: "$game.Response.entries.extended.values.weaponKillsGrenade.basic.value",
              meleeKills: "$game.Response.entries.extended.values.weaponKillsMelee.basic.value",
              abilityKills: "$game.Response.entries.extended.values.weaponKillsAbility.basic.value",
              superKills: "$game.Response.entries.extended.values.weaponKillsSuper.basic.value",
              pDeaths: "$game.Response.entries.values.deaths.basic.value",
              pAvPerKill: "$game.Response.entries.values.averageScorePerKill.basic.value",
              pAvPerLife: "$game.Response.entries.values.averageScorePerLife.basic.value",
              pOppDefeated: "$game.Response.entries.values.opponentsDefeated.basic.value",
              pEff: "$game.Response.entries.values.efficiency.basic.value",
              pStanding: "$game.Response.entries.values.standing.basic.value"
            },
            count: { $sum:1 } 
          }
        },
        {
          $group: {
            _id: "$_id.primaryWep",
            assistsAvg: {
              $avg: "$_id.pAssists"
            },
            scoreAvg: {
              $avg: "$_id.pScore"
            },
            killsAvg: {
              $avg: "$_id.pKills"
            },
            wepKillsAvg: {
              $avg: "$_id.pWepKills"
            },
            wepPrecKillsAvg: {
              $avg: "$_id.pWepPrecKills"
            },
            grenadeKills: {
              $avg: "$_id.grenadeKills"
            },
            meleeKills: {
              $avg: "$_id.meleeKills"
            },
            abilityKills: {
              $avg: "$_id.abilityKills"
            },
            superKills: {
              $avg: "$_id.superKills"
            },
            deathsAvg: {
              $avg: "$_id.pDeaths"
            },
            perKAvg: {
              $avg: "$_id.pAvPerKill"
            },
            perLAvg: {
              $avg: "$_id.pAvPerLife"
            },
            oppDefAvg: {
              $avg: "$_id.pOppDefeated"
            },
            effAvg: {
              $avg: "$_id.pEff"
            },
            standingAvg: {
              $avg: "$_id.pStanding"
            },
            totalCount: { $sum: "$count" } 
          }
        },
        {
          $sort: {
            totalCount: -1 
          }
        },
      ]
    )
    // for(let entry in wepPop) {
    //   let idToUse = entry._id;
    //   entry.wepName = manifest.DestinyInventoryItemDefinition[idToUse].displayProperties.name;
    // }
    // qwerty.push(wepPop)
    // getWepDefinitions(wepPop)
    // const manifest = await fetch('https://www.bungie.net/common/destiny2_content/json/en/aggregate-2897f1bd-269c-4b6e-a1bf-61a8577b687b.json',).then(res => {
    //   return res.json()
    // });
    // qwerty.push(manifest.DestinyInventoryItemDefinition)

    const duoWepPop = await PGCR.aggregate(
      [
        {
          $unwind:   {
            path: "$game.Response.entries",
            preserveNullAndEmptyArrays: false
          }
        },
        // {
        //   $unwind:   {
        //     path: "$game.Response.entries.extended.weapons",
        //     preserveNullAndEmptyArrays: false
        //   }
        // },
        {
          $group: { 
            _id: {
              wepHashes: "$game.Response.entries.extended.weapons.referenceId",
              wepKills: "$game.Response.entries.extended.weapons.values.uniqueWeaponKills.basic.value",
              grenadeKills: "$game.Response.entries.extended.values.weaponKillsGrenade.basic.value",
              meleeKills: "$game.Response.entries.extended.values.weaponKillsMelee.basic.value",
              abilityKills: "$game.Response.entries.extended.values.weaponKillsAbility.basic.value",
              superKills: "$game.Response.entries.extended.values.weaponKillsSuper.basic.value",
              pAssists: "$game.Response.entries.values.assists.basic.value",
              pScore: "$game.Response.entries.values.score.basic.value",
              pKills: "$game.Response.entries.values.kills.basic.value",
              pDeaths: "$game.Response.entries.values.deaths.basic.value",
              pAvPerKill: "$game.Response.entries.values.averageScorePerKill.basic.value",
              pAvPerLife: "$game.Response.entries.values.averageScorePerLife.basic.value",
              pOppDefeated: "$game.Response.entries.values.opponentsDefeated.basic.value",
              pEff: "$game.Response.entries.values.efficiency.basic.value",
              pStanding: "$game.Response.entries.values.standing.basic.value",
            },
            count: { $sum:1 } 
          }
        },
        {
          $group: {
            _id: "$_id.wepHashes",
            allHashes: {
              $addToSet: "$_id.wepHashes"
            },
            allKills: {
              $push: "$_id.wepKills"
            },
            grenadeKills: {
              $avg: "$_id.grenadeKills"
            },
            meleeKills: {
              $avg: "$_id.meleeKills"
            },
            abilityKills: {
              $avg: "$_id.abilityKills"
            },
            superKills: {
              $avg: "$_id.superKills"
            },
            assistsAvg: {
              $avg: "$_id.pAssists"
            },
            scoreAvg: {
              $avg: "$_id.pScore"
            },
            killsAvg: {
              $avg: "$_id.pKills"
            },
            deathsAvg: {
              $avg: "$_id.pDeaths"
            },
            perKAvg: {
              $avg: "$_id.pAvPerKill"
            },
            perLAvg: {
              $avg: "$_id.pAvPerLife"
            },
            oppDefAvg: {
              $avg: "$_id.pOppDefeated"
            },
            effAvg: {
              $avg: "$_id.pEff"
            },
            standingAvg: {
              $avg: "$_id.pStanding"
            },
            totalCount: { $sum: "$count" } 
          }
        },
        {
          $sort: {
            totalCount: -1 
          }
        },
        // {
        //   $limit: 10
        // }
      ]
    )
    // qwerty.push(duoWepPop)

    const classes = await PGCR.aggregate(
      [
        {
          $unwind:   {
            path: "$game.Response.entries",
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $group: { 
            _id: {
              class: "$game.Response.entries.player.characterClass"
            },
            count: { $sum:1 } 
          }
        },
        {
          $sort: { 
            score: { $meta: "textScore" }, 
            "_id.class": 1 
          }
        },
      ]
    )
    // qwerty.push(classes)

    const classStats = await PGCR.aggregate(
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
              class: "$game.Response.entries.player.characterClass",
              pAssists: "$game.Response.entries.values.assists.basic.value",
              pScore: "$game.Response.entries.values.score.basic.value",
              pKills: "$game.Response.entries.values.kills.basic.value",
              pDeaths: "$game.Response.entries.values.deaths.basic.value",
              pAvPerKill: "$game.Response.entries.values.averageScorePerKill.basic.value",
              pAvPerLife: "$game.Response.entries.values.averageScorePerLife.basic.value",
              pOppDefeated: "$game.Response.entries.values.opponentsDefeated.basic.value",
              pEff: "$game.Response.entries.values.efficiency.basic.value",
              pStanding: "$game.Response.entries.values.standing.basic.value",
              grenadeKills: "$game.Response.entries.extended.values.weaponKillsGrenade.basic.value",
              meleeKills: "$game.Response.entries.extended.values.weaponKillsMelee.basic.value",
              superKills: "$game.Response.entries.extended.values.weaponKillsSuper.basic.value",
              abilityKills: "$game.Response.entries.extended.values.weaponKillsAbility.basic.value",
            },
            count: { $sum:1 } 
          }
        },
        {
          $group: {
            _id: "$_id.class",
            assistsAvg: {
              $avg: "$_id.pAssists"
            },
            scoreAvg: {
              $avg: "$_id.pScore"
            },
            killsAvg: {
              $avg: "$_id.pKills"
            },
            deathsAvg: {
              $avg: "$_id.pDeaths"
            },
            perKAvg: {
              $avg: "$_id.pAvPerKill"
            },
            perLAvg: {
              $avg: "$_id.pAvPerLife"
            },
            oppDefAvg: {
              $avg: "$_id.pOppDefeated"
            },
            effAvg: {
              $avg: "$_id.pEff"
            },
            standingAvg: {
              $avg: "$_id.pStanding"
            },
            grenadeAvg: {
              $avg: "$_id.grenadeKills"
            },
            meleeAvg: {
              $avg: "$_id.meleeKills"
            },
            superAvg: {
              $avg: "$_id.superKills"
            },
            abilityAvg: {
              $avg: "$_id.abilityKills"
            },
            totalCount: { $sum: "$count" } 
          }
        },
        {
          $sort: { 
            score: { $meta: "textScore" }, 
            _id: 1 
          }
        },
        // {
        //   $limit: 10
        // }
      ]
    )
    // qwerty.push(classStats)

    const mapStats = await PGCR.aggregate(
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
              class: "$game.Response.entries.player.characterClass",
              map: "$game.Response.activityDetails.referenceId",
            },
            count: { $sum:1 },
            standing: {
                $avg: "$game.Response.entries.values.standing.basic.value"
              }
          }
        },
        {
          $group: {
            _id: "$_id.map",
            classWins: {
              $push: {
                class: "$_id.class",
                winRate: "$standing"
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
    // qwerty.push(mapStats)
    // console.log("Starting...")
    // const axiosRes = await axios
    // .get(
    //   'https://www.bungie.net/common/destiny2_content/json/en/aggregate-b9ff7c84-35cc-4e9b-be1e-a23739d514c2.json',
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //       "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
    //     }
    //   }
    // )
    // .then(payload => {
    //   console.log("Success!")
    //   // qwerty.push(payload)
    //   // return payload.data.DestinyInventoryItemDefinition
    //   let newItem = payload.data.DestinyInventoryItemDefinition
    //   let socketArray = [];
    //   let newishObj = {};
    //   let newestObj = {};
    //   for(let entry in wepPop) {
    //     let idToUse = wepPop[entry]._id;
    //     // console.log(idToUse)
    //     let intSocketsVals = newItem[idToUse].sockets.intrinsicSockets.map(eachSocket => { //MIGHT HAVE TO START SENDING SOCKET DATA FROM HERE.  LIKE YOU DID WITH WEPPOP, CYCLE THROUGH EACH SOCKET, KEEP A LIST, SEND DEFS TO FRONTEND
    //       if(!socketArray.includes(eachSocket.plugItemHash)) {
    //         socketArray.push(eachSocket.plugItemHash)
    //       }
    //       return eachSocket.plugItemHash
    //     })
    //     let varSocketsVals = newItem[idToUse].sockets.socketEntries.map(eachSocket => {
    //       if(eachSocket.reusablePlugItems.length != 100) {
    //         let hashMaker = eachSocket.reusablePlugItems.map(eachPlugItem => {
    //           if(!socketArray.includes(eachPlugItem.plugItemHash)) {
    //             socketArray.push(eachPlugItem.plugItemHash)
    //           }
    //           eachPlugItem.plugItemHash
    //         })
    //         return hashMaker
    //       }
    //     })
    //     let allSocketDefs = socketArray.forEach(es => { //FINISH
    //       newestObj[es] = {
    //         socketName: newItem[es].displayProperties.name,
    //         socketDesc: newItem[es].displayProperties.description,
    //         socketIcon: newItem[es].displayProperties.icon,
    //         socketType: newItem[es].itemTypeDisplayName,
    //       }
    //     })
    //     newishObj[idToUse] = {
    //       weaponName: newItem[idToUse].displayProperties.name,
    //       weaponIcon: newItem[idToUse].displayProperties.icon,
    //       weaponType: newItem[idToUse].itemTypeDisplayName,
    //       weaponTier: newItem[idToUse].inventory.tierType,
    //       ammoType: newItem[idToUse].equippingBlock.ammoType,
    //       itemCategories: newItem[idToUse].itemCategoryHashes,
    //       intSockets: intSocketsVals,
    //       varSockets: varSocketsVals,
    //       weaponValues: newItem[idToUse].stats.stats
    //     };
    //   }
    //   newishObj.socketDefs = newestObj
    //   return newishObj
    // })

    // const medals = await PGCR.aggregate(
    //   [{
    //     $unwind: {
    //       path: "$game.Response.entries",
    //       preserveNullAndEmptyArrays: false
    //     },
    //     $unwind: {
    //       path: "$game.Response.entries.extended.weapons",
    //       preserveNullAndEmptyArrays: false
    //     },
    //     $group: {
    //       _id: {
    //         primaryWep: "$game.Response.entries.extended.weapons.referenceId",
    //         medals: "$game.Response.entries.extended.values",
    //       },
    //       count: { $sum:1 } 
    //     },
    //     $group: {
    //       _id: "$_id.primaryWep",

    //       medalsEarned: {
    //         $push: "$_id.medals"
    //       },
    //       totalCount: { $sum: "$count" } 
    //     },
    //     $sort: {
    //       totalCount: -1
    //     }
    //   }]
    // )

    let finalizedRes = await axiosRes(wepPop); //send secondary medal query
    qwerty.push(finalizedRes)
    // for(let entry in wepPop) {
    //   let idToUse = entry._id;
    //   entry.wepName = axiosRes[idToUse].displayProperties.name;
    // }

  // const allWepVals = await Mani.find();
  // qwerty.push(allWepVals); 
  // return statsForAll;
  // statsForAll.then(loadr => res.json(loadr));
  res.json(qwerty);

});

let firstResponse;
let secondResponse;
let membershipType;
let membershipId;
let finalResponse = [];


router.get("/combinations", async (req, res) => {
  console.log(req.query.hash)
  let wepToFind = req.query.hash;
  let numToFind = Number(wepToFind);
  // console.log(wepToFind)
  
  const weaponCombinations = await PGCR.aggregate(
    [
      {
        $unwind:   {
          path: "$game.Response.entries",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          "game.Response.entries.extended.weapons.referenceId": numToFind
        }
      },
      {
        $group: { 
          _id: {
            wepHashes: "$game.Response.entries.extended.weapons.referenceId",
            wepKills: "$game.Response.entries.extended.weapons.values.uniqueWeaponKills.basic.value",
            grenadeKills: "$game.Response.entries.extended.values.weaponKillsGrenade.basic.value",
            meleeKills: "$game.Response.entries.extended.values.weaponKillsMelee.basic.value",
            abilityKills: "$game.Response.entries.extended.values.weaponKillsAbility.basic.value",
            superKills: "$game.Response.entries.extended.values.weaponKillsSuper.basic.value",
            pAssists: "$game.Response.entries.values.assists.basic.value",
            pScore: "$game.Response.entries.values.score.basic.value",
            pKills: "$game.Response.entries.values.kills.basic.value",
            pDeaths: "$game.Response.entries.values.deaths.basic.value",
            pAvPerKill: "$game.Response.entries.values.averageScorePerKill.basic.value",
            pAvPerLife: "$game.Response.entries.values.averageScorePerLife.basic.value",
            pOppDefeated: "$game.Response.entries.values.opponentsDefeated.basic.value",
            pEff: "$game.Response.entries.values.efficiency.basic.value",
            pStanding: "$game.Response.entries.values.standing.basic.value",
          },
          count: { $sum:1 } 
        }
      },
      {
        $group: {
          _id: "$_id.wepHashes",
          allHashes: {
            $addToSet: "$_id.wepHashes"
          },
          allKills: {
            $push: "$_id.wepKills"
          },
          grenadeKills: {
            $avg: "$_id.grenadeKills"
          },
          meleeKills: {
            $avg: "$_id.meleeKills"
          },
          abilityKills: {
            $avg: "$_id.abilityKills"
          },
          superKills: {
            $avg: "$_id.superKills"
          },
          assistsAvg: {
            $avg: "$_id.pAssists"
          },
          scoreAvg: {
            $avg: "$_id.pScore"
          },
          killsAvg: {
            $avg: "$_id.pKills"
          },
          deathsAvg: {
            $avg: "$_id.pDeaths"
          },
          perKAvg: {
            $avg: "$_id.pAvPerKill"
          },
          perLAvg: {
            $avg: "$_id.pAvPerLife"
          },
          oppDefAvg: {
            $avg: "$_id.pOppDefeated"
          },
          effAvg: {
            $avg: "$_id.pEff"
          },
          standingAvg: {
            $avg: "$_id.pStanding"
          },
          totalCount: { $sum: "$count" } 
        }
      },
      {
        $sort: {
          totalCount: -1
        }
      },
    ]
  )
    res.json(weaponCombinations)
})

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
            `https://www.bungie.net/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${chidd}/Stats/Activities/?mode=5&count=100`,
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
                count: -1 
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