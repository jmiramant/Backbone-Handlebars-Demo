// Namespace our app, setup a few things
window.App = {
  currentPage: null,
  helpers: {},
  templates: {}
};

(function(App){
  // Backbone Model
  App.Page = Backbone.Model.extend({});

  App.PageView = Backbone.View.extend({
    initialize: function(options) {
      this.template = App.templates[this.model.get('type')];
    },

    // These events get automatically attached to this.el
    events: {
      'click .poll-answer': 'selectAnswer',
      'click .next-link,.back-link': 'navigate'
    },

    selectAnswer: function(e){
      this.$(".poll-answer").removeClass("poll-answer-on");
      this.$(e.target).addClass("poll-answer-on");
    },

    navigate: function(e) {
      var href = "/" + $(e.target).data('next');
      App.router.navigate(href, true);
      e.preventDefault();
    },

    // Renders the current model on the page inside the content holder
    render: function() {
      var html = this.template(this.model.toJSON());
      $(this.el).html(html);
      return this;
    }
  });

  // Backbone Collection
  App.PageCollection = Backbone.Collection.extend({
    model: App.Page,
    url: '/pages'
  });

  App.AppRouter = Backbone.Router.extend({
    routes:{
      "":    "getFirst",
      ":id": "getPage"
    },

    getFirst : function() {
      var page = App.currentPage = App.pages.first();
      this.showPage(page);
    },

    getPage : function(id) {
      var page = App.currentPage = App.pages.get(id);
      this.showPage(page);
    },

    showPage: function(page) {
      var view = new App.PageView({model: page});
      $("#content-holder").html(view.render().el);
    }
  });

  // A bit janky to load this shit up front syncronously. 
  // but for now prevents the Views from having to know about
  // them not being loaded.
  App.helpers.loadTemplate = function loadTemplate(name) {
    $.ajax({
      url: 'templates/' + name + '.handlebars',
      async: false,
      success: function(tmplStr) {
        App.templates[name] = Handlebars.compile(tmplStr);
      }
    });
  }



  App.start = function(){
    //Synchronous calls for the templates...
    App.helpers.loadTemplate('text');
    App.helpers.loadTemplate('poll');
    App.helpers.loadTemplate('image');

    // Instantiate the pages collection
    App.pages = new App.PageCollection;
    App.router = new App.AppRouter();

    //Fetch the data from the server
    App.pages.fetch({
      success: function(){
        Backbone.history.start({pushState: true});
      }
    });
  }

})(App);

$(document).ready(function() {
  App.start();
});
