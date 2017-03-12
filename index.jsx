/*————————————————————————————————————————————————————
  Project Name:   PS批量处理图片
  Date:           2016.05
  update:         2017.03.12
  Author:         徽
  Description:    主要为了解决批量处理二维码图片的问题，减少重复劳动。
                  适用于 win7, Photoshop CC 2015
                  演示 http://c2funny.com/cases/photoshopJXP-demo
—————————————————————————————————————————————————————*/
#target Photoshop
#include 'phone-model-defaults.jsx';
var res = "dialog{\
  properties:{ closeOnKey:'OSCmnd+W'},\
  margins: 0,\
  tabbed: Panel{\
    type: 'tabbedpanel',\
    borderStyle: 'none',\
    tab1: Panel{\
      type: 'tab',\
      text: '处理图片',\
      alignChildren: ['fill', ''],\
      titleGroup: Group{\
        st: StaticText{\
          text: '模版主题：　　　　'\
        },\
        et: EditText{\
          properties: {name: 'title'},\
          text: '例如，模版20-毕业季',\
          preferredSize: [260, '']\
        }\
      },\
      packageGroup: Group{\
        st: StaticText{\
          text: '模版套装（选填）：'\
        },\
        et: EditText{\
          properties: {name: 'phonePackage'},\
          text: '',\
          preferredSize: [260, '']\
        }\
      },\
      layoutGroup: Group{\
        margins: [0, 0, 0, 30],\
        st: StaticText{\
          text: '版式：　　　　　　'\
        },\
        ddl: DropDownList{\
          properties: {\
            name: 'layout',\
            items: ['竖版', '横版']\
          },\
        }\
      },\
      background: Group{\
        alignChildren:'left',\
        btn: Button{text:'浏览...', properties: {name: 'btnBrowseBg'}},\
        et: EditText{\
          text:'底图',\
          properties: {name: 'etBgFile'},\
          preferredSize: [300, '']\
        },\
      },\
      foregrounds: Panel{\
        properties: {name: 'foregrounds'},\
        alignChildren: ['left', 'top'],\
        orientation: 'row',\
      },\
      between: Group{\
        alignChildren: ['fill', ''],\
        margins: [0, 20, 0, 0],\
        line: Panel{},\
      },\
      output: Group{\
        btn: Button{text:'输出到...', properties: {name: 'btnOutputTo'}},\
        et: EditText{properties: {name: 'etOutputPath'}, preferredSize: [300, '']},\
        visible: false\
      },\
      et: EditText{\
        properties: {name: 'etLog', multiline: true, readonly: true}\
        preferredSize: [0, 100]\
      }\
      btns: Group{\
        alignment: 'center',\
        btnRun: Button{text:'运 行', id: 'btn1', properties: {name: 'btnRun'}, enabled: false},\
        btnCancel: Button{\
          properties: {name: 'cancel'},\
          text: '关 闭',\
        }\
      }\
    },\
    tab2: Panel{\
      type: 'tab',\
      text: '设定',\
      size: ['', ''],\
      alignChildren: ['left', ''],\
      header: Group{\
        st: StaticText{\
          text: '　　　　选择是否处理',\
          preferredSize: [245, 15],\
        },\
        st: StaticText{\
          text: '尺寸',\
          preferredSize: [60, 15]\
        },\
        st: StaticText{\
          text: '备注',\
          preferredSize: [200, 15]\
        }\
      },\
      operat: Group{\
        properties: {name: 'operat'},\
        cb: Checkbox{\
          properties: {name: 'cbAll'},\
          text: '全选',\
        },\
        cb: Checkbox{\
          properties: {name: 'cbOpposite'},\
          text: '反选',\
        }\
      },\
      scrollArea: Panel{\
        alignChildren: ['left', 'top'],\
        properties: {name: 'scrollArea'},\
        orientation: 'row',\
        margins: 0,\
        scrollGroup: Group{\
          margins: [10, 20, 10, 20]\
          properties: {name: 'scrollGroup'},\
          alignChildren: 'left',\
          orientation: 'column'\
        }\
      },\
    }\
  }\
}";

var dlgMain = new Window(res, '批量修改图片');
var etLog = dlgMain.findElement('etLog');

//选择横版/竖版
var dropdownLayout = dlgMain.findElement('layout');
dropdownLayout.selection = 0;
/*
dropdownLayout.addEventListener('change', function(){
   $.writeln( dropdownLayout.selection.text );
})
*/

var myPath;
var defaultPath = '~/Desktop/phone-templates';       //默认保存到桌面
var etOutputPath = dlgMain.findElement('etOutputPath');
myPath = defaultPath = new Folder(defaultPath);
etOutputPath.text = myPath.fsName;
var importFile, exportFile;
importFile = exportFile = new File(myPath +'/' +'mydata.json');

//如果找到上次保存的 'mydata.json' 文檔，就用來覆盖 phoneModel 的值，否则保持默认。
if(importFile.exists){
  //從文檔中读取内容
  importFile.encoding = "UTF8";
  importFile.open("r", "TEXT");

  //把读取到的内容转成JSON
  var temp = strToJson(importFile.read());

  //覆盖原來的 phoneModel
  phoneModel = temp;

  /*如果'值'为字符，將其转成数字
  for(var i in phoneModel){
    phoneModel[i].width = Number(phoneModel[i].width);
    phoneModel[i].height = Number(phoneModel[i].height);
  }
  */

  importFile.close();
}

/////////////////////////////////////////////////////////////////

var scrollGroup = dlgMain.findElement('scrollGroup');
var showPhoneModel = [];  //用于显示手机型号列表

//全选
var cbAll = dlgMain.findElement('cbAll');
//反选
var cbOpposite = dlgMain.findElement('cbOpposite');

/*
如果内容超出屏幕高度，即使向下滚动，也无法显示(运行环境：win7, Photoshop CC 2015)，
所以，一开始就要设定足夠高度以容納全部内容
*/
scrollGroup.maximumSize.height = 9999;
/*
var i in phoneModel
i=0; i<10; i++
*/
  for(var i in phoneModel){
    showPhoneModel[i] = scrollGroup.add("Group{\
      alignChildren:['', 'top'],\
      properties:{\
        name: 'items" +i +"',\
        index: " +i +"\
      },\
      st: StaticText{\
        text: '" +(Number(i) + 1) +"',\
        justify: 'right',\
        preferredSize: [30, 15]\
      },\
      cb: Checkbox{\
        text: '" +phoneModel[i].name +"',\
        value:" +phoneModel[i].isAuto +",\
        minimumSize: [180, '']\
      },\
      st: StaticText{\
        text: '" +phoneModel[i].width +"x" +phoneModel[i].height +"',\
        justify: 'right',\
        preferredSize: [60, 15]\
      },\
      etNotes: StaticText{\
        text: '" +phoneModel[i].notes +"',\
        minimumSize: [260, ''],\
        properties: {multiline: true}\
      },\
    }");

    showPhoneModel[i].cb.onClick = function(){
      cbAll.value = false;

      //此时已经是循环后，所以i值不正确，通过再读取自身的 index 属性來指定当前下标。
      var thisIndex = this.parent.properties.index;
      phoneModel[thisIndex].isAuto = this.value;
    }
    showPhoneModel[i].etNotes.onChange = function(){
      var thisIndex = this.parent.properties.index;
      phoneModel[thisIndex].notes = this.text;
    }
  }



//添加滚动条
var sbar = dlgMain.findElement('scrollArea').add("scrollbar");
sbar.preferredSize.width = 20;
sbar.stepdelta = 20;
sbar.jumpdelta = 100;


sbar.onChanging = function(){
  //$.writeln (sbar.value);
  this.value <= 0 ? scrollGroup.location.y = 0 : scrollGroup.location.y = -(this.value);

}
dlgMain.onShow = function(){
  dlgMain.findElement('operat').location.y = 550;
  dlgMain.findElement('scrollArea').location.y = 35;

  //可示区域高度
  dlgMain.findElement('scrollArea').size.height = dlgMain.tabbed.tab2.size.height -100;

  //内容总高度(非最大高度)减去可示区域高度，得到需要滚动的高度
  sbar.maxvalue = scrollGroup.size.height - dlgMain.findElement('scrollArea').size.height;

  sbar.size.height = dlgMain.findElement('scrollArea').size.height;
  $.writeln(dlgMain.size.height);
}

//默认选中第一个
dlgMain.tabbed.selection = 0;

//全选
cbAll.onClick = function(){
  for(var i in phoneModel){
    this.value ? showPhoneModel[i].cb.value = true : showPhoneModel[i].cb.value = false;
    phoneModel[i].isAuto = showPhoneModel[i].cb.value;
  }
}

//反选
cbOpposite.onClick = function(){
  for(var i in phoneModel){
    showPhoneModel[i].cb.value ? showPhoneModel[i].cb.value = false : showPhoneModel[i].cb.value = true;
    phoneModel[i].isAuto = showPhoneModel[i].cb.value;
  }
}

/////////////////////////////////////////////////////////////////

var docs = {
  bg: '',          //存放背景图
  bgWidth: 1280,
  bgHeight: 2275,
  //fg: [],        //存放前景图
  inbg: []         //复制到背景里的前景图
};

var addFg;
addFg = new Array(2);
function addForeground(selecter, setDefaults){
  var panNineGrid, etX, etY;

  this.selecter = selecter;
  this.btnBrowser = undefined;
  this.foregroundImage = undefined,
  this.directionPosition = {}, //方向
  this.migratedPosition = {},   //调整

  this.options = {
    fgIndex: undefined,
    fgChecked: false,
    fgTitle: '其它需要定位的元素',
    fgPlaceholder: '',
    isQRcode: false
  };
  for(var i in setDefaults){
    this.options[i] = setDefaults[i];
  }

  this.init();
}

addForeground.prototype = {
  log: function(){
    alert();
  },
  init: function(){

    this.layout();

  },
  layout: function(){
    var options = this.options;
    var foreground = this.selecter.add("Group{\
      orientation: 'column',\
      alignChildren: 'left',\
      cb: Checkbox{\
        text:'" +options.fgTitle +"',\
        properties:{name: 'cbChooseFg'},\
        value:" +options.fgChecked +"\
      },\
      grp1: Group{\
        btn: Button{\
          text: '浏览...'\
        },\
        et: EditText{\
          text:'" +options.fgPlaceholder +"',\
          preferredSize: [200, '']\
        }\
      },\
      grp2: Group{\
        alignChildren: 'fill',\
        pan1: Panel{\
          text: '方向',\
          properties:{name: 'panNineGrid'},\
        },\
        pan2: Panel{\
          text: '调整',\
          grpX: Group{\
            st: StaticText{text: 'x:'},\
            etX: EditText{text: '0', preferredSize: [35, ''], properties:{name: 'etX'}}\
            st: StaticText{text: '%'}\
          },\
          grpY: Group{\
            st: StaticText{text: 'y:'},\
            etY: EditText{text: '10', preferredSize: [35, ''], properties:{name: 'etY'}}\
            st: StaticText{text: '%'}\
          }\
        }\
      }\
    }")

    foreground.margins.right = 40;


    /*↓方向*/
    panNineGrid = foreground.grp2.panNineGrid;
    for(r=0; r<=2; r++){//行
      panNineGrid.add("Group{properties:{name: 'radioGroup_" + r +"'}}");
      for(c=0; c<=2; c++){//列
        panNineGrid.children[r].add("RadioButton{\
          id: 'radioButton" +'_' +r +'_' +c +"',\
          properties:{name: 'radioButton_" +r +'_' +c +"'}\
        }");
      }
    }
    /*↑方向*/

    //调整
    etX = foreground.grp2.pan2.grpX.etX;
    etY = foreground.grp2.pan2.grpY.etY;

    /*
    如果是二维码，
    [方向]选中最后一行第二个，[调整]x: 0, y: -3;
    否则，
    [方向]选中第一行第一个； [调整]x: 0, y: 0
    */
    if(options.isQRcode){
      panNineGrid.radioGroup_2.radioButton_2_1.value = true;
      this.directionPosition.r = 2;
      this.directionPosition.c = 1;

      this.migratedPosition.x = etX.text = 0;
      this.migratedPosition.y = etY.text = -3;

      foreground.add("Group{\
        orientation: 'column',\
        alignChildren: 'left',\
        qrGroup1: Group{\
          st: StaticText{text: '二维码背景颜色：'},\
          et: EditText{\
            properties:{name: 'bgColor'},\
            preferredSize: [55, ''],\
          }\
        },\
        qrGroup1: Group{\
          st: StaticText{text: '二维码噪点颜色：'},\
          et: EditText{\
            properties:{name: 'hotPixelColor'},\
            preferredSize: [55, ''],\
          }\
        }\
      }");

    }else{
      panNineGrid.radioGroup_0.radioButton_0_0.value = true;
      this.directionPosition.r = 0;
      this.directionPosition.c = 0;

      this.migratedPosition.x = etX.text = 0;
      this.migratedPosition.y = etY.text = 0;
    }


    this.btnBrowser = foreground.grp1.btn;

    this.events(foreground);


  },
  events: function(foreground){
    var me = this;


    function fgCheck(){
      if(foreground.cbChooseFg.value){
        me.options.fgChecked = true;
        foreground.grp1.enabled = true;
        foreground.grp2.enabled = true;
      }else{
        me.options.fgChecked = false;
        me.foregroundImage = undefined;
        me.btnBrowser.parent.children[1].text = '';
        foreground.grp1.enabled = false;
        foreground.grp2.enabled = false;
      }
    }
    fgCheck();

    foreground.cbChooseFg.addEventListener('click', fgCheck);

    //浏览前景图(start)
    me.btnBrowser.onClick = function(){
      if(me.options.isQRcode){
        var currentFile = openFile('*.psd');
      }else{
        var currentFile = openFile('图片文件: *.png; *.jpg');
      }
      if(currentFile){
        var opened = false;

        for(n=0; n<addFg.length; n++){
          if( addFg[n].foregroundImage == currentFile.obj){
            alert('已打开此文件。');
            opened = true;
            break;
          }
        }
        if(!opened){
          me.foregroundImage = currentFile.obj;
          this.parent.children[1].text = currentFile.fsName;
        }
      }
    }
    //浏览前景图(end)

    //点阵区域，互斥(start)
    panNineGrid.addEventListener('click', function(e){
      for(r=0; r<this.children.length; r++){//行
        for(c=0; c<this.children[r].children.length; c++){//列
          if(this.children[r].children[c] == e.target){
            e.target.value = true;

            //保存好所选的位置
            me.directionPosition.r = r;
            me.directionPosition.c = c;
          }else{
            this.children[r].children[c].value = false;
          }
        }
      }
    })
    //点阵区域，互斥(end)

    //调整
    etX.addEventListener('change', function(e){
      me.migratedPosition.x = this.text;
    });
    etY.addEventListener('change', function(e){
      me.migratedPosition.y = this.text;
    });

  }

}

// 实例化
for(i = addFg.length-1; i >= 0; i--){
  // ！最后一个必須是「二维码」，因为要保证其层级为最高。
  if(i == addFg.length - 1){
    addFg[i] = new addForeground(dlgMain.findElement('foregrounds'), {
      fgIndex: i,
      fgChecked: false,
      fgTitle: '二维码(使用指定的 QRcode PSD文档)',
      isQRcode: true
    });
  }else{
    addFg[i] = new addForeground(dlgMain.findElement('foregrounds'), {
      fgIndex: i,
      fgChecked: false
    });
  }
}

function openFile(filter){
  var selFile = File.openDialog(undefined, filter);
  //是否存在
  if(selFile.exists){
    return {
      obj: open(File(selFile.absoluteURI)),
      fsName: selFile.fsName
    }
  }else{
    alert('文件有误：\r' +selFile.fsName);
    return false;
  }
}

//打开背景图
dlgMain.findElement('btnBrowseBg').onClick = function(){
  var currentFile = openFile('图片文件: *.png; *.jpg');
  if(currentFile){
    docs.bg = currentFile.obj;
    dlgMain.findElement('btnRun').enabled = true;
    dlgMain.findElement('etBgFile').text = currentFile.fsName;
  }

}

//输出到...
function selectPath(){
  myPath = Folder.selectDialog("请选择目录:");
  if(myPath){
    etOutputPath.text = myPath.fsName;
  }else{
    etOutputPath.text = myPath = new Folder(defaultPath).fsName;
  }
}

etOutputPath.onChange = function(){
  if(!etOutputPath.text){
    selectPath();
  }else{
    myPath = new Folder(etOutputPath.text);
  }
}

dlgMain.findElement('btnOutputTo').onClick = selectPath;


//改尺寸(start)
function resize(w, h){
  app.activeDocument = docs.bg;
  if(h == undefined){
    alert('缺少高度');
  }
  docs.bg.resizeImage(w, h);
  etLog.text += 'resize: ' +w +'x' +h +'\r';
  var percentVal = w / docs.bgWidth;
  var percent = UnitValue((percentVal * 100), '%');

  return {
    zoom: percentVal
  }
}
//改尺寸(end)


//复制(start)
function duplicateAndMove(i, bgNewWidth, bgNewHeight, zoom){
  for(fgIndex=0; fgIndex < addFg.length; fgIndex++){

    if(!addFg[fgIndex].foregroundImage){
       etLog.text +='找不到第' +(fgIndex+1) +'张需要定位的图' +'\r';
      continue;
    }else{
      var activeFg = app.activeDocument = addFg[fgIndex].foregroundImage;
      if ( activeFg.layers.length == 1 && activeFg.activeLayer.isBackgroundLayer ) {
        activeFg.activeLayer.isBackgroundLayer = false;
        activeFg.activeLayer.name = activeFg.name;
      }

      //循环到最后，简单判断为“二维碼”所在处
      if(fgIndex == addFg.length -1 && addFg[fgIndex].options.isQRcode){
        etLog.text += '\r找到二维码...' + '\r';
        if(!activeFg.layerSets.getByName('qrcode')){
          alert('err');
        }
        var fgLayerSetQrcode = activeFg.layerSets.getByName('qrcode');
        var w = fgLayerSetQrcode.bounds[2]-fgLayerSetQrcode.bounds[0];
        var h = fgLayerSetQrcode.bounds[3]-fgLayerSetQrcode.bounds[1];
        etLog.text +='二维码文件全尺寸(成個PSD檔，包埋背景、透明的、非透明的)：' +w +'×' +h +'\r';

        //duplicate
        fgLayerSetQrcode.duplicate(docs.bg);

        //move
        //app.activeDocument = docs.bg;
        //var bgLayerSetQrcode = docs.bg.layerSets.getByName('qrcode');

      }else{
        etLog.text += '开始处理' +addFg[fgIndex].foregroundImage +'...\r';

        //以宽为基准，等比例缩小
        activeFg.resizeImage(Math.round(activeFg.width * zoom), undefined);

        //duplicate
        activeFg.artLayers[0].duplicate(docs.bg);
      }

      /*
      ========================================================
      以下计算前景图座标，如果更改了前景图尺寸，
      必须要在resizeImage()之后，取得图片正确宽度，才计算座标。
                             (start)
      ========================================================
      */
      var x,y;
      var r = addFg[fgIndex].directionPosition.r;  //行
      var c = addFg[fgIndex].directionPosition.c;  //列
      /*
      $.writeln('bgNewWidth: ' +bgNewWidth +' bgNewHeight: ' +bgNewHeight +'\r');
      $.writeln('activeFg.width: ' +activeFg.width +' activeFg.height: ' +activeFg.height);
      $.writeln('=======');
      $.writeln('c: ' +c +' r: ' + r);
      */
      if(c == 0){
        x = addFg[fgIndex].directionPosition.x = 0;
      }else if(c == 1){
        x = addFg[fgIndex].directionPosition.x = bgNewWidth / 2 - Number(activeFg.width / 2);
      }else if(c == 2){
        x = addFg[fgIndex].directionPosition.x = bgNewWidth - Number(activeFg.width);
      };

      if(r == 0){
        y = addFg[fgIndex].directionPosition.y = 0;
      }else if(r == 1){
        y = addFg[fgIndex].directionPosition.y = bgNewHeight / 2 - Number(activeFg.height / 2);
      }else if(r == 2){
        y = addFg[fgIndex].directionPosition.y = bgNewHeight - Number(activeFg.height);
      };

      var etX = addFg[fgIndex].migratedPosition.x / 100;
      var etY = addFg[fgIndex].migratedPosition.y / 100;

      //x：正值右移，负值左移；
      //y：正值下移，负值上移，
      x += bgNewWidth * etX;
      y += bgNewHeight * etY;
      //$.writeln('etX: ' +x +' etY: ' + y);

      /* ==================计算前景图座标(end)==================== */

      //前景图还原到最初狀态，以便下一次操作
      activeFg.activeHistoryState = activeFg.historyStates[0];

      /*
      得到前景图座标后，切换到 背景图所在文檔，將前景图移动到计算好的位置,
      如果前景图中有二维码，必须要前景图位置固定后，才可正确取得二维码座标值
      */
      app.activeDocument = docs.bg;
      docs.inbg[fgIndex] = app.activeDocument.activeLayer;
      docs.inbg[fgIndex].translate(x, y);

      //二维码座标值
      if(fgIndex == addFg.length -1 && addFg[fgIndex].options.isQRcode){
        var qrcodeArea = docs.bg.layerSets.getByName('qrcode').artLayers.getByName('qrcodeArea');
        var qrcodeAreaWidth = qrcodeArea.bounds[2]-qrcodeArea.bounds[0];
        var qrcodeAreaHeight = qrcodeArea.bounds[3]-qrcodeArea.bounds[1];

        phoneModel[i].qrcodeArea.x = Number(qrcodeArea.bounds[0]);
        phoneModel[i].qrcodeArea.y = Number(qrcodeArea.bounds[1]);
        phoneModel[i].qrcodeArea.width = Number(qrcodeAreaWidth);
        phoneModel[i].qrcodeArea.height = Number(qrcodeAreaHeight);

        etLog.text +='二维码区域，尺寸：' + qrcodeAreaWidth +' × ' +qrcodeAreaHeight
                   +'\r二维码区域，座标 x: ' + qrcodeArea.bounds[0] +', y: ' + qrcodeArea.bounds[1]
                   +'\r';
      }
    }

  }// for(end)
}
//复制(end)

//运行(start)
dlgMain.findElement('btnRun').onClick = function(){
  etLog.text ='';

  //保存前，确保目录可用
  if(!myPath.exists){
    etOutputPath.text = myPath.fsName;
    myPath.create();
  }
  etLog.text = '目录：'+ etOutputPath.text + '\r';

  //循环处理多款型号(start)
  for(var i in phoneModel){
    if(phoneModel[i].isAuto == false){
      etLog.text += '\r' + phoneModel[i].fileName + '(不自动处理)\r';
      continue;
    }
    if(!dlgMain.findElement('title').text){
      alert("需要填主题");
      return false;
    }

    etLog.text += '\r' + phoneModel[i].fileName + ':\r';

    /* 如果选中"等比例缩放" -这个沒做 ~..~
    if(){
      var newSize = resize(phoneModel[i].width, undefined);
    }else{
      var newSize = resize(phoneModel[i].width, phoneModel[i].height);
    } */
    var newSize = resize(phoneModel[i].width, phoneModel[i].height);

    phoneModel[i].layout = dropdownLayout.selection.text;
    etLog.text += "版式：" +phoneModel[i].layout + '\r\r';

    duplicateAndMove(i, phoneModel[i].width, phoneModel[i].height, newSize.zoom);

    phoneModel[i].title = dlgMain.findElement('title').text;
    phoneModel[i].phonePackage = dlgMain.findElement('phonePackage').text;

    phoneModel[i].qrcodeArea.bgColor = dlgMain.findElement('bgColor').text;
    phoneModel[i].qrcodeArea.hotPixelColor = dlgMain.findElement('hotPixelColor').text;

    //保存
    app.activeDocument = docs.bg;
    ExportOptionsSaveForWeb.format = SaveDocumentType.PNG;
    ExportOptionsSaveForWeb.PNG8 = false;
    docs.bg.exportDocument(new File(myPath +'/' +phoneModel[i].fileName) , ExportType.SAVEFORWEB, ExportOptionsSaveForWeb);

    //保存后，还原到最初狀态，以便下一次操作
    docs.bg.activeHistoryState = docs.bg.historyStates[0];
  }
  //循环处理多款型号(end)


  //输出json数据
  if(exportFile.exists){
    exportFile.remove();
  }
  exportFile.encoding = "UTF8";
  exportFile.open("e", "TEXT");
  /*
  for(var i in phoneModel){
    exportFile.writeln(phoneModel[i])
    alert(getJsonLength(phoneModel[i]));
  }
  */

  exportFile.writeln(jsonArrayToString(phoneModel));

  exportFile.close();

  alert('OK');

}
//运行(end)


//格式化JSON(start)
function json2str(value){
  var arr = [];
  var fmt = function(s){
    if (typeof s == 'object' && s != null){
       return json2str(s);
    }
    /*
    return /^(string|number)$/.test(typeof s) ? '"' + s + '"' : s;
    */
    return /^(string)$/.test(typeof s) ? '"' + s + '"' : s;
  }
  for (var i in value){
    arr.push('  "' + i + '": ' + fmt(value[i]));
  }
  return '{\r' + arr.join(',\r') + '}';
}

function jsonArrayToString(jsonArray){
  var JsonArrayString = "[\r";
  for(var i=0; i<jsonArray.length; i++){
    JsonArrayString = JsonArrayString + json2str(jsonArray[i])+",\r";
  }
  JsonArrayString = JsonArrayString.substring(0,JsonArrayString.length-1)+"\r]";
  return JsonArrayString;
}

function strToJson(str){
  var json = eval('(' + str + ')');
  return json;
}

//格式化JSON(end)


function getJsonLength(jsonData){
  var jsonLength = 0;
  for(var item in jsonData){
    jsonLength++;
  }
  return jsonLength;
}




////////////////////////////////////////////////////////////


dlgMain.show();




