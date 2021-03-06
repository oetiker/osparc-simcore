/* ************************************************************************

   qxapp - the simcore frontend

   https://osparc.io

   Copyright:
     2018 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

/* global SVG */
/* eslint new-cap: [2, {capIsNewExceptions: ["SVG", "M", "C"]}] */

/**
 * @asset(workbench/svg.*js)
 * @ignore(SVG)
 */

/**
 * A qooxdoo wrapper for
 * <a href='https://github.com/svgdotjs/svg.js' target='_blank'>SVG</a>
 */

qx.Class.define("qxapp.wrapper.Svg", {
  extend: qx.core.Object,

  statics: {
    NAME: "svg.js",
    VERSION: "2.6.4",
    URL: "https://github.com/svgdotjs/svg.js"
  },

  construct: function() {
  },

  properties: {
    libReady: {
      nullable: false,
      init: false,
      check: "Boolean"
    }
  },

  events: {
    "svgLibReady": "qx.event.type.Data"
  },

  members: {
    init: function() {
      // initialize the script loading
      let svgPath = "workbench/svg.js";
      let svgPathPath = "workbench/svg.path.js";
      let dynLoader = new qx.util.DynamicScriptLoader([
        svgPath,
        svgPathPath
      ]);

      dynLoader.addListenerOnce("ready", e => {
        console.log(svgPath + " loaded");
        this.setLibReady(true);
        this.fireDataEvent("svgLibReady", true);
      }, this);

      dynLoader.addListener("failed", e => {
        let data = e.getData();
        console.error("failed to load " + data.script);
        this.fireDataEvent("svgLibReady", false);
      }, this);

      dynLoader.start();
    },

    createEmptyCanvas: function(id) {
      return SVG(id);
    },

    drawCurve: function(draw, controls, linkWidth = 3, portSphereDiameter = 4, arrowSize = 4) {
      const linkColor = qxapp.theme.Color.colors["workbench-link-comp-active"];

      let path = draw.path()
        .M(controls[0].x, controls[0].y)
        .C(controls[1], controls[2], controls[3])
        .fill("none")
        .stroke({
          width: linkWidth,
          color: linkColor
        });

      let marker1 = draw.marker(portSphereDiameter, portSphereDiameter, function(add) {
        add.circle(portSphereDiameter)
          .fill(linkColor);
      });
      path.marker("start", marker1);

      let marker2 = draw.marker(arrowSize, arrowSize, function(add) {
        add.path("M 0 0 V 4 L 2 2 Z")
          .fill(linkColor)
          .size(arrowSize, arrowSize);
      });
      path.marker("end", marker2);

      path.markers = [marker1, marker2];

      return path;
    },

    updateCurve: function(curve, controls) {
      if (curve.type === "path") {
        let mSegment = curve.getSegment(0);
        mSegment.coords = [controls[0].x, controls[0].y];
        curve.replaceSegment(0, mSegment);

        let cSegment = curve.getSegment(1);
        cSegment.coords = [controls[1].x, controls[1].y, controls[2].x, controls[2].y, controls[3].x, controls[3].y];
        curve.replaceSegment(1, cSegment);
      }
    },

    removeCurve: function(curve) {
      if (curve.type === "path") {
        curve.remove();
      }
    },

    updateColor: function(curve, color) {
      if (curve.type === "path") {
        curve.attr({
          stroke: color
        });
        if (curve.markers) {
          curve.markers.forEach(markerDiv => {
            markerDiv.node.childNodes.forEach(node => {
              node.setAttribute("fill", color);
            });
          });
        }
      }
    }
  }
});
