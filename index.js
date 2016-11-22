var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var users = {};
var usernames={};
// view engine setup
app.use(logger('dev'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, '/public/images/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res) {
    res.render('index');
});
app.get('/login', function(req, res) {
    var name = req.query.name;
    users[name] = name;
    res.render('index');
});
app.get('/new', function(req, res) {
    res.render('index');
});
//所有在线的user

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('online', function(data) {
        console.log(data);
        socket.name = data.user;
        if (!users[data.user]) {
            console.log(socket.name+'已经存在');
            users[data.user] = socket;
        }
        for(var i in users){
            if(users[i].name){
                usernames[i]=users[i].name;
            }
        }
        console.log(usernames);
        //向所有用户广播该用户上线信息
        io.emit('online', {
            user: data.user,
            users: usernames
        });
    });

    socket.on('chat message', function(msg) {
        io.emit('chat message', msg);
    });
    socket.on('chat secret', function(data) {
        for(var i in users){
            if(users[i].name==data.from||users[i].name ==data.to){
                users[i].emit('chat secret',data);
            }
        }
    });
    socket.on('disconnect', function() {
        console.log('%s user disconnected',socket.name);
        for(var i in users){
            if(users[i].name==socket.name){
                delete users[i];
                delete usernames[socket.name];
            }
        }
        io.emit('disconnect',{users: usernames})
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
