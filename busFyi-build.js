var
    Converter = require("csvtojson").Converter,
    es = require('event-stream'),
    fs = require('fs'),
    http = require('http'),
    hm = require('html-minifier').minify,
    nj = require('nunjucks'),
    request = require('request'),
    stream = require('stream'),
    unzip = require('unzip'),
    util = require('util');


//config
nj.configure('views', { autoescape: true });



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

//callback so that callbacks always work the same way
function cb(data){
  if (data.callbacks[0] != undefined ) {
    callback = data.callbacks[0];
    data.callbacks.shift();
    callback(data);
    }
}

//unzips the gtfs data and puts it somewheref
function unzip_and_put(zip){
    files_local = unzip.Extract({ path: zip.unzip_location});
    zip_file = fs.createReadStream(zip.location).pipe(files_local);
    cb(zip);
  }

//renames the root folder
function gtfs_rename_root_folder(gtfs_data){

  converter = new Converter({});
  converter.on("end_parsed", function (jsonArray) {
    agency_name = jsonArray[0].agency_name.toLowerCase();
    agency_name = slugify(agency_name);
    csv = gtfs_data.csv;
    fs.rename(gtfs_data.unzip_location, gtfs_data.folder+agency_name);

    gtfs_data.unzip_location = gtfs_data.folder+agency_name;

  });
  require("fs").createReadStream(gtfs_data.unzip_location+'/agency.txt').pipe(converter);
  cb(gtfs_data);
}

function toJson(data){
  csv = data.csv;
  folder = data.folder+data.agency_name+'/';

  for (var i = 0; i < csv.length; i++) {
    csv_file = csv[i];
    json_file = csv_file.split('.');
    json_file = json_file[0]+'.json';
    console.log(folder+json_file);
    csvConverter_config = {
      constructResult:false,
      toArrayString: true,
    }
    var csvConverter=new Converter(csvConverter_config); // The parameter false will turn off final result construction. It can avoid huge memory consumption while parsing. The trade off is final result will not be populated to end_parsed event.
    var readStream=require("fs").createReadStream(folder+csv_file);
    var writeStream=require("fs").createWriteStream(folder+json_file);
    readStream.pipe(csvConverter).pipe(writeStream);
  }
}

var cta_zip = {
  folder: 'dist/data/',
  agency_name: 'chicago-transit-authority',
  url:'http://www.transitchicago.com/downloads/sch_data/google_transit.zip',
  location:'dist/zip/GTFS-cta.zip',
  unzip_location: 'dist/data/chicago-transit-authority',
  csv: [
    'agency.txt',
    'routes.txt',
    'stops.txt',
    'trips.txt'
    //'stop_times.txt'
  ],
  callbacks: [
    // get_zip_and_put,
    // unzip_and_put,
    // gtfs_rename_root_folder,
    // toJson,
  ]
};

function build__stops(){
  data = {
    stops: JSON.parse(fs.readFileSync(folders[1]+'/chicago-transit-authority/stops.json', 'utf8')),
    stops_dir: folders[1]+'/chicago-transit-authority/stops/',
  }

  for (var i = 0; i < data.stops.length; i++) {
    stop_json = data.stops_dir+data.stops[i].stop_id+'.json';
    stp = {
      "details" :data.stops[i],
      "arrivals":[]
    };
    stp = JSON.stringify(stp);
    //fs.createWriteStream(stop_json).write( JSON.stringify(stp));
    fs.writeFileSync(stop_json, stp,'utf8');
  }//for end
}
build__stops();

//get_zip_and_put(cta_zip);
//toJson(cta_zip);
