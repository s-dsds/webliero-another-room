function hasActivePlayers() {
    console.log('act',getActivePlayers().length != 0);
	return getActivePlayers().length != 0;
}

function getActivePlayers() {
	return window.WLROOM.getPlayerList().filter(p => p.team !=0);
}
