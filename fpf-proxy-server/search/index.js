const axios = require("axios");

module.exports = async function (context, req) {
  // const targetUrl = "https://www.fpf.pt/DesktopModules/MVC/SearchPlayers/Default/GetInternalPlayers";

  const targetUrl = `https://www.fpf.pt/${req.query.url}`;

  const headers = Object.keys(req.headers)
    .filter((k) => k.startsWith("px-"))
    .reduce(
      (acc, cur) => ({
        ...acc,
        [cur.slice(3)]: req.headers[cur],
      }),
      {}
    );

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers,
      data: req.body,
    });

    context.res = {
      status: response.status,
      headers: { "Content-Type": response.headers["content-type"] },
      body: response.data,
    };
  } catch (error) {
    context.res = {
      status: error.response.status,
      body: error.message,
    };
  }
};
