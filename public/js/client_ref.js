  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $(function() {
    window.Todo = (function() {
      __extends(Todo, Backbone.Model);
      function Todo() {
        Todo.__super__.constructor.apply(this, arguments);
      }
      Todo.prototype.idAttribute = "_id";
      Todo.prototype.defaults = {
        content: "empty todo...",
        done: false
      };
      Todo.prototype.initialize = function() {
        if (!this.get("content")) {
          return this.set({
            content: this.defaults.content
          });
        }
      };
      Todo.prototype.toggle = function() {
        return this.save({
          done: !this.get("done")
        });
      };
      Todo.prototype.clear = function() {
        this.destroy();
        return this.view.remove();
      };
      return Todo;
    })();
    window.TodoList = (function() {
      __extends(TodoList, Backbone.Collection);
      function TodoList() {
        TodoList.__super__.constructor.apply(this, arguments);
      }
      TodoList.prototype.model = Todo;
      TodoList.prototype.url = '/todos';
      TodoList.prototype.done = function() {
        return this.filter(function(todo) {
          return todo.get('done');
        });
      };
      TodoList.prototype.remaining = function() {
        return this.without.apply(this, this.done());
      };
      TodoList.prototype.nextOrder = function() {
        if (!this.length) {
          return 1;
        }
        return this.last().get('order') + 1;
      };
      TodoList.prototype.comparator = function(todo) {
        return todo.get('order');
      };
      return TodoList;
    })();
    window.Todos = new TodoList;
    window.TodoView = (function() {
      __extends(TodoView, Backbone.View);
      function TodoView() {
        this.render = __bind(this.render, this);
        TodoView.__super__.constructor.apply(this, arguments);
      }
      TodoView.prototype.tagName = "li";
      TodoView.prototype.template = _.template($("#item-template").html());
      TodoView.prototype.events = {
        "click .check": "toggleDone",
        "dblclick div.todo-content": "edit",
        "click span.todo-destroy": "clear",
        "keypress .todo-input": "updateOnEnter"
      };
      TodoView.prototype.initialize = function() {
        this.model.bind('change', this.render);
        return this.model.view = this;
      };
      TodoView.prototype.render = function() {
        $(this.el).html(this.template(this.model.toJSON()));
        this.setContent();
        return this;
      };
      TodoView.prototype.setContent = function() {
        var content;
        content = this.model.get('content');
        this.$('.todo-content').text(content);
        this.input = this.$('.todo-input');
        this.input.bind('blur', this.close);
        return this.input.val(content);
      };
      TodoView.prototype.toggleDone = function() {
        return this.model.toggle();
      };
      TodoView.prototype.edit = function() {
        $(this.el).addClass("editing");
        return this.input.focus();
      };
      TodoView.prototype.close = function() {
        this.model.save({
          content: this.input.val()
        });
        return $(this.el).removeClass("editing");
      };
      TodoView.prototype.updateOnEnter = function(e) {
        if (e.keyCode === 13) {
          return this.close();
        }
      };
      TodoView.prototype.remove = function() {
        return $(this.el).remove();
      };
      TodoView.prototype.clear = function() {
        return this.model.clear();
      };
      return TodoView;
    })();
    window.AppView = (function() {
      __extends(AppView, Backbone.View);
      function AppView() {
        this.addAll = __bind(this.addAll, this);
        this.addOne = __bind(this.addOne, this);
        this.render = __bind(this.render, this);
        AppView.__super__.constructor.apply(this, arguments);
      }
      AppView.prototype.el = $("#todoapp");
      AppView.prototype.statsTemplate = _.template($('#stats-template').html());
      AppView.prototype.events = {
        "keypress #new-todo": "createOnEnter",
        "keyup #new-todo": "showTooltip",
        "click .todo-clear a": "clearCompleted"
      };
      AppView.prototype.initialize = function() {
        this.input = this.$("#new-todo");
        Todos.bind('add', this.addOne);
        Todos.bind('reset', this.addAll);
        Todos.bind('all', this.render);
        return Todos.fetch();
      };
      AppView.prototype.render = function() {
        return this.$('#todo-stats').html(this.statsTemplate({
          total: Todos.length,
          done: Todos.done().length,
          remaining: Todos.remaining().length
        }));
      };
      AppView.prototype.addOne = function(todo) {
        var view;
        view = new TodoView({
          model: todo
        });
        return this.$('#todo-list').append(view.render().el);
      };
      AppView.prototype.addAll = function() {
        return Todos.each(this.addOne);
      };
      AppView.prototype.newAttributes = function() {
        return {
          content: this.input.val(),
          order: Todos.nextOrder(),
          done: false
        };
      };
      AppView.prototype.createOnEnter = function(e) {
        if (e.keyCode !== 13) {
          return null;
        }
        Todos.create(this.newAttributes());
        return this.input.val('');
      };
      AppView.prototype.clearCompleted = function() {
        var todo, _fn, _i, _len, _ref;
        _ref = Todos.done();
        _fn = function(todo) {
          return todo.clear();
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          todo = _ref[_i];
          _fn(todo);
        }
        return false;
      };
      AppView.prototype.showTooltip = function(e) {};
      return AppView;
    })();
    return window.App = new AppView;
  });
