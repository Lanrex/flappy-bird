"use strict";

var mainCtx, bird1;

var Engine, Surface, Modifier, Transform;

class Bird{
  constructor(){
    this.Surf = new Surface({
      properties : {
        backgroundColor : 'blue'
      }
    });

    this.Mod = new Modifier({
      size : [100,100],
      opacity : 0,
      transform : function(){
        return Transform.translate(50,50);
      }
    });

    mainCtx.add(this.Mod).add(this.Surf);
  }

  show(){
    this.Mod.setOpacity(1);
  }

  hide(){
    this.Mod.setOpacity(0);
  }
}

Meteor.startup(function(){
  console.log('startup');
  init();
});

function init(){
  console.log('init');
  famous.core.famous;
  Engine = famous.core.Engine;
  Surface = famous.core.Surface;
  Modifier = famous.core.Modifier;
  Transform = famous.core.Transform;

  run();
}

function run(){
  console.log('run');
  mainCtx = Engine.createContext();

  bird1 = new Bird();
  bird1.show();
}
