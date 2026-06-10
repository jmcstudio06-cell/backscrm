import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { Q as redirect } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster, t as toast } from "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
const appCss = "/assets/styles-B3umSPvN.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-gradient-brand", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold", children: "Página não encontrada" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "A página que você procura não existe ou foi movida." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Voltar ao início"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight", children: "Esta página não carregou" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Algo deu errado. Você pode tentar novamente ou voltar ao início." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Tentar novamente"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent",
          children: "Início"
        }
      )
    ] })
  ] }) });
}
const Route$7 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Backs ZapCRM — CRM e Automação para WhatsApp" },
      { name: "description", content: "Transforme seu WhatsApp em um CRM profissional: organize chats, crie funis de vendas e automatize mensagens com a extensão Backs ZapCRM." },
      { name: "author", content: "Backs ZapCRM" },
      { property: "og:title", content: "Backs ZapCRM — CRM e Automação para WhatsApp" },
      { property: "og:description", content: "Transforme seu WhatsApp em um CRM profissional: organize chats, crie funis de vendas e automatize mensagens com a extensão Backs ZapCRM." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Backs ZapCRM — CRM e Automação para WhatsApp" },
      { name: "twitter:description", content: "Transforme seu WhatsApp em um CRM profissional: organize chats, crie funis de vendas e automatize mensagens com a extensão Backs ZapCRM." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/331ab9e3-7446-46f2-9d8f-6ca46df29ebb/id-preview-6b5e5176--46c34d45-fc38-4ce8-a45a-55f8ae9fbe97.lovable.app-1781050305972.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/331ab9e3-7446-46f2-9d8f-6ca46df29ebb/id-preview-6b5e5176--46c34d45-fc38-4ce8-a45a-55f8ae9fbe97.lovable.app-1781050305972.png" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "pt-BR", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$7.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-right", richColors: true })
  ] });
}
const $$splitComponentImporter$6 = () => import("./login-C5BF-k7E.mjs");
const Route$6 = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Entrar — Backs ZapCRM"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./cadastro-BlAWIUjt.mjs");
const Route$5 = createFileRoute("/cadastro")({
  head: () => ({
    meta: [{
      title: "Cadastrar — Backs ZapCRM"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const API_BASE_URL = "https://backscrm.onrender.com";
const TOKEN_KEY = "bzc_token";
const USER_KEY = "bzc_user";
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("bzc-auth-change"));
}
function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("bzc-auth-change"));
}
class ApiError extends Error {
  status;
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (e) {
    throw new ApiError("Falha de conexão com o servidor. Tente novamente.", 0);
  }
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const message = data && (data.message || data.error) || (res.status === 401 ? "Credenciais inválidas ou sessão expirada." : res.status === 404 ? "Recurso não encontrado." : `Erro ${res.status}`);
    if (res.status === 401) clearAuth();
    throw new ApiError(message, res.status);
  }
  return data;
}
function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
function showApiError(e, fallback = "Algo deu errado") {
  const msg = e instanceof Error ? e.message : fallback;
  toast.error(msg);
}
const $$splitComponentImporter$4 = () => import("../_authenticated-BFsOu0JM.mjs");
const Route$4 = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    const token = getToken();
    const user = getStoredUser();
    if (!token || !user) throw redirect({
      to: "/login"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("../_admin-BFsOu0JM.mjs");
function decodeRole(token) {
  if (!token) return;
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json).role;
  } catch {
    return;
  }
}
const Route$3 = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: () => {
    const token = getToken();
    const user = getStoredUser();
    if (!token) throw redirect({
      to: "/login"
    });
    const role = user?.role ?? decodeRole(token);
    if (role !== "admin") throw redirect({
      to: "/app"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./index-LlzELj3O.mjs");
const Route$2 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Backs ZapCRM — CRM e Automação para WhatsApp"
    }, {
      name: "description",
      content: "Extensão de WhatsApp CRM: organize chats, crie funis de vendas e automatize mensagens. Teste grátis."
    }, {
      property: "og:title",
      content: "Backs ZapCRM — Transforme seu WhatsApp em CRM"
    }, {
      property: "og:description",
      content: "Organize chats, monte funis e automatize seu WhatsApp em minutos."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("../_authenticated.app-BA58wFxR.mjs");
const Route$1 = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [{
      title: "Minha conta — Backs ZapCRM"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("../_admin.dashboard-ZuRDiQHp.mjs");
const Route = createFileRoute("/_admin/dashboard")({
  head: () => ({
    meta: [{
      title: "Painel Admin — Backs ZapCRM"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const LoginRoute = Route$6.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$7
});
const CadastroRoute = Route$5.update({
  id: "/cadastro",
  path: "/cadastro",
  getParentRoute: () => Route$7
});
const AuthenticatedRoute = Route$4.update({
  id: "/_authenticated",
  getParentRoute: () => Route$7
});
const AdminRoute = Route$3.update({
  id: "/_admin",
  getParentRoute: () => Route$7
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$7
});
const AuthenticatedAppRoute = Route$1.update({
  id: "/app",
  path: "/app",
  getParentRoute: () => AuthenticatedRoute
});
const AdminDashboardRoute = Route.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AdminRoute
});
const AdminRouteChildren = {
  AdminDashboardRoute
};
const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
const AuthenticatedRouteChildren = {
  AuthenticatedAppRoute
};
const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AdminRoute: AdminRouteWithChildren,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  CadastroRoute,
  LoginRoute
};
const routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  setAuth as a,
  apiFetch as b,
  getToken as c,
  clearAuth as d,
  getStoredUser as g,
  router as r,
  showApiError as s
};
