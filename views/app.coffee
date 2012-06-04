html ->
  head ->
    title "ToDoNe"
    link href: "/stylesheets/app.css", media: "all", rel: "stylesheet", type: "text/css"
    for file in ['json2', 'jquery-1.5', 'underscore-1.1.6', 'backbone']
      script type: "text/javascript", src: "/javascripts/#{file}.js"
    script src: "/javascripts/client.js"
    script src: "/socket.io/socket.io.js"
  
  body -> 
    div id: 'todoapp', ->
      div class: 'title', -> h1 "Projects List"
      div class: 'content', ->
        div id: 'create-todo', ->
          input type: 'text', id: 'new-todo', placeholder: "What is your idea?"
        
        div id: 'todos', ->
          ul id: 'todo-list'
        
        div id: 'todo-stats'
        
    ul id: 'instructions', ->
      li "Double-click to edit a todo."
    
    div id: 'credits', ->
      a href: "http://jgn.me/", -> "Created by J&eacute;r&ocirc;me Gravel-Niquet"
          
    coffeescript -> 
      window.socket = io.connect() 
      socket.on 'forceClientUpdate', ->
        alert 'Hey!' 
        
    div id: 'button', ->
      input type: 'button', onclick: ->  socket.emit 'clientVoted', {test : '1'}
        
    # templates
  
    script type: "text/template", id: "item-template", '''
      <div class="todo <%= done ? 'done' : '' %>">
        <div class="display">
          <input class="check" type="checkbox" <%= done ? 'checked="checked"' : '' %> />
          <div class="todo-content"></div>
          <span class="todo-destroy"></span>
        </div>
        <div class="edit">
          <input class="todo-input" type="text" value="" />
        </div>
      </div>    
    '''
          
    script type: "text/template", id: "stats-template", '''
      <% if (total) { %>
        <span class="todo-count">
          <span class="number"><%= remaining %></span>
          <span class="word"><%= remaining == 1 ? 'idea' : 'ideas' %></span> submitted.<br/>
          <span class="number">30</span>
          <span class="word"> people voted.</span>
        </span>
      <% } %>
      <% if (done) { %>
        <span class="todo-clear">
          <a href="#">
            Clear <span class="number-done"><%= done %></span>
            completed <span class="word-done"><%= done == 1 ? 'item' : 'items' %></span>
          </a>
        </span>
      <% } %>      
    '''