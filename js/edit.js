

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const playerId = params.get("playerId");

  let player = {};
  if (playerId) {
    player = await getPlayerData(playerId);
    loadFormData(player);
  }

  addAllEventListeners(player);
});

const getPlayerData = async (playerId) => {
  const response = await fetch(
    `https://fpf-proxy-server.azurewebsites.net/api/search?url=${encodeURIComponent(
      "pt/Jogadores/Ficha-de-Jogador/playerId/"
    )}${playerId}`
  );

  // parse the player page from response body
  const playerPage = new DOMParser().parseFromString(
    await response.text(),
    "text/html"
  );
  // extract the script where the player object is declared
  const script = [...playerPage.querySelectorAll("script")].find((s) =>
    s.textContent.includes(`${playerId}`)
  );
  // get the line 4 there the object is assign to a variable
  const line4 = script.textContent.split("\n")[3];
  // extract the player object declared as json
  const json = line4
    .slice(line4.indexOf("{"), line4.length - 1)
    .replace("\\", "");

  const playerData = JSON.parse(json);

  return {
    fullName: playerData.FullName,
    dateOfBirth: convertFullDateToString(playerData.BirthDate),
    country: playerData.Nationality,
    photoUrl: playerData.Image.startsWith("/")
      ? "assets/placeholder_Male.png"
      : playerData.Image,
    history: playerData.Clubs.map((c) => ({
      season: c.Season,
      sport: c.SportTypeName.toLowerCase(),
      club: c.Name,
      category: (c.FootballClassName.indexOf("(") > 0
        ? c.FootballClassName.slice(0, c.FootballClassName.indexOf("("))
        : c.FootballClassName
      ).toLowerCase(),
    })),
  };
};

const loadFormData = (player) => {
  document.getElementById("full-name").value = player.fullName;
  document.getElementById("date-of-birth").value = player.dateOfBirth;
  document.getElementById("country").value = player.country;

  document.getElementById("photo").setAttribute("src", player.photoUrl);

  const rows = player.history.map((c) => {
    const row = document.querySelector(".history-record:first-child").cloneNode(true);
    const [season, sport, club, category] = row.getElementsByTagName("td");

    season.querySelector('input[type="number"]').value = c.season.split("-")[0];
    season.querySelector('input[type="text"]').value = c.season
      .split("-")[1]
      .slice(-2);
    season.querySelector('input[type="hidden"]').value = c.season;

    [...sport.getElementsByTagName("option")]
      .find((o) => o.textContent.toLowerCase() === c.sport)
      .setAttribute("selected", true);

    club.firstElementChild.value = c.club;

    [...category.getElementsByTagName("option")]
      .find((o) => o.value === c.category)
      .setAttribute("selected", true);

    return row;
  });

  document.getElementById("history-container").prepend(...rows);
};

const convertFullDateToString = (fullDate) => {
  const dateParts = fullDate.split(" de ");
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  dateParts[1] = months.findIndex((m) => m === dateParts[1].toLowerCase());

  return new Date(...dateParts.reverse()).toISOString().split("T")[0];
};

const addAllEventListeners = (player) => {
  document.getElementById("create-cv-form").addEventListener("submit", () => {
    localStorage.setItem("MY-CV", JSON.stringify(player));
  });

  document.querySelectorAll('.history-record > td:first-child > input[type="number"]').forEach(e => 
    e.addEventListener("change", ({target}) => {
      const seasonEnd = target.nextElementSibling;
      const fullSeason = seasonEnd.nextElementSibling;
      const nextYear = `${Number(target.value) + 1}`;
      seasonEnd.value = nextYear.length > 2 ? nextYear.slice(-2) : nextYear;
      fullSeason.value = `${target.value}-${seasonEnd.value}`;
    }));
}