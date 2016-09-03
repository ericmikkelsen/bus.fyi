var unzip = require('unzip'),
    request = require('request'),
    fs = require('fs'),
    out = fs.createWriteStream('out'),
    Converter = require("csvtojson").Converter;



//build folder structure
  function build_dist_directories(dirs){
    for (var i = 0; i < folders.length; i++) {
      if (!fs.existsSync(dirs[i])){
        fs.mkdirSync(dirs[i]);
      }//if
    }//for
  }//function

  var folders = ["dist",'dist/data','dist/site','dist/tmp','dist/zip'];
  build_dist_directories(folders);

  function slugify(text)
  {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

function get_zip_and_put(zip){
  zip_file_local = fs.createWriteStream(zip.location);
  zip_file = request(zip.url).pipe(zip_file_local);

    if(zip.callbacks.get_zip_and_put != undefined){
      zip_file_local.on('close', function() {
        zip.callbacks.get_zip_and_put(zip);
      });
    }
  }//get_zip_and_put

//unzips the gtfs data and puts it somewheref
function unzip_and_put(zip){
    files_local = unzip.Extract({ path: zip.unzip_location});
    zip_file = fs.createReadStream(zip.location).pipe(files_local);

    if(zip.callbacks.unzip_and_put != undefined){
      files_local.on('close', function() {
        zip.callbacks.unzip_and_put(zip);
      });
    }
  }

function gtfs_rename_root_folder(gtfs_data){
  converter = new Converter({});
  converter.on("end_parsed", function (jsonArray) {
    agency_name = jsonArray[0].agency_name.toLowerCase();
    agency_name = slugify(agency_name);

    fs.rename(gtfs_data.unzip_location, 'dist/data/'+agency_name);
    gtfs_data.unzip_location = 'dist/data/'+agency_name;

    if(gtfs_data.callbacks.gtfs_rename_root_folder != undefined){
        gtfs_data.callbacks.gtfs_rename_root_folder(zip);
    }
  });

  require("fs").createReadStream(gtfs_data.unzip_location+'/agency.txt').pipe(converter);
}
var cta_zip = {
  url:'http://www.transitchicago.com/downloads/sch_data/google_transit.zip',
  location:'dist/zip/GTFS-cta.zip',
  unzip_location: 'dist/data/chicago-transit-authority',
  callbacks: {
    get_zip_and_put: unzip_and_put,
    unzip_and_put: gtfs_rename_root_folder
  }
}
//get_zip_and_put(cta_zip);
