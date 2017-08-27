var superagent = require('superagent');
var http = require('http');
var fs = require('fs');
var request = require("request");
var ProgressBar = require('progress');
require('superagent-proxy')(superagent);

// 代理地址
var proxy = process.env.http_proxy || 'http://172.16.0.109:13291';

var url = 'https://r16---sn-oguesn7k.googlevideo.com/videoplayback?itag=18&requiressl=yes&ei=5iyiWb6fNoma4AKTl77gAw&mv=m&mt=1503800437&ms=au&source=youtube&clen=458567044&signature=2B79CC417FFE1A34897F35EBDDA2910D8E088916.5C247D80372E7E8D45A81C84362DC0BE3A7F6D02&gir=yes&mime=video/mp4&dur=7356.499&id=b60736e9dd739a42&mm=31&mn=sn-oguesn7k&ratebypass=yes&expire=1503822151&lmt=1498784631079067&pl=19&ipbits=0&initcwndbps=4193750&sparams=clen,dur,ei,gir,id,initcwndbps,ip,ipbits,itag,lmt,mime,mm,mn,ms,mv,pl,ratebypass,requiressl,source,expire&key=yt6&ip=172.104.126.98&signature=';

var dir = './video';

var  videoName = "dsd";

//下载方法
var download = function(url, dir,filename, callback) {
    //显示进度 test
    var req = superagent.post(url).proxy(proxy);
    req.on("progress",function(e){console.log(e.total);})
    req.end();

}
function getHttpReqCallback(fileName) {
    var callback = function(res) {
      var fileBuff = [];
      var len = parseInt(res.headers['content-length'], 10);
      var bar = new ProgressBar('  downloading [:bar] :rate/bps :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: len
      });
      res.on('data', function (chunk) {
        var buffer = new Buffer(chunk);
        bar.tick(chunk.length);
        fileBuff.push(buffer);
      });
      res.on('end', function() {
        var totalBuff = Buffer.concat(fileBuff);
        fs.appendFile(dirName + "/" + fileName, totalBuff, function(err){});
      });
    };
    return callback;
  }

  download(url, dir, videoName+'.mp4',function(filename){
      console.log(filepath+"  done!!");
  });
