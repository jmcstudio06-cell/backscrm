import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { g as getStoredUser, c as getToken, d as clearAuth } from "./router-4m4lsCcr.mjs";
import { Z as Zap, l as LayoutDashboard, m as User, n as LogOut } from "../_libs/lucide-react.mjs";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Card = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
      ...props
    }
  )
);
Card.displayName = "Card";
const CardHeader = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
const CardTitle = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn("font-semibold leading-none tracking-tight", className),
      ...props
    }
  )
);
CardTitle.displayName = "CardTitle";
const CardDescription = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("text-sm text-muted-foreground", className), ...props })
);
CardDescription.displayName = "CardDescription";
const CardContent = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
const CardFooter = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";
function decodeJwt(token) {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function useAuth() {
  const [user, setUser] = reactExports.useState(() => getStoredUser());
  const [token, setToken] = reactExports.useState(() => getToken());
  reactExports.useEffect(() => {
    const refresh = () => {
      setUser(getStoredUser());
      setToken(getToken());
    };
    window.addEventListener("bzc-auth-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("bzc-auth-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const payload = decodeJwt(token);
  const expired = payload?.exp ? payload.exp * 1e3 < Date.now() : false;
  const role = user?.role ?? payload?.role;
  const isAuthenticated = Boolean(token && !expired);
  const isAdmin = isAuthenticated && role === "admin";
  const logout = reactExports.useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
  }, []);
  return { user, token, isAuthenticated, isAdmin, role, logout };
}
function SiteHeader() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex h-16 items-center justify-between px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-cyan", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4", strokeWidth: 2.5 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-lg font-bold tracking-tight", children: [
        "Backs ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-brand", children: "ZapCRM" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden items-center gap-6 md:flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/#recursos", className: "text-sm text-muted-foreground transition-colors hover:text-foreground", children: "Recursos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/#como-funciona", className: "text-sm text-muted-foreground transition-colors hover:text-foreground", children: "Como funciona" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/#planos", className: "text-sm text-muted-foreground transition-colors hover:text-foreground", children: "Planos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/#faq", className: "text-sm text-muted-foreground transition-colors hover:text-foreground", children: "FAQ" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: isAuthenticated ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => navigate({ to: "/dashboard" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "mr-1.5 h-4 w-4" }),
        " Painel"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => navigate({ to: "/app" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "mr-1.5 h-4 w-4" }),
        " ",
        user?.email?.split("@")[0]
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => {
        logout();
        navigate({ to: "/" });
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate({ to: "/login" }), children: "Entrar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "bg-gradient-brand text-cyan hover:opacity-90", onClick: () => navigate({ to: "/cadastro" }), children: "Começar grátis" })
    ] }) })
  ] }) });
}
function SiteFooter() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border/60 bg-card/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-cyan", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4", strokeWidth: 2.5 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-semibold", children: "Backs ZapCRM" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Backs ZapCRM. Transforme conversas em vendas."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "hover:text-foreground", children: "Entrar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cadastro", className: "hover:text-foreground", children: "Cadastrar" })
    ] })
  ] }) });
}
export {
  Button as B,
  Card as C,
  SiteHeader as S,
  SiteFooter as a,
  cn as c
};
