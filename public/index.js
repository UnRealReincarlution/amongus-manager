const urlParams = new URLSearchParams(window.location.search);
const syncId = urlParams.get('game');

let socket = io();

socket.on('connect', function() {
    socket.emit('getGameInfo', syncId);

    socket.on('returnGameInfo', function(data) {
        updateRender(data);
    });
    
    socket.on('updateGame', function(data) {
        updateRender(data);
    })
});

function updateRender(data) {
    if(data !== null) {
        while(document.getElementById("players").firstChild) {
            document.getElementById("players").removeChild(document.getElementById("players").firstChild);
        }

        $(".active").removeClass("active");

        $(`#${data.gameStage}`).parent().addClass('active');

        $("#connection_text").html(`Connected to <strong>${data.name}</strong>`)

        console.log(`Connected to game ${syncId}. Players: ${data.players.length} - Current Game State: ${data.gameStage}`);

        data.players.forEach(element => {
            let new_div = document.createElement("div");
                new_div.classList.add("player");
                new_div.id = "player";
                new_div.setAttribute("player", element.colour);
                new_div.setAttribute("status", element.alive);
                //new_div.setAttribute("onclick", killRevive(element.colour, element.alive));

            let player_icon = document.createElement("img");
                player_icon.src = (element.alive) ? `./crewmates/${element.colour}.png` : `./crewmates/${element.colour}_dead.png`;
                new_div.appendChild(player_icon);

            let player_name = document.createElement("div");
                player_name.innerHTML = element.name;
                new_div.appendChild(player_name);

            let player_more = document.createElement("img");
                player_more.src = './icons/maximize.svg';
                player_more.classList.add("viewmode_toggle")
                new_div.appendChild(player_more);


            new_div.style.backgroundColor = backgroundColors[element.colour];
            document.getElementById("players").appendChild(new_div);
        });

        if(data.players.length < 1) {
            let new_div = document.createElement("div");
                new_div.innerHTML = "There are no players in this game. <br> Try using am.join <colour> in discord."
            document.getElementById("players").appendChild(new_div);
        }
    }else {
        $("#connection_text").html(`No game <strong>exists</strong> with this code.`);
        $("#connection_icon").css("background-color", "rgb(241 34 45)");
    }
}

socket.on('disconnect', function(){
    $("#connection_icon").css("background-color", "rgb(241 34 45)");
    $("#connection_text").html("Connection Lost")
});

$(document).on('click','#end_game',function(e) {
    socket.emit('endGame');
});

$(document).on('click','#player',function(e) {
    let colour = $(this).attr("player");
    let status = $(this).attr("status");

    if(status === 'true') {
        console.log("Player Killed");
        $(this).attr("status", false);

        socket.emit("killPlayer", {
            colour: colour, 
            syncId: syncId
        });

        $(this).find("img")[0].src = `./crewmates/${colour}_dead.png`;
    }else {
        console.log("Player Revived");
        $(this).attr("status", true);

        socket.emit("revivePlayer", {
            colour: colour, 
            syncId: syncId
        });

        $(this).find("img")[0].src = `./crewmates/${colour}.png`;
    }
});

$(document).on('click','.stage', function(e) {
    let new_stage = $(this).find("h2").html().toString().toLowerCase();

    if(!$(this).hasClass("active")) {
        $(".active").removeClass("active");
        $(this).addClass("active");
        
        socket.emit('setStage', {
            syncId: syncId, 
            stage: new_stage
        });

        console.log(new_stage);
    }
});

$(document).on('click', '.viewmode_toggle', function(e) {
    console.log(` VIEWING ${$(this).parent().attr("player")} `);
})