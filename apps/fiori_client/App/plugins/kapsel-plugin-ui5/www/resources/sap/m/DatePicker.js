/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/Device','./InputBase','./DateTimeField','sap/ui/core/date/UniversalDate','./library','sap/ui/core/Control','sap/ui/core/library',"./DatePickerRenderer","sap/base/util/deepEqual","sap/base/assert","sap/base/Log","sap/ui/core/IconPool","sap/ui/core/Popup","./InstanceManager","sap/ui/dom/jquery/cursorPos"],function(q,D,I,a,U,l,C,c,b,d,e,L,f,P,g){"use strict";var T=c.TextAlign;var h=c.CalendarType;var i;var j=a.extend("sap.m.DatePicker",{metadata:{library:"sap.m",properties:{displayFormatType:{type:"string",group:"Appearance",defaultValue:""},secondaryCalendarType:{type:"sap.ui.core.CalendarType",group:"Appearance",defaultValue:null},minDate:{type:"object",group:"Misc",defaultValue:null},maxDate:{type:"object",group:"Misc",defaultValue:null}},aggregations:{specialDates:{type:"sap.ui.core.Element",multiple:true,singularName:"specialDate"}},associations:{legend:{type:"sap.ui.core.Control",multiple:false}},events:{navigate:{parameters:{dateRange:{type:"sap.ui.unified.DateRange"}}}},designtime:"sap/m/designtime/DatePicker.designtime"}});j.prototype.init=function(){a.prototype.init.apply(this,arguments);this._bIntervalSelection=false;this._bOnlyCalendar=true;this._bValid=true;this._oMinDate=new Date(1,0,1);this._oMinDate.setFullYear(1);this._oMaxDate=new Date(9999,11,31,23,59,59,999);var t=this.addEndIcon({id:this.getId()+"-icon",src:this.getIconSrc(),noTabStop:true,title:""});this._bShouldClosePicker=false;t.addEventDelegate({onmousedown:function(E){this._bShouldClosePicker=!!this.isOpen();}},this);t.attachPress(function(){this.toggleOpen(this._bShouldClosePicker);},this);};j.prototype.isOpen=function(){return this._oPopup&&this._oPopup.isOpen();};j.prototype.toggleOpen=function(O){if(this.getEditable()&&this.getEnabled()){if(O){k.call(this);}else{_.call(this);}}};j.prototype.getIconSrc=function(){return f.getIconURI("appointment-2");};j.prototype.exit=function(){I.prototype.exit.apply(this,arguments);if(this._oPopup){if(this._oPopup.isOpen()){this._oPopup.close();}delete this._oPopup;}if(this._oCalendar){this._oCalendar.destroy();delete this._oCalendar;}if(this._iInvalidateCalendar){clearTimeout(this._iInvalidateCalendar);}this._sUsedDisplayPattern=undefined;this._sUsedDisplayCalendarType=undefined;this._oDisplayFormat=undefined;this._sUsedValuePattern=undefined;this._sUsedValueCalendarType=undefined;this._oValueFormat=undefined;};j.prototype.invalidate=function(O){if(!O||O!=this._oCalendar){C.prototype.invalidate.apply(this,arguments);this._iInvalidateCalendar=setTimeout(s.bind(this),0);}};j.prototype.onBeforeRendering=function(){a.prototype.onBeforeRendering.apply(this,arguments);this._checkMinMaxDate();var v=this._getValueHelpIcon();if(v){v.setProperty("visible",this.getEditable(),true);}};j.prototype.setWidth=function(w){return I.prototype.setWidth.call(this,w||"100%");};j.prototype.getWidth=function(w){return this.getProperty("width")||"100%";};j.prototype.applyFocusInfo=function(F){this._bFocusNoPopup=true;I.prototype.applyFocusInfo.apply(this,arguments);};j.prototype.onfocusin=function(E){if(!q(E.target).hasClass("sapUiIcon")){I.prototype.onfocusin.apply(this,arguments);}this._bFocusNoPopup=undefined;};j.prototype.onsapshow=function(E){this.toggleOpen(this.isOpen());E.preventDefault();};j.prototype.onsaphide=j.prototype.onsapshow;j.prototype.onsappageup=function(E){m.call(this,1,"day");E.preventDefault();};j.prototype.onsappageupmodifiers=function(E){if(!E.ctrlKey&&E.shiftKey){m.call(this,1,"month");}else{m.call(this,1,"year");}E.preventDefault();};j.prototype.onsappagedown=function(E){m.call(this,-1,"day");E.preventDefault();};j.prototype.onsappagedownmodifiers=function(E){if(!E.ctrlKey&&E.shiftKey){m.call(this,-1,"month");}else{m.call(this,-1,"year");}E.preventDefault();};j.prototype.onkeypress=function(E){if(!E.charCode||E.metaKey||E.ctrlKey){return;}var F=this._getFormatter(true);var t=String.fromCharCode(E.charCode);if(t&&F.sAllowedCharacters&&F.sAllowedCharacters.indexOf(t)<0){E.preventDefault();}};j.prototype._getValueHelpIcon=function(){var v=this.getAggregation("_endIcon");return v&&v[0];};j.prototype._dateValidation=function(t){this._bValid=true;if(t&&(t.getTime()<this._oMinDate.getTime()||t.getTime()>this._oMaxDate.getTime())){this._bValid=false;e(this._bValid,"Date must be in valid range");}this.setProperty("dateValue",t);return t;};j.prototype.setMinDate=function(t){if(this._isValidDate(t)){throw new Error("Date must be a JavaScript date object; "+this);}if(d(this.getMinDate(),t)){return this;}if(t){var y=t.getFullYear();if(y<1||y>9999){throw new Error("Date must be between 0001-01-01 and 9999-12-31; "+this);}this._oMinDate=new Date(t.getTime());var u=this.getDateValue();if(u&&u.getTime()<t.getTime()){L.warning("DateValue not in valid date range",this);}}else{this._oMinDate=new Date(1,0,1);this._oMinDate.setFullYear(1);}this.setProperty("minDate",t);if(this._oCalendar){this._oCalendar.setMinDate(t);}this._oMinDate.setHours(0,0,0,0);return this;};j.prototype.setMaxDate=function(t){if(this._isValidDate(t)){throw new Error("Date must be a JavaScript date object; "+this);}if(d(this.getMaxDate(),t)){return this;}if(t){var y=t.getFullYear();if(y<1||y>9999){throw new Error("Date must be between 0001-01-01 and 9999-12-31; "+this);}this._oMaxDate=new Date(t.getTime());var u=this.getDateValue();if(u&&u.getTime()>t.getTime()){L.warning("DateValue not in valid date",this);}}else{this._oMaxDate=new Date(9999,11,31,23,59,59,999);}this.setProperty("maxDate",t);if(this._oCalendar){this._oCalendar.setMaxDate(t);}this._oMaxDate.setHours(23,59,59,999);return this;};j.prototype._checkMinMaxDate=function(){if(this._oMinDate.getTime()>this._oMaxDate.getTime()){L.warning("minDate > MaxDate -> dates switched",this);var M=new Date(this._oMinDate.getTime());var t=new Date(this._oMaxDate.getTime());this._oMinDate=new Date(t.getTime());this._oMaxDate=new Date(M.getTime());this.setProperty("minDate",t,true);this.setProperty("maxDate",M,true);if(this._oCalendar){this._oCalendar.setMinDate(t);this._oCalendar.setMaxDate(M);}}var u=this.getDateValue();if(u&&(u.getTime()<this._oMinDate.getTime()||u.getTime()>this._oMaxDate.getTime())){L.error("dateValue "+u.toString()+"(value="+this.getValue()+") does not match "+"min/max date range("+this._oMinDate.toString()+" - "+this._oMaxDate.toString()+"). App. "+"developers should take care to maintain dateValue/value accordingly.",this);}};j.prototype.getDisplayFormatType=function(){return this.getProperty("displayFormatType");};j.prototype._handleDateValidation=function(t){this._bValid=true;if(!t||t.getTime()<this._oMinDate.getTime()||t.getTime()>this._oMaxDate.getTime()){this._bValid=false;L.warning("Value can not be converted to a valid date",this);}this.setProperty("dateValue",t);};j.prototype.setDisplayFormatType=function(t){if(t){var F=false;for(var u in h){if(u==t){F=true;break;}}if(!F){throw new Error(t+" is not a valid calendar type"+this);}}this.setProperty("displayFormatType",t,true);this.setDisplayFormat(this.getDisplayFormat());return this;};j.prototype.setSecondaryCalendarType=function(t){this._bSecondaryCalendarTypeSet=true;this.setProperty("secondaryCalendarType",t,true);if(this._oCalendar){this._oCalendar.setSecondaryCalendarType(t);}return this;};j.prototype.addSpecialDate=function(S){r.call(this,S);this.addAggregation("specialDates",S,true);s.call(this);return this;};j.prototype.insertSpecialDate=function(S,t){r.call(this,S);this.insertAggregation("specialDates",S,t,true);s.call(this);return this;};j.prototype.removeSpecialDate=function(S){var R=this.removeAggregation("specialDates",S,true);s.call(this);return R;};j.prototype.removeAllSpecialDates=function(){var R=this.removeAllAggregation("specialDates",true);s.call(this);return R;};j.prototype.destroySpecialDates=function(){this.destroyAggregation("specialDates",true);s.call(this);return this;};j.prototype.setLegend=function(t){this.setAssociation("legend",t,true);var u=this.getLegend();if(u){var v=sap.ui.require("sap/ui/unified/CalendarLegend");t=sap.ui.getCore().byId(u);if(t&&!(typeof v=="function"&&t instanceof v)){throw new Error(t+" is not an sap.ui.unified.CalendarLegend. "+this);}}if(this._oCalendar){this._oCalendar.setLegend(u);}return this;};j.prototype.onChange=function(E){if(!this.getEditable()||!this.getEnabled()){return;}var v=this._$input.val();var O=this._formatValue(this.getDateValue());if(v==O&&this._bValid){return;}var t;this._bValid=true;if(v!=""){t=this._parseValue(v,true);if(!t||t.getTime()<this._oMinDate.getTime()||t.getTime()>this._oMaxDate.getTime()){this._bValid=false;t=undefined;}else{v=this._formatValue(t);}}if(this.getDomRef()&&(this._$input.val()!==v)){this._$input.val(v);this._curpos=this._$input.cursorPos();}if(t){v=this._formatValue(t,true);}if(this._lastValue!==v||(t&&this.getDateValue()&&t.getFullYear()!==this.getDateValue().getFullYear())){this._lastValue=v;this.setProperty("value",v,true);var N=this.getValue();if(this._bValid&&v==N){this.setProperty("dateValue",t,true);}v=N;if(this.isOpen()){if(this._bValid){t=this.getDateValue();}this._oCalendar.focusDate(t);var S=this._oDateRange.getStartDate();if((!S&&t)||(S&&t&&S.getTime()!=t.getTime())){this._oDateRange.setStartDate(new Date(t.getTime()));}else if(S&&!t){this._oDateRange.setStartDate(undefined);}}this.fireChangeEvent(v,{valid:this._bValid});}};j.prototype._getInputValue=function(v){v=(typeof v=="undefined")?this._$input.val():v.toString();var t=this._parseValue(v,true);v=this._formatValue(t,true);return v;};j.prototype.updateDomValue=function(v){if(this.isActive()&&(this._$input.val()!==v)){this._bCheckDomValue=true;v=(typeof v=="undefined")?this._$input.val():v.toString();this._curpos=this._$input.cursorPos();var t=this._parseValue(v,true);v=this._formatValue(t);this._$input.val(v);this._$input.cursorPos(this._curpos);}return this;};j.prototype._storeInputSelection=function(t){if((D.browser.msie||D.browser.edge)&&!D.support.touch){this._oInputSelBeforePopupOpen={iStart:t.selectionStart,iEnd:t.selectionEnd};t.selectionStart=0;t.selectionEnd=0;}};j.prototype._restoreInputSelection=function(t){if((D.browser.msie||D.browser.edge)&&!D.support.touch){t.selectionStart=this._oInputSelBeforePopupOpen.iStart;t.selectionEnd=this._oInputSelBeforePopupOpen.iEnd;}};function _(){this._createPopup();this._createPopupContent();var t;var B=this.getBinding("value");if(B&&B.oType&&B.oType.oOutputFormat){t=B.oType.oOutputFormat.oFormatOptions.calendarType;}else if(B&&B.oType&&B.oType.oFormat){t=B.oType.oFormat.oFormatOptions.calendarType;}if(!t){t=this.getDisplayFormatType();}if(t){this._oCalendar.setPrimaryCalendarType(t);}var v=this._bValid?this._formatValue(this.getDateValue()):this.getValue();if(v!=this._$input.val()){this.onChange();}this._fillDateRange();this._openPopup();this.fireNavigate({dateRange:this._getVisibleDatesRange(this._oCalendar)});}j.prototype._createPopup=function(){if(!this._oPopup){this._oPopup=new P();this._oPopup.setAutoClose(true);this._oPopup.setDurations(0,0);this._oPopup.attachOpened(n,this);this._oPopup.attachClosed(o,this);}};j.prototype._openPopup=function(){if(!this._oPopup){return;}this._storeInputSelection(this._$input.get(0));this._oPopup.setAutoCloseAreas([this.getDomRef()]);var t=P.Dock;var A;if(this.getTextAlign()==T.End){A=t.EndBottom+"-4";this._oPopup.open(0,t.EndTop,A,this,null,"fit",true);}else{A=t.BeginBottom+"-4";this._oPopup.open(0,t.BeginTop,A,this,null,"fit",true);}};j.prototype._getVisibleDatesRange=function(t){var v=t._getVisibleDays();return new sap.ui.unified.DateRange({startDate:v[0].toLocalJSDate(),endDate:v[v.length-1].toLocalJSDate()});};j.prototype._createPopupContent=function(){if(!this._oCalendar){if(!i){sap.ui.getCore().loadLibrary("sap.ui.unified");i=sap.ui.requireSync("sap/ui/unified/Calendar");}this._oCalendar=new i(this.getId()+"-cal",{intervalSelection:this._bIntervalSelection,minDate:this.getMinDate(),maxDate:this.getMaxDate(),legend:this.getLegend(),startDateChange:function(){this.fireNavigate({dateRange:this._getVisibleDatesRange(this._oCalendar)});}.bind(this)});this._oDateRange=new sap.ui.unified.DateRange();this._oCalendar.addSelectedDate(this._oDateRange);if(this.$().closest(".sapUiSizeCompact").length>0){this._oCalendar.addStyleClass("sapUiSizeCompact");}if(this._bSecondaryCalendarTypeSet){this._oCalendar.setSecondaryCalendarType(this.getSecondaryCalendarType());}if(this._bOnlyCalendar){this._oCalendar.attachSelect(this._selectDate,this);this._oCalendar.attachCancel(k,this);this._oCalendar.attachEvent("_renderMonth",p,this);this._oCalendar.setPopupMode(true);this._oCalendar.setParent(this,undefined,true);this._oPopup.setContent(this._oCalendar);}}};j.prototype._fillDateRange=function(){var t=this.getDateValue();if(t&&t.getTime()>=this._oMinDate.getTime()&&t.getTime()<=this._oMaxDate.getTime()){this._oCalendar.focusDate(new Date(t.getTime()));if(!this._oDateRange.getStartDate()||this._oDateRange.getStartDate().getTime()!=t.getTime()){this._oDateRange.setStartDate(new Date(t.getTime()));}}else{var u=this.getInitialFocusedDateValue();var F=u?u:new Date();var M=this._oMaxDate.getTime();if(F.getTime()<this._oMinDate.getTime()||F.getTime()>M){F=this._oMinDate;}this._oCalendar.focusDate(F);if(this._oDateRange.getStartDate()){this._oDateRange.setStartDate(undefined);}}};j.prototype.getAccessibilityInfo=function(){var R=this.getRenderer();var t=I.prototype.getAccessibilityInfo.apply(this,arguments);var v=this.getValue()||"";if(this._bValid){var u=this.getDateValue();if(u){v=this._formatValue(u);}}t.type=sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_DATEINPUT");t.description=[v,R.getLabelledByAnnouncement(this),R.getDescribedByAnnouncement(this)].join(" ").trim();return t;};j.prototype._selectDate=function(E){var t=this.getDateValue();var u=this._getSelectedDate();var v="";if(!d(u,t)){this.setDateValue(new Date(u.getTime()));v=this.getValue();this.fireChangeEvent(v,{valid:true});if(this.getDomRef()&&(D.system.desktop||!D.support.touch)){this._curpos=this._$input.val().length;this._$input.cursorPos(this._curpos);}}else if(!this._bValid){v=this._formatValue(u);if(v!=this._$input.val()){this._bValid=true;if(this.getDomRef()){this._$input.val(v);this._lastValue=v;}v=this._formatValue(u,true);this.setProperty("value",v,true);this.fireChangeEvent(v,{valid:true});}}else if(D.system.desktop||!D.support.touch){this.focus();}this._oPopup.close();};j.prototype._getSelectedDate=function(){var S=this._oCalendar.getSelectedDates();var t;if(S.length>0){t=S[0].getStartDate();}return t;};function k(E){if(this.isOpen()){this._oPopup.close();if((D.system.desktop||!D.support.touch)){this.focus();}}}function m(N,u){var O=this.getDateValue();var t=this._$input.cursorPos();if(O&&this.getEditable()&&this.getEnabled()){var v;var B=this.getBinding("value");if(B&&B.oType&&B.oType.oOutputFormat){v=B.oType.oOutputFormat.oFormatOptions.calendarType;}else if(B&&B.oType&&B.oType.oFormat){v=B.oType.oFormat.oFormatOptions.calendarType;}if(!v){v=this.getDisplayFormatType();}var w=U.getInstance(new Date(O.getTime()),v);O=U.getInstance(new Date(O.getTime()),v);switch(u){case"day":w.setDate(w.getDate()+N);break;case"month":w.setMonth(w.getMonth()+N);var M=(O.getMonth()+N)%12;if(M<0){M=12+M;}while(w.getMonth()!=M){w.setDate(w.getDate()-1);}break;case"year":w.setFullYear(w.getFullYear()+N);while(w.getMonth()!=O.getMonth()){w.setDate(w.getDate()-1);}break;default:break;}if(w.getTime()<this._oMinDate.getTime()){w=new U(this._oMinDate.getTime());}else if(w.getTime()>this._oMaxDate.getTime()){w=new U(this._oMaxDate.getTime());}if(!d(this.getDateValue(),w.getJSDate())){this.setDateValue(new Date(w.getTime()));this._curpos=t;this._$input.cursorPos(this._curpos);var V=this.getValue();this.fireChangeEvent(V,{valid:true});}}}function n(E){this.addStyleClass(I.ICON_PRESSED_CSS_CLASS);this._renderedDays=this._oCalendar.$("-Month0-days").find(".sapUiCalItem").length;this.$("inner").attr("aria-owns",this.getId()+"-cal");this.$("inner").attr("aria-expanded",true);g.addPopoverInstance(this._oPopup);}function o(E){this.removeStyleClass(I.ICON_PRESSED_CSS_CLASS);this.$("inner").attr("aria-expanded",false);this._restoreInputSelection(this._$input.get(0));g.removePopoverInstance(this._oPopup);}function p(E){var t=E.getParameter("days");if(t>this._renderedDays){this._renderedDays=t;this._oPopup._applyPosition(this._oPopup._oLastPosition);}}function r(S){var t=sap.ui.require("sap/ui/unified/DateTypeRange");if(S&&!(t&&S instanceof t)){throw new Error(S+"is not valid for aggregation \"specialDates\" of "+this);}}function s(){if(this.isOpen()){this._oCalendar._bDateRangeChanged=true;this._oCalendar.invalidate();}}return j;});
