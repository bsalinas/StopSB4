# Stop SB4 Statement Collector
See the live version at [http://stopSB4.com](http://stopSB4.com)

Texas is passing a dangerous and racist bill (SB4). This is a project that seeks to collect public statements against the bill.

It was built in a few hours to serve one purpose, but maybe you can use it for something else.

## Overview
There's a google spreadsheet which looks something like this.

![spreadsheetimage](https://cloud.githubusercontent.com/assets/2040141/22623449/2db9c86a-eb21-11e6-95ed-f9725230d196.png)

The app has a function (which I've hackily hooked up to the `GET /refresh` endpoint) which will grab the data from the spreadsheet and put it into a MongoDB database. It does this by using the `columns` variable (to map from the column names in the spreadsheet to database friendly keys)

On startup, the server grabs a copy of the data from the database and stores it in memory. This is probably bad, but it works for now.

The `GET /` endpoint serves a page (rendered using `handlebars`) that shows all of the quotes from the in-memory copy of the data. 

The `public/client.js` uses a tiny bit of client-side javascript to do client-side filtering of the statements.

## Setup
I run this on heroku. When you make the app, provision a mongo db database from mLab through heroku. Then, add a `config` variable for the google spreadsheet id. The Google Spreadsheet will need to be public (unless you modify the Google API call to use authentication.)

When you navigate to `yourapp.herokuapp.com/refresh` the website won't load, but you should get some messages in your server logs showing that it is copying data from the spreadsheet to the database. I have found that after this, I sometimes need to restart the application server to get the in-memory cache to be correct.

Then, when you navigate to `yourapp.herokuapp.com/refresh` it should show you things.

## Expected Issues
I expect you'll have problems if you try to run this.
Here's a few of them

* My spreadsheet has 3 worksheets. The data is in the third one. Therefore, I ask the API for the 3rd worksheet (the library is 1 based not 0 based). 
* If your columns are named different things you'll need to change the `columns` variable (because I'm only grabbing specific columns from it)
* If you have more columns, you might need to change the Google Spreadsheet query (in the `refreshData` method)
* If you want to run the server locally, you'll need some Environment variables (see the top of `server.js`)