var canvas = document.getElementById("tetris");
 var context = canvas.getContext("2d");
 var padding = 6,
 size = 32,
 minX = 0,
 maxX = 10,
 minY = 0,
 maxY = 18,
 score = 0,
 level = 1;
 var gameMap = new Array(); //游戏地图，二维数组
 var gameTimer;
 initGameMap();
 //绘制垂直线条
 drawGrid();
 var arrays = basicBlockType();
 var blockIndex = getRandomIndex();
 //随机画一个方块意思意思
 var block = getPointByCode(blockIndex);
 context.fillStyle = getBlockColorByIndex(blockIndex);
 drawBlock(block);
 /**
 
 * 初始化游戏地图
 
 */
 function initGameMap() {
 for (var i = 0; i < maxY; i++) {
  var row = new Array();
  for (var j = 0; j < maxX; j++) {
  row[j] = false;
  }
  gameMap[i] = row;
 }
 }
 /**
 
 * 方块旋转
 
 * 顺时针：
 
 * A.x =O.y + O.x - B.y
 
 * A.y =O.y - O.x + B.x
 
 */
 function round() {
 //正方形的方块不响应旋转  
 if (blockIndex == 4) {
  return;
 }
 //循环处理当前的方块，找新的旋转点
 for (var i = 1; i < block.length; i++) {
  var o = block[0];
  var point = block[i];
  //旋转后的位置不能与现有格子的方块冲突
  var tempX = o.y + o.x - point.y;
  var tempY = o.y - o.x + point.x;
  if (isOverZone(tempX, tempY)) {
  return; //不可旋转
  }
 }
 clearBlock();
 //可以旋转，设置新的旋转后的坐标
 for (var i = 1; i < block.length; i++) {
  var o = block[0];
  var point = block[i];
  //旋转后的位置不能与现有格子的方块冲突
  var tempX = o.y + o.x - point.y;
  var tempY = o.y - o.x + point.x;
  block[i] = {
  x: tempX,
  y: tempY
  };
 }
 drawBlock();
 }
 function moveDown() {
  
 var overFlag = canOver();
 if(overFlag){
  //如果不能向下移动了，将当前的方块坐标载入地图
  window.clearInterval(gameTimer);
  add2GameMap();
  //清除游戏区域内的不同颜色的格子，使用单一颜色重新绘制地图堆积物
  redrawGameMap();
  return;//游戏结束
 }
  
 var flag = moveTo(0, 1);
 //如果可以移动，则继续移动
 if (flag) {
  return;
 }
 //如果不能向下移动了，将当前的方块坐标载入地图
 add2GameMap();
  
 //进行消行动作
 clearLines();
 //清除游戏区域内的不同颜色的格子，使用单一颜色重新绘制地图堆积物
 redrawGameMap();
 //如果不能向下移动，则继续下一个方块
 nextBlock();
 }
  
 /**
 
 * 消行动作，返回消除的行数
 
 */
 function clearLines() {
 var clearRowList = new Array();
 for (var i = 0; i < maxY; i++) {
  var flag = true;
  for (var j = 0; j < maxX; j++) {
  if (gameMap[i][j] == false) {
   flag = false;
   break;
  }
  }
  if (flag) {
  clearRowList.push(i); //记录消除行号的索引
  }
 }
 var clearRows = clearRowList.length;
 //所谓的消行就是将待消除行的索引，下方所有的格子上移动
 for (var x = 0; x < clearRows; x++) {
  var index = clearRowList[x];
  for (var i = index; i > 0; i--) {
  for (var j = 0; j < maxX; j++) {
   gameMap[i][j] = gameMap[i - 1][j];
  }
  }
 }
 if (clearRows > 0) {
  for (var i = 0; i < maxY; i++) {
  //此处可以限制满足相关条件的方块进行清除操作&& j < clearRowList[clearRows - 1]
  for (var j = 0; j < maxX; j++) {
   if (gameMap[i][j] == false) {
   clearBlockByPoint(i, j);
   }
  }
  }
 }
 }
 /**
 
 * 重绘游戏地图
 
 */
 function redrawGameMap() {
 drawGrid();
 for (var i = 0; i < maxY; i++) {
  for (var j = 0; j < maxX; j++) {
  if (gameMap[i][j]) {
   roadBlock(j, i);
  }
  }
 }
 }
 /**
 
 * 打印阴影地图
 
 */
 function drawShadowBlock() {
 var currentBlock = block;
 var shadowPoints = getCanMoveDown();
 if (shadowPoints != null && shadowPoints.length > 0) {
  for (var i = 0; i < shadowPoints.length; i++) {
  var point = shadowPoints[i];
  if (point == null) {
   continue;
  }
  var start = point.x * size;
  var end = point.y * size;
  context.fillStyle = "#abcdef";
  context.fillRect(start, end, size, size);
  context.strokeStyle = "black";
  context.strokeRect(start, end, size, size);
  }
 }
 }
 /**
 
 * 返回最多可移动到的坐标位置（统计总共可以下落多少步骤）
 
 * @return最多可移动到的坐标位置
 
 */
 function getCanMoveDown() {
 var nps = canMove(0, 1, block);
 var last = null;
 if (nps != null) {
  last = new Array();
  while ((nps = canMove(0, 1, nps)) != null) {
  if (nps != null) {
   last = nps;
  }
  }
 }
 return last;
 }
  
 function canOver(){
 var flag = false;
 for (var i = 0; i < block.length; i++) {
  var point = block[i];
  var x = point.x;
  var y = point.y;
  if(isOverZone(x , y)){
  flag = true;
  break;
  }
 }
 return flag;
 }
  
 function drawLevelScore() {
  
 }
 /**
 
 * 将不能移动的各种填充至地图
 
 */
 function add2GameMap() {
 for (var i = 0; i < block.length; i++) {
  var point = block[i];
  var x = point.x;
  var y = point.y;
  var gameMapRow = gameMap[y]; //获取到地图的一行
  gameMapRow[x] = true; //将此行中的某个格子标记为堆积物
  gameMap[y] = gameMapRow; //再将行给设置回来
 }
 }
 function moveLeft() {
 moveTo(-1, 0);
 }
 function moveRight() {
 moveTo(1, 0);
 }
 function quickDown() {
 while (moveTo(0, 1));
 }
 function moveTo(moveX, moveY) {
 var move = canMove(moveX, moveY, block); //判定是否可以移动
 if (move == null) {
  return false;
 }
 clearBlock();
 for (var i = 0; i < block.length; i++) {
  var point = block[i];
  point.x = point.x + moveX;
  point.y = point.y + moveY;
 }
 drawBlock();
 return true;
 }
 /**
 
 * 下一个方块
 
 */
 function nextBlock() {
 blockIndex = getRandomIndex();
 block = getPointByCode(blockIndex);
 context.fillStyle = getBlockColorByIndex(blockIndex);
 drawBlock();
 }
 document.onkeypress = function(evt) {
 var key = window.event? evt.keyCode : evt.which;
 switch (key) {
  case 119: //向上旋转 W
  round();
  break;
  case 115: //向下移动 S
  moveDown();
  break;
  case 97: //向左移动 A
  moveLeft();
  break;
  case 100: //向右移动 D
  moveRight();
  break;
  case 32: //空格键快速下落到底
  quickDown();
  break;
 }
 }
 /**
 
 * 判定是否可以移动
 
 * @parammoveX 横向移动的个数
 
 * @parammoveY 纵向移动的个数
 
 */
 function canMove(moveX, moveY, currentBlock) {
 var flag = true;
 var newPoints = new Array();
 for (var i = 0; i < currentBlock.length; i++) {
  var point = currentBlock[i];
  var tempX = point.x + moveX;
  var tempY = point.y + moveY;
  if (isOverZone(tempX, tempY)) {
  flag = false;
  break;
  }
 }
 if (flag) {
  for (var i = 0; i < currentBlock.length; i++) {
  var point = currentBlock[i];
  var tempX = point.x + moveX;
  var tempY = point.y + moveY;
  newPoints[i] = {
   x: tempX,
   y: tempY
  };
  }
  return newPoints;
 }
 return null;
 }
 /**
 
 * 判定是否可以移动
 
 * @paramx 预移动后的横坐标
 
 * @paramy 预移动后的纵坐标
 
 */
 function isOverZone(x, y) {
 return x < minX || x >= maxX || y < minY || y >= maxY || gameMap[y][x];
 }
 document.body.click();
  
 gameTimer = window.setInterval(moveDown , 800);
  
 /**
 
 * 初始化方块的基础数据
 
 */
 function basicBlockType() {
 var arrays = new Array();
 arrays[0] = [{
  x: 4,
  y: 0
 }, {
  x: 3,
  y: 0
 }, {
  x: 5,
  y: 0
 }, {
  x: 6,
  y: 0
 }];
 arrays[1] = [{
  x: 4,
  y: 0
 }, {
  x: 3,
  y: 0
 }, {
  x: 5,
  y: 0
 }, {
  x: 4,
  y: 1
 }];
 arrays[2] = [{
  x: 4,
  y: 0
 }, {
  x: 3,
  y: 0
 }, {
  x: 5,
  y: 0
 }, {
  x: 3,
  y: 1
 }];
 arrays[3] = [{
  x: 4,
  y: 0
 }, {
  x: 5,
  y: 0
 }, {
  x: 3,
  y: 1
 }, {
  x: 4,
  y: 1
 }];
 arrays[4] = [{
  x: 4,
  y: 0
 }, {
  x: 5,
  y: 0
 }, {
  x: 4,
  y: 1
 }, {
  x: 5,
  y: 1
 }];
 arrays[5] = [{
  x: 4,
  y: 0
 }, {
  x: 3,
  y: 0
 }, {
  x: 5,
  y: 0
 }, {
  x: 5,
  y: 1
 }];
 arrays[6] = [{
  x: 4,
  y: 0
 }, {
  x: 3,
  y: 0
 }, {
  x: 4,
  y: 1
 }, {
  x: 5,
  y: 1
 }];
 return arrays;
 }
 function basicBlockColor() {
 return ["#FFB6C1", "#87CEFA", "#ADFF2F", "#FAFF8D", "#B0E0E6", "#98FB98", "#ADFF2F"];
 }
 function getBlockColorByIndex(typeCodeIndex) {
 var arrays = basicBlockColor();
 return arrays[typeCodeIndex];
 }
 /**
 
 * 根据编号返回指定编号的方块
 
 * @paramtypeCodeIndex 方块编号索引
 
 */
 function getPointByCode(typeCodeIndex) {
 var arrays = basicBlockType();
 return arrays[typeCodeIndex];
 }
 /**
 
 * 获取随即出现方块的范围值
 
 * @paramlens 随机数的范围
 
 */
 function getRandomIndex() {
 return parseInt(Math.random() * (arrays.length - 1), 10);
 }
 /**
 
 * 绘制方块，按格子单个绘制
 
 */
 function drawBlock() {
 drawGrid();
 for (var i = 0; i < block.length; i++) {
  var point = block[i];
  var start = point.x * size;
  var end = point.y * size;
  context.fillStyle = getBlockColorByIndex(blockIndex);
  context.fillRect(start, end, size, size);
  context.strokeStyle = "black";
  context.strokeRect(start, end, size, size);
 }
 drawShadowBlock();
 }
 /**
 
 * 绘制障碍物
 
 */
 function roadBlock(x, y) {
 context.fillStyle = "darkgray";
 var start = x * size;
 var end = y * size;
 context.fillRect(start, end, size, size);
 }
 /**
 
 * 绘制新的方块先清除之前的方块
 
 */
 function clearBlock() {
 for (var i = 0; i < block.length; i++) {
  var point = block[i];
  var start = point.x * size;
  var end = point.y * size;
  context.clearRect(start, end, size, size);
 }
 }
 /**
 
 * 初始化一个新的行
 
 */
 function initGameMapRow() {
 var array = new Array();
 for (var i = 0; i < maxX; i++) {
  array[i] = false;
 }
 return array;
 }
 /**
 
 * 根据坐标清除指定格子的内容
 
 * @paramx 横坐标
 
 * @paramy 纵坐标
 
 */
 function clearBlockByPoint(x, y) {
 var start = y * size;
 var end = x * size;
 context.clearRect(start, end, size, size);
 }
 /**
 
 * 清掉所有位置的空白格的绘图
 
 */
 function clearAllNullPoint() {
 for (var i = 0; i < maxY; i++) {
  for (var j = 0; j < maxX; j++) {
  if (gameMap[i][j] == false) {
   clearBlockByPoint(i, j);
  }
  }
 }
 }
 /**
 
 * 绘制网格线
 
 * @paramcontext 绘图对象
 
 */
 function drawGrid() {
 clearAllNullPoint(); //清除掉当前方块下落位置造成的阴影
 context.strokeStyle = "grey"; //画笔颜色
 for (var i = 0; i <= maxX; i++) {
  var start = i * size;
  var end = start + size;
  context.beginPath();
  context.moveTo(start, 0);
  context.lineTo(size * i, size * maxY);
  context.stroke();
  context.closePath();
 }
 //绘制水平线条
 for (var i = 0; i <= maxY; i++) {
  var start = i * size;
  var end = start + size;
  context.beginPath();
  context.moveTo(0, size * i);
  context.lineTo(size * maxX, size * i);
  context.stroke();
  context.closePath();
 }
 }