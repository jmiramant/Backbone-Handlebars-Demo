$(document).ready(function() {
  
  // Fetch data from server -- obviously this can be optimized instead of getting it all at once
  $.get('/api', function(data) {
    
    window.templates = {};
    // Load handlebars templates from server
    loadTemplate('text');
    loadTemplate('poll');
    loadTemplate('image');
    
    // Backbone Model
    var Page = Backbone.Model.extend({
      
      // Renders the current model on the page inside the content holder
      render: function() {
        var p = window.page;
        var type = p.get("type");
        
        // Sketchy check to see if the external template file has loaded. 
        // If not, wait a half second and try again
        if (templates[type] === undefined) {
          $("#content-holder").html("<img src='/images/loading.gif' />")
          setTimeout(window.page.render, 500);
        } else {
          // Template loaded, fill in the template with this model's data
          $("#content-holder").html(templates[type](p.toJSON()));
          renderHelpers(type);
        }
      }
    });

    // Backbone Collection
    var PageCollection = Backbone.Collection.extend({
      model: Page,
      
      // Function simply returns the first page in the collection, called on page load
      getFirst: function() {
        return this.find(function(a){ return a.get("id") === 1; });
      },
      
      getPage: function(id) {
        return this.find(function(a){ return a.get("id") === parseInt(id); });
      }
    });
    
    // Instantiate model/collection
    window.pages = new PageCollection(data);
    window.page = new Page();

    
    var AppRouter = Backbone.Router.extend({
      routes:{
        "":"getFirst",
        ":id":"getPage"
      },
      
      getFirst : function() {
        console.log("hey");
        window.page.set(window.pages.getFirst());
        window.page.render();        
      },

      getPage : function(id) {
        console.log(id);
        window.page.set(window.pages.getPage(id));
        window.page.render();
      }        
    });

    window.router = new AppRouter();
    
    Backbone.history.start({pushState:false});
  });

});

function renderHelpers(pageType) {
  $(".next-link, .back-link").each(function(){
    $(this)
    .attr("href", ("#" + $(this).attr("data-next")))
    .on("click", function(){
      window.router.navigate("/" + $(this).attr("data-next"), true);
      return false;
    });
  });
  
  switch (pageType) {
    case 'poll':
      $(".poll-answer")
      .on("click", function(){
        $(".poll-answer").removeClass("poll-answer-on");
        $(this).addClass("poll-answer-on");
      });
    default:
      break;
  }
}
   
function loadTemplate(name) {
  $.get('templates/' + name + '.handlebars', function(data) {
    window.templates[name] = Handlebars.compile(data);
  });
} 