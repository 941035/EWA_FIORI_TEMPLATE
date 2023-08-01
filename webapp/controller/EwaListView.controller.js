$.sap.require("com.parker.ewaformtemp.utils.Formatter");
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/library",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,coreLibrary,JSONModel,MessageBox,Filter,FilterOperator) {
        "use strict";
        var ValueState = coreLibrary.ValueState;
        return Controller.extend("com.parker.ewaformtemp.controller.EwaListView", {
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("TaskView").attachPatternMatched(this._onObjectMatched, this);
                this.oViewModel = this.getOwnerComponent().getModel("viewModel");
                this.oDataModel = this.getOwnerComponent().getModel();

            },
            _onObjectMatched: function(oEvent){
                this.getView().byId("ewaDataTable").getModel().refresh(true);
                // this.refreshDataModel = this.getOwnerComponent().getModel("refreshDataModel");
                // this.oViewModel.setData(this.refreshDataModel.getData());
                
            },
            handlCreateNew:function(){
                this.oViewModel.getData().ProjinfoToSummary = [];
                this.oViewModel.getData().ProjinfoToApprovers = [];
                this.getOwnerComponent().getRouter().navTo("RouteMainView");
            },
            handleLineItemPress: function(oEvent){
                var that = this;
                var selectedItemBindingPath = oEvent.getSource().getBindingContext().getPath();
                var itemData = this.oDataModel.getProperty(selectedItemBindingPath);
                this.ewaNo = itemData.ZewaNo;
                this.oDataModel.read("/EWA_PROJECT_INFOSet", {
                    urlParameters: {
                        "$filter": "ZewaNo eq '" + itemData.ZewaNo + "'",
                        "$expand": "ProjinfoToRd,ProjinfoToSummary,ProjinfoToApprovers,ProjinfoToSummaryCost"
                    },
                    success: function (oData) {
                      that.oViewModel.setData(oData.results[0]);
                      that.oViewModel.getData().ProjinfoToRd = oData.results[0].ProjinfoToRd.results;
                    //   that.oViewModel.getData().ProjinfoToApprovers = oData.results[0].ProjinfoToApprovers.results;
                      that.oViewModel.getData().ProjinfoToSummaryCost = oData.results[0].ProjinfoToSummaryCost.results;
                      that.oViewModel.getData().ProjinfoToSummary = oData.results[0].ProjinfoToSummary.results;
                    //   that.oViewModel.getData().ProjinfoToRd[0].ZoperCode = that.setMultipleKey(oData.results[0].ZoperCode);
                      that.oViewModel.getData().ProjinfoToRd[0].ZrdQualact = that.setMultipleKey(oData.results[0].ProjinfoToRd[0].ZrdQualact);
                      that.oViewModel.getData().ProjinfoToRd[0].ZrdActivitiesQ3 = that.setMultipleKey(oData.results[0].ProjinfoToRd[0].ZrdActivitiesQ3);
                      that.oViewModel.getData().ProjinfoToRd[0].ZrdActPerfQ4 = that.setMultipleKey(oData.results[0].ProjinfoToRd[0].ZrdActPerfQ4);
                      that.getApprovers();
                    //   that.getOwnerComponent().getRouter().navTo("RouteMainView");
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error while fetching EWA Data");
                        console.log(oError);

                    }
                });
            },
          
            onClickCusValueHelp: function(){
                var that = this;
                this._custHelpDialog = null;
			    this._custHelpDialog = sap.ui.xmlfragment(
				"com.parker.ewaformtemp.view.customer",
				this
			);
            
            this.getView().addDependent(this._custHelpDialog);
            if(this.getOwnerComponent().getModel("CustomerModel") != undefined){
                this.getOwnerComponent().getModel("CustomerModel").setData({"CustomerSet":[]})
            }
            this._custHelpDialog.open();
            
            },
            handleSearch: function(oEvent){
                var that = this;
                var sCustomer= oEvent.getParameter("value");
                this.oDataModel.read("/EWA_F4_KUNNRSet", {
                    urlParameters: {
                        "$filter": "Kunnr eq '" + sCustomer + "'"
                      
                    },
                    success: function (oData) {
                        var dataModel = new JSONModel();
                        dataModel.setData({
                            CustomerSet: oData.results
                        });
                        that.getOwnerComponent().setModel(dataModel, "CustomerModel")
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error while fetching Material Numbers");
                        console.log(oError);

                    }
                });
            },
            handleClose: function(){
                if (this._custHelpDialog) {
                    this._custHelpDialog.destroy(true);
                    this._custHelpDialog = null;
                }
            },
            handleConfirm: function(oEvent){
                var sPath = oEvent.getParameter("selectedItem").getBindingContextPath();
                var selectedItem = this.getOwnerComponent().getModel("CustomerModel").getProperty(sPath);
                this.getView().byId("custIdInput").setValue(selectedItem.Kunnr);
                // this.oViewModel.setProperty("/ZpartnoUnitdesc",selectedItem.Matnr);
                if (this._custHelpDialog) {
                    this._custHelpDialog.destroy(true);
                    this._custHelpDialog = null;
                }
            },
            setMultipleKey: function(string){
                var keyArry = [];
                var arr = string.split(",");

                for(var count=0; count < arr.length; count++){

                    if(arr.length > 0){
                        keyArry.push(arr[count]);
                    }
                    else if(arr.length == 0){
                        keyArry.push([]);
                    }
                   
                }

                return keyArry;
            },
            onSearch: function(){
                var searchArray=[];
                var oView = this.getView();
                var created = this.getView().byId("createdDate").getDateValue();
                var srchDate = this.getOrignalTime(this.setLocalTimeZoneZone(created));
                if(srchDate === null){
                    srchDate = "";
                }
                searchArray.push(new Filter("ZwbsElement", FilterOperator.EQ,oView.byId("wbsSearchKey").getSelectedKey()));
				searchArray.push(new Filter("Zstatus", FilterOperator.EQ, oView.byId("statusSearchKey").getSelectedKey()));
                searchArray.push(new Filter("Zcustomer", FilterOperator.EQ,oView.byId("custIdInput").getValue()));
                searchArray.push(new Filter("ZcreationDate",FilterOperator.EQ,srchDate.replaceAll("-","")));
				searchArray.push(new Filter("ZewaNo", FilterOperator.EQ, oView.byId("prismSearchKey").getValue().replace(/^0+/, '')));
                oView.byId("ewaDataTable").getBinding("items").filter(searchArray);
            },
            setLocalTimeZoneZone : function (datevalue) {
                // var orgDate = this.getOrignalTime(datevalue);
                // console.log(orgDate);
                // return orgDate;
                 var dateTime = new Date(datevalue);
                if ((datevalue === null) || (datevalue ==="")) {
                     return null;
                 }
                else if (dateTime !== undefined && dateTime !== null && dateTime !== "") {
                     var offSet = dateTime.getTimezoneOffset();
                     var offSetVal = dateTime.getTimezoneOffset() / 60;
                   var h = Math.floor(Math.abs(offSetVal));
                     var m = Math.floor((Math.abs(offSetVal) * 60) % 60);
                     dateTime = new Date(dateTime.setHours(h, m, 0, 0));
                     return dateTime;
                 }
                 else {
                     return null;
                 }
            },
            getOrignalTime: function(dateTime){
                if (dateTime !== undefined && dateTime !== null && dateTime !== "") {
                    var dateFormat = sap.ui.core.format.DateFormat.getInstance({
                        UTC: true,
                        pattern: 'yyyy-MM-dd',
                        style: "short"
                    });
                    var originalDate = dateFormat.format(new Date(dateTime));
                    return originalDate;
                }
                return null;
            },
            getApprovers: function(oEvent){
                var that = this;
                
                this.oDataModel.read("/EWA_MAT_DOLLAR_APPROVERSSet", {
                    urlParameters: {
                        "$filter": "ZewaNo eq '" + this.ewaNo + "'"
                      
                    },
                    
                    success: function (oData) {
                        that.oViewModel.getData().ProjinfoToApprovers = oData.results;
                        that.oViewModel.refresh(true);
                        that.getOwnerComponent().getRouter().navTo("RouteMainView");
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error while fetching Approvers");
                        console.log(oError);

                    }
                });
            },

            
        });
    });
