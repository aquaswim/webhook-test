const express = require('express');
const {createServer} = require('http');
const path = require('path');
const crypto = require('crypto');
const {Server} = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.redirect(`/inspect/${crypto.randomBytes(6).toString('hex')}`);
});

app.get('/inspect/:id', (req, res) => {
    res.render('inspect', {
        webhookUrl: `/webhook/${req.params.id}`,
        webhookId: req.params.id
    });
});

app.all('/webhook/:id', bodyParser.json(), bodyParser.raw(), bodyParser.text(), bodyParser.urlencoded({extended: true}), ((req, res) => {
    const {
        query,
        path,
        referrer,
        headers,
        body,
        hostname,
        method
    } = req;
    const callData = {
        method,
        hostname,
        path,
        headers,
        query,
        referrer,
        body,
        time: new Date(),
    };
    res.json(callData);
    io.of(`/${req.params.id}`).emit('webhook-called', callData);
}))

server.listen(Number(process.env.PORT) || 3000, ()=> {
    console.log('listen in port 3000')
});

io.of('/').on('connection', socket => {
    console.log('user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    })
})
