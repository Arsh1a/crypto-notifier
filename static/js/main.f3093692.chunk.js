(this["webpackJsonpcrypto-notifier"]=this["webpackJsonpcrypto-notifier"]||[]).push([[0],{27:function(e,t,c){},47:function(e,t,c){"use strict";c.r(t);var n=c(2),a=c.n(n),r=c(21),s=c.n(r),i=(c(27),c(8)),u=c(5),j=c(12),O=c(3),l=c.p+"static/media/notification.aec03572.mp3",o=function(e){e.current&&e.current.play()},b=c(6),d=c.n(b),f=function(e,t){var c=Object(n.useState)([]),a=Object(O.a)(c,2),r=a[0],s=a[1],i=Object(n.useState)(!1),j=Object(O.a)(i,2),l=j[0],o=j[1],b=Object(n.useState)(null),f=Object(O.a)(b,2),h=f[0],m=f[1],S=function(){t?d.a.all([d.a.get(e),d.a.get(t)]).then(d.a.spread((function(e,t){o(!0),s(Object(u.a)(Object(u.a)({},e.data),t.data))}))).catch((function(e){m(e)})):d.a.get(e).then((function(e){o(!0),s(e.data)})).catch((function(e){m(e)}))};return Object(n.useEffect)((function(){S();var e=setInterval((function(){S()}),2e4);return function(){return clearInterval(e)}}),[e,t]),{error:h,isLoaded:l,data:r}},h=c(11),m=c(1);var S=function(e){var t=e.setSoundActive,c=e.soundActive,n=e.audioRef,a=e.handleSubmit,r=e.tempAlertAtMinimum,s=e.setTempAlertAtMinimum,i=e.setShowOnly,u=e.showOnly;return Object(m.jsxs)("div",{className:"navbar",children:[Object(m.jsxs)("div",{className:"left-navbar",children:[Object(m.jsx)("div",{className:"sound",onClick:function(){t(!c),!c&&o(n)},children:c?Object(m.jsx)(h.b,{}):Object(m.jsx)(h.a,{})}),Object(m.jsx)("button",{onClick:function(){return i(!u)},children:u?Object(m.jsx)(m.Fragment,{children:"Show all"}):Object(m.jsx)(m.Fragment,{children:"Show only green"})})]}),Object(m.jsx)("div",{className:"right-navbar",children:Object(m.jsxs)("div",{className:"alert-at",children:["Alert at:",Object(m.jsxs)("form",{onSubmit:a,children:[Object(m.jsx)("input",{required:!0,type:"number",value:r,onChange:function(e){return s(e.target.value)}}),Object(m.jsx)("input",{type:"submit",value:"Apply"})]})]})})]})};var T=function(e){e.currencies;var t=e.exchangeRates,c=e.calculateAfter,n=e.exchangeResults,a=e.alertAtMinimum,r=e.calculateResult,s=(e.onlyDeals,e.showOnly,e.data);return 0===s.length?Object(m.jsx)("h1",{children:"Empty"}):Object(m.jsxs)(m.Fragment,{children:[t.length!==c&&Object(m.jsx)("div",{className:"loading-results",children:"It takes 5 minute to calculate results..."}),Object(m.jsx)("div",{className:"crypto-container",children:s.map((function(e,s){return Object(m.jsxs)("div",{className:"crypto",children:[Object(m.jsx)("h1",{children:e}),Object(m.jsxs)("div",{className:"rates",children:[t[0][e].USD,"$",t.length===c&&Object(m.jsxs)(m.Fragment,{children:["\u2192",t[t.length-1][e].USD,"$"]})]}),Object(m.jsxs)("p",{className:n[0][e]>=a?"going-up":"going-down",children:["result :",r(e)]})]},s)}))})]})},A=c(22);var R=function(){return Object(m.jsx)("footer",{children:Object(m.jsx)("a",{href:"https://github.com/Arsh1a/crypto-notifier",target:"_blank",rel:"noreferrer",children:Object(m.jsx)(A.a,{})})})};var p=function(){var e=Object(n.useState)([]),t=Object(O.a)(e,2),c=t[0],a=t[1],r=Object(n.useState)([]),s=Object(O.a)(r,2),b=s[0],d=s[1],h=Object(n.useState)(!1),A=Object(O.a)(h,2),p=A[0],v=A[1],g=Object(n.useState)([]),x=Object(O.a)(g,2),E=x[0],N=x[1],C=Object(n.useState)(15),y=Object(O.a)(C,1)[0],D=Object(n.useState)(1.05),M=Object(O.a)(D,2),I=M[0],L=M[1],B=Object(n.useState)(1.05),F=Object(O.a)(B,2),P=F[0],U=F[1],X=Object(n.useState)(!1),G=Object(O.a)(X,2),K=G[0],w=G[1],H=Object(n.useState)([]),k=Object(O.a)(H,2),V=k[0],Z=k[1],J=f("https://min-api.cryptocompare.com/data/pricemulti?fsyms=".concat("BTC,SHIB,CELO,CFX,BURGER,DNT,MASK,DATA,OG,CTXC,MBL,WAVES,MBL,ONG,AUDIO,HBAR,RLC,GTO,RAMP,SLP,DUSK,ONE,DOGE,TOMO,HARD,FORTH,CTSI,ICP,EPS,DCR,KEEP,PUNDIX,OM,COCOS,TRB,IRIS,AR,SUPER,DREP,WING,FIO,SOL,ANT,TWT,GTC,QTUM,CTK,WNXM,RVN,MTL,IOTX,SUSHI,ATOM,NKN,LINA,EGLD,STPT,ZEN,ZIL,ZRX,ZEC,YFI,XMR,XVS,XTZ","&tsyms=USD"),"https://min-api.cryptocompare.com/data/pricemulti?fsyms=".concat("ATA,ALPHA,ALICE,ARPA,AVE,AVA,ARDR,ANRR,BAL,BZRX,BEL,BADGER,BTT,BEAN,BCH,COMP,CRV,COS,CAKE,DEGO,DGB,DOT,ETH,EOS,ETC,FTT,HIVE,INJ,JST,KSM,LRC,LINK,NBS,LIT,MFT,MKR,MDT,ONT,ORN,PERF,PNT,RUNE,REEF,REP,REN,ROSE,SC,STMX,SKL,SAND,SNX,STX,SRM,TRB,TROY,TRU,TORN,THETA,TCT,POLS,TRX,TKO,UNO","&tsyms=USD")),W=J.data,Y=J.error,$=J.isLoaded,q=Object(n.useRef)();Object(n.useEffect)((function(){0!==W.length&&(c.length===y?(a(c.slice(1)),a((function(e){return[].concat(Object(j.a)(e),[W])}))):a((function(e){return[].concat(Object(j.a)(e),[W])})))}),[W]),Object(n.useEffect)((function(){var e=c[0];e&&0===b.length&&d(Object.keys(e).sort())}),[c]),Object(n.useEffect)((function(){if(b){var e=b.reduce((function(e,t){return Object(u.a)(Object(u.a)({},e),{},Object(i.a)({},t,Q(t)))}),{});N([e])}}),[c]),Object(n.useEffect)((function(){E.length>0&&Object.values(E[0]).some((function(e){return e>=I}))&&p&&o(q)}),[E]),Object(n.useEffect)((function(){if(K&&E.length>0){var e=Object.entries(E[0]).filter((function(e){var t=Object(O.a)(e,2);t[0];return t[1]>=I})),t=Object.fromEntries(e),c=Object.keys(t);Z(c)}}),[K,E]);var Q=function(e){if(c.length===y)return c[c.length-1][e].USD/c[0][e].USD};return Y?Object(m.jsx)("div",{children:"Failed to load"}):$?Object(m.jsxs)(m.Fragment,{children:[Object(m.jsx)("audio",{ref:q,children:Object(m.jsx)("source",{src:l,type:"audio/mp3"})}),Object(m.jsx)(S,{setSoundActive:v,soundActive:p,audioRef:q,handleSubmit:function(e){e.preventDefault(),L(P)},tempAlertAtMinimum:P,setTempAlertAtMinimum:U,setShowOnly:w,showOnly:K}),Object(m.jsx)(T,{exchangeRates:c,calculateAfter:y,exchangeResults:E,alertAtMinimum:I,calculateResult:Q,data:K?V:b}),Object(m.jsx)(R,{})]}):Object(m.jsx)("div",{children:"Loading..."})};var v=function(){return Object(m.jsx)("div",{className:"App",children:Object(m.jsx)(p,{})})},g=function(e){e&&e instanceof Function&&c.e(3).then(c.bind(null,48)).then((function(t){var c=t.getCLS,n=t.getFID,a=t.getFCP,r=t.getLCP,s=t.getTTFB;c(e),n(e),a(e),r(e),s(e)}))};s.a.render(Object(m.jsx)(a.a.StrictMode,{children:Object(m.jsx)(v,{})}),document.getElementById("root")),g()}},[[47,1,2]]]);
//# sourceMappingURL=main.f3093692.chunk.js.map