(function(){
  const API_URL = "https://api.open-meteo.com/v1/forecast?latitude=-17.825417&longitude=-63.138583&hourly=temperature_2m,wind_speed_10m,soil_temperature_6cm,relative_humidity_2m,rain,precipitation,precipitation_probability&timezone=auto";

  const statusEl = document.getElementById('status');
  const contentEl = document.getElementById('content');
  const refreshBtn = document.getElementById('refresh-btn');

  refreshBtn.addEventListener('click', load);
  load();

  function load(){
    statusEl.textContent = '⏳ Cargando datos de Open‑Meteo…';
    statusEl.classList.remove('error');
    contentEl.classList.remove('ready');

    fetch(API_URL)
      .then(res => {
        if(!res.ok) throw new Error('Respuesta ' + res.status);
        return res.json();
      })
      .then(render)
      .catch(err => {
        const isFileProtocol = window.location.protocol === 'file:';
        let msg = '⚠️ No se pudo cargar el clima (' + err.message + ').';
        if(isFileProtocol){
          msg += ' Esto suele pasar cuando el navegador bloquea peticiones a internet desde un archivo abierto con doble clic. ' +
                 'Prueba sirviendo la carpeta con un servidor local (por ejemplo "python3 -m http.server" dentro de la carpeta y abrir ' +
                 'http://localhost:8000/), o ábrelo en Firefox.';
        } else {
          msg += ' Revisa tu conexión a internet y vuelve a intentar.';
        }
        statusEl.textContent = msg;
        statusEl.classList.add('error');
      });
  }

  function render(data){
    const h = data.hourly;
    const times = h.time.map(t => new Date(t));
    const now = new Date();

    // índice de la hora actual (o la próxima más cercana)
    let idx = times.findIndex(t => t >= now);
    if(idx === -1) idx = 0;
    if(idx > 0 && (now - times[idx-1]) < (times[idx] - now)) idx = idx - 1;

    const slice = (arr) => arr.slice(idx, idx + 24);

    const temp = h.temperature_2m;
    const wind = h.wind_speed_10m;
    const soil = h.soil_temperature_6cm;
    const hum = h.relative_humidity_2m;
    const rain = h.rain;
    const precip = h.precipitation;
    const prob = h.precipitation_probability;

    // ---- Hero ----
    const cond = describe(rain[idx], prob[idx]);
    document.getElementById('hero-emoji').textContent = cond.emoji;
    document.getElementById('hero-temp').textContent = fmt(temp[idx], 1);
    document.getElementById('hero-desc').textContent = cond.text;
    document.getElementById('hero-time').textContent = times[idx].toLocaleString('es-BO', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    });

    // ---- Cards ----
    const cards = [
      { kind:'humidity', emoji:'💧', label:'Humedad relativa', value: hum[idx], unit:'%',    series: slice(hum),    decimals:0 },
      { kind:'soil',     emoji:'🌱', label:'Temp. suelo (6cm)', value: soil[idx], unit:'°C',  series: slice(soil),   decimals:1 },
      { kind:'rainprob', emoji:'🌦️', label:'Prob. de lluvia',   value: prob[idx], unit:'%',   series: slice(prob),   decimals:0 },
      { kind:'precip',   emoji:'🌧️', label:'Precipitación',     value: precip[idx], unit:'mm', series: slice(precip), decimals:1 },
      { kind:'rain',     emoji:'☔',  label:'Lluvia',            value: rain[idx], unit:'mm',   series: slice(rain),   decimals:1 },
      { kind:'wind',     emoji:'💨', label:'Velocidad del viento', value: wind[idx], unit:'km/h', series: slice(wind), decimals:1 },
    ];

    const grid = document.getElementById('stat-grid');
    grid.innerHTML = '';
    cards.forEach(c => grid.appendChild(buildCard(c)));

    // ---- Hourly chart ----
    buildHourlyChart(slice(times), slice(temp), slice(prob));
    const tRange = slice(times);
    document.getElementById('hourly-range').textContent =
      tRange[0].toLocaleTimeString('es-BO', {hour:'2-digit', minute:'2-digit'}) + ' – ' +
      tRange[tRange.length-1].toLocaleTimeString('es-BO', {hour:'2-digit', minute:'2-digit'});

    document.getElementById('last-updated').textContent =
      '🔄 Actualizado ' + new Date().toLocaleTimeString('es-BO', {hour:'2-digit', minute:'2-digit'});

    statusEl.textContent = '';
    contentEl.classList.add('ready');
  }

  function describe(rainVal, probVal){
    if(rainVal > 2) return { text:'Lluvia fuerte', emoji:'⛈️' };
    if(rainVal > 0.2) return { text:'Lluvia moderada', emoji:'🌧️' };
    if(rainVal > 0) return { text:'Llovizna', emoji:'🌦️' };
    if(probVal >= 70) return { text:'Alta probabilidad de lluvia', emoji:'🌥️' };
    if(probVal >= 40) return { text:'Posible lluvia', emoji:'⛅' };
    return { text:'Sin lluvia', emoji:'☀️' };
  }

  function fmt(n, decimals){
    if(n === null || n === undefined || isNaN(n)) return '—';
    return n.toFixed(decimals);
  }

  function buildCard(c){
    const el = document.createElement('div');
    el.className = 'card';
    el.dataset.kind = c.kind;

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = c.emoji + ' ' + c.label;

    const value = document.createElement('div');
    value.className = 'value';
    value.innerHTML = fmt(c.value, c.decimals) + '<span class="u">' + c.unit + '</span>';

    const spark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    spark.setAttribute('class', 'spark');
    spark.setAttribute('viewBox', '0 0 100 26');
    spark.setAttribute('preserveAspectRatio', 'none');
    drawSpark(spark, c.series);

    const caption = document.createElement('div');
    caption.className = 'spark-caption';
    caption.textContent = 'próximas 24h';

    el.appendChild(label);
    el.appendChild(value);
    el.appendChild(spark);
    el.appendChild(caption);
    return el;
  }

  function drawSpark(svg, series){
    const vals = series.filter(v => v !== null && v !== undefined && !isNaN(v));
    if(vals.length === 0) return;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = (max - min) || 1;
    const step = 100 / (series.length - 1 || 1);

    const points = series.map((v, i) => {
      const x = i * step;
      const y = 24 - ((v - min) / range) * 22 - 1;
      return x + ',' + y;
    }).join(' ');

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    poly.setAttribute('points', points);
    poly.setAttribute('fill', 'none');
    poly.setAttribute('stroke', '#ffffff');
    poly.setAttribute('stroke-width', '2');
    poly.setAttribute('opacity', '0.85');
    svg.appendChild(poly);
  }

  function buildHourlyChart(times, temps, probs){
    const svg = document.getElementById('hourly-chart');
    svg.innerHTML = '';
    const W = 920, H = 220;
    const padL = 34, padR = 12, padT = 16, padB = 30;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const n = times.length;
    const step = plotW / (n - 1 || 1);

    const validTemps = temps.filter(v => v !== null && !isNaN(v));
    const tMin = Math.min(...validTemps) - 1;
    const tMax = Math.max(...validTemps) + 1;
    const tRange = (tMax - tMin) || 1;

    const ns = 'http://www.w3.org/2000/svg';
    const rootStyles = getComputedStyle(document.documentElement);
    const inkFaint = rootStyles.getPropertyValue('--ink-faint').trim();
    const line = rootStyles.getPropertyValue('--line').trim();
    const accentTemp = rootStyles.getPropertyValue('--accent-temp').trim();
    const accentRainprob = rootStyles.getPropertyValue('--accent-rainprob').trim();

    // grid lines (horizontal, 3 divisions)
    for(let i = 0; i <= 2; i++){
      const y = padT + (plotH * i / 2);
      const gline = document.createElementNS(ns, 'line');
      gline.setAttribute('x1', padL); gline.setAttribute('x2', W - padR);
      gline.setAttribute('y1', y); gline.setAttribute('y2', y);
      gline.setAttribute('stroke', line);
      gline.setAttribute('stroke-width', '1');
      svg.appendChild(gline);
    }

    // precipitation probability bars (bottom-aligned within plot area, max height 40% of plotH)
    const barMaxH = plotH * 0.4;
    probs.forEach((p, i) => {
      const val = (p === null || isNaN(p)) ? 0 : p;
      const bh = (val / 100) * barMaxH;
      const x = padL + i * step;
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', x - Math.min(step * 0.32, 8));
      rect.setAttribute('y', padT + plotH - bh);
      rect.setAttribute('width', Math.min(step * 0.64, 16));
      rect.setAttribute('height', bh);
      rect.setAttribute('fill', accentRainprob);
      rect.setAttribute('opacity', '0.4');
      rect.setAttribute('rx', '3');
      svg.appendChild(rect);
    });

    // temperature line
    const pts = temps.map((v, i) => {
      const x = padL + i * step;
      const val = (v === null || isNaN(v)) ? tMin : v;
      const y = padT + plotH - ((val - tMin) / tRange) * plotH;
      return [x, y];
    });

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', buildSmoothPath(pts));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', accentTemp);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);

    // temp dots + labels every 3 hours
    pts.forEach((p, i) => {
      if(i % 3 !== 0 && i !== n - 1) return;
      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', p[0]); circle.setAttribute('cy', p[1]);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', accentTemp);
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '1.5');
      svg.appendChild(circle);

      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', p[0]);
      label.setAttribute('y', p[1] - 12);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-family', 'Poppins, sans-serif');
      label.setAttribute('font-weight', '600');
      label.setAttribute('font-size', '11');
      label.setAttribute('fill', accentTemp);
      label.textContent = fmt(temps[i], 0) + '°';
      svg.appendChild(label);

      const hourLabel = document.createElementNS(ns, 'text');
      hourLabel.setAttribute('x', p[0]);
      hourLabel.setAttribute('y', H - 8);
      hourLabel.setAttribute('text-anchor', 'middle');
      hourLabel.setAttribute('font-family', 'Poppins, sans-serif');
      hourLabel.setAttribute('font-size', '10.5');
      hourLabel.setAttribute('fill', inkFaint);
      hourLabel.textContent = times[i].toLocaleTimeString('es-BO', {hour:'2-digit'});
      svg.appendChild(hourLabel);
    });
  }

  function buildSmoothPath(pts){
    if(pts.length < 2) return '';
    let d = 'M ' + pts[0][0] + ' ' + pts[0][1];
    for(let i = 0; i < pts.length - 1; i++){
      const p0 = pts[i], p1 = pts[i+1];
      const mx = (p0[0] + p1[0]) / 2;
      d += ' Q ' + p0[0] + ' ' + p0[1] + ' ' + mx + ' ' + (p0[1]+p1[1])/2;
    }
    d += ' T ' + pts[pts.length-1][0] + ' ' + pts[pts.length-1][1];
    return d;
  }
})();
