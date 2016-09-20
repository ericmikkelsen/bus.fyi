function add_stop_times(){
  //make stops folder
  data = {
    stops: JSON.parse(fs.readFileSync(folders[1]+'/chicago-transit-authority/stops.json', 'utf8')),
    trips: JSON.parse(fs.readFileSync(folders[1]+'/chicago-transit-authority/trips.json', 'utf8')),
    routes: JSON.parse(fs.readFileSync(folders[1]+'/chicago-transit-authority/routes.json', 'utf8')),
    stops_dir: folders[1]+'/chicago-transit-authority/stops/',
    route_dir: folders[1]+'/chicago-transit-authority/routes/',
  }
  //go through each stop_time
    //JSON.parse(fs.readFileSync(folders.data+'/stops.json', 'utf8'))
    //check to see if that stop-STOP_ID.json exists, if not make it
    //make stop_time in stop
      //get trip_id,
        //go open trips.json, get route_id
          //get route_id and route_name
      //make all my stops


      lineNr = 0;
      csvHeader = '';
      s = fs.createReadStream('dist/data/chicago-transit-authority/stop_times.txt')
          .pipe(es.split())
          .pipe(es.mapSync(function(line){

              // pause the readstream
              s.pause();

              lineNr += 1;

              if (lineNr == 1) {
                csvHeader = line;

              //}else if(lineNr <= 5){
              }else{

                line = csvHeader+'\r\n'+line;
                //console.log(line);
                converter = new Converter();
                converter.fromString(line, function(err,result){


                  stop_json = data.stops_dir+result[0].stop_id+'.json';
                  console.log(stop_json);

                  //check to see if file exists
                  fs.access(stop_json, fs.F_OK, function(err) {

                      if (err) {
                        console.log(err);
                      }else{
                        //open stop json file
                        stp = JSON.parse(fs.readFileSync(stop_json, 'utf8'));
                        //get trip
                        route = data.trips.filter(function(trip){
                          return trip.trip_id === result[0].trip_id;
                          });
                        result[0].route_id = route[0].route_id;

                        route = data.routes.filter(function(r){
                          return r.route_id === route[0].route_id;
                          });
                        result[0].route_long_name = route[0].route_long_name;
                        result[0].route_type = route[0].route_type;
                        result[0].route_short_name = route[0].route_short_name;
                        stp.arrivals.push(result[0]);
                        stp = JSON.stringify(stp);
                        fs.writeFileSync(stop_json, stp , 'utf-8');
                      }

                  });//fs access


                });//converter

              }

              // process line here and call s.resume() when rdy
              // function below was for logging memory usage
              //logMemoryUsage(lineNr);

              // resume the readstream, possibly from a callback
              s.resume();
          })
          .on('error', function(error){
            console.log(error);
              console.log('Error while reading file.');
          })
          .on('end', function(){
              console.log('Read entire file.')
          })
      );

}

add_stop_times();
