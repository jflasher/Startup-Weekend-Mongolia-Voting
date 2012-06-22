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
    	// Make sure we're in the voting state
    	if (serverStatus != 'voting') {
	    	return;
    	}
    	
		// Send notice to server
		socket.emit('voteAdded', this.model);  	
    }
});

var AppView = Backbone.View.extend({
	el: $("#swmvoting"),
	statsTemplate: _.template($('#stats-template').html()),
	adminTemplate: _.template($('#admin-template').html()),
	statusTemplate: _.template($('#status-template').html()),
	
	events: {
		"keypress #new-project"		:	"createOnEnter",
		"click span.requestAdmin"	: 	"requestAdmin",
		"click span.statusClosed"	:	"setStatusClosed",
		"click span.statusOpen"		:	"setStatusOpen",
		"click span.statusVoting"	:	"setStatusVoting"				
	},
	
	initialize: function() {
		_.bindAll(this, 'addOne', 'addAll', 'render', 'updateAdminLabel', 'requestAdmin', 'setStatusLabel', 'setStatusClosed', 'setStatusOpen', 'setStatusVoting', 'disableAddNewProject');
		
		// We start off not in the admin state
		isAdmin = false;
		
		// We start off in the closed state
		serverStatus = 'closed';
		
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
		
		socket.on('onRequestServerStatus', function(status) {
			logEvent('onRequestServerStatus', status);
			serverStatus = status;
			App.setStatusLabel();
			App.disableAddNewProject(serverStatus != 'open');
		});
		
		socket.on('onServerStatusChanged', function(status) {
			logEvent('onServerStatusChanged', status);
			serverStatus = status;
			App.setStatusLabel();
			// If we're going to open, make sure the text field is editable or disabled if not
			App.disableAddNewProject(serverStatus != 'open');
		});
		
		// Request the current server status
		socket.emit('requestServerStatus');
	},
	
	render: function() {
      	this.$("#project-stats").html(this.statsTemplate({projects: Projects.length, votes: Projects.totalVotes()}));
    },
    
    updateAdminLabel: function() {
	    this.$("#admin-area").html(this.adminTemplate({isAdmin: isAdmin}));
	    this.updateAdminStates();
    },
    
    updateAdminStates: function() {
	    if (serverStatus == 'open') {
			this.$(".statusClosed").removeClass("active");
			this.$(".statusOpen").addClass("active");
			this.$(".statusVoting").removeClass("active");
		} else if (serverStatus == 'closed') {
			this.$(".statusClosed").addClass("active");
			this.$(".statusOpen").removeClass("active");
			this.$(".statusVoting").removeClass("active");
		} else if (serverStatus == 'voting') {
			this.$(".statusClosed").removeClass("active");
			this.$(".statusOpen").removeClass("active");
			this.$(".statusVoting").addClass("active");
		}
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
		if (serverStatus != 'open') return;
		if (e.keyCode != 13) return;
		if (this.input.val() == '') return;
		
		// Create new project
		var project = new Project({name: this.input.val(), votes: 0});
		
		// Send notice to server
		socket.emit('projectAdded', project);
		
		// Clear input field
		this.input.val('');
	},
	
	setStatusLabel: function() {
		if (serverStatus == 'open') {
			this.$(".status").html(this.statusTemplate({text: 'Submissions Open - Add projects, voting will start soon!'}));
			this.updateAdminStates();
		} else if (serverStatus == 'closed') {
			this.$(".status").html(this.statusTemplate({text: 'Submissions Closed - Hold your horses!'}));
			this.updateAdminStates();
		} else if (serverStatus == 'voting') {
			this.$(".status").html(this.statusTemplate({text: 'Vote, vote, vote!'}));
			this.updateAdminStates();
		} else {
			this.$(".status").html(this.statusTemplate({text: 'Something has gone very wrong...'}));
		}
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
    },
    
    setServerStatus: function(status) {
	    socket.emit('changeServerStatus', status);
    },
    
    setStatusClosed: function() {
	    this.setServerStatus('closed');
    },
    
    setStatusOpen: function() {
	    this.setServerStatus('open');
    },
    
    setStatusVoting: function() {
	    this.setServerStatus('voting');
    }, 
    
    disableAddNewProject: function(tf) {
	    this.$("#new-project").attr("disabled", tf);
    }
});

var App = new AppView;

});