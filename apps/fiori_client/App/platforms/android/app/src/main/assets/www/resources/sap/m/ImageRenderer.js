/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/m/library',"sap/base/security/encodeXML"],function(l,e){"use strict";var I=l.ImageMode;var a={};a.render=function(r,i){var m=i.getMode(),b=i.getAlt(),t=i.getTooltip_AsString(),h=i.hasListeners("press"),L=i.getDetailBox(),u=i.getUseMap(),c=i.getAriaLabelledBy(),d=i.getAriaDescribedBy();if(L){r.write("<span class=\"sapMLightBoxImage\"");r.writeControlData(i);r.write(">");r.write("<span class=\"sapMLightBoxMagnifyingGlass\"></span>");}r.write(m===I.Image?"<img":"<span");if(!L){r.writeControlData(i);}if(!i.getDecorative()&&c&&c.length>0){r.writeAttributeEscaped("aria-labelledby",c.join(" "));}if(!i.getDecorative()&&d&&d.length>0){r.writeAttributeEscaped("aria-describedby",d.join(" "));}if(m===I.Image){r.writeAttributeEscaped("src",i._getDensityAwareSrc());}else{i._preLoadImage(i._getDensityAwareSrc());r.addStyle("background-size",e(i.getBackgroundSize()));r.addStyle("background-position",e(i.getBackgroundPosition()));r.addStyle("background-repeat",e(i.getBackgroundRepeat()));}r.addClass("sapMImg");if(i.hasListeners("press")||i.hasListeners("tap")){r.addClass("sapMPointer");}if(u||!i.getDecorative()||h){r.addClass("sapMImgFocusable");}r.writeClasses();if(u){if(!(u.startsWith("#"))){u="#"+u;}r.writeAttributeEscaped("useMap",u);}if(i.getDecorative()&&!u&&!h){r.writeAttribute("role","presentation");r.writeAttribute("aria-hidden","true");r.write(" alt=''");}else{if(b||t){r.writeAttributeEscaped("alt",b||t);}}if(b||t){r.writeAttributeEscaped("aria-label",b||t);}if(t){r.writeAttributeEscaped("title",t);}if(h){r.writeAttribute("role","button");r.writeAttribute("tabIndex",0);}if(i.getWidth()&&i.getWidth()!=''){r.addStyle("width",i.getWidth());}if(i.getHeight()&&i.getHeight()!=''){r.addStyle("height",i.getHeight());}r.writeStyles();r.write(" />");if(L){r.write("</span>");}};return a;},true);
