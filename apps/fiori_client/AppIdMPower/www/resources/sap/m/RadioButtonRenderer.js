/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/ValueStateSupport','sap/ui/core/library','sap/ui/Device'],function(V,c,D){"use strict";var a=c.ValueState;var R={};R.render=function(r,o){var i=o.getId();var e=o.getEnabled();var E=o.getEditable();var b=!e||!E;var I=a.Error===o.getValueState();var d=a.Warning===o.getValueState();var f=a.Information===o.getValueState();var u=o.getUseEntireWidth();r.addClass("sapMRb");r.write("<div");r.writeControlData(o);if(u){r.addStyle("width",o.getWidth());r.writeStyles();}var t=V.enrichTooltip(o,o.getTooltip_AsString());if(t){r.writeAttributeEscaped("title",t);}r.writeAccessibilityState(o,{role:"radio",selected:null,checked:o.getSelected()===true?true:undefined,disabled:!o.getEditable()?true:undefined,labelledby:{value:i+"-label",append:true},describedby:{value:(t?i+"-Descr":undefined),append:true}});if(o.getSelected()){r.addClass("sapMRbSel");}if(!e){r.addClass("sapMRbDis");}if(!E){r.addClass("sapMRbRo");}if(I){r.addClass("sapMRbErr");}if(d){r.addClass("sapMRbWarn");}if(f){r.addClass("sapMRbInfo");}r.writeClasses();if(e){r.writeAttribute("tabindex",o.hasOwnProperty("_iTabIndex")?o._iTabIndex:0);}r.write(">");r.write("<div class='sapMRbB'");r.write(">");r.write("<div");r.addClass("sapMRbBOut");r.writeAttribute("id",i+"-Button");if(!b&&D.system.desktop){r.addClass("sapMRbHoverable");}r.writeClasses();r.write(">");r.write("<div");r.addClass("sapMRbBInn");r.writeClasses();r.write(">");r.write("<input type='radio' tabindex='-1'");r.writeAttribute("id",i+"-RB");r.writeAttributeEscaped("name",o.getGroupName());if(o.getSelected()){r.writeAttribute("checked","checked");}if(b){r.writeAttribute("readonly","readonly");r.writeAttribute("disabled","disabled");}r.write(" />");r.write("</div></div>");r.write("</div>");r.renderControl(o._oLabel);if(t&&sap.ui.getCore().getConfiguration().getAccessibility()){r.write("<span id=\""+i+"-Descr\" style=\"display: none;\">");r.writeEscaped(t);r.write("</span>");}r.write("</div>");};return R;},true);