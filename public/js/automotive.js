// An example Backbone application contributed by
// [JÃ©rÃ´me Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Make Model
  // ----------

  // **Make** model has MakeId, MakeName, and Models collection.
  window.Make = Backbone.Model.extend({
    idAttribute: "_id",

    defaults: function() {
      return {
        MakeId: "0",
        MakeName: "Automobile"
      };
    }

  });

  // Makes collection
  window.MakeList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Make,

    // Save all of the make items under the `"makes"` namespace.
    // localStorage: new Store("automotive"),
    url: '/api/makes'

    // 
  });

  // Create our global collection of **Makes**.
  window.Makes = new MakeList;

  // Make Item View
  // --------------

  // The DOM element for a make item...
  window.MakeView = Backbone.View.extend({
    tagName: "li",
    template: _.template($('#item-template').html()),
    // The DOM events specific to an item.
    events: {
      "dblclick div.make-text"    : "edit",
      "click span.make-destroy"   : "clear",
      "keypress .make-input"      : "updateOnEnter"
    },

    // The TodoView listens for changes to its model, re-rendering.
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    // Re-render the contents of the make item.
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.setText();
      return this;
    },

    // To avoid XSS (not that it would be harmful in this particular app),
    // we use `jQuery.text` to set the contents of the make item.
    setText: function() {
      var text = this.model.get('text');
      this.$('.make-text').text(text);
      this.input = this.$('.make-input');
      this.input.bind('blur', _.bind(this.close, this)).val(text);
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      $(this.el).addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the make.
    close: function() {
      this.model.save({text: this.input.val()});
      $(this.el).removeClass("editing");
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove this view from the DOM.
    remove: function() {
      $(this.el).remove();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }
  });


  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  window.AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#automotive"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-make":  "createOnEnter",
      "click .make-clear a": "clearCompleted"
    },

    // At initialization we bind to the relevant events on the `Makes`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting makes that might be saved in *localStorage*.
    initialize: function() {
      this.input    = this.$("#new-make");

      Makes.bind('add',   this.addOne, this);
      Makes.bind('reset', this.addAll, this);
      Makes.bind('all',   this.render, this);

      Makes.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      this.$('#make-stats').html(this.statsTemplate({
        total:      Makes.length
      }));
    },

    // Add a single make item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(make) {
      var view = new MakeView({model: make});
      this.$("#make-list").append(view.render().el);
    },

    // Add all items in the **Makes** collection at once.
    addAll: function() {
      Makes.each(this.addOne);
    },

    // If you hit return in the main input field, and there is text to save,
    // create new **Make** model persisting it to *localStorage*.
    createOnEnter: function(e) {
      var text = this.input.val();
      if (!text || e.keyCode != 13) return;
      Makes.create({MakeName: text});
      this.input.val('');
    },

    // Clear all done make items, destroying their models.
    clearCompleted: function() {
      _.each(Makes.done(), function(make){ make.destroy(); });
      return false;
    },

  });

  // Finally, we kick things off by creating the **App**.
  window.App = new AppView;

});