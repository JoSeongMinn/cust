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

        return Controller.extend("sap.sync.odata.controller.View4", {
            onInit: function () {
                var oData = {
                    oOptData   : [],
                    aCustInfo  : {},
                    aPriceInfo : {},
                    iAddition  : 0,
                    sCustType  : "",
                    sCustDiscount : "",
                    aTotalOptDesc : {}
                }
                var oRouter = this.getRouter();
                var oDataModel = new JSONModel(oData);
                this.getView().setModel(oDataModel, "view4");

	            // oRouter.getRoute("View4").attachMatched(this._onRouteMatched, this);
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
                var oView3Model = this.getView().getModel("view3");

                var test = oCompoModel.getProperty("/sCustId");
                if( test ) {
                
                    var sPlant  = oCompoModel.getProperty("/sPlant").substring(10,11),
                        sRoomId = oCompoModel.getProperty("/sRoomId"),
                        sCustId = oCompoModel.getProperty("/sCustId"),
                        sPrice  = oCompoModel.getProperty("/sPrice");

                } else {
                    var sPlant  = 'S',
                        sRoomId = 'SDLDBC001',
                        sCustId = '001',
                        sPrice = '1,500,000 원'
                }

                var oFilter1 = new Filter("Plant",  FilterOperator.EQ, sPlant);
                var oFilter2 = new Filter("Roomid", FilterOperator.EQ, sRoomId);
                var oFilter3 = new Filter("Custid",  FilterOperator.EQ, sCustId);

                var aFilter  = [];

                aFilter.push(oFilter1, oFilter2, oFilter3);
                oModel.read("/BookingOptionSet", {
                    filters: aFilter,
                    success: function (oData) { 
                        var data = oData; 
                        var aData = data.results;
                        var ilength = aData.length;
                        var aOptData = {};
                        var oOptData = [];
                        var aCustInfo = {};
                        var aPriceInfo = {};

                        var sOptName,
                            sImages;

                        for (var i=0; i<ilength; i++) {
                            switch (aData[i].Optionnm) {
                                case "ADDLNO":
                                    sOptName = "추가 인원";
                                    break;

                                case "BKFST":
                                    sOptName  = "조식 추가";
                                    break;

                                case "ERCHK":
                                    sOptName  = "Early Check-In";
                                    break;

                                case "LTCHK":
                                    sOptName  = "Late Check-Out";
                                    break;

                                case "EXTBED":
                                    sOptName  = "추가 침대";
                                    break;;

                                case "WLCAMNT":
                                    sOptName  = "Welcome Amenity";
                                    break;
                            }

                            aOptData = { 
                                Option   : sOptName,
                                Price    : aData[i].Optprice,
                                Quantity : 0,
                                Total    : 0,
                                sTotal   : ""
                            }
                            oOptData.push(aOptData);
                        }

                        aCustInfo = {
                            CustId    : sCustId,
                            CustName  : oData.results[0].Custlnm + oData.results[0].Custfnm,
                            CustType  : oData.results[0].Custtype,
                            CustTel   : oData.results[0].Custtel,
                            CustEmail : oData.results[0].Custemail
                        }

                        aPriceInfo = {
                            Price          : sPrice,
                            CustDiscount   : oData.results[0].Custdsct,
                            RoomDiscount   : oData.results[0].Roomdsct,
                            RoomPremium    : oData.results[0].Roomprmm,
                            WeekendPremium : oData.results[0].Dowprmm,
                            HolidayPremium : oData.results[0].Holiprmm
                        }

                        oView3Model.setProperty("/oOptData",   oOptData);
                        oView3Model.setProperty("/aCustInfo",  aCustInfo);
                        oView3Model.setProperty("/aPriceInfo", aPriceInfo);
                        oView3Model.setProperty("/sCustType",  oData.results[0].Custtype);
                        console.log("Success");
                    },
                    error: function (oError) {
                        console.log("Error")
                    }
                })
            },

            onTest: function(){
                this._calcPrice();
                debugger;
            }

        });
    });
