class Map {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;

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
    console.log(coords);

    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //   Handle click on map:
    //   this.#map.on('click', this._showForm.bind(this));
  }
}

export default new Map();
