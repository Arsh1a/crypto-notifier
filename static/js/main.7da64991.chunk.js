(this["webpackJsonpcrypto-notifier"]=this["webpackJsonpcrypto-notifier"]||[]).push([[0],{28:function(e,t,n){},48:function(e,t,n){"use strict";n.r(t);var c=n(2),a=n.n(c),r=n(22),i=n.n(r),s=(n(28),n(9)),o=n(5),l=n(8),u=n(3),j=n.p+"static/media/notification.aec03572.mp3",O=function(e){e.current&&e.current.play()},f=n(6),b=n.n(f),d=function(e,t,n){var a=Object(c.useState)([]),r=Object(u.a)(a,2),i=r[0],s=r[1],l=Object(c.useState)(!1),j=Object(u.a)(l,2),O=j[0],f=j[1],d=Object(c.useState)(null),h=Object(u.a)(d,2),m=h[0],S=h[1],v=function(){t&&n?b.a.all([b.a.get(e),b.a.get(t),b.a.get(n)]).then(b.a.spread((function(e,t,n){f(!0),s(Object(o.a)(Object(o.a)(Object(o.a)({},e.data),t.data),n.data))}))).catch((function(e){S(e)})):b.a.get(e).then((function(e){f(!0),s(e.data)})).catch((function(e){S(e)}))};return Object(c.useEffect)((function(){v();var e=setInterval((function(){v()}),2e4);return function(){return clearInterval(e)}}),[e,t]),{error:m,isLoaded:O,data:i}},h=n(12),m=n(1);var S=function(e){var t=e.setSoundActive,n=e.soundActive,c=e.audioRef,a=e.handleSubmit,r=e.tempAlertAtMinimum,i=e.setTempAlertAtMinimum,s=e.setShowDeals,o=e.showDeals,l=e.setShowFavorites,u=e.showFavorites;return Object(m.jsxs)("div",{className:"navbar",children:[Object(m.jsxs)("div",{className:"left-navbar",children:[Object(m.jsx)("div",{className:"sound",onClick:function(){t(!n),!n&&O(c)},children:n?Object(m.jsx)(h.b,{}):Object(m.jsx)(h.a,{})}),Object(m.jsx)("button",{onClick:function(){return s(!o)},children:o?Object(m.jsx)(m.Fragment,{children:"Show all"}):Object(m.jsx)(m.Fragment,{children:"Show only greens"})}),Object(m.jsx)("button",{onClick:function(){return l(!u)},children:u?Object(m.jsx)(m.Fragment,{children:"Show all"}):Object(m.jsx)(m.Fragment,{children:"Show only favorites"})})]}),Object(m.jsx)("div",{className:"right-navbar",children:Object(m.jsxs)("div",{className:"alert-at",children:["Alert at:",Object(m.jsxs)("form",{onSubmit:a,children:[Object(m.jsx)("input",{required:!0,type:"number",value:r,onChange:function(e){return i(e.target.value)}}),Object(m.jsx)("input",{type:"submit",value:"Apply"})]})]})})]})},v=n(13);var A=function(e){e.currencies;var t=e.exchangeRates,n=e.calculateAfter,c=e.exchangeResults,a=e.alertAtMinimum,r=e.calculateResult,i=e.data,s=e.setFavorites,o=e.favorites,u=function(e){s([].concat(Object(l.a)(o),[e]))},j=function(e){s(o.filter((function(t){return t!==e})))};return 0===i.length?Object(m.jsx)("h1",{children:"Empty"}):Object(m.jsxs)(m.Fragment,{children:[t.length!==n&&Object(m.jsxs)("div",{className:"loading loading-results",children:["It takes ",Math.ceil(20*n/60)," minutes to calculate results"]}),Object(m.jsx)("div",{className:"crypto-container",children:i.map((function(e,i){return Object(m.jsxs)("div",{className:"crypto",children:[Object(m.jsx)("h1",{children:e}),Object(m.jsxs)("div",{className:"rates",children:[t?t[0][e].USD:"TEST","$",t.length===n&&Object(m.jsxs)(m.Fragment,{children:["\u2192",t[t.length-1][e].USD,"$"]})]}),Object(m.jsxs)("p",{className:Number(c[0][e])>=a?"going-up":"going-down",children:["result :",r(e)]}),Object(m.jsxs)("div",{className:"crypto-exchange",children:[Object(m.jsx)("a",{href:"https://www.binance.com/en/trade/".concat(e,"_USDT"),target:"_blank",rel:"noreferrer",children:Object(m.jsx)("img",{title:"Trade ".concat(e," in Binance"),src:"/crypto-notifier/binance-icon.svg",height:"25",width:"25",alt:"Binance"})}),Object(m.jsx)("span",{className:"crypto-favorite",title:"Favorite",onClick:function(){return function(e){o.includes(e)&&j(e),o.includes(e)||u(e)}(e)},children:o.includes(e)?Object(m.jsx)(v.a,{}):Object(m.jsx)(v.b,{})})]})]},i)}))})]})},g=n(23);var T=function(){return Object(m.jsx)("footer",{children:Object(m.jsx)("a",{href:"https://github.com/Arsh1a/crypto-notifier",target:"_blank",rel:"noreferrer",children:Object(m.jsx)(g.a,{})})})};var p=function(){var e=Object(c.useState)([]),t=Object(u.a)(e,2),n=t[0],a=t[1],r=Object(c.useState)([]),i=Object(u.a)(r,2),f=i[0],b=i[1],h=Object(c.useState)(!1),v=Object(u.a)(h,2),g=v[0],p=v[1],N=Object(c.useState)([]),R=Object(u.a)(N,2),E=R[0],x=R[1],w=Object(c.useState)(5),C=Object(u.a)(w,1)[0],D=Object(c.useState)(1.05),y=Object(u.a)(D,2),L=y[0],M=y[1],I=Object(c.useState)(1.05),F=Object(u.a)(I,2),P=F[0],U=F[1],B=Object(c.useState)(!1),k=Object(u.a)(B,2),X=k[0],G=k[1],K=Object(c.useState)([]),W=Object(u.a)(K,2),H=W[0],V=W[1],J=Object(c.useState)(!1),Z=Object(u.a)(J,2),Y=Z[0],$=Z[1],_=Object(c.useState)([]),q=Object(u.a)(_,2),Q=q[0],z=q[1],ee=d("https://min-api.cryptocompare.com/data/pricemulti?fsyms=".concat("BTC,SHIB,CELO,CFX,BURGER,DNT,MASK,DATA,OG,CTXC,MBL,WAVES,MBL,ONG,AUDIO,HBAR,RLC,GTO,RAMP,SLP,DUSK,ONE,DOGE,TOMO,HARD,FORTH,CTSI,ICP,EPS,DCR,KEEP,PUNDIX,OM,COCOS,TRB,IRIS,AR,SUPER,DREP,WING,FIO,SOL,ANT,TWT,GTC,QTUM,CTK,WNXM,RVN,MTL,IOTX,SUSHI,ATOM,NKN,LINA,EGLD,STPT,ZEN,ZIL,ZRX,ZEC,YFI,XMR,XVS,XTZ","&tsyms=USD"),"https://min-api.cryptocompare.com/data/pricemulti?fsyms=".concat("ATA,ALPHA,ALICE,ARPA,AVE,AVA,ARDR,ANRR,BAL,BZRX,BEL,BADGER,BTT,BEAN,BCH,COMP,CRV,COS,CAKE,DEGO,DGB,DOT,ETH,EOS,ETC,FTT,HIVE,INJ,JST,KSM,LRC,LINK,NBS,LIT,MFT,MKR,MDT,ONT,ORN,PERF,PNT,RUNE,REEF,REN,ROSE,SC,STMX,SKL,SAND,SNX,STX,SRM,TRB,TROY,TRU,TORN,THETA,TCT,POLS,TRX,TKO,UNO,ATM,AUTO,AKRO","&tsyms=USD"),"https://min-api.cryptocompare.com/data/pricemulti?fsyms=".concat("ALGO,BAR,BAND,BNB,BLZ,DODO,DIA,FIS,FIRO,GXS,GRT,IOTA,JUV,KEY,KNC,KLAY,LUNA,LSK,NULS,NU,NEO,OCEN,OGN,OMG,PSG,POND,PHA,PERP,PERL,PAX,RIF,RSR,SFP,SXP,SUN,STORJ,TLM,UNFI,UTK,VET,WTC,WAN,WRX,WNXM,WIN,XRP,XLM,XEM,LTC,DAI,AAVE,ADA,FTM,MATIC,AXS,MANA,AVAX,GMT,BAT,GRAPH","&tsyms=USD")),te=ee.data,ne=ee.error,ce=ee.isLoaded,ae=Object(c.useRef)();Object(c.useEffect)((function(){0!==te.length&&(n.length===C?(a(n.slice(1)),a((function(e){return[].concat(Object(l.a)(e),[te])}))):a((function(e){return[].concat(Object(l.a)(e),[te])})))}),[te]),Object(c.useEffect)((function(){var e=n[0];e&&0===f.length&&b(Object.keys(e).sort())}),[n]),Object(c.useEffect)((function(){if(f){var e=f.reduce((function(e,t){return Object(o.a)(Object(o.a)({},e),{},Object(s.a)({},t,re(t)))}),{});x([e])}}),[n]),Object(c.useEffect)((function(){if(E.length>0)if(Y){var e=Object.entries(E[0]).filter((function(e){var t=Object(u.a)(e,2);t[0];return t[1]>=L})),t=Object.fromEntries(e);Object.keys(t).some((function(e){return Q.includes(e)}))&&g&&O(ae)}else Object.values(E[0]).some((function(e){return e>=L}))&&g&&O(ae)}),[E]),Object(c.useEffect)((function(){if(X&&E.length>0)if(Y){var e=Object.entries(E[0]).filter((function(e){var t=Object(u.a)(e,2);t[0];return t[1]>=L})),t=Object.fromEntries(e),n=Object.keys(t);V(n.filter((function(e){return Q.includes(e)})))}else{var c=Object.entries(E[0]).filter((function(e){var t=Object(u.a)(e,2);t[0];return t[1]>=L})),a=Object.fromEntries(c),r=Object.keys(a);V(r)}}),[X,Y,E,L]),Object(c.useEffect)((function(){var e=localStorage.getItem("favorites");e&&z(JSON.parse(e))}),[]),Object(c.useEffect)((function(){localStorage.setItem("favorites",JSON.stringify(Q))}),[Q]);var re=function(e){if(n.length===C)return n[n.length-1][e].USD/n[0][e].USD};return ne?Object(m.jsx)("div",{children:"Failed to load"}):ce?Object(m.jsxs)(m.Fragment,{children:[Object(m.jsx)("audio",{ref:ae,children:Object(m.jsx)("source",{src:j,type:"audio/mp3"})}),Object(m.jsx)(S,{setSoundActive:p,soundActive:g,audioRef:ae,handleSubmit:function(e){e.preventDefault(),M(P)},tempAlertAtMinimum:P,setTempAlertAtMinimum:U,setShowDeals:G,showDeals:X,setShowFavorites:$,showFavorites:Y}),Object(m.jsx)(A,{currencies:f,exchangeRates:n,calculateAfter:C,exchangeResults:E,alertAtMinimum:L,calculateResult:re,favorites:Q,setFavorites:z,data:X||Y?X&&Y?H:!X&&Y?Q:X&&!Y?H:f:f}),Object(m.jsx)(T,{})]}):Object(m.jsx)("div",{className:"loading",children:"Loading"})};var N=function(){return Object(m.jsx)("div",{className:"App",children:Object(m.jsx)(p,{})})},R=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,49)).then((function(t){var n=t.getCLS,c=t.getFID,a=t.getFCP,r=t.getLCP,i=t.getTTFB;n(e),c(e),a(e),r(e),i(e)}))},E=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function x(e,t){navigator.serviceWorker.register(e).then((function(e){e.onupdatefound=function(){var n=e.installing;null!=n&&(n.onstatechange=function(){"installed"===n.state&&(navigator.serviceWorker.controller?(console.log("New content is available and will be used when all tabs for this page are closed. See https://cra.link/PWA."),t&&t.onUpdate&&t.onUpdate(e)):(console.log("Content is cached for offline use."),t&&t.onSuccess&&t.onSuccess(e)))})}})).catch((function(e){console.error("Error during service worker registration:",e)}))}i.a.render(Object(m.jsx)(a.a.StrictMode,{children:Object(m.jsx)(N,{})}),document.getElementById("root")),function(e){if("serviceWorker"in navigator){if(new URL("/crypto-notifier",window.location.href).origin!==window.location.origin)return;window.addEventListener("load",(function(){var t="".concat("/crypto-notifier","/service-worker.js");E?(!function(e,t){fetch(e,{headers:{"Service-Worker":"script"}}).then((function(n){var c=n.headers.get("content-type");404===n.status||null!=c&&-1===c.indexOf("javascript")?navigator.serviceWorker.ready.then((function(e){e.unregister().then((function(){window.location.reload()}))})):x(e,t)})).catch((function(){console.log("No internet connection found. App is running in offline mode.")}))}(t,e),navigator.serviceWorker.ready.then((function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit https://cra.link/PWA")}))):x(t,e)}))}}(),R()}},[[48,1,2]]]);
//# sourceMappingURL=main.7da64991.chunk.js.map