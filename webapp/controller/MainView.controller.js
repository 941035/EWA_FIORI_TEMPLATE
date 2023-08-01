sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/library",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,coreLibrary,JSONModel,MessageBox) {
        "use strict";
        var ValueState = coreLibrary.ValueState;
        return Controller.extend("com.parker.ewaformtemp.controller.MainView", {
            onInit: function () {
                this.oDataModel = this.getOwnerComponent().getModel();
                this.oViewModel = this.getOwnerComponent().getModel("viewModel");
                this.getOwnerComponent().setModel(this.oViewModel, "ViewModel");
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("RouteMainView").attachPatternMatched(this._onObjectMatched, this);
                this.keyArray=[];
                this.keyArray1=[];
                this.keyArray2=[];
                this.totalHrs= 0;
               
                

            },
            _onObjectMatched: function(oEvent){
                this.totalHrs= 0;
                this.oViewModel = this.getOwnerComponent().getModel("viewModel");
                var sumHrsTable= this.getView().byId("summaryHrs");
                var costHrsTable = this.getView().byId("costHrs");
                this.getOwnerComponent().setModel(this.oViewModel, "ViewModel");
                if(this.oViewModel.getData().ProjinfoToSummary.length === 0)
                {
                    this.oViewModel.setData(this.refreshPayload());
                    // this.getApprovers();
                    this.getSummaryHrs();
                    this.getCostHours();
                    this.oViewModel.setProperty("/ZoperCode1","");
                    sumHrsTable.getColumns()[2].getAggregation("footer").setValue("");
                    costHrsTable.getColumns()[2].getAggregation("footer").setValue("");
                }
                else{
                    
                    
                    if(this.oViewModel.getData().ProjinfoToSummary.length > 0){
                        sumHrsTable.getColumns()[2].getAggregation("footer").setValue(parseInt(this.oViewModel.getData().ProjinfoToSummary[0].ZtotHours));
                    }
                    if(this.oViewModel.getData().ProjinfoToSummaryCost.length > 0){
                        costHrsTable.getColumns()[2].getAggregation("footer").setValue(parseInt(this.oViewModel.getData().ProjinfoToSummaryCost[0].ZtotalCost));
                    }
                    
                }
                this.oViewModel.refresh(true);
                this.getView().byId("ewaTypTxt").setText(this.getView().byId("ewatype").getProperty("value"));
            },
            getApprovers: function(oEvent){
                var that = this;
                var planWPh = oEvent.getParameter("value");
                this.oDataModel.read("/EWA_MAT_DOLLAR_APPROVERSSet", {
                    urlParameters: {
                        "$filter": "ZplanWph eq '" + planWPh + "'"
                      
                    },
                    
                    success: function (oData) {
                        that.oViewModel.getData().ProjinfoToApprovers = oData.results;
                        that.oViewModel.refresh(true)
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error while fetching Approvers");
                        console.log(oError);

                    }
                });
            },
            getSummaryHrs: function(){
                var that = this;
                this.oDataModel.read("/EWA_F4_ITEM_SUMMARYNEWSet", {
                    
                    success: function (oData) {
                        that.oViewModel.getData().ProjinfoToSummary = oData.results;
                        that.oViewModel.refresh(true)
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error while fetching Summary Hours");
                        console.log(oError);

                    }
                });
            },
            getCostHours: function(){
                var that = this;
                this.oDataModel.read("/EWA_F4_SUM_SUP_COSTSSet", {
                    
                    success: function (oData) {
                        that.oViewModel.getData().ProjinfoToSummaryCost = oData.results;
                        that.oViewModel.refresh(true)
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error while fetching Cost Hours");
                        console.log(oError);

                    }
                });
            },
            handleEWAChange: function (oEvent) {
                var oValidatedComboBox = oEvent.getSource(),
                    sSelectedKey = oValidatedComboBox.getSelectedKey(),
                    qualifiedValue = oEvent.getSource().getSelectedItem().getAggregation("tooltip"),
                    sValue = oValidatedComboBox.getValue();

                if (!sSelectedKey && sValue) {
                    oValidatedComboBox.setValueState(ValueState.Error);
                    oValidatedComboBox.setValueStateText("Please enter a valid EWA or select from dropdown");
                    this.getView().byId("wrktype").setValue("");
                } else {
                    oValidatedComboBox.setValueState(ValueState.None);
                    this.getView().byId("wrktype").setValue(oEvent.getSource().getSelectedItem().getAdditionalText());
                    this.getView().byId("ewaTypTxt").setText(sValue);
                    this.getView().byId("qualified").setText(qualifiedValue);
                    // this.oViewModel.setProperty("/ProjinfoToRd/0/ZrdQualact",qualifiedValue);
                    // this.oViewModel.setProperty("/ZewaType",sSelectedKey);

                    if(qualifiedValue === "Qualified"){
                        this.getView().byId("rdsection1").setVisible(true);
                        this.getView().byId("rdsection2").setVisible(true);
                        this.getView().byId("rdsection3").setVisible(true);
                    }
                    else{
                        this.getView().byId("rdsection1").setVisible(false);
                        this.getView().byId("rdsection2").setVisible(false);
                        this.getView().byId("rdsection3").setVisible(false);
                    }
                    // this.checkQualified(sValue);
                }
            },
            checkQualified: function(value){
                var ewaType = value.split(":")[0];
                if( (ewaType === "ES") || (ewaType === "BP") || (ewaType === "MS") ||
                (ewaType === "CE") || (ewaType === "PES") || (ewaType === "PBP") ||
                (ewaType === "PMS") || (ewaType === "PCE") ){
                    this.getView().byId("qualified").setText("Not Qualified");
                }
                else{
                    this.getView().byId("qualified").setText("Qualified");
                }
            },
            handleCustomerChange: function(oEvent){
                var oValidatedComboBox = oEvent.getSource(),
                    sSelectedKey = oValidatedComboBox.getSelectedKey(),
                    sValue = oValidatedComboBox.getValue();

                if (!sSelectedKey && sValue) {
                    oValidatedComboBox.setValueState(ValueState.Error);
                    oValidatedComboBox.setValueStateText("Please enter a valid Customer or select from dropdown");
                    
                } else {
                    oValidatedComboBox.setValueState(ValueState.None);
                    // this.oViewModel.setProperty("/Zcustomer",sSelectedKey)
                   
                }
            },
            handleProgramChange: function(oEvent){
                var oValidatedComboBox = oEvent.getSource(),
                sSelectedKey = oValidatedComboBox.getSelectedKey(),
                sValue = oValidatedComboBox.getValue();

            if (!sSelectedKey && sValue) {
                oValidatedComboBox.setValueState(ValueState.Error);
                oValidatedComboBox.setValueStateText("Please enter a valid Program or select from dropdown");
                // this.getView().byId("platform").setValue("");
                
            } else {
                oValidatedComboBox.setValueState(ValueState.None);
                // this.getView().byId("platform").setValue(sValue);
                // this.oViewModel.setProperty("/ZprogramCode",sValue);
            }
            },
            handleWrkPackage: function(oEvent){
                var oValidatedComboBox = oEvent.getSource(),
                sSelectedKey = oValidatedComboBox.getSelectedKey(),
                sValue = oValidatedComboBox.getValue();

            if (!sSelectedKey && sValue) {
                oValidatedComboBox.setValueState(ValueState.Error);
                oValidatedComboBox.setValueStateText("Please enter a valid Work Package Fund or select from dropdown");
                this.getView().byId("platform").setValue("");
                
            } else {
                oValidatedComboBox.setValueState(ValueState.None);
                // this.oViewModel.setProperty("/ZworkPackfund",sSelectedKey);
            }
            },
            handleEngPMOChange: function(oEvent){
                var oValidatedComboBox = oEvent.getSource(),
                sSelectedKey = oValidatedComboBox.getSelectedKey(),
                sValue = oValidatedComboBox.getValue();

            if (!sSelectedKey && sValue) {
                oValidatedComboBox.setValueState(ValueState.Error);
                oValidatedComboBox.setValueStateText("Please enter a valid Enhgineering/PMO  or select from dropdown");
               
                
            } else {
                oValidatedComboBox.setValueState(ValueState.None);
                // this.oViewModel.setProperty("/ZewaEngpmo",sSelectedKey);
                
            }
            },
            handleWBSChange: function(oEvent){
                var oValidatedComboBox = oEvent.getSource(),
                sSelectedKey = oValidatedComboBox.getSelectedKey(),
                sValue = oValidatedComboBox.getValue();

            if (!sSelectedKey && sValue) {
                oValidatedComboBox.setValueState(ValueState.Error);
                oValidatedComboBox.setValueStateText("Please enter a valid WBS or select from dropdown");
                // this.getView().byId("revAmend").setValue("");
            } else {
                oValidatedComboBox.setValueState(ValueState.None);
                // this.getView().byId("revAmend").setValue(sSelectedKey);
                // this.getView().byId("revAmend").setValue("");
                // this.oViewModel.setProperty("/ZwbsElement",sSelectedKey);
                this.fetchWorkPkgFunding(sSelectedKey);
                
            } 
            },
            handleCostCentreChange: function(oEvent){
                var oValidatedComboBox = oEvent.getSource(),
                    sSelectedKey = oValidatedComboBox.getSelectedKey(),
                   sValue = oValidatedComboBox.getValue();

                if (!sSelectedKey && sValue) {
                    oValidatedComboBox.setValueState(ValueState.Error);
                    oValidatedComboBox.setValueStateText("Please enter a valid Cost Centre or select from dropdown");
                    
                } else {
                    oValidatedComboBox.setValueState(ValueState.None);
                    
                    // this.oViewModel.setProperty("/Zcostcenter",sSelectedKey);
                    // this.checkQualified(sValue);
                }
            },
            handleSubmit: function(oEvent){
                var that = this;
                var bFlag = this._onSubmitCheck();
                var btnText = oEvent.getSource().getText();
                // this.dummyPayload = this.dummyPayload();
                this.payload = this.preparePayload();
                if(btnText === "Save as Draft" && this.payload.ZewaNo === "0000000000"){
                    this.payload.Zstatus = "S"
                }
                else if(btnText === "Submit"){
                    this.payload.Zstatus="P";
                }
                if(!bFlag){
                this.oDataModel.create("/EWA_PROJECT_INFOSet", this.payload, {

                    success: function (oData,response) {
                        MessageBox.success(JSON.parse(response.headers["sap-message"]).message, {
                            action: [MessageBox.Action.OK],
                            onClose: function (sAction) {
                                
                                that.oViewModel.setData(that.refreshPayload());
                               
                               // that.getOwnerComponent().getModel(that.refreshDataModel, "ViewModel");
                                that.getOwnerComponent().getRouter().navTo("TaskView");
                            }

                        });


                        // MessageBox.success("EWA Request submitted successfully with ref # " + oData.ZewaNo);
                       
                        
                    },
                    error: function (oError) {
                        console.log(oError);
                        that.getView().byId("rdq0MultiCombo").getSelectedKeys(that.keyArray);
                        that.keyArray1= this.getView().byId("rdq3MultiCombo").getSelectedKeys(that.keyArray1);
                        that.keyArray2= this.getView().byId("rdq4MultiCombo").getSelectedKeys(that.keyArray2);


                    }
                });
            }
            },
            _onSubmitCheck: function() {
                var oForm = this.getView().byId("mainForm").getContent();
        
                var sError = false;
        
                oForm.forEach(function(Field) {
                    if (typeof Field.getValue === "function") {
        
                       if(Field.getRequired())
                       {
                            if (!Field.getValue() || Field.getValue().length < 1) {
                            Field.setValueState("Error");
                            Field.setValueStateText("Kindly fill the required Value");
                            sError = true;
        
                        }
                        else {
                            Field.setValueStateText("");
                            Field.setValueState("None");
                        }
                    }
        
                    }
        
                });
                return sError;
        
            },
            refreshPayload: function(){
                var a = {
                    "ZewaNo": "",
                    "Zstatus": "",
                    "ZwbsElement" : "",
                    "ZprogramCode" : "",
                    "Zcustomer" : "",
                    "ZprismProjid" : "",
                    "ZewaEngpmo" : "",
                    "ZworkDesc" : "",
                    "ZewaType" : "",
                    "ZworkOrdtype" : "",
                    "ZpartnoUnitdesc" : "",
                    "Zplatform" : "",
                    "Zfunded" : "",
                    "ZworkPackfund" : "",
                    "ZintEwano" : "",
                    "ZrevAmend" : "",
                    "ZprojMgr" : "",
                    "ZcurrProjmgr" : "",
                    "Zppca" : "",
                    "Zcam" : "",
                    "ZplanStartdate" : "",
                    "ZplnEnddate" : "",
                    "ZoperCode1" : "",
                    "ZplanWph" : "",
                    "ZplanWorkPack":"",
                    "ZmatDollars" : "",
                    "Zcostcenter" : "",
                    "Zworkcenter" : "",
                    "ZrfaNo" : "",
                    "ZratioSow" : "",
                    "ProjinfoToSummary" : [
                      
                     ],
                    "ProjinfoToSummaryCost" :[],
                    "ProjinfoToRd" :[
                      {
                          "ZewaNo" : "",
                          "ZrdQual" : "",
                          "ZrdQualact" : "",
                          "ZrdAagQ1" : "",
                          "ZrdDivisionQ2" : "",
                          "ZrdActivitiesQ3" : "",
                          "ZrdActPerfQ4" : "",
                          "ZrdSpecContract" : "",
                          "ZrdServEffort" : "",
                          "ZrdTypeCert" : "",
                          "ZrdPir" : ""
                     }
                    ],
                    "ProjinfoToApprovers" :[
                      
                    ]
                  };
                  return a;
            },
            preparePayload: function(){
                var hrsSummary = this.prepareSummaryHours();
                var costSummary = this.prepareCostSummaryHrs();
                this.setRDInfoData();
                // this.setOperationCode();
                var data = this.oViewModel.getData();
                if((data.ZewaNo === "") || (data.ZewaNo ==="0000000000")) {
                data.ZewaNo = "0000000000";
                data.ProjinfoToRd[0].ZewaNo="0000000000";
                data.ProjinfoToSummary =  hrsSummary;
                data.ProjinfoToSummaryCost =  costSummary;
                data.ZplanStartdate = this.setLocalTimeZoneZone(data.ZplanStartdate);
                data.ZplnEnddate = this.setLocalTimeZoneZone(data.ZplnEnddate);
                }
                
                return data;
                
                

            },
            calculateCostHrs: function(){
                var sumHrsTable = this.getView().byId("costHrs");
                var sumHrsItem = this.getView().byId("costHrs").getItems();
                this.costtotalHrs= 0;
                
                for(var count =0; count < sumHrsItem.length; count++ ){
                var sPath = this.getView().byId("costHrs").getItems()[count].getBindingContextPath();
                var itemData = this.oViewModel.getProperty(sPath);    
                if(itemData.Zcost != "" ){
                    this.costtotalHrs = this.costtotalHrs + parseInt( itemData.Zcost);
                    
                    }
                    else{
                        this.costtotalHrs = this.costtotalHrs + 0;
                    }
                    
                    }
                    sumHrsTable.getColumns()[2].getAggregation("footer").setValue(parseInt(this.costtotalHrs));
            },
            calculateTotalHrs: function(){
                var sumHrsTable = this.getView().byId("summaryHrs");
                var sumHrsItem = this.getView().byId("summaryHrs").getItems();
                this.totalHrs= 0;
                this.operationCode="";
                this.operCode =[];
                for(var count =0; count < sumHrsItem.length; count++ ){
                var sPath = this.getView().byId("summaryHrs").getItems()[count].getBindingContextPath();
                var itemData = this.oViewModel.getProperty(sPath);    
                if(itemData.Zhours != "" ){
                    this.totalHrs = this.totalHrs + parseInt( itemData.Zhours);
                    this.operCode.push(itemData.ZoperCode);
                    }
                    else{
                        this.totalHrs = this.totalHrs + 0;
                    }
                    
                    }
                    sumHrsTable.getColumns()[2].getAggregation("footer").setValue(parseInt(this.totalHrs));
                    this.operationCode = this.removeDuplicates(this.operCode);
                    this.assignOperationCode(this.operationCode);
                    
                
            },
            assignOperationCode: function(operCodeArr){
                this.oViewModel.setProperty("/ZoperCode1","");
                // this.getView().byId("operCode").removeAllTokens();
                var operationCode="";
                if(operCodeArr.length > 0){
                    for(var counter=0; counter < operCodeArr.length; counter++ )
                    {
                        if(operCodeArr[counter] != ""){
                            if(counter == operCodeArr.length - 1){
                                operationCode = operationCode + operCodeArr[counter] ;
                            }
                            else{
                                operationCode = operationCode + operCodeArr[counter] + ","  ;
                            }
                       
                        }
                    }

                    this.oViewModel.setProperty("/ZoperCode1",operationCode);
                }
                else{
                    this.oViewModel.setProperty("/ZoperCode1","");
                }
                
            },
            removeDuplicates: function(arr) {
                return arr.filter((item,
                    index) => arr.indexOf(item) === index);
            },
            prepareCostSummaryHrs: function(){
                var projectHrs =[];
                this.calculateCostHrs();
                var sumHrsItem = this.getView().byId("costHrs").getItems();
                for(var count =0; count < sumHrsItem.length; count++ ){
                var sPath = this.getView().byId("costHrs").getItems()[count].getBindingContextPath();
                var itemData = this.oViewModel.getProperty(sPath);    
                projectHrs.push(
                    {
                        "ZewaNo" : "0000000000",
                        "ZsumSupCostCode" : itemData.ZsumSupCostCode,
                        "ZsumSupCostDes" : itemData.ZsumSupCostDes,
                        "Zcost" : itemData.Zcost,
                        "ZtotalCost" : this.costtotalHrs.toString()
                   }
                    );
                    
                    }
                    return projectHrs;
            },
            prepareSummaryHours: function(){
                var projectHrs =[];
                this.calculateTotalHrs();
                var sumHrsItem = this.getView().byId("summaryHrs").getItems();
                for(var count =0; count < sumHrsItem.length; count++ ){
                var sPath = this.getView().byId("summaryHrs").getItems()[count].getBindingContextPath();
                var itemData = this.oViewModel.getProperty(sPath); 
                 
                projectHrs.push({
                    "ZewaNo" : "0000000000",
                    "ZsumSuphrs" : itemData.ZsumSuphrs,
                    "ZsumSuphrsDesc":itemData.ZsumSuphrsDesc,
                    "ZoperCode" : itemData.ZoperCode,
                    "Zhours" : itemData.Zhours,
                    "ZtotHours" : this.totalHrs.toString()
                    // "ZtotHours" : itemData.ZtotHours
                    }
                    );
                
                    
                    }
                    return projectHrs;
            },
            setOperationCode: function(){
            // this.operCode = this.getView().byId("operCode").getTokens();
            var operationCode = "";

            if(this.operCode.length > 0){
                for(var count = 0 ; count < this.operCode.length ; count++ ){
                    if(this.operCode[count] != ""){
                        if(count == this.operCode.length - 1){
                            operationCode = operationCode + this.operCode[count] ;
                        }
                        else{
                            operationCode = operationCode + this.operCode[count] + ","  ;
                        }
                   
                    }
                }
                this.oViewModel.setProperty("/ZoperCode",operationCode);
            }
            else{
                this.oViewModel.setProperty("/ZoperCode",""); 
            }
            },
            setRDInfoData: function(){
                this.keyArray= this.getView().byId("rdq0MultiCombo").getSelectedKeys();
                this.keyArray1= this.getView().byId("rdq3MultiCombo").getSelectedKeys();
                this.keyArray2= this.getView().byId("rdq4MultiCombo").getSelectedKeys();
                var keyStr="";
                var keyStr1="";
                var keyStr2="";


                if(this.keyArray.length > 1){
                    for(var count = 0 ; count < this.keyArray.length ; count++ ){
                        if(this.keyArray[count] != ""){
                            if(count == this.keyArray.length - 1){
                                keyStr = keyStr + this.keyArray[count] ;
                            }
                            else{
                                keyStr = keyStr + this.keyArray[count] + ","  ;
                            }
                       
                        }
                    }
                }
                else if(this.keyArray.length === 1){
                    keyStr = this.keyArray[0];
                }
                this.oViewModel.setProperty("/ProjinfoToRd/0/ZrdQualact",keyStr);


              
                if(this.keyArray1.length > 1){
                    for(var counter = 0 ; counter < this.keyArray1.length ; counter++ ){
                        if(this.keyArray1[counter] != ""){
                            if(counter == this.keyArray1.length - 1){
                                keyStr1 = keyStr1 + this.keyArray1[counter] ;
                            }
                            else{
                                keyStr1 = keyStr1 + this.keyArray1[counter] + ","  ;
                            }
                       
                        }
                    }
                }
                else if(this.keyArray1.length === 1){
                    keyStr1 = this.keyArray1[0];
                }
                this.oViewModel.setProperty("/ProjinfoToRd/0/ZrdActivitiesQ3",keyStr1);


                if(this.keyArray2.length > 1){
                    for(var coun = 0 ; coun < this.keyArray2.length ; coun++ ){
                        if(this.keyArray2[coun] != ""){
                            if(coun == this.keyArray2.length - 1){
                                keyStr2 = keyStr2 + this.keyArray2[coun] ;
                            }
                            else{
                                keyStr2 = keyStr2 + this.keyArray2[coun] + ","  ;
                            }
                       
                        }
                    }
                }
                else if(this.keyArray2.length === 1){
                    keyStr2 = this.keyArray2[0];
                }
                this.oViewModel.setProperty("/ProjinfoToRd/0/ZrdActPerfQ4",keyStr2);


            },
            validateSelection: function(oEvent){
                var key = oEvent.getSource().getSelectedKey();
                if((key === "Yes") || (key === "No")){
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                    }
                else{
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Selected Value is not Correct.Kindly select from dropdown");
                }
                
            },
            // handleRdq2: function(oEvent){
            //     this.oViewModel.setProperty("/ProjinfoToRd/0/ZrdDivisionQ2",oEvent.getParameter("value"));
            // },
            // handleRd1_1: function(oEvent){
            //     this.oViewModel.setProperty("/ProjinfoToRd/0/ZrdSpecContract",oEvent.getParameter("value"));
            // },
            // handleRd1_2: function(oEvent){
            //     this.oViewModel.setProperty("/ProjinfoToRd/0/ZrdServEffort",oEvent.getParameter("value"));
            // },
            // handleRd1_3: function(oEvent){
            //     this.oViewModel.setProperty("/ProjinfoToRd/0/ZrdTypeCert",oEvent.getParameter("value"));
            // },
            // handlePIR: function(oEvent){
            //     this.oViewModel.setProperty("/ProjinfoToRd/0/ZrdPir",oEvent.getParameter("value"));
            // },
            // handleZfund: function(oEvent){
            //     this.oViewModel.setProperty("Zfunded",oEvent.getParameter("value"));
            // },
            fetchWorkPkgFunding: function(sSelectedKey){
                var that = this;
                this.oDataModel.read("/EWA_WPFNEWSet", {
                    urlParameters: {
                        "$filter": "Zwbselement eq '" + sSelectedKey + "'"
                      
                    },
                    success: function (oData) {
                        that.oViewModel.setProperty("/Zfunded",oData.results[0].Zfunded);
                        that.oViewModel.setProperty("/ZprismProjid",oData.results[0].PRISMID);
                        that.oViewModel.setProperty("/ZprogramCode",oData.results[0].PROGRMCODE);
                        that.oViewModel.setProperty("/Zcustomer",oData.results[0].CUSTOMER);
                        // var dataModel = new JSONModel();
                        // dataModel.setData({
                        //     WrkPakageSet: oData.results
                        // });
                        // that.getOwnerComponent().setModel(dataModel, "WorkPackage")
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error while fetching Work Package Funding");
                        console.log(oError);

                    }
                });
            },
            showMaterialValueHelp: function(){
                var that = this;
                this._matHelpDialog = null;
			    this._matHelpDialog = sap.ui.xmlfragment(
				"com.parker.ewaformtemp.view.material",
				this
			);
            
            this.getView().addDependent(this._matHelpDialog);
            if(this.getOwnerComponent().getModel("MaterialModel") != undefined){
                this.getOwnerComponent().getModel("MaterialModel").setData({"MaterialSet":[]})
            }
            this._matHelpDialog.open();
            
            },
            handleSearch: function(oEvent){
                var that = this;
                var sSelectedPlant = oEvent.getParameter("value");
                this.oDataModel.read("/EWA_F4_MATERIALSet", {
                    urlParameters: {
                        "$filter": "Werks eq '" + sSelectedPlant + "'"
                      
                    },
                    success: function (oData) {
                        var dataModel = new JSONModel();
                        dataModel.setData({
                            MaterialSet: oData.results
                        });
                        that.getOwnerComponent().setModel(dataModel, "MaterialModel")
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("Error while fetching Material Numbers");
                        console.log(oError);

                    }
                });
            },
            handleClose: function(){
                if (this._matHelpDialog) {
                    this._matHelpDialog.destroy(true);
                    this._matHelpDialog = null;
                }
            },
            handleConfirm: function(oEvent){
                var sPath = oEvent.getParameter("selectedItem").getBindingContextPath();
                var selectedItem = this.getOwnerComponent().getModel("MaterialModel").getProperty(sPath);
                this.oViewModel.setProperty("/ZpartnoUnitdesc",selectedItem.Matnr);
                if (this._matHelpDialog) {
                    this._matHelpDialog.destroy(true);
                    this._matHelpDialog = null;
                }
            },
            setLocalTimeZoneZone : function (datevalue) {
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
            }
           
            
            
        });
    });
