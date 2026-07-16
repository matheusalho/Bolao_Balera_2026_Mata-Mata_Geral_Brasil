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
  // Rótulo cheio da fase + data (card específico da rodada)
  var FASE_NOME = { 'Oitavas': 'Oitavas de Final', 'Quartas': 'Quartas de Final', 'Semifinal': 'Semifinal', 'Final': 'Grande Final' };
  var FASE_LABEL = FASE_NOME[FASE] || FASE;
  var IS_FINAL = FASE === 'Final'; // GRANDE FINAL: card com acento dourado (troféu)
  // 1 jogo → mostra "data · hora"; vários jogos na mesma data → mostra só a data.
  var _dates = JOGOS.map(function (j) { return (((j.dataHora || '').split(' - ')[0]) || '').trim(); }).filter(Boolean);
  var _uniqDate = (_dates.length && _dates.every(function (d) { return d === _dates[0]; })) ? _dates[0] : '';
  var GAME_DATE = JOGOS.length === 1 ? (((JOGOS[0] && JOGOS[0].dataHora) || '').replace(' - ', ' · ')) : _uniqDate;
  // Logo oficial do Balera (arquivo balera_logo_novo.png) embutida como data URI:
  // o card fica 100% autossuficiente (sem CDN) e exporta sem CORS-taint.
  var IMG_ICON = new Image();
  IMG_ICON.src = 'data:image/png;base64,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';
  function imgReady(im) { return !!(im && im.complete && im.naturalWidth > 0); }

  var LAYOUTS = {
    story: { W: 1080, H: 1920, pad: 64, cols: 1, rowH: 74, gamesTop: 612, fs: 31, big: true },
    square: { W: 1080, H: 1080, pad: 54, cols: 2, rowH: 64, gamesTop: 322, fs: 26, big: false }
  };

  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function trunc(x, s, max) { s = s == null ? '' : '' + s; if (x.measureText(s).width <= max) return s; while (s.length > 1 && x.measureText(s + '…').width > max) s = s.slice(0, -1); return s + '…'; }

  // ----- elementos da Grande Final desenhados no canvas (bandeiras + taça) -----
  function finalHasFlag(team) { var t = (team == null ? '' : ('' + team)).toLowerCase(); return t === 'espanha' || t === 'argentina'; }
  function drawFlag(x, team, fx, fy, fw, fh) {
    var t = (team == null ? '' : ('' + team)).toLowerCase();
    x.save(); rr(x, fx, fy, fw, fh, 3); x.clip();
    if (t === 'espanha') { x.fillStyle = '#c60b1e'; x.fillRect(fx, fy, fw, fh); x.fillStyle = '#ffc400'; x.fillRect(fx, fy + fh * 0.25, fw, fh * 0.5); }
    else if (t === 'argentina') { x.fillStyle = '#6fa8dc'; x.fillRect(fx, fy, fw, fh); x.fillStyle = '#fff'; x.fillRect(fx, fy + fh / 3, fw, fh / 3); x.fillStyle = '#f6b40e'; x.beginPath(); x.arc(fx + fw / 2, fy + fh / 2, fh * 0.14, 0, 7); x.fill(); }
    x.restore();
    x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = 1.5; rr(x, fx, fy, fw, fh, 3); x.stroke();
  }
  function drawTrophy(x, cx, topY, sc) {
    function px(sx) { return cx + (sx - 32) * sc; } function py(sy) { return topY + sy * sc; }
    var g = x.createLinearGradient(0, topY, 0, topY + 86 * sc); g.addColorStop(0, '#fdeeb8'); g.addColorStop(0.45, '#e7c04a'); g.addColorStop(1, '#a9781f');
    x.save(); x.strokeStyle = g; x.lineWidth = 4.5 * sc; x.lineCap = 'round';
    x.beginPath(); x.moveTo(px(14), py(12)); x.bezierCurveTo(px(1), py(15), px(3), py(35), px(20), py(37)); x.stroke();
    x.beginPath(); x.moveTo(px(50), py(12)); x.bezierCurveTo(px(63), py(15), px(61), py(35), px(44), py(37)); x.stroke();
    x.fillStyle = g;
    x.beginPath(); x.moveTo(px(12), py(8)); x.lineTo(px(52), py(8)); x.lineTo(px(52), py(20)); x.bezierCurveTo(px(52), py(39), px(43), py(50), px(32), py(50)); x.bezierCurveTo(px(21), py(50), px(12), py(39), px(12), py(20)); x.closePath(); x.fill();
    x.fillRect(px(27.5), py(50), 9 * sc, 11 * sc);
    x.beginPath(); x.moveTo(px(19), py(61)); x.lineTo(px(45), py(61)); x.lineTo(px(48), py(71)); x.lineTo(px(16), py(71)); x.closePath(); x.fill();
    x.fillRect(px(13), py(71), 38 * sc, 9 * sc);
    x.restore();
  }

  function drawRow(x, gx, gy, gw, rowH, j, g, fs) {
    var br = !!j.brasil;
    var has = g && g.home !== undefined && g.home !== '' && g.home != null;
    var inner = rowH - 8;
    if (br) { x.fillStyle = 'rgba(0,180,255,0.13)'; rr(x, gx, gy, gw, inner, 10); x.fill(); x.fillStyle = '#00b4ff'; x.fillRect(gx, gy, 6, inner); }
    else { x.fillStyle = 'rgba(255,255,255,0.04)'; rr(x, gx, gy, gw, inner, 10); x.fill(); }
    var cx = gx + gw / 2, my = gy + inner / 2, half = gw / 2;
    x.textBaseline = 'middle';
    x.font = '800 ' + fs + 'px ' + FONT;
    x.fillStyle = br ? '#fff' : '#e8eef5';
    x.textAlign = 'right'; x.fillText(trunc(x, j.mandante, half - 78), cx - 52, my);
    x.textAlign = 'left'; x.fillText(trunc(x, j.visitante, half - 78), cx + 52, my);
    x.textAlign = 'center'; x.font = '900 ' + fs + 'px ' + FONT;
    x.fillStyle = has ? '#ffd24a' : '#5b6b7d'; x.fillText(has ? ('' + g.home) : '–', cx - 24, my);
    x.fillStyle = '#5b6b7d'; x.font = '900 ' + (fs - 4) + 'px ' + FONT; x.fillText('x', cx, my + 1);
    x.fillStyle = has ? '#ffd24a' : '#5b6b7d'; x.font = '900 ' + fs + 'px ' + FONT; x.fillText(has ? ('' + g.away) : '–', cx + 24, my);
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
  }

  // ----- bloco detalhado por jogo: placar + artilheiros (na ordem) de cada time -----
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
    x.fillStyle = '#00b4ff'; x.fillRect(gx, gy, 7, h);
    // selo J{id}
    x.textBaseline = 'middle'; x.textAlign = 'center';
    x.fillStyle = '#00b4ff'; rr(x, gx + 28, gy + 24, 62, 32, 8); x.fill();
    x.fillStyle = '#04121f'; x.font = '900 19px ' + FONT; x.fillText('J' + j.id, gx + 59, gy + 41);
    // confronto + placar
    var my = gy + s.head / 2 + 6;
    x.font = '800 ' + s.team + 'px ' + FONT; x.fillStyle = '#fff';
    x.textAlign = 'right'; x.fillText(trunc(x, j.mandante, gw / 2 - s.off - 12), cx - s.off, my);
    x.textAlign = 'left'; x.fillText(trunc(x, j.visitante, gw / 2 - s.off - 12), cx + s.off, my);
    if (IS_FINAL) { // bandeiras dos finalistas ao lado dos nomes
      var _mW = x.measureText(trunc(x, j.mandante, gw / 2 - s.off - 12)).width;
      var _vW = x.measureText(trunc(x, j.visitante, gw / 2 - s.off - 12)).width;
      var _fw = s.team * 1.4, _fh = s.team * 0.92, _fg = 12;
      if (finalHasFlag(j.mandante)) drawFlag(x, j.mandante, cx - s.off - _mW - _fg - _fw, my - _fh / 2, _fw, _fh);
      if (finalHasFlag(j.visitante)) drawFlag(x, j.visitante, cx + s.off + _vW + _fg, my - _fh / 2, _fw, _fh);
    }
    x.textAlign = 'center'; x.font = '900 ' + s.sc + 'px ' + FONT; x.fillStyle = '#ffd24a';
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
        x.fillStyle = '#1e3a8a'; x.beginPath(); x.arc(colX + s.idx, ly, s.idx, 0, 7); x.fill();
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
    // ----- fundo escuro premium + brilhos nas cores Balera -----
    var bgGrad = x.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0b1220'); bgGrad.addColorStop(0.5, '#080c15'); bgGrad.addColorStop(1, '#0a1018');
    x.fillStyle = bgGrad; x.fillRect(0, 0, W, H);
    function glow(gx, gy, gr, col) { var g = x.createRadialGradient(gx, gy, 0, gx, gy, gr); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
    glow(W * 0.95, H * 0.08, W * 0.62, 'rgba(0,180,255,0.18)');   // ciano Balera (topo-direita)
    glow(W * 0.04, H * 0.93, W * 0.60, 'rgba(30,58,138,0.30)');   // azul Balera (base-esquerda)
    glow(W * 0.10, H * 0.05, W * 0.36, 'rgba(212,175,55,0.10)');  // ouro (topo-esquerda)
    // ----- faixa tricolor Balera no topo (azul · ciano · ouro) -----
    var t3 = W / 3;
    x.fillStyle = '#1e3a8a'; x.fillRect(0, 0, t3, 12);
    x.fillStyle = '#00b4ff'; x.fillRect(t3, 0, t3, 12);
    x.fillStyle = '#D4AF37'; x.fillRect(2 * t3, 0, W - 2 * t3, 12);

    // ----- cabeçalho: logo REAL do Balera (esq) + bolão (dir) -----
    var hy = pad + 12;
    var icoH = big ? 96 : 80, icoW = icoH * (90 / 115);
    if (imgReady(IMG_ICON)) x.drawImage(IMG_ICON, pad, hy, icoW, icoH);
    var nx = pad + icoW + 24;
    x.fillStyle = '#fff'; x.font = '900 ' + (big ? 46 : 38) + 'px ' + FONT; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillText('BALERA', nx, hy + (big ? 52 : 46));
    x.fillStyle = '#00b4ff'; x.font = '700 ' + (big ? 16 : 14) + 'px ' + FONT;
    x.fillText('A D V O G A D O S', nx + 3, hy + (big ? 80 : 68));
    x.textAlign = 'right';
    x.fillStyle = '#D4AF37'; x.font = '900 ' + (big ? 22 : 18) + 'px ' + FONT; x.fillText('BOLÃO COPA 2026', W - pad, hy + (big ? 26 : 22));
    x.fillStyle = IS_FINAL ? '#e9c86a' : '#8aa0b5'; x.font = '800 ' + (big ? 16 : 14) + 'px ' + FONT; x.fillText(FASE_LABEL.toUpperCase(), W - pad, hy + (big ? 56 : 46));
    x.textAlign = 'left';

    // ----- título + nome do participante (sem ranking) -----
    var ty = big ? 256 : 178;
    x.fillStyle = IS_FINAL ? '#e9c86a' : '#00b4ff'; x.font = '900 ' + (big ? 30 : 23) + 'px ' + FONT;
    x.fillText('MEU PALPITE', pad, ty);
    x.fillStyle = '#fff'; x.font = '900 ' + (big ? 72 : 50) + 'px ' + FONT;
    x.fillText(trunc(x, data.name, W - 2 * pad), pad, ty + (big ? 80 : 58));
    var uy = ty + (big ? 102 : 74), uw = big ? 130 : 96, uh = big ? 9 : 7;
    x.fillStyle = IS_FINAL ? '#D4AF37' : '#00b4ff'; x.fillRect(pad, uy, uw, uh);
    x.fillStyle = IS_FINAL ? '#f2d78e' : '#D4AF37'; x.fillRect(pad + uw, uy, uw, uh);
    // selo da rodada + data/hora (deixa o card específico da fase)
    var badgeTxt = FASE_LABEL.toUpperCase() + (GAME_DATE ? '   ·   ' + GAME_DATE : '');
    var badgeY = uy + uh + (big ? 18 : 13), badgeH = big ? 44 : 36;
    x.textBaseline = 'middle'; x.textAlign = 'left'; x.font = '900 ' + (big ? 21 : 17) + 'px ' + FONT;
    var badgeW = x.measureText(badgeTxt).width + (big ? 44 : 34);
    x.fillStyle = IS_FINAL ? '#D4AF37' : '#1e3a8a'; rr(x, pad, badgeY, badgeW, badgeH, badgeH / 2); x.fill();
    x.fillStyle = IS_FINAL ? '#241a02' : '#ffd24a'; x.fillText(badgeTxt, pad + (big ? 22 : 17), badgeY + badgeH / 2 + 1);
    x.textBaseline = 'alphabetic';
    if (IS_FINAL) { // taça dourada ao lado do selo da rodada
      var _tsc = (badgeH * 1.55) / 86;
      drawTrophy(x, pad + badgeW + (big ? 40 : 28) + 32 * _tsc, badgeY + badgeH / 2 - (86 * _tsc) / 2, _tsc);
    }
    var y = badgeY + badgeH;

    if (JOGOS.length <= 4) {
      // rodada com poucos jogos: bloco detalhado (placar + artilheiros na ordem, por time), centralizado
      var bgap = bsz(L).gap;
      var hs = JOGOS.map(function (j) { return brasilGameHeight((data.guesses || {})[j.id] || {}, L); });
      var totalH = hs.reduce(function (a, b) { return a + b; }, 0) + bgap * Math.max(0, JOGOS.length - 1);
      var footerY = H - (L.big ? 215 : 175);
      var areaTop = y + (L.big ? 30 : 22), areaBot = footerY - 24, titleGap = 46;
      var startY = areaTop + Math.max(0, (areaBot - areaTop - titleGap - totalH) / 2) + titleGap;
      x.fillStyle = '#8aa0b5'; x.font = '900 ' + (L.big ? 24 : 20) + 'px ' + FONT; x.textAlign = 'left';
      x.fillText(JOGOS.length === 1 ? 'MEU PALPITE' : 'PALPITES DA RODADA', pad, startY - 18);
      var gyy = startY;
      JOGOS.forEach(function (j, i) {
        drawBrasilGame(x, pad, gyy, W - 2 * pad, j, (data.guesses || {})[j.id] || {}, L);
        gyy += hs[i] + bgap;
      });
    } else {
      // rodada com muitos jogos: lista compacta (só placar)
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
    x.fillStyle = '#1e3a8a'; x.fillRect(pad, fy, ft, 5);
    x.fillStyle = '#00b4ff'; x.fillRect(pad + ft, fy, ft, 5);
    x.fillStyle = '#D4AF37'; x.fillRect(pad + 2 * ft, fy, (W - 2 * pad) - 2 * ft, 5);
    x.textAlign = 'center';
    x.fillStyle = '#8aa0b5'; x.font = '900 ' + (L.big ? 22 : 18) + 'px ' + FONT;
    x.fillText('INOVA · SIMPLIFICA · SUPERA', W / 2, fy + (L.big ? 54 : 46));
    var bw = L.big ? 440 : 384, bh = L.big ? 62 : 54, bx = W / 2 - bw / 2, by = fy + (L.big ? 80 : 66);
    x.fillStyle = '#00b4ff'; rr(x, bx, by, bw, bh, bh / 2); x.fill();
    x.fillStyle = '#04121f'; x.font = '900 ' + (L.big ? 28 : 24) + 'px ' + FONT; x.textBaseline = 'middle';
    x.fillText('FAÇA O SEU PALPITE!', W / 2, by + bh / 2);
    x.textBaseline = 'alphabetic'; x.fillStyle = '#00b4ff'; x.font = '700 ' + (L.big ? 24 : 20) + 'px ' + FONT;
    x.fillText(URL_LABEL, W / 2, by + bh + (L.big ? 40 : 34)); x.textAlign = 'left';

    return c;
  }

  // ---------- compartilhamento ----------
  function canvasToBlob(c) { return new Promise(function (res) { c.toBlob(function (b) { res(b); }, 'image/png', 0.95); }); }
  var ONE_GAME = JOGOS.length === 1;
  function shareText(data) { return 'Confira ' + (ONE_GAME ? 'meu palpite' : 'meus palpites') + ' no Bolão Balera 2026 — ' + FASE_LABEL + '! 🏆⚽\nFaça o seu: ' + PALPITES_URL; }

  function open(data) {
    var fmt = 'story';
    var bg = document.createElement('div'); bg.className = 'modal-bg'; bg.onclick = function () { bg.remove(); };
    var canShare = !!(navigator.canShare && navigator.share);
    bg.innerHTML =
      '<div class="modal share-modal" onclick="event.stopPropagation()">' +
      '<div class="dhead"><h3>' + (ONE_GAME ? 'Compartilhar palpite' : 'Compartilhar palpites') + '</h3><button class="dclose" onclick="this.closest(\'.modal-bg\').remove()">✕</button></div>' +
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
    if (!imgReady(IMG_ICON)) IMG_ICON.addEventListener('load', render, { once: true });
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
          navigator.share({ files: [file], title: (ONE_GAME ? 'Meu palpite' : 'Meus palpites') + ' - Bolão Balera 2026', text: shareText(data) }).catch(function () {});
        } else {
          navigator.share({ title: 'Bolão Balera 2026', text: shareText(data), url: PALPITES_URL }).catch(function () {});
        }
      });
    };
  }

  return { open: open };
})();
