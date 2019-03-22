const axios = require("axios");
const express = require("express");
const router = express.Router();


router.get("/second", (req, res) => {
  keepTrackOfHowMany = 0;
  allGames = [];
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
    // res.json(payload.data);
    keepTrackOfHowMany = payload.data.Response.activities.length;
    console.log(keepTrackOfHowMany);
    // console.log(payload.data);

    return payload.data;
  })
  .then(newPayload => {
    newPayload.Response.activities.forEach(activity => {
      allResponses.push(activity.activityDetails.referenceId);
    })
    // res.json(allResponses);
    return allResponses;
    //responds with an array of reference Ids
  })
  .then(activityArrayPayload => 
    getAllDaStuff(activityArrayPayload)
    // newItem.then(function(result) {
    //   let newResult = result;
    //   return(newResult);
    // })
    // console.log("newItem: ", newItem);
    // if(newItem.resolve(1)) {
    //   return(newItem);
    // }
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



function getAllDaStuff(something) {
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
        // return payload.data;
        // return payload.data;
        // let newItem = payload.data;
        allGames.push(payload.data);
        console.log("KTOHM: ", keepTrackOfHowMany, "allGames: ", allGames.length);
        // return allGames;
        // if(keepTrackOfHowMany == allGames.length) {

          return(allGames);
        // }
      })
      .then(payload => {
        if(keepTrackOfHowMany == payload.length) {
          resolve(payload);
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({
          message: "Something went wrong while querying Bungie"
        });
      });
    })
  })
}


let keepTrackOfHowMany = 0;

let firstResponse;
let secondResponse;
let thirdResponse;
let fourthResponse;
let fifthResponse;
let thirdData;
let firstSecondObj;
let fstObj;
let secondSet;
let thirdSet;
let allResponses = [];
let allGames = [];
let characterIdArray;
let characterId1;
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