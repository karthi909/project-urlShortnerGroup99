const express = require('express');
const bodyParser = require('body-parser');
const route = require("./Route/route.js")
const { default: mongoose } = require('mongoose');
//const { Route } = require('express');
const app = express();


app.use(bodyParser.json());




mongoose.connect("mongodb+srv://KA909_1:karthi123@cluster0.qpomb.mongodb.net/group990Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);


app.listen(3000)
    console.log('Express app running on port ' + (process.env.PORT || 3000))