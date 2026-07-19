/* qr-mini.js — compact byte-mode QR encoder (ECC level M, versions 1–10).
   Exposes window.QRMini.matrix(text) -> 2D array of 0/1 (true = dark).
   Deterministic reference algorithm (ISO/IEC 18004). Enough for short URLs/IDs. */
(function(){
  // GF(256) tables
  var EXP = new Array(256), LOG = new Array(256);
  (function(){ var x=1; for(var i=0;i<255;i++){ EXP[i]=x; LOG[x]=i; x<<=1; if(x&0x100) x^=0x11d; } EXP[255]=EXP[0]; })();
  function gmul(a,b){ return (a===0||b===0)?0:EXP[(LOG[a]+LOG[b])%255]; }
  function rsGen(deg){ var p=[1]; for(var i=0;i<deg;i++){ var np=new Array(p.length+1).fill(0);
    for(var j=0;j<p.length;j++){ np[j]^=gmul(p[j],1); np[j+1]^=gmul(p[j],EXP[i]); } p=np; } return p; }
  function rsEncode(data,deg){ var res=new Array(deg).fill(0); for(var i=0;i<data.length;i++){
    var f=data[i]^res[0]; res.shift(); res.push(0); if(f!==0){ var g=rsGen(deg);
      for(var j=0;j<deg;j++) res[j]^=gmul(g[j+1],f); } } return res; }

  // Level-M tables, versions 1..10
  var DATA_CW = {1:16,2:28,3:44,4:64,5:86,6:108,7:124,8:154,9:182,10:216};
  var CAP     = {1:14,2:26,3:42,4:62,5:84,6:106,7:122,8:152,9:180,10:213};
  var BLOCKS  = { // [ecPerBlock, [ [count,dataCw], ... ] ]
    1:[10,[[1,16]]], 2:[16,[[1,28]]], 3:[26,[[1,44]]], 4:[18,[[2,32]]], 5:[24,[[2,43]]],
    6:[16,[[4,27]]], 7:[18,[[4,31]]], 8:[22,[[2,38],[2,39]]], 9:[22,[[3,36],[2,37]]], 10:[26,[[4,43],[1,44]]] };
  var ALIGN = {1:[],2:[6,18],3:[6,22],4:[6,26],5:[6,30],6:[6,34],7:[6,22,38],8:[6,24,42],9:[6,26,46],10:[6,28,50]};

  function pickVersion(len){ for(var v=1;v<=10;v++) if(CAP[v]>=len) return v; return -1; }

  function encodeData(bytes, version){
    var bits=[];
    function push(val,n){ for(var i=n-1;i>=0;i--) bits.push((val>>i)&1); }
    push(0b0100,4); // byte mode
    var ccBits = version>=10?16:8;
    push(bytes.length, ccBits);
    for(var i=0;i<bytes.length;i++) push(bytes[i],8);
    var totalData = DATA_CW[version];
    var cap = totalData*8;
    var term=Math.min(4, cap-bits.length); push(0,term);
    while(bits.length%8!==0) bits.push(0);
    var pad=[0xEC,0x11], pi=0;
    while(bits.length/8 < totalData){ push(pad[pi%2],8); pi++; }
    var cw=[]; for(var b=0;b<bits.length;b+=8){ var v=0; for(var k=0;k<8;k++) v=(v<<1)|bits[b+k]; cw.push(v); }
    return cw;
  }

  function buildCodewords(dataCw, version){
    var ecPer=BLOCKS[version][0], groups=BLOCKS[version][1];
    var blocks=[], idx=0;
    for(var g=0;g<groups.length;g++){ var cnt=groups[g][0], dlen=groups[g][1];
      for(var c=0;c<cnt;c++){ var d=dataCw.slice(idx,idx+dlen); idx+=dlen;
        blocks.push({data:d, ec:rsEncode(d,ecPer)}); } }
    var maxData=0; for(var i=0;i<blocks.length;i++) maxData=Math.max(maxData,blocks[i].data.length);
    var out=[];
    for(var col=0;col<maxData;col++) for(var bi=0;bi<blocks.length;bi++) if(col<blocks[bi].data.length) out.push(blocks[bi].data[col]);
    for(var col2=0;col2<ecPer;col2++) for(var bj=0;bj<blocks.length;bj++) out.push(blocks[bj].ec[col2]);
    return out;
  }

  function newMatrix(size){ var m=[]; for(var i=0;i<size;i++){ m.push(new Array(size).fill(null)); } return m; }

  function placeFinder(m,r,c){ for(var i=-1;i<=7;i++) for(var j=-1;j<=7;j++){ var rr=r+i,cc=c+j;
    if(rr<0||cc<0||rr>=m.length||cc>=m.length) continue;
    var v=(i>=0&&i<=6&&(j===0||j===6))||(j>=0&&j<=6&&(i===0||i===6))||(i>=2&&i<=4&&j>=2&&j<=4);
    m[rr][cc]=v?1:0; } }

  function reserveFmt(m){ var n=m.length;
    for(var i=0;i<9;i++){ if(m[8][i]===null)m[8][i]=2; if(m[i][8]===null)m[i][8]=2; }
    for(var j=n-8;j<n;j++){ if(m[8][j]===null)m[8][j]=2; }
    for(var k=n-8;k<n;k++){ if(m[k][8]===null)m[k][8]=2; }
    m[n-8][8]=1; }

  function placeAlign(m,version){ var pos=ALIGN[version]; for(var a=0;a<pos.length;a++) for(var b=0;b<pos.length;b++){
    var r=pos[a],c=pos[b]; if(m[r][c]!==null) continue;
    for(var i=-2;i<=2;i++) for(var j=-2;j<=2;j++){ var v=(Math.max(Math.abs(i),Math.abs(j))!==1); m[r+i][c+j]=v?1:0; } } }

  function placeTiming(m){ var n=m.length; for(var i=8;i<n-8;i++){ var v=(i%2===0)?1:0;
    if(m[6][i]===null)m[6][i]=v; if(m[i][6]===null)m[i][6]=v; } }

  function bchFormat(fmt){ var g=0b10100110111; var d=fmt<<10; var b=d;
    for(var i=14;i>=10;i--){ if((b>>i)&1) b^=g<<(i-10); } return ((fmt<<10)|(b&0x3FF))^0b101010000010010; }
  function bchVersion(ver){ var g=0b1111100100101; var b=ver<<12;
    for(var i=17;i>=12;i--){ if((b>>i)&1) b^=g<<(i-12); } return (ver<<12)|(b&0xFFF); }

  function placeFormat(m,mask){ var n=m.length; var fmt=bchFormat((0b00<<3)|mask); // level M = 00
    for(var i=0;i<15;i++){ var bit=(fmt>>i)&1;
      // around top-left
      if(i<6) m[8][i]=bit; else if(i===6) m[8][7]=bit; else if(i===7) m[8][8]=bit;
      else if(i===8) m[7][8]=bit; else m[14-i][8]=bit;
      // second copy
      if(i<8) m[n-1-i][8]=bit; else m[8][n-15+i]=bit;
    } m[n-8][8]=1; }

  function placeVersionInfo(m,version){ if(version<7) return; var n=m.length; var vi=bchVersion(version);
    for(var i=0;i<18;i++){ var bit=(vi>>i)&1; var r=Math.floor(i/3), c=i%3;
      m[r][n-11+c]=bit; m[n-11+c][r]=bit; } }

  function isFunction(m,version){ // mark reserved cells for masking exclusion
    return function(r,c){ return reservedMask[r][c]; }; }

  var reservedMask;
  function buildReserved(m){ reservedMask=[]; for(var i=0;i<m.length;i++){ reservedMask.push([]);
    for(var j=0;j<m.length;j++) reservedMask[i].push(m[i][j]!==null); } }

  function placeData(m,codewords){ var n=m.length; var bitIdx=0;
    var bits=[]; for(var i=0;i<codewords.length;i++) for(var b=7;b>=0;b--) bits.push((codewords[i]>>b)&1);
    var upward=true;
    for(var col=n-1; col>0; col-=2){ if(col===6) col--;
      for(var t=0;t<n;t++){ var row=upward?(n-1-t):t;
        for(var dc=0;dc<2;dc++){ var cc=col-dc;
          if(m[row][cc]===null){ var bit=bitIdx<bits.length?bits[bitIdx++]:0; m[row][cc]=bit; } } }
      upward=!upward; } }

  function applyMask(m,mask){ var n=m.length;
    for(var r=0;r<n;r++) for(var c=0;c<n;c++){ if(reservedMask[r][c]) continue; var inv=false;
      switch(mask){ case 0: inv=((r+c)%2===0);break; case 1: inv=(r%2===0);break; case 2: inv=(c%3===0);break;
        case 3: inv=((r+c)%3===0);break; case 4: inv=((Math.floor(r/2)+Math.floor(c/3))%2===0);break;
        case 5: inv=(((r*c)%2)+((r*c)%3)===0);break; case 6: inv=((((r*c)%2)+((r*c)%3))%2===0);break;
        case 7: inv=((((r+c)%2)+((r*c)%3))%2===0);break; }
      if(inv) m[r][c]^=1; } }

  function penalty(m){ var n=m.length, p=0, r,c,i;
    for(r=0;r<n;r++){ var run=1; for(c=1;c<n;c++){ if(m[r][c]===m[r][c-1]) run++; else { if(run>=5)p+=3+(run-5); run=1; } } if(run>=5)p+=3+(run-5); }
    for(c=0;c<n;c++){ var run2=1; for(r=1;r<n;r++){ if(m[r][c]===m[r-1][c]) run2++; else { if(run2>=5)p+=3+(run2-5); run2=1; } } if(run2>=5)p+=3+(run2-5); }
    for(r=0;r<n-1;r++) for(c=0;c<n-1;c++){ if(m[r][c]===m[r][c+1]&&m[r][c]===m[r+1][c]&&m[r][c]===m[r+1][c+1]) p+=3; }
    var dark=0; for(r=0;r<n;r++) for(c=0;c<n;c++) dark+=m[r][c];
    var ratio=dark/(n*n)*100; p+=Math.floor(Math.abs(ratio-50)/5)*10;
    return p; }

  function matrix(text){
    var bytes=[]; for(var i=0;i<text.length;i++){ var ch=text.charCodeAt(i);
      if(ch<128) bytes.push(ch); else if(ch<2048){ bytes.push(192|(ch>>6)); bytes.push(128|(ch&63)); }
      else { bytes.push(224|(ch>>12)); bytes.push(128|((ch>>6)&63)); bytes.push(128|(ch&63)); } }
    var version=pickVersion(bytes.length); if(version<0) throw new Error('QR: payload too long');
    var dataCw=encodeData(bytes,version);
    var codewords=buildCodewords(dataCw,version);
    var size=17+4*version;
    var base=newMatrix(size);
    placeFinder(base,0,0); placeFinder(base,0,size-7); placeFinder(base,size-7,0);
    reserveFmt(base); placeAlign(base,version); placeTiming(base);
    if(version>=7) placeVersionInfo(base,version);
    buildReserved(base);
    placeData(base,codewords);
    var best=null, bestP=Infinity, bestMask=0;
    for(var mask=0;mask<8;mask++){ var m=base.map(function(row){return row.slice();});
      applyMask(m,mask); placeFormat(m,mask);
      var p=penalty(m); if(p<bestP){ bestP=p; best=m; bestMask=mask; } }
    return best.map(function(row){ return row.map(function(v){ return v?1:0; }); });
  }

  window.QRMini={ matrix:matrix };
})();
