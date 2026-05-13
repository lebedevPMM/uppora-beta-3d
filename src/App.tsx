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
      <p className="calc-note">Бета: 7,5% итого (4,5% эквайринг + 3% платформа). У конкурентов: 10–15%.</p>
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
            <span className="brand-sub">Платформа для авторов</span>
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
            <a href="https://t.me/uppora" className="header-cta" target="_blank" rel="noopener">Создать страницу за минуту</a>
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
                Автору — благодарность.<br />
                Тем, кто ценит — <span className="accent">способ её передать.</span>
              </h1>
              <p className="hero-subtitle reveal stagger-2">
                Uppora — платформа для авторов и тех, кто их поддерживает. 7,5%&nbsp;комиссии вместо 13%,
                моментальный вывод на карту, без подписок. Регистрация за минуту, без паспорта и верификации.
                НДФЛ 0% через договор дарения.
              </p>
              <div className="hero-actions reveal stagger-3">
                <a href="https://t.me/uppora" className="btn-primary" target="_blank" rel="noopener">Создать страницу за минуту →</a>
                <a href="#steps" className="btn-secondary">Посмотреть, как работает</a>
              </div>
              <dl className="hero-stats reveal stagger-4">
                <div>
                  <dt className="hero-stat-value">7,5%</dt>
                  <dd className="hero-stat-label">Комиссия — вместо 13% у Boosty/Tribute</dd>
                </div>
                <div>
                  <dt className="hero-stat-value">За&nbsp;минуту</dt>
                  <dd className="hero-stat-label">Регистрация без паспорта и&nbsp;верификации</dd>
                </div>
                <div>
                  <dt className="hero-stat-value">0&nbsp;регистрации</dt>
                  <dd className="hero-stat-label">Для тех, кто хочет тебя поддержать</dd>
                </div>
                <div>
                  <dt className="hero-stat-value">0%&nbsp;НДФЛ</dt>
                  <dd className="hero-stat-label">Договор дарения, ст.&nbsp;217 НК&nbsp;РФ</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* ===== S2: PROBLEM ===== */}
        <section id="problem">
          <div className="container">
            <div className="section-header">
              <p className="label reveal">Знакомо?</p>
              <h2 className="reveal stagger-1">Что мешает автору<br />и&nbsp;тем, кто хочет&nbsp;его поддержать</h2>
            </div>
            <div className="problem-grid">
              <div className="problem-card reveal">
                <div className="problem-icon">&#x1F4B8;</div>
                <h3>13% уходит платформе</h3>
                <p>Из 1 000 &#x20BD; в руках автора 870. Остальное — комиссии платформы и эквайринг. За 12 месяцев это 18 000 &#x20BD; при доходе 12 000 &#x20BD;/мес.</p>
                <div className="uppora-answer">&#10003; Uppora: 7,5% итого. Из 1 000 &#x20BD; — 925 автору</div>
              </div>
              <div className="problem-card reveal stagger-1">
                <div className="problem-icon">&#x1F6AB;</div>
                <h3>Регистрация отпугивает</h3>
                <p>Тот, кто хочет поддержать, видит форму регистрации — и уходит. Половина не доводит донат до конца, и автор об этом не узнаёт.</p>
                <div className="uppora-answer">&#10003; Uppora: ноль регистрации. QR → сумма → готово</div>
              </div>
              <div className="problem-card reveal stagger-2">
                <div className="problem-icon">&#x1F4B3;</div>
                <h3>«Номер карты в описании» — риск и стыд</h3>
                <p>Банк видит входящие от незнакомых людей — карту замораживают. И автор каждый раз ловит себя на мысли «я просто прошу денег?»</p>
                <div className="uppora-answer">&#10003; Uppora: страница с QR и&nbsp;ссылкой. Договор дарения вместо «перевода на карту»</div>
              </div>
              <div className="problem-card reveal stagger-3">
                <div className="problem-icon">&#x1F504;</div>
                <h3>Поддержали — и&nbsp;пропали</h3>
                <p>Перевели — забыли. Никакой связи, никакого ответа автора, никакого повода вернуться через месяц.</p>
                <div className="uppora-answer">&#10003; Uppora: отчёт автора каждому, кто поддержал. Дофамин-механика и&nbsp;ачивки</div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== S3: HOW IT WORKS (self-serve) ===== */}
        <section id="steps">
          <div className="container">
            <div className="section-header">
              <p className="label reveal">Три шага</p>
              <h2 className="reveal stagger-1">Первая благодарность —<br />сегодня</h2>
            </div>
            <div className="steps-grid">
              <div className="step-card reveal">
                <div className="step-number">1</div>
                <h3>Зарегистрируйся за минуту</h3>
                <p>Простая форма: email или телефон. Без паспорта, без верификации. Сразу получаешь свой кабинет автора.</p>
                <div className="step-detail">Без загрузки документов</div>
              </div>
              <div className="step-card reveal stagger-1">
                <div className="step-number">2</div>
                <h3>Настрой свою страницу</h3>
                <p>Имя, фото, описание, карта для выплат. Получаешь ссылку и QR-код для офлайна. Можешь открыть проект с целью или принимать благодарность общей суммой.</p>
                <div className="step-detail">Всё редактируется в&nbsp;любой момент</div>
              </div>
              <div className="step-card reveal stagger-2">
                <div className="step-number">3</div>
                <h3>Делись ссылкой и&nbsp;принимай благодарность</h3>
                <p>Тот, кто хочет поддержать, сканирует QR или открывает ссылку → вводит сумму → готово. У тебя — благодарность в кабинете, имя того, кто поддержал, его комментарий, отчёт.</p>
                <div className="step-detail">Вывод через Т-Банк — за&nbsp;минуты</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 40 }} className="reveal">
              <a href="https://t.me/uppora" className="btn-primary" target="_blank" rel="noopener">Создать страницу за минуту →</a>
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
                  Мы получаем 30 &#x20BD; с каждой тысячи. Без подписок, без сборов за контент.
                  30 рублей — наш единственный доход. Остальное — банковский эквайринг.
                </p>
                <p className="reveal stagger-3" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  Бета: 3% платформа + 4,5% эквайринг = 7,5% итого.<br />
                  У конкурентов: Boosty ~11,7%, Tribute ~10%, DonationAlerts ~12%, Patreon ~13–15%.
                </p>
              </div>
              <div className="reveal stagger-2">
                <Calculator />
              </div>
            </div>
          </div>
        </section>

        {/* ===== S5: MECHANIC 02 — DOFAMIN ===== */}
        <section id="gamification">
          <div className="container">
            <div className="hyp-layout">
              <div>
                <div className="hyp-number reveal">02 ДОФАМИН</div>
                <h2 className="hyp-title reveal stagger-1">Благодарность как<br /><span className="accent">маленькое событие</span></h2>
                <p className="hyp-desc reveal stagger-2">
                  После каждой поддержки тот, кто поддержал, получает что-то, что хочется сохранить.
                  Анимация. Фраза. Ачивка в коллекцию. Это превращает перевод в момент — и в&nbsp;повод поделиться.
                </p>
                <ul className="hyp-features reveal stagger-3">
                  <li>Персональная фраза или афоризм после доната — как печенька с запиской</li>
                  <li>Ачивки за паттерны (первая поддержка, поддержал трёх авторов, ночной донат)</li>
                  <li>Кастомизация дофамин-механики автором — твой стиль, твоё лицо</li>
                  <li>Каждый момент уникален — повод поделиться</li>
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

        {/* ===== S6: MECHANIC 01 — TRANSPARENCY ===== */}
        <section id="transparency">
          <div className="container">
            <div className="hyp-layout reverse">
              <div>
                <div className="hyp-number reveal">01 ПРОЗРАЧНОСТЬ</div>
                <h2 className="hyp-title reveal stagger-1">Каждый рубль виден<br /><span className="accent-gold">до копейки</span></h2>
                <p className="hyp-desc reveal stagger-2">
                  Кто поддержал, на сколько, куда пошли деньги — видно в кабинете автора.
                  И в персональном отчёте того, кто поддержал. Прозрачность повышает доверие,
                  а доверие — средний чек.
                </p>
                <ul className="hyp-features reveal stagger-3">
                  <li>Разбивка каждого перевода: 92,5% автору / 4,5% банк / 3% Uppora</li>
                  <li>Персональный отчёт: «Твоя поддержка помогла Маше выпустить три подкаста»</li>
                  <li>Автор отвечает на каждую благодарность лично</li>
                  <li>Прозрачные цели проекта: «собираем на X, собрано Y из Z»</li>
                </ul>
              </div>
              <TransparencyVisual />
            </div>
          </div>
        </section>

        {/* ===== S7: MECHANIC 05 — MASCOTS ===== */}
        <section id="mascots">
          <div className="container">
            <div className="hyp-layout">
              <div>
                <div className="hyp-number reveal">05 МАСКОТЫ</div>
                <h2 className="hyp-title reveal stagger-1">Капибары, которые<br /><span style={{ color: 'var(--blue)' }}>встречают благодарность</span></h2>
                <p className="hyp-desc reveal stagger-2">
                  Настраиваешь капибару проекта — характер, аксессуары. При каждой поддержке
                  капибара автора и капибара того, кто поддержал, встречаются: обнимаются, пляшут,
                  дарят цветы. Анимация уникальная, её хочется записать и поделиться.
                </p>
                <ul className="hyp-features reveal stagger-3">
                  <li>Маскот — лицо проекта. Ты выбираешь внешний вид</li>
                  <li>Капибара того, кто поддержал, растёт с каждым переводом (кепочки, шарф, шляпа)</li>
                  <li>Анимация встречи при каждом переводе — уникальная и виральная</li>
                  <li>Те, кто поддержал, записывают и шарят — органический охват</li>
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

        {/* ===== S8: MECHANIC 03 — COMMUNITY ===== */}
        <section id="social">
          <div className="container">
            <div className="hyp-layout reverse">
              <div>
                <div className="hyp-number reveal">03 СООБЩЕСТВО</div>
                <h2 className="hyp-title reveal stagger-1">Тебя находят через тех,<br /><span style={{ color: 'var(--pink)' }}>кто тебя уже поддержал</span></h2>
                <p className="hyp-desc reveal stagger-2">
                  У каждого, кто поддержал автора, есть профиль с историей поддержки. Люди видят, кого
                  поддерживают их друзья, и открывают новых авторов. Это discovery-канал, которого нет
                  на Boosty, Tribute и DonationAlerts.
                </p>
                <ul className="hyp-features reveal stagger-3">
                  <li>Каждый пользователь становится автором дефолтного проекта — нет барьера</li>
                  <li>Профиль поддержавшего с историей: кому, сколько, какие ачивки собраны</li>
                  <li>Discovery: новые авторы через профили твоих сторонников</li>
                  <li>Рейтинг авторов (Reddit-style — без минусов у автора, с минусами у комментов)</li>
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

        {/* ===== S8b: MECHANIC 04 — AUTHOR TOOLS ===== */}
        <section id="tools">
          <div className="container">
            <div className="hyp-layout">
              <div>
                <div className="hyp-number reveal">04 ИНСТРУМЕНТЫ</div>
                <h2 className="hyp-title reveal stagger-1">Под твою механику<br /><span className="accent-gold">работы с аудиторией</span></h2>
                <p className="hyp-desc reveal stagger-2">
                  Один шаблон сбора на всех не подходит. Конструкторы под твою историю:
                  ачивки за цели проекта, кастомные CTA, проекты с дедлайном, автовывод,
                  отчёты по расписанию.
                </p>
                <ul className="hyp-features reveal stagger-3">
                  <li>Проекты с ограничением по сроку — для конкретных кампаний</li>
                  <li>Конструктор ачивок: ты решаешь, за что благодаришь сторонников</li>
                  <li>Автовывод по расписанию или порогу — деньги не зависают</li>
                  <li>Купоны от партнёров-бизнесов за ачивки <em>(в&nbsp;разработке)</em></li>
                </ul>
              </div>
              <div className="hyp-visual tools-visual reveal" aria-hidden="true">
                <div className="tools-card">
                  <div className="tools-card-title">Конструктор ачивки</div>
                  <div className="tools-card-row"><span>Название</span><span className="tools-card-value">Полночный донат</span></div>
                  <div className="tools-card-row"><span>Условие</span><span className="tools-card-value">Донат 00:00–04:00</span></div>
                  <div className="tools-card-row"><span>Награда</span><span className="tools-card-value">Шляпа капибаре</span></div>
                </div>
                <div className="tools-card">
                  <div className="tools-card-title">Автовывод</div>
                  <div className="tools-card-row"><span>Порог</span><span className="tools-card-value">5 000 &#x20BD;</span></div>
                  <div className="tools-card-row"><span>Карта</span><span className="tools-card-value">****&nbsp;7821</span></div>
                  <div className="tools-card-row"><span>Статус</span><span className="tools-card-value" style={{ color: 'var(--teal)' }}>Включён</span></div>
                </div>
                <div className="tools-card">
                  <div className="tools-card-title">Проект с дедлайном</div>
                  <div className="tools-card-row"><span>Цель</span><span className="tools-card-value">50 000 &#x20BD;</span></div>
                  <div className="tools-card-row"><span>Собрано</span><span className="tools-card-value">32 400 &#x20BD;</span></div>
                  <div className="tools-card-row"><span>До конца</span><span className="tools-card-value">12 дней</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== S9: ROADMAP (3 phases: MVP / Beta / Release) ===== */}
        <section id="releases" style={{ minHeight: 'auto' }}>
          <div className="container">
            <div className="section-header">
              <p className="label reveal">Куда идём</p>
              <h2 className="reveal stagger-1">Что есть сейчас —<br />и что добавим</h2>
              <p className="reveal stagger-2">Бета — это не финал. Это поле, на котором мы вместе с авторами строим то, чего нигде нет.</p>
            </div>

            {/* MVP */}
            <div className="release-phase reveal">
              <div className="release-header">
                <div className="release-badge done">&#10003;</div>
                <div>
                  <div className="release-label">MVP — готово</div>
                  <h3>Фундамент</h3>
                </div>
              </div>
              <div className="features-grid">
                {[
                  { icon: '&#x1F4B3;', cls: 'teal', title: 'Приём поддержки', desc: 'QR-код, ссылка, офлайн-кит. Оплата через Т-Банк.' },
                  { icon: '&#x1F464;', cls: 'gold', title: 'Личный кабинет автора', desc: 'Баланс, история, вывод на карту за минуты.' },
                  { icon: '&#x1F512;', cls: 'teal', title: 'Вход без регистрации', desc: 'Регистрация автора. Тому, кто поддерживает, регистрация не&nbsp;нужна.' },
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

            {/* BETA — now */}
            <div className="release-phase reveal">
              <div className="release-header">
                <div className="release-badge active">&#x1F6A7;</div>
                <div>
                  <div className="release-label active-label">Beta — сейчас, в разработке</div>
                  <h3>Прозрачность, дофамин, сообщество</h3>
                </div>
              </div>
              <div className="features-grid">
                {[
                  { icon: '&#x1F4CB;', cls: 'teal', title: 'Прозрачные отчёты', desc: 'После каждой поддержки — разбивка до копейки и персональный отчёт.' },
                  { icon: '&#x1F36A;', cls: 'gold', title: 'Ачивки и дофамин-механика', desc: 'Персональная фраза и ачивка в коллекцию — превращают перевод в момент.' },
                  { icon: '&#x1F43E;', cls: 'blue', title: 'Маскоты-капибары', desc: 'Капибары автора и поддержавшего встречаются с уникальной анимацией.' },
                  { icon: '&#x26A1;', cls: 'purple', title: 'Регистрация за минуту', desc: 'Простая форма. Без паспорта и верификации.' },
                  { icon: '&#x1F4F1;', cls: 'pink', title: 'PWA', desc: 'Устанавливается в один тап, без App Store.' },
                  { icon: '&#x1F4AC;', cls: 'blue', title: 'Комментарии и ответы автора', desc: 'Диалог, не анонимный перевод.' },
                  { icon: '&#x1F514;', cls: 'teal', title: 'Push-уведомления', desc: 'О новых поддержках и ответах — ты узнаёшь первым.' },
                  { icon: '&#x1F465;', cls: 'pink', title: 'Профили поддерживающих', desc: 'История поддержки, ачивки, открытые проекты.' },
                  { icon: '&#x1F6E1;', cls: 'gold', title: 'LLM-модерация контента', desc: 'Автоматическая проверка публичных проектов перед публикацией.' },
                  { icon: '&#x23F3;', cls: 'teal', title: 'Проекты с дедлайном', desc: 'Ограничение по сроку — для конкретных кампаний.' },
                  { icon: '&#x1F4B8;', cls: 'gold', title: 'Автовывод', desc: 'По расписанию или порогу — деньги не зависают на балансе.' },
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
                  <div className="release-label future-label">Релиз — следующий этап</div>
                  <h3>Экосистема: discovery, бренды, новые форматы</h3>
                </div>
              </div>
              <div className="features-grid">
                {[
                  { icon: '&#x1F310;', cls: 'purple', title: 'Каталог авторов', desc: 'Алгоритм рекомендаций. Новые авторы через категории и интересы.' },
                  { icon: '&#x1F50E;', cls: 'blue', title: 'Перекрёстное опыление', desc: 'Видишь, кого ещё поддерживает твой автор. Discovery через профили.' },
                  { icon: '&#x1F9F0;', cls: 'gold', title: 'Конструктор кастомных механик', desc: 'Автор сам решает, за что благодарить сторонников.' },
                  { icon: '&#x1F39F;', cls: 'pink', title: 'Купоны от партнёров', desc: 'Бизнес-купоны за ачивки и переводы — региональная привязка.' },
                  { icon: '&#x2B50;', cls: 'gold', title: 'Рейтинг авторов и комментариев', desc: 'Reddit-style — без минусов у автора, с минусами у комментов.' },
                  { icon: '&#x1F4E2;', cls: 'purple', title: 'White PR', desc: 'Поддержка тех, кто выходит в публичное поле через благотворительные кампании. Направление для авторов уровня&nbsp;pro.' },
                  { icon: '&#x1F4E6;', cls: 'teal', title: 'Packaged charity projects', desc: 'Готовые проекты-меню для тех, кому донаты приходят без проекта.' },
                  { icon: '&#x1F517;', cls: 'teal', title: 'API для интеграций', desc: 'Виджет на сайт, Telegram-бот, стримы.' },
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
              <h2 className="reveal stagger-1">Больше денег автору.<br />Меньше барьеров поддерживающим.</h2>
            </div>
            <div className="comparison-table-wrap reveal">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Параметр</th>
                    <th className="uppora-col">Uppora</th>
                    <th>Boosty</th>
                    <th>Tribute</th>
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
                    <td>~10%</td>
                    <td>~12%</td>
                    <td>~13–15%</td>
                    <td>~3–8%</td>
                  </tr>
                  <tr>
                    <td>Регистрация поддержавшего</td>
                    <td className="uppora-col"><span className="check">Не нужна</span></td>
                    <td><span className="cross">Нужна</span></td>
                    <td><span className="cross">Нужна</span></td>
                    <td><span className="cross">Нужна</span></td>
                    <td><span className="cross">Нужна</span></td>
                    <td><span className="cross">PayPal/Stripe</span></td>
                  </tr>
                  <tr>
                    <td>Скорость выплат</td>
                    <td className="uppora-col"><span className="check">За минуты</span></td>
                    <td>1–5 дней</td>
                    <td>3–7 дней</td>
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
                    <td><span className="cross">&#10007;</span></td>
                  </tr>
                  <tr>
                    <td>Прозрачные отчёты</td>
                    <td className="uppora-col"><span className="check">&#10003; Есть</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                  </tr>
                  <tr>
                    <td>Дофамин-механика и ачивки</td>
                    <td className="uppora-col"><span className="check">&#10003; Есть</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                  </tr>
                  <tr>
                    <td>Discovery через профили</td>
                    <td className="uppora-col"><span className="check">&#10003; Есть</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td><span className="cross">&#10007;</span></td>
                    <td>Частично</td>
                    <td><span className="cross">&#10007;</span></td>
                  </tr>
                  <tr>
                    <td>НДФЛ для автора</td>
                    <td className="uppora-col"><span className="check">0% (дарение)</span></td>
                    <td>13%+</td>
                    <td>13%+</td>
                    <td>13%+</td>
                    <td>По стране</td>
                    <td>По стране</td>
                  </tr>
                  <tr>
                    <td>Вход без верификации</td>
                    <td className="uppora-col"><span className="check">За минуту, без паспорта</span></td>
                    <td>Self-serve</td>
                    <td>Self-serve</td>
                    <td>Self-serve</td>
                    <td>Self-serve</td>
                    <td>Self-serve</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="reveal" style={{ textAlign: 'center', marginTop: 14, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Данные из публичных тарифов платформ, май 2026. Комиссии включают все сборы.
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
                <div className="flow-step"><span className="num">1</span> Поддержка отправляется</div>
                <div className="flow-step"><span className="num">2</span> Попадает на счёт платформы (ООО)</div>
                <div className="flow-step"><span className="num">3</span> Комиссия платформы 10–15%</div>
                <div className="flow-step"><span className="num">4</span> Удержание НДФЛ 13%</div>
                <div className="flow-step"><span className="num">5</span> Запрос на вывод средств</div>
                <div className="flow-step"><span className="num">6</span> Остаток доходит автору</div>
                <div className="legal-result">Потери: до 25–30% с каждого перевода</div>
              </div>
              <div className="legal-card good reveal stagger-1">
                <div className="card-tag">Путь Uppora</div>
                <h3>Договор дарения</h3>
                <div className="flow-step"><span className="num">1</span> Тот, кто поддерживает, отправляет деньги</div>
                <div className="flow-step"><span className="num">2</span> Деньги приходят в кабинет автора на Uppora</div>
                <div className="flow-step"><span className="num">3</span> Автор выводит на карту — за минуты</div>
                <div className="legal-result" style={{ marginTop: 20 }}>
                  Основание: ст. 217 НК РФ, п. 18.1<br />
                  НДФЛ: 0%<br />
                  Статус ИП/самозанятого: не нужен<br />
                  Итого комиссия: 7,5% (4,5% эквайринг + 3% платформа)
                </div>
              </div>
            </div>
            <p className="reveal" style={{ textAlign: 'center', marginTop: 20, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              Дарение между физическими лицами не облагается НДФЛ по ст. 217 НК РФ, п. 18.1
            </p>
          </div>
        </section>

        {/* ===== S12b: FOUNDER ===== */}
        <section id="founder" style={{ minHeight: 'auto' }}>
          <div className="container">
            <div className="section-header">
              <p className="label reveal">Команда</p>
            </div>
            <div className="founder-card reveal">
              <div className="founder-avatar" aria-hidden="true">ИП</div>
              <div className="founder-body">
                <div className="founder-label">Основатель</div>
                <blockquote className="founder-quote">
                  «Платформы для донатов делают одну вещь — переводят деньги. Я хотел сделать другое:
                  место, где автор и те, кто его поддерживает, остаются связанными после перевода.
                  Где благодарность — это начало, а не конец. Поэтому Uppora — это не только рельсы,
                  это сообщество и инструменты, которые помогают автору расти. Мы строим продукт вместе
                  с авторами беты — каждая новая механика тестируется с ними до запуска.»
                </blockquote>
                <div className="founder-name">Илья Панов</div>
                <div className="founder-role">Основатель Uppora</div>
              </div>
            </div>
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
              <FAQItem q="Зачем мне ещё одна платформа для донатов?" a="Uppora не «ещё одна платформа». Это сообщество авторов + прозрачные переводы. Мы не заменяем Boosty или Tribute, но даём другой формат отношений с аудиторией: где тот, кто тебя поддержал, видит, что произошло с его деньгами, и где у тебя есть инструменты, чтобы строить сообщество, а не просто собирать переводы." />
              <FAQItem q="Почему такая комиссия — 7,5%?" a="4,5% забирает банк за процессинг — это эквайринг, его никто не обойдёт. 3% — наш доход с платформы. Никаких подписок, никаких скрытых сборов, никаких комиссий за контент. На рынке: Boosty ~11,7%, Tribute ~10%, DonationAlerts ~12%, Patreon ~13–15%." />
              <FAQItem q="А что с налогами?" a="Поддержка оформляется как договор дарения между физическими лицами. По ст. 217 НК РФ, п. 18.1, такие подарки не облагаются НДФЛ. Статус ИП или самозанятого не требуется." />
              <FAQItem q="Я работаю офлайн — на ярмарке, на выступлении, на улице. Это для меня?" a="Да. Uppora — первый сервис разовых переводов, заточенный под авторов и творческих людей, а не под рестораны. После регистрации получаешь страницу, ссылку и QR-код. Гость сканирует — благодарность сразу на твоей странице." />
              <FAQItem q="Регистрация — это сложно? Нужен паспорт?" a="Нет. Регистрация за минуту через простую форму. Без паспорта, без верификации, без бюрократии. Имя, фото, карта для выплат — и страница готова. Если есть вопросы, пиши Виктории в Telegram — она помогает авторам с публикацией и развитием канала." />
              <FAQItem q="У меня уже есть Boosty / Tribute — нужно ли отключаться?" a="Нет. Uppora работает параллельно. Boosty/Tribute — для подписок, Uppora — для разовой благодарности. 30–40% твоей аудитории не подписываются, но готовы поддержать разово. Это деньги, которые ты сейчас не получаешь." />
              <FAQItem q="Как работают ачивки и дофамин-механика?" a="После каждой поддержки тот, кто поддержал, получает персональную фразу + ачивку в коллекцию. Капибары автора и поддержавшего встречаются с анимацией. Это превращает перевод в момент, которым хочется поделиться. Автор настраивает механику под свой стиль." />
              <FAQItem q="Что такое прозрачные отчёты?" a="Тот, кто поддержал, видит, что произошло с его деньгами: сколько автору, банку, Uppora. Видит, на что пошли средства, если открыт проект с целью. Получает персональный отчёт. Это поднимает средний чек и снижает «пост-донат сомнения»." />
              <FAQItem q="Можно ли вывести на зарубежную карту?" a="Пока нет — вывод доступен только на карты РФ через Т-Банк. В планах — расширение вариантов." />
              <FAQItem q="Сколько времени занимает подключение?" a="Минута через простую форму регистрации. Без паспорта и верификации. После входа — заполняешь имя, фото, описание, привязываешь карту. Страница и QR готовы сразу." />
              <FAQItem q="Что с моими данными?" a="Стандартно: SSL, PCI DSS на стороне Т-Банка, договор-оферта. Личные данные нужны только для выплат. Контент проектов проходит автоматическую LLM-модерацию перед публикацией — это про соблюдение оферты, не цензура." />
              <FAQItem q="На чём вы будете зарабатывать в будущем?" a="Сейчас — 3% с перевода. В будущем добавим купоны от партнёров-бизнесов (бизнес платит за visibility), пакетные проекты для авторов с «нереализованной помощью», услуги поддержки публичных кампаний. Подписку с автора брать не будем." />
            </div>
          </div>
        </section>

        {/* ===== S14: FINAL CTA ===== */}
        <section className="cta-section" id="cta">
          <div className="cta-glow" aria-hidden="true" />
          <div className="container cta-content">
            <p className="label reveal">Бета открыта</p>
            <h2 className="reveal stagger-1">
              30 авторов в первую волну.<br />Founding Creator навсегда.
            </h2>
            <p className="reveal stagger-2">
              Берём 30 авторов в первую бета-волну. Каждому — Founding Creator бейдж навсегда,
              ранний доступ к новым механикам по мере выхода, прямая связь с командой Uppora.
              Подключение бесплатное, без привязки — уйти можно в любой момент.
            </p>
            <div className="cta-actions reveal stagger-3">
              <a href="https://t.me/uppora" className="btn-primary" target="_blank" rel="noopener" style={{ padding: '20px 48px', fontSize: '1.1rem' }}>
                Занять место в бете (осталось 30)
              </a>
              <a href="mailto:hello@uppora.org" className="btn-secondary" target="_blank" rel="noopener">
                Написать на почту
              </a>
            </div>
            <p className="cta-spots reveal stagger-4">Founding Creator бейдж — навсегда</p>
          </div>
        </section>

      </main>

      {/* Sticky mobile bar */}
      <a href="https://t.me/uppora" className="sticky-bar" target="_blank" rel="noopener" aria-label="Создать страницу">
        <strong>7,5% вместо 13%.</strong> Страница за минуту →
      </a>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p className="footer-tagline">Платформа для авторов и тех, кто их поддерживает.</p>
          <p>Uppora &copy; 2026. Платёжный партнёр — Т-Банк.</p>
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
