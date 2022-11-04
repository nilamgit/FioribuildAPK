/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var L=0,a=1,b=2,A=3,c=4,d=5,e=6,f=7,g=8,h=9,j=10,k=11,S=12,V=0,l=1,m=2,n=3,o=4,p=5,r=6,s=7,u=8,v=9,w=10,x=11,y=12;var M={};M.isValid=function(i,t){if(!i||!Array.isArray(i)||i.length!==13){return false;}if(t){return M.isInvertible(i);}return true;};M.createIdentity=function(){return[0,0,0,1,0,0,0,1,0,0,0,1,1];};M.areEqual=function(t,z){for(var i=0;i<t.length;i++){if(Math.abs(t[i]-z[i])>0.01){return false;}}return true;};M.isInvertible=function(i){var z=0.0,B=0.0,C=i[A],D=i[c],E=i[d],F=i[e],G=i[f],H=i[g],I=i[h],J=i[j],K=i[k],t=C*G*K;if(t>=0.0){z+=t;}else{B+=t;}t=F*J*E;if(t>=0.0){z+=t;}else{B+=t;}t=I*D*H;if(t>=0.0){z+=t;}else{B+=t;}t=-I*G*E;if(t>=0.0){z+=t;}else{B+=t;}t=-F*D*K;if(t>=0.0){z+=t;}else{B+=t;}t=-C*J*H;if(t>=0.0){z+=t;}else{B+=t;}var N=z+B;if(N==0||Math.abs(N)<((z-B)*1.0e-12)){return false;}return true;};M.invert=function(i){var z=0.0,B=0.0,C=i[L],D=i[a],E=i[b],F=i[A],G=i[c],H=i[d],I=i[e],J=i[f],K=i[g],N=i[h],O=i[j],P=i[k],t=F*J*P,Q=M.createIdentity();if(t>=0.0){z+=t;}else{B+=t;}t=I*O*H;if(t>=0.0){z+=t;}else{B+=t;}t=N*G*K;if(t>=0.0){z+=t;}else{B+=t;}t=-N*J*H;if(t>=0.0){z+=t;}else{B+=t;}t=-I*G*P;if(t>=0.0){z+=t;}else{B+=t;}t=-F*O*K;if(t>=0.0){z+=t;}else{B+=t;}var R=z+B;if(R==0||Math.abs(R)<((z-B)*1.0e-12)){return Q;}var T=1.0/R;Q[A]=((J*P-O*K)*T);Q[c]=(-(G*P-O*H)*T);Q[d]=((G*K-J*H)*T);Q[e]=(-(I*P-N*K)*T);Q[f]=((F*P-N*H)*T);Q[g]=(-(F*K-I*H)*T);Q[h]=((I*O-N*J)*T);Q[j]=(-(F*O-N*G)*T);Q[k]=((F*J-I*G)*T);Q[L]=-(C*Q[A]+D*Q[e]+E*Q[h]);Q[a]=-(C*Q[c]+D*Q[f]+E*Q[j]);Q[b]=-(C*Q[d]+D*Q[g]+E*Q[k]);return Q;};M.to4x4Matrix=function(i){var t=[];t[0]=[i[A],i[c],i[d],0];t[1]=[i[e],i[f],i[g],0];t[2]=[i[h],i[j],i[k],0];t[3]=[i[L],i[a],i[b],i[S]];return t;};M.from4x4Matrix=function(i){var t=[];t[A]=i[0][0];t[c]=i[0][1];t[d]=i[0][2];t[e]=i[1][0];t[f]=i[1][1];t[g]=i[1][2];t[h]=i[2][0];t[j]=i[2][1];t[k]=i[2][2];t[L]=i[3][0];t[a]=i[3][1];t[b]=i[3][2];t[S]=i[3][3];return t;};M.fromVkMatrix=function(i){var t=[];t[A]=i[0];t[c]=i[1];t[d]=i[2];t[e]=i[3];t[f]=i[4];t[g]=i[5];t[h]=i[6];t[j]=i[7];t[k]=i[8];t[L]=i[9];t[a]=i[10];t[b]=i[11];t[S]=1;return t;};M.toVkMatrix=function(i){var t=[];t[0]=i[A];t[1]=i[c];t[2]=i[d];t[3]=i[e];t[4]=i[f];t[5]=i[g];t[6]=i[h];t[7]=i[j];t[8]=i[k];t[9]=i[L];t[10]=i[a];t[11]=i[b];return t;};M.fromVsmMatrixString=function(i){var t=i.split(" ").map(function(B){return parseFloat(B);});var z=[];z[A]=t[V];z[c]=t[l];z[d]=t[m];z[e]=t[n];z[f]=t[o];z[g]=t[p];z[h]=t[r];z[j]=t[s];z[k]=t[u];z[L]=t[v];z[a]=t[w];z[b]=t[x];z[S]=t[y];return z;};M.toVsmMatrixString=function(i){var t=[];t[V]=i[A];t[l]=i[c];t[m]=i[d];t[n]=i[e];t[o]=i[f];t[p]=i[g];t[r]=i[h];t[s]=i[j];t[u]=i[k];t[v]=i[L];t[w]=i[a];t[x]=i[b];t[y]=i[S];return t.join(" ");};M.multiply=function(i,t){var z=[],B=i[L],C=i[a],D=i[b],E=i[A],F=i[c],G=i[d],H=i[e],I=i[f],J=i[g],K=i[h],N=i[j],O=i[k],P=i[S],Q=t[L],R=t[a],T=t[b],U=t[A],W=t[c],X=t[d],Y=t[e],Z=t[f],$=t[g],_=t[h],a1=t[j],b1=t[k],c1=t[S];z[A]=E*U+F*Y+G*_;z[c]=E*W+F*Z+G*a1;z[d]=E*X+F*$+G*b1;z[e]=H*U+I*Y+J*_;z[f]=H*W+I*Z+J*a1;z[g]=H*X+I*$+J*b1;z[h]=K*U+N*Y+O*_;z[j]=K*W+N*Z+O*a1;z[k]=K*X+N*$+O*b1;z[L]=B*U+C*Y+D*_+P*Q;z[a]=B*W+C*Z+D*a1+P*R;z[b]=B*X+C*$+D*b1+P*T;z[S]=P*c1;return z;};M.getMatrixComponentNames=function(){if(!M._matrixComponentNames){var i=sap.ui.vtm.getResourceBundle();M._matrixComponentNames=[i.getText("TMATRIXCOMPONENT_LOCX"),i.getText("TMATRIXCOMPONENT_LOCY"),i.getText("TMATRIXCOMPONENT_LOCZ"),i.getText("TMATRIXCOMPONENT_AXIS1X"),i.getText("TMATRIXCOMPONENT_AXIS1Y"),i.getText("TMATRIXCOMPONENT_AXIS1Z"),i.getText("TMATRIXCOMPONENT_AXIS2X"),i.getText("TMATRIXCOMPONENT_AXIS2Y"),i.getText("TMATRIXCOMPONENT_AXIS2Z"),i.getText("TMATRIXCOMPONENT_AXIS3X"),i.getText("TMATRIXCOMPONENT_AXIS3Y"),i.getText("TMATRIXCOMPONENT_AXIS3Z"),i.getText("TMATRIXCOMPONENT_SCALE")];}return M._matrixComponentNames;};return M;},true);
