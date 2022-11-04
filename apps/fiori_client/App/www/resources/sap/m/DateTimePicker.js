/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./InputBase','./DatePicker','sap/ui/model/type/Date','sap/ui/unified/DateRange','./library','sap/ui/core/Control','sap/ui/Device','sap/ui/core/format/DateFormat','sap/ui/core/LocaleData','./DateTimePickerRenderer','./TimePickerSliders',"sap/ui/events/KeyCodes","sap/ui/core/IconPool"],function(q,I,D,a,b,l,C,c,d,L,e,T,K,f){"use strict";var P=l.PlacementType;var S="Phone";var g=D.extend("sap.m.DateTimePicker",{metadata:{library:"sap.m",properties:{minutesStep:{type:"int",group:"Misc",defaultValue:1},secondsStep:{type:"int",group:"Misc",defaultValue:1}},aggregations:{_popup:{type:"sap.m.ResponsivePopover",multiple:false,visibility:"hidden"}},designtime:"sap/m/designtime/DateTimePicker.designtime"}});var h=C.extend("sap.m.internal.DateTimePickerPopup",{metadata:{aggregations:{_switcher:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},calendar:{type:"sap.ui.core.Control",multiple:false},timeSliders:{type:"sap.ui.core.Control",multiple:false}}},renderer:function(r,i){r.write("<div");r.writeControlData(i);r.addClass("sapMDateTimePopupCont");r.addClass("sapMTimePickerDropDown");r.writeClasses();r.write(">");var s=i.getAggregation("_switcher");if(s){r.write("<div");r.addClass("sapMTimePickerSwitch");r.writeClasses();r.write(">");r.renderControl(s);r.write("</div>");}var j=i.getCalendar();if(j){r.renderControl(j);}r.write("<div");r.addClass("sapMTimePickerSep");r.writeClasses();r.write(">");r.write("</div>");var t=i.getTimeSliders();if(t){r.renderControl(t);}r.write("</div>");},init:function(){},onBeforeRendering:function(){var s=this.getAggregation("_switcher");if(!s){var r=sap.ui.getCore().getLibraryResourceBundle("sap.m");var i=r.getText("DATETIMEPICKER_DATE");var t=r.getText("DATETIMEPICKER_TIME");s=new sap.m.SegmentedButton(this.getId()+"-Switch",{selectedKey:"Cal",items:[new sap.m.SegmentedButtonItem(this.getId()+"-Switch-Cal",{key:"Cal",text:i}),new sap.m.SegmentedButtonItem(this.getId()+"-Switch-Sli",{key:"Sli",text:t})]});s.attachSelect(this._handleSelect,this);this.setAggregation("_switcher",s,true);}if(c.system.phone||q('html').hasClass("sapUiMedia-Std-Phone")){s.setVisible(true);s.setSelectedKey("Cal");}else{s.setVisible(false);}},onAfterRendering:function(){if(c.system.phone||q('html').hasClass("sapUiMedia-Std-Phone")){var s=this.getAggregation("_switcher");var i=s.getSelectedKey();this._switchVisibility(i);}},_handleSelect:function(E){this._switchVisibility(E.getParameter("key"));},_switchVisibility:function(s){var i=this.getCalendar();var j=this.getTimeSliders();if(!i||!j){return;}if(s=="Cal"){i.$().css("display","");j.$().css("display","none");}else{i.$().css("display","none");j.$().css("display","");j._updateSlidersValues();j._onOrientationChanged();j.openFirstSlider();}},switchToTime:function(){var s=this.getAggregation("_switcher");if(s&&s.getVisible()){s.setSelectedKey("Sli");this._switchVisibility("Sli");}},getSpecialDates:function(){return this._oDateTimePicker.getSpecialDates();}});g.prototype.init=function(){D.prototype.init.apply(this,arguments);this._bOnlyCalendar=false;};g.prototype.getIconSrc=function(){return f.getIconURI("date-time");};g.prototype.exit=function(){D.prototype.exit.apply(this,arguments);if(this._oSliders){this._oSliders.destroy();delete this._oSliders;}this._oPopupContent=undefined;c.media.detachHandler(this._handleWindowResize,this);};g.prototype.setDisplayFormat=function(s){D.prototype.setDisplayFormat.apply(this,arguments);if(this._oSliders){this._oSliders.setDisplayFormat(o.call(this));}return this;};g.prototype.setMinutesStep=function(M){this.setProperty('minutesStep',M,true);if(this._oSliders){this._oSliders.setMinutesStep(M);}return this;};g.prototype.setMinDate=function(i){D.prototype.setMinDate.call(this,i);if(i){this._oMinDate.setHours(i.getHours(),i.getMinutes(),i.getSeconds());}return this;};g.prototype.setMaxDate=function(i){D.prototype.setMaxDate.call(this,i);if(i){this._oMaxDate.setHours(i.getHours(),i.getMinutes(),i.getSeconds());}return this;};g.prototype.setSecondsStep=function(s){this.setProperty('secondsStep',s,true);if(this._oSliders){this._oSliders.setSecondsStep(s);}return this;};g.prototype._getFormatInstance=function(A,i){var M=q.extend({},A);var s=-1;if(M.style){s=M.style.indexOf("/");}if(i){var j=q.extend({},M);if(s>0){j.style=j.style.substr(0,s);}this._oDisplayFormatDate=d.getInstance(j);}return d.getDateTimeInstance(M);};g.prototype._checkStyle=function(s){if(D.prototype._checkStyle.apply(this,arguments)){return true;}else if(s.indexOf("/")>0){var r=["short","medium","long","full"];var t=false;for(var i=0;i<r.length;i++){var u=r[i];for(var j=0;j<r.length;j++){var v=r[j];if(s==u+"/"+v){t=true;break;}}if(t){break;}}return t;}return false;};g.prototype._parseValue=function(v,i){var j=D.prototype._parseValue.apply(this,arguments);if(i&&!j){j=this._oDisplayFormatDate.parse(v);if(j){var O=this.getDateValue();if(!O){O=new Date();}j.setHours(O.getHours());j.setMinutes(O.getMinutes());j.setSeconds(O.getSeconds());j.setMilliseconds(O.getMilliseconds());}}return j;};g.prototype._getLocaleBasedPattern=function(s){var i=L.getInstance(sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()),j=s.indexOf("/");if(j>0){return i.getCombinedDateTimePattern(s.substr(0,j),s.substr(j+1));}else{return i.getCombinedDateTimePattern(s,s);}};g.prototype._createPopup=function(){if(!this._oPopup){var r=sap.ui.getCore().getLibraryResourceBundle("sap.m");var O=r.getText("TIMEPICKER_SET");var s=r.getText("TIMEPICKER_CANCEL");this._oPopupContent=new h(this.getId()+"-PC");this._oPopupContent._oDateTimePicker=this;this._oPopup=new sap.m.ResponsivePopover(this.getId()+"-RP",{showCloseButton:false,showHeader:false,placement:P.VerticalPreferedBottom,beginButton:new sap.m.Button(this.getId()+"-OK",{text:O,press:q.proxy(_,this)}),endButton:new sap.m.Button(this.getId()+"-Cancel",{text:s,press:q.proxy(k,this)}),content:this._oPopupContent});this._oPopup.addStyleClass("sapMDateTimePopup");var i=this._oPopup.getAggregation("_popup");if(i.setShowArrow){i.setShowArrow(false);}this._oPopup.attachAfterOpen(m,this);this._oPopup.attachAfterClose(n,this);if(c.system.desktop){this._oPopoverKeydownEventDelegate={onkeydown:function(E){var j=K,t=E.which||E.keyCode,A=E.altKey;if((A&&(t===j.ARROW_UP||t===j.ARROW_DOWN))||t===j.F4){_.call(this,E);this.focus();E.preventDefault();}}};this._oPopup.addEventDelegate(this._oPopoverKeydownEventDelegate,this);}this.setAggregation("_popup",this._oPopup,true);}};g.prototype._openPopup=function(){if(!this._oPopup){return;}this.addStyleClass(I.ICON_PRESSED_CSS_CLASS);this._storeInputSelection(this._$input.get(0));var i=this._oPopup.getAggregation("_popup");i.oPopup.setAutoCloseAreas([this.getDomRef()]);this._oPopup.openBy(this);var s=this._oPopup.getContent()[0]&&this._oPopup.getContent()[0].getTimeSliders();if(s){setTimeout(s._updateSlidersValues.bind(s),0);}};g.prototype._createPopupContent=function(){var N=!this._oCalendar;D.prototype._createPopupContent.apply(this,arguments);if(N){this._oPopupContent.setCalendar(this._oCalendar);this._oCalendar.attachSelect(p,this);var t=this,H=this._oCalendar._hideMonthPicker,i=this._oCalendar._hideYearPicker;this._oCalendar._hideMonthPicker=function(s){H.apply(this,arguments);if(!s){t._selectFocusedDateValue(new b().setStartDate(this._getFocusedDate().toLocalJSDate()));}};this._oCalendar._hideYearPicker=function(s){i.apply(this,arguments);if(!s){t._selectFocusedDateValue(new b().setStartDate(this._getFocusedDate().toLocalJSDate()));}};}if(!this._oSliders){this._oSliders=new T(this.getId()+"-Sliders",{minutesStep:this.getMinutesStep(),secondsStep:this.getSecondsStep(),displayFormat:o.call(this),localeId:this.getLocaleId()})._setShouldOpenSliderAfterRendering(true);this._oPopupContent.setTimeSliders(this._oSliders);}};g.prototype._selectFocusedDateValue=function(i){var j=this._oCalendar;j.removeAllSelectedDates();j.addSelectedDate(i);return this;};g.prototype._fillDateRange=function(){var i=this.getDateValue();if(i){i=new Date(i.getTime());}else{i=this._getInitialFocusedDateValue();var M=this._oMaxDate.getTime()+86400000;if(i.getTime()<this._oMinDate.getTime()||i.getTime()>M){i=this._oMinDate;}}this._oCalendar.focusDate(i);if(!this._oDateRange.getStartDate()||this._oDateRange.getStartDate().getTime()!=i.getTime()){this._oDateRange.setStartDate(i);}this._oSliders._setTimeValues(i);};g.prototype._getSelectedDate=function(){var i=D.prototype._getSelectedDate.apply(this,arguments);if(i){var j=this._oSliders.getTimeValues();var s=this._oSliders._getDisplayFormatPattern();if(s.search("h")>=0||s.search("H")>=0){i.setHours(j.getHours());}if(s.search("m")>=0){i.setMinutes(j.getMinutes());}if(s.search("s")>=0){i.setSeconds(j.getSeconds());}if(i.getTime()<this._oMinDate.getTime()){i=new Date(this._oMinDate.getTime());}else if(i.getTime()>this._oMaxDate.getTime()){i=new Date(this._oMaxDate.getTime());}}return i;};g.prototype._getInitialFocusedDateValue=function(){return this.getInitialFocusedDateValue()||new Date();};g.prototype.getLocaleId=function(){return sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();};g.prototype.getAccessibilityInfo=function(){var i=D.prototype.getAccessibilityInfo.apply(this,arguments);i.type=sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_DATETIMEINPUT");return i;};function _(E){this._selectDate();}function k(E){this.onsaphide(E);this._oCalendar.removeAllSelectedDates();this._oCalendar.addSelectedDate(new b().setStartDate(this._getInitialFocusedDateValue()));}g.prototype._handleWindowResize=function(i){var s=this.getAggregation("_popup").getContent()[0].getAggregation("_switcher"),j=this.getAggregation("_popup").getContent()[0].getCalendar(),r=this.getAggregation("_popup").getContent()[0].getTimeSliders();if(i.name===S){s.setVisible(true);this.getAggregation("_popup").getContent()[0]._switchVisibility(s.getSelectedKey());}else{s.setVisible(false);r.$().css("display","");j.$().css("display","");}};function m(E){this.$("inner").attr("aria-expanded",true);this._oCalendar.focus();this._oSliders._onOrientationChanged();c.media.attachHandler(this._handleWindowResize,this);}function n(){this.removeStyleClass(I.ICON_PRESSED_CSS_CLASS);this.$("inner").attr("aria-expanded",false);this._restoreInputSelection(this._$input.get(0));c.media.detachHandler(this._handleWindowResize,this);}function o(){var s=this.getDisplayFormat();var t;var B=this.getBinding("value");if(B&&B.oType&&(B.oType instanceof a)){s=B.oType.getOutputPattern();}else if(B&&B.oType&&B.oType.oFormat){s=B.oType.oFormat.oFormatOptions.pattern;}else{s=this.getDisplayFormat();}if(!s){s="medium";}var i=s.indexOf("/");if(i>0&&this._checkStyle(s)){s=s.substr(i+1);}if(s=="short"||s=="medium"||s=="long"||s=="full"){var j=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();var r=L.getInstance(j);t=r.getTimePattern(s);}else{t=s;}return t;}function p(E){this._oPopupContent.switchToTime();}return g;});
