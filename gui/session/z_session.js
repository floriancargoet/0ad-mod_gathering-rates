// this file is prefixed with "z_" so that it's loaded after session.js

// overwrite updatePlayerDisplay()
(function () {
  var _updatePlayerDisplay = updatePlayerDisplay;

  var resourceRates = {
    food: 0,
    wood: 0,
    stone: 0,
    metal: 0
  };
  var lastResourcesGathered;
  var lastResourceUpdate = 0;

  var resourcesTypes = [
    "wood",
    "food",
    "stone",
    "metal"
  ];

  function updateResourceRates() {
    // update one per second
    var now = Date.now();
    if (now - lastResourceUpdate < 1000) {
      return;
    }

    lastResourceUpdate = now;

    // get current resources statistics
    var playerState = GetSimState().players[Engine.GetPlayerID()];
    var resourcesGathered = deepcopy(playerState.statistics.resourcesGathered);
    if (!lastResourcesGathered) {
      lastResourcesGathered = resourcesGathered;
      return;
    }
    // diff against last statistics and moving average
    for (var i = 0; i < resourcesTypes.length; i++) {
      var type = resourcesTypes[i];
      resourceRates[type] = resourceRates[type] * 0.8 + (resourcesGathered[type] - lastResourcesGathered[type]) * 0.2;
    }
    lastResourcesGathered = resourcesGathered;
  }

  function formatResourceCaption(count, rate) {
    return Math.floor(count) + " | " + rate.toFixed(1);
  }

  // overwrite existing function
  updatePlayerDisplay = function updatePlayerDisplay() {
    _updatePlayerDisplay();

    var playerState = GetSimState().players[Engine.GetPlayerID()];
    if (!playerState) {
      return;
    }
    updateResourceRates();

    Engine.GetGUIObjectByName("resourceFood").caption = formatResourceCaption(playerState.resourceCounts.food, resourceRates.food);
    Engine.GetGUIObjectByName("resourceWood").caption = formatResourceCaption(playerState.resourceCounts.wood, resourceRates.wood);
    Engine.GetGUIObjectByName("resourceStone").caption = formatResourceCaption(playerState.resourceCounts.stone, resourceRates.stone);
    Engine.GetGUIObjectByName("resourceMetal").caption = formatResourceCaption(playerState.resourceCounts.metal, resourceRates.metal);
  }

}());
