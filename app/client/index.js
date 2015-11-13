Engine = famous.core.Engine;
PhysicsEngine = famous.physics.PhysicsEngine;
Wall = famous.physics.constraints.Wall;
Force = famous.physics.forces.Force;
Surface = famous.core.Surface;
Modifier = famous.core.Modifier;
Transform = famous.core.Transform;
Particle = famous.physics.bodies.Particle;
Transitionable = famous.transitions.Transitionable;

var
  mainCtx,
  bird,
  physicsEngine,
  floorWall,
  gravity,
  xVelocity = 0.28,
  gravityForce = [0,0.0027,0],
  birdFlap = [0,-0.92,0],
  initPosition = [213,450],
  phase = 'none';

// Objects
function Bird (){

  var rotation = new Transitionable(0);

  var rotationModifier = new Modifier({
    origin : [0.5,0.5],
    align : [0.5,0.5],
    transform: function(){
      return Transform.rotateZ(rotation.get());
    }
  });

  var gravityID = null;

  var particle = new Particle({
    position: initPosition
  });
  var surf = new Surface({
    properties: {
      backgroundColor: 'yellow'
    }
  });
  var mod = new Modifier({
    opacity: 1,
    size: [100,100],
    transform: function(){
      return particle.getTransform();
    }
  });

  physicsEngine.addBody(particle);
  physicsEngine.attach(floorWall, particle);
  mainCtx.add(mod).add(rotationModifier).add(surf);

  this.flap = function(){
    particle.setVelocity(birdFlap);
  }

  this.start = function(){
    if (gravityID === null){
      gravityID = physicsEngine.attach(gravity, particle);
    }
    particle.setVelocity(birdFlap);
  }

  this.ready = function(){
    particle.setPosition(initPosition);
  }

  this.lose = function(){
    if (gravityID !== null){
      physicsEngine.detach(gravityID);
      gravityID = null;
    }
    particle.setVelocity([0,0,0]);
    rotation.halt();
  }

  this.getPosY = function(){
    return particle.position.y;
  }
}

// Starting point of the app
Meteor.startup(function(){

  mainCtx = Engine.createContext();
  physicsEngine = new PhysicsEngine();
  floorWall = new Wall({normal : [0, -1, 0], distance : 755});
  gravity = new Force(gravityForce);

  Engine.on('keydown', function(e){
    switch (e.which){
      case 49:
        press1();
        break;
      case 50:
        press2();
        break;
      case 51:
        press3();
        break;
      case 52:
        press4();
        break;
      case 32:
        pressSpace();
        break;
    }
  });

  Engine.on('postrender', function(){
    collisionFunction();
  });

  bird = new Bird();

  phase = 'ready';

});

function collisionFunction(){
  if (phase == 'game'){
    if (bird.getPosY() > 755 ){
      phase = 'lost';
      bird.lose();
    }
  }
}

function press1(){
  
}

function press2(){

}

function press3(){

}

function press4(){

}

function pressSpace(){
  switch (phase){
    case 'ready':
      bird.start();
      phase = 'game';
      break;
    case 'game':
      bird.flap();
      break;
    case 'lost':
      bird.ready();
      phase = 'ready';
      break;
  }
}
