var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');
var mkdirp = require('mkdirp');
const http = require("http");
const ProgressBar = require('progress');
console.log('爬虫程序开始运行......');

// 爬去地址
var  list_url="https://www.235bobo.com/art-detail-id-57470-pg-.html";
var list = [];
var dirName="./images";
let nowIndex=0;

// 开始
getData(list_url,function(){
    console.log("图片保存在:"+dirName);
    startDownloadTask(0)
});


// 用 superagent 去抓取图片列表  注意设置 header  来模拟浏览器发送请求 有些网站有防爬
function getData(url,callback){
        superagent.get(list_url)
            .set('Referer','https://www.google.com')
            .set('Accept','image/webp,image/*,*/*;q=0.8')
            .set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36')
            .end(function(err, sres,next){
                if (err) { //  错误处理
                    console.log("出错了："+err);
                }
                // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
                // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
                // 剩下就都是 jquery 的内容了
                var $ = cheerio.load(sres.text,{decodeEntities: false});
                $('.content p').eq(2).find('img').each(function (idx, element) {
                    var src = $(this).attr('src');
                    if(src.indexOf("http")<0){src="http:"+src;}
                    list.push(src);
                });
                // 生成文件夹
                var secondDir=$(".title a").eq(2).html().split(0,20);
                dirName = dirName+"/"+secondDir;
                mkdirp(dirName, function(err) {
                    if(err){
                        console.log(err);
                    }
                });
                callback();
        })
}


function getHttpReqCallback(imgSrc, dirName, index) {
var fileName = index +'.'+ imgSrc.substr(-3,3);
var callback = function(res) {
  var fileBuff = [];
  var len = parseInt(res.headers['content-length'],10);
  var bar = new ProgressBar('总共'+list.length+'张，正在下载第'+(index+1)+'张，大小：'+Math.floor(len/1000)+'KB, [:bar] :percent :etas', {
    complete: '>',
    incomplete: ' ',
    width: 20,
    clear:true,
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
    if(nowIndex+1<list.length){startDownloadTask(++nowIndex);}
    else{
        console.log("已全部下载完！");
    }
  });
};
return callback;
}
// 开始下载
var startDownloadTask = function(index,dir) {

    var imgSrc= list[index];
    var dirname=dir || dirName;
    var req = http.request(imgSrc, getHttpReqCallback(imgSrc,dirname, index));
    req.on('error', function(e){});
    req.end(function(){

    });
}







// end
