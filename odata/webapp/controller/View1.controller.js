sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/ui/unified/DateRange", 
    "sap/m/MessageToast", 
    "sap/ui/core/format/DateFormat", 
    "sap/ui/core/library",
    "sap/ui/unified/DateTypeRange",
    "sap/ui/unified/library",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, UIComponent, DateRange, MessageToast, DateFormat, coreLibrary, DateTypeRange, library, History) {
        "use strict";

        var CalendarType = coreLibrary.CalendarType;
        var CalendarDayType = library.CalendarDayType;

        return Controller.extend("sap.sync.odata.controller.View1", {
            onInit: function () {

                this.oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian});
                /**
                 * minDate, maxDate : 달력선택 가능 날짜 설정
                 */
                var oNow = new Date();
                var oMax = new Date();
                oMax = new Date(oMax.setMonth(oNow.getMonth() + 6));
                var oData = { minDate : oNow, maxDate : oMax }                
                var oDateModel = new JSONModel(oData)
                this.getView().setModel(oDateModel, "date");

                /**
                 * Controller 내부의 데이터 관리
                 */
                var oData = {
                    Seoul: "../images/Seoul.jpg",
                    Jeju: "../images/Jeju.jpg",
                    sPlant: null,
                    iAdult: 1,  sAdult: "성인: 1명",
                    iChild: 0,  sChild: null,
                    iBaby:  0,  sBaby:  null,
                    sNumInfo: null,
                    sDateInfo: null,
                    oHoliInfo: [],
                    oDateInfo: [],
                    iWeekDay: 0,
                    iWeekendDay: 0,
                    iHoliday: 0
                };
                var oDataModel = new JSONModel(oData);
                this.getView().setModel(oDataModel, "view");
                

                /**
                 * 3년치 휴일 정보 업데이트
                 */
                var iLastYear = new Date().getFullYear() - 1;
                for( var iYear = iLastYear; iYear<iLastYear+3; iYear++ ){
                    this._get_holiday(iYear)
                }
            },

            getRouter : function(){
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
                    // no history 일 때 / Login 뒤는 기본값이기 때문에 생략해도 작동
                }
            }, 
            /**
             * 선택 완료 후 다음 페이지로 이동
             */
            onNavToView2: function () {
                var oViewModel  = this.getView().getModel("view"),
                    oCompoModel = this.getOwnerComponent().getModel("InputData"),
                    sPlant      = oViewModel.getProperty("/sPlant"),
                    oDateInfo   = oViewModel.getProperty("/oDateInfo"),
                    sDateInfo   = oViewModel.getProperty("/sDateInfo"),
                    iWeekDay    = oViewModel.getProperty("/iWeekDay"),
                    iWeekendDay = oViewModel.getProperty("/iWeekendDay"),
                    iHoliday    = this.getView().byId("holiDay").getText(),
                    iAdultNum   = oViewModel.getProperty("/iAdult"),
                    iChildNum   = oViewModel.getProperty("/iChild"),
                    iBabyNum    = oViewModel.getProperty("/iBaby"),
                    sNumInfo    = oViewModel.getProperty("/sNumInfo"),
                    sCheckIn    = this.getView().byId("checkInInfo").getText(),
                    sCheckOut   = this.getView().byId("checkOutInfo").getText();

                if(sPlant == null){
                    MessageToast.show("예약 지점을 선택해주세요.");
                } else if(sDateInfo == null){
                    MessageToast.show("예약 날짜를 선택해주세요.");
                } else if(sNumInfo == null){
                    MessageToast.show("예약 인원을 선택해주세요.");
                } else{
                    oCompoModel.setProperty("/sPlant", sPlant);
                    oCompoModel.setProperty("/sCheckIn", sCheckIn);
                    oCompoModel.setProperty("/sCheckOut", sCheckOut);
                    oCompoModel.setProperty("/oDateInfo", oDateInfo);
                    oCompoModel.setProperty("/sDateInfo", sDateInfo);
                    oCompoModel.setProperty("/iWeekDay", iWeekDay);
                    oCompoModel.setProperty("/iWeekendDay", iWeekendDay);
                    oCompoModel.setProperty("/iHoliday", iHoliday);
                    oCompoModel.setProperty("/iAdultNum", iAdultNum);
                    oCompoModel.setProperty("/iChildNum", iChildNum);
                    oCompoModel.setProperty("/iBabyNum", iBabyNum);
                    oCompoModel.setProperty("/sNumInfo", sNumInfo);
                    this.getRouter().navTo("View2");
                }

            },

            _getDatesStartToLast : function (startDate, lastDate) {
                var regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);
                if(!(regex.test(startDate) && regex.test(lastDate))) return "Not Date Format";
                var result = [];
                var curDate = new Date(startDate);
                while(curDate <= new Date(lastDate)) {
                    result.push(curDate.toISOString().split("T")[0]);
                    curDate.setDate(curDate.getDate() + 1);
                }
                return result;
            },

            handleCalendarSelect: function(oEvent) {
                var oCalendar = oEvent.getSource();
                this._updateText(oCalendar.getSelectedDates()[0]);
            },
    
            _updateText: function(oSelectedDates) {
                var oViewModel = this.getView().getModel("view"),
                    oHoliInfo = oViewModel.getProperty("/oHoliInfo"),
                    oSelectedDateFrom = this.byId("selectedDateFrom"),
                    oSelectedDateTo = this.byId("selectedDateTo"),
                    oDate,
                    oCheckIn = this.byId("checkInInfo"),
                    oCheckOut = this.byId("checkOutInfo"),
                    oLimit,
                    iMonth,
                    week = ['일', '월', '화', '수', '목', '금', '토'],
                    oWeekDay = this.getView().byId("weekDay"),
                    oWeekEnd = this.getView().byId("weekendDay"),
                    oHoliday = this.getView().byId("holiDay");

                if (oSelectedDates) {
                    oDate = oSelectedDates.getStartDate();
                    /**
                     * 최대 선택 가능 기간 설정
                     */
                    oLimit = new Date(oSelectedDates.getStartDate());
                    iMonth = oSelectedDates.getStartDate().getMonth() + 1;
                    if (oLimit) {
                        oLimit.setMonth(iMonth)
                        this.getView().byId("calendar").setMaxDate(oLimit)
                    }

                    if (oDate) {
                        oSelectedDateFrom.setText(this.oFormatYyyymmdd.format(oDate));
                        oCheckIn.setText(this.oFormatYyyymmdd.format(oDate));
                    } else {
                        oSelectedDateTo.setText("No Date Selected");
                        oCheckOut.setText("날짜를 선택해주세요.");
                    }
                    /**
                     * Check-Out 날짜 정상 선택 이후 이벤트
                     */
                    oDate = oSelectedDates.getEndDate();
                    if (oDate) {
                        oSelectedDateTo.setText(this.oFormatYyyymmdd.format(oDate));
                        oCheckOut.setText(this.oFormatYyyymmdd.format(oDate));

                        var aResult = this._getDatesStartToLast(oSelectedDateFrom.getText(), oSelectedDateTo.getText())
                        var aWeeks = [];
                        var ilength = aResult.length;
                        var iWeekDay = 0;
                        var iHoli = 0;
                        var iWeekEnd = 0;
                        var sDateInfo;
                        for (var i=0; i<ilength; i++) {
                            var sWeek = week[new Date(aResult[i]).getDay()];
                            if ( oHoliInfo.find( e => e.date == aResult[i] ) ){
                                sWeek = "공휴일"
                            };
                            aWeeks.push(sWeek);
                            if (sWeek == '공휴일'){ 
                                iHoli += 1;
                            } else if(sWeek == '토') {
                                iWeekEnd += 1;
                            } else if(sWeek == '일') {
                                iWeekEnd += 1;
                            } else {
                                iWeekDay += 1;
                            };
                        };

                        sDateInfo = ilength-1 + "박 " + ilength + "일";
                        this.getView().getModel("view").setProperty("/sDateInfo", sDateInfo);
                        oViewModel.setProperty("/iWeekDay", iWeekDay);
                        oViewModel.setProperty("/iWeekendDay", iWeekEnd);
                        oViewModel.setProperty("/iHoliDay", iHoli);
                        oWeekDay.setText(iWeekDay);
                        oWeekEnd.setText(iWeekEnd);
                        oHoliday.setText(iHoli);
                        oViewModel.setProperty("/oDateInfo", aResult);

                    } else {
                        oSelectedDateTo.setText("날짜를 선택해주세요.");
                        oCheckOut.setText("");
                        oWeekDay.setText("");
                        oWeekEnd.setText("");
                        oHoliday.setText("");
                        this.getView().getModel("view").setProperty("/sDateInfo", null);
                    }
                } else {
                    oSelectedDateFrom.setText("날짜를 선택해주세요.");
                    oSelectedDateTo.setText("날짜를 선택해주세요.");
                    oCheckIn.setText("");
                    oCheckOut.setText("");
                    oWeekDay.setText("");
                    oWeekEnd.setText("");
                    oHoliday.setText("");
                    this.getView().getModel("view").setProperty("/sDateInfo", null);
                }
            },
    
            handleSelectThisWeek: function() {
                this._selectWeekInterval(6);
            },
    
            handleSelectWorkWeek: function() {
                this._selectWeekInterval(4);
            },    
    
            _selectWeekInterval: function(iDays) {
                var oCurrent = new Date(), // get current date
                    iWeekStart = oCurrent.getDate() - oCurrent.getDay() + 1,
                    iWeekEnd = iWeekStart + iDays, // end day is the first day + 6
                    oMonday = new Date(oCurrent.setDate(iWeekStart)),
                    oSunday = new Date(oCurrent.setDate(iWeekEnd)),
                    oCalendar = this.byId("calendar");
    
                oCalendar.removeAllSelectedDates();
                oCalendar.addSelectedDate(new DateRange({startDate: oMonday, endDate: oSunday}));
    
                this._updateText(oCalendar.getSelectedDates()[0]);
            },
            /**
             * 날짜 선택 취소 버튼 이벤트
             */
            onCancel : function () {
                var oCalendar = this.getView().byId("calendar"),
                    oSelectedDateFrom = this.byId("selectedDateFrom"),
                    oSelectedDateTo = this.byId("selectedDateTo"),
                    oCheckIn = this.byId("checkInInfo"),
                    oCheckOut = this.byId("checkOutInfo"),
                    oNow = new Date(),
                    oMax = new Date(),
                    oWeekDay = this.getView().byId("weekDay"),
                    oWeekEnd = this.getView().byId("weekendDay"),
                    oHoliday = this.getView().byId("holiDay");

                oMax = new Date(oMax.setMonth(oNow.getMonth() + 6));
                oCalendar.removeAllAriaLabelledBy();

                oCalendar.destroySelectedDates();
                oCalendar.setMaxDate(oMax);
                
                oSelectedDateFrom.setText("날짜를 선택해주세요.");
                oSelectedDateTo.setText("날짜를 선택해주세요.");
                oCheckIn.setText("");
                oCheckOut.setText("");
                oWeekDay.setText("");
                oWeekEnd.setText("");
                oHoliday.setText("");
                this.getView().getModel("view").setProperty("/sDateInfo", null);                
            },
            /** 
             * 휴일 정보 Open API
             */
            _get_holiday : function (iYear) {
                var xhr = new XMLHttpRequest();
                var method = "GET";

                var url = 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?solYear=' + iYear + '&numOfRows=30&ServiceKey=ULIqadZoJxkrxgoIJc4WLIT9S%2Fb%2Fnh1ndduDCoyiKBF5upgSY1%2Bf%2BICdej1ThIINx1gC%2FxqCJ6Ru34qjtN16kg%3D%3D';
                                
                xhr.open(method, url);
                xhr.onreadystatechange = function (oEvent) {
                    const { target } = oEvent;
                
                    if (target.readyState === XMLHttpRequest.DONE) {
                        const { status } = target;
                
                        if (status === 0 || (status >= 200 && status < 400)) {
                            // 요청이 정상적으로 처리 된 경우
                        } else {
                            // 에러가 발생한 경우
                        }
                    }
                };
                xhr.onload = () => {
                    var oViewModel = this.getView().getModel("view");
                    var aDate = xhr.responseText.split('<locdate>');
                    var aName = xhr.responseText.split('<dateName>');
                    var sHoliday;
                    var sHolidayName;
                    var oDateRange;
                    var oHoliday = new Date();
                    var oDate = [];
                    var oHoliInfo = oViewModel.getProperty("/oHoliInfo");
                    var iIndex = 0;
                    var oCalendar = this.getView().byId("calendar")
                    for (var i=1; i<aDate.length; i++){
                        sHoliday = aDate[i].substring(0,4) + '-' + aDate[i].substring(4,6) + '-' + aDate[i].substring(6,8);
                        oHoliday = new Date(sHoliday)                        
                        iIndex = aName[i].indexOf('</');
                        sHolidayName = aName[i].substring(0,iIndex);
                        oDate.push(oHoliday)
                        oHoliInfo.push( {date: sHoliday, name: sHolidayName} )
                        oDateRange = new DateTypeRange({ startDate : oHoliday})
                        oCalendar.addSpecialDate(new DateTypeRange({
                            startDate : oHoliday, color : 'red', type : CalendarDayType.NonWorking,
                            tooltip: sHolidayName
                        }))
                    };
                    oViewModel.setProperty("/oHoliInfo", oHoliInfo);
                };
                xhr.send('');
            },
            /**
             * 선택 완료 버튼 이벤트
             */
            onSelctInfo: function () {
                var oTabBar = this.getView().byId("iconTabBar");
                oTabBar.setExpanded(false);
            },
            /**
             * 콤보 박스 선택 이후 이벤트
             */
            _updateNumInfo: function () {
                var oViewModel = this.getView().getModel("view");
                var sAdult = oViewModel.getProperty("/sAdult");
                var sChild = oViewModel.getProperty("/sChild");
                var sBaby  = oViewModel.getProperty("/sBaby" );
                var sNumInfo;                
                var oComboBox = this.getView().byId("adultNum");
                var sValue = sAdult.substring(4,6)

                if(sAdult){
                    sNumInfo = sAdult;
                };

                if(sChild){
                    sNumInfo += ' / ' + sChild;
                };
                if(sBaby){
                    sNumInfo += ' / ' + sBaby;
                };
                oViewModel.setProperty("/sNumInfo", sNumInfo);
                oComboBox.setValue(sValue)
            },
            /**
             * 성인 인원 콤보 박스 이벤트
             */
            onAdultNum: function () {
                var oComboBox = this.getView().byId("adultNum");
                var sAdultNum = oComboBox.getSelectedKey();
                var oViewModel = this.getView().getModel("view");
                var iChild = oViewModel.getProperty("/iChild");
                var iBaby  = oViewModel.getProperty("/iBaby");
                
                switch (sAdultNum) {
                    case "adult1":
                        oViewModel.setProperty("/iAdult", 1);
                        oViewModel.setProperty("/sAdult", "성인: 1명");
                        break;

                    case "adult2":
                        if(iChild+iBaby < 3){
                            oViewModel.setProperty("/iAdult", 2);
                            oViewModel.setProperty("/sAdult", "성인: 2명");
                        } else{
                            oViewModel.setProperty("/iAdult", 1);
                            oViewModel.setProperty("/sAdult", "성인: 1명");
                            MessageToast.show("예약 인원은 최대 4인까지 가능합니다.");
                            oComboBox.setValue("");
                        }
                        break;

                    case "adult3":
                        if(iChild+iBaby < 2){
                            oViewModel.setProperty("/iAdult", 3);
                            oViewModel.setProperty("/sAdult", "성인: 3명");
                        } else{
                            oViewModel.setProperty("/iAdult", 1);
                            oViewModel.setProperty("/sAdult", "성인: 1명");
                            MessageToast.show("예약 인원은 최대 4인까지 가능합니다.");
                            oComboBox.setValue("");
                        }
                        break;

                    case "adult4":
                        if(iChild+iBaby == 0){
                            oViewModel.setProperty("/iAdult", 4);
                            oViewModel.setProperty("/sAdult", "성인: 4명");
                        } else{
                            oViewModel.setProperty("/iAdult", 1);
                            oViewModel.setProperty("/sAdult", "성인: 1명");
                            MessageToast.show("예약 인원은 최대 4인까지 가능합니다.");
                            oComboBox.setValue("");
                        }
                }
                this._updateNumInfo();
            },
            /**
             * 아동 인원 콤보 박스 이벤트
             */
            onChildNum: function () {
                var oComboBox = this.getView().byId("childNum");
                var sChildNum = oComboBox.getSelectedKey();
                var oViewModel = this.getView().getModel("view");
                var iAdult = oViewModel.getProperty("/iAdult");
                var iBaby  = oViewModel.getProperty("/iBaby");
                
                switch (sChildNum) {
                    case "child0":
                        oViewModel.setProperty("/iChild", 0);
                        oViewModel.setProperty("/sChild", null);
                        oComboBox.setValue("");
                        break;

                    case "child1":
                        if(iAdult+iBaby < 4){
                            oViewModel.setProperty("/iChild", 1);
                            oViewModel.setProperty("/sChild", "아동: 1명");
                        } else{
                            oViewModel.setProperty("/iChild", 0);
                            oViewModel.setProperty("/sChild", null);
                            MessageToast.show("예약 인원은 최대 4인까지 가능합니다.");
                            oComboBox.setValue("");
                        }
                        break;

                    case "child2":
                        if(iAdult+iBaby < 3){
                            oViewModel.setProperty("/iChild", 2);
                            oViewModel.setProperty("/sChild", "아동: 2명");
                        } else{
                            oViewModel.setProperty("/iChild", 0);
                            oViewModel.setProperty("/sChild", null);
                            MessageToast.show("예약 인원은 최대 4인까지 가능합니다.");
                            oComboBox.setValue("");
                        }
                        break;

                    case "child3":
                        if(iAdult+iBaby < 2){
                            oViewModel.setProperty("/iChild", 3);
                            oViewModel.setProperty("/sChild", "아동: 3명");
                        } else{
                            oViewModel.setProperty("/iChild", 0);
                            oViewModel.setProperty("/sChild", null);
                            MessageToast.show("예약 인원은 최대 4인까지 가능합니다.");
                            oComboBox.setValue("");
                        }
                        break;
                }
                this._updateNumInfo();
            },
            /**
             * 아동 인원 콤보 박스 이벤트
             */
            onBabyNum: function () {
                var oComboBox = this.getView().byId("babyNum");
                var sBabyNum = oComboBox.getSelectedKey();
                var oViewModel = this.getView().getModel("view");
                var iAdult = oViewModel.getProperty("/iAdult");
                var iChild = oViewModel.getProperty("/iChild");
                
                switch (sBabyNum) {
                    case "baby0":
                        oViewModel.setProperty("/iBaby", 0);
                        oViewModel.setProperty("/sBaby", null);
                        oComboBox.setValue("");
                        break;

                    case "baby1":
                        if(iAdult+iChild < 4){
                            oViewModel.setProperty("/iBaby", 1);
                            oViewModel.setProperty("/sBaby", "유아: 1명");
                        } else{
                            oViewModel.setProperty("/iBaby", 0);
                            oViewModel.setProperty("/sBaby", null);
                            MessageToast.show("예약 인원은 최대 4인까지 가능합니다.");
                            oComboBox.setValue("");
                        }
                        break;

                    case "baby2":
                        if(iAdult+iChild < 3){
                            oViewModel.setProperty("/iBaby", 2);
                            oViewModel.setProperty("/sBaby", "유아: 2명");
                        } else{
                            oViewModel.setProperty("/iBaby", 0);
                            oViewModel.setProperty("/sBaby", null);
                            MessageToast.show("예약 인원은 최대 4인까지 가능합니다.");
                            oComboBox.setValue("");
                        }
                        break;

                    case "baby3":
                        if(iAdult+iChild < 2){
                            oViewModel.setProperty("/iBaby", 3);
                            oViewModel.setProperty("/sBaby", "유아: 3명");
                        } else{
                            oViewModel.setProperty("/iBaby", 0);
                            oViewModel.setProperty("/sBaby", null);
                            MessageToast.show("예약 인원은 최대 4인까지 가능합니다.");
                            oComboBox.setValue("");
                        }
                        break;
                }
                this._updateNumInfo();
            },
            /**
             * 지점 선택 이벤트
             */
            onPressItem: function (oEvent) {
                
                var sPath = oEvent.getParameter("listItem");
                var sPlant = sPath.sId.substring(52);
                var oViewModel = this.getView().getModel("view");
                if (sPlant == "Seoul"){
                    oViewModel.setProperty("/sPlant", "Grand SAP Seoul(서울 본점)");
                } else if (sPlant == "Jeju"){
                    oViewModel.setProperty("/sPlant", "Grand SAP Jeju(제주 지점)");
                } else {
                    oViewModel.setProperty("/sPlant", null);
                    MessageToast.show("잘못된 접근입니다.");
                };
            }
            
        });
    });
    