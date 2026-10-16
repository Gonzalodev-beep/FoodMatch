// ===== Datos demostrativos (ficticios) =====
const REST=[
 {id:1,n:"Sabor Sanjuanino",t:"Criolla",e:"🍛",c:"#FCE3C2",p:16,r:4.3,d:"local,delivery",o:["solo","amigos","familia"],lat:-12.1565,lng:-76.9718,combo:"Menú del día"},
 {id:2,n:"Pollería El Brasero",t:"Pollos y parrillas",e:"🍗",c:"#F9D3CB",p:24,r:4.5,d:"local,delivery",o:["amigos","familia"],lat:-12.1602,lng:-76.9689,combo:"1/4 pollo + papas"},
 {id:3,n:"Cevichería La Caleta",t:"Marina",e:"🐟",c:"#CDE8F0",p:32,r:4.6,d:"local,delivery",o:["amigos","familia","cita"],lat:-12.1531,lng:-76.9772,combo:"Ceviche clásico"},
 {id:4,n:"Chifa Dragón Dorado",t:"Chifa",e:"🥡",c:"#F5E0A6",p:22,r:4.1,d:"local,delivery",o:["amigos","familia","solo"],lat:-12.1588,lng:-76.9651,combo:"Aeropuerto + chaufa"},
 {id:5,n:"Trattoria Nonna Lima",t:"Pizza y pasta",e:"🍝",c:"#F6CFCF",p:45,r:4.7,d:"local",o:["cita","amigos"],lat:-12.1499,lng:-76.9801,combo:"Pasta + copa de vino"},
 {id:6,n:"Burger Barrio",t:"Rápida",e:"🍔",c:"#FBE0B0",p:18,r:3.9,d:"delivery,local",o:["solo","amigos"],lat:-12.1624,lng:-76.9733,combo:"Combo clásico"},
 {id:7,n:"Verde Fresco",t:"Saludable",e:"🥗",c:"#D6EBCB",p:26,r:4.4,d:"local,delivery",o:["solo","cita"],lat:-12.1547,lng:-76.9694,combo:"Bowl + jugo natural"},
 {id:8,n:"Rincón Criollo Doña Rosa",t:"Criolla",e:"🍲",c:"#EBD9F0",p:12,r:4.0,d:"delivery,local",o:["solo","familia"],lat:-12.1651,lng:-76.9702,combo:"Menú económico"},
 {id:9,n:"Parrilla Los Andes",t:"Pollos y parrillas",e:"🥩",c:"#F2CDBE",p:58,r:4.8,d:"local",o:["cita","familia","amigos"],lat:-12.1475,lng:-76.9755,combo:"Parrilla para dos"},
 {id:10,n:"Pizza Express SJM",t:"Pizza y pasta",e:"🍕",c:"#F9D9C0",p:20,r:3.8,d:"delivery",o:["amigos","solo"],lat:-12.1610,lng:-76.9745,combo:"Pizza personal + gaseosa"}
];
const IGV=0.18, DEF={lat:-12.1565,lng:-76.9718};
const $=s=>document.querySelector(s);
let pos={...DEF}, modo="todas", cart=[], metodo="", favs=load("fm_favs",[]);

function load(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove("show"),2600)}
const S=n=>"S/ "+n.toFixed(2);

// ===== Distancia y envío =====
function km(a,b){const R=6371,rad=x=>x*Math.PI/180,dLa=rad(b.lat-a.lat),dLo=rad(b.lng-a.lng);
 const h=Math.sin(dLa/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
const envio=d=>Math.round((3+1.5*d)*2)/2;

// ===== Filtro + coincidencia =====
function calcular(){
 const pres=+$("#presupuesto").value, tipo=$("#tipo").value, oc=$("#ocasion").value, cal=+$("#calif").value, ord=$("#orden").value;
 let res=REST.map(r=>({...r,dist:km(pos,r)}))
  .filter(r=>r.p<=pres && r.r>=cal && (modo==="todas"||r.d.includes(modo)));
 res.forEach(r=>{
  let s=40;
  s+= (tipo==="todas"||r.t===tipo)?20:0;
  s+= (oc==="todas"||r.o.includes(oc))?15:0;
  s+= Math.round((1-r.p/pres)*10)+Math.round((r.r-3)*5)*1;
  s-= Math.min(10,Math.round(r.dist*3));
  r.m=Math.max(35,Math.min(99,s));
 });
 if(tipo!=="todas") res=res.filter(r=>r.t===tipo);
 if(oc!=="todas") res=res.filter(r=>r.o.includes(oc));
 const f={match:(a,b)=>b.m-a.m,precio:(a,b)=>a.p-b.p,dist:(a,b)=>a.dist-b.dist,calif:(a,b)=>b.r-a.r}[ord];
 return res.sort(f);
}
function tarjeta(r){
 const ef=favs.includes(r.id), env=envio(r.dist), puedeDel=r.d.includes("delivery");
 return `<article class="card">
  <div class="pic" style="background:${r.c}"><span class="match">${r.m}% coincide</span>
   <button class="fav" data-fav="${r.id}" aria-label="${ef?"Quitar de favoritos":"Guardar en favoritos"}">${ef?"❤️":"🤍"}</button>${r.e}</div>
  <div class="body"><h3>${r.n}</h3>
   <div class="meta">★ ${r.r.toFixed(1)} · ${r.dist.toFixed(1)} km · ${r.combo}</div>
   <div class="tags"><span class="tag">${r.t}</span>${r.d.includes("local")?'<span class="tag">En local</span>':''}${puedeDel?'<span class="tag">Delivery</span>':''}</div>
   <div class="prices"><span>Plato promedio <b>${S(r.p)}</b></span><span>${puedeDel?"Envío <b>"+S(env)+"</b>":"Solo en local"}</span></div>
   <div class="acts">${puedeDel?`<button class="btn" data-add="${r.id}">Pedir</button>`:`<button class="btn" data-res="${r.id}">Reservar</button>`}
   <button class="btn sec" data-share="${r.id}" aria-label="Compartir ${r.n}">Compartir</button></div></div></article>`;
}
function pintar(){
 const res=calcular(), pres=$("#presupuesto").value;
 $("#presupuestoVal").textContent="S/ "+pres;
 $("#resumen").textContent=res.length?`${res.length} lugar(es) dentro de S/ ${pres} cerca de ti.`:"";
 $("#lista").innerHTML=res.length?res.map(tarjeta).join(""):`<div class="empty"><h3>No hay lugares con esos filtros</h3><p>Sube tu presupuesto o baja la calificación mínima para ver más opciones.</p></div>`;
 const fv=REST.filter(r=>favs.includes(r.id)).map(r=>({...r,dist:km(pos,r),m:(res.find(x=>x.id===r.id)||{}).m||"—"}));
 $("#favLista").innerHTML=fv.length?fv.map(tarjeta).join(""):`<div class="empty">Aún no guardas favoritos. Toca el corazón en cualquier tarjeta.</div>`;
}

// ===== Carrito =====
function pintarCarrito(){
 $("#cartCount").textContent=cart.reduce((a,i)=>a+i.q,0);
 const p=$("#carritoPanel");
 if(!cart.length){p.innerHTML=`<h3>Tu bolsa está vacía</h3><p class="meta" style="margin-top:6px">Elige un restaurante con delivery y toca «Pedir».</p>`;pintarPago(null);return}
 const rest=REST.find(r=>r.id===cart[0].id), d=km(pos,rest), env=envio(d);
 const comida=cart.reduce((a,i)=>a+i.p*i.q,0), imp=comida*IGV, total=comida+env+imp;
 p.innerHTML=`<h3>${rest.n}</h3>`+cart.map((i,ix)=>`<div class="line"><span>${i.combo}<br><small class="meta">${S(i.p)} c/u</small></span>
  <span class="qty"><button data-q="${ix}" data-d="-1" aria-label="Quitar uno">−</button><b>${i.q}</b><button data-q="${ix}" data-d="1" aria-label="Agregar uno">+</button></span></div>`).join("")+
  `<div class="sum" style="margin-top:12px"><div><span>Comida</span><span>${S(comida)}</span></div><div><span>Delivery (${d.toFixed(1)} km)</span><span>${S(env)}</span></div><div><span>Impuestos (IGV 18%)</span><span>${S(imp)}</span></div><div class="total"><span>Total único</span><span>${S(total)}</span></div></div>`;
 pintarPago(total);
}
function pintarPago(total){
 const p=$("#pagoPanel");
 if(total===null){p.innerHTML=`<h3>Pago</h3><p class="meta" style="margin-top:6px">Aquí elegirás Yape, Plin o tarjeta.</p>`;return}
 const m=[["Yape","📱 Yape"],["Plin","📲 Plin"],["Visa","💳 Visa (Niubiz)"],["Culqi","💳 Culqi"]];
 p.innerHTML=`<h3>Entrega y pago</h3>
  <div class="field" style="margin-top:10px"><label for="dir">Dirección de entrega</label><input type="text" id="dir" placeholder="Ej: Av. Belisario Suárez 123, SJM" autocomplete="street-address"></div>
  <div class="field" style="margin-top:10px"><label for="cel">Celular</label><input type="text" id="cel" inputmode="numeric" maxlength="9" placeholder="9 dígitos" autocomplete="tel"></div>
  <div class="pays">${m.map(x=>`<button type="button" data-pay="${x[0]}" aria-pressed="${metodo===x[0]}">${x[1]}</button>`).join("")}</div>
  <div class="err" id="err" role="alert"></div>
  <button class="btn full" id="pagar">Pagar ${S(total)}</button>`;
}
function pagar(){
 const dir=$("#dir").value.trim(), cel=$("#cel").value.trim(), err=$("#err");
 if(dir.length<6) return err.textContent="Escribe una dirección de entrega completa.";
 if(!/^9\d{8}$/.test(cel)) return err.textContent="El celular debe tener 9 dígitos y empezar con 9.";
 if(!metodo) return err.textContent="Elige un método de pago.";
 const min=25+Math.round(km(pos,REST.find(r=>r.id===cart[0].id))*6);
 $("#carritoPanel").innerHTML=`<div class="ok"><div class="big">✅</div><h3>¡Pedido confirmado!</h3><p>Pagaste con ${metodo}. Llegará en unos ${min}–${min+10} min.</p><p class="meta" style="margin-top:8px">Simulación: no se realizó ningún cobro real.</p></div>`;
 $("#pagoPanel").innerHTML=`<h3>Gracias por usar FoodMatch</h3><p class="meta" style="margin:8px 0 14px">Provecho. Cuando quieras, busca otro lugar.</p><a class="btn full" href="#inicio" style="display:flex;align-items:center;justify-content:center;text-decoration:none">Volver a buscar</a>`;
 cart=[];metodo="";$("#cartCount").textContent=0;
}

// ===== Eventos =====
document.addEventListener("click",e=>{
 const t=e.target.closest("button,a");if(!t)return;
 if(t.dataset.fav){const id=+t.dataset.fav;favs=favs.includes(id)?favs.filter(x=>x!==id):[...favs,id];save("fm_favs",favs);pintar()}
 else if(t.dataset.add){const r=REST.find(x=>x.id===+t.dataset.add);
  if(cart.length&&cart[0].id!==r.id){cart=[];toast("Tu bolsa cambió al nuevo restaurante")}
  const ex=cart.find(i=>i.id===r.id);ex?ex.q++:cart.push({id:r.id,combo:r.combo,p:r.p,q:1});
  pintarCarrito();toast("Agregado: "+r.combo);}
 else if(t.dataset.res){toast("Reservas disponibles en el Horizonte 2 del roadmap")}
 else if(t.dataset.q!==undefined){const i=cart[+t.dataset.q];i.q+=+t.dataset.d;if(i.q<=0)cart.splice(+t.dataset.q,1);pintarCarrito()}
 else if(t.dataset.pay){metodo=t.dataset.pay;document.querySelectorAll("[data-pay]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.pay===metodo))}
 else if(t.id==="pagar")pagar();
 else if(t.dataset.share){const r=REST.find(x=>x.id===+t.dataset.share),txt=`Mira ${r.n} en FoodMatch: plato desde ${S(r.p)}, ★ ${r.r}.`;
  if(navigator.share)navigator.share({title:"FoodMatch",text:txt,url:location.href}).catch(()=>{});
  else if(navigator.clipboard){navigator.clipboard.writeText(txt+" "+location.href).then(()=>toast("Enlace copiado para compartir"))}
  else toast(txt)}
 if(t.closest("#menu a")){$("#menu").classList.remove("open");$("#burger").setAttribute("aria-expanded","false")}
});
$("#burger").onclick=()=>{const o=$("#menu").classList.toggle("open");$("#burger").setAttribute("aria-expanded",o)};
["presupuesto","tipo","ocasion","calif","orden"].forEach(id=>$("#"+id).addEventListener("input",()=>{pintar();pintarCarrito()}));
$("#modo").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;modo=b.dataset.v;
 document.querySelectorAll("#modo button").forEach(x=>x.setAttribute("aria-pressed",x===b));pintar()});
$("#btnGeo").onclick=()=>{
 if(!navigator.geolocation)return toast("Tu navegador no permite geolocalización");
 $("#locTxt").textContent="Buscando tu ubicación…";
 navigator.geolocation.getCurrentPosition(p=>{pos={lat:p.coords.latitude,lng:p.coords.longitude};
  $("#locTxt").textContent="Usando tu ubicación actual. Distancias y envíos recalculados.";pintar();pintarCarrito()},
 ()=>{$("#locTxt").textContent="No pudimos acceder a tu ubicación. Usamos el centro de San Juan de Miraflores.";},{timeout:8000});
};
// WhatsApp (reemplazar el número por el real del negocio)
$("#wa").href="https://wa.me/51999999999?text="+encodeURIComponent("Hola FoodMatch, quiero ayuda para encontrar dónde comer.");
pintar();pintarCarrito();
