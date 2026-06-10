async function l(e) {
  try {
    const t = await chrome.tabs.query({ url: e });
    if (t.length === 0)
      return;
    const o = t.map((a) => a.id);
    await chrome.tabs.remove(o);
  } catch (t) {
    console.error("Erro ao tentar fechar as abas do WhatsApp:", t);
  }
}
function w(e) {
  const t = new Date(e), o = /* @__PURE__ */ new Date(), a = t.getTime() - o.getTime();
  return a <= 12e4 || a < 0;
}
const n = {
  // NomeID Da WL Ativa
  name: "backscrm",
  // Versão de build
  version: "1.0.0",
  // Chave de criptografia
  cript_key: "minha-chave-secreta-personalizada",
  // Url do backend principal
  backend_plugin: "https://backscrm.onrender.com/",
  // Url do backend Antigo
  backend: "https://backscrm.onrender.com/",
  // Url do backend de funções auxiliares
  backend_utils: "https://backscrm.onrender.com/",
  // WebSockets
  webSocket: {
    "multi-atendimento": "https://backscrm.onrender.com",
    "api-whatsapp": "https://backscrm.onrender.com"
  },
  // Url do painel de clientes
  painel_cliente: "https://backscrm.onrender.com",
  // Url do audio transcriber
  audio_transcriber: "https://backscrm.onrender.com/transcription",
  // Url do código remoto
  remote_code: "https://backscrm.onrender.com",
  // Limite de mídia no Resposta Rápida
  midiaLimit: 50
};
function g(e) {
  e.reason === "install" && fetch(`${n.backend_plugin}api/urls/install/${chrome.runtime.id}`).then((t) => {
    if (!t.ok)
      throw new Error("Erro na requisição: " + t.status);
    return t.json();
  }).then((t) => {
    t.success && chrome.tabs.create({ url: t.url });
  }).catch((t) => {
    console.error("Erro ao fazer a requisição:", t);
  });
}
const _ = () => {
  fetch(`${n.backend_plugin}api/urls/active-notes/${chrome.runtime.id}`).then((e) => {
    if (!e.ok)
      throw new Error("Erro na requisição: " + e.status);
    return e.json();
  }).then((e) => {
    e.success && e.path_note_update.redirect && chrome.tabs.create({ url: `${n.backend_plugin}api/urls/notes/${chrome.runtime.id}` });
  }).catch((e) => {
    console.error("Erro ao fazer a requisição:", e);
  });
};
function c(e) {
  const t = chrome.runtime.getURL(e + "/src/index.html");
  chrome.tabs.query({ url: t }, function(o) {
    o.length > 0 && o.forEach((a) => {
      a.id !== void 0 && chrome.tabs.remove(a.id);
    }), chrome.tabs.create({ url: t });
  });
}
async function k(e) {
  const { success: t, bearer_token: o } = await y();
  if (!t) {
    i();
    return;
  }
  if (e.reason !== "install") {
    i();
    return;
  }
  await l("*://web.whatsapp.com/*"), await l("*://chromewebstore.google.com/*"), chrome.tabs.create({ url: `https://web.whatsapp.com?bearer_token=${o}` });
}
function i() {
  chrome.tabs.query({ url: "https://web.whatsapp.com/*" }, function(e) {
    e.length > 0 && e[0].id !== void 0 ? chrome.tabs.reload(e[0].id) : chrome.tabs.create({ url: "https://web.whatsapp.com" });
  });
}
async function y() {
  const e = "*://chromewebstore.google.com/*";
  try {
    const t = await chrome.tabs.query({ url: e });
    if (t.length === 0)
      return { success: !1, bearer_token: "" };
    for (const o of t)
      if (o.url)
        try {
          const r = new URL(o.url).searchParams.get("bearer_token");
          if (r)
            return { success: !0, bearer_token: r };
        } catch (a) {
          console.warn(`Erro ao processar a URL da aba ${o.id}:`, a);
        }
    return { success: !1, bearer_token: "" };
  } catch (t) {
    return console.error("Erro ao consultar as abas do Chrome:", t), { success: !1, bearer_token: "" };
  }
}
async function M(e) {
  return new Promise((t, o) => {
    chrome.storage.local.get([e], function(a) {
      a[e] === void 0 ? o() : t(a[e]);
    });
  });
}
function s(e, t, o) {
  chrome.tabs.query({ url: e }, function(a) {
    a.length > 0 && a.forEach((r) => {
      chrome.tabs.sendMessage(r.id, { action: t, dados: o });
    });
  });
}
function A() {
  chrome.runtime.setUninstallURL(`${n.backend_plugin}api/urls/uninstall/${chrome.runtime.id}`);
}
const f = async () => {
  try {
    const url = n.remote_code.endsWith('/') ? `${n.remote_code}config.json` : `${n.remote_code}/config.json`;
    const response = await fetch(url, {
      method: "GET"
    });
    if (!response.ok) throw new Error("Falha ao buscar config.json");
    const t = await response.json();
    return s("https://web.whatsapp.com/*", "Update_DomSelector", t), t;
  } catch (e) {
    console.error("Erro ao buscar configurações externas:", e);
    return null;
  }
};
async function T() {
  const e = await M("notifications"), t = [], o = [];
  let a = 0;
  for (let r of e)
    !r.timeOut && w(`${r.date}T${r.time}`) && (r.timeOut = !0, o.push(r)), r.timeOut && !r.read && a++, t.push(r);
  s("https://web.whatsapp.com/*", "Update_Notificação", { update: t, dispart: o, tam: a });
}
function m() {
  chrome.alarms.get("One_Minute", (e) => {
    e || chrome.alarms.create("One_Minute", { periodInMinutes: 1 });
  }), chrome.alarms.get("Five_Minutes", (e) => {
    e || chrome.alarms.create("Five_Minutes", { periodInMinutes: 5 });
  }), chrome.alarms.get("Ten_Minutes", (e) => {
    e || chrome.alarms.create("Ten_Minutes", { periodInMinutes: 10 });
  }), chrome.alarms.get("Thirty_Minutes", (e) => {
    e || chrome.alarms.create("Thirty_Minutes", { periodInMinutes: 30 });
  });
}
chrome.alarms.onAlarm.addListener((e) => {
  switch (e.name) {
    // 1 Minuto
    case "One_Minute":
      s("https://web.whatsapp.com/*", "Update_Agendamento", {}), s("https://web.whatsapp.com/*", "Update_Status", {}), s("https://web.whatsapp.com/*", "Update_BackupAutomatico", {}), s("https://web.whatsapp.com/*", "Update_MeetAoVivo", {}), T();
      break;
    // 5 Minutos
    case "Five_Minutes":
      s("https://web.whatsapp.com/*", "license_update", {}), s("https://web.whatsapp.com/*", "dispatch_timing_follow", {});
      break;
    // 10 Minutos
    case "Ten_Minutes":
      f();
      break;
    // 30 Minutos
    case "Thirty_Minutes":
      s("https://web.whatsapp.com/*", "Remote-Notificacao", {});
      break;
    // Alarme de manter o sistema ativo
    case "keepAwake":
      chrome.runtime.getPlatformInfo();
      break;
  }
});
const I = () => {
  const e = /* @__PURE__ */ new Date();
  e.setDate(e.getDate() + 1);
  const t = e.getFullYear(), o = String(e.getMonth() + 1).padStart(2, "0"), a = String(e.getDate()).padStart(2, "0");
  return `${t}-${o}-${a}`;
}, U = {
  date: I(),
  items: [
    "respostasRapidas",
    "respostasRapidasAcao",
    "categoria",
    "agendamentos",
    "agendamentosNaoDisparados",
    "sendAfterWhatsAppOpens",
    "crm",
    "contatos",
    "notes",
    "notifications",
    "perfil",
    "userTabs",
    "agrupamentos",
    "relatorio",
    "encomendas",
    "autoatendimento",
    "webhook",
    "IA",
    "status",
    "pinChat",
    "atendimento",
    "backupAutomatico",
    "whatsApi",
    "replacementStorage",
    "FollowUp",
    "fluxo"
  ],
  recurrency: "diario",
  time: "10:30"
};
async function E() {
  chrome.storage.local.get(null, (e) => {
    chrome.storage.local.set({
      agendamentos: e.agendamentos || [],
      agendamentosNaoDisparados: e.agendamentosNaoDisparados || [],
      sendAfterWhatsAppOpens: e.sendAfterWhatsAppOpens || !1,
      notifications: e.notifications || [],
      userTabs: e.userTabs || [],
      contatos: e.contatos || [],
      notes: e.notes || [],
      agendaMsg: e.agendaMsg || [],
      perfil: e.perfil || [],
      categoria: e.categoria || [],
      initSystem: e.initSystem || !1,
      backupAutomatico: e.backupAutomatico || U,
      crm: e.crm || [],
      fluxo: e.fluxo || { workflows: [], currentWorkflow: null },
      fluxoFiles: e.fluxoFiles || [],
      relatorio: e.relatorio || [],
      encomendas: e.encomendas || [],
      autoatendimento: e.autoatendimento || [],
      FollowUp: e.FollowUp || [],
      webhook: e.webhook || [],
      IA: e.IA || { activeIA: "Gemini", keyGemini: "", keyGPT: "", keyGroq: "", instance: null },
      status: e.status || [],
      pinChat: e.pinChat || [],
      atendimento: e.atendimento || void 0,
      whatsApi: e.whatsApi || { active: !1, token: "", userID: "" },
      replacementStorage: e.replacementStorage || { items: [], isEnabled: !0 },
      initDate: e.initDate || !1,
      //Armazena a data em que o plugin foi instalado para validar a utilização de algumas funções do usuário free
      modalLead: e.modalLead || {},
      // Agrupamentos do novo e antigo envio em massa
      agrupamentos: e.agrupamentos || [],
      groupments: e.groupments || [],
      // Respostas Rapidas OLD
      guardaMsg: e.guardaMsg || [],
      medias: e.medias || [],
      // Respostas Rapidas New
      respostasRapidas: e.respostasRapidas || [],
      respostasRapidasAcao: e.respostasRapidasAcao || []
    });
  });
}
const u = /* @__PURE__ */ new Map(), h = (e, t, o) => {
  o.url && u.set(e, o.url);
}, d = (e) => {
  const t = u.get(e);
  u.delete(e), t && t.includes("https://web.whatsapp") && chrome.runtime.sendMessage({ action: "whatsIsClosed" });
}, p = () => {
  try {
    chrome.tabs.onUpdated.removeListener(h), chrome.tabs.onRemoved.removeListener(d);
  } catch (e) {
    console.error("erro ao remover os ouvintes do WhatsIsOpen", e);
  } finally {
    chrome.tabs.onUpdated.addListener(h), chrome.tabs.onRemoved.addListener(d);
  }
}, v = async (e) => {
  try {
    const config = await f();
    if (!config || !config.remote_code) {
      console.warn("Configurações remotas não encontradas, usando fallback.");
      return;
    }
  } catch (t) {
    console.error("Erro ao injetar WPP:", t), s("https://web.whatsapp.com/*", "module-error", { code: "MODULO_EXTERNAL_NOT_INITIALIZED_IN_BACKGROUND" });
  }
}, b = (e) => {
  chrome.tabs.query({ url: "https://web.whatsapp.com/*" }, (t) => {
    if (t && t.length > 0) {
      const o = t[0], a = o.id, r = `https://web.whatsapp.com/?bearer_token=${e}`;
      chrome.windows.update(o.windowId, { focused: !0 }), chrome.tabs.update(a, {
        active: !0,
        url: r
      });
    } else
      chrome.tabs.create({
        url: `https://web.whatsapp.com/?bearer_token=${e}`
      });
  });
}, L = () => {
  chrome.runtime.onMessageExternal.addListener(async (e, t, o) => {
    switch (e.action) {
      // Informa que a extensão foi Instalada
      case "is_instaled":
        o({ success: !0 });
        break;
      case "open_whatsapp":
        b(e.bearer);
        break;
      case "user_auth":
        b(e.bearer_token), e.close_painel && t.tab && t.tab.id && setTimeout(() => {
          chrome.tabs.remove(t.tab.id);
        }, 100);
        break;
    }
    return !0;
  });
};
m();
p();
L();
chrome.action.onClicked.addListener(() => {
  m(), p(), i();
});
chrome.runtime.onInstalled.addListener(async function(e) {
  g(e), k(e), m(), E(), p(), A(), e.reason === "update" && _();
});
chrome.runtime.onMessage.addListener((e, t, o) => {
  switch (e.message) {
    case "CRM":
      c("crm");
      break;
    case "FLOW":
      c("fluxo");
      break;
    case "funnil":
      c("funnil");
      break;
    case "inject-code":
      v(e.bearer_token);
      break;
    case "promotional":
      chrome.tabs.create({ url: e.path });
      break;
  }
});

