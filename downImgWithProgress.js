(function() {
  "use strict";
  const fs = require("fs");
  const http = require("http");
  const path = require("path");
  const ProgressBar = require('progress');

  const urlList = [
    "http://content.battlenet.com.cn/wow/media/wallpapers/patch/fall-of-the-lich-king/fall-of-the-lich-king-1920x1080.jpg",
    "http://content.battlenet.com.cn/wow/media/wallpapers/patch/black-temple/black-temple-1920x1200.jpg",
    "http://content.battlenet.com.cn/wow/media/wallpapers/patch/zandalari/zandalari-1920x1200.jpg",
    "http://content.battlenet.com.cn/wow/media/wallpapers/patch/rage-of-the-firelands/rage-of-the-firelands-1920x1200.jpg",
    "http://content.battlenet.com.cn/wow/media/wallpapers/patch/fury-of-hellfire/fury-of-hellfire-3840x2160.jpg",
    ];
    const dirName="./images";
    let nowIndex=0;
  function getHttpReqCallback(imgSrc, dirName, index) {
    var fileName = index + "-"+Math.floor(Math.random()*10)+".jpg";
    var callback = function(res) {
      var fileBuff = [];
      var len = parseInt(res.headers['content-length'],10);
      var bar = new ProgressBar('下载中，总大小：'+len+' [:bar] :percent :etas', {
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
        startDownloadTask(++nowIndex);
        var totalBuff = Buffer.concat(fileBuff);
        fs.appendFile(dirName + "/" + fileName, totalBuff, function(err){});

      });
    };
    return callback;
  }

  var startDownloadTask = function(index,dir) {
    var imgSrc= urlList[index];
    var dirname=dir || dirName;
    var req = http.request(imgSrc, getHttpReqCallback(imgSrc,dirname, index));
    req.on('error', function(e){});
    req.end();
  }
  startDownloadTask(0);

})();
