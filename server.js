const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const trainAPI = require(__dirname + "/trainAPI.js");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/map", (req, res) => {
  res.render("map");
});

app.get("/map/search-station/:stationName", async (req, res) => {
  res.json(await trainAPI.locateStation(req.params.stationName));
});

app.get("/map/station-trains/:stationCode/:type", async (req, res) => {
  res.json(
    await trainAPI.stationTrainData(req.params.stationCode, req.params.type)
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
