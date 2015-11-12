Engine = famous.core.Engine;

// Starting point of the app
Meteor.startup(function(){

  mainCtx = Engine.createContext();

  Bird.add();
});
