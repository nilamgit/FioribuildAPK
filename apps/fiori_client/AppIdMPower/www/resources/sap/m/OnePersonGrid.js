/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/Control','sap/ui/core/LocaleData','sap/ui/core/Locale','sap/ui/core/format/DateFormat','sap/ui/core/date/UniversalDate','sap/ui/unified/library','sap/ui/unified/calendar/DatesRow','./OnePersonGridRenderer'],function(C,L,a,D,U,u,b,O){"use strict";var c=u.CalendarAppointmentVisualization;var R=48,B=28,H=3600000/2,d=86400000;var e=C.extend("sap.m.OnePersonGrid",{metadata:{library:"sap.m",properties:{startDate:{type:"object",group:"Data"},startHour:{type:"int",group:"Appearance",defaultValue:8},endHour:{type:"int",group:"Appearance",defaultValue:17},showFullDay:{type:"boolean",group:"Appearance",defaultValue:true},appointmentsVisualization:{type:"sap.ui.unified.CalendarAppointmentVisualization",group:"Appearance",defaultValue:c.Standard}},aggregations:{appointments:{type:"sap.ui.unified.CalendarAppointment",multiple:true,singularName:"appointment"},_columnHeaders:{type:"sap.ui.unified.calendar.DatesRow",multiple:false,visibility:"hidden"}},associations:{ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}}}});e.prototype.init=function(){var s=this._getUniversalCurrentDate().getJSDate(),o=new b(this.getId()+"-columnHeaders",{showDayNamesLine:false,showWeekNumbers:false,startDate:s}).addStyleClass("sapMOnePersonColumnHeader"),i=(60-s.getSeconds())*1000;this.setAggregation("_columnHeaders",o);this.setStartDate(s);this._setColumns(7);setTimeout(this._updateRowHeaderAndNowMarker.bind(this),i);};e.prototype.onBeforeRendering=function(){var o=this._createAppointmentsMap(this.getAppointments()),s=this._getUniversalStartDate(),i=this._getColumns();this._oVisibleAppointments=this._calculateVisibleAppointments(o.appointments,s,i);this._oAppointmentsToRender=this._calculateAppointmentsLevelsAndWidth(this._oVisibleAppointments);this._aVisibleBlockers=this._calculateVisibleBlockers(o.blockers,s,i);this._oBlockersToRender=this._calculateBlockersLevelsAndWidth(this._aVisibleBlockers);};e.prototype.setStartDate=function(s){this._oUniversalStartDate=U.getInstance(s);this.getAggregation("_columnHeaders").setStartDate(s);return this.setProperty("startDate",s);};e.prototype._getUniversalStartDate=function(){return this._oUniversalStartDate;};e.prototype._getUniversalCurrentDate=function(){return U.getInstance(new Date());};e.prototype._areDatesInSameDay=function(o,h){var y=o.getFullYear()===h.getFullYear(),m=o.getMonth()===h.getMonth(),i=o.getDate()===h.getDate();return y&&m&&i;};e.prototype._getStartHour=function(){var m=Math.min(this.getStartHour(),this.getEndHour());return m<0?0:m;};e.prototype._getEndHour=function(){var m=Math.max(this.getStartHour(),this.getEndHour());return m>24?24:m;};e.prototype._getVisibleStartHour=function(){return this.getShowFullDay()?0:this._getStartHour();};e.prototype._getVisibleEndHour=function(){return(this.getShowFullDay()?24:this._getEndHour())-1;};e.prototype._isWorkingHour=function(h){return this._getStartHour()<=h&&h<=this._getEndHour();};e.prototype._isOutsideVisibleHours=function(h){var h,v=this._getVisibleStartHour(),V=this._getVisibleEndHour();return h<v||h>V;};e.prototype._isCurrentMinutesLessThan=function(m){var i=this._getUniversalCurrentDate().getMinutes();return m>=i;};e.prototype._isCurrentMinutesMoreThan=function(m){var i=this._getUniversalCurrentDate().getMinutes();return m<=i;};e.prototype._isWeekend=function(o){var i=o.getDay();return i%6===0;};e.prototype._shouldHideRowHeader=function(r){var i=this._getUniversalCurrentDate().getHours(),I=this._isCurrentMinutesLessThan(15)&&i===r,h=this._isCurrentMinutesMoreThan(45)&&i===r-1;return I||h;};e.prototype._formatDayAsString=function(o){return o.getFullYear()+"-"+o.getMonth()+"-"+o.getDate();};e.prototype._formatTimeAsString=function(o){var i=o.getMinutes(),h=this._getHoursFormat(),j=this._getAMPMFormat(),s="";if(i<10){i="0"+i;}if(this._hasAMPM()){s+=" "+j.format(o);}return h.format(o)+":"+i+s;};e.prototype._calculateTopPosition=function(o){var h=o.getHours()-this._getVisibleStartHour(),m=o.getMinutes(),r=this._getRowHeight();return(r*h)+(r/60)*m;};e.prototype._calculateBottomPosition=function(o){var h=this._getVisibleEndHour()+1-o.getHours(),m=o.getMinutes(),r=this._getRowHeight();return(r*h)-(r/60)*m;};e.prototype._updateRowHeaderAndNowMarker=function(){var o=this._getUniversalCurrentDate();this._updateNowMarker(o);this._updateRowHeaders(o);setTimeout(this._updateRowHeaderAndNowMarker.bind(this),60*1000);};e.prototype._updateNowMarker=function(o){var $=this.$("nowMarker"),h=this.$("nowMarkerText"),i=this._isOutsideVisibleHours(o.getHours());$.toggleClass("sapMOnePersonNowMarkerHidden",i);$.css("top",this._calculateTopPosition(o)+"px");h.text(this._formatTimeAsString(o));};e.prototype._updateRowHeaders=function(o){var $=this.$(),i=o.getHours(),n=i+1;$.find(".sapMOnePersonRowHeader").removeClass("sapMOnePersonRowHeaderHidden");if(this._shouldHideRowHeader(i)){$.find(".sapMOnePersonRowHeader"+i).addClass("sapMOnePersonRowHeaderHidden");}else if(this._shouldHideRowHeader(n)){$.find(".sapMOnePersonRowHeader"+n).addClass("sapMOnePersonRowHeaderHidden");}};e.prototype._createAppointmentsMap=function(h){var t=this;return h.reduce(function(m,o){var i=o.getStartDate(),j=o.getEndDate(),I=o.getFullDay&&o.getFullDay();if(!i||!j){return m;}if(!I){var k=new U(i.getFullYear(),i.getMonth(),i.getDate()),l=new U(j.getFullYear(),j.getMonth(),j.getDate());while(k.getTime()<=l.getTime()){var s=t._formatDayAsString(k);if(!m.appointments[s]){m.appointments[s]=[];}m.appointments[s].push(o);k.setDate(k.getDate()+1);}}else{m.blockers.push(o);}return m;},{appointments:{},blockers:[]});};e.prototype._calculateVisibleAppointments=function(o,s,h){var v={};for(var i=0;i<h;i++){var j=new U(s.getFullYear(),s.getMonth(),s.getDate()+i),k=this._formatDayAsString(j),I=this._isAppointmentFitInVisibleHours(j);if(o[k]){v[k]=o[k].filter(I,this).sort(this._sortAppointmentsByStartHour);}}return v;};e.prototype._isAppointmentFitInVisibleHours=function(o){return function(h){var i=h.getStartDate().getTime(),j=h.getEndDate().getTime(),k=(new U(o.getFullYear(),o.getMonth(),o.getDate(),this._getVisibleStartHour())).getTime(),l=(new U(o.getFullYear(),o.getMonth(),o.getDate(),this._getVisibleEndHour(),59,59)).getTime();var m=i<k&&j>l,s=i>=k&&i<l,E=j>k&&j<=l;return m||s||E;};};e.prototype._calculateAppointmentsLevelsAndWidth=function(v){var t=this;return Object.keys(v).reduce(function(o,s){var m=0,h=new f(),i=v[s];i.forEach(function(j){var k=new A(j),l=j.getStartDate().getTime();if(h.getSize()===0){h.add(k);return;}h.getIterator().forEach(function(n){var S=true,p=n.getData(),q=p.getStartDate().getTime(),r=p.getEndDate().getTime(),w=r-q;if(w<H){r=r+(H-w);}if(l>=q&&l<r){k.level++;m=Math.max(m,k.level);}if(n.next&&n.next.level===k.level){S=false;}if(l>=r&&S){this.interrupt();}});h.insertAfterLevel(k.level,k);});o[s]={oAppointmentsList:t._calculateAppointmentsWidth(h),iMaxLevel:m};return o;},{});};e.prototype._calculateAppointmentsWidth=function(o){o.getIterator().forEach(function(h){var i=h.getData(),l=h.level,j=h.level,k=i.getStartDate().getTime(),m=i.getEndDate().getTime(),n=m-k;if(n<H){m=m+(H-n);}new g(o).forEach(function(p){var q=p.getData(),r=p.level,s=q.getStartDate().getTime(),t=q.getEndDate().getTime(),v=t-s;if(v<H){t=t+(H-v);}if(j>=r){return;}if(k>=s&&k<t||m>s&&m<t||k<=s&&m>=t){h.width=r-j;this.interrupt();return;}if(l<r){l=r;h.width++;}});});return o;};e.prototype._calculateVisibleBlockers=function(h,s,i){s=this._getDayPart(s);var E=new U(s.getFullYear(),s.getMonth(),s.getDate()+i),I=this._isBlockerVisible(s,E);return h.filter(I).sort(this._sortAppointmentsByStartHour);};e.prototype._isBlockerVisible=function(s,E){var t=this;return function(o){var h=o.getStartDate(),i=o.getEndDate(),j=t._getDayPart(h).getTime(),k=t._getDayPart(i).getTime(),v=s.getTime(),V=E.getTime();var I=j<v&&k>V,S=j>=v&&j<V,l=k>=v&&k<=V;return I||S||l;};};e.prototype._calculateBlockersLevelsAndWidth=function(v){var m=0,o=new f(),t=this;v.forEach(function(h){var i=new A(h),j=h.getStartDate(),k=h.getEndDate(),l=t._getDayPart(j).getTime(),n=t._getDayPart(k).getTime();i.width=t._calculateDaysDifference(l,n);if(o.getSize()===0){o.add(i);return;}o.getIterator().forEach(function(p){var s=true,q=p.getData(),r=q.getStartDate(),w=q.getEndDate(),x=t._getDayPart(r).getTime(),y=t._getDayPart(w).getTime();if(l>=x&&l<y){i.level++;m=Math.max(m,i.level);}if(p.next&&p.next.level===i.level){s=false;}if(l>=y&&s){this.interrupt();}});o.insertAfterLevel(i.level,i);},this);return{oBlockersList:o,iMaxlevel:m};};e.prototype._calculateDaysDifference=function(s,E){var t=E-s;return Math.round(t/d);};e.prototype._sortAppointmentsByStartHour=function(o,h){return o.getStartDate().getTime()-h.getStartDate().getTime()||h.getEndDate().getTime()-o.getEndDate().getTime();};e.prototype._getVisibleAppointments=function(){return this._oVisibleAppointments;};e.prototype._getAppointmentsToRender=function(){return this._oAppointmentsToRender;};e.prototype._getVisibleBlockers=function(){return this._aVisibleBlockers;};e.prototype._getBlockersToRender=function(){return this._oBlockersToRender;};e.prototype._setColumns=function(i){this._iColumns=i;this.getAggregation("_columnHeaders").setDays(i);this.invalidate();};e.prototype._getColumns=function(){return this._iColumns;};e.prototype._getRowHeight=function(){return R;};e.prototype._getBlockerRowHeight=function(){return B;};e.prototype._getDayPart=function(o){return new U(o.getFullYear(),o.getMonth(),o.getDate());};e.prototype._getCoreLocale=function(){if(!this._sLocale){this._sLocale=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();}return this._sLocale;};e.prototype._getCoreLocaleData=function(){if(!this._oLocaleData){var l=this._getCoreLocale(),o=new a(l);this._oLocaleData=L.getInstance(o);}return this._oLocaleData;};e.prototype._hasAMPM=function(){var l=this._getCoreLocaleData();return l.getTimePattern("short").search("a")>=0;};e.prototype._getHoursFormat=function(){var l=this._getCoreLocale();if(!this._oHoursFormat||this._oHoursFormat.oLocale.toString()!==l){var o=new a(l),h=this._hasAMPM(),p=h?"h":"H";this._oHoursFormat=D.getTimeInstance({pattern:p},o);}return this._oHoursFormat;};e.prototype._getAMPMFormat=function(){var l=this._getCoreLocale(),o=new a(l);if(!this._oAMPMFormat||this._oAMPMFormat.oLocale.toString()!==l){this._oAMPMFormat=D.getTimeInstance({pattern:"a"},o);}return this._oAMPMFormat;};function A(o){this.data=o;this.level=0;this.width=1;this.prev=null;this.next=null;}A.prototype.hasNext=function(){return this.next!==null;};A.prototype.hasPrev=function(){return this.prev!==null;};A.prototype.getData=function(){return this.data;};function f(){this.head=null;this.tail=null;this.size=0;this.iterator=new g(this);}f.prototype.getHeadNode=function(){return this.head;};f.prototype.getTailNode=function(){return this.tail;};f.prototype.getSize=function(){return this.size;};f.prototype.isEmpty=function(){return this.getSize()===0;};f.prototype.createNewNode=function(o){return new A(o);};f.prototype.getIterator=function(){return this.iterator;};f.prototype.indexOf=function(n,h){this.iterator.reset();var o,i=0;while(this.iterator.hasNext()){o=this.iterator.next();if(h(o)){return i;}i++;}return-1;};f.prototype.add=function(o){var n=o;if(!(o instanceof A)){n=this.createNewNode(o);}if(this.isEmpty()){this.head=this.tail=n;}else{this.tail.next=n;n.prev=this.tail;this.tail=n;}this.size++;return true;};f.prototype.insertFirst=function(o){if(this.isEmpty()){this.add(o);}else{var n=o;if(!(o instanceof A)){n=this.createNewNode(o);}n.next=this.head;this.head.prev=n;this.head=n;this.size++;return true;}};f.prototype.insertAt=function(i,o){var h=this.getHeadNode(),p=0,n=o;if(!(o instanceof A)){n=this.createNewNode(o);}if(i<0){return false;}if(i===0){return this.insertFirst(o);}if(i>this.getSize()-1){return this.add(o);}while(p<i){h=h.next;p++;}h.prev.next=n;n.prev=h.prev;h.prev=n;n.next=h;this.size++;return true;};f.prototype.insertAfterLevel=function(l,n){var i=this.indexOf(n,function(o){var h=o.level===l;if(o.next&&o.next.level===l){h=false;}return h;}),s=this.getSize();if(i+1===s||i===-1){return this.add(n);}else{return this.insertAt(i+1,n);}};function g(l){this.list=l;this.stopIterationFlag=false;this.currentNode=null;}g.prototype.next=function(){var o=this.currentNode;if(this.currentNode!==null){this.currentNode=this.currentNode.next;}return o;};g.prototype.hasNext=function(){return this.currentNode!==null;};g.prototype.reset=function(){this.currentNode=this.list.getHeadNode();return this;};g.prototype.forEach=function(h,t){var o;t=t||this;this.reset();while(this.hasNext()&&!this.stopIterationFlag){o=this.next();h.call(t,o);}this.stopIterationFlag=false;};g.prototype.interrupt=function(){this.stopIterationFlag=true;return this;};return e;});
