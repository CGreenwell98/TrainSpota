const fetch = require("node-fetch");

exports.locateStation = async function (stationName) {
  try {
    const response = await fetch(
      `http://transportapi.com/v3/uk/places.json?query=${stationName}&type=train_station&app_id=${process.env.TRANSPORT_API_ID}&app_key=${process.env.TRANSPORT_API_KEY}`
    );
    const json = await response.json();
    return json.member;
  } catch (err) {
    console.error(err);
  }
};
