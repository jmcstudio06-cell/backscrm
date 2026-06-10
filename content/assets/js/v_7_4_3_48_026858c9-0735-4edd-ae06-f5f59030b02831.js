import{j as i,A as V,m as h}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b0286.js";import{M as ee,R as te}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b02855.js";import{n as u,o as g,p as D,t as ae,q as k,r as oe,s as ie,w as T,A as ne}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b02821.js";import{u as C}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b02838.js";import{d as z,e as se,f as M,M as re,o as ce,g as le}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b02833.js";import{w as H,c as S,b as _,i as de,C as F,s as ue,p as pe,n as me,x as fe,d as ge}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b0285.js";import{a as q}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b0284.js";import{W as A,V as b}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b0283.js";import{a as c,d as v}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b0282.js";import{_ as y}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b0288.js";import{M as ye}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b02856.js";import{s as w,u as xe}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b02857.js";import{X as N}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b0287.js";import{u as he,o as be,a as ve,F as we}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b028.js";import{T as Se}from"./v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b02858.js";const _e=(e,t)=>{e.forEach(a=>{a.addedNodes.forEach(n=>{t(a)})})},Ee=e=>{const{update:t}=D.getState(),{getElement:a}=u.getState(),{setIsOpen:n}=g.getState();_e(e,s=>{const o=s.addedNodes[0];o?.id==="main"?n(!0):o?.classList?.contains(a("closeChat"))&&(t("closeChat"),n(!1))})},je=e=>{const{setIsThree:t}=g.getState(),{getElement:a}=u.getState();e[0].target.classList.contains(a("two"))?t(!1):t(!0)},L=(e,t,a)=>{new MutationObserver(t).observe(e,a)},B=()=>{const{getSeletor:e}=u.getState();e("menuLateral",t=>{L(t,Ee,{childList:!0})}),e("waPage",t=>{L(t,je,{attributes:!0})})},Ce=()=>{H(u.getState().getElement("paneSide"),()=>{B(),u.getState().getSeletor("whatsModal",e=>{L(e,t=>{const{setIsOpen:a}=g.getState();t[0].addedNodes.length>0?a(!1):a(!0)},{childList:!0})})})},Me=()=>{if(document.getElementById("piracy-overlay"))return;const e=document.createElement("style");e.id="piracy-styles",e.textContent=`
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
  
      .piracy-overlay {
        position: fixed;
        inset: 0;
        background: #18181B;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        font-family: 'Inter', sans-serif;
        backdrop-filter: blur(8px);
        padding: 20px;
      }
  
      .piracy-modal {
        background: #09090B;
        color: #fff;
        border-radius: 20px;
        padding: 40px;
        max-width: 480px;
        width: 100%;
        max-height: 90vh;   
        overflow-y: auto; 
        animation: fadeIn 0.5s ease-out;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        gap: 28px;
        border: 1px solid #2c2c2e;
      }
  
      .piracy-icon {
        font-size: 64px;
        align-self: center;
        color: #f1c40f;
        margin-bottom: 4px;
      }
  
      .piracy-title {
        font-size: 30px;
        text-align: center;
        color: #ff4d4f;
        font-weight: 800;
        text-transform: uppercase;
        line-height: 1.1;
        margin-bottom: -8px;
      }
  
      .piracy-subtitle {
        font-size: 16px;
        text-align: center;
        color: #ffa502;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
  
      .piracy-text {
        font-size: 15px;
        line-height: 1.7;
        color: #dcdde1;
        text-align: center;
      }
  
      .piracy-text p {
        margin: 0 0 16px 0;
      }
  
      .piracy-text p:last-child {
        margin-bottom: 0;
      }
  
      .piracy-text strong {
        color: #ff6b6b;
      }
  
      .piracy-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        justify-content: center;
        margin-top: 8px;
      }
  
      .piracy-btn-primary, .piracy-btn-secondary {
        padding: 14px 28px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
  
      .piracy-btn-primary {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
  
      .piracy-btn-primary:hover {
        background: linear-gradient(135deg, #059669, #047857);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
      }
  
      .piracy-btn-secondary {
        background: transparent;
        color: #f39c12;
        border: 2px solid #f39c12;
      }
  
      .piracy-btn-secondary:hover {
        background: #f39c12;
        color: #fff;
        transform: translateY(-2px);
      }
  
      .piracy-footer {
        font-size: 12px;
        color: #a4b0be;
        text-align: center;
        margin-top: 16px;
        line-height: 1.5;
      }
  
      .piracy-brand {
        color: #10b981;
        font-weight: 800;
        font-size: 16px;
        text-transform: uppercase;
        letter-spacing: 1px;
        text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
      }
  
      @media (max-width: 480px) {
        .piracy-modal {
          padding: 32px 24px;
          gap: 24px;
        }
        .piracy-title {
          font-size: 24px;
        }
        .piracy-icon {
          font-size: 56px;
        }
        .piracy-buttons {
          flex-direction: column;
        }
        .piracy-btn-primary, .piracy-btn-secondary {
          width: 100%;
        }
      }
    `,document.head.appendChild(e);const t=`
      <div class="piracy-modal">
        <div class="piracy-icon">⚠️</div>
        <div class="piracy-title">Pirataria Detectada</div>
        <div class="piracy-subtitle">Extensão não oficial</div>
        <div class="piracy-text">
          <p><strong>Atenção:</strong> Esta extensão foi identificada como <strong>pirata</strong>.</p>
          <p>Ela pode conter <strong>malware</strong>, capturar seus dados ou comprometer sua segurança.</p>
          <p><strong>Crime:</strong> Violação de direitos autorais prevista na Lei 9.610/98.</p>
          <p>Evite riscos: use a versão oficial da Chrome Web Store.</p>
        </div>
        <div class="piracy-buttons">
          <button class="piracy-btn-primary" id="piracy-store-btn">Ir para versão oficial</button>
          <button class="piracy-btn-secondary" id="piracy-support-btn">Fale conosco</button>
        </div>
        <div class="piracy-footer">
          Proteja-se e use fontes oficiais. <br/>
          <span>waTidy</span> - Extensão Oficial
        </div>
      </div>
    `,a=document.createElement("div");a.className="piracy-overlay",a.id="piracy-overlay",a.innerHTML=t,a.addEventListener("click",n=>{const s=n.target;if(s){if(s.id==="piracy-store-btn")window.open("https://chromewebstore.google.com/detail/gjlfpggiddcminhebiejofeglfjmleli","_blank");else if(s.id==="piracy-support-btn"){const o=document.createElement("a");o.href="https://wa.me/553129424122?text=Ol%C3%A1%2C%20tudo%20bem%3F%20Notei%20que%20estou%20usando%20uma%20vers%C3%A3o%20n%C3%A3o%20oficial%20da%20extens%C3%A3o%20e%20gostaria%20de%20migrar%20para%20a%20vers%C3%A3o%20oficial.%20Podem%20me%20ajudar%20com%20isso%3F",o.target="_blank",o.rel="noreferrer",o.click()}}}),requestAnimationFrame(()=>{document.body.innerHTML="",document.body.appendChild(a)})},Ae=async()=>{const{config:e,getUrl:t}=S.getState(),{session:a,user:n}=_.getState(),{domSelector:s}=u.getState(),o=de();if(s.update_path_active!=="true")return;const r={phone:(await A.Conn("getMyDeviceId")).user,chromeStoreID:chrome.runtime.id,checkout:o,painel_cliente:b.painel_cliente,backend:b.backend_plugin,user_logado:{session:a,user:n},nome:e.name,tutorial:t("redes_sociais","youtube").link,suporte_clientes:{premium:t("principais","suporte_premium").link,gratuitos:t("principais","suporte_gratuitos").link},timeZone:ae()};(await q.post(s.update_path_new,r,{headers:{"Content-Type":"application/json","access-token":b.cript_key}})).data.pt&&Me()},Le=()=>{c.useEffect(()=>{const e=t=>{if(t.data.type==="Ev"&&t.data.action==="chat.active_chat"){const a=JSON.parse(t.data.model);a&&(a.id={server:"@"+a.id.split("@")[1],user:a.id.split("@")[0],_serialized:a.id},a.default_id={server:"@"+a.default_id.split("@")[1],user:a.default_id.split("@")[0],_serialized:a.default_id},k.setState({activeChat:a}))}};return window.addEventListener("message",e),()=>{window.removeEventListener("message",e)}},[])},W=c.createContext(void 0);function bt(){const e=c.useContext(W);if(!e)throw new Error("Place PrivacityContext inside PrivacityProvider");return e}const P={privacitySettings:!0};function ke({children:e}){const t={photoHidden:{hide:!1},nameHidden:{hide:!1},midiaHidden:{hide:!1},galeryHidden:{hide:!1},lastMessageHidden:{hide:!1},messageHidden:{hide:!1}},[a,n]=c.useState(t);return c.useEffect(()=>{if(P.privacitySettings&&localStorage.getItem("privacityOptions")){let o=F.decryptData(localStorage.getItem("privacityOptions"));n(o),P.privacitySettings=!1}else{let o=F.encryptData(a);localStorage.setItem("privacityOptions",o)}let s="";Object.entries(a).map(([o,r])=>{r.hide&&(s+=o+" ")}),s.length===0?document.body.removeAttribute("hide"):document.body.setAttribute("hide",s)},[a]),i.jsx(W.Provider,{value:{privacityOptions:a,setPrivacityOptions:n},children:e})}const ze=c.lazy(() => __vitePreload(()=>import(chrome.runtime.getURL("content/assets/js/v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b02849.js")).then(e=>e.i),[]));function Ne(){return z(t=>t.activeHeader)&&i.jsx(c.Suspense,{fallback:i.jsx(i.Fragment,{}),children:i.jsx(ze,{})})}const Ie=c.lazy(() => __vitePreload(()=>import(chrome.runtime.getURL("content/assets/js/v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b02850.js")),[]));function Oe(){return i.jsx(c.Suspense,{fallback:i.jsx(i.Fragment,{}),children:i.jsx(Ie,{})})}const $=document.createElement("section");$.setAttribute("data-id","ChatName");const Y=document.createElement("section");Y.setAttribute("data-id","MenuVertical");const U=document.createElement("section");U.setAttribute("data-id","MenuHorizontal");const X=document.createElement("section");X.setAttribute("data-id","ActionMonitor");const I=document.createElement("section");I.setAttribute("data-id","AssistenteDeChat");const E=document.createElement("section");E.setAttribute("data-id","FooterIconsLeft");E.setAttribute("style","display: contents;");const O=document.createElement("section");O.setAttribute("data-id","FooterIconsRight");const Te=[{father:()=>u.getState().getSeletor("chatName"),children:$,type:"insert",renderInblockChat:!0},{father:()=>u.getState().getSeletor("menuVertical"),children:Y,type:"prepend",renderInblockChat:!0},{father:()=>u.getState().getSeletor("menuHorizontal"),children:U,type:"prepend",renderInblockChat:!0},{father:()=>u.getState().getSeletor("assistenteChat"),children:I,type:"prepend",renderInblockChat:!1},{father:()=>u.getState().getSeletor("actionMonitor"),children:X,type:"insertAdjacentElement",renderInblockChat:!1},{father:()=>u.getState().getSeletor("footerIconsLeft"),children:E,type:"prepend",renderInblockChat:!1},{father:()=>u.getState().getSeletor("respostaRapida"),children:O,type:"appendChild",renderInblockChat:!1}];function Fe(){const e=k(t=>t.activeChat);c.useEffect(()=>{if(!e)return;const{getSeletor:t}=u.getState(),a=[];return Te.forEach(({father:s,children:o,type:r,renderInblockChat:l})=>{switch(r){case"prepend":s()?.prepend(o);break;case"insert":let p=s();p&&(p.innerHTML="",p.prepend(o));break;case"insertAdjacentElement":s()?.insertAdjacentElement("afterend",o);break;default:s()?.appendChild(o);break}}),t("observerFooterNewModel",s=>{const o=new MutationObserver(r=>{r[0].removedNodes.length!==0&&(t("respostaRapida",l=>{l.appendChild(O)}),t("footerIconsLeft",l=>{l.prepend(E)}),t("assistenteChat",l=>{l.prepend(I)}))});o.observe(s,{childList:!0}),a.push(o)}),()=>{a.forEach(s=>s.disconnect())}},[e])}const Pe=c.lazy(() => __vitePreload(()=>import(chrome.runtime.getURL("content/assets/js/v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b02851.js")),[]));function Re(){const e=k(t=>t.activeChat);return Fe(),c.useEffect(()=>{if(!e)return;D.getState().update(e.id._serialized),oe.getState().configAssinatura(),ie.getState().getActiveChat(e.id._serialized),se.getState().insertBtnTradutor(),e.id.user&&(T.getState().setActiveUser(e),T.getState().setActivePerfil(e.id.user)),B(),C.setState({textAssistente:""});const{assistente:t,manipulatedInputText:a,formatTextAssistente:n}=C.getState();if(t.active){const s=e.draftMessage;s?.text?.length>0&&n(s.text),a()}},[e]),e?i.jsx(c.Suspense,{fallback:i.jsx(i.Fragment,{}),children:i.jsx(Pe,{})}):null}const G=document.createElement("section");G.setAttribute("data-id","MenuLateral");G.setAttribute("render-mode","window");const Ve=c.lazy(() => __vitePreload(()=>import(chrome.runtime.getURL("content/assets/js/v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b02852.js")),[]));function De(){const e=g(n=>n.menuContent),t=g(n=>n.isOpen),a=g(n=>n.isThree);return e.children!=="close"&&!a&&t&&i.jsx(c.Suspense,{fallback:i.jsx(i.Fragment,{}),children:i.jsx(Ve,{})})}const He=c.lazy(() => __vitePreload(()=>import(chrome.runtime.getURL("content/assets/js/v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b02853.js")).then(e=>e.i),[]));function qe(){return z(t=>t.activeView)&&i.jsx(c.Suspense,{fallback:i.jsx(i.Fragment,{}),children:i.jsx(He,{})})}const Be=()=>new Promise(e=>{const t=()=>{const{session:s}=_.getState(),{is_load:o,config:r}=S.getState();s.is_load&&o&&(a(),n(),e({session:s,config:r}))},a=_.subscribe(t),n=S.subscribe(t);t()}),J=async e=>{try{let t,a;if(e==="start"){const d=await Be();t=d.session,a=d.config}else t=_.getState().session,a=S.getState().config;const n=`api/notify/get/${t.is_premium?"premium":"free"}/${a.chromeStoreID}`,s=(await q.get(`${b.backend_plugin}${n}`,{headers:{"Content-Type":"application/json",accept:"application/json","access-token":b.cript_key}})).data;if(!s.success)return;const o=s.notify.reverse(),r=o.filter(d=>d.viewer==="NOTIFY"),l=o.filter(d=>d.viewer==="MODAL"),p=o.filter(d=>d.viewer==="INBOX"),x=o.filter(d=>d.viewer==="EXTERNAL_PAGE");m.setState(d=>({notify:{...d.notify,notify:r},modal:{...d.modal,notify:l},inbox:{...d.inbox,notify:p},external_page:{...d.external_page,notify:x}}))}catch(t){console.error("Error ao capturar as notificações",t)}},Z=async e=>{e.action==="Remote-Notificacao"&&J("validate")};chrome.runtime.onMessage.addListener(Z);window.addEventListener("beforeunload",()=>{chrome.runtime.onMessage.removeListener(Z)});const R=v()(e=>({notifyNotVisualized:0,getCaixaDeEntrada:()=>{const t=M.getState().notifications,a=m.getState().notify,n=a.notify.filter(o=>!a.views.includes(o.id)),s=[...t,...n];return s.sort((o,r)=>r.data-o.data),s},getNotifyNotVisualized:()=>e(()=>{const{naoVisualizadaTam:t}=M.getState(),a=m.getState().notify;return{notifyNotVisualized:a.notify.filter(o=>!a.views.includes(o.id)).length+t}})})),We=e=>{setTimeout(()=>{m.getState().setActive("modal",e)},1e4)},$e=e=>{setTimeout(()=>{m.getState().setActive("inbox",e)},5e3)},Ye=e=>{m.getState().setViews("external_page",e.id),setTimeout(()=>{chrome.runtime.sendMessage({message:"promotional",path:e.link})},3e4)},j=e=>{const{notify:t,views:a}=e,n=new Set(a);return t.find(s=>!n.has(s.id))},Ue=()=>{const e=m.subscribe(o=>({notify:o.notify}),({notify:o})=>{R.getState().getNotifyNotVisualized()},{equalityFn:w,fireImmediately:!0}),t=m.subscribe(o=>({modal:o.modal}),({modal:o})=>{const r=j(o);r&&r.id!==o.active?.id&&We(r)},{equalityFn:w,fireImmediately:!0}),a=m.subscribe(o=>({inbox:o.inbox}),({inbox:o})=>{const r=j(o);r&&r.id!==o.active?.id&&$e(r)},{equalityFn:w,fireImmediately:!0}),n=m.subscribe(o=>o.external_page,o=>{const r=j(o);r&&Ye(r)},{equalityFn:w,fireImmediately:!0}),s=M.subscribe(()=>{R.getState().getNotifyNotVisualized()});window.addEventListener("beforeunload",()=>{e(),t(),a(),n(),s()})},m=v()(ue(pe(e=>({notify:{notify:[],views:[],active:null},modal:{notify:[],views:[],active:null},inbox:{notify:[],views:[],active:null},external_page:{notify:[],views:[],active:null},setViews:(t,a)=>e(n=>({[t]:{...n[t],views:[...n[t].views,a],active:null}})),setActive:(t,a)=>e(n=>({[t]:{...n[t],active:a}}))}),{name:"core_wam_notify",storage:me(()=>fe(`core_wam_${chrome.runtime.id}`,"core_wam_notify")),version:2,partialize:e=>({notify:{notify:[],views:e.notify.views,active:null},modal:{notify:[],views:e.modal.views,active:null},inbox:{notify:[],views:e.inbox.views,active:null},external_page:{notify:[],views:e.external_page.views,active:null}}),onRehydrateStorage:()=>()=>{J("start")}})));Ue();const Xe=c.lazy(() => __vitePreload(()=>import(chrome.runtime.getURL("content/assets/js/v_7_4_3_48_026858c9-0735-4edd-ae06-f5f59030b02854.js")),[]));function Ge({notificacao:e}){return i.jsx(c.Suspense,{fallback:i.jsx(i.Fragment,{}),children:i.jsx(Xe,{notificacao:e})})}function Je(){const{modal:e,setViews:t}=m(xe(a=>({modal:a.modal.active,setViews:a.setViews})));return i.jsx("section",{"data-id":"Notificacao-Modal",children:i.jsx(V,{children:e&&i.jsx(h.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.2},className:"fixed inset-0 z-[99999999999999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4",children:i.jsxs(h.div,{initial:{opacity:0,scale:.95,y:10},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:10},transition:{type:"spring",stiffness:300,damping:25,duration:.3},className:"relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-fit max-h-[90vh] flex flex-col",onClick:a=>a.stopPropagation(),children:[i.jsx("button",{onClick:()=>t("modal",e.id),className:"absolute top-3 right-3 z-50 p-1.5 rounded-full bg-white/80 hover:bg-gray-100 transition-colors cursor-pointer shadow-sm group",title:"Fechar",children:i.jsx(N,{className:"w-5 h-5 text-gray-500 group-hover:text-[var(--primaria)] transition-colors"})}),i.jsx("div",{className:"w-full h-full overflow-y-auto custom-scrollbar",children:i.jsx(Ge,{notificacao:e})})]})},"notify-overlay")})})}const K=v(e=>({modalExterno:null,zIndex:900,btnClose:!1,auxFunc:{mounted:null,desmouted:null},open:(t,a=900,n=!1,s={mounted:null,desmouted:null})=>{s.mounted&&s.mounted(),e(()=>({modalExterno:t,zIndex:a,btnClose:n,auxFunc:s}))},close:()=>e(t=>(t.auxFunc.desmouted&&t.auxFunc.desmouted(),{modalExterno:null})),openRendertype:(t,a=900,n=!1,s={mounted:null,desmouted:null})=>{let o;t==="Active_IA"&&(o=i.jsx(ne,{})),K.getState().open(o,a,n,s)}}));function Ze(){const{modalExterno:e,btnClose:t,close:a,zIndex:n}=K(),s=c.useRef(null),o=c.useRef(null);return c.useEffect(()=>{const r=l=>{const p=document.querySelector(".iziToast-wrapper"),x=document.querySelector('section[data-id="Modal Options"]'),d=document.querySelector('section[data-id="Modal"]');t&&s.current&&!o.current.contains(l.target)&&(!p||!p.contains(l.target))&&!x&&!d&&a()};return e&&document.addEventListener("mousedown",r),()=>{document.removeEventListener("mousedown",r)}},[e]),e&&i.jsx("section",{"data-id":"Modal Externo",children:i.jsx("dialog",{id:"my_modal_5",ref:s,className:"modal modal-bottom sm:modal-middle !absolute bg-[var(--modal-backdrop)] overflow-hidden !opacity-100 !pointer-events-auto !visible",style:{zIndex:n},children:i.jsxs("div",{ref:o,className:"animate__animated animate__zoomIn relative overflow-hidden !max-w-none !max-h-none !w-fit !h-fit p-[2px]",children:[t&&i.jsx("span",{className:"absolute w-5 h-5 top-3 right-3 pulse !cursor-pointer",onClick:a,children:i.jsx(N,{className:"w-full h-full text-[var(--primary-strong)]"})}),i.jsx("div",{className:"w-full h-full",children:e})]})})})}const Ke=v()(e=>({modal:null,btnClose:!0,auxFunc:{mounted:null,desmouted:null},open:(t,a=!0,n={mounted:null,desmouted:null})=>e(()=>(n.mounted&&n.mounted(),{modal:t,btnClose:a,auxFunc:n})),close:()=>e(t=>(t.auxFunc.desmouted&&t.auxFunc.desmouted(),{modal:null}))}));function Qe(){const{modal:e,btnClose:t,close:a}=Ke(),n=c.useRef(null),s=c.useRef(null);return c.useLayoutEffect(()=>{const o=r=>{const l=document.querySelector(".iziToast-wrapper"),p=document.querySelector('section[data-id="Modal Options"]'),x=document.querySelector('section[data-id="Modal Emoji"]'),d=document.querySelector('section[data-id="Modal Externo"]');t&&n.current&&!s.current.contains(r.target)&&(!l||!l.contains(r.target))&&!p&&!x&&!d&&a()};return e&&document.addEventListener("mousedown",o),()=>{document.removeEventListener("mousedown",o)}},[e]),i.jsx(V,{children:e&&i.jsx("section",{"data-id":"ModalLateral",children:i.jsx(h.div,{ref:n,initial:{opacity:0,backdropFilter:"blur(0px)"},animate:{opacity:1,backdropFilter:"blur(4px)"},exit:{opacity:0,backdropFilter:"blur(0px)"},transition:{duration:.3,ease:[.4,0,.2,1]},className:"h-full w-full fixed top-0 shadow-lg overflow-auto box-sizing z-[400] bg-black/20",style:{backgroundColor:"rgba(15, 23, 42, 0.3)"},children:i.jsxs(h.div,{ref:s,initial:{x:-400,opacity:0},animate:{x:0,opacity:1},exit:{x:-400,opacity:0},transition:{type:"spring",damping:30,stiffness:300,mass:.8},className:"modalLateral bg-white dark:bg-black border-[var(--conversation-header-border)] border-solid border-r overflow-hidden relative",children:[t&&i.jsx(h.span,{initial:{opacity:0,scale:.8},animate:{opacity:1,scale:1},transition:{delay:.2,duration:.2},className:"absolute w-5 h-5 top-3 right-3 pulse !cursor-pointer z-10",onClick:a,children:i.jsx(N,{className:"w-full h-full text-[var(--primary-strong)]"})}),i.jsx("div",{className:"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primaria)] via-[var(--secundaria)] to-[var(--terciaria)]"}),i.jsx("div",{className:"w-full h-full",children:e})]})})})})}const et=v()((e,t)=>({isHover:!1,content:"",options:{},referenceElement:null,style:{},open:(a,n,s,o={})=>e(()=>({isHover:!0,content:a,referenceElement:s,options:n,style:o})),close:()=>e(()=>({isHover:!1,content:"",referenceElement:null,options:{},style:{}})),openWithGetEvents:(a,n={placement:"bottom"},s={})=>{const{open:o,close:r}=t(),l=p=>{o(a,n,p.currentTarget,s)};return{onMouseEnter:l,onMouseMove:l,onFocus:l,onBlur:r,onMouseLeave:r}}}));function tt(){const{isHover:e,content:t,referenceElement:a,options:n,style:s}=et(),o=c.useRef(null),{refs:r,floatingStyles:l,context:p}=he({...n,middleware:[be(10),ve({element:o})]});return c.useEffect(()=>{a&&r.setReference(a)},[a,r]),e&&i.jsx("section",{"data-id":"Tooltip",children:i.jsx("div",{ref:r.setFloating,className:"z-[9999999] outline-none",style:{...l,...s},children:i.jsxs("div",{className:`
            rounded-md 
            shadow-md 
            bg-[var(--primaria)]
            dark:bg-[var(--primaria)]
            light:bg-white 
            border 
            border-[var(--terciaria)]
            animate-in 
            fade-in 
            zoom-in-95 
            duration-150
        `,children:[i.jsx(we,{ref:o,context:p,className:"fill-[var(--primaria)] light:fill-white border-[var(--terciaria)]",strokeWidth:1}),i.jsx("div",{className:"text-[#fafafa] light:text-[#09090b] px-3 py-1.5 text-xs font-medium",children:t})]})})})}function at(){const e=u(t=>t.getSeletor);return Le(),c.useLayoutEffect(()=>{e("afiliadoMain",t=>{f.appendChild(t)})},[]),i.jsxs(ke,{children:[i.jsx(ee,{}),i.jsx(re,{}),i.jsx(ye,{}),i.jsx(Je,{}),i.jsx(Ze,{}),i.jsx(tt,{}),i.jsx(Qe,{}),i.jsx(qe,{}),i.jsx(Ne,{}),i.jsx(Oe,{}),i.jsx(Re,{}),i.jsx(De,{}),i.jsx(Se,{theme:"system",position:"top-right"})]})}const f=document.createElement("main");document.body.prepend(f);f.setAttribute("theme-active","default");f.setAttribute("active-view-menu","true");const Q=e=>{try{return e.is_load?(H(e.getElement("paneSide"),()=>{te.createRoot(f).render(i.jsx(at,{})),f.setAttribute("active-assistente-chat",String(C.getState().assistente.active)),f.setAttribute("theme-active",String(z.getState().tema)),setTimeout(()=>{A.Whatsapp("theme",ge.getState().theme?"dark":"light")},2e3),ce(),Ae(),setTimeout(()=>{le.setState({loadStates:!0})},3e5)}),Ce(),A.DomSelector("set",e.domSelector),!0):!1}catch(t){return console.error("Erro ao inicializar o plugin:",t),!1}},ot=Q(u.getState());if(!ot){const e=u.subscribe(t=>{Q(t)&&e()})}const vt=Object.freeze(Object.defineProperty({__proto__:null,main:f},Symbol.toStringTag,{value:"Module"}));export{X as A,$ as C,E as F,Y as M,m as a,U as b,I as c,O as d,G as e,K as f,Ke as g,R as h,bt as i,vt as j,et as u};

