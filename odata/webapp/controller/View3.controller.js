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

        return Controller.extend("sap.sync.odata.controller.View3", {
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
                this.getView().setModel(oDataModel, "view3");

	            oRouter.getRoute("View3").attachMatched(this._onRouteMatched, this);
                
                this.oExpandedStatus = this.getView().byId("expandedStatus");
                this.oSnappedStatus = this.getView().byId("snappedStatus");
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

            _setting: function(){
                this._calcPrice();
                this._setOptDetail();
            },

            onTest: function(){
                this._calcPrice();
                debugger;
            },

            onAdd: function(oEvent){
                var oCompoModel = this.getView().getModel("InputData")
                var oView3Model = this.getView().getModel("view3");
                var oOptData    = oView3Model.getProperty("/oOptData");
                var sSelectId   = oEvent.mParameters.id;
                var sOrder      = sSelectId.charAt(sSelectId.length-1);
                var sOptName    = oOptData[sOrder].Option;
                var sOptPrice   = oOptData[sOrder].Price;
                var iOptPrice   = parseInt(sOptPrice.replace(" 원", "").replace(",", ""))
                var iOptQuan    = oOptData[sOrder].Quantity;
                var iAddition   = oView3Model.getProperty("/iAddition");
                var iCustNum    = oCompoModel.getProperty("/iAdultNum") + 
                    oCompoModel.getProperty("/iChildNum") + oCompoModel.getProperty("/iBabyNum");
                    
                /**
                 * 추가 인원 만큼 고객 인원 추가
                 */
                iCustNum += iAddition;

                switch(sOptName) {
                    case '조식 추가':
                        if( iOptQuan <= iCustNum){
                            oOptData[sOrder].Quantity += 1;
                        } else {
                            MessageToast.show("예약 인원 이상으로 추가할 수 없습니다.")
                        };
                        break;

                    case '추가 인원':
                        if( iOptQuan < 2 ){
                            oOptData[sOrder].Quantity += 1;
                            oView3Model.setProperty("/iAddition", iAddition + 1 );
                        } else {
                            MessageToast.show("최대 2인까지 추가 가능합니다.")
                        };
                        break;
                    
                    default:
                        if( iOptQuan < 1 ){
                            oOptData[sOrder].Quantity += 1; 
                        };
                        break;
                }

                oOptData[sOrder].Total = iOptPrice * oOptData[sOrder].Quantity;
                oView3Model.setProperty("/oOptData", oOptData);

                this._calcPrice();
                this._setOptDetail();
            },

            onLess: function(oEvent){
                var oView3Model = this.getView().getModel("view3");
                var iAddition   = oView3Model.getProperty("/iAddition");
                var oOptData    = oView3Model.getProperty("/oOptData");
                var sSelectId   = oEvent.mParameters.id;
                var sOrder      = sSelectId.charAt(sSelectId.length-1);
                var sOptName    = oOptData[sOrder].Option;
                var sOptPrice   = oOptData[sOrder].Price;
                var iOptPrice   = parseInt(sOptPrice.replace(" 원", "").replace(",", ""))
                var iOptQuan    = oOptData[sOrder].Quantity;
                var iMealQuan   = oView3Model.getProperty("/oOptData").find(e => e.Option === '조식 추가').Quantity;
                var sMealPrice  = oView3Model.getProperty("/oOptData").find(e => e.Option === '조식 추가').Price;
                var iMealPrice  = parseInt(sMealPrice.replace(" 원", "").replace(",", ""))
                var iMealIndex  = oView3Model.getProperty("/oOptData").findIndex(e => e.Option === '조식 추가');

                switch(sOptName) {
                    case '추가 인원':
                        if( iOptQuan > iMealQuan ){ 
                            oOptData[sOrder].Quantity -= 1; 
                            oView3Model.setProperty("/iAddition", iAddition - 1 );
                            break;
                        } 

                        if ( iOptQuan == 0 ){
                            break;
                        }
                        oOptData[sOrder].Quantity -= 1;
                        oOptData[iMealIndex].Quantity -= 1;
                        oView3Model.setProperty("/iAddition", iAddition - 1 );
                        break;

                    default:
                        if( iOptQuan > 0 ){
                            oOptData[sOrder].Quantity -= 1; 
                        };
                        break;
                }

                oOptData[sOrder].Total = iOptPrice * oOptData[sOrder].Quantity;
                oOptData[iMealIndex].Total = iMealPrice * oOptData[iMealIndex].Quantity;
                oView3Model.setProperty("/oOptData", oOptData);

                this._calcPrice();
                this._setOptDetail();
            },

            _calcPrice: function(){
                var oView3Model = this.getView().getModel("view3");
                var oCompoModel = this.getView().getModel("InputData");
                var oOptData    = oView3Model.getProperty("/oOptData");
                var aPriceInfo  = oView3Model.getProperty("/aPriceInfo");

                var sUnitPrice      = aPriceInfo.Price,
                    iPriceLength    = sUnitPrice.replace(" 원", "").length,
                    iUnitPrice      = 0,
                    iRoomDiscount   = parseInt(aPriceInfo.RoomDiscount),
                    iRoomPremium    = parseInt(aPriceInfo.RoomPremium),
                    iRoomUnitPrice  = 0,
                    iCustDiscount   = parseInt(aPriceInfo.CustDiscount),
                    iWeekendPremium = parseInt(aPriceInfo.WeekendPremium),
                    iHolidayPremium = parseInt(aPriceInfo.HolidayPremium);
                
                var iWeekDayPrice   = 0,
                    sWeekDayPrice   = "",
                    iWeekendPrice   = 0,
                    sWeekendPrice   = "",
                    iHoliDayPrice   = 0,
                    sHoliDayPrice   = "",
                    iTotalRoomPrice = 0,
                    sTotalRoomPrice = "";

                var iOptPrice      = 0,
                    sTotalOptDesc  = "",
                    aTotalOptDesc  = {},
                    iTotalOptPrice = 0,
                    sTotalOptPrice = "",
                    aSelectOpt     = {},
                    oSelectOpt     = [];

                var iTotalBookPrice = 0,
                    sTotalBookPrice = "",
                    iCustDiscountPrice = 0,
                    sCustDiscountPrice = "",
                    iFinalPrice = 0,
                    sFinalPrice = "";

                if( 4 < iPriceLength && iPriceLength < 8 ){
                    iUnitPrice = parseInt(sUnitPrice.replace(" 원", "").replace(",", ""));
                } else if ( 7 < iPriceLength && iPriceLength < 11 ) {
                    iUnitPrice = parseInt(sUnitPrice.replace(" 원", "").replace(",", "").replace(",", ""));
                };

                iRoomUnitPrice = iUnitPrice + ( iUnitPrice * iRoomPremium / 100 ) - ( iUnitPrice * iRoomDiscount / 100 );

                iWeekDayPrice = iRoomUnitPrice * oCompoModel.getProperty("/iWeekDay");
                iWeekendPrice = iRoomUnitPrice * oCompoModel.getProperty("/iWeekendDay");
                iWeekendPrice = iWeekendPrice + ( iWeekendPrice * iWeekendPremium / 100);
                iHoliDayPrice = iRoomUnitPrice * oCompoModel.getProperty("/iHoliday");
                iHoliDayPrice = iHoliDayPrice + ( iHoliDayPrice * iHolidayPremium / 100);
                iTotalRoomPrice = iWeekDayPrice + iWeekendPrice + iHoliDayPrice;

                sWeekDayPrice = this._setPrice(iWeekDayPrice);
                sWeekendPrice = this._setPrice(iWeekendPrice);
                sHoliDayPrice = this._setPrice(iHoliDayPrice);

                for( var i=0; i< oOptData.length; i++ ){
                    iOptPrice = parseInt(oOptData[i].Price.replace(" 원", "").replace(",", ""));
                    oOptData[i].Total  = iOptPrice * oOptData[i].Quantity;
                    oOptData[i].sTotal = this._setPrice(oOptData[i].Total);

                    iTotalOptPrice += oOptData[i].Total;

                    if(oOptData[i].Quantity !== 0){
                        sTotalOptDesc += oOptData[i].Option + "(" + oOptData[i].Quantity + "): " 
                        +  oOptData[i].sTotal + "/";
                    }

                    if(oOptData[i].sTotal){
                        aSelectOpt = {
                            Option   : oOptData[i].Option,
                            Price    : oOptData[i].Price,
                            Quantity : oOptData[i].Quantity,
                            Total    : oOptData[i].Total,
                            sTotal   : oOptData[i].sTotal
                        };
                        oSelectOpt.push(aSelectOpt);
                    };
                }
                sTotalRoomPrice = this._setPrice(iTotalRoomPrice);

                sTotalOptDesc   = sTotalOptDesc.slice(0,-1);
                aTotalOptDesc   = sTotalOptDesc.split('/');

                sTotalOptPrice  = this._setPrice(iTotalOptPrice);

                if(sTotalOptPrice == null){
                    sTotalOptPrice = '0 원';
                }

                iTotalBookPrice = iTotalRoomPrice + iTotalOptPrice;
                sTotalBookPrice = this._setPrice(iTotalBookPrice);

                iCustDiscountPrice = iTotalBookPrice * iCustDiscount / 100;
                sCustDiscountPrice = this._setPrice(iCustDiscountPrice);

                if(sCustDiscountPrice == null){
                    sCustDiscountPrice = '0 원';
                }

                iFinalPrice = iTotalBookPrice - iCustDiscountPrice;
                sFinalPrice = this._setPrice(iFinalPrice);

                oView3Model.setProperty('/aTotalOptDesc', aTotalOptDesc);

                oCompoModel.setProperty('/sTotalRoomPrice',    sTotalRoomPrice);
                oCompoModel.setProperty('/sTotalOptPrice',     sTotalOptPrice);
                oCompoModel.setProperty('/sTotalBookPrice',    sTotalBookPrice);
                oCompoModel.setProperty('/sCustDiscountPrice', sCustDiscountPrice);
                oCompoModel.setProperty('/sFinalPrice',        sFinalPrice);
                oCompoModel.setProperty('/sWeekDayPrice',      sWeekDayPrice);
                oCompoModel.setProperty('/sWeekendPrice',      sWeekendPrice);
                oCompoModel.setProperty('/sHoliDayPrice',      sHoliDayPrice);
                oCompoModel.setProperty('/oSelectOpt',         oSelectOpt);

            },

            _setPrice: function(iNumber){
                var sNumber = String(iNumber);

                if( sNumber.length == 5 ){
                    sNumber = sNumber.substring(0,2) + ',' + sNumber.substring(2,5) + ' 원';
                } else if( sNumber.length == 6 ){
                    sNumber = sNumber.substring(0,3) + ',' + sNumber.substring(3,6) + ' 원';
                } else if( sNumber.length == 7 ){
                    sNumber = sNumber.substring(0,1) + ',' + sNumber.substring(1,4) + ',' + sNumber.substring(4,7) + ' 원';
                } else if( sNumber.length == 8 ){
                    sNumber = sNumber.substring(0,2) + ',' + sNumber.substring(2,5) + ',' + sNumber.substring(5,8) + ' 원';
                } else if( sNumber.length == 9 ){
                    sNumber = sNumber.substring(0,3) + ',' + sNumber.substring(3,6) + ',' + sNumber.substring(6,9) + ' 원';
                } else {
                    sNumber = null;
                };

                return sNumber;
            },

            _setOptDetail : function(){
                var oView3Model   = this.getView().getModel("view3");
                var oOptData      = oView3Model.getProperty("/oOptData");
                var aTotalOptDesc = oView3Model.getProperty('/aTotalOptDesc');

                for( var i = 0; i< oOptData.length; i++ ){
                    var sTextId = 'optText' + i
                    this.getView().byId(sTextId).setText("");
                    this.getView().byId(sTextId).setVisible(false);
                }                

                for( var iOpt = 0; iOpt< aTotalOptDesc.length; iOpt++ ){
                    var sTextid = 'optText' + iOpt
                    this.getView().byId(sTextid).setText(aTotalOptDesc[iOpt]);
                    this.getView().byId(sTextid).setVisible(true);
                }
            },

            onSelect: function(){
                var oView3Model = this.getView().getModel("view3");
                var oCompoModel = this.getView().getModel("InputData");
                var sRequestText = this.getView().byId('textArea').getValue();

                oCompoModel.setProperty('/sRequestText', sRequestText);

                this._setting();

                this.getRouter().navTo("View4");
            }

        });
    });
