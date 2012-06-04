$ ->
  class window.Todo extends Backbone.Model
    idAttribute: "_id"
    
    defaults:
      content: "empty todo..."
      done: false
    
    initialize: ->
      unless @get "content"
        @set content: @defaults.content
      
    toggle: ->
      @save done: !@get("done")
  
    clear: ->
      @destroy()
      @view.remove()

  class window.TodoList extends Backbone.Collection
    model: Todo
    url: '/todos'
    
    done: ->
      @filter (todo) ->
        todo.get('done')
  
    remaining: ->
      @without.apply(@, @done())
  
    nextOrder: ->
      return 1 unless @length
      @last().get('order') + 1
    
    comparator: (todo) ->
      todo.get('order')
  
  window.Todos = new TodoList

  class window.TodoView extends Backbone.View
    tagName: "li"
  
    template: _.template($("#item-template").html())
  
    events:
      "click .check":               "toggleDone"
      "dblclick div.todo-content":  "edit"
      "click span.todo-destroy":    "clear"
      "keypress .todo-input":       "updateOnEnter"
  
    initialize: ->
      @model.bind 'change', @render
      @model.view = @
  
    render: =>
      $(@el).html(@template(@model.toJSON()))
      @setContent()
      @
    
    setContent: ->
      content = @model.get 'content'
      @$('.todo-content').text(content)
      @input = @$('.todo-input')
      @input.bind 'blur', @close
      @input.val(content)
    
    toggleDone: ->
      @model.toggle()
    
    edit: ->
      $(@el).addClass "editing"
      @input.focus()
    
    close: ->
      @model.save content: @input.val()
      $(@el).removeClass "editing"
  
    updateOnEnter: (e) ->
      @close() if e.keyCode is 13
  
    remove: ->
      $(@el).remove()
  
    clear: ->
      @model.clear()

  class window.AppView extends Backbone.View
    el: $("#todoapp")
  
    statsTemplate: _.template($('#stats-template').html())
  
    events:
      "keypress #new-todo":  "createOnEnter"
      "keyup #new-todo":     "showTooltip"
      "click .todo-clear a": "clearCompleted"
  
    initialize: ->
      @input = @$("#new-todo")
      Todos.bind 'add', @addOne
      Todos.bind 'reset', @addAll
      Todos.bind 'all', @render
    
      Todos.fetch()
  
    render: =>
      @$('#todo-stats').html @statsTemplate(
        total: Todos.length
        done: Todos.done().length
        remaining: Todos.remaining().length
      )
    
    addOne: (todo) =>
      view = new TodoView model: todo
      @$('#todo-list').append view.render().el
    
    addAll: =>
      Todos.each @addOne
    
    newAttributes: ->
      content: @input.val()
      order: Todos.nextOrder()
      done: false
    
    createOnEnter: (e) ->
      return null if e.keyCode != 13
      Todos.create @newAttributes()
      @input.val ''
    
    clearCompleted: ->
      for todo in Todos.done()
        do (todo) ->
          todo.clear()
      false
    
    showTooltip: (e) ->
      # TODO

  window.App = new AppView