'use strict';
/* ====== KONFIGURASI: ubah nilai awal, rentang data dummy, dan interval di sini ====== */
const CONFIG={
 login:{user:'admin',pass:'puriva123'},
 initial:{temp:30.2,hum:75,mq:1250,gas:85000,pres:1008},          // nilai awal sensor (simulasi)
 sensors:{                                                          // min/max = rentang data dummy, step = besar perubahan acak per pembacaan
  temp:{label:'Suhu udara',src:'BME680',unit:'°C',min:27,max:36,step:.3,dec:1,icon:'thermometer',color:'#e67e22'},
  hum:{label:'Kelembapan udara',src:'BME680',unit:'%RH',min:55,max:90,step:1.2,dec:0,icon:'droplets',color:'#2e86c1'},
  mq:{label:'Respons MQ-135',src:'MQ-135 (nilai ADC simulasi, bukan ppm)',unit:'ADC',min:800,max:2000,step:40,dec:0,icon:'cloud',color:'#2c7a4b'},
  gas:{label:'Resistansi gas BME680',src:'BME680',unit:'Ω',min:40000,max:150000,step:1800,dec:0,icon:'flask-conical',color:'#8e44ad'},
  pres:{label:'Tekanan udara',src:'BME680',unit:'hPa',min:1004,max:1012,step:.3,dec:1,icon:'gauge',color:'#c0392b'}},
 intervals:[2,5,10],defaultInterval:5,                              // interval simulasi (detik)
 mqWarn:1600,                                                       // ambang indikasi (hanya demonstrasi)
 ranges:{'1h':{n:60,min:1,live:1,cap:720},'24h':{n:96,min:15},'7d':{n:84,min:120}}
};
const K=Object.keys(CONFIG.sensors),$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const p2=n=>String(n).padStart(2,'0'),hms=t=>t.toLocaleTimeString('en-GB'),ts=t=>`${p2(t.getDate())}/${p2(t.getMonth()+1)}/${t.getFullYear()} ${hms(t)}`;
const fmt=(k,v)=>v.toLocaleString('id-ID',{minimumFractionDigits:CONFIG.sensors[k].dec,maximumFractionDigits:CONFIG.sensors[k].dec});
const lab=(t,r)=>r==='7d'?`${p2(t.getDate())}/${p2(t.getMonth()+1)} ${hms(t).slice(0,5)}`:r==='24h'?hms(t).slice(0,5):hms(t);
const icons=()=>window.lucide&&lucide.createIcons();

/* ====== STATE UTAMA (satu sumber data) ====== */
const S={page:'dash',range:'1h',running:true,interval:CONFIG.defaultInterval,on:false,fan:false,valve:0,
 cur:{...CONFIG.initial},ser:{},hist:[],act:[],last:new Date(),hp:{q:'',range:'all',asc:false,page:1}};
let timer=null,started=false;

/* ====== DATA DUMMY ====== */
const walk=(k,v)=>{const c=CONFIG.sensors[k];return Math.min(c.max,Math.max(c.min,v+(Math.random()-.5)*2*c.step))};
const gen=prev=>{const r={};K.forEach(k=>r[k]=walk(k,prev[k]));return r};
function seed(){
 const now=Date.now();S.ser={};
 for(const[r,c]of Object.entries(CONFIG.ranges)){let v={...CONFIG.initial};const a=[{t:new Date(now),...CONFIG.initial}];
  for(let i=1;i<=c.n;i++){v=gen(v);a.unshift({t:new Date(now-i*c.min*6e4),...v})}S.ser[r]=a}
 S.cur={...CONFIG.initial};S.last=new Date(now);
 let v={...CONFIG.initial};const offs=[];
 for(let i=0;i<20;i++)offs.push(i*3+1);for(let i=1;i<=15;i++)offs.push(60+i*90);for(let i=1;i<=10;i++)offs.push(1440+i*600);
 S.hist=offs.map(m=>{v=gen(v);const on=Math.random()>.5;return{t:new Date(now-m*6e4),...v,on,fan:on,note:'Data simulasi awal'}});
}
function addHist(note){S.hist.unshift({t:new Date(),...S.cur,on:S.on,fan:S.fan,note});if(S.hist.length>300)S.hist.pop()}
function tick(){
 if(!S.running)return;
 S.cur=gen(S.cur);S.last=new Date();
 for(const[r,c]of Object.entries(CONFIG.ranges)){const a=S.ser[r];
  if(c.live||S.last-a[a.length-1].t>=c.min*6e4){a.push({t:S.last,...S.cur});if(a.length>(c.cap||c.n))a.shift()}else Object.assign(a[a.length-1],S.cur)}
 if(!S.hist[0]||S.last-S.hist[0].t>=15000){addHist('Pembacaan sensor simulasi diperbarui');act('Pembacaan sensor simulasi diperbarui')}
 render();updCharts();
}
function restartTimer(){clearInterval(timer);timer=S.running?setInterval(tick,S.interval*1000):null}

/* ====== AKTIVITAS & NOTIFIKASI ====== */
function notify(m){const d=document.createElement('div');d.className='toast';d.textContent=m;$('#toasts').append(d);setTimeout(()=>d.remove(),3000)}
function act(m,toast){if(S.act[0]&&S.act[0].m===m)S.act[0].t=new Date();else{S.act.unshift({t:new Date(),m});S.act.length=Math.min(S.act.length,30)}if(toast)notify(m)}

/* ====== KONTROL PERANGKAT ====== */
function setPower(on){
 if(S.on===on)return notify('PURIVA sudah '+(on?'aktif':'nonaktif'));
 S.on=on;S.fan=on;act('PURIVA '+(on?'diaktifkan':'dinonaktifkan')+' (simulasi)',1);act('Kipas berubah menjadi '+(on?'Menyala':'Mati'));
 if(on&&S.valve<100){S.valve=100;act('Katup stomata dibuka')}
 addHist(on?'PURIVA diaktifkan':'PURIVA dinonaktifkan');render();
}
function setValve(p){
 if(S.valve===p)return notify('Katup stomata sudah '+(p?'terbuka':'tertutup'));
 S.valve=p;act('Katup stomata '+(p?'dibuka':'ditutup'),1);addHist('Katup stomata '+(p?'dibuka':'ditutup'));render();
}
function simStart(){if(S.running)return;S.running=true;act('Simulasi dimulai kembali',1);restartTimer();render()}
function simPause(){if(!S.running)return;S.running=false;restartTimer();act('Simulasi dijeda',1);render()}
function simReset(){
 if(!confirm('Reset simulasi ke kondisi awal? Sensor, status perangkat, grafik, dan riwayat akan dikembalikan. Status login tidak berubah.'))return;
 Object.assign(S,{on:false,fan:false,valve:0,running:true,interval:CONFIG.defaultInterval,act:[],hp:{q:'',range:'all',asc:false,page:1}});
 seed();$('#hq').value='';$('#hr').value='all';act('Simulasi direset ke kondisi awal',1);restartTimer();syncSet();render();updCharts();
}
function setIntervalSec(n){S.interval=n;act('Interval simulasi diubah menjadi '+n+' detik',1);restartTimer();syncSet();render()}

/* ====== RENDER ====== */
const sensorCard=k=>{const s=CONFIG.sensors[k];return `<div class="c st"><div class="sh"><i data-lucide="${s.icon}"></i>${s.label}</div><div class="val"><b data-b="${k}">–</b> <small>${s.unit}</small></div>${k==='mq'?'':`<small class="mu">Sumber: ${s.src}</small>`}</div>`};
const devCard=(k,l,ic,x='')=>`<div class="c st"><div class="sh"><i data-lucide="${ic}"></i>${l}</div><div class="val"><span class="badge" data-b="${k}">–</span></div>${x}</div>`;
const CTL=`<button class="btn pri" data-a="pon"><i data-lucide="power"></i>Aktifkan PURIVA</button><button class="btn" data-a="poff"><i data-lucide="power-off"></i>Nonaktifkan PURIVA</button><button class="btn" data-a="vopen">Buka Katup</button><button class="btn" data-a="vclose">Tutup Katup</button>`;
function render(){
 K.forEach(k=>$$(`[data-b="${k}"]`).forEach(e=>e.textContent=fmt(k,S.cur[k])));
 const flow=S.on&&S.fan&&S.valve>0;
 const T={dev:[S.on,'Aktif','Nonaktif'],devc:[S.on,'PURIVA: Aktif','PURIVA: Nonaktif'],fan:[S.fan,'Menyala','Mati'],valve:[S.valve>0,'Terbuka','Tertutup'],
  conn:[S.running,'Koneksi simulasi: aktif','Koneksi simulasi: dijeda'],flow:[flow,'Aliran udara: berjalan','Aliran udara: berhenti']};
 for(const k in T)$$(`[data-b="${k}"]`).forEach(e=>{e.textContent=T[k][T[k][0]?1:2];e.classList.toggle('ok',T[k][0]);e.classList.toggle('off',!T[k][0])});
 $$('[data-b=vp]').forEach(e=>e.textContent=S.valve+'%');
 $$('[data-b=upd]').forEach(e=>e.textContent=hms(S.last));
 const hi=S.cur.mq>CONFIG.mqWarn;
 $$('[data-b=mqw]').forEach(e=>{e.textContent=hi?'Indikasi simulasi: di atas ambang demo':'Indikasi simulasi: di bawah ambang demo';e.classList.toggle('warn',hi)});
 $$('[data-b=actl]').forEach(e=>e.innerHTML=S.act.slice(0,8).map(a=>`<li><span>${a.m}</span><time>${hms(a.t)}</time></li>`).join('')||'<li>Belum ada aktivitas.</li>');
 document.body.classList.toggle('run',flow);document.body.style.setProperty('--o',S.valve/100);
 const dis={pon:S.on,poff:!S.on,vopen:S.valve===100,vclose:S.valve===0,sstart:S.running,spause:!S.running};
 for(const a in dis)$$(`[data-a=${a}]`).forEach(b=>b.disabled=dis[a]);
 if(S.page==='his')renderHist();
}
function syncSet(){
 $$('[data-iv]').forEach(b=>b.classList.toggle('act',+b.dataset.iv===S.interval));
 const th=document.documentElement.dataset.theme||'light';$$('[data-th]').forEach(b=>b.classList.toggle('act',b.dataset.th===th));
 $$('#rg [data-r]').forEach(b=>b.classList.toggle('act',b.dataset.r===S.range));
}

/* ====== GRAFIK ====== */
const CHARTS=[{id:'ch-d1',k:'temp',fixed:'1h'},{id:'ch-d2',k:'mq',fixed:'1h'},{id:'ch-m1',k:'temp'},{id:'ch-m2',k:'hum'},{id:'ch-m3',k:'mq'},{id:'ch-m4',k:'gas'}];
let CH=[];
function initCharts(){
 if(typeof Chart==='undefined')return;
 const dk=document.documentElement.dataset.theme==='dark';Chart.defaults.color=dk?'#a3b8ab':'#55655c';Chart.defaults.borderColor=dk?'#27382d':'#e0e9e3';
 CH.forEach(h=>h.c.destroy());
 CH=CHARTS.map(d=>{const s=CONFIG.sensors[d.k];
  const c=new Chart($('#'+d.id),{type:'line',data:{labels:[],datasets:[{label:`${s.label} (${s.unit})`,data:[],borderColor:s.color,backgroundColor:s.color+'22',fill:true,tension:.3,pointRadius:0,pointHoverRadius:4,borderWidth:2}]},
   options:{responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'index',intersect:false},
    plugins:{legend:{display:true},tooltip:{callbacks:{label:i=>` ${s.label}: ${fmt(d.k,i.parsed.y)} ${s.unit}`}}},
    scales:{x:{title:{display:true,text:'Waktu (simulasi)'},ticks:{maxTicksLimit:7,maxRotation:0}},y:{title:{display:true,text:`${s.label} (${s.unit})`}}}}});
  return{...d,c}});
}
function updCharts(){CH.forEach(h=>{const a=S.ser[h.fixed||S.range],r=h.fixed||S.range,d=h.c.data;d.labels=a.map(p=>lab(p.t,r));d.datasets[0].data=a.map(p=>+p[h.k].toFixed(2));h.c.update('none')})}

/* ====== RIWAYAT & CSV ====== */
const rowTxt=x=>[ts(x.t),...K.map(k=>fmt(k,x[k])),x.on?'aktif':'nonaktif',x.fan?'menyala':'mati',x.note||''].join(' ').toLowerCase();
function filt(){const h=S.hp,lim={'1h':60,'24h':1440,'7d':10080}[h.range],q=h.q.toLowerCase().trim();
 const r=S.hist.filter(x=>(!lim||Date.now()-x.t<=lim*6e4)&&(!q||rowTxt(x).includes(q)));return h.asc?r.slice().reverse():r}
function renderHist(){
 const r=filt(),per=10,pages=Math.max(1,Math.ceil(r.length/per));S.hp.page=Math.min(S.hp.page,pages);
 const s=r.slice((S.hp.page-1)*per,S.hp.page*per);
 $('#hb').innerHTML=s.length?s.map(x=>`<tr><td>${ts(x.t)}</td>${['temp','hum','mq','gas','pres'].map(k=>`<td>${fmt(k,x[k])}</td>`).join('')}<td>${x.on?'Aktif':'Nonaktif'}</td><td>${x.fan?'Menyala':'Mati'}</td></tr>`).join(''):'<tr><td colspan="8">Tidak ada data yang cocok dengan pencarian atau filter.</td></tr>';
 $('#hi').textContent=`Halaman ${S.hp.page} dari ${pages} · ${r.length} data simulasi`;
 $('[data-a=prev]').disabled=S.hp.page<=1;$('[data-a=next]').disabled=S.hp.page>=pages;
 $('#sortb').textContent='Urutan waktu: '+(S.hp.asc?'terlama dulu':'terbaru dulu');
}
function exportCsv(){
 const q=v=>'"'+String(v).replace(/"/g,'""')+'"';
 const L=['# DATA SIMULASI / DUMMY - bukan hasil pengukuran udara nyata (prototype PURIVA)','# Diekspor: '+ts(new Date()),
  ['Waktu','Suhu (C)','Kelembapan (%RH)','MQ-135 (ADC simulasi)','Resistansi gas BME680 (Ohm)','Tekanan (hPa)','Status PURIVA','Status kipas','Keterangan'].join(',')];
 filt().forEach(x=>L.push([q(ts(x.t)),x.temp.toFixed(1),x.hum.toFixed(0),x.mq.toFixed(0),x.gas.toFixed(0),x.pres.toFixed(1),x.on?'Aktif':'Nonaktif',x.fan?'Menyala':'Mati',q(x.note||'')].join(',')));
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+L.join('\r\n')],{type:'text/csv;charset=utf-8'}));
 a.download='puriva_riwayat_simulasi.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);notify('File CSV simulasi diunduh');
}

/* ====== NAVIGASI, TEMA, SESI ====== */
const TITLES={dash:'Dashboard',mon:'Monitoring Udara',fil:'Sistem Filtrasi',his:'Riwayat Data',set:'Pengaturan'};
function closeMenu(){$('#side').classList.remove('open');$('#ov').classList.remove('show')}
function go(p){S.page=p;$$('.pg').forEach(e=>e.hidden=e.id!=='pg-'+p);$$('#nav [data-p]').forEach(b=>b.classList.toggle('act',b.dataset.p===p));
 $('#pt').textContent=TITLES[p];closeMenu();if(p==='his')renderHist();updCharts();scrollTo(0,0)}
function applyTheme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('puriva_theme',t)}catch(e){}syncSet();if(started){initCharts();updCharts()}}
const AK='puriva_auth';
const authed=()=>{try{return localStorage.getItem(AK)==='1'||sessionStorage.getItem(AK)==='1'}catch(e){return false}};
function startApp(){
 $('#login').hidden=true;$('#app').hidden=false;
 if(!started){started=true;initCharts()}
 go(S.page);syncSet();render();updCharts();restartTimer();icons();
}
function logout(){try{localStorage.removeItem(AK);sessionStorage.removeItem(AK)}catch(e){}
 clearInterval(timer);timer=null;$('#app').hidden=true;$('#login').hidden=false;$('#lf').reset();$('#le').hidden=true;$('#p').type='password';$('#tp').textContent='Tampilkan'}

/* ====== INISIALISASI ====== */
function init(){
 try{applyTheme(localStorage.getItem('puriva_theme')||'light')}catch(e){}
 seed();
 $('#cards-d').innerHTML=['temp','hum','mq','gas','pres'].map(sensorCard).join('')+devCard('dev','Status PURIVA','power')+devCard('fan','Status kipas','fan')+devCard('valve','Status katup stomata','blinds','<small class="mu">Bukaan: <b data-b="vp"></b></small>');
 $('#cards-m').innerHTML=['temp','hum','pres','mq','gas'].map(sensorCard).join('');
 $$('.ctl').forEach(e=>e.innerHTML=CTL);
 const H={pon:()=>setPower(true),poff:()=>setPower(false),vopen:()=>setValve(100),vclose:()=>setValve(0),sstart:simStart,spause:simPause,sreset:simReset,csv:exportCsv,
  sort:()=>{S.hp.asc=!S.hp.asc;renderHist()},prev:()=>{S.hp.page--;renderHist()},next:()=>{S.hp.page++;renderHist()}};
 document.addEventListener('click',e=>{
  const a=e.target.closest('[data-a]');if(a&&H[a.dataset.a])return H[a.dataset.a]();
  const n=e.target.closest('#nav [data-p]');if(n)return go(n.dataset.p);
  const r=e.target.closest('[data-r]');if(r){S.range=r.dataset.r;syncSet();updCharts();return}
  const i=e.target.closest('[data-iv]');if(i)return setIntervalSec(+i.dataset.iv);
  const t=e.target.closest('[data-th]');if(t)applyTheme(t.dataset.th)});
 $('#lo').onclick=logout;$('#mb').onclick=()=>{$('#side').classList.add('open');$('#ov').classList.add('show')};$('#ov').onclick=closeMenu;
 $('#hq').oninput=e=>{S.hp.q=e.target.value;S.hp.page=1;renderHist()};$('#hr').onchange=e=>{S.hp.range=e.target.value;S.hp.page=1;renderHist()};
 $('#tp').onclick=()=>{const p=$('#p'),s=p.type==='password';p.type=s?'text':'password';$('#tp').textContent=s?'Sembunyikan':'Tampilkan'};
 $('#lf').onsubmit=e=>{e.preventDefault();const b=$('#lb'),err=$('#le');err.hidden=true;b.disabled=true;b.textContent='Memproses…';
  setTimeout(()=>{b.disabled=false;b.textContent='Masuk ke Dashboard';
   if($('#u').value.trim()===CONFIG.login.user&&$('#p').value===CONFIG.login.pass){
    try{(($('#rm').checked)?localStorage:sessionStorage).setItem(AK,'1')}catch(x){}startApp()}
   else{err.textContent='Username atau password salah. Periksa kembali, atau gunakan akun demo yang tertera di bawah.';err.hidden=false;$('#p').value='';$('#p').focus()}},700)};
 const clk=()=>$('#clock').textContent=new Date().toLocaleString('id-ID',{dateStyle:'full',timeStyle:'medium'});clk();setInterval(clk,1000);
 if(authed())startApp();else{$('#login').hidden=false;icons()}
}
document.addEventListener('DOMContentLoaded',init);
