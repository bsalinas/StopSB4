// server.js
// where your node app starts

// init project
require('dotenv').config()
var express = require('express');
var GoogleSpreadsheets = require("google-spreadsheets");
var exphbs  = require('express-handlebars');
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient
var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var uri = 'mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASS+'@'+process.env.HOST+':'+process.env.PORT+'/'+process.env.DB;

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html

app.get("/", function(req, response){
  console.log("root")
    // response.sendFile(__dirname + '/views/index.html');
    console.log(allData)
    var roles = [];
    for(var i in allData)
    {
      if(roles.indexOf(allData[i]['person_role']) == -1)
      {
        if(allData[i]['person_role'] != "")
        {
          roles.push(allData[i]['person_role'])  
        }
        
      }
    }
    response.render("index", {statements:allData, roles:roles});
});

// // Name	Position	Role	Location	For/Against SB4	Source	Key Quote
var columns = [
  {
    "doc_id":"updated",
    "db_id":"updated"
  },
  {
    "doc_id":"name",
    db_id: "name"
  },
  {
    doc_id:"position",
    db_id:"position"
  },
  {
    doc_id:"role",
    db_id: "person_role"
  },
  {
    "doc_id":"location",
    "db_id": "location"
  },
  {
    "doc_id":"foragainstsb4",
    "db_id":"foragainstsb4"
  },
  {
    "doc_id":"source",
    "db_id":"source"
  },
  {
    "doc_id":"keyquote",
    "db_id":"quote"
  },
  {
    "doc_id":"verified",
    "db_id":"verified"
  }
];
  
function refreshData(){
  var rows = GoogleSpreadsheets.rows({
    key:"1adLEpJyo31Bj6fxCMeyDlCVV3AdzhUtfubT6ff1YdN8",
    worksheet:2
  }, function(err, rows){
    console.log(rows[1])
    if(!err){
      var toWrite = []
      for(var i in rows){
        var toAdd = {};
        for(var col in columns){
          var text = rows[i][columns[col]['doc_id']];
          if(typeof text === "string"){
            toAdd[columns[col]["db_id"]] = text  
          } else {
            console.log(columns[col])
            console.log(text)
            toAdd[columns[col]["db_id"]] = ""
          }
          
        }
        toWrite.push(toAdd)
      }
      console.log(toWrite[2])
      MongoClient.connect(uri, function(dberr, db) {
        console.log(dberr)
        console.log("Connected successfully to server");
        db.collection("statements").remove({},function(err,numberRemoved){
            console.log("inside remove call back" + numberRemoved);
          db.collection("statements").insertMany(toWrite, function(writeErr, result){
              console.log(writeErr)
              console.log("insterted "+result)
              console.log(result)
              db.close();
            });
        })  
        
      });  
    }
    // console.log(rows);
    

  });
}

app.get("/refresh", function(request, response){
  refreshData();
  collectData();
});
var allData = []
function collectData(){
  MongoClient.connect(uri, function(dberr, db) {
  // console.log(db)
  db.collection("statements").find({"verified":"Y"}).toArray(function(err, docs) {
      // console.log("Found the following records");
      // console.log(docs)
      allData = docs;
      db.close();
    }); 
  });
};
collectData();

app.get("/statements",function(request, response){
  console.log("statements")
  response.json(allData);
});
// app.get("/", function(request, response){
//   console.log(allData)
//   response.send(400)
// });

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  console.log("foo")
});
