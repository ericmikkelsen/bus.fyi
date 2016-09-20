var express = require('express'),
    app = express(),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    jsonfile = require('jsonfile'),
    nj = require('nunjucks'),
    path = require("path"),
    request = require('request');

const https = require('https');
nj.configure('views', { autoescape: true });

var api_key_google_maps = 'AIzaSyDhbbBgorLkN8w-9IrWJSa1Vn6pHC_BgxI';

var folders = {
  data:'dist/data/chicago-transit-authority',
  site:'dist/site'
};
var data = {
  stops: JSON.parse(fs.readFileSync(folders.data+'/stops.json', 'utf8')),
  }
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.use(express.static('dist/site'));

//function between for judging longitudes longitute
function between(x, min, max) {
  return x >= min && x <= max;
}

app.post("/stops",function(req,res){
  address=req.body.address; //i am accessign req object body for username
  zip=req.body.zip;

  request({url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address +',+' + zip + '&key=' + api_key_google_maps}, function (error, response, body) {
   //res.write(body);
   body = JSON.parse(body, 'utf8');
   location = body.results[0].geometry.location;

   res.write(nj.render('head.html',{title:'stops'}));

    for (var i = 0; i < data.stops.length; i++) {
      //data.stops[i].stop_lon
      //console.log(data.stops[i].stop_lon);



      if (between(data.stops[i].stop_lon,location.lng - .003, location.lng + .003)&&between(data.stops[i].stop_lat,location.lat - .003, location.lat + .003)) {
         res.write(nj.render('atm-btn.html', {btn:{url:'stp?id='+data.stops[i].stop_id+'&name='+encodeURIComponent(data.stops[i].stop_name),text:data.stops[i].stop_name}}));
         console.log(data.stops[i]);
      }//if between
    }//for
  res.write(nj.render('footer.html',{}));
  res.end();
  })//request

});//app.post

app.get('/stp', function (req, res) {

   res.write(nj.render('head.html',{title:req.query.name}));
   console.log(req.query);
   //res.write(req.query);
   res.end();
});
