initFirebase();

window.WLROOM.onPlayerLeave = function(player) { 
	writeLogins(player, "logout"); 
	auth.delete(player.id);
}
window.WLROOM.onGameEnd2 = function(player) {  
	next();
}


function announce(msg, player, color, style) {
	window.WLROOM.sendAnnouncement(msg, player!=null?player.id:null, color!=null?color:0xb2f1d3, style !=null?style:"", 1);
}
function notifyAdmins(msg, logNotif = false) {
	getAdmins().forEach((a) => { window.WLROOM.sendAnnouncement(">>"+msg+"<<", a.id, 0xFE33FE, "bold"); });
	if (logNotif) {
		notifsRef.push({msg:msg, time:Date.now(), formatted:(new Date(Date.now()).toLocaleString())});
	}
}

function getAdmins() {
	return window.WLROOM.getPlayerList().filter((p) => p.admin);
}

function moveAllPlayersToSpectator() {
    for (let p of window.WLROOM.getPlayerList()) {
        window.WLROOM.setPlayerTeam(p.id, 0);
    }
}
