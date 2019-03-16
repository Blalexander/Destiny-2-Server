const axios = require("axios");
const express = require("express");
const router = express.Router();

let secondResponse;
let thirdResponse;
let thirdData;
let firstSecondObj;
let fstObj;

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
    .then(payload1 => {
      return secondApiCall(payload1.data);
    })
    .then(payload2 => {
      return thirdApiCall(payload2.data);
    })
    .then(payload => {
      // console.log("Goal reached");
      // thirdData = payload;
      fstObj = Object.assign({}, secondResponse, thirdResponse, thirdData);
      console.log("Goal reached, fstObj", fstObj);
      res.json(fstObj);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        message: "Something went wrong while querying Bungie"
      });
    });
});

function secondApiCall(secondPayload) {
  // console.log("secondPayload: ", secondPayload);
  secondResponse = secondPayload.Response;
  console.log("secondResponse: ", secondResponse);
  // res.json(payload.data);
  membershipType = secondResponse[0].membershipType;
  membershipId = secondResponse[0].membershipId;
  console.log(membershipType, membershipId);

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
  .then(secondRequest => {
    console.log("Returning second request");
    // return secondRequest;
    return console.log(secondRequest.data);
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong while querying Bungie"
    });
  });
}


function thirdApiCall(thirdPayload) {
  // console.log("thirdPayload: ", thirdPayload);
  thirdResponse = thirdPayload.Response;
  console.log("thirdResponse: ", thirdResponse);
  firstSecondObj = Object.assign({}, secondResponse, thirdResponse);
  // console.log("Third data: ", thirdData);
  console.log("firstSecondObj: ", firstSecondObj);
  // console.log("keys: ", Object.keys(firstSecondObj.characters.data));

  axios
  .get(
    `https://www.bungie.net/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${Object.keys(firstSecondObj.characters.data)[0]}/Stats/Activities/?mode=5&count=5`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
      }
    }
  )
  .then(thirdRequest => {
    console.log("Returning third request");
    return thirdRequest;
    // thirdData = payload.data.Response;
    // fstObj = Object.assign({}, secondResponse, thirdResponse, thirdData);
    // // return console.log(fstObj);
    // return (fstObj);
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong while querying Bungie"
    });
  });
}

module.exports = router;