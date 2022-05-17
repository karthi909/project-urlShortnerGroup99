const urlMOdel = require("../model/urlModel")
// const nanoid = require('nanoid')
//var { nanoid } = require("nanoid");
const validUrl = require('valid-url')

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const { customAlphabet } = require ('nanoid')



const createUrl = async function (req, res) {
    try{

       
       const data = req.body;

        if (Object.keys(data).length == 0)  return res.status(400).send({ status: false, message: 'No data provided' }) 

        const longUrl = req.body.longUrl


     

        if (!isValid(longUrl))  return res.status(400).send({ status: false, message: 'Long Url is required' }) 

        if (!validUrl.isUri(longUrl))  return res.status(400).send({ status: false, message: 'Please provide a valid URL' }) 

       


        const baseUrl = 'http://localhost:3000';

        if (!validUrl.isUri(baseUrl)) { return res.status(400).send({ status: false, message: 'The base URL is invalid' }) }


      
        //let codeurl = nanoid()
        const nanoid = customAlphabet('abcdefghij', 10)
        let codeurl = nanoid()
        let urlCode = codeurl.toLowerCase()

        const shorturl = baseUrl + '/' + urlCode

       //console.log(shorturl)

       data.shortUrl = shorturl
        //console.log(data.shorturl)

       data.urlcode = urlCode
       // console.log(data.urlCode)

        let repeat = await urlMOdel.findOne({shorturl: data.shorturl, urlcode:data.urlCode}) 
        console.log(repeat)
        if(repeat) return res.status(400).send({status: false, msg:"not a unique shorturl and urlcode"})


        

        await urlMOdel.create({longUrl: longUrl, shortUrl: shorturl, urlcode: urlCode});
        

        return res.status(201).send({status: true, msg:"URL created successfully", data: data})

    }
    catch(err){
        console.log(err)
        res.status(500).send({status: false, msg: err.message})
    }
    
}

const getlongURl = async function (req, res) {
    try{
        const urlCode = req.params.urlCode;

        if (Object.keys(urlCode).length == 0) { return res.status(400).send({ status: false, message: 'Please provide URL Code in Params' }) }
        console.log(Object.keys(urlCode))

        const URL = await urlMOdel.findOne({ urlCode: urlCode }).select({longUrl:1})

        if (!URL) { return res.status(404).send({ status: false, message: 'No URL found with this URL Code. Please check input and try again' }) }

    
       

      return res.status(302).send({data: URL});

      

    }
    catch(err){
        return res.status(500).send({ message: err.message })
    }
}

module.exports.createUrl = createUrl
module.exports.getlongURl = getlongURl