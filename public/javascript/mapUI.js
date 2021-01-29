import Map from "./map.js";

class MapUI {
  #sideBar = document.querySelector(".side-bar");

  constructor() {
    this.#sideBar.addEventListener("click", this._buttonClick);
  }

  _buttonClick(event) {
    const clicked = event.target.closest(".fas");
    if (!clicked) return;

    const btnClicked = clicked.dataset.name;

    if (btnClicked === "mapType") Map.changeMapType();
    if (btnClicked === "trainRoutes") Map.toggleTrainRoutes();
  }
}

export default new MapUI();
