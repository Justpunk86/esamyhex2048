'use strict'

//адрес сервера
let addressServer = document.getElementById('url-server').value;

//'http://localhost:13337';
//http://68f02c80-3bed-4e10-a747-4ff774ae905a.pub.instances.scw.cloud'; //'http://51.15.207.127:13337';

let eventSelectServer = addEventListener('change',getAddrServer,false)

//обработка выбранного адреса сервера
function getAddrServer(e)
{
  let selectServer = document.getElementById('url-server');
  let selected = selectServer.value;

  addressServer = selected;
  //console.log(addressServer);
};

//статус игры
let gameStatus = ['playing', 'game-over'];
let status = document.getElementById('statusValue');
//status.textContent = status.textContent + gameStatus[0];

//инициализация холста
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let ctx2 = canvas.getContext('2d');

//вычисление размеров холста
let widthCanvas = canvas.width - 20;
let heightCanvas = canvas.height - 20;

//ф-я очистки холста
let clearCanvas = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};



//запрос на сервере нового хекса
let getHexFromServer = async function(addrServ, _lvl, hexInQR) {

  let arrResponse = new Array();


  let serverLevel = addrServ + '/' + _lvl;
  let arrRequestCube = getCoordsCube(hexInQR);

  let c = Math.floor(Math.random() * arrRequestCube.length);

  let response = await fetch(
    serverLevel,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify([arrRequestCube[c]])
    }
  );

  if (response.ok) {
    let json = await response.json();
    //console.log(serverLevel,json);
    return getCoordsQR(json);

  } else {
    console.log('error ' + response.status);
  }

};

//класс шестиугольник
let Hex = function() {
  this.center = {
    x: widthCanvas / 2,
    y: heightCanvas / 2
  };
  this.sizeHex = 1;
  this.point = [{
    x: 0,
    y: 0
  }];
  this.angleChange = 0;
  this.w = Math.round(this.sizeHex * 2);
  this.h = Math.round(this.sizeHex * Math.sqrt(3));
  this.value = 'HEX';
};

//вычисление новой точки 6-тиугольника
let pointyHexCorner = function(numPoint, x, y, size, angleChange) {
  let angleDeg = 60 * numPoint + angleChange;
  let angleRad = Math.PI / 180 * angleDeg;

  return {
    x: Math.round(x + size * Math.cos(angleRad)),
    y: Math.round(y + size * Math.sin(angleRad))
  };
};

//получаем следующие точки 6-тиугольника
Hex.prototype.getArrCorner = function(centerxy, _size) {
  //let point = [];
  //получаем точки 6-тиугольника
  for (let i = 0; i <= 6; i++) {
    if (i <= 5) {
      this.point[i] = pointyHexCorner(i, centerxy.x, centerxy.y, _size, this.angleChange);
    } else if (i === 6) {
      //добавление первой точки для последнего соединения
      this.point[i] = (pointyHexCorner(0, centerxy.x, centerxy.y, _size, this.angleChange));
    }
  }
  //console.log(this.point);
};

Hex.prototype.hexDraw = function(_centerxy, _size, value) {

  this.getArrCorner(_centerxy, _size);
  //console.log('Points of hex',this.point);
  //ctx.globalAlpha = 0.3;

  //ctx.strokeStyle = '#fef6e4';
    ctx.beginPath();
  for (let i = 0; i < this.point.length; i++)
  {

    if(value == 0 || value == '')
    {
      //ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.lineTo(this.point[i].x, this.point[i].y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#020826';
      ctx.stroke();

      ctx.fillStyle = '#8bd3dd';
      ctx.fill();

    }
    else if(value == 2)
    {
      ctx.lineWidth = 6;
      ctx.lineTo(this.point[i].x, this.point[i].y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#020826';
      ctx.stroke();
      //ctx.beginPath();
      ctx.fillStyle = '#f3d2c1';
      ctx.fill();

      //ctx.lineWidth = 6;
    }
    else if(value == 4)
    {
      ctx.lineWidth = 6;
      ctx.lineTo(this.point[i].x, this.point[i].y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#020826';
      ctx.stroke();
      //ctx.beginPath();
      ctx.fillStyle = '#f582ae';
      ctx.fill();

      //ctx.lineWidth = 2;


      //ctx.lineWidth = 6;
    }

    /*if(value !== '')
    {*/
    /*ctx.lineWidth = 2;
    ctx2.strokeStyle = '#020826';
    ctx2.strokeText(value, _centerxy.x, _centerxy.y);
    ctx2.font = '30px Roboto';*/
    //ctx2.fill();
    ctx2.fillStyle = '#020826';
    ctx2.fillText(value, _centerxy.x, _centerxy.y);
    ctx2.font = '30px Roboto';
    ctx.fill();

//  }

    /*ctx.lineTo(this.point[i].x, this.point[i].y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#020826';
    ctx.stroke();*/
    //ctx.fill();

  }

};

var hex = new Hex();

//let _tempArrHexQR = [];

//генерация массива в кубич. коорд.
let getGridHex = function(lvl) {
  let mapRadius = lvl - 1;
  let tempArr = new Array();
  for (let q = -mapRadius; q <= mapRadius; q++) {

    let r1 = Math.max(-mapRadius, -q - mapRadius);
    let r2 = Math.min(mapRadius, -q + mapRadius);

    for (let r = r1; r <= r2; r++) {
      tempArr.push({
        q: q,
        r: r,
        s: -q - r,
        value: 0
      });
    }
  }
  return tempArr;
};

//преобразование коорд из кубич. в осевые
let getCoordsQR = function(arrCoordsCube) {
  let q = 0;
  let r = 0;
  let s = 0;
  let value = 0;
  let arrCoordsQR = new Array();

  arrCoordsCube.forEach((item, i, arrCoordsCube) => {
    q = item.x;
    r = item.z;
    s = -item.x - item.z;
    value = item.value;
    arrCoordsQR[i] = {
      q: q,
      r: r,
      s: s,
      value: value
    };
  });
  return arrCoordsQR;
};

//преобразование коорд из осевых в кубич.
let getCoordsCube = function(_arrCoordsQR)
{
  let x = 0;
  let y = 0;
  let z = 0;
  let value = 0;
  let arrCoordsCube = new Array();

  _arrCoordsQR.forEach((item, i, _arrCoordsQR) =>
  {
    x = item.q;
    z = item.r;
    y = -x - z;
    value = item.value;

    arrCoordsCube[i] =
    {
      x: x,
      y: y,
      z: z,
      value: value
    };
  });
  return arrCoordsCube;
};

let getCoordsCanvas = function(_arrCoordsQR, _lvl)
{
  let size = Math.round(widthCanvas / (_lvl * 2 * hex.sizeHex * 2));
  let w = Math.round(size * 2);
  let h = Math.round(size * Math.sqrt(3));

  let arrCenterSize = new Array();

  _arrCoordsQR.forEach((item, i, _arrCoordsQR) =>{
    let centerTo =
    {
      x: 0,
      y: 0
    };

    centerTo =
    {
      x: hex.center.x + item.q * w * (3 / 4),
      y: hex.center.y + item.q * h * (1 / 2) + item.r * h
    };

    arrCenterSize.push({center:centerTo, size:size, value:item.value});
  });
  return arrCenterSize;
};

//рисование сетки по осевым коорд.
let gridDraw = function(_lvl)
{
let _arrCoordsQR = getGridHex(_lvl);
let arrHexParam = getCoordsCanvas(_arrCoordsQR, _lvl);

arrHexParam.forEach((item,i,arrHexParam)=>
{
  //проверяем что выбранный размер хекса помещается на холсте и рисуем сетку
  if (widthCanvas >= hex.w * _lvl * 2 && heightCanvas >= hex.h * _lvl * 2)
    {
      hex.hexDraw(item.center, item.size, '');
    }
  else
    {
      alert('Size of Hex is too large!');
    }

});

};

function genSPCH(arr)
{
let c = Math.floor(Math.random() * arr.length);
//console.log(c);

/*while (c === _c)
  {
    c = Math.floor(Math.random() * arr.length);
  };*/

  return c;
};

let genHexToStart = function(_lvl)
{
  let _arrCoordsQR = getGridHex(_lvl);

  let c = Math.floor(Math.random() * _arrCoordsQR.length);
  let c2 = Math.floor(Math.random() * _arrCoordsQR.length);

  while(c === c2)
  {
    c = Math.floor(Math.random() * _arrCoordsQR.length);
    c2 = Math.floor(Math.random() * _arrCoordsQR.length);
  };

  _arrCoordsQR[c].value = 2;
  _arrCoordsQR[c2].value = 2;

//console.log(c,_arrCoordsQR);
  return _arrCoordsQR;
};


let level = document.querySelector('.gameRadius');
//console.log(temparr.getAttribute('data-radius'));

//создаётся главный игровой массив, который будет наполняться и обновляться
let arrGameHex = new Array();

let el = addEventListener('click',readLevel,false);

function readLevel(e)
{
//console.log(e);
//let arrGameHex = new Array();
  if(e.srcElement.id === 'radius2' || e.srcElement.id === 'radius3' || e.srcElement.id === 'radius4')
  {
    clearCanvas();
    arrGameHex = new Array();
    level.setAttribute('data-radius',e.srcElement.value);
    arrGameHex = getHexStart();
    //console.log('Press level',arrGameHex);
    gameStart(arrGameHex);
    status.textContent = gameStatus[0];

  }
return arrGameHex;
};

function getLevel()
{
  //console.log(level.getAttribute('data-radius'));
  return Number(level.getAttribute('data-radius'));
};

function getHexStart()
{
  let lvl = getLevel();

  if(lvl !== 0)
  {
    return genHexToStart(lvl);
  }
  else
  {
    return;
  }
};

//начало игры
let gameStart = function(arr)
{

  let gameLevel = getLevel();
  //let arrGameHex = arr;

  gridDraw(gameLevel);

  //рисуем новые хексы в начале игры
  updGame(arr, gameLevel);

 //console.log('After Start game',arr);
};


//функция обновления игры
function updGame(arr, _lvl)
{
  let arrHexParam = getCoordsCanvas(arr, _lvl);

  clearCanvas();

  gridDraw(_lvl);

  arrHexParam.forEach((item,i,arrHexParam)=>
  {
    if(item.value !== 0){
      hex.hexDraw(item.center, item.size, item.value);
    }
  });

  //запись хексов в DOM
  for(let i=0;i<arr.length;i++)
  {
    //запись хексов в DOM
    let body = document.body;
    body.insertAdjacentHTML('beforeEnd',
    `< div data-x = \" ${arr[i].q} \" data-y = \" ${arr[i].s} \" data-z = \" ${arr[i].r} \" data-value = \" ${arr[i].value} \" > ${arr[i].value} < /div> <br>`);
  }

  //console.log('After Upd game',arrHexParam);
};


//сосед по направлению
function neighbor(_hex, arr, direction,notZero)
{

let delta = 0;
let r1 = 0;
let r2 = 0;
let q1 = 0;
let q2 = 0;
let r = 0;
let q= 0;
let lvl = getLevel();
let mapRadius = (lvl -1);
let arrNrOut = 0;//{hexin:0, nr:0};
let iq = _hex.q;
let ir = _hex.r;

  if (direction === 'KeyW' || direction === 'KeyQ' || direction === 'KeyA')
    {
      delta = 1;
      mapRadius = (lvl -1)*delta;
      r1 = Math.max(-mapRadius, -iq-mapRadius);
      r2 = Math.min(mapRadius, -iq+mapRadius);

      q1 = Math.max(-mapRadius, -ir - mapRadius);
      q2 = Math.min(mapRadius, -ir + mapRadius);
    }
  else if (direction === 'KeyS' || direction === 'KeyE' || direction === 'KeyD')
     {
       delta = -1;
       mapRadius = (lvl -1)*delta;
       r1 = Math.min(-mapRadius, -iq-mapRadius);
       r2 = Math.max(mapRadius, -iq+mapRadius);

       q1 = Math.min(-mapRadius, -ir - mapRadius);
       q2 = Math.max(mapRadius, -ir + mapRadius);
     }

 if (direction === 'KeyW' || direction === 'KeyS')
   {
     if(ir === r2)
     {
       return arrNrOut = 0;
     }
     else
     {
        r=ir;
     }

    do
    {

       for(let i=0;i<arr.length;i++)
        {
          //проверка на 0 для определения соседа
          //для складывания значений 0 - исключаются
          //для перемещения значения 0 не исключатся при поиске соседа
          if(notZero === true)
          {
            if (arr[i].value !== 0 && arr[i].q === iq && arr[i].r === r && arr[i].r !== ir)
             {
              arrNrOut = arr[i];
              return arrNrOut;
             }
          }
          else if(notZero === false)
          {

            if (/*arr[i].value === 0 &&*/ arr[i].q === iq && arr[i].r === r && arr[i].r !== ir)
             {
              if(arr[i].value === 0)
                {
                  arrNrOut = arr[i];
                }
              else
              {
              return arrNrOut;
              }
//              return arrNrOut;

            }
          }
        }
        r+=delta;
     }
     while(r!==r2+delta && r!==ir)
  }

  else if (direction === 'KeyQ' || direction === 'KeyD')
  {

    if(iq === q2)
    {
      return arrNrOut = 0;
    }
    else
    {
       q = iq;
    }

    do
    {

      for(let i=0;i<arr.length;i++)
      {
        if(notZero === true)
        {
         if (arr[i].value !== 0 && arr[i].q === q && arr[i].r === ir && arr[i].q !== iq)
          {
            arrNrOut = arr[i];
            return arrNrOut;
          }
        }
        else if (notZero === false) {
          if (/*arr[i].value === 0 &&*/ arr[i].q === q && arr[i].r === ir && arr[i].q !== iq)
           {
             if(arr[i].value === 0)
               {
                 arrNrOut = arr[i];
               }
             else
             {
             return arrNrOut;
             }
           }
        }
      }
      q+= delta;
    }
    while(q!==q2+delta)
 }

 else if (direction === 'KeyE' || direction === 'KeyA')
 {

   if (delta > 0)
   {
     r1 = Math.min(mapRadius, iq + ir + mapRadius);
     r2 = Math.max(-mapRadius, iq + ir - mapRadius);

     q1 = Math.max(-mapRadius, iq + ir - mapRadius);
     q2 = Math.min(mapRadius, iq + ir + mapRadius);
     //console.log('r1,r2,q1,q2',r1,r2,q1,q2);
   }
   else
   {
     r1 = Math.max(mapRadius, iq + ir + mapRadius);
     r2 = Math.min(-mapRadius, iq + ir - mapRadius);

     q1 = Math.min(-mapRadius, iq + ir - mapRadius);
     q2 = Math.max(mapRadius, iq + ir + mapRadius);
     //console.log('r1,r2,q1,q2',r1,r2,q1,q2);
  }

   if(( iq === q2 && ir === r2))
   {
     return arrNrOut = 0;
   }
   else
   {
     q = iq;
     r = ir;
   }

   do
   {

     for(let i=0;i<arr.length;i++)
     {

       if(notZero === true)
       {
          if (arr[i].value !== 0 && arr[i].q === q && arr[i].r === r && arr[i].q !== iq && arr[i] !== ir)
           {
             arrNrOut = arr[i];
             return arrNrOut;
           }
       }
       else if (notZero === false) {
         if (/*arr[i].value === 0 &&*/ arr[i].q === q && arr[i].r === r && arr[i].q !== iq && arr[i] !== ir)
          {
            if(arr[i].value === 0)
              {
                arrNrOut = arr[i];
              }
            else
            {
            return arrNrOut;
            }
          }
       }
    }

    q+= delta;
    r+= -delta;
   }
   while(r!== r2-delta && q!== q2+delta)

}

return arrNrOut;

};

//двигаем хексы
let moveHex = function(arr, keyCode)
{

//направление в зависимости от кнопки
  let chDir = 0;
  let r1 = 0;
  let r2 = 0;
  let lvl = getLevel();
  let mapRadius = lvl -1;
  let arrOut = new Array();
  let contrKeyCode = 0;

  if (keyCode === 'KeyW' || keyCode === 'KeyQ' || keyCode === 'KeyA')
    {chDir = 1;
    mapRadius = mapRadius*chDir;
    }
  else if (keyCode === 'KeyS' || keyCode === 'KeyE' || keyCode === 'KeyD')
     {chDir = -1;
      mapRadius = mapRadius*chDir;
    }

  if (keyCode === 'KeyW') {contrKeyCode='KeyS';}
  else if (keyCode === 'KeyS') {contrKeyCode='KeyW';}
  else if (keyCode === 'KeyQ') {contrKeyCode='KeyD';}
  else if (keyCode === 'KeyD') {contrKeyCode='KeyQ';}
  else if (keyCode === 'KeyA') {contrKeyCode='KeyE';}
  else if (keyCode === 'KeyE') {contrKeyCode='KeyA';}


let q = -mapRadius;
    do
    {

     if (chDir === 1)
        {
          r1 = Math.max(-mapRadius, -q-mapRadius);
          r2 = Math.min(mapRadius, -q+mapRadius);
        }
      else if (chDir === -1)
         {
           r1 = Math.min(-mapRadius, -q-mapRadius);
           r2 = Math.max(mapRadius, -q+mapRadius);
         }

       let r = r1;
       do
       {

        for(let i = 0; i<arr.length; i++)
        {
         if (arr[i].value !== 0 && arr[i].q === q && arr[i].r === r)
         {
          let hexNR = neighbor(arr[i], arr, keyCode, true);

          let arrOutSide = neighbor(arr[i], arr, contrKeyCode, false);

//если не найден сосед, то перемещаем значение хекса, без перемещения и сложения с соседом
           if(hexNR === 0)
           {
               if(arrOutSide !== 0 && arrOutSide.value === 0)
               {
                 arrOutSide.value =  arr[i].value;
                 arr[i].value= 0;
//перенос значения из соседа в массив хексов
                 arr.forEach((item,j,arr)=>
                 {
                   if(item.q === arrOutSide.q && item.r === arrOutSide.r)
                   {
                     item.value = arrOutSide.value;
                     //return arr;
                   }
                 });
              }

           }
//1.если сосед найден и хекс и сосед имеют одинаковый value
//то складываем хекс с соседом и перемещаем получившийся хекс
          else if (hexNR !== 0 && hexNR.value === arr[i].value)
           {
//проверяем значение value у место для смещения, если "0", то сдвигаем хекс и соседа
             if(arrOutSide !== 0 && arrOutSide.value === 0)
             {
               arrOutSide.value =  arr[i].value + hexNR.value;
              arr[i].value= 0;
              hexNR.value = 0;

              arr.forEach((item,j,arr)=>
              {
                if(item.q === hexNR.q && item.r === hexNR.r)
                {
                  item.value = hexNR.value;
                  //return arr;
                }
              });

              arr.forEach((item,j,arr)=>
              {
                if(item.q === arrOutSide.q && item.r === arrOutSide.r)
                {
                  item.value = arrOutSide.value;
                  //return arr;
                }
              });
             }
//если место для смещения value !== 0, то хекс не смещается
             else if(arrOutSide === 0/*arrOutSide !== 0 && arrOutSide.value !== 0*/)
             {
                arr[i].value+= hexNR.value;
                hexNR.value = 0;

                arr.forEach((item,j,arr)=>
                {
                  if(item.q === hexNR.q && item.r === hexNR.r)
                  {
                    item.value = hexNR.value;
                    //return arr;
                  }
                });
             }
           }
//если хекс и сосед имеют разные value
//то перемещаем хекс и соседа
           else if (hexNR !== 0 && hexNR.value !== arr[i].value)
           {

               if(arrOutSide !== 0 && arrOutSide.value === 0)
               {
                arrOutSide.value = arr[i].value;
                arr[i].value= 0;

                arr.forEach((item,j,arr)=>
                {
                  if(item.q === arrOutSide.q && item.r === arrOutSide.r)
                  {
                    item.value = arrOutSide.value;
                    //return arr;
                  }
                });

              }

             //ищем соседа для перемещения соседа
               let nrOutSide = neighbor(hexNR, arr, contrKeyCode, false);

//если место для соседа найдено, то перемещаем соседа
             if(nrOutSide !== 0 && nrOutSide.value === 0)
             {
               nrOutSide.value = hexNR.value;
               hexNR.value = 0;
               //arr.forEach((item,j,arr)=>
               for(let i=0;i<arr.length;i++)
               {
                 if (arr[i].q === nrOutSide.q && arr[i].r === nrOutSide.r)
                 {
                   arr[i].value = nrOutSide.value;
                   //return;
                 }
               }
             }

           }

         }

      }
      r+=chDir;
     }
     while(r !== r2+chDir)

     q+=chDir;
    }
    while(q !== mapRadius+chDir)

//console.log('Be fore moveHex',arr);
 return arr;
};

//определение нажатой клавиши
let elem = document.documentElement;

elem.addEventListener('keydown',keyDownDo);

async function keyDownDo(e)
{
  //console.log(e);
let gameLevel = getLevel();

if(gameLevel !== 0)
{
  //обработка нажатой клавиши
  if (e.code === 'KeyW' || e.code === 'KeyS' || e.code === 'KeyQ' || e.code === 'KeyE' || e.code === 'KeyA' || e.code === 'KeyD')
  {
  arrGameHex = moveHex(arrGameHex, e.code);
  //updGame(arrGameHex);

  let c = genSPCH(arrGameHex);

  let _arrCoordsQR = new Array();
  _arrCoordsQR[0] = arrGameHex[c];

  let arrRespJson = await getHexFromServer(addressServer, gameLevel, _arrCoordsQR);
  //console.log(arrRespJson);

  for(let i=0; i<arrRespJson.length; i++)
  {
   for(let j=0; j<arrGameHex.length; j++)
    {
      if(arrRespJson[i].q === arrGameHex[j].q && arrRespJson[i].r === arrGameHex[j].r && arrGameHex[j].value === 0)
      {
        arrGameHex[j].value = arrRespJson[i].value;
        break;
      }
      else if(arrRespJson[i].q === arrGameHex[j].q && arrRespJson[i].r === arrGameHex[j].r && arrGameHex[j].value !== 0)
      {
        for(let k=0; k<arrGameHex.length; k++)
        {
          if(arrGameHex[k].value === 0)
          {
            arrGameHex[k].value = arrRespJson[i].value;
            break;
          }
        }
      }
    }
  }

  updGame(arrGameHex, gameLevel);
//return arrGameHex;
}

// проверка на доступность ходов
let count = 0;
let lvl = getLevel();
let mapRadius = lvl -1;
let r1 = 0;
let r2 = 0;
let q = -mapRadius;

do
 {

  r1 = Math.max(-mapRadius, -q-mapRadius);
  r2 = Math.min(mapRadius, -q+mapRadius);

  let r = r1;
   do
    {

  for(let i=0;i<arrGameHex.length;i++)
  {
      let nrCheckStatus;

    if(arrGameHex[i].value !== 0  && arrGameHex[i].q === q && arrGameHex[i].r === r)
    {
//проверяем что каждый хекс имеет соседа с равным value
        let temparr = ['KeyW','KeyS','KeyQ','KeyE','KeyA','KeyD'];

        for(let kc=0;kc<temparr.length;kc++)
        {
          nrCheckStatus = neighbor(arrGameHex[i], arrGameHex, temparr[kc], true);
          //console.log(nrCheckStatus);

          if(nrCheckStatus !== 0 && nrCheckStatus.value === arrGameHex[i].value)
          {
            count++;
          }
       }
    }
//или что хотя бы один хекс из массива имеет value = 0
    else if(arrGameHex[i].value === 0)
    {
      count++;
    }
  }

    r++;
   }
   while(r !== r2+1)

   q++;
  }
  while(q !== mapRadius+1)


      if(count !== 0)
      {
        status.textContent = gameStatus[0];
        let temp = document.querySelector('.gameStatus');
        temp.setAttribute('data-status',gameStatus[0]);
        //console.log(temp);
      }
      else
      {
        status.textContent = gameStatus[1];
        let temp = document.querySelector('.gameStatus');
        temp.setAttribute('data-status',gameStatus[1]);
        //console.log(temp);
        return;
      }

//запись хексов в DOM
      /*for(let i=0;i<arrGameHex.length;i++)
      {
        //запись хексов в DOM
        let body = document.body;
        body.insertAdjacentHTML('beforeEnd',
        `< div data-x = \" ${arrGameHex[i].q} \" data-y = \" ${arrGameHex[i].s} \" data-z = \" ${arrGameHex[i].r} \" data-value = \" ${arrGameHex[i].value} \" > ${arrGameHex[i].value} < /div> <br>`);

      }*/
    }

};

//реплика функции для тестов на сервер
function readLevel2(radius)
{
//console.log(e);
//let arrGameHex = new Array();
  if(radius === 'radius2' || radius === 'radius3' || radius === 'radius4')
  {
    clearCanvas();
    arrGameHex = new Array();
    //level.setAttribute('data-radius',e.srcElement.value);
    arrGameHex = getHexStart();
    //console.log('Press level',arrGameHex);
    gameStart(arrGameHex);
    status.textContent = gameStatus[0];

  }
return arrGameHex;
};

//реплика функции для тестов на сервер
async function keyDownDo2(code)
{

let gameLevel = getLevel();

if(gameLevel !== 0)
{
  //обработка нажатой клавиши
  if (code === 'KeyW' || code === 'KeyS' || code === 'KeyQ' || code === 'KeyE' || code === 'KeyA' || code === 'KeyD')
  {
  arrGameHex = moveHex(arrGameHex, code);
  //updGame(arrGameHex);

  let c = genSPCH(arrGameHex);

  let _arrCoordsQR = new Array();
  _arrCoordsQR[0] = arrGameHex[c];

  let arrRespJson = await getHexFromServer(addressServer, gameLevel, _arrCoordsQR);
  //console.log(arrRespJson);

  for(let i=0; i<arrRespJson.length; i++)
  {
   for(let j=0; j<arrGameHex.length; j++)
    {
      if(arrRespJson[i].q === arrGameHex[j].q && arrRespJson[i].r === arrGameHex[j].r && arrGameHex[j].value === 0)
      {
        arrGameHex[j].value = arrRespJson[i].value;
        break;
      }
      else if(arrRespJson[i].q === arrGameHex[j].q && arrRespJson[i].r === arrGameHex[j].r && arrGameHex[j].value !== 0)
      {
        for(let k=0; k<arrGameHex.length; k++)
        {
          if(arrGameHex[k].value === 0)
          {
            arrGameHex[k].value = arrRespJson[i].value;
            break;
          }
        }
      }
    }
  }

  updGame(arrGameHex, gameLevel);
//return arrGameHex;
}

// проверка на доступность ходов
let count = 0;
let lvl = getLevel();
let mapRadius = lvl -1;
let r1 = 0;
let r2 = 0;
let q = -mapRadius;

do
 {

  r1 = Math.max(-mapRadius, -q-mapRadius);
  r2 = Math.min(mapRadius, -q+mapRadius);

  let r = r1;
   do
    {

  for(let i=0;i<arrGameHex.length;i++)
  {
      let nrCheckStatus;

    if(arrGameHex[i].value !== 0  && arrGameHex[i].q === q && arrGameHex[i].r === r)
    {
//проверяем что каждый хекс имеет соседа с равным value
        let temparr = ['KeyW','KeyS','KeyQ','KeyE','KeyA','KeyD'];

        for(let kc=0;kc<temparr.length;kc++)
        {
          nrCheckStatus = neighbor(arrGameHex[i], arrGameHex, temparr[kc], true);
          //console.log(nrCheckStatus);

          if(nrCheckStatus !== 0 && nrCheckStatus.value === arrGameHex[i].value)
          {
            count++;
          }
       }
    }
//или что хотя бы один хекс из массива имеет value = 0
    else if(arrGameHex[i].value === 0)
    {
      count++;
    }
  }

    r++;
   }
   while(r !== r2+1)

   q++;
  }
  while(q !== mapRadius+1)


      if(count !== 0)
      {
        status.textContent = gameStatus[0];
        let temp = document.querySelector('.gameStatus');
        temp.setAttribute('data-status',gameStatus[0]);
        //console.log(temp);
      }
      else
      {
        status.textContent = gameStatus[1];
        let temp = document.querySelector('.gameStatus');
        temp.setAttribute('data-status',gameStatus[1]);
        //console.log(temp);
        return;
      }

//запись хексов в DOM
    /*  for(let i=0;i<arrGameHex.length;i++)
      {
        //запись хексов в DOM
        let body = document.body;
        body.insertAdjacentHTML('beforeEnd',
        `< div data-x = \" ${arrGameHex[i].q} \" data-y = \" ${arrGameHex[i].s} \" data-z = \" ${arrGameHex[i].r} \" data-value = \" ${arrGameHex[i].value} \" > ${arrGameHex[i].value} < /div> <br>`);

      }*/
    }

};

//получение адреса страницы
let href = window.location.hash;
console.log(href);

function test(_href)
{
let hrad = document.querySelector('.gameRadius');//document.documentElement;
  if(_href === '')
  {
    hrad.setAttribute('data-radius','2');
    readLevel2('radius2');
    //keyDownDo2(code);
  }
  else if(_href === '#test3')
  {
    hrad.setAttribute('data-radius','3');
    readLevel2('radius3');
    //keyDownDo2(code);
  }
  else if(_href === '#test4')
  {
    hrad.setAttribute('data-radius','4');
    readLevel2('radius4');
    //keyDownDo2(code);
  }
};

test(href);
