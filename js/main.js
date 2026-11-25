/* SEOKSAN RENOVATION — v2 UI / quote calculator */
"use strict";

const byId = (id) => document.getElementById(id);
const menuButton = byId("menu-toggle");
const primaryNav = byId("primary-nav");

if (menuButton && primaryNav) {
  menuButton.addEventListener("click", () => {
    const open = primaryNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  });
  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      primaryNav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "메뉴 열기");
    });
  });
}

const product = byId("product");
const unit = byId("unit");
const area = byId("area");
const loss = byId("loss");
const stalls = byId("stalls");
const spec = byId("spec");
const memo = byId("memo");
const siteRegion = byId("site-region");
const siteDistrict = byId("site-district");
const receiverName = byId("receiver-name");
const receiverPhone = byId("receiver-phone");
const companyName = byId("company-name");
const locationGuide = byId("location-guide");
const result = byId("result");
const resultTitle = byId("result-title");
const resultHint = byId("result-hint");
const status = byId("form-status");
const specLabel = byId("spec-label");
const quoteSection = byId("quote");
const fieldWraps = {
  unit: byId("unit-wrap"),
  area: byId("area-wrap"),
  loss: byId("loss-wrap"),
  stalls: byId("stalls-wrap")
};
const specLabels = {
  "석재단열패널": "제품 조건 (석재 종류·단열재·두께 등)",
  "실내벽체단열패널": "제품 조건 (단열재·두께·표면 마감 등)",
  "SPC 마루": "제품 조건 (두께·컬러·패턴 등)",
  "화장실 큐비클": "제품 조건 (규격·재질·부속품 등)"
};

const format = (n, digits=2) => n.toLocaleString("ko-KR", {
  minimumFractionDigits: digits, maximumFractionDigits: digits
});

function getQuote() {
  const isCubicle = product.value === "화장실 큐비클";
  const rawArea = Math.max(0, Number(area.value) || 0);
  const sqm = rawArea * (unit.value === "pyeong" ? 3.305785 : 1);
  const lossPercent = Math.max(0, Math.min(100, Number(loss.value) || 0));
  const stallCount = Math.max(0, Math.floor(Number(stalls.value) || 0));
  return {
    isCubicle, sqm, lossPercent, stallCount,
    total: sqm * (1 + lossPercent / 100)
  };
}

function renderQuote() {
  const q = getQuote();
  for (const name of ["unit", "area", "loss"]) fieldWraps[name].hidden = q.isCubicle;
  fieldWraps.stalls.hidden = !q.isCubicle;
  specLabel.textContent = specLabels[product.value] || "제품 조건";
  const insulationProduct = ["석재단열패널", "실내벽체단열패널"].includes(product.value);
  locationGuide.textContent = insulationProduct
    ? "단열패널은 현장 지역과 건축물 용도·설계 조건에 따라 필요한 단열 사양이 달라질 수 있습니다. 지역 정보만으로 단열재와 견적이 자동 확정되지는 않으며, 담당자가 검토 후 안내합니다."
    : "설치 지역은 납품 운송 조건 및 현장 상담을 위한 정보입니다. 최종 견적은 담당자 확인 후 안내합니다.";
  resultTitle.textContent = q.isCubicle ? "예상 필요 칸 수" : "여유분 포함 예상 필요 면적";
  result.textContent = q.isCubicle ? `${q.stallCount.toLocaleString("ko-KR")}칸` : `${format(q.total)} ㎡`;
  resultHint.textContent = q.isCubicle
    ? "칸 수·규격·부속품·현장 조건을 기준으로 최종 견적을 확인합니다."
    : "실제 자재 수량은 제품 규격, 재단, 시공 조건 등에 따라 달라질 수 있습니다.";
}

function pickProduct(name) {
  product.value = name;
  renderQuote();
  quoteSection.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => product.focus({preventScroll: true}), 350);
}

document.querySelectorAll("[data-product]").forEach((button) => {
  button.addEventListener("click", () => pickProduct(button.dataset.product));
});
document.querySelectorAll("[data-product-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    pickProduct(link.dataset.productLink);
  });
});
[product, unit, area, loss, stalls].forEach((element) => {
  element.addEventListener("change", renderQuote);
  element.addEventListener("input", renderQuote);
});

function makeRequestText() {
  const q = getQuote();
  const rows = [
    "[석산리노베이션 견적 요청 초안]",
    "",
    `제품: ${product.value}`,
    `설치 현장 지역: ${siteRegion.value} ${siteDistrict.value.trim()}`,
    `견적 받는 분: ${receiverName.value.trim()}`,
    `견적 받는 분 전화번호: ${receiverPhone.value.trim()}`,
    `업체명: ${companyName.value.trim() || "미기재"}`
  ];
  if (q.isCubicle) {
    rows.push(`예상 칸 수: ${q.stallCount.toLocaleString("ko-KR")}칸`);
  } else {
    rows.push(`시공 예정 면적: ${format(q.sqm)}㎡ (${format(q.sqm / 3.305785)}평)`);
    rows.push(`여유분: ${q.lossPercent}%`);
    rows.push(`예상 필요 면적: ${format(q.total)}㎡`);
  }
  rows.push(`제품 조건: ${spec.value.trim() || "미기재"}`);
  rows.push(`추가 요청: ${memo.value.trim() || "미기재"}`);
  rows.push("", "※ 이 내용은 홈페이지에서 자동 전송되지 않았습니다.");
  return rows.join("\n");
}

async function copyQuote(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (_) { /* fallback */ }
  }
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.cssText = "position:fixed;left:-9999px;top:0;";
  document.body.appendChild(helper);
  helper.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
  helper.remove();
  return ok;
}

byId("quote-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const q = getQuote();
  if ((!q.isCubicle && q.sqm <= 0) || (q.isCubicle && q.stallCount < 1)) {
    status.textContent = q.isCubicle ? "칸 수를 1 이상 입력해 주세요." : "시공 면적을 0보다 크게 입력해 주세요.";
    (q.isCubicle ? stalls : area).focus();
    return;
  }
  const requiredFields = [
    [siteRegion, "설치 지역(시·도)을 선택해 주세요."],
    [siteDistrict, "설치 지역(시·군·구)을 입력해 주세요."],
    [receiverName, "견적 받는 분의 성함을 입력해 주세요."],
    [receiverPhone, "견적 받는 분의 전화번호를 입력해 주세요."]
  ];
  for (const [element, message] of requiredFields) {
    if (!element.value.trim()) {
      status.textContent = message;
      element.focus();
      return;
    }
  }
  const digits = receiverPhone.value.replace(/\D/g, "");
  if (!/^0\d{8,10}$/.test(digits)) {
    status.textContent = "전화번호를 확인해 주세요. 예: 010-1234-5678 또는 02-123-4567";
    receiverPhone.focus();
    return;
  }
  const copied = await copyQuote(makeRequestText());
  status.textContent = copied
    ? "견적 요청 내용이 복사되었습니다. 실제로 전송되지는 않았습니다."
    : "자동 복사가 지원되지 않습니다. 브라우저 보안 설정을 확인해 주세요.";
});
renderQuote();
