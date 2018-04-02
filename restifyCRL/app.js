// Require the modules
var restify = require('restify');
var server = restify.createServer();
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// Set up restify
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

// setup the mysql configuration
const sql = new Sequelize('swimlanes', 'root', 'MyD@1s3y', {
	host: 'localhost',
	port: 3306,
	dialect: 'mysql',
	operatorsAliases: false,
	pool: {
		max: 5,
		min: 0,
		acuire: 30000,
		idle: 10000
	}
});

// make the connection
sql
	.authenticate()
	.then(() => {
		console.log("The connection was successful!");
	})
	.catch(err => {
		console.log("There was an error when connecting!");
	});

var Swimlanes = sql.define('swimlane', {
	id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
	name: { type: Sequelize.STRING }
});

var Cards = sql.define('card', {
	id: {type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4},
	name: {type: Sequelize.STRING},	
	cardDescription: {type: Sequelize.STRING}
});


// create associations
Cards.Swimlanes = Cards.belongsTo(Swimlanes);

sql.sync();

function getSwimlanes(req, res, next) {
	// Restify currently has a bug which doesn't allow you to set default headers
	// These headers comply with CORS and allow us to serve our response to any origin
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	//find the appropriate data
	Swimlanes.findAll().then((swimlanes) => {
		res.send(swimlanes);
	});	
}

function getCards(req, res, next) {
	// Restify currently has a bug which doesn't allow you to set default headers
	// These headers comply with CORS and allow us to serve our response to any origin
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	//find the appropriate data
	Cards.findAll().then((cards) =>{
		res.send(cards);
	});
}

function postSwimlane(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	console.log(req.body);

	
	// save the new message to the collection
	Swimlanes.create({
		id: req.body.id,
		name: req.body.name
	}).then((swimlane) => {
		res.send(swimlane);
	});	
}

function postCard(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	console.log(req.body);

	
	// save the new message to the collection
	Swimlanes.findAll({
		where: {id: req.body.swimlane_id}
	})
	.then((swimlanes) => {
		Cards.create({
			id: req.body.id,
			name: req.body.name,
			cardDescription: req.body.cardDescription
		}).then((card) => {
			card.setSwimlanes(swimlanes[0]);
			res.send(card);
		});
	});	
}

function getCardsBySwimlaneId (req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	console.log(req.params)

	Cards.findAll({
		where: {swimlaneId: req.params.swimlane_id}
	})
	.then((cards) => {
		res.send(cards);
	});
}

function updateSwimlaneById (req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	// get swimlaneId from URL
	var swimlaneId =  req.params.swimlane_id;

	// get newSwimlane from body
	var name = req.body.name;

	// find swimlane by swimlane ID
	// var swimlane = swimlanes.find(function(swimlane){
	// 	return swimlane.id == swimlaneId;
	// });

	// update swimlanes name property
	// swimlane.name = name;

	// return swimlane to caller
	// res.send(swimlane);
}

function updateCardById (req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	var card_id = req.params.card_id;

	// var card = cards.find(function(card){
	// 	return card.id == card_id;
	// });
	// if(req.body.name){
		// card.name = req.body.name;
	// }
	// if(req.body.description){
		// card.cardDescription = req.body.description;
	//}
	// res.send(card);
}



// Set up our routes and start the server
server.get('/swimlanes', getSwimlanes);
server.post('/swimlanes', postSwimlane);

server.get('/swimlanes/:swimlane_id/cards', getCardsBySwimlaneId);

server.post('/swimlanes/:swimlane_id', updateSwimlaneById);

server.post('/swimlanes/cards/:card_id', updateCardById);

server.get('/cards', getCards);
server.post('/cards', postCard);

server.listen(8080, function() {
	console.log('%s listening at %s', server.name, server.url);
});
