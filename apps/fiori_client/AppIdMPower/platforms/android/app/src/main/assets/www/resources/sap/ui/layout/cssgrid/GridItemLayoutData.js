/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/LayoutData","sap/ui/layout/library"],function(L){"use strict";var g={gridColumnStart:"grid-column-start",gridColumnEnd:"grid-column-end",gridRowStart:"grid-row-start",gridRowEnd:"grid-row-end",gridColumn:"grid-column",gridRow:"grid-row"};var G=L.extend("sap.ui.layout.cssgrid.GridItemLayoutData",{metadata:{library:"sap.ui.layout",properties:{gridColumnStart:{type:"sap.ui.layout.cssgrid.CSSGridLine",defaultValue:""},gridColumnEnd:{type:"sap.ui.layout.cssgrid.CSSGridLine",defaultValue:""},gridRowStart:{type:"sap.ui.layout.cssgrid.CSSGridLine",defaultValue:""},gridRowEnd:{type:"sap.ui.layout.cssgrid.CSSGridLine",defaultValue:""},gridColumn:{type:"sap.ui.layout.cssgrid.CSSGridLine",defaultValue:""},gridRow:{type:"sap.ui.layout.cssgrid.CSSGridLine",defaultValue:""}}}});G._setItemStyles=function(i){if(!i){return;}var l=G._getLayoutDataForControl(i),I=i.getDomRef(),p,P,s;if(!I){return;}if(!l){G._removeItemStyles(I);return;}p=l.getMetadata().getProperties();for(P in g){if(p[P]){s=l.getProperty(P);if(typeof s!=="undefined"){G._setItemStyle(I,g[P],s);}}}};G._removeItemStyles=function(i){for(var p in g){i.style.removeProperty(g[p]);}};G._setItemStyle=function(i,p,v){if(v!=="0"&&!v){i.style.removeProperty(p);}else{i.style.setProperty(p,v);}};G._getLayoutDataForControl=function(c){var l,a,I;if(!c){return undefined;}l=c.getLayoutData();if(!l){return undefined;}if(l.isA("sap.ui.layout.cssgrid.GridItemLayoutData")){return l;}if(l.isA("sap.ui.core.VariantLayoutData")){a=l.getMultipleLayoutData();for(var i=0;i<a.length;i++){I=a[i];if(I.isA("sap.ui.layout.cssgrid.GridItemLayoutData")){return I;}}}};return G;});
