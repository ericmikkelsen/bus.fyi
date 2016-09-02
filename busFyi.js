var unzip = require('unzip'),
    request = require('request'),
    fs = require('fs'),
    out = fs.createWriteStream('out');

function get_zip_and_put(zip){
  zip_file_local = fs.createWriteStream(zip.location);
  zip_file = request(zip.url).pipe(zip_file_local);

    if(zip.callbacks.get_zip_and_put != undefined){
      zip_file_local.on('close', function() {
        callback(zip.callbacks.get_zip_and_put(zip));
      });
    }
  }//get_zip_and_put

function unzip_and_put(files){
    fs.createReadStream(zip.location).pipe(unzip.Extract({ path: zip.unzip_location}));
    if(zip.callbacks.unzip_and_put != undefined){
      zip_file_local.on('close', function() {
        callback(zip.callbacks.unzip_and_put(files));
      });
    }
  }

var cta_zip = {
  url:'http://www.transitchicago.com/downloads/sch_data/google_transit.zip',
  location:'data/GTFS-cta.zip',
  unzip_location: 'data/cta',
  callbacks: {
    get_zip_and_put: unzip_and_put,
  }
}
get_zip_and_put(cta_zip,);
