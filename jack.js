/*
  JACK THE GIANT KILLER
  Jack builds my HUGE db of stops
*/
var fs = require('fs')
    , util = require('util')
    , stream = require('stream')
    , es = require('event-stream')
    , Converter = require("csvtojson").Converter
    , csvHeader = ''
    , batch = {}
    , folders = ["dist",'dist/data','dist/site','dist/tmp','dist/zip']
    , batches = 0
    , data = {
      stops: JSON.parse(fs.readFileSync(folders[1]+'/chicago-transit-authority/stops.json', 'utf8')),
      trips: JSON.parse(fs.readFileSync(folders[1]+'/chicago-transit-authority/trips.json', 'utf8')),
      routes: JSON.parse(fs.readFileSync(folders[1]+'/chicago-transit-authority/routes.json', 'utf8')),
      stops_dir: folders[1]+'/chicago-transit-authority/stops/',
      route_dir: folders[1]+'/chicago-transit-authority/routes/',
    };


function batch_processor(print_location){

  batches ++;
  console.log(batches);
  for (var prop in batch) {
    //console.log(batch[prop]);
    stop_json = folders[1]+'/chicago-transit-authority/stops/'+prop+'.json';
    j = fs.readFileSync(stop_json, 'utf8');
    j = JSON.parse(j,'utf8');

    //j = stop file

    j.arrivals = j.arrivals.concat(batch[prop]);
    j = JSON.stringify(j);

    //fs.createWriteStream(stop_json).write( JSON.stringify(stp));
    fs.writeFileSync(stop_json, j,'utf8');
  }//for
  batch = {};
}//batch_processor

function batch_add(line){

    //add the header to the line
    line = csvHeader+'\r\n'+line;
    converter = new Converter();
    converter.fromString(line, function(err,result){

      k = result[0].stop_id;
      r = result[0];
      if (!(k in batch)) {
        batch[k] = [];
      }

      route = data.trips.filter(function(trip){
        return trip.trip_id === r.trip_id;
        });
      r.route_id = route[0].route_id;

      route = data.routes.filter(function(rt){
        return rt.route_id === r.route_id;
        });
      r.route_long_name = route[0].route_long_name;
      r.route_type = route[0].route_type;
      batch[k].push(r);

    });//converter
}//batch_add

//jack the giant killer
  //I can be less cute later
function jack(file){

  lineNr = 0;
  s = fs.createReadStream(file)
      .pipe(es.split())
      .pipe(es.mapSync(function(line){

          // pause the readstream
          s.pause();

          lineNr += 1;
          //if (lineNr < 3001) {
            if (lineNr == 1) {
                csvHeader = line + '\r\n';
            }else if ( (lineNr % 2000) == 0) {
                batch_add(line);
                batch_processor();
            }else{
                batch_add(line);
            }

          //}//3000


          // process line here and call s.resume() when rdy
          // function below was for logging memory usage

          // resume the readstream, possibly from a callback
          s.resume();
      })
      .on('error', function(){
          console.log('Error while reading file.');
      })
      .on('end', function(){
          console.log(Date.getHours()+ Date.getMinutes());
          batch_processor();
          console.log('Read entire file.')
      })
  );

}//jack

//jack('dist/data/chicago-transit-authority/stop_times.txt');
