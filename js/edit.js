let playerId;
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  playerId = params.get("playerId");

  let player = {};
  if (playerId) {
    player = await getPlayerData();
    loadFormData(player);
  } else {
    playerId = new Date().getTime();
  }

  addAllEventListeners();
});

const getPlayerData = async () => {
  const lastTS = parseInt(localStorage.getItem(`MY-CV-${playerId}-TS`), 10);
  const currentTS = new Date().getTime();
  
  if(!isNaN(lastTS) && currentTS - lastTS < 60 * 60 * 100) {
    return JSON.parse(localStorage.getItem(`MY-CV-${playerId}`));
  }

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

  document.getElementById("photo").setAttribute("src", localStorage.getItem(player.photoUrl) || player.photoUrl);

  const rows = player.history.map((c) => {
    const row = createNewRecord();
    const [season, sport, club, category] = row.getElementsByTagName("td");

    season.querySelector('input[type="number"]').value = c.season.split("-")[0];
    season.querySelector('input[type="text"]').value = c.season
      .split("-")[1]
      .slice(-2);
    season.querySelector('input[type="hidden"]').value = c.season;
    sport.querySelector("select").value = c.sport;
    club.firstElementChild.value = c.club;
    category.querySelector("select").value = c.category;

    return row;
  });

  document.getElementById("history-container").replaceChildren(...rows);
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

const addAllEventListeners = () => {
  document.getElementById("photo-file").addEventListener("change", onPhotoSelect);

  document.getElementById("create-cv-form").addEventListener("submit", onFormSubmit);

  document.querySelector('#club-history tfoot input[type="button"]').addEventListener("click", evt => {
    const row = createNewRecord();
    document.getElementById("history-container").append(row);
  });
}

const createNewRecord = () => {
    const row = document.querySelector(".history-record:last-child").cloneNode(true);
    row.querySelector('input[name="startYear"]').addEventListener("change", onSeasonChange);
    row.querySelector("button.remove-record").addEventListener("click", onRemoveRecord);
    const clearButton = row.querySelector("button.clear-fields");
    clearButton.addEventListener("click", onClearFields);
    clearButton.click();
    
    return row;
}

const onSeasonChange = ({target}) => {
  const seasonEnd = target.nextElementSibling;
  const fullSeason = seasonEnd.nextElementSibling;
  const nextYear = `${Number(target.value) + 1}`;
  seasonEnd.value = nextYear.length > 2 ? nextYear.slice(-2) : nextYear;
  fullSeason.value = `${target.value}-${seasonEnd.value}`;
};

const onRemoveRecord = evt => {
  evt.preventDefault();
  evt.target.parentElement.parentElement.remove();
}

const onClearFields = evt => {
  evt.preventDefault();
  const row = evt.target.parentElement.parentElement;
  row.querySelectorAll("input").forEach(i => i.value = "");
  row.querySelectorAll("select").forEach(s => s.value = "");
};

const onFormSubmit = evt => {
  evt.preventDefault();
  const formData = new FormData(evt.target);

    const playerData = [...formData.entries()]
      .reduce((acc, [key, value]) => {
        // non-array fields
        if(!key.includes("[]")) {
          return { ...acc, [key]: value};
        }
      
        const [prefix, prop] = key.split("[]");
        const allValues = formData.getAll(key);

        // first of all fields
        if(!acc[prefix]) {
          return { ...acc, [prefix]: allValues.map(v => ({[prop]: v})) };
        }

        // field already been processed
        if(acc[prefix].some(item => item.hasOwnProperty(prop)))
        {
          return acc;
        }

        // get all values for field
        return {
          ...acc,
          [prefix]: acc[prefix].map((item, i) => ({...item, [prop]: allValues[i]}))
        }
      }, {});

      playerData.photoUrl = playerData.photoFile.name || document.getElementById("photo").getAttribute("src");

      localStorage.setItem(`MY-CV-${playerId}`, JSON.stringify(playerData));
      localStorage.setItem(`MY-CV-${playerId}-TS`, new Date().getTime());
      
      window.location.href = `${evt.target.getAttribute("action")}?playerId=${playerId}`;
}

const onPhotoSelect = ({target}) => {
  const image = document.getElementById("photo");
  const file = target.files[0];
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    image.setAttribute("src", reader.result);
    localStorage.setItem(file.name, reader.result);
  }, false);

  if(file) {
    reader.readAsDataURL(file);
  }
}