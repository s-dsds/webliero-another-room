var mapCache = new Map();
var defaultBaseUrl = "https://webliero.gitlab.io/webliero-maps";
var baseURL = defaultBaseUrl;
var mypool = [];
var defaultPool = "pools/default/arenasBest.json";
loadPool(defaultPool);
var currentPool = defaultPool;
var currentMap = 0;
var currentMapName = "";
var currentEffect = 0;
var effectList=Object.keys(effects);
var autoExpand = -1;
var autoFx = -1;
var maxEffects = 5;

function loadPool(name) {
    if (name==currentPool) {
        return;
    }
	(async () => {
    mypool = await (await fetch(baseURL + '/' +  name)).json();
    currentPool = name;
	})();
}

async function getMapData(name) {
    let x = 504;
    let y = 350;

    let obj = mapCache.get(name)
    if (obj) {
      return obj;
    }
    if (name.split('.').pop()=="png") {    
       obj = await getPngMapData(name);
    } else {
        let buff = await (await fetch(baseURL + '/' +  name)).arrayBuffer();
        let arr = Array.from(new Uint8Array(buff));
        obj = {x:x,y:y,data:arr};
    }
    
    mapCache.set(name, obj)
    return obj;
}

var pixConvFailures = 0;
	
function getbestpixelValue(red,green,blue) {
    let colorVal = Array.prototype.slice.call(arguments).join("_");;
    if (invPal.get(colorVal)==undefined) {
            pixConvFailures++;		
            return 1;
            
        } 
        return invPal.get(colorVal);		
}

async function getPngMapData(name) {
    pixConvFailures = 0;
    let blob = await (await fetch(baseURL + '/' +  name)).blob();
    let img = new Image();
    const imageLoadPromise = new Promise(resolve => {        
      img.onload = resolve;
      img.src = URL.createObjectURL(blob);
    });
    await imageLoadPromise;

    let ret = {x:img.width, y: img.height, data:[]};
    let canvas = document.createElement("canvas");
    canvas.width  = ret.x;
    canvas.height = ret.y;
    let ctx = canvas.getContext("2d", {alpha: false});
    ctx.drawImage(img, 0, 0, ret.x, ret.y);
    
    let imgData = ctx.getImageData(0, 0, ret.x, ret.y);
    console.log("data len x y", imgData.data.length, ret.x, ret.y , ret.x * ret.y, imgData.data.length/4);
    for (let i = 0; i < imgData.data.length; i += 4) {
      ret.data.push(getbestpixelValue(imgData.data[i],imgData.data[i + 1],imgData.data[i + 2]));
    }
    console.log("pix failures", pixConvFailures);
    return ret;
}

COMMAND_REGISTRY.add("fx", [()=>"!fx "+JSON.stringify(effectList)+": adds fx to the current map, applying a random effect or the effect provided"], (player, ...fx) => {
    let fxs = [];
    if (typeof fx=='object') {
        let big=false;
        fxs = fx.map(
            function(e) {	
                let trimmed=e.trim();
                if (effectList.indexOf(trimmed) >= 0 && (trimmed!="bigger" || big==false)) { // filtering bigger since it actually breaks when chained
                    if (trimmed == "bigger") {
                        big=true;
                    }
                    return trimmed;
              }
            }
        ).filter(x => x).slice(0, maxEffects);
    }
    if (fxs.length==0) {
        fxs.push(Math.floor(Math.random() * effectList.length));
    }
    if (currentMapName=="") {
        resolveNextMap();
    }
    loadEffects(fxs, currentMapName);
    return false;
}, true);

function loadMap(name, data, expand=false) {
    console.log(data.data.length);
    console.log(data.data[2]);
    setExpand(expand);
    let buff=new Uint8Array(data.data).buffer;
    window.WLROOM.loadRawLevel(name,buff, data.x, data.y);
}

function resolveNextMap() {
    currentMap=currentMap+1<mypool.length?currentMap+1:0;
    currentMapName = mypool[currentMap];
}

function next() {
    resolveNextMap();
    if (autoFx>0) {
        loadEffects(randomFxList(), currentMapName);
        return;
    }
    loadCurrentMap();
}

function loadCurrentMap() {
    (async () => {
        let data = await getMapData(currentMapName);        
	    loadMap(currentMapName, data, shouldExpand());
    })();
}

function setExpand(expand) {
    let sets = window.WLROOM.getSettings();
    if (sets.expandLevel!=expand) {
        sets.expandLevel=expand;
        window.WLROOM.setSettings(sets);
    }
}

function shouldExpand() {
    if (autoExpand==-1) {
        return false;
    }
    return (getActivePlayers().length>=autoExpand);
}

function randomFxList() {
    const rfx = []
    for (let i = 0; i <= maxEffects; i++) {
        rfx.push(effectList[Math.floor(Math.random() * effectList.length)])
    }
    return rfx;
}

function loadEffects(fxs, name) {
    console.log(name, JSON.stringify(fxs));
    (async () => {
        let data = await getMapData(name);
        console.log(typeof data);
        for (var idx in fxs) {
            console.log(fxs[idx]);
            data = effects[fxs[idx]](data);
        }
	    loadMap(name, data);
    })();
}

function loadEffect(effectidx, name) {
    console.log(name, effectList[effectidx]);
    (async () => {
        let data = await getMapData(name);
        console.log(typeof data);
	    loadMap(name, effects[effectList[effectidx]](data));
    })();
}

function _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}


COMMAND_REGISTRY.add("map", ["!map #mapname#: load map from gitlab webliero.gitlab.io, without any effect"], (player, ...name) => {
    currentMapName = name.join(" ");
    loadCurrentMap();
    return false;
}, true);

COMMAND_REGISTRY.add("mapi", ["!mapi #index#: load map by pool index, without any effect"], (player, idx) => {
    if (typeof idx=="undefined" || idx=="" || isNaN(idx) || idx>=mypool.length) {
        announce("wrong index, choose any index from 0 to "+(mypool.length-1),player, colorError);
        return false;
    }
    currentMapName = mypool[idx];
    loadCurrentMap();
    return false;
}, true);

COMMAND_REGISTRY.add("clearcache", ["!clearcache: clears local map cache"], (player) => {
    mapCache = new Map();
    return false;
}, true);

COMMAND_REGISTRY.add("autoexp", ["!autoexp #number#: set auto expand with #number# as threshold"], (player, threshold) => {
    if (typeof threshold=="undefined" || threshold=="" || isNaN(threshold)) {
        autoExpand = -1;
        notifyAdmins("cleared autoexpand threshold");
        return false;
    }
    autoExpand = parseInt(threshold);
    notifyAdmins("autoexpand threshold set to `"+threshold+"`");
    return false;
}, true);


COMMAND_REGISTRY.add("autofx", ["!autofx #number#: sets auto fx with #number# being the number of applied fx"], (player, num) => {
    if (""==num || isNaN(num) || num>=maxEffects) {
        announce("invalid number, set to 0", player, colorError);
        autoFx = 0;
        return false;
    }
    
    autoFx = parseInt(num);
    announce("current fx to apply set to `"+num+"`", null, colorInfo);
    return false;
}, true);