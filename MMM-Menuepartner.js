/*
global Module, Log
*/
Module.register("MMM-Menuepartner", {
  // Module config defaults.
  // Make all changes in your config.js file
  defaults: {
    accountNumber: "",
    password: ""
  },

  // Override dom generator.
  getDom: function () {
    // styled table wrapper for the lunch options
    var table = document.createElement("table");
    table.style.maxWidth = "300px";
    table.style.color = "white";
    table.classList.add("xsmall");

    // for each entry add styled table row
    if (this.lunchPlan.length !== 0) {
      this.lunchPlan.forEach(function (lunchOption) {
        var tableRow = document.createElement("tr");
        tableRow.style.verticalAlign = "top";

        // display order status (checked = ordered, unchecked = not orderded)
        var tableCellOrderStatus = document.createElement("td");
        tableCellOrderStatus.innerHTML = lunchOption.orderPlaced
          ? '<i class="fa fa-solid fa-check"></i>'
          : "▢";
        tableCellOrderStatus.style.textAlign = "left";
        tableCellOrderStatus.style.width = "1.3rem";
        tableRow.appendChild(tableCellOrderStatus);

        // display ID of the lunch option (e.g. Menu 1), next to its ingredients
        var tableCellLunchOption = document.createElement("td");
        tableCellLunchOption.innerHTML =
          lunchOption.menuId + " - " + lunchOption.menuName;
        tableCellLunchOption.style.textAlign = "left";
        tableRow.appendChild(tableCellLunchOption);

        table.appendChild(tableRow);
      });
    } else {
      // otherwise indicate that there are no lunch options loaded yet
      table.innerHTML +=
        '<tr><td><ul><li style="list-style-position:inside; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Lade Daten...</li></ul></td></tr>';
    }

    return table;
  },

  // Override header generator to include dates
  getHeader: function () {
    // check if lunch plan was already loaded
    if (this.date) {
      var date = new Date(this.date);
      // amend default header with date for which the lunch plan is shown
      return (
        this.data.header +
        ' für <span style="color: white">' +
        date.getDate() +
        "." +
        (date.getMonth() + 1) +
        ".</span>"
      );
    }
    // otherwise show default header
    else {
      return this.data.header;
    }
  },

  // Override notification handler to react to notifications sent by
  // node_helper.js (backend)
  socketNotificationReceived: function (notification, payload) {
    // upon retrieval of lunch plan from the backend update internal state and
    // display
    if (notification === "LUNCHPLAN_FETCHED_" + this.config.id) {
      this.lunchPlan = payload.lunchPlan;
      this.date = Date.parse(payload.date);
      Log.info(
        this.name +
          " received schedule with " +
          this.lunchPlan.length +
          " lunch options for " +
          this.date +
          "."
      );

      this.updateDom();
    }
  },

  // Override start function to initialize state, check configuration, and setup
  // refersh interval
  start: function () {
    // copy module object to be accessible in callbacks
    var self = this;

    // start with empty lunch plan
    self.lunchPlan = [];

    // check configuration
    if (self.validateConfig()) {
      // update lunch plan every 15 minutes
      var refreshFunction = function () {
        self.sendSocketNotification("FETCH_LUNCHPLAN", self.config);
      };
      refreshFunction();
      setInterval(refreshFunction, 15 * 60 * 1000);
    }
  },

  // validate configuration parameters: 'accountNumber' and 'password'
  validateConfig: function () {
    var self = this;

    // in case there are multiple instances of this module, ensure the responses from node_helper are mapped to the correct module
    self.config.id = this.identifier;

    // validate accountNumber is set
    if (
      self.config.accountNumber === undefined ||
      self.config.accountNumber === ""
    ) {
      Log.error(
        `${self.name} - configuration parameter accountNumber is invalid.`
      );
      return false;
    }

    // validate password is set
    if (self.config.password === undefined || self.config.password === "") {
      Log.error(`${self.name} - configuration parameter password is invalid.`);
      return false;
    }

    return true;
  }
});
