const urlMOdel = require("../model/urlModel")
// const nanoid = require('nanoid')
//var { nanoid } = require("nanoid");
const validUrl = require('valid-url')
const redis = require('redis')
const { customAlphabet } = require ('nanoid')
const {promisify} = require('util')




const redisClient = redis.createClient(
    12198,
    "redis-12198.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("O14W8zyhWnPbw3Zx8nfb5modml9n6mqv", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });

  
const SET_ASYNC = promisify(redisClient.SETEX).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

  

// const isValid = function (value) {
//     if (typeof value === "undefined" || value === null) return false;
//     if (typeof value === "string" && value.trim().length === 0) return false;
//     return true;
// };




const createUrl = async (req, res) => {
    try{

        const data = req.body;
        if(Object.keys(data).length == 0) return res.status(400).send({status: false, msg:"data is Missing"})
        const baseUrl = 'http:localhost:3000'

        if(!data.longUrl) return res.status(400).send({status: false, message: "longUrl is required"})

        if(!validUrl.isUri(baseUrl)){
            return res.status(401).send({status: false, message: "Invalid baseUrl"});
        }
       
    //validUrl.isUri(data.longUrl)
        if(validUrl.isUri(data.longUrl)){
    
                let getUrl = await GET_ASYNC(`${data.longUrl}`)
                let url = JSON.parse(getUrl)
                if(url){
                    return res.status(200).send({status: true, message: "Success",data: url});
                } 

                let reptLongUrl = await urlMOdel.findOne({longUrl: data.longUrl}).select({_id:0, __v:0, createdAt:0, updatedAt: 0});
                
                
                if(reptLongUrl) {
                    await SET_ASYNC(`${data.longUrl}`,60, JSON.stringify(reptLongUrl))
                    return res.status(201).send({status: true, msg:"URL created Successfully", data: reptLongUrl})
                } else {
    
                    const nanoid = customAlphabet('abcdefghijAB', 12)
                    let urlCode = nanoid()
                    //console.log(codeurl)
                    //let urlCode = codeurl.toLowerCase()
                   // console.log(urlCode)
                    
                    let shortUrl = baseUrl + "/" + urlCode;

                    data.urlCode = urlCode

                    data.shortUrl = shortUrl

                    let repeat = await urlMOdel.find({urlCode: data.urlCode})
                   // console.log(repeat)
                    if(!repeat) return res.status(400).send({status: false, msg:"repeated url code" })

                    await urlMOdel.create(data)
                    let responseData  = await urlMOdel.findOne({urlCode:urlCode}).select({_id:0, __v:0, createdAt:0, updatedAt: 0});
                    await SET_ASYNC(`${data.longUrl}`,60, JSON.stringify(responseData))
                    return res.status(201).send({status: true, message: "URL create successfully",data:responseData});

                }
        }else{
            
           return res.status(400).send({status: false, message: "Invalid longUrl"});
        }    

    }catch(err){
        console.log(err)
        return res.status(500).send({status: false, Error: err.message})
    }
}


const getUrl = async (req, res) => {

    try{
    let cacheData = await GET_ASYNC(`${req.params.urlCode}`)
    //console.log(cacheData)
    let url = JSON.parse(cacheData)
    //console.log(url)
    if(url){
         return res.status(302).redirect(url.longUrl)
    }else{
        let code = await urlMOdel.findOne({urlCode: req.params.urlCode}) 
        if(!code) return res.status(404).send({status: false, message:"No URL Found"})

        await SET_ASYNC(`${req.params.urlCode}`,60, JSON.stringify(code))
        return res.status(302).redirect(code.longUrl);
    }
  }catch(err){
         return res.status(500).send({status: false, Error: err.message})
     }
}

module.exports.createUrl = createUrl
module.exports.getUrl = getUrl