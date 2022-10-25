sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator", 
    "sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
    "sap/m/Text", "sap/m/Button",
    "sap/m/Dialog", "../model/toss"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, History, UIComponent, Filter, FilterOperator, MessageToast, Fragment, syncStyleClass, Text, Button, Dialog, toss) {
        "use strict";

        return Controller.extend("sap.sync.odata.controller.View5", {
            onInit: function () {
                var oData = {
                    sPlant     : null,
                    sClassType : null,
                    sBedType   : null,
                    sViewType  : null,
                    sRoomSize  : null,
                    sImageBig  : null,
                    sCheckIn   : null,
                    sCheckOut  : null,
                    sNumInfo   : null,
                    sRequest   : null,
                    sPrice     : null,
                    sPayMethod : null
                }
                var oRouter = this.getRouter();
                var oDataModel = new JSONModel(oData);
                this.getView().setModel(oDataModel, "view5");

	            oRouter.getRoute("View5").attachMatched(this._onRouteMatched, this);
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
                    this.getRouter().navTo("Login", {}, true); 
                    // no history 일 때 / RouteView1 뒤는 기본값이기 때문에 생략해도 작동
                }
            },

            /**
             * 페이지 이동 직후 이벤트
             */
            _onRouteMatched: function(oEvent){
                var oModel      = this.getView().getModel();
                var oView5Model = this.getView().getModel('view5');

                var iIndex      = this.getView().oPreprocessorInfo.view.baseURI.search('orderId');
                var sOrderId    = this.getView().oPreprocessorInfo.view.baseURI.substring(iIndex+8,iIndex+16)
                var sPath       = "/FinishSet('" + sOrderId + "')"

                oModel.read(sPath, {
                    success: function(data){
                        this.getView().setModel(new JSONModel(data), 'oModel');
                                        
                        if(data.Roomid.substring(0,1) == 'S'){
                            oView5Model.setProperty('/sPlant', 'Grand SAP Seoul(서울 본점)');
                        } else if(data.Roomid.substring(0,1) == 'J'){                            
                            oView5Model.setProperty('/sPlant', 'Grand SAP Jeju(제주 지점)');
                        };

                        var sClassType = '',
                            sBedType   = '',
                            sRoomSize  = '',
                            sImages    = '',
                            sViewType  = '',
                            sCheckIn   = '',
                            sCheckOut  = '',
                            sNumInfo   = '',
                            sRequest   = '',
                            sSelOpt    = '',
                            sPrice     = '',
                            sPayMethod = ''
                        
                        switch (data.Roomid.substring(1,3)) {
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

                        switch (data.Roomid.substring(3,5)) {
                            case "SG":
                                sClassType = "Standard Single";
                                sBedType = "Single";
                                sRoomSize  = "24㎡";
                                sImages = "../images/STSGB.jpg";
                                break;

                            case "DB":
                                sBedType = "Double";

                                switch (sClassType) {
                                    case "Standard":
                                        sRoomSize  = "28㎡";
                                        sImages = "../images/STDBTWB.jpg";
                                        break;

                                    case "Deluxe":
                                        sRoomSize  = "36㎡";
                                        sImages = "../images/DLDBTWB.jpg";
                                        break;

                                    case "Grand Deluxe":
                                        sRoomSize  = "43㎡";
                                        sImages = "../images/GDDBTWB.jpg";
                                        break;

                                    case "Executive":
                                        sRoomSize  = "51㎡";
                                        sImages = "../images/ECDBTWB.jpg";
                                        break;
                                }
                                break;

                            case "TW":
                                sBedType = "Twin";

                                switch (sClassType) {
                                    case "Standard":
                                        sRoomSize  = "28㎡";
                                        sImages = "../images/STDBTWB.jpg";
                                        break;

                                    case "Deluxe":
                                        sRoomSize  = "36㎡";
                                        sImages = "../images/DLDBTWB.jpg";
                                        break;

                                    case "Grand Deluxe":
                                        sRoomSize  = "43㎡";
                                        sImages = "../images/GDDBTWB.jpg";
                                        break;

                                    case "Executive":
                                        sRoomSize  = "51㎡";
                                        sImages = "../images/ECDBTWB.jpg";
                                        break;
                                }
                                break;

                            case "SU":
                                sBedType = "Suite";
                                
                                switch (sClassType) {
                                    case "Deluxe":
                                        sClassType = "Deluxe Suite"
                                        sRoomSize  = "66㎡"
                                        sImages = "../images/DLSUB.jpg";
                                        break;

                                    case "Grand Deluxe":
                                        sClassType = "Grand Deluxe Suite"
                                        sRoomSize  = "71㎡"
                                        sImages = "../images/GDSUB.jpg";
                                        break;

                                    case "Executive":
                                        sClassType = "Executive Suite"
                                        sRoomSize  = "84㎡"
                                        sImages = "../images/ECSUB.jpg";
                                        break;
                                }
                                break;
                        }                            

                        switch (data.Roomid.substring(5,6)) {
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
                        
                        sCheckIn  = data.Indat.substring(0,4) + '.' + data.Indat.substring(4,6) + '.' + data.Indat.substring(6,8);
                        sCheckOut = data.Outdat.substring(0,4) + '.' + data.Outdat.substring(4,6) + '.' + data.Outdat.substring(6,8);

                        if(data.CustnoC !== '0'){
                            sNumInfo = '성인 : ' + data.CustnoA + '명 / 아동(유아) : ' + data.CustnoC + '명';
                            oView5Model.setProperty('/sNumInfo', sNumInfo);
                        } else {
                            sNumInfo = '성인 : ' + data.CustnoA + '명';
                            oView5Model.setProperty('/sNumInfo', sNumInfo);
                        }                        

                        if(data.Rqtext){
                            sRequest = '요청사항 : ' + data.Rqtext;
                            oView5Model.setProperty('/sRequest', sRequest);
                        }

                        if(data.Addlno !== '0'){
                            sSelOpt += '추가 인원(' + data.Addlno + ') / ';
                        };

                        if(data.Mealno !== '0'){
                            sSelOpt += '조식 추가(' + data.Mealno + ') / ';
                        };

                        if(data.Erchk == 'X'){
                            sSelOpt += 'Early Check-In / ';
                        };

                        if(data.Ltchk == 'X'){
                            sSelOpt += 'Late Check-Out / ';
                        };

                        if(data.Extbed == 'X'){
                            sSelOpt += '추가 침대 / ';
                        };

                        if(data.ExtbedB == 'X'){
                            sSelOpt += '유아용 침대 / ';
                        };

                        if(data.Wlcamnt == 'X'){
                            sSelOpt += 'Welcome Amenity / ';
                        };

                        if(sSelOpt){
                            var sSelOpt = sSelOpt.slice(0,-3);
                        };

                        if(data.Paycost.length > 3 && data.Paycost.length < 7){
                            var iIndex = data.Paycost.length - 3;
                            var sPrice = data.Paycost.substring(0,iIndex) + ',' + data.Paycost.slice(-3) + ' 원'
                        } else if(data.Paycost.length > 6 && data.Paycost.length < 10){
                            var iIndex = data.Paycost.length - 6;
                            var sPrice = data.Paycost.substring(0,iIndex) + ',' + data.Paycost.substring(iIndex,iIndex+3) + ',' + data.Paycost.slice(-3) + ' 원'
                        };

                        sPayMethod = data.Paymeth

                        oView5Model.setProperty('/sClassType', sClassType);
                        oView5Model.setProperty('/sBedType'  , sBedType);
                        oView5Model.setProperty('/sRoomSize' , sRoomSize);
                        oView5Model.setProperty('/sImageBig' , sImages);
                        oView5Model.setProperty('/sViewType' , sViewType);
                        oView5Model.setProperty('/sCheckIn'  , sCheckIn);
                        oView5Model.setProperty('/sCheckOut' , sCheckOut);
                        oView5Model.setProperty('/sSelOpt'   , sSelOpt);
                        oView5Model.setProperty('/sPrice'    , sPrice);
                        oView5Model.setProperty('/sPayMethod', sPayMethod);

                    }.bind(this)
                });

            },

            onTest: function(){
                var oModel      = this.getView().getModel('oModel');
                var oView5Model = this.getView().getModel("view5");
                               
                debugger
            }

        });
    });
