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

exports.stationTrainData = async function (stationCode, type) {
  try {
    const response = await fetch(
      `https://transportapi.com/v3/uk/train/station/${stationCode}///timetable.json?app_id=${
        process.env.TRANSPORT_API_ID
      }&app_key=${process.env.TRANSPORT_API_KEY}&train_status=passenger&type=${
        type === "pass" ? "pass" : "arrival,departure"
      }`
    );
    const json = await response.json();
    const allData = type === "pass" ? json.passes.all : json.updates.all;
    return allData.map((data) => ({
      train_uid: data.train_uid,
      platform: data.platform,
      operator_name: data.operator_name,
      arrival_time: data.aimed_arrival_time,
      departure_time: data.aimed_departure_time,
      pass_time: data.aimed_pass_time,
      origin_name: data.origin_name,
      destination_name: data.destination_name,
    }));
  } catch (err) {
    console.error(err);
  }
};

exports.closestStation = async function (lat, lng) {
  try {
    const response = await fetch(
      `https://transportapi.com/v3/uk/places.json?app_id=${process.env.TRANSPORT_API_ID}&app_key=${process.env.TRANSPORT_API_KEY}&lat=${lat}&lon=${lng}&type=train_station`
    );
    const json = await response.json();
    return json.member[0];
  } catch (err) {
    console.error(err);
  }
};
