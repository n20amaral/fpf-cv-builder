document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const fullName = params.get("fullName");

  loadPlayerList(await fetchPlayers(fullName));

  for (const button of document.getElementsByTagName("button")) {
    button.addEventListener("click", goToNextPage);
  }
});

const fetchPlayers = async (name) => {
  const lastTS = parseInt(localStorage.getItem(`MY-SEARCH-${name.toLowerCase()}-TS`), 10);
  const currentTS = new Date().getTime();

  if(!isNaN(lastTS) && currentTS - lastTS < (24 * 60 * 60 * 1000)) {
    const searchCache = localStorage.getItem(`MY-SEARCH-${name.toLowerCase()}`);
    if(searchCache) {
      return JSON.parse(searchCache);
    }
  }

  const allPlayers = [];
  let currentPage = 1;
  let playersTotal;

  while (playersTotal === undefined || allPlayers.length < playersTotal) {
    const response = await fetch(
      `https://fpf-proxy-server.azurewebsites.net/api/search?url=${encodeURIComponent(
        "DesktopModules/MVC/SearchPlayers/Default/GetInternalPlayers"
      )}`,
      {
        method: "POST",
        headers: [
          ["x-content-type", "application/json"],
          ["x-moduleid", 503],
          ["x-tabid", 150],
        ],
        body: JSON.stringify({
          filter: {
            PlayerName: name,
            Page: currentPage,
          },
        }),
      }
    );

    const data = await response.json();
    allPlayers.push(...data.Result);
    playersTotal = data.Total;
    currentPage++;
  }

  localStorage.setItem(`MY-SEARCH-${name.toLowerCase()}`, JSON.stringify(allPlayers));
  localStorage.setItem(`MY-SEARCH-${name.toLowerCase()}-TS`, new Date().getTime());

  return allPlayers;
};

const loadPlayerList = (players) => {
  const items = players.map((p, i) => {
    const li = document.createElement("li");
    
    const radio = document.createElement("input");
    radio.setAttribute("id", `player-pick-${i}`);
    radio.setAttribute("type", "radio");
    radio.setAttribute("name", "playerId");
    radio.setAttribute("value", p.Id);
    radio.addEventListener("change", onRadioCheck);

    const label = document.createElement("label");
    label.setAttribute("for", `player-pick-${i}`);
    label.textContent = `${p.ShortDescription} (${p.ClubName}) [${p.FootballType}]`;
    
    li.append(radio, label);
    return li;
  });

  document.querySelector("div.loading").remove();
  document.getElementById("new-cv")?.removeAttribute("disabled");
  document.getElementById("player-list").append(...items);
};

const goToNextPage = ({ target }) => {
  let url = "edit-your-data.html";

  if (target.id !== "new-cv") {
    const playerId = document
      .querySelectorAll('input[name="playerId"]:checked')[0]
      ?.getAttribute("value");

    url += playerId ? `?playerId=${playerId}` : "";
  }

  window.location.href = url;
};

const onRadioCheck = () => {
  document.querySelector('button[disabled]')?.removeAttribute("disabled");
}
