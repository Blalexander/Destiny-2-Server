const axios = require("axios");
const express = require("express");
const router = express.Router();

// GET request to http://localhost:3000/loadout/ works
router.get("/api/loadout", (req, res) => {
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

// function getGuardianIds(userData) {
//   let membershipType = userData.Response[0].membershipType;
//   let membershipId = userData.Response[0].membershipId;
//   return(
//     router.get("/", (req, res) => {
//       axios
//         .get(
//           `https://www.bungie.net/Platform/Destiny2/${
//             membershipType
//           }/Profile/${membershipId}/?components=200`,
//           { //currently querying for loadout information -- could be removed?
//             headers: {
//               "Content-Type": "application/json",
//               "X-API-Key": "62261ab05c7b4f078c05a94f18124761"
//             }
//           }
//         )
//         .then(payload => {
//           res.json(payload.data);
//         })
//         .catch(err => {
//           console.error(err);
//           res.status(500).json({
//             message: "Something went wrong while querying Bungie"
//           });
//         });
//     })
//   )
// }

module.exports = router;