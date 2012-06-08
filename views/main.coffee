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
      div class: 'content', ->
        div id: 'create-project', ->
          input type: 'text', id: 'new-project', placeholder: "What is your idea?"
        
        div id: 'projects', ->
          ul id: 'project-list'
        
        div id: 'project-stats'
        
    ul id: 'instructions', ->
      li "Double-click to edit a project."
          
#    coffeescript -> 
#      window.socket = io.connect() 
#      socket.on 'forceClientUpdate', ->
#        alert 'hi' 
        
    div id: 'button', ->
      input type: 'button', onclick: ->  socket.emit 'clientVoted', {test : '1'}
        
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
	    <span class="word"><%= projects == 1 ? 'project' : 'projects' %></span> submitted.<br/>
	    <span class="number"><%= votes %></span>
	    <span class="word"><%= votes == 1 ? 'vote' : 'votes' %> casted.</span>
	  </span>    
    '''