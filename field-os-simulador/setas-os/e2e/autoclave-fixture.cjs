'use strict';
// Registro SINTÉTICO de calificación del autoclave para pruebas de navegador:
// G1 cerrada, protocolo aprobado, tres corridas PQ-1 conformes de una carga,
// estudios PQ-2 A/B y C conformes y G2–G4 cerradas. No representa corridas reales del 1941X.
const Q=require('../autoclave-qualification.js');
const DAY=86400000,AMBIENT=74.5,KPA_PER_PSI=6.894757293168;
const lerp=(t,t0,v0,t1,v1)=>v0+(v1-v0)*(t-t0)/(t1-t0);
const local=ms=>new Date(ms-5*3600000).toISOString().slice(0,16);

function qualifiedJournal({nowMs=Date.now(),configurationId='CFG-6x1.5',bagCount=6,wetMassPerBagKg=1.5}={}){
 const events=[];let seq=0;
 const add=(type,payload,atMs)=>{events.push(Q.createEvent(events,type,payload,{at:new Date(atMs).toISOString(),by:'Fixture',id:'AQ-FIX-'+(++seq),nowMs}));};
 const params={...Q.CANDIDATE_PROTOCOL,thermalTargetC:121,maxGapMin:2};
 add('gate.reviewed',{gateId:'G1',status:'cerrado',reference:'Fixture',details:{calibrationCertificate:'CAL-FIX',inspectionReport:'INF-FIX'}},nowMs-20*DAY);
 add('protocol.drafted',{protocolId:'PQ1-FIX',title:'Fixture',params,microbiologicalBasis:'Fixture de software'},nowMs-20*DAY+60000);
 add('protocol.approved',{protocolId:'PQ1-FIX',reference:'Fixture'},nowMs-19*DAY);
 add('configuration.defined',{configurationId,equipmentId:'1941X',bagCount,wetMassPerBagKg,loadArrangement:'Fixture'},nowMs-19*DAY+60000);
 [12,11,10].forEach((daysAgo,i)=>{
  const start=nowMs-daysAgo*DAY,runId='FIX-R'+(i+1);
  const rows=['timestamp,DL1,DL2,DL3,P_psig'];
  for(let m=0;m<=180;m++){
   const ch=m<=30?lerp(m,0,90,30,121.5):m<=150?121.5:lerp(m,150,121.5,180,100);
   const prod=x=>m<=42+x?lerp(m,0,30,42+x,121.3):m<=150?121.3:lerp(m,150,121.3,180,105);
   rows.push([local(start+m*60000).replace('T',' ')+':00',ch.toFixed(2),prod(0).toFixed(2),prod(3).toFixed(2),(ch>=92?(Q.saturationPressureKpa(ch)-AMBIENT)/KPA_PER_PSI:0).toFixed(3)].join(','));
  }
  add('run.registered',{runId,configurationId,protocolId:'PQ1-FIX',executedAt:new Date(start).toISOString(),operator:'Fixture',ambientPressureKpa:AMBIENT,pressureUnit:'psig',gaugeCorrection:0,plateau:{kind:'datetime',start:local(start+30*60000),end:local(start+150*60000)}},start+6*3600000);
  const data=Q.parseLoggerCsv(rows.join('\n'));
  add('run.data_imported',{runId,fileName:runId+'.csv',data:{timeKind:data.timeKind,t:data.t,values:data.values,columns:data.columns},mapping:{chamber:'DL1',products:['DL2','DL3'],pressure:'P_psig'}},start+6*3600000+60000);
  add('run.indicators_recorded',{runId,indicators:{ci:['B1','B2','B3'].map(position=>({position,result:'pass'})),ib:['B1','B3','B2'].map(position=>({position,result:'negativo',readHours:48})),
   controls:[{position:'Incubadora',result:'positivo',firstPositiveHours:18}],lots:{ci:{lot:"CI",expiry:"2099-12-31",ifu:"IFU"},ib:{lot:"IB",expiry:"2099-12-31",ifu:"IFU"}}}},start+20*3600000);
 });
 // PQ-2 sintético: A/B de 15 días (0/2 y 0/2) y placas C con salto al día 3.
 const ab=nowMs-19*DAY,c=nowMs-12*DAY,iso=ms=>new Date(ms).toISOString();
 add('pq2.defined',{studyId:'AB-FIX',kind:'AB',startedAt:iso(ab),configurationId,thermalRunRef:'FIX-R3',nPerGroup:2,observationDays:15,incubationTempC:23,tempToleranceC:1,readingIntervalDays:7},nowMs-3*DAY);
 [7,14,15.1].forEach((d,i)=>add('pq2.reading',{studyId:'AB-FIX',readAt:iso(ab+d*DAY),tempC:23,units:{A1:'limpia',A2:'limpia',B1:'limpia',B2:'limpia'}},nowMs-3*DAY+(i+1)*60000));
 add('pq2.defined',{studyId:'C-FIX',kind:'C',startedAt:iso(c),spawnLot:'SPAWN-FIX',medium:'PDA',plates:2,blanks:1,maxJumpDays:5,observationDays:7,incubationTempC:23,tempToleranceC:1,readingIntervalDays:4},nowMs-3*DAY+5*60000);
 [3,7].forEach((d,i)=>add('pq2.reading',{studyId:'C-FIX',readAt:iso(c+d*DAY),tempC:23,units:{P1:'salto',P2:'salto',K1:'sin_crecimiento'}},nowMs-3*DAY+(i+6)*60000));
 add('gate.reviewed',{gateId:'G2',status:'cerrado',reference:'Fixture',details:{configurationId}},nowMs-2*DAY);
 add('gate.reviewed',{gateId:'G3',status:'cerrado',reference:'Fixture',details:{studyId:'AB-FIX'}},nowMs-2*DAY+60000);
 add('gate.reviewed',{gateId:'G4',status:'cerrado',reference:'Fixture',details:{studyId:'C-FIX'}},nowMs-2*DAY+120000);
 return events;
}
module.exports={qualifiedJournal};
