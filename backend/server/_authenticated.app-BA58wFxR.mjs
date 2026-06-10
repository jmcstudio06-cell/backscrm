import { j as jsxRuntimeExports } from "./_libs/react.mjs";
import { L as Link } from "./_libs/tanstack__react-router.mjs";
import { a as useQuery } from "./_libs/tanstack__react-query.mjs";
import { S as SiteHeader, C as Card, B as Button, a as SiteFooter } from "./_ssr/site-footer-DKV5A62Q.mjs";
import { B as Badge } from "./_ssr/badge-DXeGp7w1.mjs";
import { g as getStoredUser, b as apiFetch } from "./_ssr/router-4m4lsCcr.mjs";
import "./_libs/sonner.mjs";
import { c as Mail, d as CreditCard, e as Calendar, D as Download } from "./_libs/lucide-react.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
function statusBadge(status) {
  if (status === "active") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-success text-success-foreground", children: "Ativa" });
  if (status === "trial") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-warning text-warning-foreground", children: "Trial" });
  if (status === "expired") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Expirada" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Indefinida" });
}
function AppPage() {
  const stored = getStoredUser();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/auth/me").catch(() => null)
  });
  const me = (data && "user" in data ? data.user : data) || stored;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "container mx-auto flex-1 px-4 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Minha conta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Acompanhe sua licença e dados de acesso." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }),
            " E-mail"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: me?.email ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4" }),
            " Plano"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: me?.plan ?? "Sem plano" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: statusBadge(me?.status) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
            " Validade"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: me?.expiresAt ? new Date(me.expiresAt).toLocaleDateString("pt-BR") : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
            " Extensão Chrome"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Instale a extensão e faça login com o mesmo e-mail." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "mt-3 bg-gradient-brand text-cyan hover:opacity-90", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", rel: "noreferrer", children: "Baixar extensão" }) })
        ] })
      ] }),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-sm text-muted-foreground", children: "Atualizando dados…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mt-8 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Precisa fazer upgrade?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Conheça os planos e libere todos os recursos." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", hash: "planos", children: "Ver planos" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {})
  ] });
}
export {
  AppPage as component
};
