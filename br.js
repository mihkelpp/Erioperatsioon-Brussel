// Koordinaadid
const tartu = {lat: 58.37307488694068, lng: 26.726976347863893};
const brussel = {lat: 50.844990391302076, lng: 4.349986359265218};

// Google Sheets CSV link (Publish to web → CSV)
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR00B6HxmGhC0bhhGIp3bEMt-mcvu1Tb185GvmlR2_sGsGth6Bwb3cr0F0Y7cXFg0WiQC6PTY4oJC8Q/pub?gid=0&single=true&output=csv";

// Interpoleeri kahe punkti vahel
function interpolatePosition(start, end, progress) {
  return {
    lat: start.lat + progress * (end.lat - start.lat),
    lng: start.lng + progress * (end.lng - start.lng)
  };
}

// Arvuta edenemise positsioon
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

// Kaardi initsialiseerimine
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: {lat: 54, lng: 15}
  });

  // Lae CSV
  fetch(sheetUrl)
    .then(res => res.text())
    .then(data => {
      console.log("Raw CSV:", data);

      // CSV ridade parsimine (TAB eraldaja)
      const rows = data.split("\n").map(r => r.split("\t"));
      console.log("Parsed rows:", rows);

      // Jäta päis vahele
      rows.slice(1).forEach(row => {
        if (row.length < 2) {
          console.log("Vahele jäetud rida:", row);
          return;
        }

        const team = row[0].trim();
        const kmRaw = row[1] ? row[1].trim() : "";
        const km = parseFloat(kmRaw.replace(",", "."));

        console.log("Team:", team, "KM:", km);

        if (!isNaN(km) && team) {
          const pos = getPosition(km);
          console.log("Marker positsioon:", pos);

          new google.maps.Marker({
            position: pos,
            map,
            title: `${team}: ${km} km`
          });
        }
      });
    })
    .catch(err => console.error("CSV laadimise viga:", err));
}
