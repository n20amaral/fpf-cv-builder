const axios = require("axios");

module.exports = async function (context, req) {
  const targetUrl = "https://www.fpf.pt/DesktopModules/MVC/SearchPlayers/Default/GetInternalPlayers";

  try {
    const response = await axios.post(targetUrl, req.body, {
      headers: { 
        "Content-Type": "application/json",
        "moduleid": 503,
        "tabid": 150 
    },
    });
    context.res = {
      status: response.status,
      headers: { "Content-Type": "application/json" },
      body: response.data,
    };
  } catch (error) {
    context.res = {
      status: error.response.status,
      body: error.message,
    };
  }
};
