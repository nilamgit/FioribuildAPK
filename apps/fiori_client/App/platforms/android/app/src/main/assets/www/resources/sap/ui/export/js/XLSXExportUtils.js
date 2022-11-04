var XLSXExportUtils=function(e){function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var r={};return t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=35)}({35:function(e,t,r){var n=r(36),o=r(38);e.exports={oData:{fetch:n.requestData,getConverter:n.getConverter},saveFile:o.saveFile}},36:function(e,t,r){function n(e,t){return t.keys.reduce(function(e,t){return e&&e[t]},e)}function o(e,t){return t.forEach(function(t){e.forEach(function(e){e[t.property]=n(e,t)})}),e}function a(e){return e.workbook.columns.reduce(function(e,t){var r;return r=t.property instanceof Array?t.property:[t.property],r.forEach(function(r){var n=r.split("/");n.length>1&&e.push({property:r,keys:n,type:t.type})}),e},[])}function i(e){var t=a(e);return function(e){return o(e,t)}}function s(e,t,r){var n,o=/\$skip\=[0-9]+/,a=/\$top\=[0-9]+/;return e?(n=URI.parse(e),n.query=n.query||"",o.test(n.query)||(n.query+=(n.query.length?"&":"")+"$skip="+t),a.test(n.query)||(n.query+="&$top="+r),(URI.serialize||URI.build)(n)):""}function u(e,t){function r(e,t,r){var n,o;return n=URI.parse(x),r?(o=URI.parse(r),n.query=o.query):n.query=(n.query||"").replace(/\$skip\=[0-9]+/g,"$skip="+e).replace(/\$top\=[0-9]+/g,"$top="+t),(URI.serialize||URI.build)(n)}function n(e){t({error:e})}function o(e){var i,s,p,l,x,y={};h||(i=e&&e.d&&(e.d.results||e.d)||e,i=Array.isArray(i)?i:[],p=i.length,u+=p,x=d-u,l=u/d,y.finished=0===p||x<=0,y.progress=Math.round(100*l),s=e&&e.d&&e.d.__next||null,y.finished||(a.dataUrl=r(u,Math.min(f,x),s),c.sendRequest(a).then(o).catch(n)),y.rows=v(i),t(y))}var a,u=0,l=e.dataSource,d=Math.min(l.count||p,p),f=Math.min(l.sizeLimit||p,e.batchSize||p,d),h=!1,x=s(l.dataUrl,0,f),v=i(e);return a={serviceUrl:function(e){var t;return e?(t=URI.parse(e),t.path=t.path||"","/"!==t.path.slice(-1)&&(t.path=t.path+"/"),delete t.query,delete t.hash,delete t.fragment,(URI.serialize||URI.build)(t)):""}(l.serviceUrl),dataUrl:r(0,f),method:l.useBatch?"BATCH":"GET",headers:l.headers},c.sendRequest(a).then(o).catch(n),{cancel:function(){h=!0}}}var c=r(37),p=1e6;e.exports={requestData:u,getConverter:i}},37:function(e,t){function r(e){if("object"!=typeof e||null===e||"string"!=typeof e.dataUrl)throw new Error("Unable to send request - Mandatory parameters missing.");return("BATCH"===e.method&&e.serviceUrl?a:n)(e)}function n(e){return new Promise(function(t,r){var n,o=new XMLHttpRequest;o.onload=function(){if(this.status>=400)return void r(this.responseText);try{t(JSON.parse(this.responseText))}catch(e){r(s+this.responseText)}},o.onerror=function(){r(i)},o.onabort=function(){r(i)},o.open("GET",e.dataUrl,!0),o.setRequestHeader("accept","application/json");for(n in e.headers)"accept"!=n.toLowerCase()&&o.setRequestHeader(n,e.headers[n]);o.send()})}function o(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)})}function a(e){return new Promise(function(t,r){var n,a,u=new XMLHttpRequest,c="batch_"+o(),p=e.dataUrl.split(e.serviceUrl)[1],l=[];u.onload=function(){var e,n,o,a,i,u;for(e=this.responseText,n=this.responseText.split("\r\n"),i=0,a=n.length,o=a-1;i<a&&"{"!==n[i].slice(0,1);)i++;for(;o>0&&"}"!==n[o].slice(-1);)o--;n=n.slice(i,o+1),e=n.join("\r\n");try{u=JSON.parse(e),t(u)}catch(t){r(s+e)}},u.onerror=function(){r(i)},u.onabort=function(){r(i)},u.open("POST",e.serviceUrl+"$batch",!0),u.setRequestHeader("Accept","multipart/mixed"),u.setRequestHeader("Content-Type","multipart/mixed;boundary="+c),l.push("--"+c),l.push("Content-Type: application/http"),l.push("Content-Transfer-Encoding: binary"),l.push(""),l.push("GET "+p+" HTTP/1.1");for(n in e.headers)a=e.headers[n],"accept"!=n.toLowerCase()&&u.setRequestHeader(n,a),l.push(n+":"+a);l.push(""),l.push(""),l.push("--"+c+"--"),l.push(""),l=l.join("\r\n"),u.send(l)})}var i="HTTP connection error",s="Unexpected server response:\n";e.exports={sendRequest:r}},38:function(e,t){function r(e,t){var r,n,o;e instanceof Blob&&(r=document.createElementNS("http://www.w3.org/1999/xhtml","a"),n="download"in r,n&&(o=function(e,t){r.download=t,r.href=URL.createObjectURL(e),r.dispatchEvent(new MouseEvent("click"))}),void 0===o&&(o=function(t){var r=new FileReader;r.onloadend=function(){var e,t;t=r.result.replace(/^data:[^;]*;/,"data:attachment/file;"),(e=window.open(t,"_blank"))||(window.location.href=t)},r.readAsDataURL(e)}),"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob&&(o=function(e,t){window.navigator.msSaveOrOpenBlob(e,t)}),o(e,t))}e.exports={saveFile:r}}});