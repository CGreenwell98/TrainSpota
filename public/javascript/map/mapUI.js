import Map from "./map.js";

class MapUI {
  #sideBar = document.querySelector(".side-bar");
  #searchContainer = document.querySelector(".search");
  #searchForm = document.querySelector(".search-form");
  #searchBox = document.querySelector(".search-box");
  #searchResults = document.querySelector(".search-results");
  #trainBtnBox = document.querySelector(".train-btn-box");

  #curStation;
  #curTrainType = "stopping";
  #clickedIndex;

  constructor() {
    this.#sideBar.addEventListener("click", this._buttonClick.bind(this));
    this.#searchForm.addEventListener("submit", this._stationSearch.bind(this));
    this.#searchContainer.addEventListener(
      "click",
      this._searchResultClick.bind(this)
    );
    this.#trainBtnBox.addEventListener("click", this._trainBtnClick.bind(this));
  }

  _buttonClick(event) {
    const clicked = event.target.closest(".btn");
    if (!clicked) return;

    const btnClicked = clicked.dataset.name;

    if (btnClicked === "mapType") Map.changeMapType();
    if (btnClicked === "trainRoutes") Map.toggleTrainRoutes();
    if (btnClicked === "curLocation")
      Map.renderCurrentPosition("panToCurrentPosition");
    if (btnClicked === "search") this._searchButton();

    if (btnClicked !== "search") this.#searchContainer.classList.add("hidden");
  }

  _searchButton() {
    const btn = this.#searchContainer.classList;
    btn.toggle("hidden");
    if (!btn.contains("hidden")) this.#searchBox.focus();
  }

  async _stationSearch(event) {
    event.preventDefault();
    const stationData = await Map.fetchStationData(this.#searchBox.value);
    this._displaySearchResults(stationData);
    this.#searchBox.value = "";
  }

  _displaySearchResults(stationData) {
    this.#searchResults.innerHTML = this.#trainBtnBox.innerHTML = "";
    if (stationData.length < 1)
      return this.#searchResults.insertAdjacentHTML(
        "beforeend",
        `<p>No search results found</p>`
      );
    stationData.forEach((data, i) =>
      this.#searchResults.insertAdjacentHTML(
        "beforeend",
        this._searchResultMarkup(data, i)
      )
    );
  }

  _searchResultMarkup(data, i) {
    return `
      <div class="result-box" data-index="${i}">
        <p>${data.name} (${data.code})</p>
      </div>
    `;
  }

  async _searchResultClick(event) {
    const clicked = event.target.closest(".result-box");
    if (!clicked) return;
    // clear searh results + remove click:
    this.#searchResults.innerHTML = "";

    // pan camera and get station + train data:
    this.#clickedIndex = clicked.dataset.index;
    if (Map.searchedStations.length > 1) Map.panToStation(this.#clickedIndex);
    const { name, station_code } = Map.searchedStations[this.#clickedIndex];
    this._handleTrainSearch(name, station_code);
  }

  _displayTrainData(trainData, { stationName, stationCode }, trainType) {
    if (trainData.length < 1) return `<p>No train data found</p>`;
    return `
        <div class="train-data-box">
              <h5>${stationName} (${stationCode})</h5>
              <b>Trains ${trainType === "pass" ? "passing" : "stopping"}:</b>
              ${
                trainType === "pass"
                  ? this._trainPassingDataMarkup(trainData)
                  : this._trainStoppingDataMarkup(trainData)
              }
              
            </div>
      `;
  }

  _trainStoppingDataMarkup(trainData) {
    let markup = "";
    trainData.forEach((data) => {
      markup += ` <hr />
          <p>
            ${data.operator_name} (${data.train_uid}) <br />
            ${data.origin_name} to ${data.destination_name}
          </p>
          <ul>
            <li>Platform ${data.platform ? data.platform : "1"}</li>
            <li>ETA/ETD: ${data.arrival_time} - ${data.departure_time}</li>
            </ul>`;
    });
    return markup;
  }

  _trainPassingDataMarkup(trainData) {
    let markup = "";
    trainData.forEach((data) => {
      markup += ` <hr />
          <p>
            ${data.operator_name} (${data.train_uid}) <br />
            ${data.origin_name} to ${data.destination_name}
          </p>
          <ul>
            <li>Platform ${data.platform ? data.platform : "1"}</li>
            <li>Pass time: ${data.pass_time}</li>
            </ul>`;
    });
    return markup;
  }

  async _trainBtnClick(event) {
    const clicked = event.target.closest(".train-type-btn");
    if (!clicked) return;

    // prevent reload on same button press:
    const trainType = clicked.dataset.traintype;
    if (trainType === this.#curTrainType) return;
    this.#curTrainType = trainType;

    // update data:
    this.#searchResults.innerHTML = "";
    const trainData = await Map.getTrainData(
      this.#curStation.stationCode,
      trainType
    );
    this.#searchResults.insertAdjacentHTML(
      "beforeend",
      this._displayTrainData(trainData, this.#curStation, trainType)
    );
  }

  async _handleTrainSearch(stationName, stationCode) {
    this.#curStation = { stationName, stationCode };
    this.#curTrainType = "stopping";
    const trainData = await Map.getTrainData(stationCode, "stopping");

    // display new data:
    this.#searchResults.insertAdjacentHTML(
      "beforeend",
      this._displayTrainData(trainData, this.#curStation)
    );

    // Display buttons:
    this.#trainBtnBox.insertAdjacentHTML(
      "beforeend",
      `
      <button class="train-type-btn btn" data-traintype="stopping">Stopping</button>
      <button class="train-type-btn btn" data-traintype="pass">Passing</button>
     `
    );
  }

  displayClosestStation(stationData) {
    this.#searchContainer.classList.remove("hidden");
    this.#searchResults.innerHTML = this.#trainBtnBox.innerHTML = "";
    const { name, station_code } = stationData;
    this._handleTrainSearch(name, station_code);
  }
}

export default new MapUI();
