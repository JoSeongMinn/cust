sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "sap/sync/odata/model/models",
        "sap/ui/model/json/JSONModel"
    ],
    function (UIComponent, Device, models, JSONModel) {
        "use strict";

        return UIComponent.extend("sap.sync.odata.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                var oData = {
                    sPlant      : null,
                    sCheckIn    : null,
                    sCheckOut   : null,
                    sDateInfo   : null,
                    oDateInfo   : [],
                    iWeekDay    : 0,
                    iWeekendDay : 0,
                    iHoliday    : 0,
                    iAdultNum   : 1,
                    iChildNum   : 0,  
                    iBabyNum    : 0,                    
                    sNumInfo    : null,
                    oRoomInfo   : [],

                    sRoomClass  : null,
                    sRoomId     : null,
                    sRoomType   : null,
                    sTypeInfo   : null,
                    sRoomSize   : null,
                    sPrice      : null
                };
                this.setModel(new JSONModel(oData), "InputData");

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            }
        });
    }
);