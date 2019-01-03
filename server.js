//Exporess
var express = require("express");
var app = express();
var port = 3000;

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Database 
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/imagekit",{ useNewUrlParser: true } );

var userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		unique: true,
	},
	name: {
		type: String,
		required: true,
		trim: true,
	},
	password: {
		type: String,
		required: true
	},
	date : {
		type : Date
	},
	ip : {
		type : String
	}
});

var User = mongoose.model("User", userSchema);
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

// Routes
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.get("/validate_data",(req,res) => {
    User.find({ ip : req.ip, date : {$gte: today} }, function(err, data){
    	if(data.length > 3){
    		//google recaptcha
    		res.json({"success":true,"show_recaptcha":true})
    	}else{
    		res.json({"success":true,"show_recaptcha":false})
    	}
    });
});

app.post("/add_data", (req, res) => {
	var myData = new User();
	myData.email = req.body.email;
	myData.name = req.body.name;
	myData.password = req.body.password;
	myData.date = new Date();
	myData.ip = req.ip;

	const request = require('request')

	request.post({
		headers: {'content-type' : 'application/x-www-form-urlencoded'},
		url : 'https://google.com/recaptcha/api/siteverify',
		body:    "secret=6LdfqoYUAAAAABPOsjwlPCbG4NDiHOcpwcOocmAo&response="+req.body.g_recaptcha_response
	}, (error, result, body) => {
		if (error) {
			console.error(error)
			return
		}
		if(JSON.parse(body).success){
			myData.save()
			.then(item => {
				res.json({'success':true});
			})
			.catch(err => {
				res.json({"success":false,"show_recaptcha":false});
			});
		}
	})

});



// Serving Application
app.listen(port, () => {
	console.log("Server listening on port " + port);
});