const express = require('express');
const bodyParser = require('body-parser');

const leadersRouter = express.Router();

leadersRouter.use(bodyParser.json());

leadersRouter.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/plain');
    next();
})
leadersRouter.get('/',(req, res, next) => {
    res.end("Will send all the leaders to you!");
})
leadersRouter.post('/',(req, res, next) => {
    res.end('Will add the leader: ' + req.body.name +
    ' with details: ' + req.body.description);
})
leadersRouter.put('/',(req, res, next) =>{
    res.statusCode = 403;
    res.end('PUT operation is not supported on /leaders'); 
})
leadersRouter.delete('/',(req, res, next) => {
    res.end('Deleting all the leaders');
});

leadersRouter.get('/:leaderId',(req, res, next) => {
    res.end("Will send details of the leader: " +
    req.params.leaderId + " to you");
})
leadersRouter.post('/:leaderId',(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation is not supported on /leaders ' + 
    req.params.leaderId); 
})
leadersRouter.put('/:leaderId',(req, res, next) =>{
   res.write('Updating the leader: ' + req.params.leaderId + '\n');
   res.end('Will update the leader: ' + req.body.name + 
   ' with details: ' + req.body.description);
})
leadersRouter.delete('/:leaderId',(req, res, next) => {
    res.end('Deleting the leader: ' + req.params.leaderId);
});


module.exports = leadersRouter;
