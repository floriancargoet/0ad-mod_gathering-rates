// this file is prefixed with "z_" so that it's loaded after session.js

// overwrite updatePlayerDisplay()
(function () {
  var _updatePlayerDisplay = updatePlayerDisplay;

  var statsCount = 10; // we average the last 10 seconds of data
  var stats = [];
  var lastResourceUpdate = 0;

  function updateResourceStats(playerState) {
    // update once per second
    var now = Date.now();
    if (now - lastResourceUpdate < 1000) {
      return;
    }
    lastResourceUpdate = now;

    // get current resources statistics
    var resourcesGathered = deepcopy(playerState.statistics.resourcesGathered);
    stats.push(resourcesGathered);
    while (stats.length > statsCount) {
      stats.shift();
    }
  }

  function getResourceRates() {
    var resourceRates = {
      food: 0,
      wood: 0,
      stone: 0,
      metal: 0
    };
    var resourcesTypes = Object.keys(resourceRates);
    // moving average
    var coefficient = 1 / stats.length;
    for (var i = 1; i < stats.length; i++) {
      for (var j = 0; j < resourcesTypes.length; j++) {
        var type = resourcesTypes[j];
        resourceRates[type] += (stats[i][type] - stats[i - 1][type]) * coefficient;
      }
    }
    return resourceRates;
  }

  function formatResourceCaption(count, rate) {
    var precision = (rate < 20 ? 1 : 0);
    return Math.floor(count) + " | " + rate.toFixed(precision) + "/s";
  }

  // overwrite existing function
  updatePlayerDisplay = function updatePlayerDisplay() {
    _updatePlayerDisplay();

    var playerState = GetSimState().players[Engine.GetPlayerID()];
    if (!playerState) {
      return;
    }

    updateResourceStats(playerState);
    var rates = getResourceRates();

    Engine.GetGUIObjectByName("resourceFood").caption = formatResourceCaption(playerState.resourceCounts.food, rates.food);
    Engine.GetGUIObjectByName("resourceWood").caption = formatResourceCaption(playerState.resourceCounts.wood, rates.wood);
    Engine.GetGUIObjectByName("resourceStone").caption = formatResourceCaption(playerState.resourceCounts.stone, rates.stone);
    Engine.GetGUIObjectByName("resourceMetal").caption = formatResourceCaption(playerState.resourceCounts.metal, rates.metal);
  }

}());
