const menu=document.querySelector("#menu"),nav=document.querySelector("#nav");
menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));});
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");}));
const el=id=>document.getElementById(id);
function values(){const raw=Math.max(0,Number(el("area").value)||0),loss=Math.min(100,Math.max(0,Number(el("loss").value)||0)),area=raw*(el("unit").value==="pyeong"?3.305785:1);return {area,loss,total:area*(1+loss/100)};}
function update(){el("result").textContent=values().total.toLocaleString("ko-KR",{minimumFractionDigits:2,maximumFractionDigits:2})+" ㎡";}
["area","loss","unit"].forEach(id=>el(id).addEventListener("input",update));
document.querySelectorAll("[data-product]").forEach(b=>b.addEventListener("click",()=>{el("product").value=b.dataset.product;el("quote").scrollIntoView();el("product").focus({preventScroll:true});}));
el("copy").addEventListener("click",async()=>{const v=values(),text=`석산리노베이션 견적 요청\n제품: ${el("product").value}\n시공 면적: ${v.area.toFixed(2)}㎡\n여유분: ${v.loss}%\n예상 필요 면적: ${v.total.toFixed(2)}㎡\n추가 요청: ${el("memo").value}`;try{await navigator.clipboard.writeText(text);el("status").textContent="복사했습니다. 실제 문의는 전송되지 않았습니다.";}catch{const t=document.createElement("textarea");t.value=text;el("status").replaceChildren(t);t.select();el("status").append("자동 복사가 지원되지 않습니다. 선택된 내용을 직접 복사하세요.");}});
update();