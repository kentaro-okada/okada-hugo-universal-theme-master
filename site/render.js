/*
 * BLUE PAWS トップページの組み立て（ブラウザと Node.js の両方で動く）
 *
 * テンプレートの書き方
 *   {{path}}            値を HTML エスケープして入れる（改行は <br> になる）
 *   {{&path}}           値をそのまま入れる（生成済みの HTML / JSON 用）
 *   {{#path}}…{{/path}} 配列なら要素ごとに繰り返す。値があれば1回だけ出す
 *   {{^path}}…{{/path}} 値が空のときだけ出す
 *   {{@num}}            繰り返しの中で 1 から始まる番号
 *   path は "menu.tiers" のようにドットでたどる。"." はその場の値そのもの
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BluePawsRender = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var TAG = /\{\{\s*([#^\/&]?)\s*([@\w.\-]+)\s*\}\}/g;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function parse(tpl) {
    var rootNode = { children: [] }, stack = [rootNode], last = 0, m;
    TAG.lastIndex = 0;
    while ((m = TAG.exec(tpl))) {
      var top = stack[stack.length - 1];
      if (m.index > last) top.children.push({ type: 'text', value: tpl.slice(last, m.index) });
      last = TAG.lastIndex;
      var kind = m[1], name = m[2];
      if (kind === '#' || kind === '^') {
        var node = { type: kind, name: name, children: [] };
        top.children.push(node); stack.push(node);
      } else if (kind === '/') {
        if (stack.length < 2 || top.name !== name) throw new Error('テンプレートの {{/' + name + '}} の対応が取れていません');
        stack.pop();
      } else {
        top.children.push({ type: kind === '&' ? 'raw' : 'var', name: name });
      }
    }
    if (stack.length > 1) throw new Error('テンプレートの {{#' + stack[stack.length - 1].name + '}} が閉じられていません');
    if (last < tpl.length) rootNode.children.push({ type: 'text', value: tpl.slice(last) });
    return rootNode.children;
  }

  function lookup(ctxs, name) {
    if (name === '.') return ctxs[ctxs.length - 1].value;
    if (name === '@num') {
      for (var j = ctxs.length - 1; j >= 0; j--) if (ctxs[j].index != null) return ctxs[j].index + 1;
      return '';
    }
    var parts = name.split('.');
    for (var i = ctxs.length - 1; i >= 0; i--) {
      var v = ctxs[i].value;
      if (v != null && typeof v === 'object' && parts[0] in v) {
        for (var k = 0; k < parts.length; k++) { if (v == null) return undefined; v = v[parts[k]]; }
        return v;
      }
    }
    return undefined;
  }

  function empty(v) { return v == null || v === false || v === '' || (Array.isArray(v) && v.length === 0); }

  function run(nodes, ctxs) {
    var out = '';
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i], v;
      if (n.type === 'text') out += n.value;
      else if (n.type === 'var') {
        v = lookup(ctxs, n.name);
        out += esc(typeof v === 'string' ? v.replace(/\s+$/, '') : v).replace(/\r?\n/g, '<br>');
      } else if (n.type === 'raw') {
        v = lookup(ctxs, n.name);
        out += v == null ? '' : String(v);
      } else if (n.type === '#') {
        v = lookup(ctxs, n.name);
        if (Array.isArray(v)) {
          for (var a = 0; a < v.length; a++) out += run(n.children, ctxs.concat([{ value: v[a], index: a }]));
        } else if (!empty(v)) {
          out += run(n.children, ctxs.concat([{ value: v }]));
        }
      } else if (n.type === '^') {
        if (empty(lookup(ctxs, n.name))) out += run(n.children, ctxs);
      }
    }
    return out;
  }

  // content.yaml の中身に、テンプレートで使う計算済みの値を足す
  function prepare(content) {
    var c = JSON.parse(JSON.stringify(content || {}));
    var s = c.site || {};
    ((c.menu && c.menu.tiers) || []).forEach(function (t) {
      var n = (t.breeds || []).length || 1;
      t.flex = n + ' 1 ' + (n * 230) + 'px';
    });
    var ld = {
      '@context': 'https://schema.org',
      '@type': 'PetGrooming',
      name: 'BLUE PAWS（ブルーパウズ）',
      url: s.url,
      image: s.url && s.og_image ? s.url + s.og_image : undefined,
      logo: s.url && s.logo ? s.url + s.logo : undefined,
      description: s.description,
      address: {
        '@type': 'PostalAddress', postalCode: '251-0032', addressRegion: '神奈川県',
        addressLocality: '藤沢市', streetAddress: '片瀬3-1-29', addressCountry: 'JP'
      },
      geo: { '@type': 'GeoCoordinates', latitude: 35.315133, longitude: 139.486057 },
      openingHours: s.opening_hours || undefined,
      hasMap: s.maps_url,
      sameAs: s.instagram_url ? [s.instagram_url] : undefined,
      paymentAccepted: '現金, クレジットカード'
    };
    c._jsonld = JSON.stringify(ld, null, 2).replace(/</g, '\\u003c');
    return c;
  }

  function render(template, content) {
    return run(parse(template), [{ value: prepare(content) }]);
  }

  return { render: render, escape: esc };
});
