document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const playerId = params.get("playerId");

  const {fullName, dateOfBirth, country, photoUrl, history} = JSON.parse(localStorage.getItem(`MY-CV-${playerId}`));

  const personalData = document.getElementById("personal-data");
  const image = personalData.querySelector("img");
  image.setAttribute("src", localStorage.getItem(photoUrl) || photoUrl);
  image.setAttribute("alt", `Foto de perfil de ${fullName}`);

  personalData.querySelector("dt#name-term+dd").textContent = fullName;
  personalData.querySelector("dt#date-of-birth-term+dd").textContent = dateOfBirth;
  personalData.querySelector("dt#country-term+dd").textContent = country;

  const historyData = history.reduce((acc, cur) => {
      const dd = document.createElement("dd");
      dd.textContent = `[${cur.sport}] ${cur.club} - ${cur.category}`;

      return {
        ...acc,
        [cur.season]: [...(acc[cur.season] || []), dd]
      }
    }, {});

    const terms = Object.keys(historyData).map(k => {
      const dt = document.createElement("dt");
      dt.textContent = k;
      
      return [dt, ...historyData[k]];
    });

    document.querySelector("#club-history > dl").append(...terms.flat());
});
