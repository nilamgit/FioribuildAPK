/*!
* UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
*/
sap.ui.define(["./library","sap/ui/core/Control","./MessageStripUtilities","./Text","./Link","./FormattedText","sap/ui/core/library","./MessageStripRenderer","sap/base/Log"],function(l,C,M,T,L,F,c,a,b){"use strict";var d=c.MessageType;var e=C.extend("sap.m.MessageStrip",{metadata:{library:"sap.m",designtime:"sap/m/designtime/MessageStrip.designtime",properties:{text:{type:"string",group:"Appearance",defaultValue:""},type:{type:"sap.ui.core.MessageType",group:"Appearance",defaultValue:d.Information},customIcon:{type:"sap.ui.core.URI",group:"Appearance",defaultValue:""},showIcon:{type:"boolean",group:"Appearance",defaultValue:false},showCloseButton:{type:"boolean",group:"Appearance",defaultValue:false},enableFormattedText:{type:"boolean",group:"Appearance",defaultValue:false}},defaultAggregation:"link",aggregations:{link:{type:"sap.m.Link",multiple:false,singularName:"link"},_formattedText:{type:"sap.m.FormattedText",multiple:false,visibility:"hidden"},_text:{type:"sap.m.Text",multiple:false,visibility:"hidden"}},events:{close:{}}}});e.prototype.init=function(){this.data("sap-ui-fastnavgroup","true",true);this.setAggregation("_text",new T());};e.prototype.setText=function(t){var f=this.getAggregation("_formattedText");if(f){f.setHtmlText(t);}this.getAggregation("_text").setText(t);return this.setProperty("text",t);};e.prototype.setType=function(t){if(t===d.None){b.warning(M.MESSAGES.TYPE_NOT_SUPPORTED);t=d.Information;}return this.setProperty("type",t);};e.prototype.setEnableFormattedText=function(E){var f=this.getAggregation("_formattedText");if(E){if(!f){f=new F();f._setUseLimitedRenderingRules(true);this.setAggregation("_formattedText",f);}f.setHtmlText(this.getText());}return this.setProperty("enableFormattedText",E);};e.prototype.setAggregation=function(n,o,s){if(n==="link"&&o instanceof L){o.addAriaLabelledBy(this.getId());}C.prototype.setAggregation.call(this,n,o,s);return this;};e.prototype.ontap=M.handleMSCloseButtonInteraction;e.prototype.onsapenter=M.handleMSCloseButtonInteraction;e.prototype.onsapspace=M.handleMSCloseButtonInteraction;e.prototype.ontouchmove=function(E){E.setMarked();};e.prototype.close=function(){var f=function(){this.fireClose();this.setVisible(false);}.bind(this);if(!sap.ui.getCore().getConfiguration().getAnimation()){f();return;}M.closeTransitionWithCSS.call(this,f);};return e;});
