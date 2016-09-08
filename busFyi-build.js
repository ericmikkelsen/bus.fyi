var
    Converter = require("csvtojson").Converter,
    fs = require('fs'),
    http = require('http'),
    hm = require('html-minifier').minify,
    nj = require('nunjucks'),
    request = require('request'),
    unzip = require('unzip');


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

//callback
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

    fs.rename(gtfs_data.unzip_location, 'dist/data/'+agency_name);
    gtfs_data.unzip_location = 'dist/data/'+agency_name;
  });
  require("fs").createReadStream(gtfs_data.unzip_location+'/agency.txt').pipe(converter);
  cb(gtfs_data);
}

//convet files to json
function toJson(data){

}

var cta_zip = {
  url:'http://www.transitchicago.com/downloads/sch_data/google_transit.zip',
  location:'dist/zip/GTFS-cta.zip',
  unzip_location: 'dist/data/chicago-transit-authority',
  csv: [
    'agency.txt',
    'stops.txt',
    'trips.txt',
  ],
  callbacks: [
    get_zip_and_put,
    unzip_and_put,
    gtfs_rename_root_folder
  ]
}

get_zip_and_put(cta_zip);







function build__rootForm(){
  //view
  v = ['head.html','location-form.html','footer.html'];
  //page
  p = '';
  for (var i = 0; i < v.length; i++) {
    //render
    r = nj.render(v[i], {title: 'Bus & Train Tracker'});
    r = hm(r, {
      collapseWhitespace: true,
      removeComments: true,
      removeAttributeQuotes: true,
      minifyJS: true,
      minifyCSS: true,
      });
    //add to page
    p += r;
  }
  fs.createWriteStream('dist/site/index.html').write(p);
}

build__rootForm();
