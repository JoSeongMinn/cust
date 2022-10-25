sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent) {
        "use strict";

        return Controller.extend("sap.sync.odata.controller.View6", {
            onInit: function () {

            },
	
            getRouter: function () {
                return UIComponent.getRouterFor(this);
            },

            onNavFirst: function () {
                this.getRouter().navTo("Login", {}, true);
            }

        });
    });
