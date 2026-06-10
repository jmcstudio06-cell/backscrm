import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { S as SiteHeader, C as Card, B as Button, a as SiteFooter } from "./site-footer-DKV5A62Q.mjs";
import { L as Label, I as Input } from "./label-pDDVNKvL.mjs";
import { s as showApiError, a as setAuth, b as apiFetch } from "./router-4m4lsCcr.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { Z as Zap } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
const schema = objectType({
  email: stringType().trim().email("E-mail inválido").max(255),
  password: stringType().min(6, "Senha deve ter no mínimo 6 caracteres").max(100)
});
function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = reactExports.useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = reactExports.useState({});
  const mutation = useMutation({
    mutationFn: (data) => apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: (res) => {
      setAuth(res.token, res.user);
      toast.success("Bem-vindo de volta!");
      navigate({
        to: res.user.role === "admin" ? "/dashboard" : "/app"
      });
    },
    onError: (e) => showApiError(e, "Não foi possível entrar")
  });
  const submit = (e) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0]] = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex flex-1 items-center justify-center px-4 py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-md p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-col items-center text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-cyan glow-cyan", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5", strokeWidth: 2.5 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold", children: "Entrar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Acesse sua conta Backs ZapCRM" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "E-mail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", autoComplete: "email", value: form.email, onChange: (e) => setForm({
            ...form,
            email: e.target.value
          }), placeholder: "voce@empresa.com" }),
          errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.email })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Senha" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", autoComplete: "current-password", value: form.password, onChange: (e) => setForm({
            ...form,
            password: e.target.value
          }), placeholder: "••••••••" }),
          errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.password })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full bg-gradient-brand text-cyan hover:opacity-90", disabled: mutation.isPending, children: mutation.isPending ? "Entrando..." : "Entrar" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
        "Não tem conta?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cadastro", className: "font-medium text-cyan hover:underline", children: "Criar agora" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {})
  ] });
}
export {
  LoginPage as component
};
