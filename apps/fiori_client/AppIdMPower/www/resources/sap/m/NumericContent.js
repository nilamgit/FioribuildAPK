/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library","sap/ui/core/Control","sap/ui/core/IconPool","sap/ui/core/ResizeHandler","sap/m/Image","./NumericContentRenderer","sap/ui/events/KeyCodes","sap/base/util/deepEqual"],function(l,C,I,R,a,N,K,d){"use strict";var L={"ar":4,"ar_EG":4,"ar_SA":4,"bg":4,"ca":6,"cs":4,"da":4,"de":8,"de_AT":8,"de_CH":8,"el":4,"el_CY":4,"en":4,"en_AU":4,"en_GB":4,"en_HK":4,"en_IE":4,"en_IN":4,"en_NZ":4,"en_PG":4,"en_SG":4,"en_ZA":4,"es":6,"es_AR":4,"es_BO":4,"es_CL":4,"es_CO":4,"es_MX":6,"es_PE":4,"es_UY":4,"es_VE":4,"et":4,"fa":4,"fi":4,"fr":4,"fr_BE":4,"fr_CA":4,"fr_CH":4,"fr_LU":4,"he":4,"hi":4,"hr":4,"hu":4,"id":4,"it":8,"it_CH":8,"ja":6,"kk":4,"ko":6,"lt":4,"lv":4,"ms":4,"nb":4,"nl":4,"nl_BE":4,"pl":4,"pt":4,"pt_PT":4,"ro":4,"ru":4,"ru_UA":4,"sk":4,"sl":4,"sr":4,"sv":4,"th":4,"tr":4,"uk":4,"vi":4,"zh_CN":6,"zh_HK":6,"zh_SG":6,"zh_TW":6};var b=C.extend("sap.m.NumericContent",{metadata:{library:"sap.m",properties:{"animateTextChange":{type:"boolean",group:"Behavior",defaultValue:true},"formatterValue":{type:"boolean",group:"Data",defaultValue:false},"icon":{type:"sap.ui.core.URI",group:"Appearance",defaultValue:null},"iconDescription":{type:"string",group:"Accessibility",defaultValue:null},"indicator":{type:"sap.m.DeviationIndicator",group:"Appearance",defaultValue:"None"},"nullifyValue":{type:"boolean",group:"Behavior",defaultValue:true},"scale":{type:"string",group:"Appearance",defaultValue:null},"size":{type:"sap.m.Size",group:"Appearance",defaultValue:"Auto"},"truncateValueTo":{type:"int",group:"Appearance",defaultValue:4},"value":{type:"string",group:"Data",defaultValue:null},"valueColor":{type:"sap.m.ValueColor",group:"Appearance",defaultValue:"Neutral"},"width":{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:null},"withMargin":{type:"boolean",group:"Appearance",defaultValue:true},"state":{type:"sap.m.LoadState",group:"Behavior",defaultValue:"Loaded"}},events:{"press":{}}}});b.prototype.init=function(){this._rb=sap.ui.getCore().getLibraryResourceBundle("sap.m");this.setTooltip("{AltText}");sap.ui.getCore().attachInit(this._registerResizeHandler.bind(this));};b.prototype._getParentTile=function(){var p=this.getParent();while(p){if(p.isA("sap.m.GenericTile")){return p;}p=p.getParent();}return null;};b.prototype._getMaxDigitsData=function(){var t=this._getParentTile(),m=null,f=null;if(t){var s=sap.ui.getCore().getConfiguration().getLanguage(),i=t._isSmall();m=L[s]||m;if(!i){switch(m){case 6:f="sapMNCMediumFontSize";break;case 8:f="sapMNCSmallFontSize";break;default:f="sapMNCLargeFontSize";break;}}}return{fontClass:f,maxLength:m};};b.prototype._registerResizeHandler=function(){R.register(this,this.invalidate.bind(this));};b.prototype.onBeforeRendering=function(){this.$().unbind("mouseenter",this._addTooltip);this.$().unbind("mouseleave",this._removeTooltip);};b.prototype.onAfterRendering=function(){this.$().bind("mouseenter",this._addTooltip.bind(this));this.$().bind("mouseleave",this._removeTooltip.bind(this));if(l.LoadState.Loaded==this.getState()||this.getAnimateTextChange()){jQuery(document.getElementById(this.getId())).animate({opacity:"1"},1000);}};b.prototype._addTooltip=function(){this.$().attr("title",this.getTooltip_AsString());};b.prototype._checkIfIconFits=function(){var p=this._getParentTile();if(p&&(p.isA("sap.m.GenericTile")||p.isA("sap.m.SlideTile"))){p._setupResizeClassHandler();}var $=this.$("icon-image"),c=this.$("value-inner"),e=this.$("value-scr");var s=$.outerWidth()+c.width(),w=e.width();s>w?$.hide():$.show();};b.prototype._removeTooltip=function(){this.$().attr("title",null);};b.prototype.exit=function(){if(this._oIcon){this._oIcon.destroy();}};b.prototype.getAltText=function(){var v=this.getValue();var s=this.getScale();var e;var m=this._rb.getText(("SEMANTIC_COLOR_"+this.getValueColor()).toUpperCase());var A="";if(this.getNullifyValue()){e="0";}else{e="";}if(this.getIconDescription()){A=A.concat(this.getIconDescription());A=A.concat("\n");}if(v){A=A.concat(v+s);}else{A=A.concat(e);}A=A.concat("\n");if(this.getIndicator()&&this.getIndicator()!==l.DeviationIndicator.None){A=A.concat(this._rb.getText(("NUMERICCONTENT_DEVIATION_"+this.getIndicator()).toUpperCase()));A=A.concat("\n");}A=A.concat(m);return A;};b.prototype.getTooltip_AsString=function(){var t=this.getTooltip();var T=this.getAltText();if(typeof t==="string"||t instanceof String){T=t.split("{AltText}").join(T).split("((AltText))").join(T);return T;}if(t){return t;}else{return"";}};b.prototype.setIcon=function(u){var v=!d(this.getIcon(),u);if(v){if(this._oIcon){this._oIcon.destroy();this._oIcon=undefined;}if(u){this._oIcon=I.createControlByURI({id:this.getId()+"-icon-image",src:u},a);}}this._setPointerOnIcon();return this.setProperty("icon",u);};b.prototype._setPointerOnIcon=function(){if(this._oIcon&&this.hasListeners("press")){this._oIcon.addStyleClass("sapMPointer");}else if(this._oIcon&&this._oIcon.hasStyleClass("sapMPointer")){this._oIcon.removeStyleClass("sapMPointer");}};b.prototype.ontap=function(e){this.$().focus();this.firePress();e.preventDefault();};b.prototype.onkeyup=function(e){if(e.which===K.ENTER||e.which===K.SPACE){this.firePress();e.preventDefault();}};b.prototype.onkeydown=function(e){if(e.which===K.SPACE){e.preventDefault();}};b.prototype.attachEvent=function(e,c,f,g){C.prototype.attachEvent.call(this,e,c,f,g);if(this.hasListeners("press")){this.$().attr("tabindex",0).addClass("sapMPointer");this._setPointerOnIcon();}return this;};b.prototype.detachEvent=function(e,f,c){C.prototype.detachEvent.call(this,e,f,c);if(!this.hasListeners("press")){this.$().removeAttr("tabindex").removeClass("sapMPointer");this._setPointerOnIcon();}return this;};b.prototype._parseFormattedValue=function(v){var t=v.replace(String.fromCharCode(8206),"").replace(String.fromCharCode(8207),"");return{scale:t.replace(/[+-., \d]*(.*)$/g,"$1").trim().replace(/\.$/,""),value:t.replace(/([+-., \d]*).*$/g,"$1").trim()};};return b;});
