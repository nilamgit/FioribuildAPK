/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/model/FilterOperator","sap/ui/model/Filter",'sap/ui/mdc/base/type/Boolean','sap/ui/mdc/base/type/String',"jquery.sap.global","sap/base/Log","sap/base/util/ObjectPath","sap/base/util/merge"],function(B,M,F,N,U,q,L,O,m){"use strict";var a=B.extend("sap.ui.mdc.base.FilterOperatorConfig",{constructor:function(){B.apply(this);this.mOperators=q.extend(true,{},a._mOperators);this.mTypes=q.extend(true,{},a._mTypes);this.mOpsForType=q.extend(true,{},a._mOpsForType);}});sap.ui.model.type.String.extend("sap.ui.model.type.Key",{});a._mTypes={"base":undefined,"string":"base","numeric":"base","date":"base","datetime":"base","time":"base","boolean":"base","int":"numeric","float":"numeric","sap.ui.model.type.Boolean":"boolean","sap.ui.model.type.Date":"date","sap.ui.model.type.FileSize":"string","sap.ui.model.type.Float":"float","sap.ui.model.type.Integer":"int","sap.ui.model.type.String":"string","sap.ui.model.type.Time":"time","sap.ui.model.odata.type.Boolean":"boolean","sap.ui.model.odata.type.Byte":"int","sap.ui.model.odata.type.Date":"date","sap.ui.model.odata.type.DateTime":"datetime","sap.ui.model.odata.type.DateTimeOffset":"datetime","sap.ui.model.odata.type.Decimal":"float","sap.ui.model.odata.type.Double":"float","sap.ui.model.odata.type.Single":"float","sap.ui.model.odata.type.Guid":"string","sap.ui.model.odata.type.Int16":"int","sap.ui.model.odata.type.Int32":"int","sap.ui.model.odata.type.Int64":"int","sap.ui.model.odata.type.Raw":"string","sap.ui.model.odata.type.SByte":"int","sap.ui.model.odata.type.String":"string","sap.ui.model.odata.type.Time":"time","sap.ui.model.odata.type.TimeOfDay":"time","Edm.Boolean":"sap.ui.model.odata.type.Boolean","Edm.Byte":"sap.ui.model.odata.type.Byte","Edm.Date":"sap.ui.model.odata.type.Date","Edm.DateTime":"sap.ui.model.odata.type.DateTime","Edm.DateTimeOffset":"sap.ui.model.odata.type.DateTimeOffset","Edm.Decimal":"sap.ui.model.odata.type.Decimal","Edm.Double":"sap.ui.model.odata.type.Double","Edm.Single":"sap.ui.model.odata.type.Single","Edm.Guid":"sap.ui.model.odata.type.Guid","Edm.Int16":"sap.ui.model.odata.type.Int16","Edm.Int32":"sap.ui.model.odata.type.Int32","Edm.Int64":"sap.ui.model.odata.type.Int64","Edm.SByte":"sap.ui.model.odata.type.SByte","Edm.String":"sap.ui.model.odata.type.String","Edm.Time":"sap.ui.model.odata.type.Time","Edm.TimeOfDay":"sap.ui.model.odata.type.TimeOfDay"};Object.freeze(a._mTypes);a._mOpsForType={"base":{operators:["Contains","EQ","BT","StartsWith","EndsWith","LE","LT","GE","GT","NE"],defaultOperator:"EQ"},"string":{operators:["EEQ","Contains","EQ","BT","StartsWith","EndsWith","Empty","NotEmpty","LE","LT","GE","GT","NE"],defaultOperator:"Contains"},"date":{operators:["EQ","BT","LE","LT","GE","GT","NE"]},"datetime":{operators:["EQ","BT","LE","LT","GE","GT","NE"]},"numeric":{operators:["EQ","BT","LE","LT","GE","GT","NE"]},"time":{operators:["EQ","BT","LE","LT","GE","GT"]},"boolean":{operators:["EQ","NE"]}};Object.freeze(a._mOpsForType);a._mOperators={};var o=sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");sap.ui.getCore().attachLocalizationChanged(function(){o=sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");});function g(k,T){var i=k+(T?"."+T:""),j;if(o.hasText(i)){j=o.getText(i);}else if(T){j=o.getText(k);}else{j=i;}return j;}a._mInstances={};a._mClasses={undefined:a};a.getFor=function(i){var k=i&&i.getId();var j=a._mInstances[k];if(!j){var l=i&&i.getMetadata();var C=a._mClasses[l&&l.getName()];while(!C){l=l.getParent();C=a._mClasses[l&&l.getName()];}j=new C();a._mInstances[k]=j;}return j;};a.registerFor=function(i,j){a._mClasses[i]=j;};a.prototype._getConfig=function(T,C){var i=this.mOpsForType[T];if(i){return i[C];}};a.prototype._findConfig=function(T,C){if(typeof T==="object"){T=T.getMetadata().getName();}var i;while(T&&!(i=this._getConfig(T,C))){T=this.getParentType(T);}return i;};a.prototype.getOperatorsForType=function(T){return this._findConfig(T,"operators")||[];};a.prototype.getDefaultOperator=function(T){return this._findConfig(T,"defaultOperator")||[];};a.prototype.getMatchingOperators=function(T,v){var i=this.getOperatorsForType(T);return this._getMatchingOperators(i,v);};a.prototype._getMatchingOperators=function(i,v){var r=[],j;i.some(function(k){j=this.getOperator(k);if(j&&j.test(v)){r.push(j);}}.bind(this));return r;};a.prototype.addType=function(T,i){if(this.mTypes[T]){throw new Error("Type already exists: "+T);}else{this.mTypes[T]=i;}};a.prototype.getParentType=function(T){return this.mTypes[T];};a.prototype.addOperatorsToType=function(T,v){var i=T;if(typeof i==="object"){i=i.getMetadata().getName();}var j=this.getOperatorsForType(T);if(!(typeof v==="string")){j=j.concat(v);}else{j.push(v);}this.mOpsForType[i]=this.mOpsForType[i]||{};this.mOpsForType[i].operators=j;};a.prototype.addOperator=function(i){a._addOperatorTo(i,this.mOperators);};a._addOperatorTo=function(i,j){var C=j;if(!i.name){L.warning("Operator configuration expects a name property");}if(!i.filterOperator&&!i.getModelFilter){L.error("Operator configuration for "+i.name+" needs a default filter operator from sap.ui.model.FilterOperator or the function getModelFilter");return;}if(!D){if(C[i.name]&&!C[i.name].custom){L.warning("Duplicate Type Configuration: "+i.name+". A default type cannot be extended or overwritten.");return;}i.custom=true;}else{L.debug("Operator Configuration for "+i.name+" defined as default configuration");}i=e(i);if(D){}j[i.name]=i;};function e(j){var i;var T=j.textKey||"operators."+j.name;j.longText=j.longText||g(T+".longText")||"";j.tokenText=j.tokenText||g(T+".tokenText")||"";if(j.tokenParse){if(j.tokenText){j.tokenParse=j.tokenParse.replace(/#tokenText#/g,j.tokenText);var C=j.valueTypes.length;for(i=0;i<C;i++){var r=j.paramTypes?j.paramTypes[i]:j.valueTypes[i];j.tokenParse=j.tokenParse.replace(new RegExp("\\$"+i,"g"),r);}j.tokenParseRegExp=new RegExp(j.tokenParse,"i");}}else if(j.tokenText){j.tokenParseRegExp=new RegExp(j.tokenText,"i");}if(j.tokenFormat){if(j.tokenText){j.tokenFormat=j.tokenFormat.replace(/\#tokenText\#/g,j.tokenText);}}else if(j.tokenText){j.tokenFormat=j.tokenText;}j.format=j.format||f.bind(j);j.parse=j.parse||p.bind(j);j.test=j.test||t.bind(j);j.getCondition=j.getCondition||d.bind(j);j.getModelFilter=j.getModelFilter||b.bind(j);j._setOwner=s.bind(j);j.getTypeText=g.bind(j);j._createLocalType=c.bind(j);j.isEmpty=j.isEmpty||_.bind(j);j.createControl=j.createControl;return j;}function s(i){this.oFilterOperatorConfig=i;return this;}function b(C){var i=this.oFilterOperatorConfig.getOperator(C.operator);if(i.valueTypes.length==1){return new F({path:C.fieldPath,operator:i.filterOperator,value1:C.values[0]});}else{return new F({path:C.fieldPath,operator:i.filterOperator,value1:C.values[0],value2:C.values[1]});}}function _(C,T){var j=false;for(var i=0;i<this.valueTypes.length;i++){var v=C.values[i];if(v===null||v===undefined||v===""){j=true;break;}}return j;}function f(V,C,T){var j=this.tokenFormat,k=this.valueTypes.length;for(var i=0;i<k;i++){var v=V[i]!==undefined&&V[i]!==null?V[i]:"";if(this.valueTypes[i]!=="self"){T=this._createLocalType(this.valueTypes[i]);}var r=T?T.formatValue(v,"string"):v;j=j.replace(new RegExp("\\$"+i,"g"),r);}return j;}function p(T,j){var k=T.match(this.tokenParseRegExp);var r;if(k){r=[];for(var i=0;i<this.valueTypes.length;i++){if(this.valueTypes[i]!=="self"){j=this._createLocalType(this.valueTypes[i]);}try{var v=j?j.parseValue(k[i+1],"string"):k[i+1];if(j){j.validateValue(v);if((j.oFormatOptions&&j.oFormatOptions.toUpperCase===true)||(j.oConstraints&&j.oConstraints.toUpperCase===true)){v=v.toUpperCase?v.toUpperCase():v;}}r.push(v);}catch(l){L.warning(l.message);throw new sap.ui.base.Exception(l.message);}}}return r;}function c(T){if(!this._oType){q.sap.require(T);var i=O.get(T||"");this._oType=new i();}return this._oType;}function t(T,i){var j=this.tokenParseRegExp.test(T);if(j&&i){var v=this.parse(T,i);j=v.length==this.valueTypes.length;}return j;}function d(T,i){if(this.test(T,i)){var v=this.parse(T,i);return{operator:this.name,values:v};}return null;}a.prototype.getOperator=function(i){var j=this.mOperators[i];return j?j._setOwner(this):undefined;};var D=true;a._addOperatorTo({name:"EEQ",showInSuggest:false,filterOperator:M.EQ,tokenParse:"^==(.*)$",tokenFormat:"$1 ($0)",valueTypes:["self"],longText:"EEQ",displayFormats:{DescriptionValue:"$1 ($0)",ValueDescription:"$0 ($1)",Description:"$1",Value:"$0"},format:function(v,C,T,j){j=j||"DescriptionValue";var k=this.valueTypes.length+1,l=this.displayFormats[j];if(T&&(T.getMetadata().getName()==="sap.ui.model.type.Unit"||T.getMetadata().getName()==="sap.ui.model.type.Currency")){var n=T.formatValue(v,"string");l=l.replace(new RegExp("\\$0","g"),n);return l;}if(!v[1]){l=this.displayFormats["Value"];k=1;}for(var i=0;i<k;i++){var r=v[i]||"";if(i==0&&T&&(typeof T.formatValue==="function")){r=T.formatValue(r,"string");}l=l.replace(new RegExp("\\$"+i,"g"),r);}return l;}},a._mOperators);a._addOperatorTo({name:"EQ",filterOperator:M.EQ,tokenParse:"^=([^=].*)$",tokenFormat:"=$0",valueTypes:["self"]},a._mOperators);a._addOperatorTo({name:"BT",filterOperator:M.BT,tokenParse:"^(.+)\\.\\.\\.(.+)$",tokenFormat:"$0...$1",valueTypes:["self","self"]},a._mOperators);a._addOperatorTo({name:"LT",filterOperator:M.LT,tokenParse:"^<(.*)$",tokenFormat:"<$0",valueTypes:["self"]},a._mOperators);a._addOperatorTo({name:"GT",filterOperator:M.GT,tokenParse:"^>(.*)$",tokenFormat:">$0",valueTypes:["self"]},a._mOperators);a._addOperatorTo({name:"LE",filterOperator:M.LE,tokenParse:"^<=(.*)$",tokenFormat:"<=$0",valueTypes:["self"]},a._mOperators);a._addOperatorTo({name:"GE",filterOperator:M.GE,tokenParse:"^>=(.*)$",tokenFormat:">=$0",valueTypes:["self"]},a._mOperators);a._addOperatorTo({name:"StartsWith",filterOperator:M.StartsWith,tokenParse:"^([^\*].*)\\*$",tokenFormat:"$0*",valueTypes:["self"]},a._mOperators);a._addOperatorTo({name:"EndsWith",filterOperator:M.EndsWith,tokenParse:"^\\*(.*[^\*])$",tokenFormat:"*$0",valueTypes:["self"]},a._mOperators);a._addOperatorTo({name:"Contains",filterOperator:M.Contains,tokenParse:"^\\*(.*)\\*$",tokenFormat:"*$0*",valueTypes:["self"]},a._mOperators);a._addOperatorTo({name:"NE",filterOperator:M.NE,tokenParse:"^!=(.+)$",tokenFormat:"!=$0",valueTypes:["self"],exclude:true},a._mOperators);a._addOperatorTo({name:"Empty",filterOperator:M.EQ,tokenParse:"^<#tokenText#>$",tokenFormat:"<#tokenText#>",valueTypes:[],getModelFilter:function(C){var i=this.oFilterOperatorConfig.getOperator(C.operator);return new F({path:C.fieldPath,operator:i.filterOperator,value1:""});}},a._mOperators);a._addOperatorTo({name:"NotEmpty",filterOperator:M.NE,tokenParse:"^!\\(<empty>\\)$",tokenFormat:"!(<empty>)",valueTypes:[],getModelFilter:function(C){var i=this.oFilterOperatorConfig.getOperator(C.operator);return new F({path:C.fieldPath,operator:i.filterOperator,value1:""});}},a._mOperators);D=false;Object.freeze(a._mOperators);a.createControl=function(i,j,P,k){var n;if(j.valueTypes[k]!=="self"&&j.valueTypes[k]){i=j._createLocalType(j.valueTypes[k]);}if(j.createControl){return j.createControl(i,j,P,k);}var T=i.getMetadata().getName();var C;while(T&&!C&&T!=="base"){switch(T){case"boolean":var l=i;var r=new sap.ui.model.json.JSONModel({"items":[{"key":null,"text":""},{"key":true,"text":l?l.formatValue(true,"string"):"true"},{"key":false,"text":l?l.formatValue(false,"string"):"false"}]});m(i.oFormatOptions,{emptyString:null});n=new N(i.oFormatOptions,i.oConstraints);C=new sap.m.Select({selectedKey:{path:P,type:n,mode:'TwoWay'},width:"100%",items:{path:"/items",template:new sap.ui.core.Item({key:"{key}",text:"{text}"})}}).setModel(r);break;case"int":m(i.oFormatOptions,{emptyString:null});if(i.isA("sap.ui.model.type.Integer")){n=new sap.ui.model.type.Integer(i.oFormatOptions,i.oConstraints);}else{n=new sap.ui.model.odata.type.Integer(i.oFormatOptions,i.oConstraints);}C=new sap.m.Input({value:{path:P,type:n,mode:'TwoWay'}});break;case"float":m(i.oFormatOptions,{emptyString:null});if(i.isA("sap.ui.model.type.Integer")){n=new sap.ui.model.type.Float(i.oFormatOptions,i.oConstraints);}else{n=new sap.ui.model.odata.type.Double(i.oFormatOptions,i.oConstraints);}C=new sap.m.Input({value:{path:P,type:n,mode:'TwoWay'}});break;case"date":C=new sap.m.DatePicker({value:{path:P,type:i,mode:'TwoWay'}});break;case"time":C=new sap.m.TimePicker({width:"100%",value:{path:P,type:i,mode:'TwoWay'}});break;case"datetime":C=new sap.m.DateTimePicker({width:"100%",value:{path:P,type:i,mode:'TwoWay'}});break;default:break;}if(!C){T=h(T);}}if(!C){n=new U(i.oFormatOptions,i.oConstraints);C=new sap.m.Input({value:{path:P,type:n,mode:'TwoWay'}});}return C;};function h(T){return a._mTypes[T];}return a;},true);