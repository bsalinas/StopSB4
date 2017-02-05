/*If you want to use a local file `.env` intead of hosting on heroku
//Then uncomment this line and add a file that contains
MONGODB_URI=mongodb://heroku_f21xsdfsdf:o8dssdf7h1gietpbadf@ds1ds9.mldb.com:1242/heroku_sfdsfdsf24
SPREADSHEET_ID=1asdgfdspJyodsgsBj6fyDlCVV3AdzhUtfubT6ff1YdN8

These should be the connection URI for a mongodb instance and the Google Spreadsheet ID of where you are grabbing the 
*/
// require('dotenv').config()
var express = require('express');
var GoogleSpreadsheets = require("google-spreadsheets");
var exphbs  = require('express-handlebars');
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient
var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var uri = process.env['MONGODB_URI'];


app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html

app.get("/", function(req, response){
  console.log("root")
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
    "db_id": "name"
  },
  {
    "doc_id":"position",
    "db_id":"position"
  },
  {
    "doc_id":"role",
    "db_id": "person_role"
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
    key:process.env.SPREADSHEET_ID,
    worksheet:3
    //XXX: You'll probably need to change this number
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
              collectData();
            });
        })  
        
      });  
    }
    // console.log(rows);
    

  });
}

app.get("/refresh", function(request, response){
  refreshData();
  //Note: This should actually return something; probably a report of what it did.
});
var allData = []

//This function grabs data from the spreadsheet and stores it in memory
//Maybe we should just grab data from db whenever someone loads the page?
function collectData(){
  MongoClient.connect(uri, function(dberr, db) {
  db.collection("statements").find({"verified":"Y"}).toArray(function(err, docs) {
      allData = docs;
      db.close();
    }); 
  });
};
collectData();

//Just an endpoint that I don't use.
app.get("/statements",function(request, response){
  console.log("statements")
  response.json(allData);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
