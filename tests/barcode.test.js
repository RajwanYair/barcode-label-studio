const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT_DIR = path.resolve(__dirname, "..");
const INDEX_HTML_PATH = path.join(ROOT_DIR, "index.html");
const htmlContent = fs.readFileSync(INDEX_HTML_PATH, "utf8");

/**
 * Extract the inline application <script> from index.html and evaluate it
 * inside a minimal sandboxed DOM context so tests run against the real code.
 */
function loadBarcodeApi() {
  const scriptMatches = [...htmlContent.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(scriptMatches.length >= 1, "Expected inline <script> block in index.html");
  const appScript = scriptMatches[scriptMatches.length - 1][1];

  const makeMockElement = (id = "") => {
    const attrs = new Map();
    return {
      id,
      value: id === "barcodeInput" ? "4820019472" : (id === "symbologySelect" || id === "batchSymbology" ? "CODE128" : "2"),
      checked: true,
      disabled: false,
      textContent: "",
      placeholder: "",
      innerHTML: "",
      style: {},
      dataset: { tab: "single-tab", val: "4820019472", sym: "CODE128" },
      classList: {
        add() {},
        remove() {},
        contains() { return false; }
      },
      setAttribute(k, v) { attrs.set(k, String(v)); },
      getAttribute(k) { return attrs.has(k) ? attrs.get(k) : "200"; },
      addEventListener() {},
      appendChild() {},
      querySelectorAll() { return []; },
      focus() {},
      click() {}
    };
  };

  const elementsById = new Map();
  const docElement = makeMockElement("html");
  const sandbox = {
    globalThis: null,
    window: {
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
      createElement(tag) {
        return makeMockElement(tag);
      }
    },
    XMLSerializer: class {
      serializeToString() { return "<svg></svg>"; }
    },
    Blob: class {},
    URL: {
      createObjectURL() { return "blob:mock"; },
      revokeObjectURL() {}
    },
    Image: class {},
    FileReader: class {},
    navigator: { clipboard: { write: async () => {} } },
    setTimeout,
    clearTimeout
  };
  sandbox.globalThis = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(appScript, sandbox, { filename: "index.html" });

  assert.ok(sandbox.__BARCODE_API__, "Expected __BARCODE_API__ to be exposed on globalThis");
  return { api: sandbox.__BARCODE_API__, requestedIds: [...elementsById.keys()], docElement };
}

const { api, requestedIds, docElement } = loadBarcodeApi();

describe("Repository & HTML Structure Integrity", () => {
  test("Required standard GitHub documentation files exist and are non-empty", () => {
    const requiredFiles = [
      "index.html",
      "README.md",
      "LICENSE",
      "CONTRIBUTING.md",
      "CODE_OF_CONDUCT.md",
      "SECURITY.md",
      "CHANGELOG.md",
      ".gitignore",
      ".github/ISSUE_TEMPLATE/bug_report.md",
      ".github/ISSUE_TEMPLATE/feature_request.md",
      ".github/PULL_REQUEST_TEMPLATE.md",
      "assets/hero-banner.svg",
      "assets/architecture-flow.svg",
      "assets/sticker-presets.svg"
    ];

    for (const relPath of requiredFiles) {
      const fullPath = path.join(ROOT_DIR, relPath);
      assert.ok(fs.existsSync(fullPath), `Missing required file: ${relPath}`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 20, `File ${relPath} is unexpectedly empty (${stat.size} bytes)`);
    }

    const readme = fs.readFileSync(path.join(ROOT_DIR, "README.md"), "utf8");
    assert.match(readme, /```mermaid/, "Expected Mermaid diagrams in README.md");
    assert.match(readme, /https:\/\/rajwanyair\.github\.io\/barcode-label-studio\//, "Expected live GitHub Pages URL in README.md");
  });

  test("All DOM element IDs queried during initialization exist in index.html", () => {
    assert.ok(requestedIds.length > 0, "Expected script to query DOM element IDs");
    for (const id of requestedIds) {
      const idPattern = new RegExp(`id=["']${id}["']`);
      assert.match(htmlContent, idPattern, `DOM element id="${id}" is referenced in JS but missing in HTML`);
    }
  });
});

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
    // StartC (11) + 5 pairs * 11 (55) + Checksum (11) + Stop (13) = 90 modules
    assert.equal(res.bits.length, 90);
    assert.match(res.bits, /^[01]+$/);
  });

  test("Encodes ASCII text in Code 128B", () => {
    const res = api.encodeCode128("ABC-12");
    assert.equal(res.error, undefined);
    assert.equal(res.modeLabel, "Code 128B (ASCII)");
    assert.equal(res.displayText, "ABC-12");
    // StartB (11) + 6 chars * 11 (66) + Checksum (11) + Stop (13) = 101 modules
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

  test("Flags unsupported symbols and offers Code 128 fallback", () => {
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
    // Standard EAN-13 is always 95 modules (3 + 42 + 5 + 42 + 3)
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

describe("ITF (Interleaved 2 of 5) Encoder", () => {
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
});

describe("SVG Rendering, Range Parsing & Sticker Sheet Presets", () => {
  test("buildBarcodeSvgHtml produces valid SVG and escapes XML special characters", () => {
    const built = api.buildBarcodeSvgHtml("A&B<C>", "CODE128", 2, 80, 12, 14, true);
    assert.equal(built.error, undefined);
    assert.match(built.svgHtml, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(built.svgHtml, /A&amp;B&lt;C&gt;/);
    assert.ok(!built.svgHtml.includes("A&B<C>"), "Raw unescaped XML characters must not appear in SVG text");
  });

  test("parseNumericSuffix extracts prefix, numeric value, and zero-padding width", () => {
    assert.deepEqual({ ...api.parseNumericSuffix("SN-00105") }, {
      prefix: "SN-",
      num: 105,
      digits: 5
    });
    assert.deepEqual({ ...api.parseNumericSuffix("4820019472") }, {
      prefix: "",
      num: 4820019472,
      digits: 10
    });
    assert.equal(api.parseNumericSuffix("NO-TRAILING-DIGITS"), null);
  });

  test("STICKER_LAYOUTS defines all standard A4 and US Letter presets", () => {
    const expectedKeys = ["a4-3x8", "a4-2x7", "a4-4x10", "letter-3x10", "letter-2x7", "flow"];
    for (const key of expectedKeys) {
      const layout = api.STICKER_LAYOUTS[key];
      assert.ok(layout, `Missing sticker layout preset: ${key}`);
      assert.ok(layout.cols >= 1, `Invalid cols for ${key}`);
      assert.ok(layout.rows >= 1, `Invalid rows for ${key}`);
      assert.match(layout.pageW, /^\d+(\.\d+)?mm$/);
      assert.match(layout.pageH, /^\d+(\.\d+)?mm$/);
    }
  });
});

describe("QR Code Encoder (ISO/IEC 18004 Model 2, Versions 1–6)", () => {
  test("EncodeQR produces valid v1 QR for short numeric input", () => {
    const res = api.encodeQR("12345");
    assert.equal(res.error, undefined);
    assert.equal(res.modeLabel, "QR v1 (21×21)");
    assert.equal(res.qrSize, 21);
    assert.equal(res.qrModules.length, 21);
    assert.equal(res.qrModules[0].length, 21);
  });

  test("EncodeQR produces valid v2 QR for slightly larger input", () => {
    const res = api.encodeQR("HELLO WORLD 1234");
    assert.equal(res.error, undefined);
    assert.match(res.modeLabel, /^QR v\d \(\d+×\d+\)/);
    assert.ok(res.qrSize >= 21);
  });

  test("QR finder patterns are placed correctly", () => {
    const res = api.encodeQR("TEST");
    assert.equal(res.error, undefined);
    const m = res.qrModules;
    // Top-left finder pattern: 7x7 block with outer dark ring
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (isOuter || isInner) assert.equal(m[r][c], 1, `Finder TL (${r},${c})`);
        else assert.equal(m[r][c], 0, `Finder TL gap (${r},${c})`);
      }
    }
    // Dark module at (s-8, 8)
    assert.equal(m[res.qrSize - 8][8], 1, "Dark module");
  });

  test("QR rejects empty input", () => {
    assert.ok(api.encodeQR("").error);
  });
});

describe("Logo Upload & SVG Embedded Image", () => {
  test("buildBarcodeSvgHtml 1D with logo injects image above bars", () => {
    const built = api.buildBarcodeSvgHtml("4820019472", "CODE128", 2, 80, 12, 14, true, "data:image/png;base64,FAKELOGO");
    assert.equal(built.error, undefined);
    assert.match(built.svgHtml, /<image href="data:image\/png;base64,FAKELOGO"/);
    assert.ok(built.totalHeight > 90);
  });

  test("buildBarcodeSvgHtml QR with logo centers logo over code", () => {
    const built = api.buildBarcodeSvgHtml("HELLO", "QR", 2, 80, 12, 14, false, "data:image/png;base64,QRLOGO");
    assert.equal(built.error, undefined);
    assert.match(built.svgHtml, /<image href="data:image\/png;base64,QRLOGO"/);
  });

  test("buildBarcodeSvgHtml without logo does not inject image", () => {
    const built = api.buildBarcodeSvgHtml("4820019472", "CODE128", 2, 80, 12, 14, true);
    assert.equal(built.error, undefined);
    assert.ok(!built.svgHtml.includes("<image href="));
  });
});

describe("Bilingual (English/Hebrew RTL), Dark/Light Theme & Responsive Design", () => {
  test("I18N dictionary has matching keys for English (en) and Hebrew (he)", () => {
    assert.ok(api.I18N && api.I18N.en && api.I18N.he);
    const enKeys = Object.keys(api.I18N.en).sort();
    const heKeys = Object.keys(api.I18N.he).sort();
    assert.deepEqual(enKeys, heKeys, "English and Hebrew dictionaries must have identical key sets");
    assert.equal(api.I18N.he.appTitle, "סטודיו לתוויות ברקוד");
  });

  test("setLanguage switches between English (ltr) and Hebrew (rtl)", () => {
    assert.equal(api.setLanguage("he"), "he");
    assert.equal(api.getLanguage(), "he");
    assert.equal(docElement.getAttribute("lang"), "he");
    assert.equal(docElement.getAttribute("dir"), "rtl");

    assert.equal(api.setLanguage("en"), "en");
    assert.equal(api.getLanguage(), "en");
    assert.equal(docElement.getAttribute("lang"), "en");
    assert.equal(docElement.getAttribute("dir"), "ltr");
  });

  test("setTheme switches between light and dark modes", () => {
    assert.equal(api.setTheme("dark"), "dark");
    assert.equal(api.getTheme(), "dark");
    assert.equal(docElement.getAttribute("data-theme"), "dark");

    assert.equal(api.setTheme("light"), "light");
    assert.equal(api.getTheme(), "light");
    assert.equal(docElement.getAttribute("data-theme"), "light");
  });

  test("index.html includes responsive media queries for tablet (1024px) and mobile (640px) and dark theme rules", () => {
    assert.match(htmlContent, /@media\s*\(max-width:\s*1024px\)/, "Expected tablet responsive breakpoint");
    assert.match(htmlContent, /@media\s*\(max-width:\s*640px\)/, "Expected mobile responsive breakpoint");
    assert.match(htmlContent, /\[data-theme="dark"\]/, "Expected dark theme CSS custom properties");
  });
});

