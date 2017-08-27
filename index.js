var superagent = require('superagent');
var cheerio = require('cheerio');
var async = require('async');

var fs = require('fs');
var mkdirp = require('mkdirp');
var request = require("request");
console.log('爬虫程序开始运行......');


var out = process.stdout;
var passedLength = 0;
var lastSize = 0;
var startTime = Date.now();
// 爬去地址
var  list_url="http://qingru806.lofter.com/post/1de27885_10ec6e91";
//本地存储目录
var dir = './images';
//创建目录
mkdirp(dir, function(err) {
    if(err){
        console.log(err);
    }
});
getData(list_url);
// 用 superagent 去抓取  注意设置 header  来模拟浏览器发送请求 有些网站有防爬
function getData(url){
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
                $('.ctc .pic img').each(function (idx, element) {
                    var src = $(this).attr('src');
                    var filename = Math.floor(Math.random()*100000) + '.' +src.substr(-3,3);
                    console.log('正在下载--' + filename);
                    download(src, dir, filename);
                });
        })
}

//下载方法
var download = function(url, dir, filename){
        // var totalSize = res.caseless.dict['content-length'];
        // showDownInfo(totalSize);
		request(url).pipe(fs.createWriteStream(dir + "/" + filename)).on("upgrade",function(){
            console.log("加载中");
        });
};

function showDownInfo(totalSize){
    var timer = setTimeout(function show() {
        var percent = Math.ceil((passedLength / totalSize) * 100);
        var size = Math.ceil(passedLength / 1000000);
        var diff = size - lastSize;
        lastSize = size;
        out.clearLine();
        out.cursorTo(0);
        out.write('已完成' + size + 'MB, ' + percent + '%, 速度：' + diff * 2 + 'MB/s');
        if (passedLength < totalSize) {
            setTimeout(show, 500);
        } else {
            var endTime = Date.now();
            console.log('共用时：' + (endTime - startTime) / 1000 + '秒。');
        }
    }, 500);

}







// end
