
[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/thobach/MMM-Menuepartner/blob/main/LICENSE)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![Vulnerabilities](https://snyk.io/test/github/thobach/MMM-Menuepartner/badge.svg?)](https://snyk.io/test/github/thobach/MMM-Menuepartner)
[![Build Status](https://app.travis-ci.com/thobach/MMM-Menuepartner.svg?branch=main)](https://app.travis-ci.com/thobach/MMM-Menuepartner)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/thobach/MMM-Menuepartner.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/thobach/MMM-Menuepartner/context:javascript)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/thobach/MMM-Menuepartner.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/thobach/MMM-Menuepartner/alerts/)

# MMM-Menuepartner
MMM-Menuepartner is a 3rd party module for [MagicMirror](https://github.com/MichMich/MagicMirror) that shows the current/next day's school lunch options for schools in Germany that are served by lunch provider Menüpartner.

The idea of this module is to display a current or next day's (depending on the time) lunch options, to let the child know what's for lunch, if lunch was already ordered and if yes, which option. This helps as a reminder, e.g. if the child needs to bring extra food to school for lunch, or needs lunch money. It also helps as a reminder to cancel the order in case of sick-leave. While there is a website and mobile app from the vendor, this module gives more convenience as one doesn't need to pull out the phone from the pocket, unlock it, open the app, etc.

Screenshot of this MMM-Menuepartner module:

<img src="/screenshots/menuepartner%20magic%20mirror%20module.png?raw=true" width="200" alt="Screenshot of the MMM-Menuepartner module" />


## Functionality
* Display the current day's lunch options, or next day's options after 2pm
* Update contents every 15 minutes

## Preparation
In order to configure this module, you'll need some credentials from Menüpartner. They are the same as the ones needed to use the Menüpartner website or app: account number and password.

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/thobach/MMM-Menuepartner.git`.
2. Install dependencies via: `cd MMM-Menuepartner && npm install`
3. In order to load the MMM-Menuepartner module you will need to add the following configuration to your `config/config.js` file. As `accountNumber` you need the account number provided by Menüpartner (same as you use for the mobile app), as `password` you need to provide your Menüpartner password.
```javascript
modules: [
  {
    module: 'MMM-Menuepartner',
    position: 'top_left',	// This can be any of the regions. Best results in left or right regions.
    header: 'Essensplan', // This is optional
    config: {
      accountNumber: '12345678', // your Menüpartner account number
      password: '' //  your Menüpartner password
    }
  },
]
```
