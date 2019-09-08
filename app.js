const express = require('express');
const { pluralize } = require('inflection');
const app = express();

// const { User, Department } = require('./db').models;
const { conn } = require('./db');

module.exports = app;

app.use(express.json());

Object.entries(conn.models).forEach(([name, model])=>{
    console.log(pluralize(name))
    const route = `/api/${pluralize(name)}`;
    const idRoute = `/api/${pluralize(name)}/:id`;
    app.get(route, (req, res, next) => {
        model.findAll()
            .then(items => res.send(items))
            .catch(next)
    })
    
    app.post(route, (req, res, next)=>{
        model.create(req.body)
            .then(item => res.status(201).send(item))
            .catch(next)
    })
    
    app.delete(idRoute, (req, res, next)=>{
        model.findByPk(req.params.id)
            .then(item=>item.destroy())
            .then(()=>res.sendStatus(204))
            .catch(next)
    })
    
    app.put(idRoute, (req, res, next)=>{
        model.findByPk(req.params.id)
            .then(item=>item.update(req.body))
            .then(item=>res.send(item))
            .catch(next)
    })
})
