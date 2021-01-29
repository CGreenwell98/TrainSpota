class Map {
  #map;
  #currentLayer = "openStreetMap";
  #showTrainRoutes = true;

  #mapLayers = {
    satelitte: L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      }
    ),
    openStreetMap: L.tileLayer(
      "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ),
    openRailwayMap: L.tileLayer(
      "https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
      {
        maxZoom: 18,
        zIndex: 2,
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      }
    ),
  };

  constructor() {
    this._renderCurrentPosition();
  }

  _renderCurrentPosition() {
    // Geo-location:
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get your position");
        }
      );
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map("map", {
      center: coords,
      zoom: 13,
      layers: [this.#mapLayers.openStreetMap, this.#mapLayers.openRailwayMap],
    });

    // const baseMaps = {
    //   Default: this.#mapLayers.openStreetMap,
    //   Satelitte: this.#mapLayers.satelitte,
    // };

    // const overlayMaps = {
    //   Railways: this.#mapLayers.openRailwayMap,
    // };

    // L.control.layers(baseMaps, overlayMaps).addTo(this.#map);

    //   Handle click on map:
    //   this.#map.on('click', this._showForm.bind(this));
  }

  changeMapType() {
    this.#map.removeLayer(this.#mapLayers[this.#currentLayer]);
    this.#currentLayer =
      this.#currentLayer === "openStreetMap" ? "satelitte" : "openStreetMap";
    this.#map.addLayer(this.#mapLayers[this.#currentLayer]);
  }

  toggleTrainRoutes() {
    this.#showTrainRoutes = !this.#showTrainRoutes;
    if (this.#showTrainRoutes)
      this.#map.addLayer(this.#mapLayers.openRailwayMap);
    else this.#map.removeLayer(this.#mapLayers.openRailwayMap);
  }
}

export default new Map();
