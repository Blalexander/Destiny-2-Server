const axios = require("axios");
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  // console.log(req.query.mtype, req.query.mname)
  console.log(req.query)
  // console.log(req.params)
  var mname = req.query.mname.replace("#", "%23");


  let searchUrl = `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/${req.query.mtype}/${mname}`;
  console.log(searchUrl);

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
      // console.log(payload.data)
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