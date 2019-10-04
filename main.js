const Discord = require('discord.js');
const Twitter = require('twitter');
const req = require('request');
const fs = require('fs');
const settings = require('./settings.json');

const client = new Discord.Client();
const twclient = new Twitter({
  consumer_key: settings["tw_ck"],
  consumer_secret: settings["tw_cs"],
  access_token_key: settings["tw_tk"],
  access_token_secret: settings["tw_ts"]
})

function get_urllist(str){
	var pat=/(https?:\/\/[\x21-\x7e]+)/g;
	var list=str.match(pat);
	if(!list)return [];
	return list;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

  if(msg.author.bot === false){
    if (msg.channel.id === '629113306325712917' || msg.channel.id === '629112113302077459'){
      console.log('メッセージが投稿されました。');
      if(msg.content.indexOf('https://twitter.com') != -1 ){
        get_urllist(msg.content).forEach(function(item){
          item = item.slice(item.indexOf('status/')).replace('status/', '').replace('?s=19', '');
          console.log(item);

          twclient.get('statuses/show.json?id=' + item, function(err,tw,res){
            let pic_no = 0;
            if(typeof tw['extended_entities'] === "undefined"){
              return null;
            }
            if(tw['extended_entities']["media"][0]["type"] === 'photo'){
              tw['extended_entities']["media"].forEach(function(i){
                pic_no += 1;
                let pic_name = tw["id_str"] + '_' + pic_no + '.png';
                let pic_url = i["media_url_https"];
  
                req({method: 'GET', url: pic_url, encoding: null},function(err,res,body){
                  if(!err && res.statusCode === 200){
                    if(tw['extended_entities']["media"]["length"] != 1){
                      let path = 'img/' + tw["id_str"];
                      if(fs.existsSync(path) == false){
                        fs.mkdirSync(path);
                      }
                      fs.writeFileSync('img/' + tw["id_str"] + '/' + pic_name, body, 'binary');
                    }
                    else {
                      fs.writeFileSync('img/' + pic_name, body, 'binary');
                    }
                  }
                })
              })
              msg.react('👍');
            }
          })
        })
      }
    } 
  }
});

client.login(settings["ds_token"]);