var superagent = require('superagent');
var cheerio = require('cheerio');
var async = require('async');
var http = require('http');
var fs = require('fs');
var mkdirp = require('mkdirp');
var request = require("request");
console.log('爬虫程序开始运行......');

// 爬去地址
var  list_url="http://www.1717she.fun/categories/23436fd1f2e8edbb4efbacdee5d5beb5/";
var url_list=[];
var concurrencyCount = 0; // 当前并发数记录

//本地存储目录
var dir = './video';
//创建目录
mkdirp(dir, function(err) {
    if(err){
        console.log(err);
    }
});
//  根据给的列表页 获取所有的子页面的 url地址
function getList(url,callback){

    superagent.get(url,callback)
    .set('Accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
    .set('Accept-Encoding','gzip, deflate')
    .set('Accept-Language','zh-CN,zh;q=0.8')
    .set('Cache-Control','no-cache')
    .set('Connection','keep-alive')
    .set('Cookie','UM_distinctid=15df549af638eb-02255a9045994c-c313760-1aeaa0-15df549af647db; PHPSESSID=hok0apmqc10kpt7qqpg9vh35k4; video_log=6233%3A1503059468%3B5061%3A1503122368%3B5111%3A1503122496%3B3565%3A1503122851%3B3834%3A1503124063%3B6321%3A1503127037%3B3531%3A1503127212%3B; kt_qparams=category%3D67bff1d466a501a3cd318413e1fa09d8%26mode%3Dasync%26action%3Djs_stats%26rand%3D1503131410950; CNZZDATA1261769649=1408758928-1503055667-%7C1503131268; CNZZDATA1262852217=1964999098-1503057268-%7C1503127473; kt_tcookie=1; kt_is_visited=1')
    .set('Host','www.1717she.fun')
    .set('Pragma','no-cache')
    .set('Referer','http://www.1717she.fun/categories/')
    .set('Upgrade-Insecure-Requests',1)
    .set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36')
    .end(function(err, sres,next){
        if (err) { //  错误处理
            console.log("出错了："+err);
        }
        var $ = cheerio.load(sres.text,{decodeEntities: false});
        $(".list-videos .item  a").each(function(idx,ele){
            var url =$(this).attr("href");
            url_list.push(url);
        });
        console.log(url_list);
        // callback();
    })
}

getList(list_url,function(){
    async.mapLimit(url_list, 5,
    			function (url) {
    				// 对每个角色对象的处理逻辑
    		    	getData(url);
    			}
    		);

});


// 用 superagent 去抓取  注意设置 header  来模拟浏览器发送请求 有些网站有防爬
function getData(url){
        superagent.get(url)
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
                // 解析出视频地址 video_url:'',
                var html = $(".player-holder script").eq(1).html();
                var s= html.indexOf("video_url: '")+12;
                var e = html.indexOf("',",s);
                var url = html.substring(s,e);
                console.log('爬的url'+url);
                var videoName=$(".headline h1").html().substr(0,7);
                var filepath=dir+'/'+videoName+'.mp4';
                // 不重复下载
                fs.exists(filepath,function(exists){
                    if (exists) {
            			// 文件已经存在不下载
            			console.log(filepath + ' is exists');
            		}else{
                        concurrencyCount++;
                        console.log('并发数：', concurrencyCount, '，正在抓取的是', url);
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
    var req = superagent.get(url)
    req.pipe(writeStream);
}


// end
