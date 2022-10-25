sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/ui/unified/DateRange", 
    "sap/m/MessageToast", 
    "sap/ui/core/format/DateFormat", 
    "sap/ui/core/library",
    "sap/ui/unified/DateTypeRange",
    "sap/ui/unified/library"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, UIComponent, DateRange, MessageToast, DateFormat, coreLibrary, DateTypeRange, library) {
        "use strict";

        return Controller.extend("sap.sync.odata.controller.Login", {
            onInit: function () {
                var oData = {

                };
                var oDataModel = new JSONModel(oData);
                this.getView().setModel(oDataModel, "Login");
                
            },

            getRouter: function(){
                return UIComponent.getRouterFor(this);
            }, 

            onLogin: function(){
                var oModel      = this.getView().getModel();
                var oCompoModel = this.getOwnerComponent().getModel("InputData");
                var sCustId     = this.getView().byId('custId').getValue();
                var sPassword   = this.getView().byId('password').getValue();
                var sPath       = "/LoginSampleSet(Custid='" + sCustId + "',Password='" + sPassword + "')";

                if(sCustId == ''){
                    MessageToast.show('아이디를 입력해주세요.');
                } else if(sPassword == ''){
                    MessageToast.show('비밀번호를 입력해주세요.');
                } else{
                    oModel.read(sPath, {
                        success: function(data){                        
                            switch (data.Note){
                                case '로그인 성공':
                                    oCompoModel.setProperty('/sCustId', sCustId);
                                    this.getRouter().navTo("View1");
                                    break;
                                default:
                                    MessageToast.show(data.Note);
                                    break;
                            }
                        }.bind(this)
                    })
                }                
            }
            
        });
    });
    