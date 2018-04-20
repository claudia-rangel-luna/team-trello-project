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

var User = sql.define('users', {
    id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    // nickname: {type: Sequelize.STRING },
    name: { type: Sequelize.STRING }    
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
User.hasMany(Board);
Board.belongsTo(User);
Board.hasMany(Swimlane);
Swimlane.hasMany(Card);
Card.belongsTo(Swimlane);
Swimlane.belongsTo(Board);


sql.sync();

function getBoardsByUserId(req, res, next) {
    // Restify currently has a bug which doesn't allow you to set default headers
    // These headers comply with CORS and allow us to serve our response to any origin
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var userId = req.params.user_id;
    // var nickname = req.params.user.nickname;
    //find the appropriate data
    Board.findAll({
        where: { userId: userId}
    }).then((boards) => {
        res.send(boards);
    });
}

function getSwimlanesByBoardId(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var boardId = req.params.board_id;

    Swimlane.findAll({
        where: { boardId: boardId }
    }).then((swimlanes) => {
        res.send(swimlanes);
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
    var userId = req.params.user_id;

    // save the new message to the collection

    User.find({
        where: { id: userId }
    }).then((user) => {
        Board.create({
            id: req.body.id,
            name: req.body.name
        }).then((board) => {
            board.setUser(user)
            res.send(board);
        });
    });
}

function postSwimlane(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    console.log(req.body);

    var boardId = req.params.board_id;

    // save the new message to the collection
    Board.find({
        where: { id: boardId }
    }).then((board) => {
        Swimlane.create({
            id: req.body.id,
            name: req.body.name
        }).then((swimlane) => {
            swimlane.setBoard(board);
            res.send(swimlane);
        });
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
        .then((swimlane) => {
            Card.create({
                id: req.body.id,
                name: req.body.name,
                cardDescription: req.body.cardDescription
            }).then((card) => {
                card.setSwimlane(swimlane);
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

function updateBoardById(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    // get swimlaneId from URL
    var boardId = req.params.board_id;

    // get newSwimlane from body
    var name = req.body.name;

    Board.find({
        where: { id: boardId }
    }).then((board) => {
        if (board) {
            board.updateAttributes({
                name: name
            })
        }
        res.send(board);
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

function removeBoard(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    // get swimlaneId from URL
    var boardId = req.params.board_id;
    var swimlaneId = req.params.swimlane_id;

    Board.find({
            where: { id: boardId }
        }).then((board) => {
                Swimlane.findAll({
                    where: { boardId: boardId, id: swimlaneId }
                }).then((swimlanes) => {
                    console.log(swimlanes);
                    var swimlanes = board.getSwimlanes().then((swimlanes) => {
                        for (var j = 0; j < swimlanes.length; j++) {
                            var swimlane = swimlanes[j];

                            var cards = swimlane.getCards().then((cards) => {
                                for (var i = 0; i < cards.length; i++) {
                                    cards[i].destroy();
                                }
                            });
                            swimlane.destroy();
                         };
                        });
                    });

                    board.destroy();
                });

                res.send(200);
            }


function removeSwimlane(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    // get swimlaneId from URL
    var swimlaneId = req.params.swimlane_id;
    var card_id = req.params.card_id;


    Swimlane.find({
        where: { id: swimlaneId }
    }).then((swimlane) => {

        var cards = swimlane.getCards().then((cards) => {
            for (var i = 0; i < cards.length; i++) {
                cards[i].destroy();
            }

            swimlane.destroy();
        });
        res.send(200);
    });
}

function removeCards(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");


    var card_id = req.params.card_id;

    Card.find({
        where: { id: card_id }
    }).then((card) => {

        card.destroy();
    });

    res.send(200);
}

function getBoard(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    Board.find({
    	where: {id: req.params.board_id}
    }).then((board) => {
    	res.send(board);
    })
}
function getUser(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    User.find({
        where: {id: req.params.user_id}
    }).then((user) => {
        res.send(user);
    });
}

function postUser(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    User.create({
        id: req.body.id,
        name: req.body.name
    }).then((user) => {
        res.send(user);
    });

}
// Set up our routes and start the server
server.opts('/users/:user_id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', 'Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.send(200);
});
server.opts('/users/boards/:board_id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', 'Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.send(200);
}); 
server.opts('/boards/:board_id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', 'Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.send(200);
});
server.opts('/swimlanes/:swimlane_id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', 'Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.send(200);
});

server.opts('/swimlanes/cards/:card_id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', 'Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.send(200);
});

server.get('/users/:user_id', getUser);

server.post('/users', postUser);

server.get('/users/:user_id/boards', getBoardsByUserId);

server.get('/users/boards/:board_id', getBoard);

server.post('/users/:user_id/boards', postBoard);

server.post('/users/boards/:board_id', updateBoardById);

server.get('/boards/:board_id/swimlanes', getSwimlanesByBoardId);

server.get('/swimlanes', getSwimlanes);

server.post('/boards/:board_id/swimlanes', postSwimlane);

server.get('/swimlanes/:swimlane_id/cards', getCardBySwimlaneId);

server.post('/swimlanes/:swimlane_id', updateSwimlaneById);

server.post('/swimlanes/cards/:card_id', updateCardById);

server.get('/cards', getCards); 

server.post('/cards', postCard);

server.del('/boards/:board_id', removeBoard); 

server.del('/swimlanes/:swimlane_id', removeSwimlane);

server.del('/swimlanes/cards/:card_id', removeCards);

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});