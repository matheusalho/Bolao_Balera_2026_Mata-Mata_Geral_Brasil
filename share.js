/* ============================================================================
 * share.js — Card de compartilhamento dos palpites (Bolão Balera 2026 Mata-Mata)
 * Gera a imagem no próprio navegador (Canvas), nos formatos Stories (9:16) e
 * Quadrado (1:1), com a identidade da Balera. Compartilha via Web Share API
 * (WhatsApp/Instagram/etc.) com fallback de download e link de WhatsApp.
 * ========================================================================== */
window.Share = (function () {
  'use strict';
  var JOGOS = (window.CHAVEAMENTO && window.CHAVEAMENTO.jogos) || [];
  var FASE = (window.CHAVEAMENTO && window.CHAVEAMENTO.faseAtual) || 'Mata-Mata';
  var PALPITES_URL = window.PALPITES_URL || 'https://matheusalho.github.io/Palpites_Mata-Mata/';
  var URL_LABEL = window.SHARE_URL_LABEL || 'bolao.balera.com.br';
  var FONT = "'Segoe UI', Arial, sans-serif";
  // Logo REAL do Balera (a mesma da topbar). crossOrigin='anonymous' permite desenhar no
  // canvas e exportar (toDataURL/toBlob) sem "tainting" — o CDN i0.wp.com envia CORS no resize padrão.
  var IMG_ICON = new Image(); IMG_ICON.crossOrigin = 'anonymous';
  IMG_ICON.src = 'https://i0.wp.com/dev.balera.com.br/wp-content/uploads/2024/09/balera_home_icon.webp?resize=90%2C115&ssl=1';
  var IMG_NOME = new Image(); IMG_NOME.crossOrigin = 'anonymous';
  IMG_NOME.src = 'https://i0.wp.com/balera.com.br/wp-content/uploads/2024/09/balera_home_nome.webp?resize=342%2C66&ssl=1';
  function imgReady(im) { return !!(im && im.complete && im.naturalWidth > 0); }

  var LAYOUTS = {
    story: { W: 1080, H: 1920, pad: 64, cols: 1, rowH: 74, gamesTop: 612, fs: 31, big: true },
    square: { W: 1080, H: 1080, pad: 54, cols: 2, rowH: 64, gamesTop: 322, fs: 26, big: false }
  };

  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function trunc(x, s, max) { s = s == null ? '' : '' + s; if (x.measureText(s).width <= max) return s; while (s.length > 1 && x.measureText(s + '…').width > max) s = s.slice(0, -1); return s + '…'; }

  function drawRow(x, gx, gy, gw, rowH, j, g, fs) {
    var br = !!j.brasil;
    var has = g && g.home !== undefined && g.home !== '' && g.home != null;
    var inner = rowH - 8;
    if (br) { x.fillStyle = 'rgba(255,235,0,0.13)'; rr(x, gx, gy, gw, inner, 10); x.fill(); x.fillStyle = '#ffeb00'; x.fillRect(gx, gy, 6, inner); }
    else { x.fillStyle = 'rgba(255,255,255,0.04)'; rr(x, gx, gy, gw, inner, 10); x.fill(); }
    var cx = gx + gw / 2, my = gy + inner / 2, half = gw / 2;
    x.textBaseline = 'middle';
    x.font = '800 ' + fs + 'px ' + FONT;
    x.fillStyle = br ? '#fff' : '#e8eef5';
    x.textAlign = 'right'; x.fillText(trunc(x, j.mandante, half - 78), cx - 52, my);
    x.textAlign = 'left'; x.fillText(trunc(x, j.visitante, half - 78), cx + 52, my);
    x.textAlign = 'center'; x.font = '900 ' + fs + 'px ' + FONT;
    x.fillStyle = has ? '#ffeb00' : '#5b6b7d'; x.fillText(has ? ('' + g.home) : '–', cx - 24, my);
    x.fillStyle = '#5b6b7d'; x.font = '900 ' + (fs - 4) + 'px ' + FONT; x.fillText('x', cx, my + 1);
    x.fillStyle = has ? '#ffeb00' : '#5b6b7d'; x.font = '900 ' + fs + 'px ' + FONT; x.fillText(has ? ('' + g.away) : '–', cx + 24, my);
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
  }

  // ----- versão BRASIL: bloco detalhado por jogo (placar + artilheiros na ordem, por time) -----
  function bsz(L) {
    return L.big
      ? { team: 34, sc: 46, name: 27, line: 48, head: 118, colh: 22, idx: 15, gap: 22, off: 94 }
      : { team: 26, sc: 34, name: 21, line: 40, head: 92, colh: 18, idx: 12, gap: 18, off: 72 };
  }
  function brasilGameHeight(g, L) {
    var s = bsz(L);
    var home = (g.homeScorers || []).filter(function (v) { return v; });
    var away = (g.awayScorers || []).filter(function (v) { return v; });
    var rows = Math.max(home.length, away.length, 1);
    return s.head + 46 + rows * s.line + 22;
  }
  function drawBrasilGame(x, gx, gy, gw, j, g, L) {
    var s = bsz(L);
    var has = g && g.home !== undefined && g.home !== '' && g.home != null;
    var home = (g.homeScorers || []).filter(function (v) { return v; });
    var away = (g.awayScorers || []).filter(function (v) { return v; });
    var rows = Math.max(home.length, away.length, 1);
    var h = s.head + 46 + rows * s.line + 22;
    var cx = gx + gw / 2;
    // painel
    x.fillStyle = 'rgba(255,255,255,0.05)'; rr(x, gx, gy, gw, h, 18); x.fill();
    x.fillStyle = '#009c3b'; x.fillRect(gx, gy, 7, h);
    // selo J{id}
    x.textBaseline = 'middle'; x.textAlign = 'center';
    x.fillStyle = '#ffeb00'; rr(x, gx + 28, gy + 24, 62, 32, 8); x.fill();
    x.fillStyle = '#000'; x.font = '900 19px ' + FONT; x.fillText('J' + j.id, gx + 59, gy + 41);
    // confronto + placar
    var my = gy + s.head / 2 + 6;
    x.font = '800 ' + s.team + 'px ' + FONT; x.fillStyle = '#fff';
    x.textAlign = 'right'; x.fillText(trunc(x, j.mandante, gw / 2 - s.off - 12), cx - s.off, my);
    x.textAlign = 'left'; x.fillText(trunc(x, j.visitante, gw / 2 - s.off - 12), cx + s.off, my);
    x.textAlign = 'center'; x.font = '900 ' + s.sc + 'px ' + FONT; x.fillStyle = '#ffeb00';
    x.fillText(has ? (g.home + ' x ' + g.away) : '– x –', cx, my);
    // divisória horizontal
    x.strokeStyle = 'rgba(255,255,255,0.13)'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(gx + 26, gy + s.head - 2); x.lineTo(gx + gw - 26, gy + s.head - 2); x.stroke();
    // colunas de artilheiros
    var leftX = gx + 40, rightX = cx + 28;
    var leftW = cx - 30 - leftX, rightW = gx + gw - 26 - rightX;
    var hdrY = gy + s.head + 14;
    x.textBaseline = 'alphabetic'; x.textAlign = 'left'; x.font = '900 ' + s.colh + 'px ' + FONT; x.fillStyle = '#8aa0b5';
    x.fillText(trunc(x, 'GOLS ' + (j.mandante || '').toUpperCase(), leftW), leftX, hdrY);
    x.fillText(trunc(x, 'GOLS ' + (j.visitante || '').toUpperCase(), rightW), rightX, hdrY);
    // divisória vertical entre colunas
    x.beginPath(); x.moveTo(cx, gy + s.head + 4); x.lineTo(cx, gy + h - 14); x.stroke();
    function drawList(list, colX, colW) {
      if (!list.length) {
        x.textBaseline = 'middle'; x.font = 'italic ' + (s.name - 3) + 'px ' + FONT; x.fillStyle = '#5b6b7d'; x.textAlign = 'left';
        x.fillText('— sem gols —', colX, hdrY + 22 + s.line / 2);
        x.textBaseline = 'alphabetic'; return;
      }
      for (var i = 0; i < list.length; i++) {
        var ly = hdrY + 24 + i * s.line + s.line / 2;
        x.textBaseline = 'middle';
        x.fillStyle = '#009c3b'; x.beginPath(); x.arc(colX + s.idx, ly, s.idx, 0, 7); x.fill();
        x.fillStyle = '#fff'; x.font = '900 ' + (s.idx + 2) + 'px ' + FONT; x.textAlign = 'center'; x.fillText('' + (i + 1), colX + s.idx, ly + 1);
        x.fillStyle = '#e8eef5'; x.font = '700 ' + s.name + 'px ' + FONT; x.textAlign = 'left';
        x.fillText(trunc(x, list[i], colW - (s.idx * 2 + 14)), colX + s.idx * 2 + 12, ly);
      }
      x.textBaseline = 'alphabetic';
    }
    drawList(home, leftX, leftW);
    drawList(away, rightX, rightW);
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    return h;
  }

  function drawCard(fmt, data) {
    var L = LAYOUTS[fmt], W = L.W, H = L.H, pad = L.pad;
    var big = L.big;
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    // ----- fundo escuro premium + brilhos nas cores do Brasil -----
    var bgGrad = x.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0a120e'); bgGrad.addColorStop(0.5, '#070a0e'); bgGrad.addColorStop(1, '#0a0e14');
    x.fillStyle = bgGrad; x.fillRect(0, 0, W, H);
    function glow(gx, gy, gr, col) { var g = x.createRadialGradient(gx, gy, 0, gx, gy, gr); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
    glow(W * 0.95, H * 0.08, W * 0.62, 'rgba(0,160,60,0.20)');   // verde (topo-direita)
    glow(W * 0.04, H * 0.93, W * 0.60, 'rgba(0,45,130,0.22)');   // azul (base-esquerda)
    glow(W * 0.10, H * 0.05, W * 0.36, 'rgba(255,223,0,0.07)');  // amarelo (topo-esquerda)
    // ----- faixa tricolor (Brasil) no topo -----
    var t3 = W / 3;
    x.fillStyle = '#009c3b'; x.fillRect(0, 0, t3, 12);
    x.fillStyle = '#ffdf00'; x.fillRect(t3, 0, t3, 12);
    x.fillStyle = '#002776'; x.fillRect(2 * t3, 0, W - 2 * t3, 12);

    // ----- cabeçalho: logo REAL do Balera (esq) + bolão (dir) -----
    var hy = pad + 12;
    var icoH = big ? 96 : 80, icoW = icoH * (90 / 115);
    if (imgReady(IMG_ICON)) x.drawImage(IMG_ICON, pad, hy, icoW, icoH);
    var nomeH = big ? 38 : 32, nomeW = nomeH * (342 / 66), nx = pad + icoW + 22, ny = hy + (big ? 10 : 8);
    if (imgReady(IMG_NOME)) x.drawImage(IMG_NOME, nx, ny, nomeW, nomeH);
    x.fillStyle = '#00b4ff'; x.font = '700 ' + (big ? 15 : 13) + 'px ' + FONT; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillText('A D V O G A D O S', nx + 3, ny + nomeH + (big ? 24 : 20));
    x.textAlign = 'right';
    x.fillStyle = '#ffdf00'; x.font = '900 ' + (big ? 22 : 18) + 'px ' + FONT; x.fillText('BOLÃO COPA 2026', W - pad, hy + (big ? 26 : 22));
    x.fillStyle = '#8aa0b5'; x.font = '800 ' + (big ? 16 : 14) + 'px ' + FONT; x.fillText(FASE.toUpperCase(), W - pad, hy + (big ? 56 : 46));
    x.textAlign = 'left';

    // ----- título + nome do participante (sem ranking) -----
    var ty = big ? 256 : 178;
    x.fillStyle = '#3ec46e'; x.font = '900 ' + (big ? 30 : 23) + 'px ' + FONT;
    x.fillText('MEU PALPITE', pad, ty);
    x.fillStyle = '#fff'; x.font = '900 ' + (big ? 72 : 50) + 'px ' + FONT;
    x.fillText(trunc(x, data.name, W - 2 * pad), pad, ty + (big ? 80 : 58));
    var uy = ty + (big ? 102 : 74), uw = big ? 130 : 96, uh = big ? 9 : 7;
    x.fillStyle = '#009c3b'; x.fillRect(pad, uy, uw, uh);
    x.fillStyle = '#ffdf00'; x.fillRect(pad + uw, uy, uw, uh);
    var y = ty + (big ? 110 : 80);

    if (window.BRASIL_ONLY) {
      // versão Brasil: placar + artilheiros (na ordem) de cada time, centralizado
      var bgap = bsz(L).gap;
      var hs = JOGOS.map(function (j) { return brasilGameHeight((data.guesses || {})[j.id] || {}, L); });
      var totalH = hs.reduce(function (a, b) { return a + b; }, 0) + bgap * Math.max(0, JOGOS.length - 1);
      var footerY = H - (L.big ? 215 : 175);
      var areaTop = y + (L.big ? 30 : 22), areaBot = footerY - 24, titleGap = 46;
      var startY = areaTop + Math.max(0, (areaBot - areaTop - titleGap - totalH) / 2) + titleGap;
      x.fillStyle = '#8aa0b5'; x.font = '900 ' + (L.big ? 24 : 20) + 'px ' + FONT; x.textAlign = 'left';
      x.fillText('PALPITE · JOGO DO BRASIL', pad, startY - 18);
      var gyy = startY;
      JOGOS.forEach(function (j, i) {
        drawBrasilGame(x, pad, gyy, W - 2 * pad, j, (data.guesses || {})[j.id] || {}, L);
        gyy += hs[i] + bgap;
      });
    } else {
      // título da lista
      x.fillStyle = '#8aa0b5'; x.font = '900 ' + (L.big ? 24 : 20) + 'px ' + FONT; x.textAlign = 'left';
      x.fillText('TODOS OS PALPITES', pad, L.gamesTop - 26);
      // jogos
      var perCol = Math.ceil(JOGOS.length / L.cols);
      var gap = 20;
      var colW = (W - 2 * pad - (L.cols - 1) * gap) / L.cols;
      JOGOS.forEach(function (j, i) {
        var col = Math.floor(i / perCol), row = i % perCol;
        var gx = pad + col * (colW + gap);
        var gy = L.gamesTop + row * L.rowH;
        drawRow(x, gx, gy, colW, L.rowH, j, (data.guesses || {})[j.id] || {}, L.fs);
      });
    }

    // rodapé
    var fy = H - (L.big ? 215 : 175);
    var ft = (W - 2 * pad) / 3;
    x.fillStyle = '#009c3b'; x.fillRect(pad, fy, ft, 5);
    x.fillStyle = '#ffdf00'; x.fillRect(pad + ft, fy, ft, 5);
    x.fillStyle = '#002776'; x.fillRect(pad + 2 * ft, fy, (W - 2 * pad) - 2 * ft, 5);
    x.textAlign = 'center';
    x.fillStyle = '#8aa0b5'; x.font = '900 ' + (L.big ? 22 : 18) + 'px ' + FONT;
    x.fillText('INOVA · SIMPLIFICA · SUPERA', W / 2, fy + (L.big ? 54 : 46));
    var bw = L.big ? 440 : 384, bh = L.big ? 62 : 54, bx = W / 2 - bw / 2, by = fy + (L.big ? 80 : 66);
    x.fillStyle = '#ffeb00'; rr(x, bx, by, bw, bh, bh / 2); x.fill();
    x.fillStyle = '#04261a'; x.font = '900 ' + (L.big ? 28 : 24) + 'px ' + FONT; x.textBaseline = 'middle';
    x.fillText('FAÇA O SEU PALPITE!', W / 2, by + bh / 2);
    x.textBaseline = 'alphabetic'; x.fillStyle = '#00b4ff'; x.font = '700 ' + (L.big ? 24 : 20) + 'px ' + FONT;
    x.fillText(URL_LABEL, W / 2, by + bh + (L.big ? 40 : 34)); x.textAlign = 'left';

    return c;
  }

  // ---------- compartilhamento ----------
  function canvasToBlob(c) { return new Promise(function (res) { c.toBlob(function (b) { res(b); }, 'image/png', 0.95); }); }
  function shareText(data) { return 'Confira meus palpites no Bolão Balera 2026 — ' + FASE + '! 🏆⚽\nFaça o seu: ' + PALPITES_URL; }

  function open(data) {
    var fmt = 'story';
    var bg = document.createElement('div'); bg.className = 'modal-bg'; bg.onclick = function () { bg.remove(); };
    var canShare = !!(navigator.canShare && navigator.share);
    bg.innerHTML =
      '<div class="modal share-modal" onclick="event.stopPropagation()">' +
      '<div class="dhead"><h3>Compartilhar palpites</h3><button class="dclose" onclick="this.closest(\'.modal-bg\').remove()">✕</button></div>' +
      '<div class="share-fmt"><button data-f="story" class="active">Stories 9:16</button><button data-f="square">Quadrado 1:1</button></div>' +
      '<div class="share-prev"><img alt="Prévia do card de palpites"/></div>' +
      '<div class="share-actions">' +
      (canShare ? '<button class="btn ciano" data-a="share">Compartilhar</button>' : '') +
      '<button class="btn" data-a="wa">WhatsApp</button>' +
      '<button class="btn ghost" data-a="dl">Baixar imagem</button>' +
      '</div>' +
      '<p class="share-tip">Dica: no celular, "Compartilhar" abre Instagram, WhatsApp e Stories. No Instagram, poste a imagem no seu Story.</p>' +
      '</div>';
    document.body.appendChild(bg);
    var img = bg.querySelector('.share-prev img');
    var current = null;
    function render() {
      current = drawCard(fmt, data);
      img.src = current.toDataURL('image/png');
    }
    render();
    // redesenha quando a logo do Balera terminar de carregar (caso ainda não esteja pronta)
    [IMG_ICON, IMG_NOME].forEach(function (im) { if (!imgReady(im)) im.addEventListener('load', render, { once: true }); });
    bg.querySelectorAll('.share-fmt button').forEach(function (b) {
      b.onclick = function () { fmt = b.dataset.f; bg.querySelectorAll('.share-fmt button').forEach(function (z) { z.classList.toggle('active', z === b); }); render(); };
    });
    var fname = function () { return 'palpites-balera-' + (data.name || 'bolao').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + fmt + '.png'; };
    bg.querySelector('[data-a="dl"]').onclick = function () { var a = document.createElement('a'); a.href = current.toDataURL('image/png'); a.download = fname(); a.click(); };
    bg.querySelector('[data-a="wa"]').onclick = function () { window.open('https://wa.me/?text=' + encodeURIComponent(shareText(data)), '_blank'); };
    var sb = bg.querySelector('[data-a="share"]');
    if (sb) sb.onclick = function () {
      canvasToBlob(current).then(function (blob) {
        var file = new File([blob], fname(), { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: 'Meus palpites - Bolão Balera 2026', text: shareText(data) }).catch(function () {});
        } else {
          navigator.share({ title: 'Bolão Balera 2026', text: shareText(data), url: PALPITES_URL }).catch(function () {});
        }
      });
    };
  }

  return { open: open };
})();
