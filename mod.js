var mods = new Map();
var currMod = "0";

function loadMod(mod) {
    console.log("loading mod "+mod.name);
    if (typeof mod.zip == "undefined") {
        console.log("make zip");
        mod.zip= makeModZip(mod.json, mod.sprites!=null?_base64ToArrayBuffer(mod.sprites):base_sprites);
    }
    window.WLROOM.loadMod(mod.zip);
}

function makeModZip(basemod, sprites) {
    console.log("building zip");
    var mdzip = new JSZip();
    if (typeof basemod.soundpack != "undefined") {        
        basemod = JSON.stringify(basemod);
    }

    mdzip.file('mod.json5', basemod);

    mdzip.file('sprites.wlsprt', sprites, {binary:true});
    return mdzip.generate({type:"arraybuffer"});
}

function addMod(id, json) {
    mods.set(id, {
        id: id,
        name: json.name,
        version: json.version,
        json: json.data,
        author: json.author,
        sprites: json.sprites??null,
        pool: json.pool??defaultPool,
    } );
}

function getCurrentMod() {
    return mods.get(currMod);
}

function listMods() {
    let mn = [];
    for (let [key, value] of mods) {
        if (key=="building") continue;
        mn.push({[key]:"`"+value.name+"` v`"+value.version+"`"})
      }
    return JSON.stringify(mn)
}