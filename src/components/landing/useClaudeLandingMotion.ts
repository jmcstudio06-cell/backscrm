import { useEffect, type RefObject } from "react";

/** Presentation-only interactions; no account data is read or changed. */
export function useClaudeLandingMotion(ref: RefObject<HTMLDivElement>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const controller = new AbortController();
    const { signal } = controller;
    const frames = new Set<number>();
    const request = (callback: FrameRequestCallback) => {
      const id = requestAnimationFrame(time => { frames.delete(id); callback(time); });
      frames.add(id);
      return id;
    };
    const nav = Array.from(root.querySelectorAll<HTMLAnchorElement>('.top nav a[href^="#"]:not(.cta)'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    root.classList.add('js');
    root.querySelectorAll<HTMLElement>('.sec .two>*,.sec>.ey,.sec>h2,.sec>p,.ph,.tkh,.t,.lst li,details,.pn .in,.ct,.cta2 .two2>div').forEach((element, index) => {
      element.setAttribute('data-r', '');
      element.style.setProperty('--d', `${(index % 4) * .09}s`);
      observer.observe(element);
    });
    const active = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) nav.forEach(a => a.classList.toggle('on', a.hash === `#${entry.target.id}`));
      });
    }, { rootMargin: '-35% 0px -50% 0px' });
    nav.forEach(a => { const target = root.querySelector(a.hash); if (target) active.observe(target); });
    const top = root.querySelector<HTMLElement>('.top');
    const progress = () => {
      const height = document.documentElement.scrollHeight - innerHeight;
      top?.style.setProperty('--p', String(height > 0 ? Math.min(1, scrollY / height) : 0));
    };
    window.addEventListener('scroll', progress, { passive: true, signal });
    progress();
    const hero = root.querySelector<HTMLElement>('.hero');
    hero?.addEventListener('pointermove', e => {
      const bounds = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', String((e.clientX - bounds.left) / bounds.width - .5));
      hero.style.setProperty('--my', String((e.clientY - bounds.top) / bounds.height - .5));
    }, { signal });
    hero?.addEventListener('pointerleave', () => {
      hero.style.setProperty('--mx', '0'); hero.style.setProperty('--my', '0');
    }, { signal });
    const pills = Array.from(root.querySelectorAll<HTMLButtonElement>('.m-p'));
    const received = root.querySelector('#rec'), bar = root.querySelector<HTMLElement>('#bar'), pending = root.querySelector('#fal');
    const values = [2800, 1500, 1500];
    const states = [{ text: 'Aguardando', color: 'y' }, { text: 'Contrato enviado', color: 'y' }, { text: 'Sinal pago', color: 'g' }];
    const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const total = () => 9000 + pills.reduce((sum, pill, index) => sum + (pill.dataset.s === '2' ? values[index] ?? 0 : 0), 0);
    let current = 0, animation: number | undefined;
    const animate = (to: number) => {
      if (animation !== undefined) { cancelAnimationFrame(animation); frames.delete(animation); }
      const from = current, start = performance.now();
      const tick = (time: number) => {
        const k = Math.min(1, (time - start) / 700);
        current = from + (to - from) * (1 - Math.pow(1 - k, 3));
        if (received) received.textContent = currency(Math.round(current));
        if (bar) bar.style.width = `${current / 16300 * 100}%`;
        if (pending) pending.textContent = `Faltam ${currency(Math.round(16300 - current))} a receber`;
        if (k < 1) animation = request(tick);
      };
      animation = request(tick);
    };
    pills.forEach(pill => pill.addEventListener('click', () => {
      const next = (Number(pill.dataset.s) + 1) % states.length;
      const state = states[next];
      if (!state) return;
      pill.dataset.s = String(next); pill.textContent = state.text;
      pill.classList.remove('g', 'y', 'pulse'); pill.classList.add(state.color);
      animate(total());
    }, { signal }));
    const timer = window.setTimeout(() => animate(total()), 500);
    return () => {
      controller.abort(); observer.disconnect(); active.disconnect();
      window.clearTimeout(timer); frames.forEach(cancelAnimationFrame);
    };
  }, [ref]);
}
