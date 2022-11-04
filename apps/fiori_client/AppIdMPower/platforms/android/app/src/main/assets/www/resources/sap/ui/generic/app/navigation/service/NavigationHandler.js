/*
 * ! @copyright@
 */
sap.ui.define(["./NavError","./SelectionVariant","sap/ui/generic/app/library","sap/ui/base/Object","sap/ui/model/resource/ResourceModel","sap/ui/core/UIComponent","sap/ui/core/routing/HashChanger","sap/ui/thirdparty/jquery","sap/base/Log","sap/base/assert"],function(E,S,N,B,R,U,H,q,L,a){"use strict";var b=B.extend("sap.ui.generic.app.navigation.service.NavigationHandler",{metadata:{publicMethods:["navigate","parseNavigation","storeInnerAppState","openSmartLinkPopover","mixAttributesAndSelectionVariant","setModel"]},constructor:function(c,p){if(!c){throw new E("NavigationHandler.INVALID_INPUT");}if(c instanceof U){this.oRouter=c.getRouter();this.oComponent=c;}else{if(typeof c.getOwnerComponent!=="function"){throw new E("NavigationHandler.INVALID_INPUT");}this.oRouter=this._getRouter(c);this.oComponent=c.getOwnerComponent();}if(this.oComponent&&this.oComponent.getAppComponent){this.oComponent=this.oComponent.getAppComponent();}if(typeof this.oRouter==="undefined"||typeof this.oComponent==="undefined"||typeof this.oComponent.getComponentData!=="function"){throw new E("NavigationHandler.INVALID_INPUT");}try{this.oCrossAppNavService=this._getAppNavigationService();if(!this.oCrossAppNavService){L.error("NavigationHandler: CrossApplicationNavigation is not available.");throw new E("NavigationHandler.NO.XAPPSERVICE");}}catch(e){L.error("NavigationHandler: UShell service API for CrossApplicationNavigation is not available.");}this.IAPP_STATE="sap-iapp-state";this.sDefaultedParamProp="sap-ushell-defaultedParameterNames";this.sSAPSystemProp="sap-system";this._aTechnicalParamaters=["hcpApplicationId"];this._oLastSavedInnerAppData={sAppStateKey:"",oAppData:{},iCacheHit:0,iCacheMiss:0};this._rIAppStateOld=new RegExp("/"+this.IAPP_STATE+"=([^/?]+)");this._rIAppStateOldAtStart=new RegExp("^"+this.IAPP_STATE+"=([^/?]+)");this._rIAppStateNew=new RegExp("[\?&]"+this.IAPP_STATE+"=([^&]+)");if(p===sap.ui.generic.app.navigation.service.ParamHandlingMode.URLParamWins||p===sap.ui.generic.app.navigation.service.ParamHandlingMode.InsertInSelOpt){this.sParamHandlingMode=p;}else{this.sParamHandlingMode=sap.ui.generic.app.navigation.service.ParamHandlingMode.SelVarWins;}},_getAppNavigationService:function(){return sap.ushell.Container.getService("CrossApplicationNavigation");},_getRouter:function(c){return U.getRouterFor(c);},navigate:function(s,A,n,i,o,e){var c,p,x,C,d,f=false;C=this.oComponent.getComponentData();if(C){d=C.startupParameters;if(d&&d["sap-ushell-next-navmode"]&&d["sap-ushell-next-navmode"].length>0){f=(d["sap-ushell-next-navmode"][0]==="explace");}}if(e===undefined){x={};}else{x=e;}if(typeof n==="string"){c=n;var t={};t.selectionVariant=new S(c).toJSONObject();t=this._checkIsPotentiallySensitive(t);p=t.selectionVariant?this._getURLParametersFromSelectionVariant(new S(t.selectionVariant)):{};}else if(typeof n==="object"){p=n;var g=this._splitInboundNavigationParameters(new S(),p,[]).oNavigationSelVar;c=g.toJSONString();}else{throw new E("NavigationHandler.INVALID_INPUT");}var h=this;var j={target:{semanticObject:s,action:A},params:p||{}};var k=h.oCrossAppNavService.isNavigationSupported([j],h.oComponent);k.done(function(T){if(T[0].supported){var r;if(!f){r=h.storeInnerAppStateWithImmediateReturn(i,true);if(r&&r.appStateKey){h.replaceHash(r.appStateKey);}}if(!x.selectionVariant){x.selectionVariant=c;}r=h._saveAppStateWithImmediateReturn(x,o);if(r){j.appStateKey=r.appStateKey;h.oCrossAppNavService.toExternal(j,h.oComponent);}}else{if(o){var l=new E("NavigationHandler.isIntentSupported.notSupported");o(l);}}});if(o){k.fail(function(){var l=h._createTechnicalError("NavigationHandler.isIntentSupported.failed");o(l);});}},parseNavigation:function(){var A=H.getInstance().getHash();var i=this._getInnerAppStateKey(A);var c=this.oComponent.getComponentData();if(c===undefined){L.warning("The navigation Component's data was not set properly; assuming instead that no parameters are provided.");c={};}var s=c.startupParameters;var d=[];if(s&&s[this.sDefaultedParamProp]&&s[this.sDefaultedParamProp].length>0){d=JSON.parse(s[this.sDefaultedParamProp][0]);}var m=q.Deferred();var n=this;if(i){this._loadAppState(i,m);}else{var I=c["sap-xapp-state"]!==undefined;if(I){var o=this.oCrossAppNavService.getStartupAppState(this.oComponent);o.done(function(g){var f=g.getData();if(f){try{f=JSON.parse(JSON.stringify(f));}catch(x){var h=n._createTechnicalError("NavigationHandler.AppStateData.parseError");m.reject(h,s,sap.ui.generic.app.navigation.service.NavType.xAppState);return m.promise();}}if(f){var j=new S(f.selectionVariant);var e=n._splitInboundNavigationParameters(j,s,d);f.selectionVariant=e.oNavigationSelVar.toJSONString();f.oSelectionVariant=e.oNavigationSelVar;f.oDefaultedSelectionVariant=e.oDefaultedSelVar;f.bNavSelVarHasDefaultsOnly=e.bNavSelVarHasDefaultsOnly;m.resolve(f,s,sap.ui.generic.app.navigation.service.NavType.xAppState);}else{h=n._createTechnicalError("NavigationHandler.getDataFromAppState.failed");m.reject(h,s||{},sap.ui.generic.app.navigation.service.NavType.xAppState);}});o.fail(function(){var g=n._createTechnicalError("NavigationHandler.getStartupState.failed");m.reject(g,{},sap.ui.generic.app.navigation.service.NavType.xAppState);});}else{if(s){var e=n._splitInboundNavigationParameters(new S(),s,d);if(e.oNavigationSelVar.isEmpty()&&e.oDefaultedSelVar.isEmpty()){m.resolve({},s,sap.ui.generic.app.navigation.service.NavType.initial);}else{var f={};f.selectionVariant=e.oNavigationSelVar.toJSONString();f.oSelectionVariant=e.oNavigationSelVar;f.oDefaultedSelectionVariant=e.oDefaultedSelVar;f.bNavSelVarHasDefaultsOnly=e.bNavSelVarHasDefaultsOnly;m.resolve(f,s,sap.ui.generic.app.navigation.service.NavType.URLParams);}}else{m.resolve({},{},sap.ui.generic.app.navigation.service.NavType.initial);}}}return m.promise();},setTechnicalParameters:function(t){if(!t){t=[];}if(!Array.isArray(t)){L.error("NavigationHandler: parameter incorrect, array of strings expected");throw new E("NavigationHandler.INVALID_INPUT");}this._aTechnicalParamaters=t;},getTechnicalParameters:function(){return this._aTechnicalParamaters.concat([]);},_isTechnicalParameter:function(p){if(p){if(p.toLowerCase().indexOf("sap-")===0){return true;}else if(this._aTechnicalParamaters.indexOf(p)>=0){return true;}}return false;},_splitInboundNavigationParameters:function(s,o,d){if(!Array.isArray(d)){throw new E("NavigationHandler.INVALID_INPUT");}var p,i;var c={};for(p in o){if(!o.hasOwnProperty(p)){continue;}if(this._isTechnicalParameter(p)){continue;}if(typeof o[p]==="string"){c[p]=o[p];}else if(q.type(o[p])==="array"&&o[p].length===1){c[p]=o[p][0];}else if(q.type(o[p])==="array"&&o[p].length>1){c[p]=o[p];}else{throw new E("NavigationHandler.INVALID_INPUT");}}var D=new S();var n=new S();var e=s.getParameterNames().concat(s.getSelectOptionsPropertyNames());for(i=0;i<e.length;i++){p=e[i];if(p in c){if(d.indexOf(p)>-1){n.massAddSelectOption(p,s.getValue(p));this._addParameterValues(D,p,"I","EQ",c[p]);}else{switch(this.sParamHandlingMode){case sap.ui.generic.app.navigation.service.ParamHandlingMode.SelVarWins:n.massAddSelectOption(p,s.getValue(p));break;case sap.ui.generic.app.navigation.service.ParamHandlingMode.URLParamWins:this._addParameterValues(n,p,"I","EQ",c[p]);break;case sap.ui.generic.app.navigation.service.ParamHandlingMode.InsertInSelOpt:n.massAddSelectOption(p,s.getValue(p));this._addParameterValues(n,p,"I","EQ",c[p]);break;default:throw new E("NavigationHandler.INVALID_INPUT");}}}else{if(d.indexOf(p)>-1){D.massAddSelectOption(p,s.getValue(p));}else{n.massAddSelectOption(p,s.getValue(p));}}}for(p in c){if(e.indexOf(p)>-1){continue;}if(d.indexOf(p)>-1){this._addParameterValues(D,p,"I","EQ",c[p]);}else{this._addParameterValues(n,p,"I","EQ",c[p]);}}var f=false;if(n.isEmpty()){f=true;var P=D.getSelectOptionsPropertyNames();for(i=0;i<P.length;i++){n.massAddSelectOption(P[i],D.getValue(P[i]));}}return{oNavigationSelVar:n,oDefaultedSelVar:D,bNavSelVarHasDefaultsOnly:f};},_addParameterValues:function(s,p,c,o,v){if(Array.isArray(v)){for(var i=0;i<v.length;i++){s.addSelectOption(p,c,o,v[i]);}}else{s.addSelectOption(p,c,o,v);}},replaceHash:function(A){var h=this.oRouter.oHashChanger?this.oRouter.oHashChanger:H.getInstance();var s=h.getHash();var c=this._replaceInnerAppStateKey(s,A);h.replaceHash(c);},storeInnerAppState:function(i,I){if(typeof I!=="boolean"){I=true;}var n=this;var m=q.Deferred();var r=function(s){var h=n.oRouter.oHashChanger?n.oRouter.oHashChanger:H.getInstance();var d=h.getHash();var e=n._replaceInnerAppStateKey(d,s);h.replaceHash(e);};if(i===null){m.resolve("");return m.promise();}var A=this._oLastSavedInnerAppData.sAppStateKey;if(q.isEmptyObject(i)&&!A){m.resolve("");return m.promise();}var c=(JSON.stringify(i)===JSON.stringify(this._oLastSavedInnerAppData.oAppData));if(c&&A){this._oLastSavedInnerAppData.iCacheHit++;r(A);m.resolve(A);return m.promise();}this._oLastSavedInnerAppData.iCacheMiss++;var o=function(s){if(!I){r(s);}n._oLastSavedInnerAppData.oAppData=i;n._oLastSavedInnerAppData.sAppStateKey=s;m.resolve(s);};var O=function(e){m.reject(e);};var s=this._saveAppState(i,o,O);if(s!==undefined){if(I){r(s);}}return m.promise();},storeInnerAppStateWithImmediateReturn:function(i,I){if(typeof I!=="boolean"){I=false;}var t=this;var A=q.Deferred();if(i===null){return{appStateKey:"",promise:A.resolve("")};}var s=this._oLastSavedInnerAppData.sAppStateKey;if(q.isEmptyObject(i)&&!s){return{appStateKey:"",promise:A.resolve("")};}var c=(JSON.stringify(i)===JSON.stringify(this._oLastSavedInnerAppData.oAppData));if(c&&s){this._oLastSavedInnerAppData.iCacheHit++;return{appStateKey:s,promise:A.resolve(s)};}this._oLastSavedInnerAppData.iCacheMiss++;var o=function(d){if(!I){t.replaceHash(d);}t._oLastSavedInnerAppData.oAppData=i;t._oLastSavedInnerAppData.sAppStateKey=d;A.resolve(d);};var O=function(e){A.reject(e);};var d=this._saveAppState(i,o,O);return{appStateKey:d,promise:A.promise()};},processBeforeSmartLinkPopoverOpens:function(t,s,i,e){var m=q.Deferred();var c=t.semanticAttributes;var x,n=this;if(e===undefined){x={};}else{x=e;}var f=function(c,s){s=x.selectionVariant||s||"{}";var d=sap.ui.generic.app.navigation.service.SuppressionBehavior.raiseErrorOnNull|sap.ui.generic.app.navigation.service.SuppressionBehavior.raiseErrorOnUndefined;var M=n.mixAttributesAndSelectionVariant(c,s,d);s=M.toJSONString();var T={};T.selectionVariant=M.toJSONObject();T=n._checkIsPotentiallySensitive(T);c=T.selectionVariant?n._getURLParametersFromSelectionVariant(new S(T.selectionVariant)):{};var O=function(A){t.setSemanticAttributes(c);t.setAppStateKey(A);t.open();m.resolve(t);};var g=function(h){m.reject(h);};x.selectionVariant=s;n._saveAppState(x,O,g);};if(i){var o=this.storeInnerAppState(i,true);o.done(function(){f(c,s);});o.fail(function(d){m.reject(d);});}else{f(c,s);}return m.promise();},mixAttributesAndSelectionVariant:function(s,c,d){if(d===undefined){d=sap.ui.generic.app.navigation.service.SuppressionBehavior.standard;}var o=new S(c);var n=new S();if(o.getFilterContextUrl()){n.setFilterContextUrl(o.getFilterContextUrl());}if(o.getParameterContextUrl()){n.setParameterContextUrl(o.getParameterContextUrl());}for(var p in s){if(s.hasOwnProperty(p)){var v=s[p];if(q.type(v)==="array"||q.type(v)==="object"){v=JSON.stringify(v);}else if(q.type(v)==="date"){v=v.toJSON();}else if(q.type(v)==="number"||q.type(v)==="boolean"){v=v.toString();}if(v===""){if(d&sap.ui.generic.app.navigation.service.SuppressionBehavior.ignoreEmptyString){L.info("Semantic attribute "+p+" is an empty string and due to the chosen Suppression Behiavour is being ignored.");continue;}}if(v===null){if(d&sap.ui.generic.app.navigation.service.SuppressionBehavior.raiseErrorOnNull){throw new E("NavigationHandler.INVALID_INPUT");}else{L.warning("Semantic attribute "+p+" is null and ignored for mix in to selection variant");continue;}}if(v===undefined){if(d&sap.ui.generic.app.navigation.service.SuppressionBehavior.raiseErrorOnUndefined){throw new E("NavigationHandler.INVALID_INPUT");}else{L.warning("Semantic attribute "+p+" is undefined and ignored for mix in to selection variant");continue;}}if(q.type(v)==="string"){n.addSelectOption(p,"I","EQ",v);}else{throw new E("NavigationHandler.INVALID_INPUT");}}}var P=o.getParameterNames();for(var i=0;i<P.length;i++){if(!n.getSelectOption(P[i])){n.addSelectOption(P[i],"I","EQ",o.getParameter(P[i]));}}var e=o.getSelectOptionsPropertyNames();for(i=0;i<e.length;i++){if(!n.getSelectOption(e[i])){var f=o.getSelectOption(e[i]);for(var j=0;j<f.length;j++){n.addSelectOption(e[i],f[j].Sign,f[j].Option,f[j].Low,f[j].High);}}}return n;},_ensureSelectionVariantFormatString:function(s){if(s===undefined){return undefined;}var c=s;if(typeof s==="object"){c=JSON.stringify(s);}return c;},_saveAppState:function(A,o,O){var r=this._saveAppStateWithImmediateReturn(A,O);if(r){r.promise.done(function(){if(o){o(r.appStateKey);}});if(O){var n=this;r.promise.fail(function(){var e=n._createTechnicalError("NavigationHandler.AppStateSave.failed");O(e);});}return r.appStateKey;}return undefined;},_saveAppStateWithImmediateReturn:function(A,o){var c=this.oCrossAppNavService.createEmptyAppState(this.oComponent);var s=c.getKey();var d={selectionVariant:{},tableVariantId:"",customData:{}};if(A.selectionVariant){if(typeof A.selectionVariant==="string"){try{d.selectionVariant=JSON.parse(A.selectionVariant);}catch(x){var e=this._createTechnicalError("NavigationHandler.AppStateSave.parseError");if(o){o(e);}return undefined;}}else{d.selectionVariant=A.selectionVariant;}}if(A.tableVariantId){d.tableVariantId=A.tableVariantId;}if(A.customData){d.customData=A.customData;}if(A.presentationVariant){d.presentationVariant=A.presentationVariant;}if(A.valueTexts){d.valueTexts=A.valueTexts;}d=this._checkIsPotentiallySensitive(d);c.setData(d);var f=c.save();return{appStateKey:s,promise:f.promise()};},_loadAppState:function(A,d){var o=this.oCrossAppNavService.getAppState(this.oComponent,A);var n=this;o.done(function(c){var e={selectionVariant:"{}",oSelectionVariant:new S(),oDefaultedSelectionVariant:new S(),bNavSelVarHasDefaultsOnly:false,tableVariantId:"",customData:{},appStateKey:A,presentationVariant:{},valueTexts:{}};var f=c.getData();if(typeof f==="undefined"){var g=n._createTechnicalError("NavigationHandler.getDataFromAppState.failed");d.reject(g,{},sap.ui.generic.app.navigation.service.NavType.iAppState);}else{if(f.selectionVariant){e.selectionVariant=n._ensureSelectionVariantFormatString(f.selectionVariant);e.oSelectionVariant=new S(e.selectionVariant);}if(f.tableVariantId){e.tableVariantId=f.tableVariantId;}if(f.customData){e.customData=f.customData;}if(f.presentationVariant){e.presentationVariant=f.presentationVariant;}if(f.valueTexts){e.valueTexts=f.valueTexts;}}d.resolve(e,{},sap.ui.generic.app.navigation.service.NavType.iAppState);});o.fail(function(){var e=n._createTechnicalError("NavigationHandler.getAppState.failed");d.reject(e,{},sap.ui.generic.app.navigation.service.NavType.iAppState);});},_getInnerAppStateKey:function(A){if(!A){return undefined;}var m=this._rIAppStateNew.exec(A);if(m===null){m=this._rIAppStateOld.exec(A);}if(m===null){m=this._rIAppStateOldAtStart.exec(A);}if(m===null){return undefined;}return m[1];},_replaceInnerAppStateKey:function(A,s){var n=this.IAPP_STATE+"="+s;if(!A){return"?"+n;}var f=function(A){if(A.indexOf("?")!==-1){return A+"&"+n;}return A+"?"+n;};if(!this._getInnerAppStateKey(A)){return f(A);}if(this._rIAppStateNew.test(A)){return A.replace(this._rIAppStateNew,function(c){return c.replace(/\=.*/ig,"="+s);});}var r=function(c,A){A=A.replace(c,"");return f(A);};if(this._rIAppStateOld.test(A)){return r(this._rIAppStateOld,A);}if(this._rIAppStateOldAtStart.test(A)){return r(this._rIAppStateOldAtStart,A);}a(false,"internal inconsistency: Approach of sap-iapp-state not known, but _getInnerAppStateKey returned it");return undefined;},_getURLParametersFromSelectionVariant:function(s){var u={};var i=0;if(typeof s==="string"){var o=new S(s);}else if(typeof s==="object"){o=s;}else{throw new E("NavigationHandler.INVALID_INPUT");}var c=o.getSelectOptionsPropertyNames();for(i=0;i<c.length;i++){var d=o.getSelectOption(c[i]);if(d.length===1&&d[0].Sign==="I"&&d[0].Option==="EQ"){u[c[i]]=d[0].Low;}}var p=o.getParameterNames();for(i=0;i<p.length;i++){var P=o.getParameter(p[i]);u[p[i]]=P;}return u;},_createTechnicalError:function(e){return new E(e);},setModel:function(m){this._oModel=m;},_getModel:function(){return this._oModel||this.oComponent.getModel();},_removeAllProperties:function(d){if(d){if(d.selectionVariant){d.selectionVariant=null;}if(d.valueTexts){d.valueTexts=null;}}},_removeSensitiveProperties:function(s,c,d){if(s.length&&d&&(d.selectionVariant||d.valueTexts)){s.forEach(function(n){if(d.selectionVariant.SelectOptions){d.selectionVariant.SelectOptions.some(function(v,e){if(n===v.PropertyName){d.selectionVariant.SelectOptions.splice(e,1);return true;}return false;});}if(d.valueTexts&&d.valueTexts.Texts){d.valueTexts.Texts.forEach(function(t){if(t.PropertyTexts){t.PropertyTexts.some(function(v,e){if(n===v.PropertyName){t.PropertyTexts.splice(e,1);return true;}return false;});}});}});}if(c.length&&d&&d.selectionVariant&&d.selectionVariant.Parameters){c.forEach(function(n){d.selectionVariant.Parameters.some(function(v,e){if((n===v.PropertyName)||(("$Parameter."+n)===v.PropertyName)){d.selectionVariant.Parameters.splice(e,1);return true;}return false;});});}},_isPotentiallySensitive:function(p){var i=function(t){if(t){return t.Bool?t.Bool!=="false":true;}return false;};return(!!p["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"]&&i(p["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"]));},_constructContextUrl:function(m){var s=m._getServerUrl();if(s&&(s.lastIndexOf('/')===(s.length-1))){s=s.substr(0,s.length-1);}return s+m.sServiceUrl+"/$metadata";},_checkIsPotentiallySensitive:function(d){var A=d,s=[],c=[];var i,m,M,e,o,f,g,F=[],p=[];if(d&&d.selectionVariant&&(d.selectionVariant.FilterContextUrl&&d.selectionVariant.SelectOptions||d.selectionVariant.ParameterContextUrl&&d.selectionVariant.Parameters)){m=this._getModel();if(this.oComponent&&m&&m.isA("sap.ui.model.odata.v2.ODataModel")){M=m.getMetaModel();if(m.getServiceMetadata()&&M&&M.oModel){if(d.selectionVariant.FilterContextUrl){F=d.selectionVariant.FilterContextUrl.split('#');}if((F.length===2)&&d.selectionVariant.SelectOptions&&(this._constructContextUrl(m).indexOf(F[0])===0)){e=M.getODataEntitySet(F[1]);if(e){o=M.getODataEntityType(e.entityType);}else{o=M.getODataEntityType(F[1]);}if(o){if(o&&o.property){for(i=0;i<o.property.length;i++){if(this._isPotentiallySensitive(o.property[i])){s.push(o.property[i].name);}}}if(o.navigationProperty){for(i=0;i<o.navigationProperty.length;i++){g=M.getODataAssociationEnd(o,o.navigationProperty[i].name);if(!g||(g.type===d.selectionVariant.FilterContextUrl)){continue;}if(g.multiplicity==="1"||g.multiplicity==="0..1"){f=M.getODataEntityType(g.type);if(f&&f.property){for(var j=0;j<f.property.length;j++){if(this._isPotentiallySensitive(f.property[j])){s.push(o.navigationProperty[i].name+'.'+f.property[j].name);}}}}}}}}if(d.selectionVariant.ParameterContextUrl){p=d.selectionVariant.ParameterContextUrl.split('#');}if((p.length===2)&&d.selectionVariant.Parameters&&(this._constructContextUrl(m).indexOf(p[0])===0)){e=M.getODataEntitySet(p[1]);if(e){o=M.getODataEntityType(e.entityType);}else{o=M.getODataEntityType(F[1]);}if(o){if(o.property){for(i=0;i<o.property.length;i++){if(this._isPotentiallySensitive(o.property[i])){c.push(o.property[i].name);}}}}}if(s.length||c.length){A=q.extend(true,{},A);this._removeSensitiveProperties(s,c,A);}}else{this._removeAllProperties(A);L.error("NavigationHandler: oMetadata are not fully loaded!");}}}return A;}});return b;});
