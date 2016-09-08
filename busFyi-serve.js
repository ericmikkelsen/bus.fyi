var express = require('express'),
    app = express(),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    path = require("path"),
    request = require('request');

const https = require('https');
var api_key_google_maps = 'AIzaSyDhbbBgorLkN8w-9IrWJSa1Vn6pHC_BgxI';

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.use(express.static('dist/site'));



app.post("/stops",function(req,res)
{
  address=req.body.address; //i am accessign req object body for username
  zip=req.body.zip;
  request({url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address +',+' + zip + '&key=' + api_key_google_maps}, function (error, response, body) {
   res.send(body);

  });

});
