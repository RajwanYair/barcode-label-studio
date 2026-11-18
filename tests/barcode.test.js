const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT_DIR = path.resolve(__dirname, "..");
const INDEX_HTML_PATH = path.join(ROOT_DIR, "index.html");
const TEST_FILE_PATH = __filename;
const htmlContent = fs.readFileSync(INDEX_HTML_PATH, "utf8");
const testFileContent = fs.readFileSync(TEST_FILE_PATH, "utf8");

/**
 * Extract the inline application <script> from index.html and evaluate it
 * inside a sandboxed DOM context so tests run against the real production code.
 */
function loadBarcodeApi() {
  const scriptMatches = [...htmlContent.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(scriptMatches.length >= 1, "Expected inline <script> block in index.html");
  const appScript = scriptMatches[scriptMatches.length - 1][1];

  const makeMockElement = (id = "") => {
    const attrs = new Map();
    const children = [];
    const listeners = new Map();
    let _innerHTML = "";
    return {
      id,
      value: id === "barcodeInput" ? "4820019472" : (id === "symbologySelect" || id === "batchSymbology" ? "CODE128" : (id === "stickerFormat" ? "a4-3x8" : (id === "skipCountInput" ? "0" : "2"))),
      checked: true,
      disabled: false,
      textContent: "",
      placeholder: "",
      get innerHTML() { return _innerHTML; },
      set innerHTML(v) {
        _innerHTML = String(v);
        if (_innerHTML === "") children.length = 0;
      },
      clientWidth: 220,
      clientHeight: 110,
      children,
      style: {},
      dataset: { tab: "single-tab", val: "4820019472", sym: "CODE128" },
      classList: {
        _set: new Set(),
        add(c) { this._set.add(c); },
        remove(c) { this._set.delete(c); },
        contains(c) { return this._set.has(c); }
      },
      setAttribute(k, v) { attrs.set(k, String(v)); },
      getAttribute(k) { return attrs.has(k) ? attrs.get(k) : "200"; },
      addEventListener(ev, fn) { listeners.set(ev, fn); },
      appendChild(child) { children.push(child); return child; },
      querySelectorAll() { return []; },
      getContext() {
        return {
          scaleCalls: [],
          drawCalls: 0,
          scale(x, y) { this.scaleCalls.push([x, y]); },
          drawImage() { this.drawCalls++; }
        };
      },
      toDataURL() { return "data:image/png;base64,MOCKPNG"; },
      toBlob(cb) { cb(new Uint8Array([137, 80, 78, 71])); },
      focus() {},
      click() {}
    };
  };

  const elementsById = new Map();
  const docElement = makeMockElement("html");
  const storageMap = new Map();

  class MockImage {
    set src(url) {
      this._src = url;
      if (typeof this.onload === "function") this.onload();
    }
    get src() { return this._src; }
  }

  class MockFileReader {
    readAsText(file) {
      if (typeof this.onload === "function") {
        this.onload({ target: { result: file._content || "" } });
      }
    }
    readAsDataURL(file) {
      if (typeof this.onload === "function") {
        this.onload({ target: { result: file._content || "data:image/png;base64,MOCK" } });
      }
    }
    readAsArrayBuffer(file) {
      if (typeof this.onload === "function") {
        this.onload({ target: { result: file._buffer || new ArrayBuffer(8) } });
      }
    }
  }

  const sandbox = {
    globalThis: null,
    localStorage: {
      getItem(k) { return storageMap.has(k) ? storageMap.get(k) : null; },
      setItem(k, v) { storageMap.set(k, String(v)); }
    },
    window: {
      matchMedia() { return { matches: false }; },
      print() {},
      open() {
        return { document: { write() {}, close() {} }, print() {} };
      }
    },
    document: {
      documentElement: docElement,
      getElementById(id) {
        if (!elementsById.has(id)) {
          elementsById.set(id, makeMockElement(id));
        }
        return elementsById.get(id);
      },
      querySelectorAll() {
        return [];
      },
      addEventListener() {},
      createElement(tag) {
        return makeMockElement(tag);
      }
    },
    XMLSerializer: class {
      serializeToString() { return "<svg width=\"200\" height=\"100\"></svg>"; }
    },
    Blob: class {
      constructor(parts, opts) { this.parts = parts; this.opts = opts; }
    },
    URL: {
      createObjectURL() { return "blob:mock"; },
      revokeObjectURL() {}
    },
    Image: MockImage,
    FileReader: MockFileReader,
    XLSX: {
      read() {
        return {
          SheetNames: ["Sheet1"],
          Sheets: { Sheet1: {} }
        };
      },
      utils: {
        sheet_to_json() {
          return [["XLSX-1001"], ["XLSX-1002"], [""]];
        }
      }
    },
    navigator: { clipboard: { write: async () => {} } },
    setTimeout(fn, ms) {
      const t = setTimeout(fn, ms);
      if (t && typeof t.unref === "function") t.unref();
      return t;
    },
    clearTimeout
  };
  sandbox.globalThis = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(appScript, sandbox, { filename: "index.html" });

  assert.ok(sandbox.__BARCODE_API__, "Expected __BARCODE_API__ to be exposed on globalThis");
  return {
    api: sandbox.__BARCODE_API__,
    requestedIds: [...elementsById.keys()],
    elementsById,
    docElement,
    storageMap,
    appScript
  };
}

const { api, requestedIds, elementsById, docElement, storageMap, appScript } = loadBarcodeApi();

// ============================================================================
// 1. META-GUARD: 100% FUNCTION, CONSTANT & DOM COVERAGE GATE
// ============================================================================
describe("Meta-Guard: 100% Function & Export Coverage Gate", () => {
  test("Every top-level function in index.html is exported on __BARCODE_API__ and tested in barcode.test.js", () => {
    const topLevelFnRegex = /^ {4}function\s+([a-zA-Z0-9_]+)\s*\(/gm;
    const declaredFunctions = [...appScript.matchAll(topLevelFnRegex)].map(m => m[1]);
    assert.ok(declaredFunctions.length >= 32, `Expected at least 32 top-level functions, found ${declaredFunctions.length}`);

    for (const fnName of declaredFunctions) {
      assert.equal(
        typeof api[fnName],
        "function",
        `Function "${fnName}" is declared in index.html but missing from globalThis.__BARCODE_API__ — export and test it!`
      );
      const callPattern = new RegExp(`api\\.${fnName}\\b`);
      assert.match(
        testFileContent,
        callPattern,
        `Function "${fnName}" is not directly tested via api.${fnName} in tests/barcode.test.js!`
      );
    }
  });

  test("All lookup tables and constants are exported and non-empty", () => {
    const requiredConstants = [
      "CODE128_PATTERNS",
      "CODE39_MAP",
      "CODE39_CHARS",
      "EAN_L",
      "EAN_G",
      "EAN_R",
      "EAN_PARITY",
      "ITF_WEIGHTS",
      "GF256_EXP",
      "GF256_LOG",
      "QR_VERSION_INFO",
      "QR_ALIGNMENT_POS",
      "QR_ECI_ALNUM",
      "STICKER_LAYOUTS",
      "I18N"
    ];
    for (const name of requiredConstants) {
      assert.ok(api[name] !== undefined && api[name] !== null, `Missing exported constant: ${name}`);
    }
    assert.equal(api.CODE39_CHARS.length, 43);
    assert.equal(Object.keys(api.CODE39_MAP).length, 44); // 43 chars + '*'
    assert.equal(api.EAN_L.length, 10);
    assert.equal(api.EAN_G.length, 10);
    assert.equal(api.EAN_R.length, 10);
    assert.equal(api.EAN_PARITY.length, 10);
    assert.equal(api.ITF_WEIGHTS.length, 10);
    assert.equal(api.GF256_EXP.length, 512);
    assert.equal(api.GF256_LOG.length, 256);
    assert.equal(Object.keys(api.QR_ALIGNMENT_POS).length, 6);
  });

  test("All DOM element IDs queried during initialization exist in index.html", () => {
    assert.ok(requestedIds.length > 0, "Expected script to query DOM element IDs");
    for (const id of requestedIds) {
      const idPattern = new RegExp(`id=["']${id}["']`);
      assert.match(htmlContent, idPattern, `DOM element id="${id}" is referenced in JS but missing in HTML`);
    }
  });

  test("Every data-i18n and data-i18n-placeholder attribute in index.html exists in both I18N.en and I18N.he", () => {
    const i18nKeys = [
      ...[...htmlContent.matchAll(/data-i18n=["']([^"']+)["']/g)].map(m => m[1]),
      ...[...htmlContent.matchAll(/data-i18n-placeholder=["']([^"']+)["']/g)].map(m => m[1])
    ];
    assert.ok(i18nKeys.length >= 45, `Expected at least 45 data-i18n attributes in index.html, found ${i18nKeys.length}`);
    for (const key of i18nKeys) {
      assert.ok(api.I18N.en[key], `Missing English translation for data-i18n="${key}"`);
      assert.ok(api.I18N.he[key], `Missing Hebrew translation for data-i18n="${key}"`);
    }
  });
});

// ============================================================================
// 2. CONFIGURATION, CI WORKFLOW, TEMPLATES, DOCS & SVG ASSETS SUITE
// ============================================================================
describe("Repository Configs, Workflows, Documentation & SVG Assets Integrity", () => {
  test("All required repository files exist and are non-empty", () => {
    const requiredFiles = [
      "index.html",
      "package.json",
      "README.md",
      "SPEC.md",
      "ROADMAP.md",
      "LICENSE",
      "CONTRIBUTING.md",
      "CODE_OF_CONDUCT.md",
      "SECURITY.md",
      "CHANGELOG.md",
      ".gitignore",
      ".nojekyll",
      ".github/workflows/ci.yml",
      ".github/ISSUE_TEMPLATE/bug_report.md",
      ".github/ISSUE_TEMPLATE/feature_request.md",
      ".github/PULL_REQUEST_TEMPLATE.md",
      "assets/hero-banner.svg",
      "assets/architecture-flow.svg",
      "assets/spec-overview.svg",
      "assets/sticker-presets.svg",
      "assets/roadmap-sprints.svg",
      "tests/barcode.test.js"
    ];

    for (const relPath of requiredFiles) {
      const fullPath = path.join(ROOT_DIR, relPath);
      assert.ok(fs.existsSync(fullPath), `Missing required file: ${relPath}`);
      if (relPath !== ".nojekyll") {
        const stat = fs.statSync(fullPath);
        assert.ok(stat.size > 20, `File ${relPath} is unexpectedly empty (${stat.size} bytes)`);
      }
    }
  });

  test("package.json has valid metadata, repository URLs, and test script", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf8"));
    assert.equal(pkg.name, "barcode-label-studio");
    assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
    assert.equal(pkg.main, "index.html");
    assert.equal(pkg.license, "MIT");
    assert.ok(pkg.repository && pkg.repository.url.includes("RajwanYair/barcode-label-studio"));
    assert.ok(pkg.homepage && pkg.homepage.includes("rajwanyair.github.io/barcode-label-studio"));
    assert.ok(pkg.bugs && pkg.bugs.url.includes("RajwanYair/barcode-label-studio/issues"));
    assert.ok(pkg.scripts && pkg.scripts.test.includes("node --test"));
  });

  test(".github/workflows/ci.yml runs npm test on push and pull_request to main", () => {
    const ciYaml = fs.readFileSync(path.join(ROOT_DIR, ".github/workflows/ci.yml"), "utf8");
    assert.match(ciYaml, /push:/);
    assert.match(ciYaml, /pull_request:/);
    assert.match(ciYaml, /branches:\s*\[main\]/);
    assert.match(ciYaml, /npm test/);
  });

  test("All 5 SVG assets in assets/ are well-formed vector diagrams with accessibility titles", () => {
    const svgFiles = [
      "assets/hero-banner.svg",
      "assets/architecture-flow.svg",
      "assets/spec-overview.svg",
      "assets/sticker-presets.svg",
      "assets/roadmap-sprints.svg"
    ];
    for (const relPath of svgFiles) {
      const content = fs.readFileSync(path.join(ROOT_DIR, relPath), "utf8").trim();
      assert.match(content, /^<svg\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, `${relPath} must start with <svg xmlns="...">`);
      assert.match(content, /viewBox="0 0 \d+ \d+"/, `${relPath} must define viewBox`);
      assert.match(content, /<title[\s>]/, `${relPath} must include <title> for accessibility`);
      assert.match(content, /<desc[\s>]/, `${relPath} must include <desc> for accessibility`);
      assert.ok(content.endsWith("</svg>"), `${relPath} must end with </svg>`);
    }
  });

  test("README.md, SPEC.md, ROADMAP.md, and CONTRIBUTING.md local file links, Mermaid diagrams, and Sprint tasks are valid", () => {
    const readme = fs.readFileSync(path.join(ROOT_DIR, "README.md"), "utf8");
    const spec = fs.readFileSync(path.join(ROOT_DIR, "SPEC.md"), "utf8");
    const roadmap = fs.readFileSync(path.join(ROOT_DIR, "ROADMAP.md"), "utf8");
    const contributing = fs.readFileSync(path.join(ROOT_DIR, "CONTRIBUTING.md"), "utf8");

    // Verify Mermaid diagrams in README.md, SPEC.md, and ROADMAP.md
    const readmeMermaid = [...readme.matchAll(/```mermaid\n([\s\S]*?)```/g)].map(m => m[1]);
    assert.ok(readmeMermaid.length >= 4, `Expected at least 4 Mermaid diagrams in README.md, found ${readmeMermaid.length}`);

    const specMermaid = [...spec.matchAll(/```mermaid\n([\s\S]*?)```/g)].map(m => m[1]);
    assert.ok(specMermaid.length >= 2, `Expected at least 2 Mermaid diagrams in SPEC.md, found ${specMermaid.length}`);
    assert.ok(specMermaid.some(b => b.includes("sequenceDiagram")), "Expected sequenceDiagram in SPEC.md");

    const roadmapMermaid = [...roadmap.matchAll(/```mermaid\n([\s\S]*?)```/g)].map(m => m[1]);
    assert.ok(roadmapMermaid.length >= 2, `Expected at least 2 Mermaid diagrams in ROADMAP.md, found ${roadmapMermaid.length}`);
    assert.ok(roadmapMermaid.some(b => b.includes("gantt")), "Expected gantt sprint chart in ROADMAP.md");

    // Verify all 6 Sprints and task IDs exist in ROADMAP.md
    for (let s = 1; s <= 6; s++) {
      assert.match(roadmap, new RegExp(`Sprint ${s}`), `Expected Sprint ${s} in ROADMAP.md`);
      assert.match(roadmap, new RegExp(`S${s}-T1`), `Expected task S${s}-T1 in ROADMAP.md`);
    }

    // Verify all local markdown links [label](target) and img src="target" exist on disk
    const docsContent = [readme, spec, roadmap, contributing].join("\n");
    const mdLinks = [
      ...[...docsContent.matchAll(/\]\(([^)#\s]+)\)/g)].map(m => m[1]),
      ...[...docsContent.matchAll(/src=["']([^"']+)["']/g)].map(m => m[1])
    ].filter(href => !href.startsWith("http://") && !href.startsWith("https://") && !href.startsWith("mailto:"));

    assert.ok(mdLinks.length >= 14, "Expected local file links across documentation");
    for (const relTarget of mdLinks) {
      const targetPath = path.join(ROOT_DIR, relTarget);
      assert.ok(fs.existsSync(targetPath), `Broken local documentation link to "${relTarget}"`);
    }
  });

  test("Open-Source Non-Commercial Gate: Spec and docs contain zero pricing, payment, or commercial quote language", () => {
    const docFiles = ["README.md", "SPEC.md", "ROADMAP.md", "CONTRIBUTING.md", "CHANGELOG.md", "index.html"];
    const forbiddenPatterns = [
      /הצעת מחיר/,
      /\bדיון\b/,
      /paid tier/i,
      /request to pay/i,
      /pricing plan/i,
      /subscription fee/i
    ];
    for (const file of docFiles) {
      const content = fs.readFileSync(path.join(ROOT_DIR, file), "utf8");
      for (const pat of forbiddenPatterns) {
        assert.doesNotMatch(content, pat, `Forbidden commercial/quote pattern ${pat} found in ${file}`);
      }
    }
  });

  test("index.html includes SEO, OpenGraph, Twitter Card, favicon, and responsive CSS", () => {
    assert.match(htmlContent, /<link rel="canonical" href="https:\/\/rajwanyair\.github\.io\/barcode-label-studio\/"/);
    assert.match(htmlContent, /<meta property="og:title"/);
    assert.match(htmlContent, /<meta property="og:image"/);
    assert.match(htmlContent, /<meta name="twitter:card" content="summary_large_image"/);
    assert.match(htmlContent, /<link rel="icon" type="image\/svg\+xml"/);
  });
});

// ============================================================================
// 3. 1D BARCODE ENCODERS & DISPATCHER SUITE
// ============================================================================
describe("Code 128 Encoder (128B ASCII & 128C Numeric Compaction)", () => {
  test("Code 128 pattern table has 107 valid entries", () => {
    assert.equal(api.CODE128_PATTERNS.length, 107);
    for (let i = 0; i < 106; i++) {
      assert.equal(api.CODE128_PATTERNS[i].length, 11, `Pattern ${i} must be 11 modules`);
    }
    assert.equal(api.CODE128_PATTERNS[106].length, 13, "Stop pattern (106) must be 13 modules");
  });

  test("Encodes even-length numeric input in high-density Code 128C", () => {
    const res = api.encodeCode128("4820019472");
    assert.equal(res.error, undefined);
    assert.equal(res.modeLabel, "Code 128C (Numeric)");
    assert.equal(res.checksumLabel, "Mod 103: 5");
    assert.equal(res.bits.length, 90);
    assert.match(res.bits, /^[01]+$/);
  });

  test("Encodes ASCII text in Code 128B", () => {
    const res = api.encodeCode128("ABC-12");
    assert.equal(res.error, undefined);
    assert.equal(res.modeLabel, "Code 128B (ASCII)");
    assert.equal(res.displayText, "ABC-12");
    assert.equal(res.bits.length, 101);
  });

  test("Switches between Code 128B and Code 128C for mixed text with 4+ digits", () => {
    const res = api.encodeCode128("LOT-2026-A0");
    assert.equal(res.error, undefined);
    assert.equal(res.modeLabel, "Code 128 B+C");
    assert.equal(res.checksumLabel, "Mod 103: 95");
  });

  test("Rejects empty input and non-printable ASCII characters", () => {
    assert.ok(api.encodeCode128("").error);
    assert.ok(api.encodeCode128("HELLO\nWORLD").error);
    assert.ok(api.encodeCode128("PRICE€10").error);
  });
});

describe("Code 39 Encoder", () => {
  test("Encodes alphanumeric input and normalizes lowercase to uppercase", () => {
    const res = api.encodeCode39("sn-88419");
    assert.equal(res.error, undefined);
    assert.equal(res.displayText, "*SN-88419*");
    assert.equal(res.modeLabel, "Code 39");
    assert.match(res.checksumLabel, /^Mod 43: [0-9A-Z\-. $/+%]/);
    assert.match(res.bits, /^1001011011010.*0100101101101$/);
  });

  test("Flags unsupported symbols and Empty input, offering Code 128 fallback", () => {
    assert.ok(api.encodeCode39("").error);
    const res = api.encodeCode39("ITEM#1");
    assert.ok(res.error);
    assert.equal(res.canSwitchTo128, true);
  });
});

describe("EAN-13 Encoder & GS1 Check Digit", () => {
  test("Computes correct GS1 check digit for 12-digit input", () => {
    assert.equal(api.computeEan13CheckDigit("978020137962"), 4);
    const res = api.encodeEan13("978020137962");
    assert.equal(res.error, undefined);
    assert.equal(res.checksumLabel, "Check Digit: 4");
    assert.equal(res.bits.length, 95);
  });

  test("Detects incorrect 13th check digit and provides exact fixValue", () => {
    const bad = api.encodeEan13("9780201379629");
    assert.ok(bad.error);
    assert.equal(bad.fixValue, "9780201379624");
  });

  test("Rejects non-numeric or wrong-length input with Code 128 fallback", () => {
    const nonNum = api.encodeEan13("97802013796A");
    assert.ok(nonNum.error);
    assert.equal(nonNum.canSwitchTo128, true);

    const shortNum = api.encodeEan13("123456");
    assert.ok(shortNum.error);
    assert.equal(shortNum.canSwitchTo128, true);
  });
});

describe("ITF (Interleaved 2 of 5) Encoder & encodeCurrent Dispatcher", () => {
  test("Encodes even-length digits and auto-pads odd-length digits with leading zero", () => {
    const evenRes = api.encodeItf("4820019472");
    assert.equal(evenRes.error, undefined);
    assert.equal(evenRes.displayText, "4820019472");

    const oddRes = api.encodeItf("12345");
    assert.equal(oddRes.error, undefined);
    assert.equal(oddRes.displayText, "012345");
    assert.equal(oddRes.modeLabel, "ITF (0-padded)");
  });

  test("Rejects non-numeric input", () => {
    const res = api.encodeItf("1234A");
    assert.ok(res.error);
    assert.equal(res.canSwitchTo128, true);
  });

  test("encodeCurrent routes correctly across all 5 symbologies", () => {
    assert.equal(api.encodeCurrent("4820019472", "CODE128").modeLabel, "Code 128C (Numeric)");
    assert.equal(api.encodeCurrent("SN-10", "CODE39").modeLabel, "Code 39");
    assert.equal(api.encodeCurrent("978020137962", "EAN13").modeLabel, "EAN-13");
    assert.equal(api.encodeCurrent("1234", "ITF").modeLabel, "ITF-14 / 2of5");
    assert.match(api.encodeCurrent("HTTPS://EXAMPLE.COM", "QR").modeLabel, /^QR v\d/);
    assert.equal(api.encodeCurrent("4820019472", "UNKNOWN_DEFAULT").modeLabel, "Code 128C (Numeric)");
  });
});

// ============================================================================
// 4. QR CODE (ISO/IEC 18004) & GALOIS FIELD / REED-SOLOMON HELPERS SUITE
// ============================================================================
describe("QR Code Encoder & GF(256) Reed-Solomon Helpers", () => {
  test("gfMul, rsGeneratePoly, and rsEncode perform valid GF(256) polynomial arithmetic", () => {
    assert.equal(api.gfMul(0, 123), 0);
    assert.equal(api.gfMul(215, 0), 0);
    assert.equal(api.gfMul(1, 173), 173);
    assert.equal(api.gfMul(17, 29), api.gfMul(29, 17)); // Commutativity

    const poly7 = api.rsGeneratePoly(7);
    assert.equal(poly7.length, 8);
    assert.equal(poly7[poly7.length - 1], 1);

    const data = new Uint8Array([0x20, 0x5b, 0x0b, 0x78]);
    const encoded = api.rsEncode(data, 7);
    assert.equal(encoded.length, data.length + 7);
    assert.deepEqual([...encoded.slice(0, 4)], [...data]);
    assert.ok(encoded.slice(4).some(b => b !== 0), "Expected non-zero Reed-Solomon parity bytes");
  });

  test("qrGetVersionBitLen, qrEncodeAlpha, qrEncodeByte, qrTerminateAndPad, qrInterleave, and qrPlaceModules work accurately", () => {
    assert.equal(api.qrGetVersionBitLen(10, 1), 1);
    assert.equal(api.qrGetVersionBitLen(999, 1), null);

    const alphaBits = api.qrEncodeAlpha("AB1");
    assert.equal(alphaBits.length, 11 + 6);
    assert.equal(api.qrEncodeAlpha("A~B"), null);

    const byteBits = api.qrEncodeByte("Hi");
    assert.equal(byteBits.length, 16);

    const padded = api.qrTerminateAndPad("01000000", 4);
    assert.equal(padded.length, 32);
    assert.ok(padded.includes("11101100"), "Expected 0xEC pad codeword");

    const v1Info = api.QR_VERSION_INFO[1];
    const interleaved = api.qrInterleave(new Uint8Array(16).fill(0x41), v1Info, 1);
    assert.equal(interleaved.length, v1Info.total);

    const placed = api.qrPlaceModules(1, interleaved, 1);
    assert.equal(placed.size, 21);
    assert.equal(placed.modules.length, 21);
  });

  test("EncodeQR produces valid v1 and v2+ QR matrices and rejects empty or >v6 payloads", () => {
    const res1 = api.encodeQR("12345");
    assert.equal(res1.error, undefined);
    assert.equal(res1.modeLabel, "QR v1 (21×21)");
    assert.equal(res1.qrSize, 21);

    const res2 = api.encodeQR("https://rajwanyair.github.io/barcode-label-studio/");
    assert.equal(res2.error, undefined);
    assert.ok(res2.qrSize > 21);

    // Finder pattern check
    const m = res1.qrModules;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        assert.equal(m[r][c], (isOuter || isInner) ? 1 : 0);
      }
    }
    assert.equal(m[res1.qrSize - 8][8], 1, "Dark module at (size-8, 8)");

    assert.ok(api.encodeQR("").error);
    assert.ok(api.encodeQR("X".repeat(250)).error);
  });
});

// ============================================================================
// 5. SVG COMPOSITOR, CANVAS RASTERIZER, LOGO & CUSTOM TEXT SUITE
// ============================================================================
describe("SVG Compositor, Custom Text, Logo Overlay & Canvas Helpers", () => {
  test("buildBarcodeSvgHtml renders 1D and QR with XML escaping, logos, and custom text (top & bottom)", () => {
    const built1D = api.buildBarcodeSvgHtml(
      "A&B<C>",
      "CODE128",
      2,
      80,
      12,
      14,
      true,
      "data:image/png;base64,FAKELOGO",
      "Property of <Acme>",
      "top"
    );
    assert.equal(built1D.error, undefined);
    assert.match(built1D.svgHtml, /A&amp;B&lt;C&gt;/);
    assert.match(built1D.svgHtml, /Property of &lt;Acme&gt;/);
    assert.match(built1D.svgHtml, /<image href="data:image\/png;base64,FAKELOGO"/);

    const builtQRBottom = api.buildBarcodeSvgHtml(
      "HELLO",
      "QR",
      2,
      80,
      12,
      14,
      true,
      "data:image/png;base64,QRLOGO",
      "Bottom Tag & Co",
      "bottom"
    );
    assert.equal(builtQRBottom.error, undefined);
    assert.match(builtQRBottom.svgHtml, /<image href="data:image\/png;base64,QRLOGO"/);
    assert.match(builtQRBottom.svgHtml, /Bottom Tag &amp; Co/);
  });

  test("svgElementToCanvas rasterizes SVG element at requested DPR", () => {
    const mockSvg = elementsById.get("barcodeSvg");
    mockSvg.setAttribute("width", "180");
    mockSvg.setAttribute("height", "90");
    let renderedCanvas = null;
    api.svgElementToCanvas(mockSvg, 2, (canvas) => {
      renderedCanvas = canvas;
    });
    assert.ok(renderedCanvas, "Expected svgElementToCanvas callback to receive canvas");
    assert.equal(renderedCanvas.width, 360);
    assert.equal(renderedCanvas.height, 180);
  });

  test("safeFileSlug sanitizes filenames and parseNumericSuffix parses serial ranges", () => {
    assert.equal(api.safeFileSlug("SN/100:200?test"), "SN_100_200_test");
    assert.equal(api.safeFileSlug(""), "barcode");
    assert.equal(api.safeFileSlug("A".repeat(80)).length, 40);

    assert.deepEqual({ ...api.parseNumericSuffix("SN-00105") }, { prefix: "SN-", num: 105, digits: 5 });
    assert.equal(api.parseNumericSuffix("NO-DIGITS"), null);
  });
});

// ============================================================================
// 6. UI CONTROLLERS, BATCH PIPELINE, FILE PARSER, I18N & THEME SUITE
// ============================================================================
describe("UI Controllers, Batch Pipeline, File Parser, I18N (EN/HE) & Theme (Light/Dark)", () => {
  test("setLanguage, getLanguage, setTheme, getTheme, and updateToolbarControls manage bilingual RTL/LTR and dark/light state", () => {
    assert.equal(api.setLanguage("he"), "he");
    assert.equal(api.getLanguage(), "he");
    assert.equal(docElement.getAttribute("lang"), "he");
    assert.equal(docElement.getAttribute("dir"), "rtl");
    assert.equal(storageMap.get("bls_lang"), "he");

    assert.equal(api.setTheme("dark"), "dark");
    assert.equal(api.getTheme(), "dark");
    assert.equal(docElement.getAttribute("data-theme"), "dark");
    assert.equal(storageMap.get("bls_theme"), "dark");

    api.updateToolbarControls();
    assert.equal(elementsById.get("langToggleBtn").textContent, "🌐 English");
    assert.equal(elementsById.get("themeToggleBtn").textContent, "☀️ מצב בהיר");

    assert.equal(api.setLanguage("en"), "en");
    assert.equal(api.setTheme("light"), "light");
    assert.equal(docElement.getAttribute("lang"), "en");
    assert.equal(docElement.getAttribute("dir"), "ltr");
    assert.equal(docElement.getAttribute("data-theme"), "light");
  });

  test("showToast, batchShowToast, renderHistory, and renderBarcode update Single Mode UI state", () => {
    api.showToast("Saved!");
    assert.equal(elementsById.get("statusToast").textContent, "Saved!");

    api.batchShowToast("Batch ready!");
    assert.equal(elementsById.get("batchStatusToast").textContent, "Batch ready!");

    api.renderHistory();
    assert.ok(elementsById.get("historyList").children.length >= 3);

    // Valid render
    elementsById.get("barcodeInput").value = "4820019472";
    elementsById.get("symbologySelect").value = "CODE128";
    api.renderBarcode();
    assert.equal(elementsById.get("metaMode").textContent, "Code 128C (Numeric)");
    assert.equal(elementsById.get("downloadPngBtn").disabled, false);

    // Error state render (wrong EAN-13 check digit)
    elementsById.get("barcodeInput").value = "9780201379629";
    elementsById.get("symbologySelect").value = "EAN13";
    api.renderBarcode();
    assert.equal(elementsById.get("downloadPngBtn").disabled, true);
    assert.match(elementsById.get("autoFixBtn").textContent, /9780201379624/);

    // Restore valid state
    elementsById.get("barcodeInput").value = "4820019472";
    elementsById.get("symbologySelect").value = "CODE128";
    api.renderBarcode();
  });

  test("collectBatchValues, refreshBatchSheet, and parseFileAndAdd process text, CSV, and Excel batch inputs", () => {
    elementsById.get("batchTextarea").value = "SN-1001\nSN-1002\nSN-1003";
    const collected = api.collectBatchValues();
    assert.deepEqual([...collected], ["SN-1001", "SN-1002", "SN-1003"]);

    api.refreshBatchSheet();
    assert.equal(elementsById.get("batchCount").textContent, 3);
    assert.equal(elementsById.get("batchErrors").textContent, 0);
    assert.equal(elementsById.get("stickerGrid").children.length, 3);

    // Test CSV file ingestion via parseFileAndAdd
    elementsById.get("batchTextarea").value = "";
    api.parseFileAndAdd({
      name: "serials.csv",
      _content: "CSV-01,extra\nCSV-02,extra\n"
    });
    assert.equal(elementsById.get("batchCount").textContent, 2);
    assert.match(elementsById.get("fileNameDisplay").textContent, /serials\.csv \(2 values\)/);

    // Test XLSX file ingestion via parseFileAndAdd
    api.parseFileAndAdd({
      name: "inventory.xlsx",
      _buffer: new ArrayBuffer(8)
    });
    assert.equal(elementsById.get("batchCount").textContent, 2);
    assert.match(elementsById.get("fileNameDisplay").textContent, /inventory\.xlsx \(2 values\)/);

    // Test skipCountInput offset in refreshBatchSheet
    elementsById.get("skipCountInput").value = "3";
    api.refreshBatchSheet();
    assert.equal(elementsById.get("stickerGrid").children.length, 2 + 3);
    assert.equal(elementsById.get("stickerGrid").children[0].className, "sticker-cell skipped");
    elementsById.get("skipCountInput").value = "0";
  });

  test("checkBarcodePrintability, cycleStageZoom, toggleLaserScanline, and handleKeyboardShortcuts enhance studio UX", () => {
    const okGrade = api.checkBarcodePrintability(16, 2, "CODE128");
    assert.equal(okGrade.ok, true);
    assert.match(okGrade.label, /ISO/);

    const warnGrade = api.checkBarcodePrintability(0, 3, "CODE128");
    assert.equal(warnGrade.ok, false);

    assert.equal(api.cycleStageZoom(), 1.35);
    assert.equal(elementsById.get("stageZoomBtn").textContent, "🔍 135%");
    assert.equal(api.cycleStageZoom(), 1.75);
    assert.equal(api.cycleStageZoom(), 1);

    assert.equal(api.toggleLaserScanline(), true);
    assert.equal(elementsById.get("stickerContainer").classList.contains("scanline-on"), true);
    assert.equal(api.toggleLaserScanline(), false);

    assert.equal(api.handleKeyboardShortcuts({ ctrlKey: true, key: "k" }), "focus");
    assert.equal(api.handleKeyboardShortcuts({ altKey: true, key: "l" }), "lang");
    assert.equal(api.getLanguage(), "he");
    assert.equal(api.handleKeyboardShortcuts({ altKey: true, key: "l" }), "lang");
    assert.equal(api.getLanguage(), "en");
    assert.equal(api.handleKeyboardShortcuts({ altKey: true, key: "t" }), "theme");
    assert.equal(api.getTheme(), "dark");
    assert.equal(api.handleKeyboardShortcuts({ altKey: true, key: "t" }), "theme");
    assert.equal(api.getTheme(), "light");
  });
});


