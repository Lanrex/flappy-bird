Meteor.startup(function(){
  console.log('Server startup');

  Meteor.publish('ranking', function(){
    return ranking.find();
  });

  Meteor.publish('statistics', function(){
    return statistics.find();
  });
});
