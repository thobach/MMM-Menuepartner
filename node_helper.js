/*
  Node Helper module for MMM-Menuepartner

  Purpose: Fetch latest lunch plan on a regular basis and return to user
  interface.
*/
var NodeHelper = require("node_helper");
const Log = require("logger");
const { getWeek, addDays, format } = require("date-fns");

module.exports = NodeHelper.create({
  // override start function
  start: function () {
    Log.info(`${this.name} node_helper started ...`);
  },

  // override socketNotificationReceived to react to notifications of type
  // 'FETCH_LUNCHPLAN'
  socketNotificationReceived: function (notification, config) {
    if (notification === "FETCH_LUNCHPLAN") {
      // get access token and pass on to get lunch plan, result is sent to
      // front-end via a notification
      this.getBearerToken(config, this.getLunchPlan);
    } else {
      Log.warn(`${this.name} - did not process event: ${notification}`);
    }
  },

  // get access token to authenticate further requests
  getBearerToken: function (config, callback) {
    // copy context to be available inside callbacks
    const self = this;

    // get access token
    var tokenUrl = "https://mpibs.de/skitbs-rest/rest/skitbs_mobile/v1/auth";
    const form = new URLSearchParams();
    form.append("login", config.accountNumber);
    form.append("pwd", config.password);

    fetch(tokenUrl, {
      method: "POST",
      body: form
    })
      .then(self.checkFetchStatus)
      .then((response) => response.json())
      .then(self.checkBodyError)
      .then((authJson) => {
        callback(authJson.token, self, config);
      })
      .catch((error) => {
        self.logError("Unable to get access token. " + error);
      });
  },

  // get lunch plan, using valid access token, and notify front-end via
  // socket notification
  getLunchPlan: function (accessToken, self, config) {
    let now = new Date();

    // switch to next day after 2pm, assuming school is over then and only
    // insterested in the next day
    if (now.getHours() >= 14) {
      now = addDays(now, 1);
    }

    // not interested in Saturday schedule -> Monday
    if (now.getDay() === 6) {
      now = addDays(now, 2);
    }

    // not interested in Sunday schedule -> Monday
    if (now.getDay() === 0) {
      now = addDays(now, 1);
    }

    // get lunch plan for the current/next day
    // URL format asks for year/week-number/1 and returns lunch plan for the
    // whole week incl. order state
    var lunchPlanUrl =
      "https://mpibs.de/skitbs-rest/rest/skitbs_mobile/v1/orderplaceholders/" +
      format(now, "yyyy") +
      "/" +
      (getWeek(now) - 1) +
      "/1";

    fetch(lunchPlanUrl, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken
      }
    })
      .then(self.checkFetchStatus)
      .then((response) => response.text())
      .then(self.checkBodyError)
      .then((str) => {
        Log.info(`${self.name} got lunch plan for week of day ${now}`);
        const dataAsJson = JSON.parse(str);
        const menues = dataAsJson.orderPlaceholder;
        const lunchPlan = [];
        menues.forEach((menue) => {
          // filter out lunch options for the desired day of the week
          if (menue.serviceDay.startsWith(format(now, "yyyy-MM-dd"))) {
            lunchPlan.push({
              menuId: menue.menuLineDesignation,
              menuName: menue.menuName,
              mealType: menue.mealType,
              orderPlaced: menue.orderPlaced
            });
          }
        });
        Log.info(`${self.name} lunch plan has ${lunchPlan.length} options`);
        // notify front-end of lunch plan
        var payload = {
          lunchPlan: lunchPlan,
          date: now
        };
        self.sendSocketNotification(`LUNCHPLAN_FETCHED_${config.id}`, payload);
      })
      .catch((error) => {
        self.logError("Unable to get lunch plan. " + error);
      });
  },

  // evalute if HTTP status is success, otherwise throw error
  checkFetchStatus: function (response) {
    if (response.ok) {
      return response;
    } else {
      throw Error(
        `Failed calling '${response.url}' as it resulted in status: '${response.statusText}', HTTP status code: '${response.status}'.`
      );
    }
  },

  // evalute if HTTP body contains no error message, otherwise throw error
  checkBodyError: function (json) {
    if (json && json.error) {
      throw Error(
        `Response body contained error '${json.error}' ${JSON.stringify(json)}`
      );
    }
    return json;
  },

  // log error to console
  logError: function (error) {
    Log.error(`${this.name}: ${error}`);
  }
});
