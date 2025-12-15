// Koordinaadid
const tartu = {lat: 58.37307488694068, lng: 26.726976347863893};
const brussel = {lat: 50.844990391302076, lng: 4.349986359265218};

// Google Sheets CSV link
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR00B6HxmGhC0bhhGIp3bEMt-mcvu1Tb185GvmlR2_sGsGth6Bwb3cr0F0Y7cXFg0WiQC6PTY4oJC8Q/pub?gid=0&single=true&output=csv";

let map;
let directionsService;
let directionsRenderer;
let route = [];
let totalPoints = 0;
const teamMarkers = {}; // hoiame markerid võistkondade kaupa

// Hajutamise funktsioon (et lõpp-punktis markerid ei kattuks)
function jitterPosition(basePos, index) {
  const offset = 0.0005; // ~50m nihke
  return {
    lat: basePos.lat + offset * Math.cos(index * 2 * Math.PI / 10),
    lng: basePos.lng + offset * Math.sin(index * 2 * Math.PI / 10)
  };
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: tartu
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  // Pärime teekonna Tartu -> Brüssel
  directionsService.route(
    {
      origin: tartu,
      destination: brussel,
      travelMode: google.maps.TravelMode.DRIVING
    },
    (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);

        route = result.routes[0].overview_path;
        totalPoints = route.length;

        // Lae CSV
        fetch(sheetUrl)
          .then(res => res.text())
          .then(data => {
            const rows = data.trim().split("\n");
            const select = document.getElementById("teamSelect");

            rows.slice(1).forEach((line, idx) => {
              const clean = line.replace(/\r/g, "").replace(/"/g, "");
              const parts = clean.split(",");
              if (parts.length < 2) return;

              const team = parts[0].trim();
              const kmRaw = parts[1].trim();
              const km = parseFloat(kmRaw.replace(",", "."));

              if (!isNaN(km)) {
                let pos;
                if (km >= 4150) {
  // Kohale jõudnud – hajutame lõpp-punktis
  const endPos = route.length > 0 ? route[route.length - 1] : brussel;
  pos = jitterPosition(endPos, idx);
} else if (km <= 2000) {
  // Brüsseli suunal
  const progress = km / 2000;
  const routeIdx = Math.floor(progress * totalPoints);
  pos = route[Math.min(routeIdx, totalPoints - 1)];
} else {
  // Tagasitee
  const backProgress = (km - 2000) / 2000;
  const routeIdx = Math.floor((1 - backProgress) * totalPoints);
  pos = route[Math.min(routeIdx, totalPoints - 1)];
}


                // Markerite värv
                const iconColor = km > 4150
                  ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                  : km <= 2000
                    ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    : "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

                const marker = new google.maps.Marker({
                  position: pos,
                  map,
                  title: `${team}: ${km} km`,
                  icon: iconColor
                });

                teamMarkers[team] = marker;

                // Lisa võistkond dropdowni
                const option = document.createElement("option");
                option.value = team;
                option.textContent = team;
                select.appendChild(option);

                // InfoWindow klikil
                const infoWindow = new google.maps.InfoWindow({
                  content: `<strong>${team}</strong><br>${km} km`
                });
                marker.addListener("click", () => {
                  infoWindow.open(map, marker);
                });
              }
            });

            // Dropdown sündmus
            select.addEventListener("change", function() {
              const team = this.value;
              if (team && teamMarkers[team]) {
                const marker = teamMarkers[team];
                map.setCenter(marker.getPosition());
                map.setZoom(10);
              }
            });
          })
          .catch(err => console.error("CSV laadimise viga:", err));
      } else {
        console.error("DirectionsService viga:", status);
      }
    }
  );

  // Legend HTML
  const legend = document.createElement("div");
  legend.id = "legend";
  legend.style.background = "#fff";
  legend.style.padding = "10px";
  legend.style.margin = "10px";
  legend.style.fontSize = "14px";
  legend.style.fontFamily = "Arial, sans-serif";
  legend.style.border = "1px solid #ccc";

  // Legendisisu
  legend.innerHTML = `
    <h3>Legend</h3>
    <p><img src="http://maps.google.com/mapfiles/ms/icons/red-dot.png"> Suund Brüsselisse</p>
    <p><img src="http://maps.google.com/mapfiles/ms/icons/green-dot.png"> Suund tagasi</p>
    <p><img src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"> Kohale jõudnud</p>
    <p>Võistkonna nimi ja distants on nähtav kursori markeril hoidmisel</p>
  `;

  // Lisa legend kaardile (paremale alla)
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
}
