import MapUI from "./mapUI.js";

class Map {
  #map;
  #currentLayer = "openStreetMap";
  #showTrainRoutes = true;
  #curLocationMarker;
  #searchedStations;

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
    this.renderCurrentPosition("_loadMap");
  }

  renderCurrentPosition(mapFunction) {
    // Geo-location:
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this[mapFunction].bind(this),
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
      zoomControl: false,
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

  panToCurrentPosition(position) {
    if (this.#curLocationMarker) this.#curLocationMarker.remove();
    this.#curLocationMarker = this._addMarker(
      this._getCoords(position.coords),
      "You Are Here"
    );
  }

  async fetchStationData(stationName) {
    this.#searchedStations = await fetch(
      `/map/search-station/${stationName}`
    ).then((res) => res.json());
    if (this.#searchedStations.length === 1) {
      this.panToStation(0);
    }
    const dataUI = this.#searchedStations.map((station) => ({
      name: station.name,
      code: station.station_code,
    }));
    MapUI.displaySearchResults(dataUI);
  }

  panToStation(index) {
    this._addMarker(
      this._getCoords(this.#searchedStations[index]),
      this.#searchedStations[index].name
    );
  }

  _addMarker(coords, popupText) {
    L.marker(coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          //   maxWidth: 250,
          //   minWidth: 100,

          autoClose: false,
          className: `popup`,
        })
      )
      .setPopupContent(popupText)
      .openPopup();
    this.#map.flyTo(coords, 15);
  }

  _getCoords(object) {
    const { latitude, longitude } = object;
    return [latitude, longitude];
  }
}

export default new Map();
