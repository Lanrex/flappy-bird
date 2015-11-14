

///////////////////////
// V A R I A B L E S //
///////////////////////

var
  // Generals
  mainCtx,
  playing = false,
  myIndex,
  maxPlayers,
  timerFunction,
  uInterface,
  score,
  msg,
  colSets = 2,

  // Surfaces i modifiers
  gameView,
  gameViewModifier,
  interphase,
  clickSurface,
  clickSurfaceModifier,
  backgroundSurface,
  backgroundRightSurface,
  backgroundLeftSurface,
  backgroundRightSurfaceModifier,
  backgroundLeftSurfaceModifier,
  floorSurface,
  floorSurfaceModifier,
  multiStatsSurf,
  soloStatsSurf,
  multiStatsMod,
  soloStatsMod,

  // Simulacio i joc
  physicsEngine,
  cameraParticle,
  gravity,
  xVelocity = 0.28,
  gravityForce = [0,0.0027,0],
  birdFlap = [0 ,-0.92,0],
  myBird,
  bird = [],
  colTop = [],
  colBot = [],
  level = [],
  floorWall,
  launchRate = 2100,
  nextCol,
  mode;

/////////////////////
// O B J E C T E S //
/////////////////////

function Column(type){
  // Public

  // Private
  var imgUrl, originMod;
  switch (type){
    case 'top':
      imgUrl = 'img/pipe_up.png';
      originMod = [0,1];
      break;
    case 'bot':
      imgUrl = 'img/pipe.png';
      originMod = [0,0];
      break;
  }

  var Part = new Particle({
    position: [640,450,0]
  });

  var Surf = new ImageSurface({
    content: imgUrl,
    properties:{
      zIndex: 3
    }
  });

  var Mod = new Modifier({
    size: [113,500],
    origin: originMod,
    transform: function(){return Part.getTransform();}
  });

  physicsEngine.addBody(Part);
  gameView.add(Mod).add(Surf);

  // Functions
  this.reset = function (height){
    Part.setVelocity([0,0,0])
    Part.setPosition([640,height,0]);
  }
  this.launch = function (){
    Part.setVelocity([-xVelocity,0,0]);
  }
  this.stop = function (){
    Part.setVelocity([0,0,0]);
  }

  this.getModifierPosition = function (){
    return [Mod.getTransform()[12],Mod.getTransform()[13],Mod.getTransform()[14]];
  }
}

function Bird(){

  // Variables

  // Variable Rotation i el seu Modifier
  var rotation = new Transitionable(0);

  var birdRotationModifier = new Modifier({
    origin: [0.5,0.5],
    align: [0.5,0.5],
    transform: function(){
      return Transform.rotateZ(rotation.get());
    }
  });

  // Estat del Bird
  var phase = 'none';

  // Variable per associar i desassociar la gravetat
  var gravityID = null;

  // Partícula del motor de físiques
  var Part = new Particle({
    position: [213.33,450,5]
  });

  // Imatge del Bird amb la informació previament assignada
  var Surf = new ImageSurface({
    content: 'img/birdie_1.png',
    properties:{
      zIndex: 6
    }
  });

  // Modifier del Bird
  var Mod = new Modifier({
    opacity: 0,
    size: [76,57],
    origin: [0.5,1],
    transform: function(){
      return Part.getTransform();
    }
  });

  // Inicialització.
  // S'afegeix la partícula al motor de físiques
  physicsEngine.addBody(Part);
  // S'afegeix el terra al Bird
  physicsEngine.attach(floorWall,Part);
  // S'afegeix la imatge al món
  gameView.add(Mod).add(birdRotationModifier).add(Surf);

  // Funcions
  // Flap
  this.flap = function(){
    Mod.setOpacity(1);
    if (gravityID === null){
      gravityID = physicsEngine.attach(gravity,Part);
    }
    Part.setVelocity(birdFlap);
    rotation.set(-Math.PI/4);
    rotation.set(Math.PI/5, {duration : 500, curve: Easing.inQuart});
  };

  // changeName
  this.changeName = function (f_name){
    Name.setContent(f_name);
  }

  // Hide
  this.hide = function(){
    Mod.setOpacity(0);
    phase = 'none';
  }

  // Start
  this.start = function(){
    Mod.setOpacity(1);
    if (gravityID === null){
      gravityID = physicsEngine.attach(gravity,Part);
    }
    Part.setVelocity(birdFlap);
    rotation.set(-Math.PI/4);
    rotation.set(Math.PI/5, {duration : 500, curve: Easing.inQuart});
    phase = 'game';
  };

  // Lose
  this.lose = function(){
    Mod.setOpacity(1);
    if (gravityID !== null){
      physicsEngine.detach(gravityID);
      gravityID = null;
    }
    Part.setVelocity([0,0,0]);
    rotation.halt();
    phase = 'interphase';
  };

  this.interPhase = function(){
    phase = 'lost';
  }

  // Ready
  this.ready = function(){
    Mod.setOpacity(1);
    if (gravityID !== null){
      physicsEngine.detach(gravityID);
      gravityID = null;
    }
    Part.setPosition([213.33,450,5]);
    rotation.set(0);
    phase = 'ready';
  };

// setPosition
  this.setPosition = function(pos){
    Part.setPosition(pos);
  };

  // getPosition
  this.getPosition = function(){
    return [Part.getTransform()[12],Part.getTransform()[13],Part.getTransform()[14]];
  }

  // getModifierPosition
  this.getModifierPosition = function (){
    return [Mod.getTransform()[12],Mod.getTransform()[13],Mod.getTransform()[14]];
  }

  // getPosY
  this.getPosY = function (){
    return Part.position.y;
  }

  // getPhase
  this.getPhase = function(){
    return phase;
  };
}

function Score(){

  var count = -1;

  var Surf = [];
  var Mod = [];

  Surf[0] = new ImageSurface({
    content : 'img/numbers/zero.png',
    properties: {
      zIndex: 10
    }
  });
  Surf[1] = new ImageSurface({
    content : 'img/numbers/zero.png',
    properties: {
      zIndex: 10
    }
  });
  Surf[2] = new ImageSurface({
    content : 'img/numbers/zero.png',
    properties: {
      zIndex: 10
    }
  });

  Mod[0] = new StateModifier({
    opcacity: 0,
    size: [42,60],
    origin : [0.5,0.5],
    transform: Transform.translate(320,50,100)
  });
  Mod[1] = new StateModifier({
    opacity: 0,
    size: [42,60],
    origin: [0.5,0.5],
    transform: Transform.translate(341,50,100)
  });
  Mod[2] = new StateModifier({
    opacity: 0,
    size: [42,60],
    origin: [0.5,0.5],
    transform: Transform.translate(362,50,100)
  });

  gameView.add(Mod[0]).add(Surf[0]);
  gameView.add(Mod[1]).add(Surf[1]);
  gameView.add(Mod[2]).add(Surf[2]);

  // Funcions
  this.getScore = function(){
    return count;
  }

  this.reset = function(){
    count = -1;
    Mod[0].setTransform(Transform.translate(320,50,100));
    Mod[0].setOpacity(0);
    Mod[1].setOpacity(0);
    Mod[2].setOpacity(0);
  }

  this.increment = function(){

    count++;

    if (count == 1){
      Mod[0].setTransform(Transform.translate(320,50,100));
      Mod[0].setOpacity(1);
    }

    if ( count == 10 ){
      // Shows scoreSurface[1] i pos
      Mod[0].setTransform(Transform.translate(299,50,100));
      Mod[1].setTransform(Transform.translate(341,50,100));
      Mod[1].setOpacity(1);
    }

    if ( count == 100 ){
      // Show scoreSurface[2] i pos
      Mod[0].setTransform(Transform.translate(278,50,100));
      Mod[1].setTransform(Transform.translate(320,50,100));
      Mod[2].setOpacity(1);
    }

    var str = count.toString();
    for (var i = 0; i < str.length; i++ ){
      //console.log('str[' + i + ']=' + str[i]);
      switch (str[i]){
        case '0':
          Surf[i].setContent('img/numbers/zero.png');
          break;
        case '1':
          Surf[i].setContent('img/numbers/one.png');
          break;
        case '2':
          Surf[i].setContent('img/numbers/two.png');
          break;
        case '3':
          Surf[i].setContent('img/numbers/three.png');
          break;
        case '4':
          Surf[i].setContent('img/numbers/four.png');
          break;
        case '5':
          Surf[i].setContent('img/numbers/five.png');
          break;
        case '6':
          Surf[i].setContent('img/numbers/six.png');
          break;
        case '7':
          Surf[i].setContent('img/numbers/seven.png');
          break;
        case '8':
          Surf[i].setContent('img/numbers/eight.png');
          break;
        case '9':
          Surf[i].setContent('img/numbers/nine.png');
          break;
      }
    }
  }
}

function Msg(){
  var Surf = new ImageSurface({
    content: 'img/msg1.png',
    properties: {
      zIndex: 40
    }
  });
  var Mod = new StateModifier({
    origin: [0.5,0.5],
    size: [190*2,42*2],
    transform: Transform.translate(320,-100,40)
  });


  var taptapSurf = new ImageSurface({
    content: 'img/taptap.png',
    properties: {
      zIndex: 30
    }
  });

  var taptapMod = new StateModifier({
    opacity: 0,
    size: [115*2,98*2],
    origin: [0.5,0.5],
    transform: Transform.translate(320,250,30)
  });

  gameView.add(Mod).add(Surf);
  gameView.add(taptapMod).add(taptapSurf);

  this.showTaptap = function(){
    taptapMod.setOpacity(1);
  }
  this.hideTaptap = function(){
    taptapMod.setOpacity(0);
  }

  this.show = function(){
    Mod.halt();
    Mod.setTransform(Transform.translate(320,150,40),{curve: Easing.outElastic, duration: 1000});
  }
  this.hide = function(){
    Mod.halt();
    Mod.setTransform(Transform.translate(320,-50,40),{curve: 'easeOut', duration: 1000});
  }
  this.setFlappyBird = function(){
    Surf.setContent('img/msg1.png');
    Mod.setSize([190*2,42*2]);
  }
  this.setReady = function(){
    Surf.setContent('img/msg3.png');
    Mod.setSize([171*2,42*2]);
  }
  this.setGameOver = function(){
    Surf.setContent('img/msg2.png');
    Mod.setSize([186*2,42*2]);
  }
}

function interphaseObj(){

  // SURF

  var Surf = new ImageSurface({
    content: 'img/score.png',
    properties: {
      zIndex: 40
    }
  });

  var Mod = new StateModifier({
    opacity: 0,
    origin: [0.5,0.5],
    size: [226*2,116*2],
    transform: Transform.translate(320,370,40)
  });

  // MEDAL

  var Medal = new ImageSurface({
    content: 'img/bronze.png',
    properties: {
      zIndex: 50
    }
  });

  var medalRotation = new Transitionable(0);

  var medalRotationModifier = new Modifier({
    origin: [0.5,0.5],
    align: [0.5,0.5],
    transform: function(){
      return Transform.scale(medalRotation.get(),1);
    }
  });

  var MedalMod = new StateModifier({
    opacity: 0,
    origin: [0,0],
    size: [88,88],
    transform: Transform.translate(146, 340, 50)
  });

  // SCORE

  var score = [];
  var scoreMod = [];

  score[0] = new ImageSurface({
    content : 'img/numbers/szero.png',
    properties: {
      zIndex: 50
    }
  });
  scoreMod[0] = new StateModifier({
    opacity: 0,
    size: [24,28],
    origin: [0,0],
    transform: Transform.translate(480,326,50)
  });
  score[1] = new ImageSurface({
    content : 'img/numbers/szero.png',
    properties: {
      zIndex: 50
    }
  });
  scoreMod[1] = new StateModifier({
    opacity: 0,
    size: [24,28],
    origin: [0,0],
    transform: Transform.translate(480-26,326,50)
  });
  score[2] = new ImageSurface({
    content : 'img/numbers/szero.png',
    properties: {
      zIndex: 50
    }
  });
  scoreMod[2] = new StateModifier({
    opacity: 0,
    size: [24,28],
    origin: [0,0],
    transform: Transform.translate(480-52,326,50)
  });

  // BEST
  var best = [];
  var bestMod = [];

  best[0] = new ImageSurface({
    content : 'img/numbers/szero.png',
    properties: {
      zIndex: 50
    }
  });
  bestMod[0] = new StateModifier({
    opacity: 0,
    size: [24,28],
    origin: [0,0],
    transform: Transform.translate(480,408,50)
  });
  best[1] = new ImageSurface({
    content : 'img/numbers/szero.png',
    properties: {
      zIndex: 50
    }
  });
  bestMod[1] = new StateModifier({
    opacity: 0,
    size: [24,28],
    origin: [0,0],
    transform: Transform.translate(480-26,408,50)
  });
  best[2] = new ImageSurface({
    content : 'img/numbers/szero.png',
    properties: {
      zIndex: 50
    }
  });
  bestMod[2] = new StateModifier({
    opacity: 0,
    size: [24,28],
    origin: [0,0],
    transform: Transform.translate(480-52,408,50)
  });

  // ADD

  gameView.add(MedalMod).add(medalRotationModifier).add(Medal);
  gameView.add(Mod).add(Surf);
  gameView.add(scoreMod[0]).add(score[0]);
  gameView.add(scoreMod[1]).add(score[1]);
  gameView.add(scoreMod[2]).add(score[2]);
  gameView.add(bestMod[0]).add(best[0]);
  gameView.add(bestMod[1]).add(best[1]);
  gameView.add(bestMod[2]).add(best[2]);

  this.show = function(scoreNumber,bestNumber){

    // SCORE
    score[0].setContent('img/numbers/szero.png');
    score[1].setContent('img/numbers/szero.png');
    score[2].setContent('img/numbers/szero.png');
    var str1 = scoreNumber.toString();
    for (var i = 0; i < str1.length; i++ ){
      //console.log('str[' + i + ']=' + str1[i]);
      switch (str1[i]){
        case '0':
          score[str1.length-i-1].setContent('img/numbers/szero.png');
          break;
        case '1':
          score[str1.length-i-1].setContent('img/numbers/sone.png');
          break;
        case '2':
          score[str1.length-i-1].setContent('img/numbers/stwo.png');
          break;
        case '3':
          score[str1.length-i-1].setContent('img/numbers/sthree.png');
          break;
        case '4':
          score[str1.length-i-1].setContent('img/numbers/sfour.png');
          break;
        case '5':
          score[str1.length-i-1].setContent('img/numbers/sfive.png');
          break;
        case '6':
          score[str1.length-i-1].setContent('img/numbers/ssix.png');
          break;
        case '7':
          score[str1.length-i-1].setContent('img/numbers/sseven.png');
          break;
        case '8':
          score[str1.length-i-1].setContent('img/numbers/seight.png');
          break;
        case '9':
          score[str1.length-i-1].setContent('img/numbers/snine.png');
          break;
      }
    }

    // BEST
    best[0].setContent('img/numbers/szero.png');
    best[1].setContent('img/numbers/szero.png');
    best[2].setContent('img/numbers/szero.png');
    var str2 = bestNumber.toString();
    for (var j = 0; j < str2.length; j++ ){
      //console.log('str[' + j + ']=' + str2[j]);
      switch (str2[j]){
        case '0':
          best[str2.length-j-1].setContent('img/numbers/szero.png');
          break;
        case '1':
          best[str2.length-j-1].setContent('img/numbers/sone.png');
          break;
        case '2':
          best[str2.length-j-1].setContent('img/numbers/stwo.png');
          break;
        case '3':
          best[str2.length-j-1].setContent('img/numbers/sthree.png');
          break;
        case '4':
          best[str2.length-j-1].setContent('img/numbers/sfour.png');
          break;
        case '5':
          best[str2.length-j-1].setContent('img/numbers/sfive.png');
          break;
        case '6':
          best[str2.length-j-1].setContent('img/numbers/ssix.png');
          break;
        case '7':
          best[str2.length-j-1].setContent('img/numbers/sseven.png');
          break;
        case '8':
          best[str2.length-j-1].setContent('img/numbers/seight.png');
          break;
        case '9':
          best[str2.length-j-1].setContent('img/numbers/snine.png');
          break;
      }
    }


    // MEDAL
    var bool1 = true;
    Medal.setContent('img/platinum.png');
    if (scoreNumber < 50){
      Medal.setContent('img/gold.png');
    }
    if (scoreNumber < 25){
      Medal.setContent('img/silver.png');
    }
    if (scoreNumber < 10){
      Medal.setContent('img/bronze.png');
    }
    if (scoreNumber < 3){
      bool1 = false;
    }

    // SHOW
    Timer.setTimeout(function(){
      Mod.setOpacity(1, {duration : 1000});
      scoreMod[0].setOpacity(1, {duration : 1000});
      scoreMod[1].setOpacity(1, {duration : 1000});
      scoreMod[2].setOpacity(1, {duration : 1000});
      bestMod[0].setOpacity(1, {duration : 1000});
      bestMod[1].setOpacity(1, {duration : 1000});
      bestMod[2].setOpacity(1, {duration : 1000});
      if (bool1){
        MedalMod.setOpacity(1, {duration : 1000});
        medalRotation.set(-1);
        medalRotation.set(0, {duration : 300, curve : Easing.inSine});
        medalRotation.set(1, {duration : 300, curve : Easing.outSine});
        medalRotation.set(0, {duration : 300, curve : Easing.inSine});
        medalRotation.set(-1, {duration : 300, curve : Easing.outSine});
        medalRotation.set(0, {duration : 300, curve : Easing.inSine});
        medalRotation.set(1, {duration : 300, curve : Easing.outSine});
      }
    }, 2000);
  }

  this.hide = function(){
    Mod.setOpacity(0, {duration : 250});
    scoreMod[0].setOpacity(0, {duration : 250});
    scoreMod[1].setOpacity(0, {duration : 250});
    scoreMod[2].setOpacity(0, {duration : 250});
    bestMod[0].setOpacity(0, {duration : 250});
    bestMod[1].setOpacity(0, {duration : 250});
    bestMod[2].setOpacity(0, {duration : 250});
    MedalMod.setOpacity(0, {duration : 250});
  }
}

/////////////
// I N I T //
/////////////

Meteor.startup(function(){
  includes();
  newVars();
  init();
});

function includes(){
  famous.polyfills;
  famous.core.famous;
  Engine = famous.core.Engine;
  Force = famous.physics.forces.Force;
  Wall = famous.physics.constraints.Wall;
  Timer = famous.utilities.Timer;
  PhysicsEngine = famous.physics.PhysicsEngine;
  Wall = famous.physics.constraints.Wall;
  Particle = famous.physics.bodies.Particle;
  View = famous.core.View;
  Surface = famous.core.Surface;
  ImageSurface = famous.surfaces.ImageSurface;
  InputSurface = famous.surfaces.InputSurface;
  Modifier = famous.core.Modifier;
  Transform = famous.core.Transform;
  StateModifier = famous.modifiers.StateModifier;
  Easing = famous.transitions.Easing;
  Transitionable = famous.transitions.Transitionable;
  HeaderFooterLayout = famous.views.HeaderFooterLayout;
  RenderController = famous.views.RenderController;
  MeteorSurface = library.meteor.core.Surface;
  //FastClick = famous.inputs.FastClick;
}

function newVars(){

  Session.set('error', false);
  Session.set('msg', "");

  // Surfaces sueltas
  backgroundRightSurface = new Surface({
    properties: {
      backgroundColor: 'white',
      zIndex : 7
    }
  });

  backgroundTopSurface = new Surface({
    properties: {
      backgroundColor: 'white',
      zIndex : 7
    }
  });

  backgroundRightSurfaceModifier = new Modifier({
    size: [undefined,undefined],
    transform: function(){
      return Transform.translate(640,0,7);
    }
  });

  backgroundTopSurfaceModifier = new Modifier({
    size: [undefined,undefined],
    origin: [0,1],
    transform: function(){
      return Transform.translate(0,0,7)
    }
  });

  backgroundLeftSurface = new Surface({
    properties: {
      backgroundColor: 'white',
      zIndex : 7
    }
  });

  backgroundLeftSurfaceModifier = new Modifier({
    origin: [1,0],
    size: [undefined,undefined],
    transform: function(){
      return Transform.translate(0,0,7);
    }
  });

  floorSurface = new ImageSurface({
    content: 'img/floor.png',
    properties: {
      zIndex : 4
    }
  });

  floorSurfaceModifier = new Modifier({
    size: [640,205],
    transform: function(){
      return Transform.translate(0,756,4)
    }
  });

  clickSurface = new Surface({
    properties:{
      zIndex : 100
    }
  });

  clickSurfaceModifier = new StateModifier({
    size: [640,960],
    transform: Transform.translate(0,0,100)
  });

  backgroundSurface = new ImageSurface({
    content: 'img/background.png',
    size: [640,960],
    properties: {
      zIndex: 1
    }
  });

  // gameView
  gameView = new View();

  gameViewModifier = new Modifier({
    size: [640,960],
    align: [0.5,0],
    origin: [0.5,0],
    transform: function(){
      //var scale = Math.min(window.innerWidth / 640,((window.innerHeight-headerHeight) / 960)*1);
      var scale = Math.min(window.innerWidth / 640,((window.innerHeight) / 960)*1);
      return Transform.scale(scale,scale,1);
    }
  });

  // Add msg
  msg = new Msg();

  // Physics Engine
  // Nou objecte tipus PhysicsEngine
  physicsEngine = new PhysicsEngine();
  // Nou objecte tipus paret que fa de terra
  floorWall = new Wall({ normal: [0,-1,0], distance: 755});
  // Nou objecte tipus Force que fa de gravetat
  gravity = new Force(gravityForce);

  // Columnes
  for (var i = 0; i < colSets; i++){
    colTop[i] = new Column('top');
    colBot[i] = new Column('bot');
  }

  // score
  score = new Score();

  interphase = new interphaseObj();

  // Crea bird
  myBird = new Bird();
}

function init(){
  // subs

  gameView.add(backgroundSurface);
  gameView.add(backgroundRightSurfaceModifier).add(backgroundRightSurface);
  gameView.add(backgroundLeftSurfaceModifier).add(backgroundLeftSurface);
  gameView.add(floorSurfaceModifier).add(floorSurface);
  gameView.add(multiStatsMod).add(multiStatsSurf);
  gameView.add(soloStatsMod).add(soloStatsSurf);
  gameView.add(clickSurfaceModifier).add(clickSurface);

  mainCtx = Engine.createContext();
  mainCtx.add(gameViewModifier).add(gameView);

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
      case 27:
        pressESC();
        break;
    }
  });

  if (Meteor.Device.isDesktop()){
    clickSurface.on(
      'mousedown', function(e){
       pressSpace();
      }
    );
  }

  clickSurface.on(
    'touchstart', function(e){
      pressSpace();
    }
  );

  Engine.on('postrender', function(){
    collisionFunction();
  });

  score.reset();

  // End
  msg.show();

  Timer.setTimeout(function(){
    msg.hide();
    myBird.ready();
    msg.showTaptap();
  }, 3000);
}

/////////////////////
// F U N C I O N S //
/////////////////////

function lose(type){

  // Es paren les columnes
  for (var i = 0; i < colSets; i++){
    colTop[i].stop();
    colBot[i].stop();
  }

  // Es para el comptador que llança columnes
  Timer.clear(timerFunction);

  // Es mostra el missatge 'gameOver'
  msg.setGameOver();
  msg.show();

  // Local
  myBird.lose();

  interphase.show(score.getScore(), 666);

  Timer.setTimeout(function(){
    interphaseFunc();
    myBird.interPhase();
  }, 2500);
}

function interphaseFunc(){

}

function collisionFunction(){
  // Lose by floor
  if (myBird.getPhase() == 'game'){
    if (myBird.getPosY() > 755){
      lose('floor');
    }
    // Lose by column
    for ( var i = 0; i < colSets; i++ ){
      if ( (colTop[i].getModifierPosition()[0] < (213.33+35)) && ((colTop[i].getModifierPosition()[0]+113) > (213.33-35))){
        if ( !((colTop[i].getModifierPosition()[1] < (myBird.getModifierPosition()[1]-50)) && (colBot[i].getModifierPosition()[1] > myBird.getModifierPosition()[1])) ){
          lose('column');
        }
      }
    }
  }

}

function pressSpace(){
  switch (myBird.getPhase()){
      case 'ready':
        // Local
        myBird.start();
        nextCol = 0;
        launch();
        msg.hide();
        msg.hideTaptap();
        timerFunction = Timer.setInterval(launch,launchRate);
        break;
      case 'game':
        // Local
        myBird.flap();
        break;
      case 'lost':
        // Local
        myBird.ready();
        score.reset();

        interphase.hide();

        for (var i = 0; i < colSets; i++){
          colTop[i].reset(480);
          colBot[i].reset(480);
        }
        msg.setReady();
        msg.hide();
        msg.showTaptap();
        break;
    }
}

function launch(){
  var aux = Math.floor((Math.random()*401) + 177);
  colTop[nextCol%colSets].reset(aux - 125);
  colBot[nextCol%colSets].reset(aux + 125);
  colTop[nextCol%colSets].launch();
  colBot[nextCol%colSets].launch();

  nextCol++;

  score.increment();
}

function press1(){

}

function press2(){

}

function press3(){

}

function press4(){

}


/////////////////
// A L T R E S //
/////////////////

Meteor._debug = (function (super_meteor_debug) {
  return function (error, info) {
    if (!(info && _.has(info, 'msg'))){
      super_meteor_debug(error, info);
    }
  }
})(Meteor._debug);
