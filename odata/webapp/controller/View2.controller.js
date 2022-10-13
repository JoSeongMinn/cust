sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator", 
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, History, UIComponent, Filter, FilterOperator, MessageToast) {
        "use strict";

        return Controller.extend("sap.sync.odata.controller.View2", {
            onInit: function () {
                var oData = {
                    oRoomData : [],
                    oRoomType : [],
                    oBedType  : [],
                    oViewType : [],
                    oSample: [
                        {  Bedtype : "Single", Classtp : "Standard Single", Price : "1,111 원",
                            Rmsize : "24㎡",   Roomtp  : "SSTSGC",         Viewtp : "City View" },

                        {  Bedtype : "Double", Classtp : "Standard",       Price : "1,11100 원",
                            Rmsize : "28㎡",   Roomtp  : "SSTDBM",         Viewtp : "Mountain View" },

                        {  Bedtype : "Twin", Classtp : "Standard",         Price : "1,11100 원",
                            Rmsize : "28㎡",   Roomtp  : "SSTTWC",         Viewtp : "City View" }
                    ],
                    sRoomClass: null,
                    sRoomId   : null,
                    sRoomNo   : null,
                    sRoomType : null,
                    sTypeInfo : null,
                    sRoomSize : null,
                    sPrice    : null,
                    bEnabled  : false
                }
                var oRouter = this.getRouter();
                var oDataModel = new JSONModel(oData);
                this.getView().setModel(oDataModel, "view2");

	            oRouter.getRoute("View2").attachMatched(this._onRouteMatched, this);
                
                this.oExpandedStatus = this.getView().byId("expandedStatus");
                this.oSnappedStatus = this.getView().byId("snappedStatus");
                this.oFilterBar = this.getView().byId("filterbar");
                this.oTable = this.getView().byId("table");

                this.oFilterBar.registerFetchData(this._fetchData);
                this.oFilterBar.registerApplyData(this._applyData);
                this.oFilterBar.registerGetFiltersWithValues(this._getFiltersWithValues);
            },
	
            getRouter: function () {
                return UIComponent.getRouterFor(this);
            },

            onNavBack: function () {
                var oHistory, sPreviousHash;
    
                oHistory = History.getInstance();
                sPreviousHash = oHistory.getPreviousHash();
                // 내가 첫 화면인지 체크하려고
    
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);  
                    // window 브라우저의 최상단 객체(화면), 브라우저의 뒤로가기
                    // 브라우저 기능 (ui5 X)

                } else {    // 내가 첫 화면인 경우(undefined), 새로고침, url직접입력
                    this.getRouter().navTo("RouteView1", {}, true); 
                    // no history 일 때 / RouteView1 뒤는 기본값이기 때문에 생략해도 작동
                }
            },

            /**
             * 페이지 이동 직후 이벤트
             */
            _onRouteMatched: function(oEvent){
                var oCompoModel = this.getOwnerComponent().getModel("InputData")
                var oModel  = this.getView().getModel();
                // var oModel2 = new sap.ui.model.json.JSONModel();
                var oView2Model = this.getView().getModel("view2");

                var test = oCompoModel.getProperty("/sPlant");
                if( test ) {
                
                    var sPlant  = oCompoModel.getProperty("/sPlant").substring(10,11),
                    sAdult  = oCompoModel.getProperty("/iAdultNum") + "",
                    iChild  = oCompoModel.getProperty("/iChildNum"),
                    iBaby   = oCompoModel.getProperty("/iBabyNum"),
                    sChild  = iChild + iBaby + "",
                    iPeriod = oCompoModel.getProperty("/oDateInfo").length,
                    sIndat  = oCompoModel.getProperty("/oDateInfo")[0],
                    sOutdat = oCompoModel.getProperty("/oDateInfo")[iPeriod-1];

                    sIndat  = sIndat.replace('-', '').replace('-', '');
                    sOutdat = sOutdat.replace('-', '').replace('-', '');

                } else {
                    var sPlant = 'S',
                        sAdult = '1',
                        sChild = '1',
                        sIndat = '20221009',
                        sOutdat = '20221011'
                }                

                var oFilter1 = new Filter("Plant",  FilterOperator.EQ, sPlant);
                var oFilter2 = new Filter("Adult",  FilterOperator.EQ, sAdult);
                var oFilter3 = new Filter("Child",  FilterOperator.EQ, sChild);
                var oFilter4 = new Filter("Indat",  FilterOperator.EQ, sIndat);
                var oFilter5 = new Filter("Outdat", FilterOperator.EQ, sOutdat);

                var aFilter  = [];

                aFilter.push(oFilter1, oFilter2, oFilter3, oFilter4, oFilter5);
                oModel.read("/MonthBookSet", {
                    filters: aFilter,
                    success: function (oData) { 
                        var data = oData; 
                        var aData = data.results;
                        var ilength = aData.length;
                        var aRoomData = {};
                        var oRoomData = [];

                        var aRoomType = {};
                        var oRoomType = [];
                        var bRoomType = true;
                        var sRmtpCheck;
                        var aBedType = {};
                        var oBedType = [];
                        var bBedType = true;
                        var sBedtpCheck;
                        var aViewType = {};
                        var oViewType = [];
                        var bViewType = true;
                        var sViewtpCheck;

                        var sClassType,
                            sBedType,
                            sViewType,
                            sRoomSize,
                            sImages;

                        for (var i=0; i<ilength; i++) {
                            switch (aData[i].Roomtp.substring(1,3)) {
                                case "ST":
                                    sClassType = "Standard";
                                    break;

                                case "DL":
                                    sClassType = "Deluxe";
                                    break;

                                case "GD":
                                    sClassType = "Grand Deluxe";
                                    break;

                                case "EC":
                                    sClassType = "Executive";
                                    break;
                            }

                            switch (aData[i].Roomtp.substring(3,5)) {
                                case "SG":
                                    sClassType = "Standard Single";
                                    sBedType = "Single";
                                    sRoomSize  = "24㎡";
                                    sImages = "../images/STSG.jpg";
                                    break;

                                case "DB":
                                    sBedType = "Double";

                                    switch (sClassType) {
                                        case "Standard":
                                            sRoomSize  = "28㎡";
                                            sImages = "../images/STDBTW.jpg";
                                            break;

                                        case "Deluxe":
                                            sRoomSize  = "36㎡";
                                            sImages = "../images/DLDBTW.jpg";
                                            break;

                                        case "Grand Deluxe":
                                            sRoomSize  = "43㎡";
                                            sImages = "../images/GDDBTW.jpg";
                                            break;

                                        case "Executive":
                                            sRoomSize  = "51㎡";
                                            sImages = "../images/ECDBTW.jpg";
                                            break;
                                    }
                                    break;

                                case "TW":
                                    sBedType = "Twin";

                                    switch (sClassType) {
                                        case "Standard":
                                            sRoomSize  = "28㎡";
                                            sImages = "../images/STDBTW.jpg";
                                            break;

                                        case "Deluxe":
                                            sRoomSize  = "36㎡";
                                            sImages = "../images/DLDBTW.jpg";
                                            break;

                                        case "Grand Deluxe":
                                            sRoomSize  = "43㎡";
                                            sImages = "../images/GDDBTW.jpg";
                                            break;

                                        case "Executive":
                                            sRoomSize  = "51㎡";
                                            sImages = "../images/ECDBTW.jpg";
                                            break;
                                    }
                                    break;

                                case "SU":
                                    sBedType = "Suite";
                                    
                                    switch (sClassType) {
                                        case "Deluxe":
                                            sClassType = "Deluxe Suite"
                                            sRoomSize  = "66㎡"
                                            sImages = "../images/DLSU.jpg";
                                            break;

                                        case "Grand Deluxe":
                                            sClassType = "Grand Deluxe Suite"
                                            sRoomSize  = "71㎡"
                                            sImages = "../images/GDSU.jpg";
                                            break;

                                        case "Executive":
                                            sClassType = "Executive Suite"
                                            sRoomSize  = "84㎡"
                                            sImages = "../images/ECSU.jpg";
                                            break;
                                    }
                                    break;
                            }                            

                            switch (aData[i].Roomtp.substring(5)) {
                                case "C":
                                    sViewType = "City View";
                                    break;

                                case "M":
                                    sViewType = "Mountain View";
                                    break;

                                case "O":
                                    sViewType = "Ocean View";
                                    break;
                            }

                            aRoomData = { 
                                Roomid : aData[i].Roomid,
                                Roomno : aData[i].Roomno,
                                Roomtp : aData[i].Roomtp,
                                Price  : aData[i].Rmrate,
                                Classtp: sClassType,
                                Bedtype: sBedType,
                                Viewtp : sViewType,
                                Rmsize : sRoomSize,
                                images : sImages 
                            }
                            oRoomData.push(aRoomData);

                            aRoomType = { key : sClassType, name : sClassType };
                            aBedType  = { key : sBedType,   name : sBedType };
                            aViewType = { key : sViewType,  name : sViewType };
                            bRoomType = true;
                            bBedType = true;
                            bViewType = true;

                            for(var i2=0; i2<oRoomType.length; i2++){
                                if(i !== 0){ sRmtpCheck = oRoomType[i2].key }
                                if(sRmtpCheck == sClassType){ bRoomType =false; }
                            }

                            for(var i3=0; i3<oBedType.length; i3++){
                                if(i !== 0){ sBedtpCheck = oBedType[i3].key }
                                if( sBedtpCheck == sBedType){ bBedType = false; }
                            }

                            for(var i4=0; i4<oViewType.length; i4++){
                                if(i !== 0){ sViewtpCheck = oViewType[i4].key }
                                if(sViewtpCheck == sViewType){ bViewType = false; }
                            }

                            if(bRoomType){ oRoomType.push(aRoomType); }
                            if(bBedType) { oBedType.push(aBedType); }
                            if(bViewType){ oViewType.push(aViewType); }
                        };

                        oView2Model.setProperty("/oRoomData", oRoomData);
                        oView2Model.setProperty("/oRoomType", oRoomType);
                        oView2Model.setProperty("/oBedType",  oBedType);
                        oView2Model.setProperty("/oViewType", oViewType);
                        console.log("Success");
                    },
                    error: function (oError) {
                        console.log("Error")
                    }
                })
            },

            _fetchData: function () {
                var aData = this.oFilterBar.getAllFilterItems().reduce(function (aResult, oFilterItem) {
                    aResult.push({
                        groupName: oFilterItem.getGroupName(),
                        fieldName: oFilterItem.getName(),
                        fieldData: oFilterItem.getControl().getSelectedKeys()
                    });

                    return aResult;
                }, []);

                return aData;
            },

            _applyData: function (aData) {
                aData.forEach(function (oDataObject) {
                    var oControl = this.oFilterBar.determineControlByName(oDataObject.fieldName, oDataObject.groupName);
                    oControl.setSelectedKeys(oDataObject.fieldData);
                }, this);
            },

            _getFiltersWithValues: function () {
                var aFiltersWithValue = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl();

                    if (oControl && oControl.getSelectedKeys && oControl.getSelectedKeys().length > 0) {
                        aResult.push(oFilterGroupItem);
                    }

                    return aResult;
                }, []);

                return aFiltersWithValue;
            },

            onSelectionChange: function (oEvent) {
                this.oFilterBar.fireFilterChange(oEvent);
            },
    
            onSearch: function () {
                var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl(),
                        aSelectedKeys = oControl.getSelectedKeys(),
                        aFilters = aSelectedKeys.map(function (sSelectedKey) {
                            return new Filter({
                                path: oFilterGroupItem.getName(),
                                operator: FilterOperator.EQ,
                                value1: sSelectedKey
                            });
                        });
    
                    if (aSelectedKeys.length > 0) {
                        aResult.push(new Filter({
                            filters: aFilters,
                            and: false
                        }));
                    }
    
                    return aResult;
                }, []);
                                
                this.getView().getModel("view2").setProperty("/bEnabled", false);
                this.oTable.removeSelections()

                this.oTable.getBinding("items").filter(aTableFilters);
                this.oTable.setShowOverlay(false);
            },

            onFilterChange: function () {
                this._updateStatusAndTable();
            },

            onAfterVariantLoad: function () {
                this._updateStatusAndTable();
            },

            _getFormattedSummaryText: function() {
                var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl(),
                        aSelectedKeys = oControl.getSelectedKeys(),
                        aFilters = aSelectedKeys.map(function (sSelectedKey) {
                            return new Filter({
                                path: oFilterGroupItem.getName(),
                                operator: FilterOperator.EQ,
                                value1: sSelectedKey
                            });
                        });
    
                    if (aSelectedKeys.length > 0) {
                        aResult.push(new Filter({
                            filters: aFilters,
                            and: false
                        }));
                    }    
                    return aResult;
                }, []);

                if (aTableFilters.length === 0) {
                    return "No filters active";
                } else {
                    return aTableFilters.length + " filter active: ";
                }
            },
    
            _getFormattedSummaryTextExpanded: function() {
                var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl(),
                        aSelectedKeys = oControl.getSelectedKeys(),
                        aFilters = aSelectedKeys.map(function (sSelectedKey) {
                            return new Filter({
                                path: oFilterGroupItem.getName(),
                                operator: FilterOperator.EQ,
                                value1: sSelectedKey
                            });
                        });
    
                    if (aSelectedKeys.length > 0) {
                        aResult.push(new Filter({
                            filters: aFilters,
                            and: false
                        }));
                    }                    
                    return aResult;
                }, []);

                if (aTableFilters.length === 0) {
                    return "No filters active";
                } else {
                    var sText = aTableFilters.length + " filters active";
                    return sText;
                }    
                
            },

            _updateStatusAndTable: function () {
                this.oExpandedStatus.setText(this._getFormattedSummaryTextExpanded());
                this.oSnappedStatus.setText(this._getFormattedSummaryText());
                this.oTable.setShowOverlay(true);
            },

            onPressItem: function(oEvent){
                var sPath       = oEvent.getParameters().listItem.oBindingContexts.view2.getPath().substring(11);
                var oView2Model = this.getView().getModel("view2");
                var sRoomType   = this.getView().getModel("view2").oData.oRoomData[sPath].Roomtp;
                var sRoomId     = this.getView().getModel("view2").oData.oRoomData[sPath].Roomid;
                var sRoomNo     = this.getView().getModel("view2").oData.oRoomData[sPath].Roomno;
                var sTypeInfo   = this.getView().getModel("view2").oData.oRoomData[sPath].Bedtype + " Bed/" + this.getView
                    ().getModel("view2").oData.oRoomData[sPath].Viewtp;
                var sRoomSize   = this.getView().getModel("view2").oData.oRoomData[sPath].Rmsize;
                var sPrice      = this.getView().getModel("view2").oData.oRoomData[sPath].Price;
                var sRoomClass  = this.getView().getModel("view2").oData.oRoomData[sPath].Classtp;

                oView2Model.setProperty("/sRoomId",    sRoomId);
                oView2Model.setProperty("/sRoomNo",    sRoomNo);
                oView2Model.setProperty("/sRoomType",  sRoomType);
                oView2Model.setProperty("/sTypeInfo",  sTypeInfo);
                oView2Model.setProperty("/sRoomSize",  sRoomSize);
                oView2Model.setProperty("/sPrice",     sPrice);
                oView2Model.setProperty("/sRoomClass", sRoomClass);

                oView2Model.setProperty("/bEnabled", true);
            },

            onNavToView3: function(){
                var oView2Model = this.getView().getModel("view2"),
                    oCompoModel = this.getOwnerComponent().getModel("InputData"),
                    sRoomId     = oView2Model.getProperty("/sRoomId"),
                    sRoomNo     = oView2Model.getProperty("/sRoomNo"),
                    sRoomType   = oView2Model.getProperty("/sRoomType"),
                    sTypeInfo   = oView2Model.getProperty("/sTypeInfo"),
                    sRoomSize   = oView2Model.getProperty("/sRoomSize"),
                    sPrice      = oView2Model.getProperty("/sPrice"),
                    sRoomClass  = oView2Model.getProperty("/sRoomClass");
                
                oCompoModel.setProperty("/sRoomId",    sRoomId);
                oCompoModel.setProperty("/sRoomNo",    sRoomNo);
                oCompoModel.setProperty("/sRoomType",  sRoomType);
                oCompoModel.setProperty("/sTypeInfo",  sTypeInfo);
                oCompoModel.setProperty("/sRoomSize",  sRoomSize);
                oCompoModel.setProperty("/sPrice",     sPrice);
                oCompoModel.setProperty("/sRoomClass", sRoomClass);
                
                this.getRouter().navTo("View3");
            }

        });
    });
