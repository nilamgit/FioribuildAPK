/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/base/ManagedObject','sap/ui/rta/command/FlexCommand','sap/ui/rta/command/AppDescriptorCommand','sap/ui/fl/FlexControllerFactory','sap/ui/fl/Utils','sap/ui/fl/Change','sap/ui/rta/ControlTreeModifier','sap/ui/fl/registry/Settings','sap/ui/dt/ElementUtil',"sap/base/Log"],function(M,F,A,a,b,C,R,S,E,L){"use strict";var c=M.extend("sap.ui.rta.command.LREPSerializer",{metadata:{library:"sap.ui.rta",associations:{"rootControl":{type:"sap.ui.core.Control"}},properties:{"commandStack":{type:"object"}},aggregations:{}}});function g(r){return E.getElementInstance(r);}c.prototype._lastPromise=Promise.resolve();c.prototype.setCommandStack=function(o){if(this.getCommandStack()){this.getCommandStack().removeCommandExecutionHandler(this._fnHandleCommandExecuted);}this.setProperty("commandStack",o);o.addCommandExecutionHandler(this._fnHandleCommandExecuted);};c.prototype.init=function(){this._fnHandleCommandExecuted=this.handleCommandExecuted.bind(this);};c.prototype.exit=function(){this.getCommandStack().removeCommandExecutionHandler(this._fnHandleCommandExecuted);};c.prototype._isPersistedChange=function(p){return!!this.getCommandStack()._aPersistedChanges&&this.getCommandStack()._aPersistedChanges.indexOf(p.getId())!==-1;};c.prototype.handleCommandExecuted=function(e){return(function(e){var p=e;this._lastPromise=this._lastPromise.catch(function(){}).then(function(){var d=this.getCommandStack().getSubCommands(p.command);var f;if(p.undo){d.forEach(function(o){if(!(o instanceof F||o instanceof A)||o.getRuntimeOnly()){return;}var h=o.getPreparedChange();var i=o.getAppComponent();if(i){if(o instanceof F){f=a.createForControl(i);var j=R.bySelector(h.getSelector(),i);f.removeFromAppliedChangesOnControl(h,i,j);}else if(o instanceof A){f=this._getAppDescriptorFlexController(i);}f.deleteChange(h,i);}}.bind(this));}else{var D=[];d.forEach(function(o){if(o.getRuntimeOnly()){return;}if(o instanceof F){var h=o.getAppComponent(true);if(h){var f=a.createForControl(h);var P=o.getPreparedChange();if(P.getState()===C.states.DELETED){P.setState(C.states.NEW);}if(!this._isPersistedChange(P)){f.addPreparedChange(o.getPreparedChange(),h);}}}else if(o instanceof A){D.push(o.createAndStoreChange());}}.bind(this));return Promise.all(D);}}.bind(this));return this._lastPromise;}.bind(this))(e);};c.prototype.needsReload=function(){this._lastPromise=this._lastPromise.catch(function(){}).then(function(){var d=this.getCommandStack().getAllExecutedCommands();return d.some(function(o){return!!o.needsReload;});}.bind(this));return this._lastPromise;};c.prototype.saveCommands=function(){this._lastPromise=this._lastPromise.catch(function(){}).then(function(){var r=g(this.getRootControl());if(!r){throw new Error("Can't save commands without root control instance!");}var f=a.createForControl(r);return f.saveAll();}.bind(this)).then(function(){var r=g(this.getRootControl());var f=this._getAppDescriptorFlexController(r);return f.saveAll();}.bind(this)).then(function(){L.info("UI adaptation successfully transfered changes to layered repository");this.getCommandStack().removeAllCommands();}.bind(this));return this._lastPromise;};c.prototype._getAppDescriptorFlexController=function(o){var d=b.getAppComponentForControl(o);var s=b.getComponentClassName(d).replace(".Component","");var e=b.getAppVersionFromManifest(d.getManifest());return a.create(s,e);};c.prototype._moveChangeToAppVariant=function(r,f){return S.getInstance().then(function(s){var p={reference:r};var n=b.createNamespace(p,"changes");var d=this.getCommandStack().getAllExecutedCommands();d.forEach(function(o){if(o.getPreparedChange&&!o.getRuntimeOnly()){var v=o.getPreparedChange();if(!Array.isArray(v)){v=[v];}v.forEach(function(e){if(s.isAtoEnabled()){e.setRequest("ATO_NOTIFICATION");}e.setNamespace(n);e.setComponent(r);});}});return f.saveAll(true);}.bind(this));};c.prototype._triggerUndoChanges=function(){var o=this.getCommandStack();var p=[];var d=o.getAllExecutedCommands();d.forEach(function(e){p.push(e.undo.bind(e));});p=p.reverse();return b.execPromiseQueueSequentially(p,false,true);};c.prototype._removeCommands=function(f){var o=this.getCommandStack();var d=o.getAllExecutedCommands();d.forEach(function(e){if(e instanceof F){var h=e.getPreparedChange();var i=e.getAppComponent();var j=R.bySelector(h.getSelector(),i);f.removeFromAppliedChangesOnControl(h,i,j);}});o.removeAllCommands();};c.prototype.saveAsCommands=function(r){if(!r){throw new Error("The id of the new app variant is required");}var o=g(this.getRootControl());if(!o){throw new Error("Can't save commands without root control instance!");}var d=b.getAppDescriptor(o);if(d["sap.app"].id===r){throw new Error("The id of the app variant should be different from the current app id");}var f=a.createForControl(o);var e=this.getCommandStack();return this._moveChangeToAppVariant(r,f).then(function(){e.detachCommandExecuted(this.handleCommandExecuted.bind(this));return this._triggerUndoChanges();}.bind(this)).then(function(){this._removeCommands(f);e.attachCommandExecuted(this.handleCommandExecuted.bind(this));return true;}.bind(this));};return c;},true);