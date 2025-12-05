
const totalKm = 4150; // Tartu–Brüssel–Tartu
const tartu = {lat: 58.37307488694068, lng: 26.726976347863893};
const brussel = {lat: 50.844990391302076, lng: 4.349986359265218};

// 👉 Pane siia oma Google Sheets CSV link
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR00B6HxmGhC0bhhGIp3bEMt-mcvu1Tb185GvmlR2_sGsGth6Bwb3cr0F0Y7cXFg0WiQC6PTY4oJC8Q/pub?gid=0&single=true&output=csv";

function interpolatePosition(start, end, progress) {
  return {
    lat: start.lat + progress * (end.lat - start.lat),
    lng: start.lng + progress * (end.lng - start.lng)
  };
}

function getPosition(km) {
  if (km <= 4150) {
    // Etapp 1: Tartu → Brüssel
    const progress = km / 4150;
    return interpolatePosition(tartu, brussel, progress);
  } else {
    // Etapp 2: Brüssel → Tartu
    const progress = (km - 4150) / 4150;
    return interpolatePosition(brussel, tartu, progress);
  }
}

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: {lat: 54, lng: 15}
  });

  // Lae andmed Google Sheetsist
  fetch(sheetUrl)
    .then(res => res.text())
    .then(data => {
      const rows = data.split("\n").map(r => r.split(","));
      // Oletame, et tabelis on: Võistkond,Läbitud km
      rows.forEach(row => {
        const team = row[0];
        const km = parseInt(row[1]);
        if (!isNaN(km)) {
          const pos = getPosition(km);
          new google.maps.Marker({
            position: pos,
            map,
            title: team
          });
        }
      });
    });
}


