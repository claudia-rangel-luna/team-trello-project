const express = require('express');
const passport = require('passport');
const router = express.Router();
var requestPromise = require('request-promise');


var app = express();
app.use(require('serve-static')(__dirname + '/../../public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

const env = {
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});


router.get('/login', passport.authenticate('auth0', {
        clientID: env.AUTH0_CLIENT_ID,
        domain: env.AUTH0_DOMAIN,
        redirectUri: env.AUTH0_CALLBACK_URL,
        responseType: 'code',
        audience: 'https://' + env.AUTH0_DOMAIN + '/userinfo',
        scope: 'openid profile'
    }),
    function(req, res) {
        res.redirect("/");
    });

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/callback',
    passport.authenticate('auth0', {
        failureRedirect: '/failure'
    }),
    function createUserIfDoesNotExist(req, res) {
        console.log(req.user)
        //check if the user exists use npm packages request and request-promise
        var options = {
            uri: "http://localhost:8080/users/" + req.user.user_id,
            json: true
        }
        requestPromise(options)
            .then(function(user) {
                if (user !== null) {
                    console.log('User was found');
                    res.redirect('/boards?id=' + req.user.user_id);
                } else {
                    console.log('User does not exist.');
                    var postOptions = {
                        method: 'POST',
                        uri: 'http://localhost:8080/users',
                        body: {
                            id: req.user.user_id,
                            name: req.user.displayName
                        },
                        json: true
                    }
                    requestPromise(postOptions)
                        .then(function(user) {
                            //Post succeeded
                            console.log('User was created.');
                            res.redirect('/boards?id=' + user.id)

                        })
                        .catch(function(err) {
                            //Post Failed
                            console.log('Error creating user.');
                        })
                };

            })
            .catch(function(err) {
                alert("Error logging in, user already entered");
            });
    });
//if it doesnt exsist add it to the data base


router.get('/failure', function(req, res) {
    var error = req.flash("error");
    var error_description = req.flash("error_description");
    req.logout();
    res.render('failure', {
        error: error[0],
        error_description: error_description[0],
    });
});

module.exports = router;