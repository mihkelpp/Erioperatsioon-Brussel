const tartu = {lat: 58.37307488694068, lng: 26.726976347863893};
const brussel = {lat: 50.844990391302076, lng: 4.349986359265218};
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR00B6HxmGhC0bhhGIp3bEMt-mcvu1Tb185GvmlR2_sGsGth6Bwb3cr0F0Y7cXFg0WiQC6PTY4oJC8Q/pub?gid=0&single=true&output=csv";

function interpolatePosition(start, end, progress) {
  return {
    lat: start.lat + progress * (end.lat - start.lat),
    lng: start.lng + progress * (end.lng - start.lng)
  };
}

function getPosition(km) {
  if (km <= 2000) {
    const progress = km / 2000;
    return interpolatePosition(tartu, brussel, progress);
  } else if (km <= 4000) {
    const progress = (km - 2000) / 2000;
    return interpolatePosition(brussel, tartu, progress);
  } else {
    return tartu;
  }
}

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: {lat: 54, lng: 15}
  });

  fetch(sheetUrl)
  .then(res => res.text())
  .then(data => {
    console.log("Raw CSV:", data); // 👉 näed kogu faili sisu konsoolis

    // Kui failis on TAB eraldaja, kasuta split("\t")
    const rows = data.split("\n").map(r => r.split("\t"));
    console.log("Parsed rows:", rows); // 👉 näed iga rida massiivina

    // Test: näita iga rida konsoolis
    rows.forEach(row => {
      console.log("Row:", row);
    });
  })
  .catch(err => console.error("CSV laadimise viga:", err));

}
