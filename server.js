const express = require('express'),
    app = express(),
    port = 8000,
    mongoose = require('mongoose'),
    flash = require('express-flash'),
    session = require('express-session'),
    server = app.listen(port, console.log(`Listening on port ${port}`));

app.use(express.static(__dirname + '/static'));
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(session({
    cookie: { maxAge: 60000 },
    saveUninitialized: true,
    resave: 'true',
    secret: 'WonderWoman'
}));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

mongoose.connect('mongodb://localhost/Message_Board', { useUnifiedTopology: true, useNewUrlParser: true });
app.use(express.urlencoded({ extended: true }));

const CommentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Message has to have name"]
    },
    comment: {
        type: String,
        required: [true, "Can't send a message without a message"],
        minLength: [10, "Must have minimum characters of 10"]
    },
},
    { timestamps: true });

const MessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Message has to have name"]
    },
    message: {
        type: String,
        required: [true, "Can't send a message without a message"],
        minLength: [10, "Must have minimum characters of 10"]},
        comments: [CommentSchema]
},
    { timestamps: true });


// create an object to that contains methods for mongoose to interface with MongoDB
const Message = mongoose.model('Message', MessageSchema);
const Comment = mongoose.model('Comment', CommentSchema);

app.post('/new/message', (req, res) => {
    Message.create(req.body)
        .then(message => res.redirect('/'))
.catch(err => {
            for (var key in err.errors) {
                req.flash('creatingMessage', err.errors[key].message);
            }
            res.redirect('/');
        })
})

app.get('/', (req,res) => {
    Message.find()
        .then(messages => res.render('dashboard', {allMessages: messages}))
        .catch(err =>{
            console.log(err);
        })
})



app.post('/message/:id/new/comment', (req, res) => {
    Comment.create(req.body)
        .then(comment => {
            console.log(req.params.id);

            console.log("I am in creating comment!");
            Message.findOneAndUpdate({_id: req.params.id},
                {$push: {comments: comment}})
                .then(result => {
                    res.redirect('/');
                })
                .catch(err => {
                    console.log(err);
                    for (var key in err.errors) {
                        req.flash('updatingMessage', err.errors[key].message);
                    }
                    res.redirect('/');
                })
            })
        .catch(err => {
            for (var key in err.errors) {
                req.flash('creatingComment', err.errors[key].message);
            }
            res.redirect('/');
        })
    })