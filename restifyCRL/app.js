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

const sql = new Sequelize('Trello', 'root', 'pizzaseven11', {
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

var Board = sql.define('boards', {
    id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    name: { type: Sequelize.STRING }
});

var Swimlane = sql.define('swimlanes', {
    id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    name: { type: Sequelize.STRING }
});

var Card = sql.define('cards', {
    id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    name: { type: Sequelize.STRING },
    cardDescription: { type: Sequelize.STRING }
});


// create associations
Board.hasMany(Swimlane);
Swimlane.hasMany(Card);
Card.belongsTo(Swimlane);
Swimlane.belongsTo(Board);


sql.sync();

function getBoards(req, res, next) {
    // Restify currently has a bug which doesn't allow you to set default headers
    // These headers comply with CORS and allow us to serve our response to any origin
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    //find the appropriate data
    Board.findAll().then((Board) => {
        res.send(Board);
    });
}

function getSwimlanes(req, res, next) {
    // Restify currently has a bug which doesn't allow you to set default headers
    // These headers comply with CORS and allow us to serve our response to any origin
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    //find the appropriate data
    Swimlane.findAll().then((Swimlane) => {
        res.send(Swimlane);
    });
}

function getCards(req, res, next) {
    // Restify currently has a bug which doesn't allow you to set default headers
    // These headers comply with CORS and allow us to serve our response to any origin
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    //find the appropriate data
    Card.findAll().then((Card) => {
        res.send(Card);
    });

}

function postBoard(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    console.log(req.body);


    // save the new message to the collection
    Board.create({
        id: req.body.id,
        name: req.body.name
    }).then((board) => {
        res.send(board);
    });

}

function postSwimlane(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    console.log(req.body);


    // save the new message to the collection
    Swimlane.create({
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
    Swimlane.find({
            where: { id: req.body.swimlane_id }
        })
        .then((Swimlane) => {
            Card.create({
                id: req.body.id,
                name: req.body.name,
                cardDescription: req.body.cardDescription
            }).then((card) => {
                card.setSwimlane(Swimlane);
                res.send(card);
            });
        });
}

function getCardBySwimlaneId(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    console.log(req.params)

    Card.findAll({
            where: { swimlaneId: req.params.swimlane_id }
        })
        .then((Card) => {
            res.send(Card);
        });
}

function updateSwimlaneById(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    // get swimlaneId from URL
    var swimlaneId = req.params.swimlane_id;

    // get newSwimlane from body
    var name = req.body.name;

    Swimlane.find({
        where: { id: swimlaneId }
    }).then((swimlane) => {
        if (swimlane) {
            swimlane.updateAttributes({
                name: name
            })
        }
        res.send(swimlane);
    });
}


function updateCardById(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var card_id = req.params.card_id;


    Card.find({
        where: { id: card_id }
    }).then((card) => {
        if (card) {
            if (req.body.name) {
                card.updateAttributes({
                    name: req.body.name
                });
            }
            if (req.body.description) {
                card.updateAttributes({
                    cardDescription: req.body.description
                });
            }
        }
        res.send(card);
    });

    
}



// Set up our routes and start the server
server.get('/boards', getBoards);

server.post('/boards', postBoard);

// server.post('/boards/:board_id', updateBoardById);

server.get('/swimlanes', getSwimlanes);

server.post('/swimlanes', postSwimlane);

server.get('/swimlanes/:swimlane_id/cards', getCardBySwimlaneId);

server.post('/swimlanes/:swimlane_id', updateSwimlaneById);

server.post('/swimlanes/cards/:card_id', updateCardById);

server.get('/cards', getCards);
server.post('/cards', postCard);

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});