fetch(sheetUrl)
  .then(res => res.text())
  .then(data => {
    console.log("Raw CSV:", data);

    // Kasuta koma eraldajaks
    const rows = data.split("\n").map(r => r.split(","));
    console.log("Parsed rows:", rows);

    rows.slice(1).forEach(row => {
      if (row.length < 2) {
        console.log("Vahele jäetud rida:", row);
        return;
      }

      const team = row[0].replace(/"/g, "").trim();
      const kmRaw = row[1] ? row[1].replace(/"/g, "").trim() : "";
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
