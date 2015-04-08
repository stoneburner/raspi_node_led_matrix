var ws281x = require('rpi-ws281x-native');
var fs = require('fs');
var PNG = require('pngjs').PNG;

var NUM_LEDS = 256, pixelData = new Uint32Array(NUM_LEDS);

ws281x.init(NUM_LEDS);

var frames=[];
var frameIndex=0;
var playing=false;
var playInterval = setInterval(playFrame,250);
var playTimeout ;
var playOnce=false;
/*
// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});
*/

function showImage(filename,callback) {
  loadImage(filename,function(err,data) {
    if (!err) {
      for (var i = 0; i < NUM_LEDS; i++) {
        pixelData[i] = data[i];
      }
      ws281x.render(pixelData);      
    }
    if (callback) {
      callback(err);      
    }
  });
}

function clearImage() {
  for (var i = 0; i < NUM_LEDS; i++) {
    pixelData[i] = rgb2Int(0,0,0);
  }
  ws281x.render(pixelData);   
}

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}


function playFrame() {
  if (playing) {
    showImage(frames[frameIndex],function(err) {
      if (err) {
        console.log(err);
      }
    });

    frameIndex ++;

    if (frameIndex === frames.length) {
      if (playOnce === true) {
        playing = false;
      }
      frameIndex = 0;
    }
  }
}

function loadImage(filename,callback) {
  console.log("loading image",filename);

  try {

    var stats = fs.lstatSync(filename);

    if (stats.isFile) {
      fs.createReadStream(filename).pipe(new PNG({ filterType: -1 })).on('parsed', function() {

          var data = [];

          for (var y = 0; y < this.height; y++) {
              for (var x = 0; x < this.width; x++) {
                  var idx = (this.width * y + x) << 2;

                  var r = this.data[idx];
                  var g = this.data[idx+1];
                  var b = this.data[idx+2];
                  var a = this.data[idx+3];

                  if (a > 0) {
                    data.push(rgb2Int(r,g,b));                                
                  } else {
                    data.push(rgb2Int(0,0,0));                
                  }
              }
          }
          callback(null,data);    
      });
    } else {
      callback(404);
    }
    
  } catch (ex) {
    callback(ex);        
  }
}

module.exports.showImage = showImage;
module.exports.clearImage = clearImage;

module.exports.showFile = function(filename,timeout,once,callback) {
  try {
    var stats = fs.lstatSync(filename);

    if (stats.isDirectory) {
      console.log("animation");
      var files=fs.readdirSync(filename);
      if (files.length > 0) {
        for (var i=0;i<files.length;i++) {
          files[i]=filename+"/"+files[i];
        }
        frames=files;
        frameIndex=0;
        playing=true;        
        playOnce = once;            
        if (timeout) {
          playTimeout = setTimeout(function() {
            console.log("anim timeout!")
            playing = false;
            clearImage();
          },1000*timeout)
        }
        callback();
      }
    }
  } catch (ex) {
      playing = false;

      if (playTimeout) {
        clearTimeout(playTimeout); 
      }

      showImage(filename+".png",function(err) {        
        if (callback) callback(err);
      });

      if (timeout) {
        setTimeout(function() {
          playing = false;
          clearImage();
        },1000*timeout)
      }    
  }
}
