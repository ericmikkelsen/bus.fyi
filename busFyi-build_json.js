var fs = require('fs')
    , util = require('util')
    , stream = require('stream')
    , es = require('event-stream');


//jack the giant killer
  //I can be less cute later
function jack(file){

  var lineNr = 0;

  var s = fs.createReadStream('very-large-file.csv')
      .pipe(es.split())
      .pipe(es.mapSync(function(line){

          // pause the readstream
          s.pause();

          lineNr += 10;
          if (lineNr < 30) {
            console.log(line);
            console.log('-----');
          }

          // process line here and call s.resume() when rdy
          // function below was for logging memory usage

          // resume the readstream, possibly from a callback
          s.resume();
      })
      .on('error', function(){
          console.log('Error while reading file.');
      })
      .on('end', function(){
          console.log('Read entire file.')
      })
  );

}//jack

jack('dist/data/chicago-transit-authority/stop_times.txt');
