(function(t){function e(t){return t instanceof e?t:new r(t)}function i(t,e){var i=t.index,n=e.index;if(t=t.criteria,e=e.criteria,t!==e){if(t>e||t===undefined)return 1;if(e>t||e===undefined)return-1}return n>i?-1:1}function n(t,e,i){function n(){var s=arguments,r=e;if(i.length&&(s=s.length?i.concat(slice(s)):i),this instanceof n){o.prototype=t.prototype,r=new o,o.prototype=null;var a=t.apply(r,s);return v(a)?a:r}return t.apply(r,s)}if(!g(t))throw new TypeError;return n}function s(t){return Ue[t]}function r(t){this.__wrapped__=t}function o(){}function a(t){return Me.call(t)==fe}function l(t){if(!t)return t;for(var e=1,i=arguments.length;i>e;e++){var n=arguments[e];if(n)for(var s in n)t[s]=n[s]}return t}function c(t){return v(t)?We(t)?$e.call(t):l({},t):t}function u(t){if(!t)return t;for(var e=1,i=arguments.length;i>e;e++){var n=arguments[e];if(n)for(var s in n)null==t[s]&&(t[s]=n[s])}return t}function h(t){var e=[];return Ye(t,function(t,i){g(t)&&e.push(i)}),e.sort()}function d(t,e){return t?Se.call(t,e):!1}function p(t){for(var e=-1,i=Be(t),n=i.length,s={};n>++e;){var r=i[e];s[t[r]]=r}return s}function f(t){if(!t)return!0;if(We(t)||b(t))return!t.length;for(var e in t)if(Se.call(t,e))return!1;return!0}function m(t,i,n,s){if(t===i)return 0!==t||1/t==1/i;var r=typeof t,o=typeof i;if(t===t&&(!t||"function"!=r&&"object"!=r)&&(!i||"function"!=o&&"object"!=o))return!1;if(null==t||null==i)return t===i;var a=Me.call(t),l=Me.call(i);if(a!=l)return!1;switch(a){case ge:case ve:return+t==+i;case be:return t!=+t?i!=+i:0==t?1/t==1/i:t==+i;case xe:case _e:return t==i+""}var c=a==me;if(!c){if(t instanceof e||i instanceof e)return m(t.__wrapped__||t,i.__wrapped__||i,n,s);if(a!=we)return!1;var u=t.constructor,h=i.constructor;if(u!=h&&!(g(u)&&u instanceof u&&g(h)&&h instanceof h))return!1}n||(n=[]),s||(s=[]);for(var d=n.length;d--;)if(n[d]==t)return s[d]==i;var p=!0,f=0;if(n.push(t),s.push(i),c){if(f=i.length,p=f==t.length)for(;f--&&(p=m(t[f],i[f],n,s)););return p}return Ye(i,function(e,i,r){return Se.call(r,i)?(f++,!(p=Se.call(t,i)&&m(t[i],e,n,s))&&de):undefined}),p&&Ye(t,function(t,e,i){return Se.call(i,e)?!(p=--f>-1)&&de:undefined}),p}function g(t){return"function"==typeof t}function v(t){return t?ke[typeof t]:!1}function y(t){return t?ke[typeof t]&&Me.call(t)==xe:!1}function b(t){return"string"==typeof t||Me.call(t)==_e}function w(t){var e=Ee.apply(Ce,$e.call(arguments,1)),i={};return Ye(t,function(t,n){0>U(e,n)&&(i[n]=t)}),i}function x(t){for(var e=-1,i=Be(t),n=i.length,s=Array(n);n>++e;){var r=i[e];s[e]=[r,t[r]]}return s}function _(t){for(var e=-1,i=Ee.apply(Ce,$e.call(arguments,1)),n=i.length,s={};n>++e;){var r=i[e];r in t&&(s[r]=t[r])}return s}function k(t){for(var e=-1,i=Be(t),n=i.length,s=Array(n);n>++e;)s[e]=t[i[e]];return s}function C(t,e){var i=t?t.length:0,n=!1;return"number"==typeof i?n=U(t,e)>-1:Xe(t,function(t){return(n=t===e)&&de}),n}function T(t,e,i){var n={};return e=te(e,i),S(t,function(t,i,s){i=e(t,i,s)+"",Se.call(n,i)?n[i]++:n[i]=1}),n}function D(t,e,i){var n=!0;e=te(e,i);var s=-1,r=t?t.length:0;if("number"==typeof r)for(;r>++s&&(n=!!e(t[s],s,t)););else Xe(t,function(t,i,s){return!(n=!!e(t,i,s))&&de});return n}function E(t,e,i){var n=[];e=te(e,i);var s=-1,r=t?t.length:0;if("number"==typeof r)for(;r>++s;){var o=t[s];e(o,s,t)&&n.push(o)}else Xe(t,function(t,i,s){e(t,i,s)&&n.push(t)});return n}function N(t,e,i){e=te(e,i);var n=-1,s=t?t.length:0;if("number"!=typeof s){var r;return Xe(t,function(t,i,n){return e(t,i,n)?(r=t,de):undefined}),r}for(;s>++n;){var o=t[n];if(e(o,n,t))return o}}function S(t,e,i){var n=-1,s=t?t.length:0;if(e=e&&i===undefined?e:te(e,i),"number"==typeof s)for(;s>++n&&e(t[n],n,t)!==de;);else Xe(t,e)}function A(t,e,i){var n={};return e=te(e,i),S(t,function(t,i,s){i=e(t,i,s)+"",(Se.call(n,i)?n[i]:n[i]=[]).push(t)}),n}function M(t,e){var i=$e.call(arguments,2),n=-1,s="function"==typeof e,r=t?t.length:0,o=Array("number"==typeof r?r:0);return S(t,function(t){o[++n]=(s?e:t[e]).apply(t,i)}),o}function P(t,e,i){var n=-1,s=t?t.length:0;if(e=te(e,i),"number"==typeof s)for(var r=Array(s);s>++n;)r[n]=e(t[n],n,t);else r=[],Xe(t,function(t,i,s){r[++n]=e(t,i,s)});return r}function H(t,e,i){var n=-1/0,s=n,r=-1,o=t?t.length:0;if(e||"number"!=typeof o)e=te(e,i),S(t,function(t,i,r){var o=e(t,i,r);o>n&&(n=o,s=t)});else for(;o>++r;){var a=t[r];a>s&&(s=a)}return s}function j(t,e,i){var n=1/0,s=n,r=-1,o=t?t.length:0;if(e||"number"!=typeof o)e=te(e,i),S(t,function(t,i,r){var o=e(t,i,r);n>o&&(n=o,s=t)});else for(;o>++r;){var a=t[r];s>a&&(s=a)}return s}function I(t,e,i,n){if(!t)return i;var s=3>arguments.length;e=te(e,n,4);var r=-1,o=t.length;if("number"==typeof o)for(s&&(i=t[++r]);o>++r;)i=e(i,t[r],r,t);else Xe(t,function(t,n,r){i=s?(s=!1,t):e(i,t,n,r)});return i}function L(t,e,i,n){var s=t,r=t?t.length:0,o=3>arguments.length;if("number"!=typeof r){var a=Be(t);r=a.length}return e=te(e,n,4),S(t,function(t,n,l){n=a?a[--r]:--r,i=o?(o=!1,s[n]):e(i,s[n],n,l)}),i}function O(t,e,i){return e=te(e,i),E(t,function(t,i,n){return!e(t,i,n)})}function $(t){var e=-1,i=t?t.length:0,n=Array("number"==typeof i?i:0);return S(t,function(t){var i=Ne(Oe()*(++e+1));n[e]=n[i],n[i]=t}),n}function R(t){var e=t?t.length:0;return"number"==typeof e?e:Be(t).length}function z(t,e,i){var n;e=te(e,i);var s=-1,r=t?t.length:0;if("number"==typeof r)for(;r>++s&&!(n=e(t[s],s,t)););else Xe(t,function(t,i,s){return(n=e(t,i,s))&&de});return!!n}function F(t,e,n){var s=-1,r=t?t.length:0,o=Array("number"==typeof r?r:0);for(e=te(e,n),S(t,function(t,i,n){o[++s]={criteria:e(t,i,n),index:s,value:t}}),r=o.length,o.sort(i);r--;)o[r]=o[r].value;return o}function W(t){return We(t)?$e.call(t):t&&"number"==typeof t.length?P(t):k(t)}function q(t){for(var e=-1,i=t.length,n=Ee.apply(Ce,$e.call(arguments,1)),s=[];i>++e;){var r=t[e];0>U(n,r)&&s.push(r)}return s}function B(t,e,i){if(t){var n=0,s=t.length;if("number"!=typeof e&&null!=e){var r=-1;for(e=te(e,i);s>++r&&e(t[r],r,t);)n++}else if(n=e,null==n||i)return t[0];return $e.call(t,0,Le(Ie(0,n),s))}}function U(t,e,i){var n=-1,s=t?t.length:0;if("number"==typeof i)n=(0>i?Ie(0,s+i):i||0)-1;else if(i)return n=G(t,e),t[n]===e?n:-1;for(;s>++n;)if(t[n]===e)return n;return-1}function Y(t,e,i){if(!t)return[];var n=0,s=t.length;if("number"!=typeof e&&null!=e){var r=s;for(e=te(e,i);r--&&e(t[r],r,t);)n++}else n=null==e||i?1:e||n;return $e.call(t,0,Le(Ie(0,s-n),s))}function X(t,e,i){if(t){var n=0,s=t.length;if("number"!=typeof e&&null!=e){var r=s;for(e=te(e,i);r--&&e(t[r],r,t);)n++}else if(n=e,null==n||i)return t[s-1];return $e.call(t,Ie(0,s-n))}}function V(t,e,i){var n=t?t.length:0;for("number"==typeof i&&(n=(0>i?Ie(0,n+i):Le(i,n-1))+1);n--;)if(t[n]===e)return n;return-1}function K(t,e,i){if("number"!=typeof e&&null!=e){var n=0,s=-1,r=t?t.length:0;for(e=te(e,i);r>++s&&e(t[s],s,t);)n++}else n=null==e||i?1:Ie(0,e);return $e.call(t,n)}function G(t,e,i,n){var s=0,r=t?t.length:s;for(i=i?te(i,n,1):ne,e=i(e);r>s;){var o=s+r>>>1;e>i(t[o])?s=o+1:r=o}return s}function J(t){return q(t,$e.call(arguments,1))}function Q(t,e){return Fe.fastBind||Pe&&arguments.length>2?Pe.call.apply(Pe,arguments):n(t,e,$e.call(arguments,2))}function Z(t){for(var e=arguments.length>1?Ee.apply(Ce,$e.call(arguments,1)):h(t),i=-1,n=e.length;n>++i;){var s=e[i];t[s]=Q(t[s],t)}return t}function te(t,e,i){if(null==t)return ne;var n=typeof t;if("function"!=n){if("object"!=n)return function(e){return e[t]};var s=Be(t);return function(e){for(var i=s.length,n=!1;i--&&(n=e[s[i]]===t[s[i]]););return n}}return e!==undefined?1===i?function(i){return t.call(e,i)}:2===i?function(i,n){return t.call(e,i,n)}:4===i?function(i,n,s,r){return t.call(e,i,n,s,r)}:function(i,n,s){return t.call(e,i,n,s)}:t}function ee(t){var e,i;return function(){return e?i:(e=!0,i=t.apply(this,arguments),t=null,i)}}function ie(t){return null==t?"":(t+"").replace(pe,s)}function ne(t){return t}function se(t){S(h(t),function(i){var n=e[i]=t[i];e.prototype[i]=function(){var t=[this.__wrapped__];Ae.apply(t,arguments);var i=n.apply(e,t);return this.__chain__&&(i=new r(i),i.__chain__=!0),i}})}function re(t,e){var i=t?t[e]:null;return g(i)?t[e]():i}function oe(t){var e=++he+"";return t?t+e:e}function ae(t){return t=new r(t),t.__chain__=!0,t}function le(){return this.__chain__=!0,this}function ce(){return this.__wrapped__}var ue="object"==typeof global&&global;(ue.global===ue||ue.window===ue)&&(t=ue);var he=0,de={};+new Date+"";var pe=/[&<>"']/g,fe="[object Arguments]",me="[object Array]",ge="[object Boolean]",ve="[object Date]",ye="[object Function]",be="[object Number]",we="[object Object]",xe="[object RegExp]",_e="[object String]",ke={"boolean":!1,"function":!0,object:!0,number:!1,string:!1,undefined:!1},Ce=[],Te={};t._;var De=RegExp("^"+(Te.valueOf+"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/valueOf|for [^\]]+/g,".+?")+"$"),Ee=(Math.ceil,t.clearTimeout,Ce.concat),Ne=Math.floor,Se=Te.hasOwnProperty,Ae=Ce.push,Me=(t.setTimeout,Te.toString),Pe=De.test(Pe=Me.bind)&&Pe,He=De.test(He=Array.isArray)&&He,je=(t.isFinite,t.isNaN,De.test(je=Object.keys)&&je),Ie=Math.max,Le=Math.min,Oe=Math.random,$e=Ce.slice,Re=De.test(t.attachEvent),ze=Pe&&!/\n|true/.test(Pe+Re),Fe={};(function(){var t={0:1,length:1};Fe.fastBind=Pe&&!ze,Fe.spliceObjects=(Ce.splice.call(t,0,1),!t[0])})(1),r.prototype=e.prototype,a(arguments)||(a=function(t){return t?Se.call(t,"callee"):!1});var We=He||function(t){return t?"object"==typeof t&&Me.call(t)==me:!1},qe=function(t){var e,i=t,n=[];if(!i)return n;if(!ke[typeof t])return n;for(e in i)Se.call(i,e)&&n.push(e);return n},Be=je?function(t){return v(t)?je(t):[]}:qe,Ue={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};p(Ue);var Ye=function(t,e){var i,n=t,s=n;if(!n)return s;if(!ke[typeof n])return s;for(i in n)if(e(n[i],i,t)===de)return s;return s},Xe=function(t,e){var i,n=t,s=n;if(!n)return s;if(!ke[typeof n])return s;for(i in n)if(Se.call(n,i)&&e(n[i],i,t)===de)return s;return s};g(/x/)&&(g=function(t){return"function"==typeof t&&Me.call(t)==ye}),e.bind=Q,e.bindAll=Z,e.countBy=T,e.defaults=u,e.difference=q,e.filter=E,e.forEach=S,e.functions=h,e.groupBy=A,e.initial=Y,e.invert=p,e.invoke=M,e.keys=Be,e.map=P,e.max=H,e.min=j,e.omit=w,e.once=ee,e.pairs=x,e.pick=_,e.reject=O,e.rest=K,e.shuffle=$,e.sortBy=F,e.toArray=W,e.values=k,e.without=J,e.collect=P,e.drop=K,e.each=S,e.extend=l,e.methods=h,e.select=E,e.tail=K,e.clone=c,e.contains=C,e.escape=ie,e.every=D,e.find=N,e.has=d,e.identity=ne,e.indexOf=U,e.isArguments=a,e.isArray=We,e.isEmpty=f,e.isEqual=m,e.isFunction=g,e.isObject=v,e.isRegExp=y,e.isString=b,e.lastIndexOf=V,e.mixin=se,e.reduce=I,e.reduceRight=L,e.result=re,e.size=R,e.some=z,e.sortedIndex=G,e.uniqueId=oe,e.all=D,e.any=z,e.detect=N,e.foldl=I,e.foldr=L,e.include=C,e.inject=I,e.first=B,e.last=X,e.take=B,e.head=B,e.chain=ae,e.VERSION="1.2.1",se(e),e.prototype.chain=le,e.prototype.value=ce,S(["pop","push","reverse","shift","sort","splice","unshift"],function(t){var i=Ce[t];e.prototype[t]=function(){var t=this.__wrapped__;return i.apply(t,arguments),Fe.spliceObjects||0!==t.length||delete t[0],this}}),S(["concat","join","slice"],function(t){var i=Ce[t];e.prototype[t]=function(){var t=this.__wrapped__,e=i.apply(t,arguments);return this.__chain__&&(e=new r(e),e.__chain__=!0),e}}),"function"==typeof define&&"object"==typeof define.amd&&define.amd&&define(function(){return e})})(this);