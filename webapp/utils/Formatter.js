/* global hcm, zhcm */

$.sap.declare("com.parker.ewaformtemp.utils.Formatter");

com.parker.ewaformtemp.utils.Formatter = {};


com.parker.ewaformtemp.utils.Formatter.convertStringtoDate = function (value) {
	if(value.length > 0){
        return value.substring(0,4) + "-" + value.substring(4,6) + "-" + value.substring(6,8)
    }
    else{
        return "";
    }


};




