// Kokku distants Tartu–Brüssel–Tartu ~4000 km
const totalKm = 4000;
const tartu = {lat: 58.37307488694068, lng: 26.726976347863893};
const brussel = {lat: 50.844990391302076, lng: 4.349986359265218};

// 👉 Pane siia oma Google Sheets CSV link (Publish to web → CSV)
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR00B6HxmGhC0bhhGIp3bEMt-mcvu1Tb185GvmlR2_sGsGth6Bwb3cr0F0Y7cXFg0WiQC6PTY4oJC8Q/pub?gid=0&single=true&output=csv";

// Lihtne interpoleerimise funktsioon kahe punkti vahel
function interpolatePosition(start, end, progress) {
  return {
    lat: start.lat + progress * (end.lat - start.lat),
    lng: start.lng + progress * (end.lng - start.lng)
  };
}

// Arvuta edenemise positsioon
function getPosition(km) {
  if (km <= 2000) {
    // Etapp 1: Tartu → Brüssel
    const progress = km / 2000;
    return interpolatePosition(tartu, brussel, progress);
  } else if (km <= 4000) {
    // Etapp 2: Brüssel → Tartu
    const progress = (km - 2000) / 2000;
    return interpolatePosition(brussel, tartu, progress);
  } else {
    // Kui distants ületab 4000 km, jää marker Tartusse
    return tartu;
  }
}

// Google Maps initsialiseerimine
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: {lat: 54, lng: 15}
  });

  // Testmarker Tartus
  new google.maps.Marker({
    position: {lat: 58.373, lng: 26.727},
    map,
    title: "Tartu"
  });

  // Testmarker Brüsselis
  new google.maps.Marker({
    position: {lat: 50.845, lng: 4.350},
    map,
    title: "Brüssel"
  });
}

