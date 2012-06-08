var Project, app, express, mongoose;
express = require('express');
mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/swmVoting');

Project = mongoose.model('Project', new mongoose.Schema({
	name: String,
	votes: Number
}));

app = express.createServer();
app.register('.coffee', require('coffeekup'));
app.set('view engine', 'coffee');
app.set('view options', {
	layout: false
});

app.configure(function() {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	return app.use(express.static(__dirname + '/public'));
});

app.get("/", function(req, res) {
	return res.render("main");
});

app.get("/projects", function(req, res) {
	return Project.find(function(err, projects) {
	  return res.send(projects);
	});
});

app.post("/projects", function(req, res) {
	var project;
	project = new Project({
	  name: req.body.name,
	  votes: req.body.votes
	});
	project.save(function(err) {
	  if (!err) {
		return console.log("created");
	  }
	});
	return res.send(project);
});

app.put("/projects/:id", function(req, res) {
return Project.findById(req.params.id, function(err, project) {
  project.name = req.body.name;
  project.votes = req.body.votes;
  return project.save(function(err) {
	if (!err) {
	  console.log("updated");
	}
	return res.send(project);
  });
});
});

app.del('/projects/:id', function(req, res) {
	return Project.findById(req.params.id, function(err, project) {
	  return project.remove(function(err) {
		if (!err) {
		  return console.log("removed");
		}
	  });
	});
});

// var io = require('socket.io').listen(app);
// io.sockets.on('connection', function(socket) {
// 		socket.on('clientVoted', function (data) {
//     		console.log(data);
//     		io.sockets.emit('forceClientUpdate');
//   		});
// 	}
// );

app.listen(3000);
