(function(t){(function(e){function n(t){return t instanceof n?t:new o(t)}function i(t,e){var n=t.index,i=e.index;if(t=t.criteria,e=e.criteria,t!==e){if(t>e||t===undefined)return 1;if(e>t||e===undefined)return-1}return i>n?-1:1}function r(t,e,n){function i(){var r=arguments,s=e;if(n.length&&(r=r.length?n.concat(slice(r)):n),this instanceof i){a.prototype=t.prototype,s=new a,a.prototype=null;var o=t.apply(s,r);return y(o)?o:s}return t.apply(s,r)}if(!v(t))throw new TypeError;return i}function s(t){return Ye[t]}function o(t){this.__wrapped__=t}function a(){}function l(t){return Me.call(t)==me}function u(t){if(!t)return t;for(var e=1,n=arguments.length;n>e;e++){var i=arguments[e];if(i)for(var r in i)t[r]=i[r]}return t}function c(t){return y(t)?qe(t)?Re.call(t):u({},t):t}function h(t){if(!t)return t;for(var e=1,n=arguments.length;n>e;e++){var i=arguments[e];if(i)for(var r in i)null==t[r]&&(t[r]=i[r])}return t}function d(t){var e=[];return Xe(t,function(t,n){v(t)&&e.push(n)}),e.sort()}function p(t,e){return t?Ae.call(t,e):!1}function f(t){for(var e=-1,n=Ue(t),i=n.length,r={};i>++e;){var s=n[e];r[t[s]]=s}return r}function m(t){if(!t)return!0;if(qe(t)||w(t))return!t.length;for(var e in t)if(Ae.call(t,e))return!1;return!0}function g(t,e,i,r){if(t===e)return 0!==t||1/t==1/e;var s=typeof t,o=typeof e;if(t===t&&(!t||"function"!=s&&"object"!=s)&&(!e||"function"!=o&&"object"!=o))return!1;if(null==t||null==e)return t===e;var a=Me.call(t),l=Me.call(e);if(a!=l)return!1;switch(a){case ve:case ye:return+t==+e;case we:return t!=+t?e!=+e:0==t?1/t==1/e:t==+e;case _e:case ke:return t==e+""}var u=a==ge;if(!u){if(t instanceof n||e instanceof n)return g(t.__wrapped__||t,e.__wrapped__||e,i,r);if(a!=xe)return!1;var c=t.constructor,h=e.constructor;if(c!=h&&!(v(c)&&c instanceof c&&v(h)&&h instanceof h))return!1}i||(i=[]),r||(r=[]);for(var d=i.length;d--;)if(i[d]==t)return r[d]==e;var p=!0,f=0;if(i.push(t),r.push(e),u){if(f=e.length,p=f==t.length)for(;f--&&(p=g(t[f],e[f],i,r)););return p}return Xe(e,function(e,n,s){return Ae.call(s,n)?(f++,!(p=Ae.call(t,n)&&g(t[n],e,i,r))&&pe):undefined}),p&&Xe(t,function(t,e,n){return Ae.call(n,e)?!(p=--f>-1)&&pe:undefined}),p}function v(t){return"function"==typeof t}function y(t){return t?Ce[typeof t]:!1}function b(t){return t?Ce[typeof t]&&Me.call(t)==_e:!1}function w(t){return"string"==typeof t||Me.call(t)==ke}function x(t){var e=Ne.apply(Te,Re.call(arguments,1)),n={};return Xe(t,function(t,i){0>Y(e,i)&&(n[i]=t)}),n}function _(t){for(var e=-1,n=Ue(t),i=n.length,r=Array(i);i>++e;){var s=n[e];r[e]=[s,t[s]]}return r}function k(t){for(var e=-1,n=Ne.apply(Te,Re.call(arguments,1)),i=n.length,r={};i>++e;){var s=n[e];s in t&&(r[s]=t[s])}return r}function C(t){for(var e=-1,n=Ue(t),i=n.length,r=Array(i);i>++e;)r[e]=t[n[e]];return r}function T(t,e){var n=t?t.length:0,i=!1;return"number"==typeof n?i=Y(t,e)>-1:Ve(t,function(t){return(i=t===e)&&pe}),i}function D(t,e,n){var i={};return e=ee(e,n),A(t,function(t,n,r){n=e(t,n,r)+"",Ae.call(i,n)?i[n]++:i[n]=1}),i}function E(t,e,n){var i=!0;e=ee(e,n);var r=-1,s=t?t.length:0;if("number"==typeof s)for(;s>++r&&(i=!!e(t[r],r,t)););else Ve(t,function(t,n,r){return!(i=!!e(t,n,r))&&pe});return i}function N(t,e,n){var i=[];e=ee(e,n);var r=-1,s=t?t.length:0;if("number"==typeof s)for(;s>++r;){var o=t[r];e(o,r,t)&&i.push(o)}else Ve(t,function(t,n,r){e(t,n,r)&&i.push(t)});return i}function S(t,e,n){e=ee(e,n);var i=-1,r=t?t.length:0;if("number"!=typeof r){var s;return Ve(t,function(t,n,i){return e(t,n,i)?(s=t,pe):undefined}),s}for(;r>++i;){var o=t[i];if(e(o,i,t))return o}}function A(t,e,n){var i=-1,r=t?t.length:0;if(e=e&&n===undefined?e:ee(e,n),"number"==typeof r)for(;r>++i&&e(t[i],i,t)!==pe;);else Ve(t,e)}function j(t,e,n){var i={};return e=ee(e,n),A(t,function(t,n,r){n=e(t,n,r)+"",(Ae.call(i,n)?i[n]:i[n]=[]).push(t)}),i}function M(t,e){var n=Re.call(arguments,2),i=-1,r="function"==typeof e,s=t?t.length:0,o=Array("number"==typeof s?s:0);return A(t,function(t){o[++i]=(r?e:t[e]).apply(t,n)}),o}function P(t,e,n){var i=-1,r=t?t.length:0;if(e=ee(e,n),"number"==typeof r)for(var s=Array(r);r>++i;)s[i]=e(t[i],i,t);else s=[],Ve(t,function(t,n,r){s[++i]=e(t,n,r)});return s}function H(t,e,n){var i=-1/0,r=i,s=-1,o=t?t.length:0;if(e||"number"!=typeof o)e=ee(e,n),A(t,function(t,n,s){var o=e(t,n,s);o>i&&(i=o,r=t)});else for(;o>++s;){var a=t[s];a>r&&(r=a)}return r}function I(t,e,n){var i=1/0,r=i,s=-1,o=t?t.length:0;if(e||"number"!=typeof o)e=ee(e,n),A(t,function(t,n,s){var o=e(t,n,s);i>o&&(i=o,r=t)});else for(;o>++s;){var a=t[s];r>a&&(r=a)}return r}function O(t,e,n,i){if(!t)return n;var r=3>arguments.length;e=ee(e,i,4);var s=-1,o=t.length;if("number"==typeof o)for(r&&(n=t[++s]);o>++s;)n=e(n,t[s],s,t);else Ve(t,function(t,i,s){n=r?(r=!1,t):e(n,t,i,s)});return n}function L(t,e,n,i){var r=t,s=t?t.length:0,o=3>arguments.length;if("number"!=typeof s){var a=Ue(t);s=a.length}return e=ee(e,i,4),A(t,function(t,i,l){i=a?a[--s]:--s,n=o?(o=!1,r[i]):e(n,r[i],i,l)}),n}function $(t,e,n){return e=ee(e,n),N(t,function(t,n,i){return!e(t,n,i)})}function R(t){var e=-1,n=t?t.length:0,i=Array("number"==typeof n?n:0);return A(t,function(t){var n=Se($e()*(++e+1));i[e]=i[n],i[n]=t}),i}function z(t){var e=t?t.length:0;return"number"==typeof e?e:Ue(t).length}function F(t,e,n){var i;e=ee(e,n);var r=-1,s=t?t.length:0;if("number"==typeof s)for(;s>++r&&!(i=e(t[r],r,t)););else Ve(t,function(t,n,r){return(i=e(t,n,r))&&pe});return!!i}function W(t,e,n){var r=-1,s=t?t.length:0,o=Array("number"==typeof s?s:0);for(e=ee(e,n),A(t,function(t,n,i){o[++r]={criteria:e(t,n,i),index:r,value:t}}),s=o.length,o.sort(i);s--;)o[s]=o[s].value;return o}function q(t){return qe(t)?Re.call(t):t&&"number"==typeof t.length?P(t):C(t)}function B(t){for(var e=-1,n=t.length,i=Ne.apply(Te,Re.call(arguments,1)),r=[];n>++e;){var s=t[e];0>Y(i,s)&&r.push(s)}return r}function U(t,e,n){if(t){var i=0,r=t.length;if("number"!=typeof e&&null!=e){var s=-1;for(e=ee(e,n);r>++s&&e(t[s],s,t);)i++}else if(i=e,null==i||n)return t[0];return Re.call(t,0,Le(Oe(0,i),r))}}function Y(t,e,n){var i=-1,r=t?t.length:0;if("number"==typeof n)i=(0>n?Oe(0,r+n):n||0)-1;else if(n)return i=J(t,e),t[i]===e?i:-1;for(;r>++i;)if(t[i]===e)return i;return-1}function X(t,e,n){if(!t)return[];var i=0,r=t.length;if("number"!=typeof e&&null!=e){var s=r;for(e=ee(e,n);s--&&e(t[s],s,t);)i++}else i=null==e||n?1:e||i;return Re.call(t,0,Le(Oe(0,r-i),r))}function V(t,e,n){if(t){var i=0,r=t.length;if("number"!=typeof e&&null!=e){var s=r;for(e=ee(e,n);s--&&e(t[s],s,t);)i++}else if(i=e,null==i||n)return t[r-1];return Re.call(t,Oe(0,r-i))}}function K(t,e,n){var i=t?t.length:0;for("number"==typeof n&&(i=(0>n?Oe(0,i+n):Le(n,i-1))+1);i--;)if(t[i]===e)return i;return-1}function G(t,e,n){if("number"!=typeof e&&null!=e){var i=0,r=-1,s=t?t.length:0;for(e=ee(e,n);s>++r&&e(t[r],r,t);)i++}else i=null==e||n?1:Oe(0,e);return Re.call(t,i)}function J(t,e,n,i){var r=0,s=t?t.length:r;for(n=n?ee(n,i,1):re,e=n(e);s>r;){var o=r+s>>>1;e>n(t[o])?r=o+1:s=o}return r}function Q(t){return B(t,Re.call(arguments,1))}function Z(t,e){return We.fastBind||Pe&&arguments.length>2?Pe.call.apply(Pe,arguments):r(t,e,Re.call(arguments,2))}function te(t){for(var e=arguments.length>1?Ne.apply(Te,Re.call(arguments,1)):d(t),n=-1,i=e.length;i>++n;){var r=e[n];t[r]=Z(t[r],t)}return t}function ee(t,e,n){if(null==t)return re;var i=typeof t;if("function"!=i){if("object"!=i)return function(e){return e[t]};var r=Ue(t);return function(e){for(var n=r.length,i=!1;n--&&(i=e[r[n]]===t[r[n]]););return i}}return e!==undefined?1===n?function(n){return t.call(e,n)}:2===n?function(n,i){return t.call(e,n,i)}:4===n?function(n,i,r,s){return t.call(e,n,i,r,s)}:function(n,i,r){return t.call(e,n,i,r)}:t}function ne(t){var e,n;return function(){return e?n:(e=!0,n=t.apply(this,arguments),t=null,n)}}function ie(t){return null==t?"":(t+"").replace(fe,s)}function re(t){return t}function se(t){A(d(t),function(e){var i=n[e]=t[e];n.prototype[e]=function(){var t=[this.__wrapped__];je.apply(t,arguments);var e=i.apply(n,t);return this.__chain__&&(e=new o(e),e.__chain__=!0),e}})}function oe(t,e){var n=t?t[e]:null;return v(n)?t[e]():n}function ae(t){var e=++de+"";return t?t+e:e}function le(t){return t=new o(t),t.__chain__=!0,t}function ue(){return this.__chain__=!0,this}function ce(){return this.__wrapped__}var he="object"==typeof global&&global;(he.global===he||he.window===he)&&(e=he);var de=0,pe={};+new Date+"";var fe=/[&<>"']/g,me="[object Arguments]",ge="[object Array]",ve="[object Boolean]",ye="[object Date]",be="[object Function]",we="[object Number]",xe="[object Object]",_e="[object RegExp]",ke="[object String]",Ce={"boolean":!1,"function":!0,object:!0,number:!1,string:!1,undefined:!1},Te=[],De={};e._;var Ee=RegExp("^"+(De.valueOf+"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/valueOf|for [^\]]+/g,".+?")+"$"),Ne=(Math.ceil,e.clearTimeout,Te.concat),Se=Math.floor,Ae=De.hasOwnProperty,je=Te.push,Me=(e.setTimeout,De.toString),Pe=Ee.test(Pe=Me.bind)&&Pe,He=Ee.test(He=Array.isArray)&&He,Ie=(e.isFinite,e.isNaN,Ee.test(Ie=Object.keys)&&Ie),Oe=Math.max,Le=Math.min,$e=Math.random,Re=Te.slice,ze=Ee.test(e.attachEvent),Fe=Pe&&!/\n|true/.test(Pe+ze),We={};(function(){var t={0:1,length:1};We.fastBind=Pe&&!Fe,We.spliceObjects=(Te.splice.call(t,0,1),!t[0])})(1),o.prototype=n.prototype,l(arguments)||(l=function(t){return t?Ae.call(t,"callee"):!1});var qe=He||function(t){return t?"object"==typeof t&&Me.call(t)==ge:!1},Be=function(t){var e,n=t,i=[];if(!n)return i;if(!Ce[typeof t])return i;for(e in n)Ae.call(n,e)&&i.push(e);return i},Ue=Ie?function(t){return y(t)?Ie(t):[]}:Be,Ye={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};f(Ye);var Xe=function(t,e){var n,i=t,r=i;if(!i)return r;if(!Ce[typeof i])return r;for(n in i)if(e(i[n],n,t)===pe)return r;return r},Ve=function(t,e){var n,i=t,r=i;if(!i)return r;if(!Ce[typeof i])return r;for(n in i)if(Ae.call(i,n)&&e(i[n],n,t)===pe)return r;return r};v(/x/)&&(v=function(t){return"function"==typeof t&&Me.call(t)==be}),n.bind=Z,n.bindAll=te,n.countBy=D,n.defaults=h,n.difference=B,n.filter=N,n.forEach=A,n.functions=d,n.groupBy=j,n.initial=X,n.invert=f,n.invoke=M,n.keys=Ue,n.map=P,n.max=H,n.min=I,n.omit=x,n.once=ne,n.pairs=_,n.pick=k,n.reject=$,n.rest=G,n.shuffle=R,n.sortBy=W,n.toArray=q,n.values=C,n.without=Q,n.collect=P,n.drop=G,n.each=A,n.extend=u,n.methods=d,n.select=N,n.tail=G,n.clone=c,n.contains=T,n.escape=ie,n.every=E,n.find=S,n.has=p,n.identity=re,n.indexOf=Y,n.isArguments=l,n.isArray=qe,n.isEmpty=m,n.isEqual=g,n.isFunction=v,n.isObject=y,n.isRegExp=b,n.isString=w,n.lastIndexOf=K,n.mixin=se,n.reduce=O,n.reduceRight=L,n.result=oe,n.size=z,n.some=F,n.sortedIndex=J,n.uniqueId=ae,n.all=E,n.any=F,n.detect=S,n.foldl=O,n.foldr=L,n.include=T,n.inject=O,n.first=U,n.last=V,n.take=U,n.head=U,n.chain=le,n.VERSION="1.2.1",se(n),n.prototype.chain=ue,n.prototype.value=ce,A(["pop","push","reverse","shift","sort","splice","unshift"],function(t){var e=Te[t];n.prototype[t]=function(){var t=this.__wrapped__;return e.apply(t,arguments),We.spliceObjects||0!==t.length||delete t[0],this}}),A(["concat","join","slice"],function(t){var e=Te[t];n.prototype[t]=function(){var t=this.__wrapped__,n=e.apply(t,arguments);return this.__chain__&&(n=new o(n),n.__chain__=!0),n}}),"function"==typeof t&&"object"==typeof t.amd&&t.amd&&t(function(){return n})})(this)})(_wig.define);