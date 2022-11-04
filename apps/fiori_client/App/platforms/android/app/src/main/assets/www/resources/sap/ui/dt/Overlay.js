/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery",'sap/ui/core/Element','sap/ui/dt/MutationObserver','sap/ui/dt/ElementUtil','sap/ui/dt/OverlayUtil','sap/ui/dt/DOMUtil','sap/ui/dt/ScrollbarSynchronizer','sap/ui/dt/Util','sap/base/Log','sap/ui/dt/util/getNextZIndex'],function(q,E,M,a,O,D,S,U,L,g){"use strict";var b="overlay-container";var o;var m;var c=E.extend("sap.ui.dt.Overlay",{metadata:{library:"sap.ui.dt",properties:{visible:{type:"boolean",defaultValue:true},focusable:{type:"boolean",defaultValue:false},isRoot:{type:"boolean",defaultValue:false}},associations:{element:{type:"sap.ui.core.Element"}},aggregations:{children:{type:"sap.ui.dt.Overlay",multiple:true},designTimeMetadata:{type:"sap.ui.dt.DesignTimeMetadata",altTypes:["function","object"],multiple:false}},events:{init:{},initFailed:{},afterRendering:{},beforeDestroy:{},destroyed:{parameters:{}},visibleChanged:{parameters:{visible:"boolean"}},geometryChanged:{},childAdded:{},scrollSynced:{},isRootChanged:{parameters:{value:{type:"boolean"}}},beforeGeometryChanged:{}}},constructor:function(){this._aStyleClasses=this._aStyleClasses.slice(0);this._oScrollbarSynchronizers=new Map();this._aBindParameters=[];E.apply(this,arguments);if(!this.getElement()){throw new Error("sap.ui.dt: can't create overlay without element");}this.asyncInit().then(function(){if(this._bShouldBeDestroyed){this.fireInitFailed({error:U.createError("Overlay#asyncInit","ElementOverlay is destroyed during initialization ('"+this.getId()+"')")});}else{this._bInit=true;this.fireInit();}}.bind(this)).catch(function(e){var d=U.wrapError(e);if(U.isForeignError(d)){var l='sap.ui.dt.Overlay#asyncInit';d.name='Error in '+l;d.message=U.printf("{0} / Can't initialize overlay (id='{1}') properly: {2}",l,this.getId(),d.message);}this.fireInitFailed({error:d});}.bind(this));this.attachEventOnce('afterRendering',function(e){var d=q(e.getParameter('domRef'));this._aBindParameters.forEach(function(B){d.on(B.sEventType,B.fnProxy);});},this);},_bInit:false,_bRendered:false,_$DomRef:null,_aStyleClasses:['sapUiDtOverlay'],_bShouldBeDestroyed:false,_aBindParameters:null});c.getOverlayContainer=function(){if(!o){o=q("<div/>").attr('id',b).appendTo("body");}return o;};c.removeOverlayContainer=function(){if(o){o.remove();}o=undefined;};c.getMutationObserver=function(){if(!m){m=new M();}return m;};c.destroyMutationObserver=function(){if(m){m.destroy();m=null;}};c.prototype.asyncInit=function(){return Promise.resolve();};c.prototype._getAttributes=function(){return{"id":this.getId(),"data-sap-ui":this.getId(),"class":this._aStyleClasses.join(" "),"tabindex":this.isFocusable()?0:null};};c.prototype._renderChildren=function(){return this.getChildren().map(function(C){return C.isRendered()?C.$():C.render();});};c.prototype.render=function(s){if(this.isRendered()){return this.getDomRef();}this._$DomRef=q('<div/>').attr(this._getAttributes());this._$Children=q('<div/>').attr({"class":"sapUiDtOverlayChildren"}).appendTo(this._$DomRef);this._$Children.append(this._renderChildren());this._bRendered=true;if(!s){this.fireAfterRendering({domRef:this._$DomRef.get(0)});}return this._$DomRef;};c.prototype.isInit=function(){return this._bInit;};c.prototype.isRendered=function(){return this._bRendered;};c.prototype.isReady=function(){return this.isInit()&&this.isRendered();};c.prototype.addStyleClass=function(C){if(!this.hasStyleClass(C)){this._aStyleClasses.push(C);if(this.isReady()){this.$().addClass(C);}}};c.prototype.hasStyleClass=function(C){return this._aStyleClasses.indexOf(C)!==-1;};c.prototype.removeStyleClass=function(C){if(this.hasStyleClass(C)){this._aStyleClasses=this._aStyleClasses.filter(function(i){return i!==C;});if(this.isReady()){this.$().removeClass(C);}}};c.prototype.toggleStyleClass=function(C){this[(this.hasStyleClass(C)?'remove':'add')+'StyleClass'](C);};c.prototype.setElement=function(e){if(!this.getElement()){this.setAssociation("element",e);if(this._designTimeMetadataCache){this.setDesignTimeMetadata(this._designTimeMetadataCache);delete this._designTimeMetadataCache;}}};c.prototype.destroy=function(){if(this.bIsDestroyed){L.error('FIXME: Do not destroy overlay twice (overlayId = '+this.getId()+')!');return;}this.fireBeforeDestroy();E.prototype.destroy.apply(this,arguments);};c.prototype.exit=function(){this._oScrollbarSynchronizers.forEach(function(s){s.destroy();});this._oScrollbarSynchronizers.clear();this.$().remove();delete this._bInit;delete this._bShouldBeDestroyed;delete this._$DomRef;delete this._oScrollbarSynchronizers;this.fireDestroyed();};c.prototype.setDesignTimeMetadata=function(v){if(!this.getElement()){this._designTimeMetadataCache=v;}else{this.setAggregation('designTimeMetadata',v);}};c.prototype.getDomRef=function(){return this.$().get(0);};c.prototype.getChildrenDomRef=function(){return this._$Children.get(0);};c.prototype.$=function(){return this._$DomRef||q();};c.prototype.getAssociatedDomRef=function(){throw new Error("This method is abstract and needs to be implemented");};c.prototype.getElementInstance=function(){return this.getElement();};c.prototype.getElement=function(){return a.getElementInstance(this.getAssociation('element'));};c.prototype.hasFocus=function(){return document.activeElement===this.getDomRef();};c.prototype.focus=function(){this.$().focus();};c.prototype.setFocusable=function(f){f=!!f;if(this.getFocusable()!==f){this.setProperty("focusable",f);this.toggleStyleClass("sapUiDtOverlayFocusable");this.$().attr("tabindex",f?0:null);}};c.prototype.isFocusable=function(){return this.getFocusable();};c.prototype._getRenderingParent=function(){return this.isRoot()?null:this.getParent().$();};c.prototype.applyStyles=function(f){this.fireBeforeGeometryChanged();if(!this.isRendered()){return;}if(this.isVisible()){var G=this.getGeometry(true);if(G&&G.visible){this._setSize(this.$(),G);var r=this._getRenderingParent();if(!this.isRoot()){var p=[];this.getParent()._oScrollbarSynchronizers.forEach(function(s){if(s._bSyncing){p.push(new Promise(function(R){s.attachEventOnce('synced',R);}));}});if(p.length){Promise.all(p).then(function(){this._applySizes(G,r,f);this.fireGeometryChanged();}.bind(this));}else{this._applySizes(G,r,f);}}else{this._applySizes(G,r,f);}}else{this.$().css("display","none");}}else{this.$().css("display","none");}if(!p||!p.length){this.fireGeometryChanged();}};c.prototype._applySizes=function(G,r,f){this._setPosition(this.$(),G,r,f);if(G.domRef){this._setZIndex(G,this.$());}this.getChildren().forEach(function(C){C.applyStyles(f);});};c.prototype._setZIndex=function(G,$){var d=G.domRef;var z=D.getZIndex(d);if(U.isInteger(z)){$.css("z-index",z);}else if(this.isRoot()){this._iZIndex=a.getZIndexBelowOpenPopups(this._iZIndex)||g();$.css("z-index",this._iZIndex);}};c.prototype._setSize=function(t,G){t.css("display","block");var s=G.size;t.css("width",s.width+"px");t.css("height",s.height+"px");};c.prototype._setPosition=function(t,G,p){var P=D.getOffsetFromParent(G,p?p.get(0):null);t.css("transform","translate("+P.left+"px, "+P.top+"px)");};c.prototype.attachBrowserEvent=function(e,h,l){if(e&&(typeof(e)==="string")){if(typeof h==="function"){if(!this._aBindParameters){this._aBindParameters=[];}l=l||this;var p=h.bind(l);this._aBindParameters.push({sEventType:e,fnHandler:h,oListener:l,fnProxy:p});this.$().on(e,p);}}return this;};c.prototype.detachBrowserEvent=function(e,h,l){if(e&&(typeof(e)==="string")){if(typeof(h)==="function"){var $=this.$(),i,p;l=l||this;if(this._aBindParameters){for(i=this._aBindParameters.length-1;i>=0;i--){p=this._aBindParameters[i];if(p.sEventType===e&&p.fnHandler===h&&p.oListener===l){this._aBindParameters.splice(i,1);$.unbind(e,p.fnProxy);}}}}}return this;};c.prototype._deleteDummyContainer=function(t,T){var d=t.find(">.sapUiDtDummyScrollContainer");if(d.length){d.remove();this._oScrollbarSynchronizers.get(t.get(0)).destroy();this._oScrollbarSynchronizers.delete(t.get(0));if(T._oScrollbarSynchronizers.size===0&&!T.getChildren().some(function(A){return A._oScrollbarSynchronizers.size>0;})){T.removeStyleClass("sapUiDtOverlayWithScrollBar");T.removeStyleClass("sapUiDtOverlayWithScrollBarVertical");T.removeStyleClass("sapUiDtOverlayWithScrollBarHorizontal");}}};c.prototype._handleOverflowScroll=function(G,t,T,f){var d=G.domRef;var s=G.size;var e=D.getOverflows(d);t.css("overflow-x",e.overflowX);t.css("overflow-y",e.overflowY);var i=d.scrollHeight;var h=d.scrollWidth;if(i>Math.ceil(s.height)||h>Math.ceil(s.width)){var j=t.find("> .sapUiDtDummyScrollContainer");if(!j.length){j=q("<div/>",{css:{height:i+"px",width:h+"px"}});j=q("<div class='sapUiDtDummyScrollContainer' style='height: "+i+"px; width: "+h+"px;'></div>");if(T&&D.hasVerticalScrollBar(d)){T.addStyleClass("sapUiDtOverlayWithScrollBar");T.addStyleClass("sapUiDtOverlayWithScrollBarVertical");}if(T&&D.hasHorizontalScrollBar(d)){T.addStyleClass("sapUiDtOverlayWithScrollBar");T.addStyleClass("sapUiDtOverlayWithScrollBarHorizontal");}t.append(j);var k=new S({synced:this.fireScrollSynced.bind(this)});k.addTarget(d,t.get(0));this._oScrollbarSynchronizers.set(t.get(0),k);}else{j.css({"height":i,"width":h});var k=this._oScrollbarSynchronizers.get(t.get(0));if(!k.hasTarget(d)){k.addTarget(d);}}if(f){k.sync(d,true);}}else{this._deleteDummyContainer(t,T);}};c.prototype.getGeometry=function(f){if(f||!this._mGeometry){var d=this.getAssociatedDomRef();var C;if(d){var i=this.isRoot();C=q.makeArray(d).map(function($){return D.getGeometry($,i);});}else{C=this.getChildren().map(function(e){return e.getGeometry(true);});}if(C.length){this._mGeometry=C.length>1?O.getGeometry(C):C[0];}else{delete this._mGeometry;}}return this._mGeometry;};c.prototype.setVisible=function(v){v=!!v;if(this.getVisible()!==v){this.setProperty("visible",v);this.fireVisibleChanged({visible:v});}};c.prototype.isVisible=function(){return(this.getVisible()&&(this.isRoot()?true:this.getParent().isVisible()));};c.prototype.setIsRoot=function(v){v=!!v;if(this.getIsRoot()!==v){this.setProperty('isRoot',v);this.fireIsRootChanged({value:v});}};c.prototype.isRoot=function(){return this.getIsRoot();};c.prototype.getShouldBeDestroyed=function(){return this._bShouldBeDestroyed;};return c;},true);
