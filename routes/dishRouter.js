const express = require('express');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');

var authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const cors = require('./cors');

const dishRouter = express.Router({ mergeParams: true });

dishRouter.use(bodyParser.json());

dishRouter.route('/')
    
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); }) //use for preflight the req using cors
    .get(cors.cors, (req, res, next) => {
        Dishes.find({})        
//.populate is used for accessing another schema inside current schema using objectId
        .populate('comments.author')
        .then((dishes) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dishes);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) =>{authenticate.verifyAdmin(req, res, next)}, (req, res, next) => {
        Dishes.create(req.body)
        .then((dish) => {
            console.log('Dish Created', dish);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, (req, res, next) => {
        Dishes.remove({})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);   
        }, (err) => next(err))
        .catch((err) => next(err));
    });

dishRouter.route('/:dishId')
  
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); }) //use for preflight the req using cors
    .get(cors.cors, (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .populate('comments.author')
        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);   
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, (req, res, next) => {
       Dishes.findByIdAndUpdate(req.params.dishId, {
           $set: req.body     
       },{ new: true })
       .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);   
    }, (err) => next(err))
    .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, (req, res, next) => {
        Dishes.findByIdAndDelete(req.params.dishId)
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);   
        }, (err) => next(err))
        .catch((err) => next(err));    
    });

    dishRouter.route('/:dishId/comments')

    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); }) //use for preflight the req using cors
    .get(cors.cors, (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .populate('comments.author')
        .then((dish) => {
            if(dish != null){
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish.comments);
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
    //must handle error after promise
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null) {
                req.body.author = req.user._id;
                dish.comments.push(req.body);
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    })            
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes/'
            + req.params.dishId + '/comments');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, (req, res, next) => {
        if(req.body.author.equals(req.user._id)) {
            Dishes.findById(req.params.dishId)
            .then((dish) => {
                if(dish != null){
                    for(var i = (dish.comments.length-1);i>=0;i--){
                        dish.comments.id(dish.comments[i]._id).remove();
                    }
                    dish.save()
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);                
                    }, (err) => next(err));
                }
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                } 
            }, (err) => next(err))
            .catch((err) => next(err));    
        }
        else {
            var err = new Error('You are not authoried')
            err.status = 403;
            return next(err);            
        }       
    });

dishRouter.route('/:dishId/comments/:commentId')

    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); }) //use for preflight the req using cors
    .get(cors.cors, (req,res,next) => {
        Dishes.findById(req.params.dishId)
        .populate('comments.author')
        .then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId) != null) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish.comments.id(req.params.commentId));
            }
            else if (dish == null) {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);            
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId +
        '/comments/' + req.params.commentId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId) != null) {
                var comment = dish.comments.id(req.params.commentId);
                if(!comment.author._id.equals(req.user._id)) {
                    var err = new Error("you are not authorized to do this operation")
                    err.status = 403;
                    next(err);
                }
                if (req.body.rating) {
                    dish.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if (req.body.comment) {
                    dish.comments.id(req.params.commentId).comment = req.body.comment;                
                }
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);  
                    })                                  
                }, (err) => next(err));
            }
            else if (dish == null) {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);            
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId) != null) {
                var comment = dish.comments.id(req.params.commentId);
                dish.comments.id(req.params.commentId).remove();
                if(!comment.author._id == req.user._id) {
                    var err = new Error("you are not authorized to do this operation")
                    err.status = 403;
                    next(err);
                }
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);                
                    }, (err) => next(err));
                })
            }
            else if (dish == null) {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);            
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    });
    
module.exports = dishRouter;