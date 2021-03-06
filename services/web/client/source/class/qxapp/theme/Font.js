/* ************************************************************************

   qxapp - the simcore frontend

   https://osparc.io

   Copyright:
     2018 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Tobias Oetiker (oetiker)
     * Odei Maiz (odeimaiz)

************************************************************************ */

qx.Theme.define("qxapp.theme.Font", {
  extend: osparc.theme.osparcdark.Font,

  fonts: {
    "nav-bar-label": {
      size: 20,
      family: ["Roboto"],
      color: "text",
      bold: true
    },

    "title-16": {
      size: 16,
      family: ["Roboto"],
      color: "text",
      bold: true
    },

    "title-14": {
      size: 14,
      family: ["Roboto"],
      color: "text",
      bold: true
    },

    "text-14": {
      size: 14,
      family: ["Roboto"],
      color: "text"
    },

    "title-12": {
      size: 12,
      family: ["Roboto"],
      color: "text",
      bold: true
    },

    "text-12": {
      size: 12,
      family: ["Roboto"],
      color: "text"
    }
  }
});
