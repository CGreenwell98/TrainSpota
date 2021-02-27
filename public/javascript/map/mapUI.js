import Map from "./map.js";

class MapUI {
  _sideBar = document.querySelector(".side-bar");
  _searchContainer = document.querySelector(".search-container");
  _searchForm = document.querySelector(".search-form");
  _searchBox = document.querySelector(".search-box");
  _searchResults = document.querySelector(".search-results");
  _trainBtnBox = document.querySelector(".train-btn-box");
  _trainBtns;
  _closeButton = document.querySelector(".close-btn");
  _searchContainerResults = document.querySelector(".search-result-container");
  _loadingDots = document.querySelector(".loading-dots");

  _curStation = {};
  _curTrainType = "stopping";
  _clickedIndex;

  constructor() {
    this._sideBar.addEventListener("click", this._buttonClick.bind(this));
    this._searchForm.addEventListener("submit", this._stationSearch.bind(this));
    this._closeButton.addEventListener(
      "click",
      this._closeButtonClick.bind(this)
    );
    this._searchContainer.addEventListener(
      "click",
      this._searchResultClick.bind(this)
    );
    this._trainBtnBox.addEventListener("click", this._trainBtnClick.bind(this));
  }

  _buttonClick(event) {
    const clicked = event.target.closest(".btn");
    if (!clicked) return;

    const btnClicked = clicked.dataset.name;

    if (btnClicked === "mapType") Map.changeMapType();
    if (btnClicked === "trainRoutes") Map.toggleTrainRoutes();
    if (btnClicked === "curLocation") Map.panToCurrentPosition();
    if (btnClicked === "search") this._searchButtonClick();

    if (btnClicked !== "search") this._closeButtonClick();
  }

  _closeButtonClick() {
    this._searchContainer.classList.add("hidden");
    this._searchContainerResults.classList.remove(
      "search-result-container-active"
    );
  }

  _searchButtonClick() {
    const search = this._searchContainer.classList;
    search.toggle("hidden");
    if (!search.contains("hidden")) this._searchBox.focus();
    else
      this._searchContainerResults.classList.remove(
        "search-result-container-active"
      );
  }

  async _stationSearch(event) {
    event.preventDefault();
    const stationData = await Map.fetchStationData(this._searchBox.value);
    this._displaySearchResults(stationData);
    this._searchBox.value = "";
  }

  _displaySearchResults(stationData) {
    this._searchResults.innerHTML = this._trainBtnBox.innerHTML = "";
    if (stationData.length < 1)
      return this._searchResults.insertAdjacentHTML(
        "beforeend",
        `<p>No search results found</p>`
      );

    this._searchResults.insertAdjacentHTML(
      "beforeend",
      `<small>Search results</small>`
    );
    stationData.forEach((data, i) =>
      this._searchResults.insertAdjacentHTML(
        "beforeend",
        this._searchResultMarkup(data, i)
      )
    );
    // Open window:
    this._searchContainerResults.classList.add(
      "search-result-container-active"
    );
  }

  _searchResultMarkup(data, i) {
    return `
    <div class="result-box" data-index="${i}">
              <b>${data.code}</b>
              <p>${data.name}</p>
            </div>
    `;
  }

  async _searchResultClick(event) {
    const clicked = event.target.closest(".result-box");
    if (!clicked) return;
    // clear search results + open window:
    this._searchResults.innerHTML = "";
    this._searchContainerResults.classList.add(
      "search-result-container-active"
    );

    // pan camera and get station + train data:
    this._clickedIndex = clicked.dataset.index;
    if (Map.searchedStations.length > 1) Map.panToStation(this._clickedIndex);
    const { name, station_code } = Map.searchedStations[this._clickedIndex];
    this._handleTrainSearch(name, station_code);
  }

  async _handleTrainSearch(stationName, stationCode) {
    // Add loading dots:
    this._toggleLoadingDots("add");

    this._curStation = { stationName, stationCode };
    this._curTrainType = "stopping";
    const trainData = await Map.getTrainData(stationCode, "stopping");

    // display new data:
    this._searchResults.insertAdjacentHTML(
      "beforeend",
      this._displayTrainData(trainData, this._curStation)
    );

    // Display buttons:
    this._trainBtnBox.insertAdjacentHTML(
      "beforeend",
      `
      <button class="btn train-type-btn train-type-btn-active" data-traintype="stopping">
        Stopping
      </button>
      <button class="btn train-type-btn" data-traintype="pass">
        Passing
      </button>
     `
    );

    // remove loading dots:
    this._toggleLoadingDots("remove");
  }

  _displayTrainData(trainData, { stationName, stationCode }, trainType) {
    if (trainData.length < 1) return `<p>No train data found</p>`;
    return `
              <h3><b>${stationCode}</b>${stationName}</h3>
              ${
                trainType === "pass"
                  ? this._trainPassingDataMarkup(trainData)
                  : this._trainStoppingDataMarkup(trainData)
              }
      `;
  }

  _trainStoppingDataMarkup(trainData) {
    let markup = "";
    trainData.forEach((data) => {
      markup += `
      <div class="train-data-box">
              <h5>Platform ${data.platform}</h5>
              <small>${data.operator_name}</small>
              <ul>
                <li class="arv-box"><b>ARV</b> ${data.arrival_time}</li>
                <li class="dep-box"><b>DEP</b> ${data.departure_time}</li>
              </ul>
              <div class="train-destination-box">
                <div>${data.origin_name}</div>
                <i class="fas fa-arrow-right"></i>
                <div>${data.destination_name}</div>
              </div>  
            </div>`;
    });
    return markup;
  }

  _trainPassingDataMarkup(trainData) {
    let markup = "";
    trainData.forEach((data) => {
      markup += ` 
      <div class="train-data-box">
              <h5>Platform ${data.platform}</h5>
              <small>${data.operator_name}</small>
              <ul>
                <li class="pass-box"><b>PASS</b> ${data.pass_time}</li>
              </ul>
              <div class="train-destination-box">
                <div>${data.origin_name}</div>
                <i class="fas fa-arrow-right"></i>
                <div>${data.destination_name}</div>
              </div>  
            </div>`;
    });
    return markup;
  }

  async _trainBtnClick(event) {
    const clicked = event.target.closest(".train-type-btn");
    if (!clicked) return;

    // prevent reload on same button press:
    const trainType = clicked.dataset.traintype;
    if (trainType === this._curTrainType) return;
    this._curTrainType = trainType;

    // Add loading animation:
    this._toggleLoadingDots("add");

    // Update button UI:
    this._trainBtns = document.querySelectorAll(".train-type-btn");
    this._trainBtns.forEach((btn) =>
      btn.classList.toggle("train-type-btn-active")
    );

    // update data:
    this._searchResults.innerHTML = "";
    const trainData = await Map.getTrainData(
      this._curStation.stationCode,
      trainType
    );
    this._searchResults.insertAdjacentHTML(
      "beforeend",
      this._displayTrainData(trainData, this._curStation, trainType)
    );

    // remove loading animation:
    this._toggleLoadingDots("remove");
  }

  displayClosestStation(stationData) {
    this._searchContainer.classList.remove("hidden");
    // Open Window:
    this._searchContainerResults.classList.add(
      "search-result-container-active"
    );
    // Prevent UI reload + Train data fetch if clicked on same station twice:
    if (stationData.name === this._curStation.stationName) return;
    this._searchResults.innerHTML = this._trainBtnBox.innerHTML = "";
    const { name, station_code } = stationData;
    this._handleTrainSearch(name, station_code);
  }

  hideSearchBox() {
    this._searchContainer.classList.add("hidden");
    this._searchContainerResults.classList.remove(
      "search-result-container-active"
    );
  }

  _toggleLoadingDots(action) {
    if (action === "add")
      this._loadingDots.classList.remove("loading-dots-hidden");
    if (action === "remove")
      this._loadingDots.classList.add("loading-dots-hidden");
  }
}

export default new MapUI();
