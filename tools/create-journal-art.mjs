// Original code-drawn pixel artwork. Rebuild with node tools/create-journal-art.mjs.
import { mkdirSync, writeFileSync } from 'node:fs';
const dir = new URL('../source/img/journal/', import.meta.url);
mkdirSync(dir, { recursive: true });
const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const path = (d,c) => `<path d="${d}" fill="${c}"/>`;
const wrap = (w,h,s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${s}</svg>`;
const save = (name,w,h,s) => writeFileSync(new URL(name+'.svg', dir),wrap(w,h,s));
const ink='#634b37', green='#49734a', leaf='#729b50', light='#a9bd63', cream='#ffe6aa', red='#bf6546';
const sprout = rect(15,14,2,15,green)+path('M15 20H9v-3H6v-5h6v3h3z',leaf)+path('M17 17h6v-3h3V8h-6v3h-3z',light);
const book = rect(5,7,22,21,ink)+rect(7,5,18,21,red)+rect(9,7,2,17,'#e29663')+rect(12,10,9,2,cream)+rect(12,14,7,2,cream)+rect(8,26,18,3,cream);
const house = path('M3 15v-4h4V7h5V3h8v4h5v4h4v4z',ink)+path('M6 14v-3h5V7h10v4h5v3z',red)+rect(7,15,19,15,ink)+rect(9,16,15,12,cream)+rect(16,20,5,10,ink)+rect(10,18,4,5,'#6ba5a0')+rect(11,18,1,5,'#fff2c8');
const flower = rect(15,15,2,11,green)+rect(10,19,5,3,leaf)+rect(17,17,5,3,leaf)+rect(12,5,8,13,'#d78373')+rect(9,8,14,7,'#eaa28a')+rect(14,9,4,5,'#f7d36e')+rect(9,25,15,3,ink)+rect(11,28,11,3,red);
const letter=rect(3,8,26,19,ink)+rect(5,10,22,15,cream)+path('M5 10h3v2h4v2h8v-2h4v-2h3v3h-4v2h-4v2h-6v-2H9v-2H5z','#c39b62')+rect(21,12,4,5,red);
const chicken=rect(11,8,9,3,red)+rect(9,11,13,12,ink)+rect(7,14,16,7,'#fff3ce')+rect(11,12,9,7,'#fff8e1')+rect(19,13,2,2,ink)+rect(22,15,4,3,'#dea24d')+rect(10,23,2,4,'#c9873c')+rect(18,23,2,4,'#c9873c')+rect(4,11,4,7,'#e7d9b0');
const jar=rect(10,4,13,4,ink)+rect(11,8,11,3,'#d7b781')+rect(7,11,19,18,ink)+rect(9,12,15,15,'#e9b650')+rect(10,14,3,10,'#ffe4a0')+rect(14,17,7,7,cream)+rect(16,19,3,3,red);
const mushroom=rect(12,18,9,11,ink)+rect(14,17,5,10,cream)+path('M3 19v-7h4V8h5V5h9v3h5v4h3v7z',ink)+path('M5 17v-5h4V9h5V7h5v3h5v4h3v3z',red)+rect(10,11,4,3,cream)+rect(19,13,4,3,cream);
const icons={sprout,book,house,flower,letter,chicken,jar,mushroom};
for(const [name,s] of Object.entries(icons)) save(name,32,32,s);
let s=rect(0,0,240,144,'#bfd8d1')+rect(0,64,240,80,'#99b567');
s+=rect(190,12,14,14,'#fff0b3');
for (const [x,y] of [[18,16],[96,10],[151,29]]) s+=path(`M${x} ${y}h8v-3h14v3h8v5h-30z`,'#e6eee0');
s+=path('M0 66V52h13V43h19v-8h18v9h13v12h19v-9h20v-9h16v10h16v12h17V48h18V37h23v9h16v12h15V43h17v23z','#83a589');
s+=rect(0,69,240,75,'#a1b86a');
for(let i=0;i<145;i++){let x=(i*47+3)%240,y=72+(i*31)%70;s+=rect(x,y,2,1,i%3?'#8ea960':'#b9ca7a');}
// Dirt path, with small stone and grass details.
s+=path('M94 99h22v14h47v12h-52v19H91v-29H68v-10h26z','#d7bd83');
for(let i=0;i<22;i++)s+=rect(93+i%6*3,117+Math.floor(i/6)*7,2,1,'#b99a69');
function tree(x,y){
  let t=rect(14,28,6,22,ink)+rect(15,29,2,18,'#a37c48');
  t+=path('M6 35v-5H1V16h5V8h7V2h9v6h7v8h5v14h-6v5z',green);
  t+=path('M6 25V16h5V9h10v5h7v12h-7v5H11v-6z',leaf);
  for(const [a,b] of [[13,10],[8,18],[18,17],[12,25],[24,23]])t+=rect(a,b,4,2,light)+rect(a+2,b+3,3,2,'#618849');
  return `<g transform="translate(${x} ${y})">${t}</g>`;
}
s+=tree(9,35)+tree(195,42)+tree(219,59);
// Cottage: shaded timber, tiled terracotta roof, lit windows, chimney.
s+=rect(56,63,83,39,ink)+rect(60,64,75,35,'#e9c98f');
for(let y=69;y<99;y+=6)s+=rect(61,y,72,1,'#d2ad75');
s+=rect(62,66,4,34,'#aa7952')+rect(130,65,4,35,'#aa7952')+rect(55,100,85,4,'#8f754d');
s+=rect(117,32,9,23,ink)+rect(119,34,5,17,'#ba8a64');
s+=path('M48 65v-6h5v-6h5v-6h5v-6h66v6h5v6h5v6h6v6z',ink);
s+=path('M53 60h5v-6h5v-6h4v-4h59v4h5v6h5v6z',red);
for(let y=47;y<62;y+=5)for(let x=64;x<128;x+=10)s+=rect(x+(y%2?0:4),y,7,2,'#df8d59');
s+=rect(54,62,86,3,'#e6a56a');
for(const x of [69,113]){s+=rect(x,72,15,16,ink)+rect(x+2,74,11,12,'#6f9996')+rect(x+3,75,4,5,'#cde0c6')+rect(x+7,74,1,12,cream)+rect(x+2,79,11,1,cream)+rect(x-2,88,19,3,red);for(let j=0;j<4;j++)s+=rect(x+j*4,85,3,3,j%2?'#df9b89':green);}
s+=rect(91,76,15,25,ink)+rect(93,78,11,22,'#aa7952')+rect(94,79,9,7,cream)+rect(101,91,2,2,cream)+rect(88,101,20,3,'#e7d7af');
// Kitchen garden, each crop individually planted.
s+=rect(151,82,38,29,'#806343');
for(let y=85;y<110;y+=8){s+=rect(153,y+4,34,1,'#a47b4c');for(let x=155;x<187;x+=9)s+=rect(x+2,y,2,5,green)+rect(x,y,3,2,leaf)+rect(x+4,y-2,3,3,'#c4cb71')+rect(x+2,y+4,3,3,'#dd9851');}
for(let x=142;x<198;x+=9)s+=rect(x,72,3,9,'#896444')+rect(x+1,72,1,7,'#eac58b');
s+=rect(141,74,56,2,'#bc9561');
// Pond with stepped bank and ripples.
s+=path('M159 121h9v-4h27v4h10v6h5v10h-9v5h-41v-5h-7v-10h6z','#819961')+path('M161 124h9v-4h23v4h10v6h4v5h-9v4h-35v-4h-7v-7h5z','#75aaa4')+rect(169,125,15,1,'#bdd5b5')+rect(189,133,11,1,'#bdd5b5');
s+=`<g transform="translate(118 110) scale(.55)">${chicken}</g><g transform="translate(53 115) scale(.5)">${chicken}</g>`;
s+=rect(38,104,3,18,ink)+rect(31,100,16,8,red)+rect(33,102,9,4,cream)+rect(44,97,2,8,ink);
for(const [x,y] of [[24,107],[16,127],[72,133],[136,131],[211,114],[229,136]])s+=rect(x,y,1,5,green)+rect(x-2,y-2,5,3,'#e6a193')+rect(x,y-1,1,1,cream);
save('cottage',240,144,s);
