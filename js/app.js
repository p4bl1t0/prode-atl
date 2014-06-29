var current = [];
var nua = navigator.userAgent;
var is_android = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1));
if (window.Notification !== null && window.Notification !== undefined && !is_android) {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}

function pushNotification(message) {
    if (window.Notification !== null && window.Notification !== undefined && !is_android) {
        n = new Notification("Goooooool", {
            body: message,
            icon: "/images/ball.ico"
        });
    }
}

function refreshRanking() {
    var baseURL = "http://prode.162.243.6.106.xip.io";
    if (window.location.host.indexOf("127.0.0.1") >= 0) {
        var baseURL = "http://prode.127.0.0.1.xip.io";
    }
    console.log(baseURL);
    //
    var _table = null;
    $.ajax({
        url: baseURL + "/getter.php?grupo=Grupo ATL ROJO"
    }).done(function (result) {
        //console.log("llego info de MundialconAmigos");
        var _html = $(result);
        _table = _html.find("table");
        $.ajax({
            url: baseURL + "/getter.php?grupo=Grupo ATL Verde"
        }).done(function (result) {
            //console.log("llego info de MundialconAmigos");
            var _html = $(result);
            _table.find("tbody").append(_html.find("table").find("tr:not(:first)"));
            $.ajax({
                url: baseURL + "/getter.php?grupo=Grupo ATL Negro"
            }).done(function (result) {
                //console.log("llego info de MundialconAmigos");
                var _html = $(result);
                _table.addClass("pure-table pure-table-bordered table-ranking").removeAttr("align").removeAttr("width");
                _table.find("td b").each(function () {
                    if (String.trim) {
                        $(this).text($(this).text().trim());
                    }
                });
                _table.find("tbody").append(_html.find("table").find("tr:not(:first)"));
                _table.prepend($("<thead>").append(_table.find("tr:first")));
                //_table.find("tbody tr:first").remove();
                _table.find("tr").each(function () {
                    $(this).find("td:first").remove();
                });
                _table.find("tr").removeAttr("bgColor");
                $("#img-cargando").remove();
                $("#placeholder-ranking").empty().append(_table).find("table").tablesorter({
                    sortList: [[1, 1], [0, 0]]
                })

            });
        });
    });
}

function renderResult(match, showDate) {
    var html = "";
    var date = new Date(match.datetime);
    var status = "";
    var showResult = true;
    if (match.status === "in progress") {
        status = "<strong>En juego</strong>";
    } else {
        if (match.status === "completed") {
            status = "<strong>Finalizado</strong>";
			
			if(match.winner === match.home_team.country ){
				match.home_team.country = "<strong class='winner' title='Ganador'>" + match.home_team.country + "</strong>";
			}else{
				match.away_team.country  = "<strong class='winner' title='Ganador'>" + match.away_team.country + "</strong>";
			}
			
        } else {
            showResult = false;
        }
    }
    html = match.home_team.country + (showResult ? " " + match.home_team.goals + ( match.home_team.penalties != undefined ?  " ( " + match.home_team.penalties + " ) " : "") : "");
    html += " - ";
    html += match.away_team.country + (showResult ? " " + match.away_team.goals + ( match.away_team.penalties != undefined ?  " ( " + match.away_team.penalties + " ) " : "") : "");
    if (showDate & !isNaN(date.getDate())) {
        html += " " + date.getDate() + "/" + date.getMonth() + " ";
    }
    html += isNaN(date.getHours()) ? " " : " (" + date.getHours() + " hs" + ") ";
    html += status;
	
	
	
    return html;
}
$(document).ready(function () { //
    $(".button-refresh").click(function (event) {
        event.preventDefault();
        refreshRanking();
    });
    refreshRanking();

    getDataMatches();
    //currentMatch();


    var timeRefreshResults = 30000;
    var $placeholder = $("#placeholder-partidos");
    var $placeholder_current = $("#placeholder-current");
    var $tpl_today_matches = $("#tpl_todays_matches");


    var $clone;

    function getDataMatches() {
        if ($clone != undefined) {
            $clone.addClass("load");
        }
        $.ajax({
            url: "http://worldcup.sfg.io/matches/today",
            dataType: "json"
        }).done(function (result) {
            if (result.length > 0) {
                $placeholder.find("#todays").remove();
                $clone = $tpl_today_matches.clone().attr("id", "todays");
                for (var par in result) {
                    var $p = $("<p>");
                    $p.addClass("match-results").html(renderResult(result[par]));
                    $clone.append($p);
                    //console.log($clone);
                }
                $placeholder.prepend($clone);
                $clone.removeClass("load");
                currentMatch();
            }
        });


    }

    //tomorrow's matches
    $.ajax({
        url: "http://worldcup.sfg.io/matches/tomorrow",
        dataType: "json"
    }).done(function (result) {
        if (result.length > 0) {
            $placeholder.find("#tomorrow").remove();
            $clone = $tpl_today_matches.clone().attr("id", "tomorrow");
            $clone.find("h2").html("Partidos de mañana");
            for (var par in result) {
                var $p = $("<p>");
                $p.addClass("match-results").html(renderResult(result[par]));
                $clone.append($p);
                argMatches();
            }
            $placeholder.append($clone);
        }

    });

    //partidos de argentina
    function argMatches() {
        $.ajax({
            url: "http://worldcup.sfg.io/matches/country?fifa_code=ARG",
            dataType: "json"
        }).done(function (result) {
            if (result.length > 0) {
                $placeholder.find("#arg-matches").remove();
                $clone = $tpl_today_matches.clone().attr("id", "arg-matches");
                $clone.find("h2").html("Partidos de Argentina");
                for (var par in result) {
                    var $p = $("<p>");
                    $p.addClass("match-results").html(renderResult(result[par], true));

                    $clone.append($p);
                }
                $placeholder.append($clone);
            }
        });
    }

    function currentMatch() {
        $.ajax({
            url: "http://worldcup.sfg.io/matches/current",
            dataType: "json"
        }).done(function (result) {
            if (result.length > 0) {
                if (current.length > 0) {
                    for (var i = 0; i < current.length; i++) {
                        if (result[i] !== undefined && !(result[i].away_team.goals === current[i].away_team.goals && result[i].home_team.goals === current[i].home_team.goals)) {
                            pushNotification(result[i].home_team.country + " " + result[i].home_team.goals + " - " + result[i].away_team.country + " " + result[i].away_team.goals);
                        }
                        console.log(current[i]);
                        console.log(result[i]);
                    }
                }
                $clone = $tpl_today_matches.clone().attr("id", "current");
                $clone.find("h2").html("En juego");
                for (var par in result) {
                    var $p = $("<p>");
                    var d = new Date(result[par].datetime);
                    $p.addClass("match-results").html(result[par].home_team.country + " " + result[par].home_team.goals + "  -  " + result[par].away_team.country + " " + result[par].away_team.goals);
                    $clone.append($p);
                }
                $placeholder_current.find("#current").remove();
                $placeholder_current.prepend($clone);

                current = result;
            } else {
                $clone = $tpl_today_matches.clone().attr("id", "current");
                $clone.append("<p>Nada en juego</p>");
                $placeholder_current.find("#current").remove();
                $placeholder_current.prepend($clone);
            }
        });
    }


    var interval = setInterval(function () {
        getDataMatches();
    }, timeRefreshResults);
});