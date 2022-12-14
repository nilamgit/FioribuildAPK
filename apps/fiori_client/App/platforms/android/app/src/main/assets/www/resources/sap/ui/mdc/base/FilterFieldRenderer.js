/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/ui/core/Renderer','sap/ui/core/IconPool'],function(R,I){"use strict";I.insertFontFaceStyle();var F=R.extend("sap.ui.mdc.base.FilterFieldRenderer");F.render=function(r,c){var a={content:c.getContent(),editable:c.getEditable()};r.write("<div");r.writeControlData(c);r.addClass("sapUiMdcBaseFilterField");r.writeClasses();r.addStyle("display","inline-block");r.addStyle("width",c.getWidth());r.writeStyles();r.write(">");if(a.content){r.renderControl(a.content);}r.write("</div>");};return F;},true);
