Meteor.startup(function(){
  console.log('Server startup');

  Meteor.publish('topScore', function(){
    return topScore.find();
  });
});

Meteor.methods({
  lose : function(score){
    if (score > topScore.findOne().number){
      console.log('New top score: ' + score);
      topScore.update(topScore.findOne(), { $set : { 'number' : score } });
    }
  },

  reset : function(){
    console.log('Reset topScore (0)');
    topScore.update(topScore.findOne(), { $set : { 'number' : 0 } });
  }
});
