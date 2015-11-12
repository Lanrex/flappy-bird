if (statistics.find().count() === 0){
  statistics.insert({
    'numFlaps' : 0,
    'numDeaths' : 0
  });
}

if (ranking.find().count() === 0) {
  for (var i = 1; i < 11; i++ ){
    ranking.insert({
      'position' : i,
      'user' : '-',
      'score' : 0
    });
  }
}
