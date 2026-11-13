/* Shared, locally hosted chapter globe for the homepage and Chapters page. */
(() => {
  const chapters = [
    {lat:47.52,lng:-122.05,name:"Issaquah, WA (HQ)",hq:true},
    {lat:37.33,lng:-121.89,name:"San Jose, CA"},
    {lat:38.68,lng:-121.17,name:"Folsom, CA"},
    {lat:37.55,lng:-122.05,name:"Fremont, CA"},
    {lat:27.95,lng:-82.46,name:"Tampa, FL"},
    {lat:28.54,lng:-81.38,name:"Orlando, FL"},
    {lat:34.05,lng:-84.07,name:"Suwanee, GA"},
    {lat:33.75,lng:-84.39,name:"Atlanta, GA"},
    {lat:41.88,lng:-87.63,name:"Chicago, IL"},
    {lat:42.36,lng:-71.06,name:"Massachusetts"},
    {lat:40.71,lng:-74.01,name:"New York City, NY"},
    {lat:35.79,lng:-78.78,name:"Cary, NC"},
    {lat:30.51,lng:-97.68,name:"Round Rock, TX"},
    {lat:47.82,lng:-122.28,name:"Lynwood, WA"},
    {lat:47.62,lng:-122.04,name:"Sammamish, WA"},
    {lat:47.52,lng:-121.83,name:"Snoqualmie, WA"},
    {lat:28.63,lng:77.22,name:"Delhi, India"},
    {lat:12.97,lng:77.59,name:"Bangalore, India"},
    {lat:27.71,lng:85.31,name:"Kathmandu, Nepal"},
    {lat:27.90,lng:84.00,name:"Nepal"},
    {lat:5.56,lng:-0.20,name:"Accra/Tema, Ghana"},
    {lat:30.38,lng:69.35,name:"Pakistan Chapter"},
    {lat:25.29,lng:51.53,name:"Doha, Qatar"},
    {lat:24.69,lng:46.72,name:"Saudi Arabia"},
    {lat:24.45,lng:54.40,name:"Abu Dhabi, UAE"}
  ];  document.querySelectorAll('#globeViz, #chGlobeViz').forEach(async container => {
    const fail = () => {
      container.innerHTML = '<p class="globe-status" role="status">The map could not load. <a href="chapters.html#ch-directory">Browse the chapter directory</a>.</p>';
    };
    if (typeof d3 === 'undefined' || typeof topojson === 'undefined') return fail();
    const request = new AbortController();
    const timeout = setTimeout(() => request.abort(), 12000);
    let world;
    try {
      const response = await fetch('data/countries-110m.json', { signal: request.signal });
      if (!response.ok) throw new Error('Map unavailable');
      world = await response.json();
    } catch { return fail(); }
    finally { clearTimeout(timeout); }

    container.replaceChildren();
    const W = 560, R = 244;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let paused = motion.matches, dragging = false, hovering = false, inView = false;
    let selected = null;
    const projection = d3.geoOrthographic().scale(R).translate([W / 2, W / 2]).rotate([100, -15, 0]);
    const path = d3.geoPath(projection);
    const svg = d3.select(container).append('svg')
      .attr('viewBox', `0 0 ${W} ${W}`).attr('width', '100%')
      .attr('role', 'group').attr('aria-label', 'Interactive chapter globe. Use the controls below to rotate or choose a chapter.');
    svg.append('circle').attr('cx', W / 2).attr('cy', W / 2).attr('r', R)
      .attr('class', 'globe-ocean').attr('fill', '#0c2944');
    const grid = svg.append('path').datum(d3.geoGraticule()())
      .attr('class', 'globe-graticule').attr('fill', 'none').attr('stroke', '#396488');
    const land = svg.append('path').datum(topojson.feature(world, world.objects.land))
      .attr('class', 'globe-land').attr('fill', '#397bad').attr('stroke', '#6ba1c6');
    const markers = svg.append('g');
    const caption = document.createElement('p');
    caption.className = 'globe-selection';
    caption.id = container.id + '-selection';
    caption.setAttribute('role', 'status');
    caption.textContent = 'Select a dot or choose a chapter to explore.';

    const controls = document.createElement('div');
    controls.className = 'globe-controls';
    const buttons = document.createElement('div');
    buttons.className = 'globe-buttons';
    function button(label, action) {
      const el = document.createElement('button');
      el.type = 'button'; el.textContent = label;
      el.addEventListener('click', action); buttons.append(el); return el;
    }
    function syncPause() { pause.textContent = paused ? 'Resume rotation' : 'Pause rotation'; }
    function stop() { paused = true; syncPause(); }
    function rotate(amount) {
      stop(); const rotation = projection.rotate(); rotation[0] += amount;
      projection.rotate(rotation); redraw();
    }
    button('Rotate left', () => rotate(-25));
    const pause = button('Pause rotation', () => { paused = !paused; syncPause(); });
    button('Rotate right', () => rotate(25));
    button('Reset view', () => {
      projection.rotate([100, -15, 0]); selected = null; select.value = '';
      caption.textContent = 'Select a dot or choose a chapter to explore.';
      paused = motion.matches; syncPause(); redraw();
    });
    const label = document.createElement('label');
    label.textContent = 'Find a chapter'; label.htmlFor = container.id + '-chapter';
    const select = document.createElement('select');
    select.id = label.htmlFor;
    const prompt = document.createElement('option'); prompt.value = ''; prompt.textContent = 'Choose a chapter';
    select.append(prompt);
    chapters.forEach((ch, index) => {
      const option = document.createElement('option'); option.value = String(index); option.textContent = ch.name;
      select.append(option);
    });
    function choose(ch) {
      stop(); selected = ch; select.value = String(chapters.indexOf(ch));
      projection.rotate([-ch.lng, -ch.lat, 0]); caption.textContent = ch.name;
      redraw();
    }
    select.addEventListener('change', () => {
      if (select.value !== '') choose(chapters[Number(select.value)]);
    });
    const dots = [...chapters].sort((a, b) => Number(!!a.hq) - Number(!!b.hq)).map(ch => {
      const dot = markers.append('circle').attr('class', 'globe-marker')
        .attr('r', ch.hq ? 6 : 4.5).attr('fill', ch.hq ? '#e7a640' : '#d7edfc')
        .attr('stroke', '#0c2944').attr('stroke-width', 1.5)
        .attr('tabindex', 0).attr('role', 'button').attr('aria-label', ch.name)
        .on('click', () => choose(ch))
        .on('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(ch); }
        })
        .on('mouseenter', () => { caption.textContent = ch.name; })
        .on('focus', () => { stop(); caption.textContent = ch.name; });
      dot.append('title').text(ch.name);
      return { ch, dot };
    });
    function redraw() {
      land.attr('d', path); grid.attr('d', path);
      const rotation = projection.rotate();
      dots.forEach(({ch, dot}) => {
        const visible = d3.geoDistance([ch.lng, ch.lat], [-rotation[0], -rotation[1]]) < Math.PI / 2;
        const point = projection([ch.lng, ch.lat]);
        dot.attr('cx', point[0]).attr('cy', point[1])
          .attr('r', selected === ch ? 7 : ch.hq ? 6 : 4.5)
          .attr('fill', selected === ch || ch.hq ? '#e7a640' : '#d7edfc')
          .style('display', visible ? null : 'none');
      });
    }
    svg.on('mouseenter', () => { hovering = true; }).on('mouseleave', () => { hovering = false; });
    svg.call(d3.drag().on('start', () => { dragging = true; stop(); })
      .on('drag', event => {
        const rotation = projection.rotate();
        projection.rotate([rotation[0] + event.dx * .4, Math.max(-75, Math.min(75, rotation[1] - event.dy * .4)), 0]);
        redraw();
      }).on('end', () => { dragging = false; }));
    controls.append(buttons, label, select);
    container.append(caption, controls);
    syncPause(); redraw();
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }).observe(container);
    motion.addEventListener('change', () => { if (motion.matches) stop(); });
    let last = 0;
    d3.timer(elapsed => {
      const delta = Math.min(elapsed - last, 100); last = elapsed;
      if (paused || dragging || hovering || !inView || document.hidden) return;
      const rotation = projection.rotate(); rotation[0] += delta * .0048;
      projection.rotate(rotation); redraw();
    });
  });
})();
