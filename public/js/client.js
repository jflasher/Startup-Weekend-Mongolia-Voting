$(function(){

var Project = Backbone.Model.extend({
	idAttribute: "_id",
	defaults: function() {
		return {
			name: 'New project',
			votes: 0,
			order: Projects.nextOrder()
		};
	},
	
	initialize: function() {
		if (!this.get("name")) {
			this.set({"name": this.defaults.name});
		}
	}
});

var ProjectsList = Backbone.Collection.extend({
	model: Project,
	url: '/projects',
	
	nextOrder: function() {
		if (!this.length) return 1;
		return this.last().get('order') + 1;
	},
	
	comparator: function(project) {
    	return project.get('order');
    },
    
    totalVotes: function() {
    	var votes = 0;
    	this.each(function(project) {
    		votes += project.get('votes');
    	});
    	return votes;
    }
});

var Projects = new ProjectsList;

var ProjectView = Backbone.View.extend({
	tagName: 'li',
	template: _.template($('#item-template').html()),
		
	events: {
		"dblclick div.project-content" 	: "edit",
		"keypress .project-input"      	: "updateOnEnter",
		"click span.project-destroy"   	: "clear",
		"blur .project-input"          	: "close",
		"click span.project-vote-button": "vote"
	},
	
	initialize: function() {
		_.bindAll(this, 'render', 'close');
		this.model.bind('change', this.render);
		this.model.bind('destroy', this.remove);
	},
	
	render: function() {
      	$(this.el).html(this.template(this.model.toJSON()));
      	this.input = this.$('.project-input');
      	return this;
    },
    
    close: function() {
    	if (this.model.get('name') != this.input.val()) {
    		this.model.set({name: this.input.val(), silent: true});
    		socket.emit('nameChanged', this.model);
	    } 	
      	$(this.el).removeClass("editing");
    },
	
	edit: function() {
		if (isAdmin == true) {
			$(this.el).addClass("editing");
			this.input.focus();
		} else {
			alert('This is an admin only function!');
		}
	},
	
	updateOnEnter: function(e) {
    	if (e.keyCode == 13) this.close();
    },
    
    clear: function() {
    	if (isAdmin == true) {
	    	socket.emit('projectDeleted', this.model);
	    } else {
		    alert('This is an admin only function!');
	    }
    },
    
    remove: function() {
    	$(this.el).remove();
    },
    
    vote: function() {    	
		// Send notice to server
		socket.emit('voteAdded', this.model);  	
    }
});

var AppView = Backbone.View.extend({
	el: $("#swmvoting"),
	statsTemplate: _.template($('#stats-template').html()),
	adminTemplate: _.template($('#admin-template').html()),
	
	events: {
		"keypress #new-project"		:	"createOnEnter",
		"click span.requestAdmin"	: 	"requestAdmin"
	},
	
	initialize: function() {
		_.bindAll(this, 'addOne', 'addAll', 'render', 'updateAdminLabel', 'requestAdmin');
		
		isAdmin = false;
		
		this.input = this.$("#new-project");
		
		// Set initial admin label state
		this.updateAdminLabel();
		
 		Projects.bind('add', this.addOne, this);
      	Projects.bind('reset', this.addAll, this);
      	Projects.bind('all', this.render, this);
		
		// Fetch initial projects list
		Projects.fetch();
		
		// Socket.io methods
		socket = io.connect();
		socket.on('forceClientUpdate', function(data) {
			logEvent('forceClientUpdate', data);
		});
		
		// New project added
		socket.on('onProjectAdded', function(data) {
			logEvent('onProjectAdded', data);
			Projects.fetch();
		});
		
		socket.on('onVoteAdded', function(data) {
			logEvent('onVoteAdded', data);
			Projects.get(data._id).fetch();
		});
		
		socket.on('onNameChanged', function(data) {
			logEvent('onNameChanged', data);
			Projects.get(data._id).fetch();
		});
		
		socket.on('onProjectDeleted', function(data) {
			logEvent('onProjectDeleted', data);
			Projects.fetch();
		});
		
		socket.on('onRequestAdmin', function(success) {
			logEvent('onRequestAdmin', success);
			//alert(isAdmin);
			isAdmin = success;
			//alert(isAdmin);
			// This probably should not call directly to App
			App.updateAdminLabel();
			if (success) {
				alert('You\'re now an admin!');
			}
		});		
	},
	
	render: function() {
      	this.$("#project-stats").html(this.statsTemplate({projects: Projects.length, votes: Projects.totalVotes()}));
    },
    
    updateAdminLabel: function() {
	    this.$("#admin-area").html(this.adminTemplate({isAdmin: isAdmin}));
    },
    
    addOne: function(project) {
    	var view = new ProjectView({model: project});
      	this.$("#project-list").append(view.render().el);
    },
    
    addAll: function() {
    	// Empty the list and then rebuild it
    	this.$("#project-list").empty();
    	Projects.each(this.addOne);
    },
		
	createOnEnter: function(e) {
		if (e.keyCode != 13) return;
		if (this.input.val() == '') return;
		
		// Create new project
		var project = new Project({name: this.input.val(), votes: 0});
		
		// Send notice to server
		socket.emit('projectAdded', project);
		
		// Clear input field
		this.input.val('');
	},
    
    requestAdmin: function() {
    	// Log in or out of being an admin
    	if (isAdmin) {
	    	isAdmin = false;
	    	this.updateAdminLabel();
	    	alert('You\'re no longer an admin!');
    	} else {
		    var pw = prompt("Please enter password","");
		    if (pw) {
				socket.emit('requestAdmin', pw);
			}
		}
    }
});

var App = new AppView;

});