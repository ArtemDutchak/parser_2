!function(t){var r={};function n(e){if(r[e])return r[e].exports;var o=r[e]={i:e,l:!1,exports:{}};return t[e].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=r,n.d=function(t,r,e){n.o(t,r)||Object.defineProperty(t,r,{enumerable:!0,get:e})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,r){if(1&r&&(t=n(t)),8&r)return t;if(4&r&&"object"==typeof t&&t&&t.__esModule)return t;var e=Object.create(null);if(n.r(e),Object.defineProperty(e,"default",{enumerable:!0,value:t}),2&r&&"string"!=typeof t)for(var o in t)n.d(e,o,function(r){return t[r]}.bind(null,o));return e},n.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(r,"a",r),r},n.o=function(t,r){return Object.prototype.hasOwnProperty.call(t,r)},n.p="",n(n.s=341)}({1:function(t,r,n){(function(r){var n=function(t){return t&&t.Math==Math&&t};t.exports=n("object"==typeof globalThis&&globalThis)||n("object"==typeof window&&window)||n("object"==typeof self&&self)||n("object"==typeof r&&r)||Function("return this")()}).call(this,n(40))},10:function(t,r,n){var e=n(9),o=n(44),i=n(3),u=n(41),c=Object.defineProperty;r.f=e?c:function(t,r,n){if(i(t),r=u(r,!0),i(n),o)try{return c(t,r,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported");return"value"in n&&(t[r]=n.value),t}},100:function(t,r,n){"use strict";var e=n(66).IteratorPrototype,o=n(58),i=n(25),u=n(31),c=n(19),f=function(){return this};t.exports=function(t,r,n){var a=r+" Iterator";return t.prototype=o(e,{next:i(1,n)}),u(t,a,!1,!0),c[a]=f,t}},11:function(t,r){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},115:function(t,r){t.exports={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0}},116:function(t,r,n){var e=n(2),o=n(58),i=n(10),u=e("unscopables"),c=Array.prototype;null==c[u]&&i.f(c,u,{configurable:!0,value:o(null)}),t.exports=function(t){c[u][t]=!0}},117:function(t,r,n){var e=n(4);t.exports=!e((function(){function t(){}return t.prototype.constructor=null,Object.getPrototypeOf(new t)!==t.prototype}))},118:function(t,r,n){var e=n(7);t.exports=function(t){if(!e(t)&&null!==t)throw TypeError("Can't set "+String(t)+" as a prototype");return t}},12:function(t,r){t.exports=function(t){if(null==t)throw TypeError("Can't call method on "+t);return t}},13:function(t,r,n){var e=n(1),o=n(8),i=n(5),u=n(26),c=n(29),f=n(21),a=f.get,s=f.enforce,p=String(String).split("String");(t.exports=function(t,r,n,c){var f=!!c&&!!c.unsafe,a=!!c&&!!c.enumerable,l=!!c&&!!c.noTargetGet;"function"==typeof n&&("string"!=typeof r||i(n,"name")||o(n,"name",r),s(n).source=p.join("string"==typeof r?r:"")),t!==e?(f?!l&&t[r]&&(a=!0):delete t[r],a?t[r]=n:o(t,r,n)):a?t[r]=n:u(r,n)})(Function.prototype,"toString",(function(){return"function"==typeof this&&a(this).source||c(this)}))},15:function(t,r,n){var e=n(80),o=n(1),i=function(t){return"function"==typeof t?t:void 0};t.exports=function(t,r){return arguments.length<2?i(e[t])||i(o[t]):e[t]&&e[t][r]||o[t]&&o[t][r]}},18:function(t,r){var n=Math.ceil,e=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?e:n)(t)}},19:function(t,r){t.exports={}},2:function(t,r,n){var e=n(1),o=n(46),i=n(5),u=n(47),c=n(48),f=n(84),a=o("wks"),s=e.Symbol,p=f?s:s&&s.withoutSetter||u;t.exports=function(t){return i(a,t)||(c&&i(s,t)?a[t]=s[t]:a[t]=p("Symbol."+t)),a[t]}},20:function(t,r,n){var e=n(71),o=n(12);t.exports=function(t){return e(o(t))}},21:function(t,r,n){var e,o,i,u=n(77),c=n(1),f=n(7),a=n(8),s=n(5),p=n(33),l=n(30),v=c.WeakMap;if(u){var y=new v,d=y.get,b=y.has,g=y.set;e=function(t,r){return g.call(y,t,r),r},o=function(t){return d.call(y,t)||{}},i=function(t){return b.call(y,t)}}else{var h=p("state");l[h]=!0,e=function(t,r){return a(t,h,r),r},o=function(t){return s(t,h)?t[h]:{}},i=function(t){return s(t,h)}}t.exports={set:e,get:o,has:i,enforce:function(t){return i(t)?o(t):e(t,{})},getterFor:function(t){return function(r){var n;if(!f(r)||(n=o(r)).type!==t)throw TypeError("Incompatible receiver, "+t+" required");return n}}}},22:function(t,r){t.exports=!1},23:function(t,r,n){var e=n(18),o=Math.min;t.exports=function(t){return t>0?o(e(t),9007199254740991):0}},24:function(t,r,n){var e=n(1),o=n(28).f,i=n(8),u=n(13),c=n(26),f=n(78),a=n(42);t.exports=function(t,r){var n,s,p,l,v,y=t.target,d=t.global,b=t.stat;if(n=d?e:b?e[y]||c(y,{}):(e[y]||{}).prototype)for(s in r){if(l=r[s],p=t.noTargetGet?(v=o(n,s))&&v.value:n[s],!a(d?s:y+(b?".":"#")+s,t.forced)&&void 0!==p){if(typeof l==typeof p)continue;f(l,p)}(t.sham||p&&p.sham)&&i(l,"sham",!0),u(n,s,l,t)}}},25:function(t,r){t.exports=function(t,r){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:r}}},26:function(t,r,n){var e=n(1),o=n(8);t.exports=function(t,r){try{o(e,t,r)}catch(n){e[t]=r}return r}},28:function(t,r,n){var e=n(9),o=n(70),i=n(25),u=n(20),c=n(41),f=n(5),a=n(44),s=Object.getOwnPropertyDescriptor;r.f=e?s:function(t,r){if(t=u(t),r=c(r,!0),a)try{return s(t,r)}catch(t){}if(f(t,r))return i(!o.f.call(t,r),t[r])}},29:function(t,r,n){var e=n(45),o=Function.toString;"function"!=typeof e.inspectSource&&(e.inspectSource=function(t){return o.call(t)}),t.exports=e.inspectSource},3:function(t,r,n){var e=n(7);t.exports=function(t){if(!e(t))throw TypeError(String(t)+" is not an object");return t}},30:function(t,r){t.exports={}},31:function(t,r,n){var e=n(10).f,o=n(5),i=n(2)("toStringTag");t.exports=function(t,r,n){t&&!o(t=n?t:t.prototype,i)&&e(t,i,{configurable:!0,value:r})}},32:function(t,r,n){var e=n(1),o=n(7),i=e.document,u=o(i)&&o(i.createElement);t.exports=function(t){return u?i.createElement(t):{}}},33:function(t,r,n){var e=n(46),o=n(47),i=e("keys");t.exports=function(t){return i[t]||(i[t]=o(t))}},34:function(t,r){t.exports=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"]},341:function(t,r,n){"use strict";n.r(r);n(76),n(56);var e=class{static send(t,r,n,e){browser&&browser.runtime&&browser.runtime.sendMessage&&browser.runtime.sendMessage({from:t,method:r,message:n},t=>{e&&e(t)})}};var o=class{constructor(){e.send("AdBlocker","domRules",{},t=>{if(!1===t)return;const r=document.querySelectorAll(t);for(const t of r)t.parentElement.removeChild(t)})}};class i{constructor(){new o}}try{new i}catch(t){console.log("CRITICAL ERROR"),console.log(t)}},4:function(t,r){t.exports=function(t){try{return!!t()}catch(t){return!0}}},40:function(t,r){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(t){"object"==typeof window&&(n=window)}t.exports=n},41:function(t,r,n){var e=n(7);t.exports=function(t,r){if(!e(t))return t;var n,o;if(r&&"function"==typeof(n=t.toString)&&!e(o=n.call(t)))return o;if("function"==typeof(n=t.valueOf)&&!e(o=n.call(t)))return o;if(!r&&"function"==typeof(n=t.toString)&&!e(o=n.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},42:function(t,r,n){var e=n(4),o=/#|\.prototype\./,i=function(t,r){var n=c[u(t)];return n==a||n!=f&&("function"==typeof r?e(r):!!r)},u=i.normalize=function(t){return String(t).replace(o,".").toLowerCase()},c=i.data={},f=i.NATIVE="N",a=i.POLYFILL="P";t.exports=i},44:function(t,r,n){var e=n(9),o=n(4),i=n(32);t.exports=!e&&!o((function(){return 7!=Object.defineProperty(i("div"),"a",{get:function(){return 7}}).a}))},45:function(t,r,n){var e=n(1),o=n(26),i=e["__core-js_shared__"]||o("__core-js_shared__",{});t.exports=i},46:function(t,r,n){var e=n(22),o=n(45);(t.exports=function(t,r){return o[t]||(o[t]=void 0!==r?r:{})})("versions",[]).push({version:"3.6.4",mode:e?"pure":"global",copyright:"© 2020 Denis Pushkarev (zloirock.ru)"})},47:function(t,r){var n=0,e=Math.random();t.exports=function(t){return"Symbol("+String(void 0===t?"":t)+")_"+(++n+e).toString(36)}},48:function(t,r,n){var e=n(4);t.exports=!!Object.getOwnPropertySymbols&&!e((function(){return!String(Symbol())}))},5:function(t,r){var n={}.hasOwnProperty;t.exports=function(t,r){return n.call(t,r)}},52:function(t,r,n){var e=n(5),o=n(20),i=n(81).indexOf,u=n(30);t.exports=function(t,r){var n,c=o(t),f=0,a=[];for(n in c)!e(u,n)&&e(c,n)&&a.push(n);for(;r.length>f;)e(c,n=r[f++])&&(~i(a,n)||a.push(n));return a}},53:function(t,r,n){var e=n(12);t.exports=function(t){return Object(e(t))}},56:function(t,r,n){var e=n(1),o=n(115),i=n(96),u=n(8),c=n(2),f=c("iterator"),a=c("toStringTag"),s=i.values;for(var p in o){var l=e[p],v=l&&l.prototype;if(v){if(v[f]!==s)try{u(v,f,s)}catch(t){v[f]=s}if(v[a]||u(v,a,p),o[p])for(var y in i)if(v[y]!==i[y])try{u(v,y,i[y])}catch(t){v[y]=i[y]}}}},57:function(t,r,n){var e=n(15);t.exports=e("document","documentElement")},58:function(t,r,n){var e,o=n(3),i=n(97),u=n(34),c=n(30),f=n(57),a=n(32),s=n(33),p=s("IE_PROTO"),l=function(){},v=function(t){return"<script>"+t+"<\/script>"},y=function(){try{e=document.domain&&new ActiveXObject("htmlfile")}catch(t){}var t,r;y=e?function(t){t.write(v("")),t.close();var r=t.parentWindow.Object;return t=null,r}(e):((r=a("iframe")).style.display="none",f.appendChild(r),r.src=String("javascript:"),(t=r.contentWindow.document).open(),t.write(v("document.F=Object")),t.close(),t.F);for(var n=u.length;n--;)delete y.prototype[u[n]];return y()};c[p]=!0,t.exports=Object.create||function(t,r){var n;return null!==t?(l.prototype=o(t),n=new l,l.prototype=null,n[p]=t):n=y(),void 0===r?n:i(n,r)}},59:function(t,r,n){var e=n(52),o=n(34).concat("length","prototype");r.f=Object.getOwnPropertyNames||function(t){return e(t,o)}},66:function(t,r,n){"use strict";var e,o,i,u=n(67),c=n(8),f=n(5),a=n(2),s=n(22),p=a("iterator"),l=!1;[].keys&&("next"in(i=[].keys())?(o=u(u(i)))!==Object.prototype&&(e=o):l=!0),null==e&&(e={}),s||f(e,p)||c(e,p,(function(){return this})),t.exports={IteratorPrototype:e,BUGGY_SAFARI_ITERATORS:l}},67:function(t,r,n){var e=n(5),o=n(53),i=n(33),u=n(117),c=i("IE_PROTO"),f=Object.prototype;t.exports=u?Object.getPrototypeOf:function(t){return t=o(t),e(t,c)?t[c]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?f:null}},7:function(t,r){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},70:function(t,r,n){"use strict";var e={}.propertyIsEnumerable,o=Object.getOwnPropertyDescriptor,i=o&&!e.call({1:2},1);r.f=i?function(t){var r=o(this,t);return!!r&&r.enumerable}:e},71:function(t,r,n){var e=n(4),o=n(11),i="".split;t.exports=e((function(){return!Object("z").propertyIsEnumerable(0)}))?function(t){return"String"==o(t)?i.call(t,""):Object(t)}:Object},72:function(t,r){r.f=Object.getOwnPropertySymbols},76:function(t,r){window.chrome?window.browser||(window.browser=window.chrome):window.chrome=window.browser?window.browser:{}},77:function(t,r,n){var e=n(1),o=n(29),i=e.WeakMap;t.exports="function"==typeof i&&/native code/.test(o(i))},78:function(t,r,n){var e=n(5),o=n(79),i=n(28),u=n(10);t.exports=function(t,r){for(var n=o(r),c=u.f,f=i.f,a=0;a<n.length;a++){var s=n[a];e(t,s)||c(t,s,f(r,s))}}},79:function(t,r,n){var e=n(15),o=n(59),i=n(72),u=n(3);t.exports=e("Reflect","ownKeys")||function(t){var r=o.f(u(t)),n=i.f;return n?r.concat(n(t)):r}},8:function(t,r,n){var e=n(9),o=n(10),i=n(25);t.exports=e?function(t,r,n){return o.f(t,r,i(1,n))}:function(t,r,n){return t[r]=n,t}},80:function(t,r,n){var e=n(1);t.exports=e},81:function(t,r,n){var e=n(20),o=n(23),i=n(82),u=function(t){return function(r,n,u){var c,f=e(r),a=o(f.length),s=i(u,a);if(t&&n!=n){for(;a>s;)if((c=f[s++])!=c)return!0}else for(;a>s;s++)if((t||s in f)&&f[s]===n)return t||s||0;return!t&&-1}};t.exports={includes:u(!0),indexOf:u(!1)}},82:function(t,r,n){var e=n(18),o=Math.max,i=Math.min;t.exports=function(t,r){var n=e(t);return n<0?o(n+r,0):i(n,r)}},84:function(t,r,n){var e=n(48);t.exports=e&&!Symbol.sham&&"symbol"==typeof Symbol.iterator},88:function(t,r,n){var e=n(3),o=n(118);t.exports=Object.setPrototypeOf||("__proto__"in{}?function(){var t,r=!1,n={};try{(t=Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set).call(n,[]),r=n instanceof Array}catch(t){}return function(n,i){return e(n),o(i),r?t.call(n,i):n.__proto__=i,n}}():void 0)},9:function(t,r,n){var e=n(4);t.exports=!e((function(){return 7!=Object.defineProperty({},1,{get:function(){return 7}})[1]}))},96:function(t,r,n){"use strict";var e=n(20),o=n(116),i=n(19),u=n(21),c=n(99),f=u.set,a=u.getterFor("Array Iterator");t.exports=c(Array,"Array",(function(t,r){f(this,{type:"Array Iterator",target:e(t),index:0,kind:r})}),(function(){var t=a(this),r=t.target,n=t.kind,e=t.index++;return!r||e>=r.length?(t.target=void 0,{value:void 0,done:!0}):"keys"==n?{value:e,done:!1}:"values"==n?{value:r[e],done:!1}:{value:[e,r[e]],done:!1}}),"values"),i.Arguments=i.Array,o("keys"),o("values"),o("entries")},97:function(t,r,n){var e=n(9),o=n(10),i=n(3),u=n(98);t.exports=e?Object.defineProperties:function(t,r){i(t);for(var n,e=u(r),c=e.length,f=0;c>f;)o.f(t,n=e[f++],r[n]);return t}},98:function(t,r,n){var e=n(52),o=n(34);t.exports=Object.keys||function(t){return e(t,o)}},99:function(t,r,n){"use strict";var e=n(24),o=n(100),i=n(67),u=n(88),c=n(31),f=n(8),a=n(13),s=n(2),p=n(22),l=n(19),v=n(66),y=v.IteratorPrototype,d=v.BUGGY_SAFARI_ITERATORS,b=s("iterator"),g=function(){return this};t.exports=function(t,r,n,s,v,h,x){o(n,r,s);var m,w,S,O=function(t){if(t===v&&L)return L;if(!d&&t in _)return _[t];switch(t){case"keys":case"values":case"entries":return function(){return new n(this,t)}}return function(){return new n(this)}},j=r+" Iterator",T=!1,_=t.prototype,P=_[b]||_["@@iterator"]||v&&_[v],L=!d&&P||O(v),M="Array"==r&&_.entries||P;if(M&&(m=i(M.call(new t)),y!==Object.prototype&&m.next&&(p||i(m)===y||(u?u(m,y):"function"!=typeof m[b]&&f(m,b,g)),c(m,j,!0,!0),p&&(l[j]=g))),"values"==v&&P&&"values"!==P.name&&(T=!0,L=function(){return P.call(this)}),p&&!x||_[b]===L||f(_,b,L),l[r]=L,v)if(w={values:O("values"),keys:h?L:O("keys"),entries:O("entries")},x)for(S in w)!d&&!T&&S in _||a(_,S,w[S]);else e({target:r,proto:!0,forced:d||T},w);return w}}});