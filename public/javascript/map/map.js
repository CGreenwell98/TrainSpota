import MapUI from "./mapUI.js";

class Map {
  _map;
  _currentLayer = "openStreetMap";
  _showTrainRoutes = true;
  _stationMarkers = [];
  searchedStations;
  _clickedTimeStamp;

  _mapLayers = {
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
        zIndex: 2,
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      }
    ),
  };

  constructor() {
    // this.renderCurrentPosition("_loadMap");
    this._loadMap();
  }

  _loadMap() {
    this._map = L.map("map", {
      zoom: 13,
      maxZoom: 18,
      minZoom: 6,
      zoomControl: false,
      layers: [this._mapLayers.openStreetMap, this._mapLayers.openRailwayMap],
      maxBounds: [
        [59, -12],
        [50, 3],
      ],
    })
      .locate({ setView: true, maxZoom: 15 })
      .on("click", this._mapClick.bind(this));
  }

  panToCurrentPosition() {
    this._map.locate();

    this._map.on("locationfound", (e) => {
      this._map.flyTo(e.latlng, 15);
      this._addMarker(e.latlng, "You Are Here");
    });
    this._map.on("locationerror", (e) => alert(e.message));
  }

  changeMapType() {
    this._map.removeLayer(this._mapLayers[this._currentLayer]);
    this._currentLayer =
      this._currentLayer === "openStreetMap" ? "satelitte" : "openStreetMap";
    this._map.addLayer(this._mapLayers[this._currentLayer]);
  }

  toggleTrainRoutes() {
    this._showTrainRoutes = !this._showTrainRoutes;
    if (this._showTrainRoutes)
      this._map.addLayer(this._mapLayers.openRailwayMap);
    else this._map.removeLayer(this._mapLayers.openRailwayMap);
  }

  async fetchStationData(stationName) {
    this.searchedStations = await fetch(
      `/map/search-station/${stationName}`
    ).then((res) => res.json());
    if (this.searchedStations.length === 1) {
      this.panToStation(0);
    }
    let dataUI = this.searchedStations.map((station) => ({
      name: station.name,
      code: station.station_code,
    }));
    return dataUI;
  }

  panToStation(index) {
    const coords = this._getCoords(this.searchedStations[index]);
    this._map.flyTo(coords, 15);
    this._addMarker(coords, this.searchedStations[index].name);
  }

  _addMarker(coords, popupText) {
    if (this._stationMarkers.includes(popupText)) return;
    L.marker(coords)
      .addTo(this._map)
      .bindPopup(
        L.popup({
          autoClose: false,
          className: `popup`,
        })
      )
      .setPopupContent(popupText)
      .openPopup();
    this._stationMarkers.push(popupText);
  }

  _getCoords(object) {
    const { latitude, longitude } = object;
    return [latitude, longitude];
  }

  async getTrainData(stationCode, type) {
    try {
      const trainData = await fetch(
        `/map/station-trains/${stationCode}/${type}`
      ).then((res) => res.json());
      trainData.forEach((data) => {
        if (type === "pass") return;
        if (!data.arrival_time) data.arrival_time = "Starts here";
        if (!data.departure_time) data.departure_time = "Terminates here";
      });
      return trainData;
    } catch (err) {
      console.error(err);
    }
  }

  async _mapClick(e) {
    // Prevent leaflet map click bug:
    const clickTimeInterval =
      e.originalEvent.timeStamp - this._clickedTimeStamp;
    if (clickTimeInterval < 100) return;
    this._clickedTimeStamp = e.originalEvent.timeStamp;
    // finding closest station to coords:
    const { lat, lng } = e.latlng;
    const closestStation = await fetch(
      `/map/closest-station/${lat}/${lng}`
    ).then((res) => res.json());
    if (closestStation.distance > 500) return;
    this._addMarker(this._getCoords(closestStation), closestStation.name);
    MapUI.displayClosestStation(closestStation);
  }
}

export default new Map();
