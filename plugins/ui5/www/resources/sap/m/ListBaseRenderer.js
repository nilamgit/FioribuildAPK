/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/m/library","sap/ui/Device","./ListItemBaseRenderer"],function(l,D,L){"use strict";var a=l.ListGrowingDirection;var b=l.ListKeyboardMode;var T=l.ToolbarDesign;var c={};c.ModeOrder={None:0,Delete:1,MultiSelect:-1,SingleSelect:1,SingleSelectLeft:-1,SingleSelectMaster:0};c.render=function(r,C){r.write("<div");r.addClass("sapMList");r.writeControlData(C);if(C.getInset()){r.addClass("sapMListInsetBG");}if(C.getWidth()){r.addStyle("width",C.getWidth());}if(C.getBackgroundDesign){r.addClass("sapMListBG"+C.getBackgroundDesign());}var t=C.getTooltip_AsString();if(t){r.writeAttributeEscaped("title",t);}this.renderContainerAttributes(r,C);r.writeStyles();r.writeClasses();r.write(">");var h=C.getHeaderText();var H=C.getHeaderToolbar();if(H){H.setDesign(T.Transparent,true);H.addStyleClass("sapMListHdr");H.addStyleClass("sapMListHdrTBar");H.addStyleClass("sapMTBHeader-CTX");r.renderControl(H);}else if(h){r.write("<header class='sapMListHdr sapMListHdrText'");r.writeAttribute("id",C.getId("header"));r.write(">");r.writeEscaped(h);r.write("</header>");}var I=C.getInfoToolbar();if(I){I.setDesign(T.Info,true);I.addStyleClass("sapMListInfoTBar");r.write("<div class='sapMListInfoTBarContainer'>");r.renderControl(I);r.write("</div>");}var d=C.getItems(),s=C.getShowNoData(),R=C.shouldRenderItems()&&d.length,e=C.getKeyboardMode()==b.Edit?-1:0,u=C.getGrowingDirection()==a.Upwards&&C.getGrowing();if(u){this.renderGrowing(r,C);}if(R||s){this.renderDummyArea(r,C,"before",-1);}this.renderListStartAttributes(r,C);r.writeAccessibilityState(C,this.getAccessibilityState(C));r.addClass("sapMListUl");if(C._iItemNeedsHighlight){r.addClass("sapMListHighlight");}r.writeAttribute("id",C.getId("listUl"));if(R||s){r.writeAttribute("tabindex",e);}r.addClass("sapMListShowSeparators"+C.getShowSeparators());r.addClass("sapMListMode"+C.getMode());C.getInset()&&r.addClass("sapMListInset");r.writeClasses();r.writeStyles();r.write(">");this.renderListHeadAttributes(r,C);if(R){if(u){d.reverse();}for(var i=0;i<d.length;i++){r.renderControl(d[i]);}}if(!R&&s){this.renderNoData(r,C);}this.renderListEndAttributes(r,C);if(R||s){this.renderDummyArea(r,C,"after",e);}if(!u){this.renderGrowing(r,C);}if(C.getFooterText()){r.write("<footer class='sapMListFtr'");r.writeAttribute("id",C.getId("footer"));r.write(">");r.writeEscaped(C.getFooterText());r.write("</footer>");}r.write("</div>");};c.renderContainerAttributes=function(r,C){var s=C.getStickyStyleValue();if(s){r.addClass("sapMSticky");r.addClass("sapMSticky"+s);}};c.renderListHeadAttributes=function(r,C){};c.renderListStartAttributes=function(r,C){r.write("<ul");r.addClass("sapMListItems");C.addNavSection(C.getId("listUl"));};c.getAriaRole=function(C){return"listbox";};c.getAriaLabelledBy=function(C){};c.getAriaDescribedBy=function(C){if(C.getFooterText()){return C.getId("footer");}};c.getAccessibilityState=function(C){return{role:this.getAriaRole(C),multiselectable:C._bSelectionMode?C.getMode()=="MultiSelect":undefined,labelledby:{value:this.getAriaLabelledBy(C),append:true},describedby:{value:this.getAriaDescribedBy(C),append:true}};};c.renderListEndAttributes=function(r,C){r.write("</ul>");};c.renderNoData=function(r,C){r.write("<li");r.writeAttribute("tabindex",C.getKeyboardMode()==b.Navigation?-1:0);r.writeAttribute("id",C.getId("nodata"));r.addClass("sapMLIB sapMListNoData sapMLIBTypeInactive");L.addFocusableClasses.call(L,r);r.writeClasses();r.write(">");r.write("<div");r.addClass("sapMListNoDataText");r.writeAttribute("id",C.getId("nodata-text"));r.writeClasses();r.write(">");r.writeEscaped(C.getNoDataText(true));r.write("</div>");r.write("</li>");};c.renderDummyArea=function(r,C,A,t){r.write("<div");r.writeAttribute("id",C.getId(A));r.writeAttribute("tabindex",t);if(D.system.desktop){r.addClass("sapMListDummyArea").writeClasses();}r.write("></div>");};c.renderGrowing=function(r,C){var g=C._oGrowingDelegate;if(!g){return;}g.render(r);};return c;},true);