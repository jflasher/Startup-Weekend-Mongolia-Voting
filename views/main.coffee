html ->
  head ->
    title "SWM Voting"
    link href: "/css/app.css", media: "all", rel: "stylesheet", type: "text/css"
    for file in ['json2', 'jquery-1.7.2.min', 'underscore-1.1.6', 'backbone', 'logger']
      script type: "text/javascript", src: "/js/#{file}.js"
    script src: "/socket.io/socket.io.js"
    script src: "/js/client.js"
    
  
  body -> 
    div id: 'header'
    
    div id: 'swmvoting', ->
      div class: 'title', -> h1 "Projects List"
      div class: 'status', -> h2 "Initializing the Universe!"
      div class: 'content', ->
        div id: 'create-project', ->
          input type: 'text', id: 'new-project', placeholder: "What is your idea?"
        
        div id: 'projects', ->
          ul id: 'project-list'
        
        div id: 'project-stats'     
        
      div id: 'admin-area'
      
    div id: 'credits', ->
      a href: 'http://arssollertia.com', target: '_blank', -> img src: '../images/arsLogo.png'
      p -> '<br/>Based on the ToDo example by <a href="http://jgn.me/" target="_blank">J&eacute;r&ocirc;me Gravel-Niquet</a>'
        
    # templates
  
    script type: "text/template", id: "item-template", '''
      <div class="project">
        <div class="display">
          <div class="project-content"><%= name %></div>
          <span class="project-votes"><%= votes %></span>
          <span class="project-vote-button"></span>
          <span class="project-destroy"></span>
        </div>
        <div class="edit">
          <input class="project-input" type="text" value="<%= name %>" />
        </div>
      </div>    
    '''
          
    script type: "text/template", id: "stats-template", '''
	  <span class="project-count">
	    <span class="number"><%= projects %></span>
	    <span class="word"><%= projects == 1 ? 'project' : 'projects' %></span> submitted<br/>
	    <span class="number"><%= votes %></span>
	    <span class="word"><%= votes == 1 ? 'vote' : 'votes' %> casted</span>
	  </span>    
    '''
    
    script type: "text/template", id: "admin-template", '''
      <div class="admin">
	    Log <%= isAdmin == false ? 'in' : 'out' %> as <span class="requestAdmin">admin</span>.
	    <% if (isAdmin) { %>
	      <br/>Status: <span class="statusClosed">Closed</span> | <span class="statusOpen">Open</span> | <span class="statusVoting">Voting</span>
	    <% } %>
	  </div>
    '''
    
    script type: "text/template", id: "status-template", '''
      <h2><%= text %></h2>
    '''    