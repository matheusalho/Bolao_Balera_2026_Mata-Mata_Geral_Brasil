/* ============================================================================
 * Configuração do Ranking (Geral) — Bolão Balera 2026 · Mata-Mata
 * QUARTAS DE FINAL: Brasil eliminado, sem temática brasileira.
 * BRASIL_ONLY = false → ranking multi-jogos com a pontuação completa/clássica
 * (Placar 10 · Vencedor/Empate 5 · Artilheiros 10 · Na ordem 15).
 * ========================================================================== */
window.BRASIL_ONLY = false;

/* Fluxo de LEITURA (Ler_Palpites) — mesma planilha da versão completa. */
window.READ_ENDPOINT = 'https://defaulta4a0857a652e45f494b1685bad4ec3.bd.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/87f99646bea44827ac259babc7de547d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=R3He56VcrkszdSsEyDA4niPMG-Ilz6ByPArrcUDpuLE';

/* Compartilhamento: CTA aponta para a página de palpites do Brasil. */
window.PALPITES_URL = 'https://bolao-balera.onrender.com/';
window.SHARE_URL_LABEL = 'bolao-balera.onrender.com';
