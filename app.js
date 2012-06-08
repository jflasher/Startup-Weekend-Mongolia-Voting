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

// List of all projects
app.get("/projects", function(req, res) {
	return Project.find(function(err, projects) {
	  return res.send(projects);
	});
});

// Get a single record
app.get("/projects/:id", function(req, res) {
	return Project.findById(req.params.id, function(err, project) { 
		return res.send(project); 
	});
});

// Create
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

// Update
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

// Delete
app.del('/projects/:id', function(req, res) {
	return Project.findById(req.params.id, function(err, project) {
	  return project.remove(function(err) {
		if (!err) {
		  return console.log("removed");
		}
	  });
	});
});

// Socket IO methods
var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {

	socket.on('clientVoted', function (data) {
		console.log(data);
		io.sockets.emit('forceClientUpdate');
	});
	
	// A client has created a new project
	socket.on('projectAdded', function(data) {
		project = new Project({name: data.name, votes: data.votes});
		project.save(function(err) {
			if (!err) {
				return console.log("created");
			} else {
				console.log(err);
			}
		});
		io.sockets.emit('onProjectAdded', data);
	});
	
	// A client has added a vote
	socket.on('voteAdded', function(data) {
		Project.findById(data._id, function(err, project) {
			var currentVotes = project.votes;
			project.votes = currentVotes + 1;
			return project.save(function(err) {
				if (!err) {
					console.log("vote added");
					io.sockets.emit('onVoteAdded', data);
				} else {
					console.log(err);
				}				
			}); 
		});
	});
	
	// A client has changed a project name
	socket.on('nameChanged', function(data) {
		Project.findById(data._id, function(err, project) {
			project.name = data.name;
			return project.save(function(err) {
				if (!err) {
					console.log("name changed");
					io.sockets.emit('onNameChanged', data);
				} else {
					console.log(err);
				}				
			}); 
		});
	});	
});

app.listen(3000);
