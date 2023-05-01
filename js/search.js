document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const fullName = params.get("fullName");
  const response = await fetch(
    `http://localhost:7071/api/search?url=${encodeURIComponent(
      "DesktopModules/MVC/SearchPlayers/Default/GetInternalPlayers"
    )}`,
    {
      method: "POST",
      headers: [
        ["px-Content-Type", "application/json"],
        ["px-moduleid", 503],
        ["px-tabid", 150],
      ],
      body: JSON.stringify({
        filter: {
          PlayerName: fullName,
        },
      }),
    }
  );

  const data = await response.json();
  loadPlayerList(data.Result);

  for (const button of document.getElementsByTagName("button")) {
    button.addEventListener("click", goToNextPage);
  }
});

const loadPlayerList = (players) => {
  const items = players.map((p, i) => {
    const li = document.createElement("li");
    const radio = document.createElement("input");
    radio.setAttribute("id", `player-pick-${i}`);
    radio.setAttribute("type", "radio");
    radio.setAttribute("name", "playerId");
    radio.setAttribute("value", p.Id);
    const label = document.createElement("label");
    label.setAttribute("for", `player-pick-${i}`);
    label.textContent = `${p.ShortDescription} (${p.ClubName}) [${p.FootballType}]`;
    li.append(radio, label);
    return li;
  });

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
