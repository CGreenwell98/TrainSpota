import Map from "./map.js";

class MapUI {
  #sideBar = document.querySelector(".side-bar");
  #searchContainer = document.querySelector(".search");
  #searchForm = document.querySelector(".search-form");
  #searchBox = document.querySelector(".search-box");
  #searchResults = document.querySelector(".search-results");

  constructor() {
    this.#sideBar.addEventListener("click", this._buttonClick.bind(this));
    this.#searchForm.addEventListener("submit", this._stationSearch.bind(this));
  }

  _buttonClick(event) {
    const clicked = event.target.closest(".fas");
    if (!clicked) return;

    const btnClicked = clicked.dataset.name;

    if (btnClicked === "mapType") Map.changeMapType();
    if (btnClicked === "trainRoutes") Map.toggleTrainRoutes();
    if (btnClicked === "curLocation")
      Map.renderCurrentPosition("panToCurrentPosition");
    if (btnClicked === "search")
      this.#searchContainer.classList.toggle("hidden");
    if (btnClicked !== "search") this.#searchContainer.classList.add("hidden");
  }

  async _stationSearch(event) {
    event.preventDefault();
    Map.fetchStationData(this.#searchBox.value);
    this.#searchBox.value = "";
  }

  displaySearchResults(dataUI) {
    this.#searchResults.innerHTML = "";
    dataUI.forEach((data, i) =>
      this.#searchResults.insertAdjacentHTML(
        "beforeend",
        this._searchResultMarkup(data, i)
      )
    );
    this.#searchContainer.addEventListener(
      "click",
      this._searchResultClick.bind(this)
    );
  }

  _searchResultMarkup(data, i) {
    return `
      <div class="result-box" data-index="${i}">
        <p>${data.name} (${data.code})</p>
      </div>
    `;
  }

  _searchResultClick(event) {
    const clicked = event.target.closest(".result-box");
    if (!clicked) return;
    Map.panToStation(clicked.dataset.index);
  }
}

export default new MapUI();
