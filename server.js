// require("dotenv").config();


const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const morgan = require('morgan');

app.use(morgan('common'));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({origin: "*"}));


// const bungieRoute = require("./routes/bungieRouter");
// app.use("/bungie", bungieRoute);

// const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.json({ok: true});
});

// app.get('/api/*', (req, res) => {
//   res.json({ok: true});
// });

const { PORT } = require("./config");
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));



const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Admin:Admin%40RTH@cluster0.qbhpb.mongodb.net/rth_development?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("rth_development").collection("devel_coll");
  // perform actions on the collection object
  client.close();
});

app.post('/test', (req, res) => {
  console.log(req.body, req.query)
  const requiredFields = ['name', 'borough', 'cuisine'];
  // for (let i=0; i<requiredFields.length; i++) {
  //   const field = requiredFields[i];
  //   if (!(field in req.body)) {
  //     const message = `Missing \`${field}\` in request body`
  //     console.error(message);
  //     return res.status(400).send(message);
  //   }
  // }
  const collection = client.db("rth_development").collection("devel_coll");
  let insertionObj = {greeting: req.body};
  collection.insertOne(insertionObj, onInsert);
  function onInsert(err, docs) {
    if (err) {
      console.log("Error!", err);
    } else {
      console.info("loadouts were successfully stored.", docs.length);
      res.json("thank you for shopping with us today")
    }
  }
  // Restaurant
  //   .create({
  //     name: req.query.name,
  //     borough: req.query.borough,
  //     cuisine: req.query.cuisine,
  //     grades: req.query.grades,
  //     address: req.query.address})
  //   .then(
  //     restaurant => res.status(201).json(restaurant.serialize()))
  //   .catch(err => {
  //     console.error(err);
  //     res.status(500).json({message: 'Internal server error'});
  //   });
});

// const cors = require('cors');
const {CLIENT_ORIGIN} = require('./config');

// app.use(
//     cors({
//         origin: CLIENT_ORIGIN
//     })
// );

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization,authorization');
  if (req.method === "OPTIONS") {
    return res.send(204);
  }
  next();
});


const router = express.Router();

module.exports = {app};

// const path = require('path')
//     , fs = require('fs')
//     , sourceDirPath = path.resolve(__dirname, '../../public/source'),
//     demoDocsPath = path.resolve(__dirname, '../../demo_documents'),
//     docFile = path.resolve(__dirname, 'World_Wide_Corp_fields.pdf')
//     ;

    
// makeTemplate()
// function makeTemplate(){

//   let docPdfBytes;
//   // read file from a local directory
//   // The reads could raise an exception if the file is not available!
//   docPdfBytes = fs.readFileSync(path.resolve(demoDocsPath, docFile));

//   // add the documents
//   let doc = new docusign.Document()
//     , docB64 = Buffer.from(docPdfBytes).toString('base64')
//     ;
//   doc.documentBase64 = docB64;
//   doc.name = 'Lorem Ipsum'; // can be different from actual file name
//   doc.fileExtension = 'pdf';
//   doc.documentId = '1';

//   // create a signer recipient to sign the document, identified by name and email
//   // We're setting the parameters via the object creation
//   let signer1 = docusign.Signer.constructFromObject({
//       roleName: 'signer',
//       recipientId: '1',
//       routingOrder: '1'});
//   // routingOrder (lower means earlier) determines the order of deliveries
//   // to the recipients. Parallel routing order is supported by using the
//   // same integer as the order for two or more recipients.

//   // create a cc recipient to receive a copy of the documents, identified by name and email
//   // We're setting the parameters via setters
//   let cc1 = new docusign.CarbonCopy();
//   cc1.roleName = 'cc';
//   cc1.routingOrder = '2';
//   cc1.recipientId = '2';

//   // Create fields using absolute positioning:
//   let signHere = docusign.SignHere.constructFromObject({
//           documentId: "1", pageNumber: "1", xPosition: "191", yPosition: "148"})
//     , check1 = docusign.Checkbox.constructFromObject({
//           documentId: "1", pageNumber: "1", xPosition: "75", yPosition: "417",
//           tabLabel: "ckAuthorization"})
//     , check2 = docusign.Checkbox.constructFromObject({
//           documentId: "1", pageNumber: "1", xPosition: "75", yPosition: "447",
//           tabLabel: "ckAuthentication"})
//     , check3 = docusign.Checkbox.constructFromObject({
//           documentId: "1", pageNumber: "1", xPosition: "75", yPosition: "478",
//           tabLabel: "ckAgreement"})
//     , check4 = docusign.Checkbox.constructFromObject({
//           documentId: "1", pageNumber: "1", xPosition: "75", yPosition: "508",
//           tabLabel: "ckAcknowledgement"})
//     , list1 = docusign.List.constructFromObject({
//           documentId: "1", pageNumber: "1", xPosition: "142", yPosition: "291",
//           font: "helvetica", fontSize: "size14", tabLabel: "list",
//           required: "false",
//           listItems: [
//               docusign.ListItem.constructFromObject({text: "Red",    value: "red"   }),
//               docusign.ListItem.constructFromObject({text: "Orange", value: "orange"}),
//               docusign.ListItem.constructFromObject({text: "Yellow", value: "yellow"}),
//               docusign.ListItem.constructFromObject({text: "Green",  value: "green" }),
//               docusign.ListItem.constructFromObject({text: "Blue",   value: "blue"  }),
//               docusign.ListItem.constructFromObject({text: "Indigo", value: "indigo"}),
//               docusign.ListItem.constructFromObject({text: "Violet", value: "violet"})
//           ]
//       })

//   //   , number = docusign.Number.constructFromObject({
//   //         documentId: "1", pageNumber: "1", xPosition: "163", yPosition: "260",
//   //         font: "helvetica", fontSize: "size14", tabLabel: "numbersOnly",
//   //         height: "23", width: "84", required: "false"})
//     , textInsteadOfNumber = docusign.Text.constructFromObject({
//           documentId: "1", pageNumber: "1", xPosition: "153", yPosition: "260",
//           font: "helvetica", fontSize: "size14", tabLabel: "numbersOnly",
//           height: "23", width: "84", required: "false"})
//     , radioGroup = docusign.RadioGroup.constructFromObject({
//           documentId: "1", groupName: "radio1",
//           radios: [
//               docusign.Radio.constructFromObject({
//                   font: "helvetica", fontSize: "size14", pageNumber: "1",
//                   value: "white", xPosition: "142", yPosition: "384", required: "false"}),
//               docusign.Radio.constructFromObject({
//                   font: "helvetica", fontSize: "size14", pageNumber: "1",
//                   value: "red", xPosition: "74", yPosition: "384", required: "false"}),
//               docusign.Radio.constructFromObject({
//                   font: "helvetica", fontSize: "size14", pageNumber: "1",
//                   value: "blue", xPosition: "220", yPosition: "384", required: "false"}),
//           ]})
//     , text = docusign.Text.constructFromObject({
//           documentId: "1", pageNumber: "1", xPosition: "153", yPosition: "230",
//           font: "helvetica", fontSize: "size14", tabLabel: "text",
//           height: "23", width: "84", required: "false"})
//     ;

//   // Tabs are set per recipient / signer
//   let signer1Tabs = docusign.Tabs.constructFromObject({
//       checkboxTabs: [check1, check2, check3, check4],
//       listTabs: [list1],
//       // numberTabs: [number],
//       radioGroupTabs: [radioGroup],
//       signHereTabs: [signHere],
//       textTabs: [text, textInsteadOfNumber]
//   });
//   signer1.tabs = signer1Tabs;

//   // Add the recipients to the env object
//   let recipients = docusign.Recipients.constructFromObject({
//       signers: [signer1],
//       carbonCopies: [cc1]});

//   // create the overall template definition
//   let template = new docusign.EnvelopeTemplate.constructFromObject({
//       // The order in the docs array determines the order in the env
//       documents: [doc],
//       emailSubject: 'Please sign this document',
//       description: 'Example template created via the API',
//       name: templateName,
//       shared: 'false',
//       recipients: recipients,
//       status: "created"
//   });

//   return template;
// }