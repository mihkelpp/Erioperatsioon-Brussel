// 1. Lae andmed Google Sheetist
fetch("https://sheets.googleapis.com/v4/spreadsheets/SPREADSHEET_ID/values/Sheet1?key=API_KEY")
  .then(res => res.json())
  .then(data => {
    const teams = data.values.slice(1); // jätame päise vahele
    teams.forEach(team => {
      const name = team[0];
      const km = parseFloat(team[1]);
      placeMarker(name, km);
    });
  });

// 2. Arvuta positsioon marsruudil
function placeMarker(name, km) {
  let distance = 0;
  let prev = routePath[0];
  for (let i = 1; i < routePath.length; i++) {
    const segment = google.maps.geometry.spherical.computeDistanceBetween(prev, routePath[i]) / 1000;
    distance += segment;
    if (distance >= km) {
      new google.maps.Marker({
        position: routePath[i],
        map: map,
        label: name
      });
      break;
    }
    prev = routePath[i];
  }
}
