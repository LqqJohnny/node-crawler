var superagent = require('superagent');
var cheerio = require('cheerio');
var async = require('async');
var http = require('http');
var fs = require('fs');
var mkdirp = require('mkdirp');
var request = require("request");

require('superagent-proxy')(superagent);
console.log('爬虫程序开始运行......');

// 爬去地址
var  list_url="https://pigav.com/205029/%E6%B7%AB%E4%B9%B1%E5%AE%B6%E5%BA%AD%E8%80%81%E5%B8%88%E7%97%89%E6%8C%9B%E5%90%8C%E7%BB%9D%E9%A1%B6%E5%98%852%E7%A9%B4%E4%B8%AD%E5%87%BAok-2.html";

// 代理地址
var proxy = process.env.http_proxy || 'http://172.16.0.109:13291';

//本地存储目录
var dir = './video';
//创建目录
mkdirp(dir, function(err) {
    if(err){
        console.log(err);
    }
});

getData(list_url);

// 用 superagent 去抓取  注意设置 header  来模拟浏览器发送请求 有些网站有防爬
function getData(url){
        superagent.get(url)
            .proxy(proxy)
            .end(function(err, sres,next){
                if (err) { //  错误处理
                    console.log("出错了："+err);
                }
                // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
                // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
                // 剩下就都是 jquery 的内容了
                var $ = cheerio.load(sres.text,{decodeEntities: false});
                // 解析出视频地址 video_url:'',
                // var html = $(".player-holder script").eq(1).html();
                // var s= html.indexOf("video_url: '")+12;
                // var e = html.indexOf("',",s);
                // var url = html.substring(s,e);
                    var url = 'https://r16---sn-oguesn7k.googlevideo.com/videoplayback?itag=18&requiressl=yes&ei=5iyiWb6fNoma4AKTl77gAw&mv=m&mt=1503800437&ms=au&source=youtube&clen=458567044&signature=2B79CC417FFE1A34897F35EBDDA2910D8E088916.5C247D80372E7E8D45A81C84362DC0BE3A7F6D02&gir=yes&mime=video/mp4&dur=7356.499&id=b60736e9dd739a42&mm=31&mn=sn-oguesn7k&ratebypass=yes&expire=1503822151&lmt=1498784631079067&pl=19&ipbits=0&initcwndbps=4193750&sparams=clen,dur,ei,gir,id,initcwndbps,ip,ipbits,itag,lmt,mime,mm,mn,ms,mv,pl,ratebypass,requiressl,source,expire&key=yt6&ip=172.104.126.98&signature=';
                console.log('爬的url:'+url);
                var videoName=$(".entry-title").html().substr(0,7);
                // var videoName="测试";
                var filepath=dir+'/'+videoName+'.mp4';
                // 不重复下载
                fs.exists(filepath,function(exists){
                    if (exists) {
            			// 文件已经存在不下载
            			console.log(filepath + ' 已存在了');
            		}else{
                        download(url, dir, videoName+'.mp4',function(filename){
                            console.log(filepath+"  done!!");
                        });
                    }
                })

        })
}

//下载方法
var download = function(url, dir,filename, callback) {
    var writeStream = fs.createWriteStream(dir +'/'+filename);
    writeStream.on('close', function() {
        callback(filename);
    })
    var req = superagent.get(url).proxy(proxy);
    req.pipe(writeStream);
}


// end
