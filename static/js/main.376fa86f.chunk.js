(this["webpackJsonpcrypto-notifier"]=this["webpackJsonpcrypto-notifier"]||[]).push([[0],{28:function(e,t,n){},48:function(e,t,n){"use strict";n.r(t);var c=n(2),r=n.n(c),a=n(22),i=n.n(a),s=(n(28),n(9)),o=n(5),l=n(8),u=n(3),j=n.p+"static/media/notification.aec03572.mp3",O=function(e){e.current&&e.current.play()},b=n(6),f=n.n(b),d=function(e,t,n){var r=Object(c.useState)([]),a=Object(u.a)(r,2),i=a[0],s=a[1],l=Object(c.useState)(!1),j=Object(u.a)(l,2),O=j[0],b=j[1],d=Object(c.useState)(null),h=Object(u.a)(d,2),v=h[0],S=h[1],g=function(){t&&n?f.a.all([f.a.get(e),f.a.get(t),f.a.get(n)]).then(f.a.spread((function(e,t,n){b(!0),s(Object(o.a)(Object(o.a)(Object(o.a)({},e.data),t.data),n.data))}))).catch((function(e){S(e)})):f.a.get(e).then((function(e){b(!0),s(e.data)})).catch((function(e){S(e)}))};return Object(c.useEffect)((function(){g();var e=setInterval((function(){g()}),2e4);return function(){return clearInterval(e)}}),[e,t]),{error:v,isLoaded:O,data:i}},h=n(12),v=n(1);var S=function(e){var t=e.setSoundActive,n=e.soundActive,c=e.audioRef,r=e.handleSubmit,a=e.tempAlertAtMinimum,i=e.setTempAlertAtMinimum,s=e.setShowDeals,o=e.showDeals,l=e.setShowFavorites,u=e.showFavorites;return Object(v.jsxs)("div",{className:"navbar",children:[Object(v.jsxs)("div",{className:"left-navbar",children:[Object(v.jsx)("div",{className:"sound",onClick:function(){t(!n),!n&&O(c)},children:n?Object(v.jsx)(h.b,{}):Object(v.jsx)(h.a,{})}),Object(v.jsx)("button",{onClick:function(){return s(!o)},children:o?Object(v.jsx)(v.Fragment,{children:"Show all"}):Object(v.jsx)(v.Fragment,{children:"Show only greens"})}),Object(v.jsx)("button",{onClick:function(){return l(!u)},children:u?Object(v.jsx)(v.Fragment,{children:"Show all"}):Object(v.jsx)(v.Fragment,{children:"Show only favorites"})})]}),Object(v.jsx)("div",{className:"right-navbar",children:Object(v.jsxs)("div",{className:"alert-at",children:["Alert at:",Object(v.jsxs)("form",{onSubmit:r,children:[Object(v.jsx)("input",{required:!0,type:"number",value:a,onChange:function(e){return i(e.target.value)}}),Object(v.jsx)("input",{type:"submit",value:"Apply"})]})]})})]})},g=n(13);var m=function(e){e.currencies;var t=e.exchangeRates,n=e.calculateAfter,c=(e.exchangeResults,e.alertAtMinimum,e.calculateResult),r=e.data,a=e.setFavorites,i=e.favorites,s=function(e){a([].concat(Object(l.a)(i),[e]))},o=function(e){a(i.filter((function(t){return t!==e})))},u=function(e){var t=c(e);return t>1&&t<=1.002?"linear-gradient(90deg, rgba(205,171,0,1) 0%, rgba(231,209,66,1) 100%)":t>=1.002&&t<=1.004?"linear-gradient(90deg, rgba(0,7,126,1) 0%, rgba(30,36,156,1) 100%)":t>=1.004?"linear-gradient(90deg, rgba(116,15,15,1) 0%, rgba(183,25,25,1) 100%)":void 0};return 0===r.length?Object(v.jsx)("h1",{children:"Empty"}):Object(v.jsxs)(v.Fragment,{children:[t.length!==n&&Object(v.jsxs)("div",{className:"loading loading-results",children:["It takes ",Math.ceil(20*n/60)," minutes to calculate results"]}),Object(v.jsx)("div",{className:"crypto-container",children:r.map((function(e,r){return Object(v.jsxs)("div",{className:"crypto",style:{background:u(e)},children:[Object(v.jsx)("h1",{children:e}),Object(v.jsxs)("div",{className:"rates",children:[t?t[0][e].USD:"TEST","$",t.length===n&&Object(v.jsxs)(v.Fragment,{children:["\u2192",t[t.length-1][e].USD,"$"]})]}),Object(v.jsxs)("p",{children:["result :",c(e)]}),Object(v.jsxs)("div",{className:"crypto-exchange",children:[Object(v.jsx)("a",{href:"https://www.binance.com/en/trade/".concat(e,"_USDT"),target:"_blank",rel:"noreferrer",children:Object(v.jsx)("img",{title:"Trade ".concat(e," in Binance"),src:"/crypto-notifier/binance-icon.svg",height:"25",width:"25",alt:"Binance"})}),Object(v.jsx)("span",{className:"crypto-favorite",title:"Favorite",onClick:function(){return function(e){i.includes(e)&&o(e),i.includes(e)||s(e)}(e)},children:i.includes(e)?Object(v.jsx)(g.a,{}):Object(v.jsx)(g.b,{})})]})]},r)}))})]})},A=n(23);var T=function(){return Object(v.jsx)("footer",{children:Object(v.jsx)("a",{href:"https://github.com/Arsh1a/crypto-notifier",target:"_blank",rel:"noreferrer",children:Object(v.jsx)(A.a,{})})})};var p=function(){var e=Object(c.useState)([]),t=Object(u.a)(e,2),n=t[0],r=t[1],a=Object(c.useState)([]),i=Object(u.a)(a,2),b=i[0],f=i[1],h=Object(c.useState)(!1),g=Object(u.a)(h,2),A=g[0],p=g[1],R=Object(c.useState)([]),N=Object(u.a)(R,2),E=N[0],x=N[1],w=Object(c.useState)(5),y=Object(u.a)(w,1)[0],C=Object(c.useState)(1.05),D=Object(u.a)(C,2),L=D[0],M=D[1],I=Object(c.useState)(1.05),F=Object(u.a)(I,2),P=F[0],U=F[1],B=Object(c.useState)(!1),k=Object(u.a)(B,2),X=k[0],G=k[1],K=Object(c.useState)([]),W=Object(u.a)(K,2),H=W[0],V=W[1],J=Object(c.useState)(!1),Z=Object(u.a)(J,2),Y=Z[0],$=Z[1],_=Object(c.useState)([]),q=Object(u.a)(_,2),Q=q[0],z=q[1],ee=d("https://min-api.cryptocompare.com/data/pricemulti?fsyms=".concat("BTC,SHIB,CELO,CFX,BURGER,DNT,MASK,DATA,OG,CTXC,MBL,WAVES,MBL,ONG,AUDIO,HBAR,RLC,GTO,RAMP,SLP,DUSK,ONE,DOGE,TOMO,HARD,FORTH,CTSI,ICP,EPS,DCR,KEEP,PUNDIX,OM,COCOS,TRB,IRIS,AR,SUPER,DREP,WING,FIO,SOL,ANT,TWT,GTC,QTUM,CTK,WNXM,RVN,MTL,IOTX,SUSHI,ATOM,NKN,LINA,EGLD,STPT,ZEN,ZIL,ZRX,ZEC,YFI,XMR,XVS,XTZ","&tsyms=USD"),"https://min-api.cryptocompare.com/data/pricemulti?fsyms=".concat("ATA,ALPHA,ALICE,ARPA,AVE,AVA,ARDR,ANRR,BAL,BZRX,BEL,BADGER,BTT,BEAN,BCH,COMP,CRV,COS,CAKE,DEGO,DGB,DOT,ETH,EOS,ETC,FTT,HIVE,INJ,JST,KSM,LRC,LINK,NBS,LIT,MFT,MKR,MDT,ONT,ORN,PERF,PNT,RUNE,REEF,REN,ROSE,SC,STMX,SKL,SAND,SNX,STX,SRM,TRB,TROY,TRU,TORN,THETA,TCT,POLS,TRX,TKO,UNO,ATM,AUTO,AKRO","&tsyms=USD"),"https://min-api.cryptocompare.com/data/pricemulti?fsyms=".concat("ALGO,BAR,BAND,BNB,BLZ,DODO,DIA,FIS,FIRO,GXS,GRT,IOTA,JUV,KEY,KNC,KLAY,LUNA,LSK,NULS,NU,NEO,OCEN,OGN,OMG,PSG,POND,PHA,PERP,PERL,PAX,RIF,RSR,SFP,SXP,SUN,STORJ,TLM,UNFI,UTK,VET,WTC,WAN,WRX,WNXM,WIN,XRP,XLM,XEM,LTC,DAI,AAVE,ADA,FTM,MATIC,AXS,MANA,AVAX,GMT,BAT,GRAPH","&tsyms=USD")),te=ee.data,ne=ee.error,ce=ee.isLoaded,re=Object(c.useRef)();Object(c.useEffect)((function(){0!==te.length&&(n.length===y?(r(n.slice(1)),r((function(e){return[].concat(Object(l.a)(e),[te])}))):r((function(e){return[].concat(Object(l.a)(e),[te])})))}),[te]),Object(c.useEffect)((function(){var e=n[0];e&&0===b.length&&f(Object.keys(e).sort())}),[n]),Object(c.useEffect)((function(){if(b){var e=b.reduce((function(e,t){return Object(o.a)(Object(o.a)({},e),{},Object(s.a)({},t,ae(t)))}),{});x([e])}}),[n]),Object(c.useEffect)((function(){if(E.length>0)if(Y){var e=Object.entries(E[0]).filter((function(e){var t=Object(u.a)(e,2);t[0];return t[1]>=L})),t=Object.fromEntries(e);Object.keys(t).some((function(e){return Q.includes(e)}))&&A&&O(re)}else Object.values(E[0]).some((function(e){return e>=L}))&&A&&O(re)}),[E]),Object(c.useEffect)((function(){if(X&&E.length>0)if(Y){var e=Object.entries(E[0]).filter((function(e){var t=Object(u.a)(e,2);t[0];return t[1]>=L})),t=Object.fromEntries(e),n=Object.keys(t);V(n.filter((function(e){return Q.includes(e)})))}else{var c=Object.entries(E[0]).filter((function(e){var t=Object(u.a)(e,2);t[0];return t[1]>=L})),r=Object.fromEntries(c),a=Object.keys(r);V(a)}}),[X,Y,E,L]),Object(c.useEffect)((function(){var e=localStorage.getItem("favorites");e&&z(JSON.parse(e))}),[]),Object(c.useEffect)((function(){localStorage.setItem("favorites",JSON.stringify(Q))}),[Q]);var ae=function(e){if(n.length===y)return n[n.length-1][e].USD/n[0][e].USD};return ne?Object(v.jsx)("div",{children:"Failed to load"}):ce?Object(v.jsxs)(v.Fragment,{children:[Object(v.jsx)("audio",{ref:re,children:Object(v.jsx)("source",{src:j,type:"audio/mp3"})}),Object(v.jsx)(S,{setSoundActive:p,soundActive:A,audioRef:re,handleSubmit:function(e){e.preventDefault(),M(P)},tempAlertAtMinimum:P,setTempAlertAtMinimum:U,setShowDeals:G,showDeals:X,setShowFavorites:$,showFavorites:Y}),Object(v.jsx)(m,{currencies:b,exchangeRates:n,calculateAfter:y,exchangeResults:E,alertAtMinimum:L,calculateResult:ae,favorites:Q,setFavorites:z,data:X||Y?X&&Y?H:!X&&Y?Q:X&&!Y?H:b:b}),Object(v.jsx)(T,{})]}):Object(v.jsx)("div",{className:"loading",children:"Loading"})};var R=function(){return Object(v.jsx)("div",{className:"App",children:Object(v.jsx)(p,{})})},N=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,49)).then((function(t){var n=t.getCLS,c=t.getFID,r=t.getFCP,a=t.getLCP,i=t.getTTFB;n(e),c(e),r(e),a(e),i(e)}))},E=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function x(e,t){navigator.serviceWorker.register(e).then((function(e){e.onupdatefound=function(){var n=e.installing;null!=n&&(n.onstatechange=function(){"installed"===n.state&&(navigator.serviceWorker.controller?(console.log("New content is available and will be used when all tabs for this page are closed. See https://cra.link/PWA."),t&&t.onUpdate&&t.onUpdate(e)):(console.log("Content is cached for offline use."),t&&t.onSuccess&&t.onSuccess(e)))})}})).catch((function(e){console.error("Error during service worker registration:",e)}))}i.a.render(Object(v.jsx)(r.a.StrictMode,{children:Object(v.jsx)(R,{})}),document.getElementById("root")),function(e){if("serviceWorker"in navigator){if(new URL("/crypto-notifier",window.location.href).origin!==window.location.origin)return;window.addEventListener("load",(function(){var t="".concat("/crypto-notifier","/service-worker.js");E?(!function(e,t){fetch(e,{headers:{"Service-Worker":"script"}}).then((function(n){var c=n.headers.get("content-type");404===n.status||null!=c&&-1===c.indexOf("javascript")?navigator.serviceWorker.ready.then((function(e){e.unregister().then((function(){window.location.reload()}))})):x(e,t)})).catch((function(){console.log("No internet connection found. App is running in offline mode.")}))}(t,e),navigator.serviceWorker.ready.then((function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit https://cra.link/PWA")}))):x(t,e)}))}}(),N()}},[[48,1,2]]]);
//# sourceMappingURL=main.376fa86f.chunk.js.map