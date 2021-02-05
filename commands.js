COMMAND_REGISTRY.init(window.WLROOM, {});
var colorError = 0xF02020;
var colorInfo = 0x787EBE;

var votes = (() => {
    this.clear = [];
    this.fight = [];
    this.build = [];
    return {
        add: (name, player) => { 
            let a = auth.get(player.id);
            if (-1 != this[name].indexOf(a)) { return; }
            this[name].push(a);
        },
        reset: (name) => { this[name] = []; },
        count: (name) => this[name].length,
        accepted: (name) => getActivePlayers().length==1 || this[name].length>=requiredVoteCount(),
    }
})();
/*
var valueVotes = (() => {
    this.mod = [];
    this.modValues = [];
    this.currentVoteMsg = () => {};
    return {
        
        add: (name, player, value) => { 
            let a = auth.get(player.id);
            if (-1 != this[name].indexOf(a)) { return; }
            this[name].push(a);
            this[name+"Values"].push(value);
        },
        reset: (name) => { 
            this[name]= [];
            this[name+"Values"] = [];
            this.currentVoteMsg = () => {};
        },
        count: (name, value) => this[name].length,
        accepted: (name) => getActivePlayers().length==1 || this[name].length>=requiredVoteCount(),
        printCurrVoteMsg: this.currentVoteMsg,
        setCurrVoteMsg: (funk) =>  { this.currentVoteMsg = funk; },
    }
})();
*/
function requiredVoteCount() { return Math.floor(getActivePlayers().length/2)+1; }

COMMAND_REGISTRY.add("mod", ["!mod xxx: sets current mod, lists mods if invalid or empty"], (player, modidx) => {
    if (""==modidx || "building"==modidx || typeof mods.get(modidx) == "undefined") {
        if (modix!="") {
            announce("invalid mod", player, colorError);
        }
        announce("avail mods:"+listMods(), player, colorInfo);
        return false;
    }
    currMod = modidx;
    let mod = mods.get(modidx);
    loadPool(mod.pool);
    announce("current mod set to `"+mod.name+"` `"+mod.version+"` by `"+mod.author+"`", null, colorInfo);
    return false;
}, true);

COMMAND_REGISTRY.add("pool", ["!pool xxx: sets current pool"], (player, name) => {
    if (""==name) {
        announce("invalid pool", player, colorError);
        return false;
    }
    
    loadPool(name);
    announce("current name set to `"+name+"`", null, colorInfo);
    return false;
}, true);


/*
COMMAND_REGISTRY.add("mod", ["!mod xxx: sets current fighting mod, lists mods if invalid or empty"], (player, modidx) => {
    if (""==modidx || "building"==modidx || typeof mods.get(modidx) == "undefined") {
        announce("avail mods:"+listMods(), player.id, 0x0010D0);
        return false;
    }

    if (player.team==0) {
        announce("you need to join the game to be allowed to vote", player, 0xFF2020, "bold")
        return false;
    }

    if (votes.count("mod")>0) {
        announce("vote already started for mod change !yes to agree or !no to reject the proposal", player, 0xFF2020);    
        votes.printCurrVoteMsg(player);
    }

    if (getActivePlayers().length>1) {
        votes.add("mod", player, true);
    }

    if (!votes.accepted("mod")) {
        votes.setCurrVoteMsg((voter) => {        
            announce("player `"+player.name+"`requested mod "+mod.name+"` version `"+mod.version+"` by `"+mod.author+"`", voter, 0x0010D0);     
            announce("current required vote count is: `"+requiredVoteCount() +"` votes [!yes: "+votes.count("mod", true)+" / !no: "+votes.count("mod", false)+"]", voter, 0x0010D0);
        });
        votes.printCurrVoteMsg(null);
        announce("please type !yes to agree or !no to reject the proposal", null, 0x0010D0);        
        return false;
    }
    changeFightingMod(modidx);
    return false;
}, false);

function changeFightingMod(modidx) {
    currMod = modidx;
    let mod = mods.get(modidx);
    announce("current fight mod set to "+mod.name+"` version `"+mod.version+"` by `"+mod.author+"`", null, 0x0010D0);
    votes.reset("mod");
}
*/