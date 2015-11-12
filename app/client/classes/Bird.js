Surface = famous.core.Surface;
Modifier = famous.core.Modifier;
Transform = famous.core.Transform;

Bird = {

  Surf : new Surface({
    properties : {
      backgroundColor : 'blue'
    }
  }),

  Mod : new Modifier({
    size: [100,100],
    transform : function(){
      return Transform.translate(50,50);
    }
  }),

  add : function(){
    mainCtx.add(this.Mod).add(this.Surf);
  }
};
