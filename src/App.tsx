import { useEffect, useState, useRef } from 'react';
import Scene3D from './components/Scene3D';

/* ===== HELPERS ===== */
function fmt(n: number) { return n.toLocaleString('ru-RU'); }

/* ===== SCROLL REVEAL HOOK ===== */
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('active'); observer.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ===== STICKY HEADER ===== */
function useStickyHeader() {
  useEffect(() => {
    let last = 0;
    const header = document.querySelector('.header') as HTMLElement | null;
    const onScroll = () => {
      if (!header) return;
      const cur = window.scrollY;
      if (cur > 600) header.classList.add('visible');
      else header.classList.remove('visible');
      if (cur > last && cur > 200) header.style.transform = 'translateY(-100%)';
      else if (cur < last) header.style.transform = '';
      last = cur;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

/* ===== CLOCK ===== */
function useClock() {
  const [time, setTime] = useState('--:--:--');
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toTimeString().split(' ')[0]), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ===== FAQ ITEM ===== */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(!open)} aria-expanded={open}>
        {q}
        <span className="faq-chevron" aria-hidden="true">&#9660;</span>
      </button>
      <div className="faq-answer" role="region">
        <p>{a}</p>
      </div>
    </div>
  );
}

/* ===== CALCULATOR ===== */
function Calculator() {
  const [val, setVal] = useState(1000);
  // Beta: 7.5% total (4.5% bank + 3% platform)
  const bank = Math.round(val * 0.045);
  const platform = Math.round(val * 0.03);
  const author = val - bank - platform;
  const pct = ((author / val) * 100).toFixed(1);
  const sliderPct = ((val - 100) / (10000 - 100)) * 100;

  return (
    <div className="calc-wrap">
      <div className="calc-header">
        <span className="label">Калькулятор</span>
        <div className="calc-amount">
          <span>{fmt(val)}</span>
          <span className="currency"> &#8381;</span>
        </div>
      </div>
      <input
        type="range" className="calc-slider"
        min={100} max={10000} value={val} step={100}
        onChange={(e) => setVal(+e.target.value)}
        style={{ background: `linear-gradient(to right, #3D9B7A ${sliderPct}%, #1A1A1A ${sliderPct}%)` }}
        aria-label="Сумма доната"
      />
      <div>
        <div className="calc-row">
          <span className="calc-row-label">Автору</span>
          <span className="calc-row-value author">{fmt(author)} &#8381;</span>
        </div>
        <div className="calc-row">
          <span className="calc-row-label">Банку (эквайринг)</span>
          <span className="calc-row-value fee">{fmt(bank)} &#8381;</span>
        </div>
        <div className="calc-row">
          <span className="calc-row-label">Uppora</span>
          <span className="calc-row-value fee">{fmt(platform)} &#8381;</span>
        </div>
      </div>
      <div className="calc-bar"><div className="calc-bar-fill" style={{ width: `${pct}%` }} /></div>
      <p className="calc-note">Бета: комиссия 7,5% (4,5% эквайринг + 3% платформа). У конкурентов: 10–15%.</p>
    </div>
  );
}

/* ===== TRANSPARENCY BARS ===== */
function TransparencyVisual() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.querySelectorAll('[data-animate]').forEach((bar, i) => {
              setTimeout(() => bar.classList.add('animate'), i * 200);
            });
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="hyp-visual transparency-visual" ref={ref} aria-label="Распределение средств">
      <div className="tx-bar">
        <span className="tx-bar-label">Автору</span>
        <div className="tx-bar-track"><div className="tx-bar-fill author" data-animate>92.5%</div></div>
      </div>
      <div className="tx-bar">
        <span className="tx-bar-label">Банк</span>
        <div className="tx-bar-track"><div className="tx-bar-fill bank" data-animate>4.5%</div></div>
      </div>
      <div className="tx-bar">
        <span className="tx-bar-label">Uppora</span>
        <div className="tx-bar-track"><div className="tx-bar-fill platform" data-animate>3%</div></div>
      </div>
      <div className="tx-report">
        <div className="tx-report-header">&#x1F4CB; Персональный отчёт донатера</div>
        <div className="tx-report-line"><span>Сумма доната</span><span className="amount">1 000 &#x20BD;</span></div>
        <div className="tx-report-line"><span>Получит автор</span><span className="amount" style={{ color: 'var(--gold)' }}>925 &#x20BD;</span></div>
        <div className="tx-report-line"><span>Эквайринг банка</span><span className="amount">45 &#x20BD;</span></div>
        <div className="tx-report-line"><span>Комиссия Uppora</span><span className="amount">30 &#x20BD;</span></div>
      </div>
    </div>
  );
}

/* ===== MAIN APP ===== */
export default function App() {
  useReveal();
  useStickyHeader();
  const clock = useClock();

  return (
    <>
      {/* 3D Background */}
      <Scene3D />

      {/* HUD Overlay */}
      <div className="hud">
        <div className="hud-header">
          <div className="brand">
            Upp<span>o</span>ra
            <span className="brand-sub">QR-донаты для авторов</span>
          </div>
          <div className="system-status">
            SYSTEM: ACTIVE<br />
            PHASE: BETA<br />
            SIGNAL: STABLE
          </div>
        </div>
        <div className="hud-footer">
          <div className="telemetry">
            TIMESTAMP: {clock}<br />
            COMMISSION: 7.5%<br />
            MODEL: ДОГОВОР_ДАРЕНИЯ<br />
            NDFL: 0%
          </div>
          <div className="system-status" style={{ textAlign: 'right' }}>
            V.BETA // ACTIVE<br />
            SCROLL TO NAVIGATE
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-fill" id="p-fill" />
        <div className="indicator-label" style={{ top: 0 }}>Start</div>
        <div className="indicator-label" style={{ bottom: 0 }}>End</div>
      </div>

      {/* Sticky Header */}
      <header className="header">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" className="logo">Upp<span>o</span>ra</a>
          <div className="header-right">
            <span className="header-badge">BETA</span>
            <a href="https://t.me/uppora" className="header-cta" target="_blank" rel="noopener">Подключить донаты</a>
          </div>
        </div>
      </header>

      {/* Scroll Content */}
      <main className="scroll-content">

        {/* ===== S1: HERO ===== */}
        <section className="hero-section" id="hero">
          <div className="container">
            <div className="hero-inner">
              <p className="label reveal">Uppora Beta</p>
              <h1 className="reveal stagger-1">
                Донатеры, которые<br /><span className="accent">возвращаются</span>
              </h1>
              <p className="hero-subtitle reveal stagger-2">
                7,5% комиссия вместо 13%. Ноль регистрации для&nbsp;донатера.
                Геймификация, которая превращает разовый перевод
                в&nbsp;повторные донаты. Подключение за&nbsp;1&nbsp;день.
              </p>
              <div className="hero-actions reveal stagger-3">
                <a href="https://t.me/uppora" className="btn-primary" target="_blank" rel="noopener">Подключить донаты</a>
                <a href="#gamification" className="btn-secondary">Как это работает</a>
              </div>
              <dl className="hero-stats reveal stagger-4">
                <div>
                  <dt className="hero-stat-value">7,5%</dt>
                  <dd className="hero-stat-label">Комиссия — вместо 13%</dd>
                </div>
                <div>
                  <dt className="hero-stat-value">0&nbsp;барьеров</dt>
                  <dd className="hero-stat-label">Регистрация для доната</dd>
                </div>
                <div>
                  <dt className="hero-stat-value">QR</dt>
                  <dd className="hero-stat-label">Донаты с&nbsp;мероприятий</dd>
                </div>
                <div>
                  <dt className="hero-stat-value">1&nbsp;день</dt>
                  <dd className="hero-stat-label">Подключение с&nbsp;куратором</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* ===== S2: PROBLEM ===== */}
        <section id="problem">
          <div className="container">
            <div className="section-header">
              <p className="label reveal">Проблема</p>
              <h2 className="reveal stagger-1">Почему донатеры<br />не&nbsp;возвращаются</h2>
              <p className="reveal stagger-2">Ты создаёшь контент. Люди хотят поддержать. Но платформы ставят барьеры.</p>
            </div>
            <div className="problem-grid">
              <div className="problem-card reveal">
                <div className="problem-icon">&#x1F4B8;</div>
                <h3>Платформа забирает 13%</h3>
                <p>Из 1 000 &#x20BD; ты получаешь 850. Остальное — комиссии платформы и эквайринг.</p>
                <div className="uppora-answer">&#10003; Uppora: 7,5% — автору 925 &#x20BD;</div>
              </div>
              <div className="problem-card reveal stagger-1">
                <div className="problem-icon">&#x1F6AB;</div>
                <h3>Регистрация отпугивает</h3>
                <p>Донатер видит форму регистрации — и уходит. Половина не завершает.</p>
                <div className="uppora-answer">&#10003; Uppora: ноль регистрации. QR → сумма → готово</div>
              </div>
              <div className="problem-card reveal stagger-2">
                <div className="problem-icon">&#x1F504;</div>
                <h3>Донатер не возвращается</h3>
                <p>Перевёл — забыл. Никакой связи, никакого повода вернуться.</p>
                <div className="uppora-answer">&#10003; Uppora: геймификация + маскоты = повод вернуться</div>
              </div>
              <div className="problem-card reveal stagger-3">
                <div className="problem-icon">&#x1F4F5;</div>
                <h3>Офлайн — мёртвая зона</h3>
                <p>На концерте, лекции, выставке — нет способа принять донат.</p>
                <div className="uppora-answer">&#10003; Uppora: QR-кит — постер, стикеры, карточки</div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== S3: HOW IT WORKS ===== */}
        <section id="steps">
          <div className="container">
            <div className="section-header">
              <p className="label reveal">Три шага</p>
              <h2 className="reveal stagger-1">Первый донат —<br />на этой неделе</h2>
            </div>
            <div className="steps-grid">
              <div className="step-card reveal">
                <div className="step-number">1</div>
                <h3>Напиши нам</h3>
                <p>В Telegram или на почту. Ответим за 2 часа.</p>
                <div className="step-detail">Персональный куратор на связи</div>
              </div>
              <div className="step-card reveal stagger-1">
                <div className="step-number">2</div>
                <h3>Мы настроим всё</h3>
                <p>Страница, QR-код, ссылка для донатов. Имя + карта для выплат.</p>
                <div className="step-detail">Без загрузки паспорта — 2 минуты</div>
              </div>
              <div className="step-card reveal stagger-2">
                <div className="step-number">3</div>
                <h3>Получай донаты</h3>
                <p>Донатер сканирует QR → вводит сумму → готово. Донат в личном кабинете, вывод на карту — за минуты.</p>
                <div className="step-detail">Вывод через Т-Банк — за минуты</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 40 }} className="reveal">
              <a href="https://t.me/uppora" className="btn-primary" target="_blank" rel="noopener">Подключить донаты бесплатно</a>
            </div>
          </div>
        </section>

        {/* ===== S4: CALCULATOR ===== */}
        <section id="calculator">
          <div className="container">
            <div className="calc-layout">
              <div>
                <p className="label reveal">Открытая бухгалтерия</p>
                <h2 className="reveal stagger-1">На чём зарабатывает<br /><span className="accent-gold">Uppora</span></h2>
                <p className="reveal stagger-2" style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
                  Мы зарабатываем 30 &#x20BD; с каждой тысячи. Не берём подписку.
                  Не берём комиссию за контент. 30 рублей — наш единственный доход.
                </p>
                <p className="reveal stagger-3" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  Бета: 3% платформа + 4,5% эквайринг = 7,5% итого.<br />
                  У конкурентов: Boosty ~11,7%, DonationAlerts ~12%, Patreon ~13-15%.
                </p>
              </div>
              <div className="reveal stagger-2">
                <Calculator />
              </div>
            </div>
          </div>
        </section>

        {/* ===== S5: HYPOTHESIS 1 — GAMIFICATION ===== */}
        <section id="gamification">
          <div className="container">
            <div className="hyp-layout">
              <div>
                <div className="hyp-number reveal">01 ГЕЙМИФИКАЦИЯ</div>
                <h2 className="hyp-title reveal stagger-1">Донатеры<br /><span className="accent">возвращаются</span></h2>
                <p className="hyp-desc reveal stagger-2">
                  После каждого доната донатер получает персональное предсказание —
                  как печенька с запиской, только умнее. Плюс ачивка в коллекцию.
                  Результат: делятся скриншотами и приходят снова.
                </p>
                <ul className="hyp-features reveal stagger-3">
                  <li>Донатеры делятся предсказаниями в соцсетях — бесплатный маркетинг</li>
                  <li>Система ачивок мотивирует повторные донаты</li>
                  <li>Кастомизация маскота за достижения</li>
                  <li>Каждый донат уникален — повод вернуться</li>
                </ul>
              </div>
              <div className="hyp-visual fortune-visual reveal">
                <div className="fortune-cookie">&#x1F36A;</div>
                <div className="fortune-message">
                  «Сегодня твоя щедрость запустит цепную реакцию добра»
                </div>
                <div className="fortune-badges">
                  <div className="fortune-badge" title="Первый донат">&#x1F31F;</div>
                  <div className="fortune-badge" title="5 донатов">&#x1F525;</div>
                  <div className="fortune-badge" title="3 автора">&#x1F3AF;</div>
                  <div className="fortune-badge" title="Ночной">&#x1F319;</div>
                  <div className="fortune-badge" title="Щедрый">&#x1F48E;</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== S6: HYPOTHESIS 2 — TRANSPARENCY ===== */}
        <section id="transparency">
          <div className="container">
            <div className="hyp-layout reverse">
              <div>
                <div className="hyp-number reveal">02 ПРОЗРАЧНОСТЬ</div>
                <h2 className="hyp-title reveal stagger-1">Доверие =<br /><span className="accent-gold">крупные донаты</span></h2>
                <p className="hyp-desc reveal stagger-2">
                  Донатер видит, куда ушёл каждый рубль — до копейки.
                  Прозрачность повышает доверие, а доверие — средний чек.
                </p>
                <ul className="hyp-features reveal stagger-3">
                  <li>Разбивка: сколько получил автор, сколько — банк и платформа</li>
                  <li>Персональные отчёты: «Твой вклад помог Маше выпустить 3 подкаста»</li>
                  <li>Автор отвечает на каждый донат лично</li>
                  <li>Значки признания в профиле донатера</li>
                </ul>
              </div>
              <TransparencyVisual />
            </div>
          </div>
        </section>

        {/* ===== S7: HYPOTHESIS 3 — MASCOTS ===== */}
        <section id="mascots">
          <div className="container">
            <div className="hyp-layout">
              <div>
                <div className="hyp-number reveal">03 МАСКОТЫ</div>
                <h2 className="hyp-title reveal stagger-1">Твой маскот —<br /><span style={{ color: 'var(--blue)' }}>твой бренд</span></h2>
                <p className="hyp-desc reveal stagger-2">
                  Настраиваешь маскота проекта — характер, стиль, аксессуары.
                  При каждом донате маскоты автора и донатера встречаются:
                  обнимаются, пляшут, дарят цветы.
                </p>
                <ul className="hyp-features reveal stagger-3">
                  <li>Маскот — лицо проекта. Ты выбираешь внешний вид</li>
                  <li>Маскот донатера растёт с каждым донатом</li>
                  <li>Анимация встречи при каждом донате — уникальная и виральная</li>
                  <li>Донатеры записывают и шарят — органический охват</li>
                </ul>
              </div>
              <div className="hyp-visual mascot-video-wrap reveal">
                <video
                  className="mascot-video"
                  autoPlay loop muted playsInline
                  src={`${import.meta.env.BASE_URL}assets/mascot-video.mp4`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===== S8: HYPOTHESIS 4 — SOCIAL ===== */}
        <section id="social">
          <div className="container">
            <div className="hyp-layout reverse">
              <div>
                <div className="hyp-number reveal">04 СООБЩЕСТВО</div>
                <h2 className="hyp-title reveal stagger-1">Тебя находят<br /><span style={{ color: 'var(--pink)' }}>новые донатеры</span></h2>
                <p className="hyp-desc reveal stagger-2">
                  У каждого донатера — профиль с историей поддержки.
                  Люди видят, кого поддерживают их друзья, и открывают тебя.
                </p>
                <ul className="hyp-features reveal stagger-3">
                  <li>Новые донатеры находят тебя через профили друзей</li>
                  <li>Каталог авторов по категориям — органический трафик</li>
                  <li>Ачивки донатеров видны всем — бесплатная реклама</li>
                  <li>Общие интересы = новые люди в твоём сообществе</li>
                </ul>
              </div>
              <div className="hyp-visual social-visual reveal">
                <div className="social-profile">
                  <div className="social-avatar">АК</div>
                  <div>
                    <div className="social-name">Алексей К.</div>
                    <div className="social-supports">Поддерживает 7 авторов</div>
                    <div className="social-tags">
                      <span className="social-tag">Музыка</span>
                      <span className="social-tag">Наука</span>
                      <span className="social-tag">Подкасты</span>
                    </div>
                  </div>
                </div>
                <div className="social-profile">
                  <div className="social-avatar" style={{ background: 'linear-gradient(135deg, var(--gold), var(--blue))' }}>МД</div>
                  <div>
                    <div className="social-name">Мария Д.</div>
                    <div className="social-supports">Поддерживает 12 авторов</div>
                    <div className="social-tags">
                      <span className="social-tag">Образование</span>
                      <span className="social-tag">Искусство</span>
                    </div>
                  </div>
                </div>
                <div className="social-discovery">
                  <p>&#x1F50E; Алексей и Мария оба поддерживают <strong style={{ color: 'var(--teal)' }}>Научный подкаст</strong>. Может, и тебе понравится?</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== S9: RELEASE TIMELINE (features + roadmap merged) ===== */}
        <section id="releases" style={{ minHeight: 'auto' }}>
          <div className="container">
            <div className="section-header">
              <p className="label reveal">Дорожная карта</p>
              <h2 className="reveal stagger-1">Что уже работает —<br />и что добавим</h2>
              <p className="reveal stagger-2">Каждый релиз — новые возможности для тебя и твоих донатеров.</p>
            </div>

            {/* MVP */}
            <div className="release-phase reveal">
              <div className="release-header">
                <div className="release-badge done">&#10003;</div>
                <div>
                  <div className="release-label">MVP — завершён</div>
                  <h3>Фундамент</h3>
                </div>
              </div>
              <div className="features-grid">
                {[
                  { icon: '&#x1F4B3;', cls: 'teal', title: 'Приём донатов', desc: 'QR-код, ссылка, офлайн-кит. Оплата через Т-Банк.' },
                  { icon: '&#x1F464;', cls: 'gold', title: 'Личный кабинет', desc: 'Баланс, история, вывод на карту за минуты.' },
                  { icon: '&#x1F512;', cls: 'teal', title: 'Авторизация', desc: 'Регистрация автора. Донатеру регистрация не нужна.' },
                  { icon: '&#x1F4B0;', cls: 'gold', title: 'Платежи (Т-Банк)', desc: 'Процессинг, вывод средств, договор дарения.' },
                ].map((f, i) => (
                  <div key={i} className={`feature-card reveal stagger-${Math.min(i + 1, 4)}`}>
                    <div className={`feature-icon ${f.cls}`} dangerouslySetInnerHTML={{ __html: f.icon }} />
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* BETA 1 */}
            <div className="release-phase reveal">
              <div className="release-header">
                <div className="release-badge active">&#x1F6A7;</div>
                <div>
                  <div className="release-label active-label">Beta 1 — в разработке</div>
                  <h3>Геймификация + Прозрачность</h3>
                </div>
              </div>
              <div className="features-grid">
                {[
                  { icon: '&#x1F36A;', cls: 'gold', title: 'Предсказания после доната', desc: 'Персональная «печенька с запиской» после каждого доната. Донатеры шарят скриншоты.' },
                  { icon: '&#x1F3AF;', cls: 'purple', title: 'Система ачивок', desc: 'Коллекция значков за донаты. Мотивация возвращаться снова и снова.' },
                  { icon: '&#x1F43E;', cls: 'blue', title: 'Маскоты-компаньоны', desc: 'Маскот автора и донатера встречаются при каждом донате. Уникальная виральная анимация.' },
                  { icon: '&#x1F4CB;', cls: 'teal', title: 'Прозрачные отчёты', desc: 'Донатер видит разбивку до копейки: сколько автору, банку, платформе.' },
                  { icon: '&#x1F511;', cls: 'purple', title: 'OAuth (VK, Google, Яндекс)', desc: 'Вход за 5 секунд. Без паспорта, без верификации.' },
                  { icon: '&#x1F4F1;', cls: 'pink', title: 'PWA', desc: 'Как приложение — установка в один тап, без App Store.' },
                  { icon: '&#x1F4AC;', cls: 'blue', title: 'Комментарии к донатам', desc: 'Донатер пишет сообщение, автор отвечает. Диалог, не анонимный перевод.' },
                  { icon: '&#x1F514;', cls: 'teal', title: 'Уведомления', desc: 'Push о новых донатах и ответах. Ты узнаёшь первым.' },
                ].map((f, i) => (
                  <div key={i} className={`feature-card reveal stagger-${Math.min(i + 1, 4)}`}>
                    <div className={`feature-icon ${f.cls}`} dangerouslySetInnerHTML={{ __html: f.icon }} />
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* BETA 2 */}
            <div className="release-phase reveal">
              <div className="release-header">
                <div className="release-badge future">&#x1F52E;</div>
                <div>
                  <div className="release-label future-label">Beta 2 — следующий этап</div>
                  <h3>Социальность + Аналитика</h3>
                </div>
              </div>
              <div className="features-grid">
                {[
                  { icon: '&#x1F4CA;', cls: 'gold', title: 'Аналитика для авторов', desc: 'Графики, тренды, источники трафика. Данные для роста.' },
                  { icon: '&#x1F465;', cls: 'pink', title: 'Расширенные профили', desc: 'Описание, ссылки, блог, отчёты — всё в одном месте.' },
                  { icon: '&#x2B50;', cls: 'gold', title: 'Рейтинги и голосования', desc: 'Донатеры голосуют за контент. Автор знает, что делать дальше.' },
                  { icon: '&#x1F4C8;', cls: 'teal', title: 'Продвинутые отчёты', desc: 'Персональные отчёты: «Твой вклад помог Маше выпустить 3 подкаста».' },
                ].map((f, i) => (
                  <div key={i} className={`feature-card reveal stagger-${Math.min(i + 1, 4)}`}>
                    <div className={`feature-icon ${f.cls}`} dangerouslySetInnerHTML={{ __html: f.icon }} />
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RELEASE */}
            <div className="release-phase reveal">
              <div className="release-header">
                <div className="release-badge future">&#x1F680;</div>
                <div>
                  <div className="release-label future-label">Релиз — полный масштаб</div>
                  <h3>Социальная платформа</h3>
                </div>
              </div>
              <div className="features-grid">
                {[
                  { icon: '&#x1F310;', cls: 'purple', title: 'Каталог авторов', desc: 'Новые донатеры находят тебя через категории и рекомендации.' },
                  { icon: '&#x1F50E;', cls: 'blue', title: 'Алгоритм рекомендаций', desc: 'Друзья поддерживают Научный подкаст — может, и тебе понравится?' },
                  { icon: '&#x1F464;', cls: 'pink', title: 'Социальные профили', desc: 'У каждого донатера — профиль с историей поддержки. Виральный рост.' },
                  { icon: '&#x1F517;', cls: 'teal', title: 'API для интеграций', desc: 'Встраивай донаты в свой сайт, Telegram-бот, стрим.' },
                ].map((f, i) => (
                  <div key={i} className={`feature-card reveal stagger-${Math.min(i + 1, 4)}`}>
                    <div className={`feature-icon ${f.cls}`} dangerouslySetInnerHTML={{ __html: f.icon }} />
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ===== S11: COMPARISON ===== */}
        <section id="comparison">
          <div className="container">
            <div className="section-header">
              <p className="label reveal">Сравнение</p>
              <h2 className="reveal stagger-1">Больше денег тебе.<br />Меньше барьеров донатеру.</h2>
            </div>
            <div className="comparison-table-wrap reveal">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Параметр</th>
                    <th className="uppora-col">Uppora</th>
                    <th>Boosty</th>
                    <th>DonationAlerts</th>
                    <th>Patreon</th>
                    <th>Ko-fi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Итого комиссия</td>
                    <td className="uppora-col" style={{ color: 'var(--gold)' }}>7,5%</td>
                    <td>~11,7%</td>
                    <td>~12%</td>
                    <td>~13-15%</td>
                    <td>~3-8%</td>
                  </tr>
                  <tr>
                    <td>Регистрация донатера</td>
                    <td className="uppora-col"><span className="check">Не нужна</span></td>
                    <td><span className="cross">Нужна</span></td>
                    <td><span className="cross">Нужна</span></td>
                    <td><span className="cross">Нужна</span></td>
                    <td><span className="cross">PayPal/Stripe</span></td>
                  </tr>
                  <tr>
                    <td>Скорость выплат</td>
                    <td className="uppora-col"><span className="check">За минуты</span></td>
                    <td>1-5 дней</td>
                    <td>До 5 дней</td>
                    <td>Раз в месяц</td>
                    <td>Напрямую</td>
                  </tr>
                  <tr>
                    <td>Офлайн QR-кит</td>
                    <td className="uppora-col"><span className="check">&#10003; Есть</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                  </tr>
                  <tr>
                    <td>Геймификация</td>
                    <td className="uppora-col"><span className="check">Ачивки + маскоты</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                  </tr>
                  <tr>
                    <td>НДФЛ для автора</td>
                    <td className="uppora-col"><span className="check">0% (дарение)</span></td>
                    <td>13%+</td>
                    <td>13%+</td>
                    <td>По стране</td>
                    <td>По стране</td>
                  </tr>
                  <tr>
                    <td>Онбординг</td>
                    <td className="uppora-col"><span className="check">Персональный</span></td>
                    <td>Self-serve</td>
                    <td>Self-serve</td>
                    <td>Self-serve</td>
                    <td>Self-serve</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="reveal" style={{ textAlign: 'center', marginTop: 14, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Данные из публичных тарифов платформ, март 2026. Комиссии включают все сборы.
            </p>
          </div>
        </section>

        {/* ===== S12: LEGAL MODEL ===== */}
        <section id="legal">
          <div className="container">
            <div className="section-header">
              <p className="label reveal">Юридическая модель</p>
              <h2 className="reveal stagger-1">Две модели. Мы выбрали ту,<br />что выгоднее автору.</h2>
            </div>
            <div className="legal-grid">
              <div className="legal-card bad reveal">
                <div className="card-tag">Стандартный путь</div>
                <h3>Оплата услуг</h3>
                <div className="flow-step"><span className="num">1</span> Донат отправляется</div>
                <div className="flow-step"><span className="num">2</span> Попадает на счёт платформы (ООО)</div>
                <div className="flow-step"><span className="num">3</span> Комиссия платформы 10–15%</div>
                <div className="flow-step"><span className="num">4</span> Удержание НДФЛ 13%</div>
                <div className="flow-step"><span className="num">5</span> Запрос на вывод средств</div>
                <div className="flow-step"><span className="num">6</span> Остаток доходит автору</div>
                <div className="legal-result">Потери: до 25–30% с каждого доната</div>
              </div>
              <div className="legal-card good reveal stagger-1">
                <div className="card-tag">Путь Uppora</div>
                <h3>Договор дарения</h3>
                <div className="flow-step"><span className="num">1</span> Донатер отправляет деньги</div>
                <div className="flow-step"><span className="num">2</span> Донат приходит в личный кабинет автора</div>
                <div className="flow-step"><span className="num">3</span> Автор выводит на карту — за минуты</div>
                <div className="legal-result" style={{ marginTop: 20 }}>
                  Основание: ст. 217 НК РФ<br />
                  НДФЛ: 0%<br />
                  Статус ИП/самозанятого: не нужен
                </div>
              </div>
            </div>
            <p className="reveal" style={{ textAlign: 'center', marginTop: 20, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              Дарение между физическими лицами не облагается НДФЛ по ст. 217 НК РФ, п. 18.1
            </p>
          </div>
        </section>

        {/* ===== S13: FAQ ===== */}
        <section id="faq" style={{ minHeight: 'auto' }}>
          <div className="container">
            <div className="section-header">
              <p className="label reveal">FAQ</p>
              <h2 className="reveal stagger-1">Частые вопросы</h2>
            </div>
            <div className="faq-list">
              <FAQItem q="Почему такая низкая комиссия?" a="Мы изначально хотели сделать сервис, который будет удобен и доступен авторам из разных ниш. Поэтому сделали комиссию максимально комфортной. В бете: 4,5% эквайринг + 3% платформа = 7,5% итого." />
              <FAQItem q="Есть ли отзывы?" a="Мы на стадии беты, набираем первую волну авторов. Пока отзывов немного, зато можно подключиться в числе первых и протестировать сервис на старте." />
              <FAQItem q="Почему подключаете к платформе сами?" a="Чтобы вам не пришлось разбираться в регистрации и настройках. Мы берём создание страницы на себя, всё настраиваем за пару минут. Персональный куратор на связи." />
              <FAQItem q="А что с налогами?" a="Донаты оформляются как договор дарения между физическими лицами. По ст. 217 НК РФ такие подарки не облагаются НДФЛ. Статус ИП или самозанятого не требуется." />
              <FAQItem q="На чём зарабатывает Uppora?" a="С каждой тысячи рублей мы получаем 30 ₽ (3%). Ещё 45 ₽ (4,5%) забирает банк за процессинг. Итого 7,5%. Никаких подписок и скрытых сборов." />
              <FAQItem q="Зачем мне дополнительный сервис для донатов?" a="Далеко не все готовы оформлять подписку. Часто человек хочет поддержать автора один раз, здесь и сейчас. Для этого и создана Uppora." />
              <FAQItem q="У меня уже есть Boosty / VK Донаты — нужно ли отключаться?" a="Нет. Uppora работает параллельно с другими сервисами. Можно использовать как дополнительный способ поддержки." />
              <FAQItem q="Как работает геймификация?" a="После каждого доната донатер получает персональное предсказание и ачивку. Маскоты автора и донатера встречаются с уникальной анимацией. Это мотивирует повторные донаты и генерирует виральный контент." />
              <FAQItem q="Можно ли вывести на зарубежную карту?" a="Пока нет, вывод доступен только на карту РФ. В будущем добавим другие варианты вывода." />
              <FAQItem q="Сколько времени занимает подключение?" a="Обычно несколько минут. Мы сами помогаем с настройкой, с вашей стороны максимально просто." />
            </div>
          </div>
        </section>

        {/* ===== S14: FINAL CTA ===== */}
        <section className="cta-section" id="cta">
          <div className="cta-glow" aria-hidden="true" />
          <div className="container cta-content">
            <p className="label reveal">Бета открыта</p>
            <h2 className="reveal stagger-1">
              30 авторов. Персональное подключение.<br />Старт на этой неделе.
            </h2>
            <p className="reveal stagger-2">
              Берём 30 авторов в первую волну — потому что каждому даём персонального куратора.
              Бесплатно на время беты. Без привязки — уйти можно в любой момент.
            </p>
            <div className="cta-actions reveal stagger-3">
              <a href="https://t.me/uppora" className="btn-primary" target="_blank" rel="noopener" style={{ padding: '20px 48px', fontSize: '1.1rem' }}>
                Занять место в бете
              </a>
              <a href="mailto:hello@uppora.org" className="btn-secondary" target="_blank" rel="noopener">
                Написать на почту
              </a>
            </div>
            <p className="cta-spots reveal stagger-4">Осталось мест в первой волне: 30</p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>Uppora &copy; 2026. Платформа QR-донатов для авторов. Платёжный партнёр — Т-Банк.</p>
          <nav className="footer-links">
            <a href="https://uppora.org">Главная</a>
            <a href="https://t.me/uppora" target="_blank" rel="noopener">Telegram</a>
            <a href="mailto:hello@uppora.org">Связаться</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
