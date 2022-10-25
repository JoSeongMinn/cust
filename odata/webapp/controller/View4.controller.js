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

        return Controller.extend("sap.sync.odata.controller.View4", {
            onInit: function () {
                var oData = {
                    sImageBig  : null,
                    sFirstName : null,
                    sLastName  : null,
                    sCustEmail : null,
                    sCustTel   : null,
                    oNormalPay : [ 
                        { key: 'CARD'        , name: '카드 결제' },
                        { key: '계좌이체'    , name: '계좌이체' },
                        { key: '앱카드'      , name: '앱카드' },
                        { key: '휴대폰'      , name: '휴대폰결제' },
                        { key: '문화상품권'  , name: '상품권결제' },
                    ],
                    oEasyPay   : [
                        { key: 'TOSSPAY'   , name: '토스페이' },
                        { key: 'NAVERPAY'  , name: '네이버페이' },
                        { key: 'SAMSUNGPAY', name: '삼성페이' },
                        { key: 'LGPAY'     , name: 'LG페이' }
                    ],
                    oVoucher   : [
                        { key: '문화상품권'     , name: '문화상품권' },
                        { key: '도서문화상품권' , name: '도서문화상품권' },
                        { key: '게임문화상품권' , name: '게임문화상품권' }
                    ],
                    oAppCard   : [
                        { key: 'SHINHAN'     , name: '신한' },
                        { key: 'SAMSUNG'     , name: '삼성' },
                        { key: 'KOOKMIN'     , name: '국민' },
                        { key: 'HYUNDAI'     , name: '현대' },
                        { key: 'LOTTE'       , name: '롯데' },
                        { key: 'NONGHYEOP'   , name: '농협' }
                    ],
                    bNormalPay : true,
                    bEasyPay   : false,
                    bVoucher   : false,
                    bAppCard   : false,
                    sPaymentMethod : null,
                    sPaymentDetail : null
                }
                var oRouter = this.getRouter();
                var oDataModel = new JSONModel(oData);
                this.getView().setModel(oDataModel, "view4");

	            oRouter.getRoute("View4").attachMatched(this._onRouteMatched, this);
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
                var oCompoModel = this.getOwnerComponent().getModel("InputData");
                var oModel      = this.getView().getModel();
                var oView4Model = this.getView().getModel("view4");
                
                var aCustInfo   = oCompoModel.getProperty("/aCustInfo");
                var sBedType = oCompoModel.getProperty("/sRoomType").substring(3,5);
                var sRoomType = "";

                if( sBedType == 'TW' || sBedType == 'DB' ){
                    sRoomType = oCompoModel.getProperty("/sRoomType").substring(1,3) + 'DBTW' 
                } else {
                    sRoomType = oCompoModel.getProperty("/sRoomType").slice(1,-1);
                }

                var sImageBig = "../images/" + sRoomType + "B.jpg";
                
                var oSelOpt   = oCompoModel.getProperty("/oSelectOpt");
                var iSelOpt   = oSelOpt.length;
                var sSelOpt   = "";
                
                for( var iOpt = 0; iOpt < iSelOpt; iOpt++ ){
                    sSelOpt += ' / ' + oSelOpt[iOpt].Option + '(' + oSelOpt[iOpt].Quantity + ')';
                }

                if(sSelOpt !== ""){
                    this.getView().byId("optText").setVisible(true);
                    this.getView().byId("optLabel").setVisible(true);
                    sSelOpt = sSelOpt.substring(3);
                };

                this.getView().byId("optText").setText(sSelOpt);
                
                oView4Model.setProperty("/sImageBig",  sImageBig);
                oView4Model.setProperty("/sFirstName", aCustInfo.CustFName);
                oView4Model.setProperty("/sLastName",  aCustInfo.CustLName);
                oView4Model.setProperty("/sCustEmail", aCustInfo.CustEmail);
                oView4Model.setProperty("/sCustTel",   aCustInfo.CustTel);
            },

            onTelInput: function(){
                var oView4Model = this.getView().getModel("view4");
                var sInputTel   = this.getView().byId("inputTel").getValue();
                var sInputNum   = this.getView().byId("inputTel").getValue().replaceAll('-', "");
                var iLength     = sInputNum.length;
                var sInputFirst = sInputTel.substr(0,1);
                switch(sInputFirst){
                    case '+':
                        if ( iLength < 3 ){
                            sInputTel = sInputNum;
                            oView4Model.setProperty("/sCustTel", sInputTel);
                        } else if( iLength >= 3 && iLength < 5 ){
                            sInputTel = sInputNum.substring(0,3) + '-' + sInputNum.slice(3);
                            oView4Model.setProperty("/sCustTel", sInputTel);
                        } else if( iLength >= 5 && iLength < 8 ){
                            sInputTel = sInputNum.substring(0,3) + '-' + sInputNum.substring(3,5) + '-' 
                                + sInputNum.slice(5);
                            oView4Model.setProperty("/sCustTel", sInputTel);
                        } else if( iLength >= 8 && iLength < 13 ){
                            sInputTel = sInputNum.substring(0,3) + '-' + sInputNum.substring(3,5) + '-' 
                                + sInputNum.substring(5,8) + '-' + sInputNum.slice(8);
                            oView4Model.setProperty("/sCustTel", sInputTel);
                        } else if( iLength >= 13 ){
                            sInputTel = sInputNum.substring(0,3) + '-' + sInputNum.substring(3,5) + '-' 
                                + sInputNum.substring(5,9) + '-' + sInputNum.slice(9);
                            oView4Model.setProperty("/sCustTel", sInputTel);
                        }
                        break;

                    default:
                        if( iLength < 3 ){
                            sInputTel = sInputNum;
                            oView4Model.setProperty("/sCustTel", sInputTel);
                        } else if( iLength >= 3 && iLength < 5 ){
                            sInputTel = sInputNum.substring(0,3) + '-' + sInputNum.slice(3);
                            oView4Model.setProperty("/sCustTel", sInputTel);
                        } else if( iLength >= 6 && iLength < 11 ){
                            sInputTel = sInputNum.substring(0,3) + '-' + sInputNum.substring(3,6) + '-' 
                                + sInputNum.slice(6);
                            oView4Model.setProperty("/sCustTel", sInputTel);
                        } else if( iLength >= 11 ){
                            sInputTel = sInputNum.substring(0,3) + '-' + sInputNum.substring(3,7) + '-' 
                                + sInputNum.slice(7);
                            oView4Model.setProperty("/sCustTel", sInputTel);
                        }                        
                        break;
                }

            },

            _hidePay: function(){
                var oView4Model = this.getView().getModel('view4');

                oView4Model.setProperty('/bVoucher'  , false);
                oView4Model.setProperty('/bAppCard'  , false);
            },

            onRadioButton: function(oEvent){
                var sSelect = oEvent.oSource.mProperties.text;
                var oView4Model = this.getView().getModel('view4');
                var bNormalPay  = oView4Model.getProperty('/bNormalPay');
                var bEasyPay    = oView4Model.getProperty('/bEasyPay');

                if(sSelect == '일반 결제' && bNormalPay == false){
                    this._hidePay();
                    oView4Model.setProperty('/bNormalPay', true);
                    oView4Model.setProperty('/bEasyPay'  , false);

                } else if (sSelect == '간편 결제' && bEasyPay == false){
                    this._hidePay();
                    oView4Model.setProperty('/bEasyPay'  , true);
                    oView4Model.setProperty('/bNormalPay', false);
                }                
            },

            onTile: function(oEvent){
                var sSelect = oEvent.oSource.mProperties.header.trim()
                var oView4Model = this.getView().getModel('view4');
                
                this.getView().byId('tile1').setBackgroundImage('');
                this.getView().byId('tile2').setBackgroundImage('');
                this.getView().byId('tile3').setBackgroundImage('');
                this.getView().byId('tile4').setBackgroundImage('');
                this.getView().byId('tile5').setBackgroundImage('');
                this.getView().byId('tile6').setBackgroundImage('');
                this.getView().byId('tile7').setBackgroundImage('');
                this.getView().byId('tile8').setBackgroundImage('');
                this.getView().byId('tile9').setBackgroundImage('');
                oEvent.oSource.setBackgroundImage('../images/BACK.jpg');

                switch (sSelect){
                    case '카드결제':
                        this._hidePay();
                        oView4Model.setProperty('/sPaymentMethod', sSelect);
                        break
                    
                    case '계좌이체':
                        this._hidePay();
                        oView4Model.setProperty('/sPaymentMethod', sSelect);
                        break

                    case '앱카드':
                        this._hidePay();
                        oView4Model.setProperty('/bAppCard', true);
                        oView4Model.setProperty('/sPaymentMethod', sSelect);
                        break

                    case '휴대폰':
                        this._hidePay();
                        oView4Model.setProperty('/sPaymentMethod', sSelect);
                        break

                    case '상품권':
                        this._hidePay();
                        oView4Model.setProperty('/bVoucher', true);
                        oView4Model.setProperty('/sPaymentMethod', sSelect);
                        break

                    case '토스페이':
                        this._hidePay();
                        oView4Model.setProperty('/sPaymentMethod', sSelect);
                        break

                    case '네이버페이':
                        this._hidePay();
                        oView4Model.setProperty('/sPaymentMethod', sSelect);
                        break

                    case '삼성페이':
                        this._hidePay();
                        oView4Model.setProperty('/sPaymentMethod', sSelect);
                        break

                    case 'LG페이':
                        this._hidePay();
                        oView4Model.setProperty('/sPaymentMethod', sSelect);
                        break
                }
            },

            onSelectDetail: function(oEvent){
                var oComboBox = oEvent.oSource;
                var sPaymentDetail = oComboBox.getSelectedKey();
                var oView4Model = this.getView().getModel("view4");

                oView4Model.setProperty("/sPaymentDetail", sPaymentDetail);
            },

            onPay: function(){
                var clientKey = 'test_ck_5GePWvyJnrKDQ65aOkq8gLzN97Eo';
                var tossPayments = TossPayments(clientKey);

                var oModel         = this.getView().getModel();
                var oCompoModel    = this.getOwnerComponent().getModel("InputData");
                var oView4Model    = this.getView().getModel('view4');
                var sPaymentMethod = oView4Model.getProperty("/sPaymentMethod");
                var sPaymentDetail = oView4Model.getProperty("/sPaymentDetail");

                var sPlant         = oCompoModel.getProperty("/sPlant");
                var sPlantCode     = sPlant.substring(10,11);
                var sFinalPrice    = oCompoModel.getProperty("/sFinalPrice");
                var iFinalPrice    = parseInt(sFinalPrice.replace(' 원', "").replaceAll(',', ''))
                var random         = Math.floor(Math.random() * 1000000);
                var sOrderId       = sPlantCode + 'B' + random;
                var sOrderName     = sPlant + ' / ' + oCompoModel.getProperty("/sCheckIn") + ' ~ ' + oCompoModel.getProperty("/sCheckOut");
                
                var sCustName      = oView4Model.getProperty("/sLastName") + ' ' + oView4Model.getProperty("/sFirstName")
                var sCustEmail     = oView4Model.getProperty("/sCustEmail");
                var sCustTel       = oView4Model.setProperty("/sCustTel");

                oCompoModel.setProperty('sCustName' , sCustName );
                oCompoModel.setProperty('sCustEmail', sCustEmail);
                oCompoModel.setProperty('sCustTel'  , sCustTel  );

                switch (sPaymentMethod){
                    case '카드결제':
                        oCompoModel.setProperty('/sPaymentMethod', 'Card');
                        break;
                    
                    case '계좌이체':
                        oCompoModel.setProperty('/sPaymentMethod', 'Account');
                        break;
                    
                    case '휴대폰':
                        oCompoModel.setProperty('/sPaymentMethod', 'Phone');
                        break;

                    case '상품권':
                        oCompoModel.setProperty('/sPaymentMethod', 'Voucher');
                        break;
                    
                    case '앱카드':
                        oCompoModel.setProperty('/sPaymentMethod', 'AppCard');
                        break;                        

                    case '토스페이':
                        oCompoModel.setProperty('/sPaymentMethod', 'TossPay');
                        break;
                    
                    case '네이버페이':
                        oCompoModel.setProperty('/sPaymentMethod', 'NaverPay');
                        break;
                    
                    case '삼성페이':
                        oCompoModel.setProperty('/sPaymentMethod', 'SamsungPay');
                        break;
                    
                    case 'LG페이':
                        oCompoModel.setProperty('/sPaymentMethod', 'LGPay');
                        break;
                }

                var sPayMethod = oCompoModel.getProperty('/sPaymentMethod');
                var sRoomId    = oCompoModel.getProperty('/sRoomId');
                var sCustId    = oCompoModel.getProperty('/sCustId');
                var sCheckIn   = oCompoModel.getProperty('/sCheckIn').replaceAll('-','');
                var sCheckOut  = oCompoModel.getProperty('/sCheckOut').replaceAll('-','');
                var sAdult     = String(oCompoModel.getProperty('/iAdultNum'));
                var sChild     = String(oCompoModel.getProperty('/iBabyNum') + oCompoModel.getProperty('/iChildNum'));
                var oSelectOpt = oCompoModel.getProperty('/oSelectOpt');
                var sExtraBed  = "";
                var sBabyBed   = "";
                var sAddlno    = "";
                var sMealno    = "";
                var sWlcamnt   = "";
                var sErchk     = "";
                var sLtchk     = "";
                var sRqstText  = oCompoModel.getProperty('/sRequestText');
                var sETA       = oCompoModel.getProperty('/sETA');
                var sPrice     = String(iFinalPrice);

                for(var i=0; i<oSelectOpt.length; i++){
                    switch(oSelectOpt[i].Option){
                        case '추가 침대':
                            sExtraBed = 'X';
                            break;
                        
                        case '유아용 침대':
                            sBabyBed = 'X';
                            break;
                        
                        case '추가 인원':
                            sAddlno = String(oSelectOpt[i].Quantity);
                            break;
                        
                        case '조식 추가':
                            sMealno = String(oSelectOpt[i].Quantity);
                            break;
                        
                        case 'Welcome Amenity':
                            sWlcamnt = 'X';
                            break;
                        
                        case 'Early Check-In':
                            sErchk = 'X';
                            break;
                        
                        case 'Late Check-Out':
                            sLtchk = 'X';
                            break;
                    }                                
                }

                var oCreateData = {
                    Plant   : sPlantCode,
                    Roomid  : sRoomId,
                    Custid  : sCustId,
                    Indat   : sCheckIn,
                    Outdat  : sCheckOut,
                    CustnoA : sAdult,
                    CustnoC : sChild,
                    Extbed  : sExtraBed,
                    ExtbedB : sBabyBed,
                    Addlno  : sAddlno,
                    Mealno  : sMealno,
                    Wlcamnt : sWlcamnt,
                    Erchk   : sErchk,
                    Ltchk   : sLtchk,
                    Rqtext  : sRqstText,
                    Paycost : sPrice,
                    Paymeth : sPayMethod,
                    Eta     : sETA,
                    Note    : sOrderId
                };

                oModel.create('/FinishSet', oCreateData, {
                    success : function(data, response){
                        console.log(data, response);
                    }, error : function(oError){
                    }});

                /**
                 * 일반 결제
                 */
                switch (sPaymentMethod){
                    case '카드결제':
                        oCompoModel.setProperty('/sPaymentMethod', 'Card');

                        tossPayments.requestPayment('카드', {
                            amount: iFinalPrice,
                            orderId: sOrderId,
                            orderName: sOrderName,
                            customerName: sCustName,
                            customerEmail: sCustEmail,
                            successUrl: 'http://localhost:8080/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#sapsyncodata-display&/goView5',
                            failUrl: 'http://localhost:8080/fail'
                        });
                        break;
                    
                    case '계좌이체':
                        oCompoModel.setProperty('/sPaymentMethod', 'Account');
                        
                        tossPayments.requestPayment('계좌이체',{
                            amount: iFinalPrice,
                            orderId: sOrderId,
                            orderName: sOrderName,
                            customerName: sCustName,
                            customerEmail: sCustEmail,
                            successUrl: 'http://localhost:8080/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#sapsyncodata-display&/goView5',
                            failUrl: 'http://localhost:8080/fail'
                        });
                        break;
                    
                    case '휴대폰':
                        oCompoModel.setProperty('/sPaymentMethod', 'Phone');
                        
                        tossPayments.requestPayment('휴대폰',{
                            amount: iFinalPrice,
                            orderId: sOrderId,
                            orderName: sOrderName,
                            customerName: sCustName,
                            customerEmail: sCustEmail,
                            successUrl: 'http://localhost:8080/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#sapsyncodata-display&/goView5',
                            failUrl: 'http://localhost:8080/fail'
                        });
                        break;

                    case '상품권':
                        oCompoModel.setProperty('/sPaymentMethod', 'Voucher');
                        
                        tossPayments.requestPayment(sPaymentDetail,{
                            amount: iFinalPrice,
                            orderId: sOrderId,
                            orderName: sOrderName,
                            customerName: sCustName,
                            customerEmail: sCustEmail,
                            successUrl: 'http://localhost:8080/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#sapsyncodata-display&/goView5',
                            failUrl: 'http://localhost:8080/fail'
                        });
                        break;
                    
                    case '앱카드':
                        oCompoModel.setProperty('/sPaymentMethod', 'AppCard');
                        
                        tossPayments.requestPayment('카드',{
                            amount: iFinalPrice,
                            orderId: sOrderId,
                            orderName: sOrderName,
                            customerName: sCustName,
                            customerEmail: sCustEmail,
                            successUrl: 'http://localhost:8080/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#sapsyncodata-display&/goView5',
                            failUrl: 'http://localhost:8080/fail',
                            flowMode: 'DIRECT',
                            cardCompany: sPaymentDetail
                        });
                        break;                        
                }

                /**
                 * 간편 결제
                 */
                 switch (sPaymentMethod){
                    case '토스페이':
                        oCompoModel.setProperty('/sPaymentMethod', 'TossPay');

                        tossPayments.requestPayment('카드', {
                            amount: iFinalPrice,
                            orderId: sOrderId,
                            orderName: sOrderName,
                            customerName: sCustName,
                            customerEmail: sCustEmail,
                            successUrl: 'http://localhost:8080/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#sapsyncodata-display&/goView5',
                            flowMode: 'DIRECT',
                            easyPay: sPaymentMethod
                        });
                        break;
                    
                    case '네이버페이':
                        oCompoModel.setProperty('/sPaymentMethod', 'NaverPay');
                        
                        tossPayments.requestPayment('카드',{
                            amount: iFinalPrice,
                            orderId: sOrderId,
                            orderName: sOrderName,
                            customerName: sCustName,
                            customerEmail: sCustEmail,
                            successUrl: 'http://localhost:8080/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#sapsyncodata-display&/goView5',
                            failUrl: 'http://localhost:8080/fail',
                            flowMode: 'DIRECT',
                            easyPay: sPaymentMethod
                        });
                        break;
                    
                    case '삼성페이':
                        oCompoModel.setProperty('/sPaymentMethod', 'SamsungPay');
                        
                        tossPayments.requestPayment('카드',{
                            amount: iFinalPrice,
                            orderId: sOrderId,
                            orderName: sOrderName,
                            customerName: sCustName,
                            customerEmail: sCustEmail,
                            successUrl: 'http://localhost:8080/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#sapsyncodata-display&/goView5',
                            failUrl: 'http://localhost:8080/fail',
                            flowMode: 'DIRECT',
                            easyPay: sPaymentMethod
                        });
                        break;
                    
                    case 'LG페이':
                        oCompoModel.setProperty('/sPaymentMethod', 'LGPay');
                        
                        tossPayments.requestPayment('카드',{
                            amount: iFinalPrice,
                            orderId: sOrderId,
                            orderName: sOrderName,
                            customerName: sCustName,
                            customerEmail: sCustEmail,
                            successUrl: 'http://localhost:8080/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#sapsyncodata-display&/goView5',
                            failUrl: 'http://localhost:8080/fail',
                            flowMode: 'DIRECT',
                            easyPay: sPaymentMethod
                        });
                        break;                        
                }
            }

        });
    });
