express = require 'express'
mongoose = require 'mongoose'

mongoose.connect process.env.MONGOLAB_URI || 'mongodb://localhost/todone'

Todo = mongoose.model 'Todo', new mongoose.Schema
  content: String
  done: Boolean

app = express.createServer()
app.register '.coffee', require('coffeekup')
app.set 'view engine', 'coffee'
app.set 'view options', 
  layout: false

app.configure ->
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.static(__dirname + '/public')

app.get "/", (req, res) ->
  res.render "app"
  
app.get "/todos", (req, res) ->
  Todo.find (err, todos) ->
    res.send todos
    
app.post "/todos", (req, res) ->
  todo = new Todo(content: req.body.content, done: req.body.done)
  todo.save (err) ->
    console.log("created1") unless err
  res.send todo
  
app.put "/todos/:id", (req, res) ->
  Todo.findById req.params.id, (err, todo) ->
    todo.content = req.body.content
    todo.done = req.body.done
    todo.save (err) ->
      console.log("updated") unless err
      res.send todo
      
app.del '/todos/:id', (req, res) ->
  Todo.findById req.params.id, (err, todo) ->
    todo.remove (err) ->
      console.log("removed") unless err
  
app.listen process.env.PORT || 3000