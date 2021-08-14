
var openedArea = 'board';
var forGame_status = 'initGame';
var gameGrid = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
var blankGrid = 9;
var userId = 0;
var partner = 0;
var timeTaken = 0;
var timer;
var minutes = 0;
var seconds = 0;
var minSec = 0;

var gameLock = 0;
var refresh_timer;




$(document).ready( function() {
    
    refresh_timer = setInterval( function() {
		$("#refresh_btn").click();
	}, 2000 );
	
		
	$("#refresh_form").submit( function( e ) {
		
		e.preventDefault();
		
		var form = $(this);
		var url = form.attr('action');
		
		var flag = '';
		if( openedArea == 'board' )
			flag = '&openedArea=board';
		else
			flag = '&openedArea=store';
		
		$.ajax({
			type: "POST",
			url: url,
			data: form.serialize() + flag,
			success: function( result ) {
				//console.log( result );
				if( openedArea == 'board' )
					updateBoard( result );
				else
					updateStore( result );
			}
		});
		
	});
	
	
	$("#friendReq_form").submit( function( e ) {
		
		e.preventDefault();
		
		var form = $(this);
		var url = form.attr('action');
		
		if( $("#friendReq_friendId").val() != '' ) {
			$.ajax({
				type: "POST",
				url: url,
				data: form.serialize(),
				success: function( result ) {
					//console.log( "friend requested:", result );
				}
			});
		}
		
	});
	
	
	$("#forGame_btnForm").submit( function( e ) {
		
		clearInterval( timer ); //clear timer interval if game leaved
		$('#replay_btn').css( 'display', 'none' );
		
		e.preventDefault();
		
		var form = $(this);
		var url = form.attr('action');
		
		var flag = '';
		if( forGame_status == 'initGame' )
			flag = '&user=' + $("#context_user").val() + '&action=initGame';
		else {
			flag = '&user=' + $("#context_user").val() + '&action=leaveGame';
			gameLock = 0;
		}
		
		$.ajax({
			type: "POST",
			url: url,
			data: form.serialize() + flag,
			success: function( result ) {
				forGame( result );
			}
		});
		
	});
	
	
	$("#board_btn").click( function() {
		
		openedArea = 'board';
		$("#board_btn").css( 'display', 'none' );
		$('#replay_btn').css( 'display', 'none' );
		$("#store_btn").css( 'display', 'inline-block' );
		$("#boardArea").toggle();
		$("#storeArea").toggle();
		
		$("#friendReq_form").css( 'display', 'inline-block' );
		
	});
	
	
	$("#store_btn").click( function() {
		
		openedArea = 'store';
		$("#board_btn").css( 'display', 'inline-block' );
		$('#replay_btn').css( 'display', 'none' );
		$("#store_btn").css( 'display', 'none' );
		$("#boardArea").toggle();
		$("#storeArea").toggle();
		
		$("#friendReq_form").css( 'display', 'none' );
		
	});
	
	
	$("#replay_btn").click( function() {
		
		location.reload();
		
	});
	
	
	$("#signout_btnForm").submit( function( e ) {
		
		$('#replay_btn').css( 'display', 'none' );
		clearInterval( refresh_timer );
		
		e.preventDefault();
		
		var form = $(this);
		var url = form.attr('action');
		
		$.ajax({
			type: "POST",
			url: url,
			data: form.serialize() + '&user=' + $("#context_user").val(),
			success: function( result ) {
				window.document.write( result );
			}
		});
		
	});
	
	
	$("#storeArea_form").submit( function( e ) {
		
		e.preventDefault();
		
		var form = $(this);
		var url = form.attr('action');
		var data = form.serialize() + '&user=' + $("#context_user").val();
		
		var value = $("#storeArea_rupee").val();
		
		if( value > 0 ) {
			$.ajax({
				type: "POST",
				url: url,
				data: data,
				success: function( result ) {
					paymentProcessing( result );
				}
			});
		}
		else {
			$("#img_coin").animate( { width: '40px' }, 100 );
			$("#img_coin").animate( { width: '50px' }, 100 );
			$("#img_coin").animate( { width: '45px' }, 100 );
			$("#img_coin").animate( { width: '50px' }, 100 );
		}
		
	});
	
	
	$("#storeArea_rupee").on("input", function() {
		
		var rupee = $("#storeArea_rupee").val();
		rupee = Math.ceil( rupee );
		if( rupee < 0 ) rupee = Math.abs( rupee );
		$("#storeArea_rupee").val( rupee );
		
		rupee = $("#storeArea_rupee").val() * 100;
		rupee = Math.ceil( rupee );
		$("#storeArea_coinsCount").html( rupee );
    
    });
    
    
	$("#gameGrid1").click( function() { shiftGrid( 1 ); });
	$("#gameGrid2").click( function() { shiftGrid( 2 ); });
	$("#gameGrid3").click( function() { shiftGrid( 3 ); });
	$("#gameGrid4").click( function() { shiftGrid( 4 ); });
	$("#gameGrid5").click( function() { shiftGrid( 5 ); });
	$("#gameGrid6").click( function() { shiftGrid( 6 ); });
	$("#gameGrid7").click( function() { shiftGrid( 7 ); });
	$("#gameGrid8").click( function() { shiftGrid( 8 ); });
	$("#gameGrid9").click( function() { shiftGrid( 9 ); });
     
});




function updateBoard( result ) {

	jsonObj = JSON.parse( result );
	console.log( "board opened:", jsonObj );
	
	timeTaken = 0;
	
	if( gameLock == 0 ) {
	
	//CREATING USERS TABLE
	var table = '';
	table += '<table id="usersListTable">';
	
	for( var i = 0; i < jsonObj.users.length - 1; i++ ) {

    	table += '<tr>';
    	
    	table += '<td>' + jsonObj.users[i][1] + '</td>';
    	
    	table += '<td>';
    	table += '<button id="btnUser' + jsonObj.users[i][0].toString() + '" onclick="friendRequest(' + "'" + jsonObj.users[i][0].toString() + "'" + ')">send</button>';
    	table += '</td>';
    	
    	table +='</tr>';
    
    }
    
    //only for show off the scrollbar, not usefull
    table += '<tr> <td><br></td> <td></td> </tr>';
    for( var i = 0; i < 20; i++ )
    	table += '<tr> <td>bot' + i + '</td> <td><button>add</button></td> </tr>';
    
	table += '</table>';
	
	$('#usersList').html( table );

	
	//UPDATING USERS TABLE
	var partnerName = '';
	partner = jsonObj.partners.split(",");
	partner.splice( partner.indexOf(""), 1 );
	
	var reqTo = jsonObj.requestTo.split(",");
	reqTo.splice( reqTo.indexOf(""), 1 );
	//console.log( "reqTo:", reqTo );
		
	var reqFrom = jsonObj.requestFrom.split(",");
	reqFrom.splice( reqFrom.indexOf(""), 1 );
	//console.log( "reqFrom:", reqFrom );
		
	for( var i = 0; i < jsonObj.users.length - 1; i++ ) {
		// add remove accept bussy
		if( jsonObj.users[i][0] == partner[0] )
			partnerName = jsonObj.users[i][1]
		
		if( jsonObj.users[i][1] == $('#context_user').val() ) {
			userId = jsonObj.users[i][0];
			$( '#btnUser' + jsonObj.users[i][0] ).html( 'active' );
			$( '#btnUser' + jsonObj.users[i][0] ).css( 'background', 'brown' );
		}
		
		if( jsonObj.users[i][2] != "" ) {
			console.log(jsonObj.users[i]);
			$( '#btnUser' +  jsonObj.users[i][0] ).html( 'bussy' );
			$( '#btnUser' +  jsonObj.users[i][0] ).css( 'background', 'lightblue' );
		}
		
		for( var j = 0; j < reqTo.length; j++ ) {
			$( '#btnUser' + reqTo[j] ).html( 'cancle' );
			$( '#btnUser' + reqTo[j] ).css( 'background', 'orange' );
		}
		
		for( var k = 0; k < reqFrom.length; k++ ) {
			$( '#btnUser' + reqFrom[k] ).html( 'accept' );
			$( '#btnUser' + reqFrom[k] ).css( 'background', 'green' );
		}
		
	}
	
	//lock sceen for game if user is bussy / playing with others
	var flag = $( "#btnUser" + userId ).html();
	if( flag == "bussy" ) {
		gameLock = 1;
		$("#board_btn").css( 'display', 'none' );
		$("#store_btn").css( 'display', 'none' );
		$("#signout_btnForm").css( 'display', 'none' );
		$("#usersListContainer").css( 'display', 'none' );
		
		$("#forGame_btnForm").css( 'display', 'inline-block' );
		$("#playerBoard").css( 'display', 'inline-block' );
		$("#board_player1").html( $("#context_user").val() );
		$("#board_player2").html( partnerName );
		$("#player_vs").html( "VS" );
		$("#board_player_time").html( "0:00.0" );
		
	}
	
	}
	
	//gameplay message
	if( jsonObj.notification != "" ) {
		
		if( jsonObj.notification == "Won" ) {
			
			$("#gamePlay_msg").html( "Won 1000 Coins" );
			$("#gamePlay_msg").css( "background", "green" );
			
		}
		else if( jsonObj.notification == "Lost" ) {
			
			$("#gamePlay_msg").html( "Lost 1000 Coins" );
			$("#gamePlay_msg").css( "background", "red" );
			
		}
		
		$("#batFor").hide("fast").delay(2000).show("slow");
		$("#gamePlay_msg").show("fast").delay(2000).hide("slow");
		
		$('#replay_btn').css( 'display', 'inline-block' );
		
	}
	
}


function forGame ( result ) {
	
	if( forGame_status == 'initGame' ) {
		forGame_status = 'leaveGame'
		$("#forGame_btn").html( "Leave Game" );
		$("#forGame_btn").css( 'background', 'red' );
		
		var gridList = result.split(",");
		gameGrid = gridList;
		updateGameGrid( gridList );
		
		
		var startTime = new Date().getTime();
		
		timer = setInterval( function() {

			var currentTime = new Date().getTime();
			var distance = currentTime - startTime;
			minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
			seconds = Math.floor((distance % (1000 * 60)) / 1000);
			minSec = Math.floor((distance % 1000)/100);
			
			if( seconds < 10 )
				seconds = "0" + seconds.toString();
			
			$("#board_player_time").html( minutes + ":" + seconds + "." + minSec );
			
			if ( minutes == 10 )
				clearInterval( timer );
			
		}, 100 );
			
	}
	
	else {
		forGame_status = 'initGame'
		$("#forGame_btn").html( "Init Game" );
		$("#forGame_btn").css( 'background', 'green' );
		
		
		$("#board_btn").css( 'display', 'inline-block' );
		$("#store_btn").css( 'display', 'none' );
		$("#signout_btnForm").css( 'display', 'inline-block' );
		$("#usersListContainer").css( 'display', 'inline-block' );
		
		$("#forGame_btnForm").css( 'display', 'none' );
		$("#playerBoard").css( 'display', 'none' );
		
		updateGameGrid( [1,2,3,4,5,6,7,8,9] );
		
		//$("#board_player1").html( $("#context_user").val() );
		//$("#board_player2").html( jsonObj.users[partnerIndex][1] );
		//$("#board_player1_time").html( "0.00 Sec" );
		//$("#board_player2_time").html( "0.00 Sec" );
		
	}
	
}


function shiftGrid( grid ) {
	
	var left1 = $( "#gameGrid9" ).css( 'left' );
	var top1 = $( "#gameGrid9" ).css( 'top' );
	var left2 = $( "#gameGrid" + grid ).css( 'left' );
	var top2 = $( "#gameGrid" + grid ).css( 'top' );
	
	$( "#gameGrid" + grid ).css( 'left', left1 );
	$( "#gameGrid" + grid ).css( 'top', top1 );
	$( "#gameGrid9" ).css( 'left', left2 );
	$( "#gameGrid9" ).css( 'top', top2 );
	
	//checking grid set or not
	if( $("#gameGrid1").css('top') + $("#gameGrid1").css('left') == "0px0px" )
	if( $("#gameGrid2").css('top') + $("#gameGrid2").css('left') == "0px150px" )
	if( $("#gameGrid3").css('top') + $("#gameGrid3").css('left') == "0px300px" )
	if( $("#gameGrid4").css('top') + $("#gameGrid4").css('left') == "150px0px" )
	if( $("#gameGrid5").css('top') + $("#gameGrid5").css('left') == "150px150px" )
	if( $("#gameGrid6").css('top') + $("#gameGrid6").css('left') == "150px300px" )
	if( $("#gameGrid7").css('top') + $("#gameGrid7").css('left') == "300px0px" )
	if( $("#gameGrid8").css('top') + $("#gameGrid8").css('left') == "300px150px" )
	if( $("#gameGrid9").css('top') + $("#gameGrid9").css('left') == "300px300px" )
	{
		timeTaken = ( minutes * 60 + seconds ) * 10 + minSec;
		//console.log( "time taken ", timeTaken );
		clearInterval( timer );
		
		$("#friendReq_friendId").val( partner[0] );
		$("#friendReq_action").val( "timeTaken" );
		$("#gamePlay_time").val( timeTaken );
		
		$("#friendReq_btn").click();
		
	}
	
}


function updateGameGrid( gridList ) {
	
	for( var i = 0; i < 9; i++ ) {
		if( gridList[i] == "9" )
			blankGrid = i;
			
		var top = Math.floor( i / 3 );
		var left = i % 3;
		
		$( "#gameGrid" + gridList[i] ).css( 'left', left * 150 );
		$( "#gameGrid" + gridList[i] ).css( 'top', top * 150 );
	}
	
}


function friendRequest( user_id ) {
	
	if( userId == user_id || $( '#btnUser' + user_id ).html() == 'bussy' ) {
		$("#friendReq_friendId").val( '' );
		$("#friendReq_action").val( '' );
	}
	else {
		$("#friendReq_friendId").val( user_id );
		var flag = $( "#btnUser" + user_id ).html();
		$("#friendReq_action").val( flag );
	}
    
    $("#friendReq_btn").click();
    
}


function paymentProcessing( result ) {
	
	$("#paymentProcess").css( 'display', 'inline-block' );
	$("#paymentStatus").css( 'display', 'none' );

}


function updateStore( result ) {
	
	jsonObj = JSON.parse( result );
	//console.log( "store opened:", jsonObj );
	
	$('#storeArea_vaultRemain').html( jsonObj.coins );
	
	if( jsonObj.notification != "" ) {
		$("#paymentProcess").css( 'display', 'none' );
		
		if( jsonObj.notification == "Payment_success" ) {
		
			$("#paymentStatus_success").show("fast").delay(2000).hide("slow");
			$("#paymentStatus_success").html( 'Payment Successfull' );
		
		} else if( jsonObj.notification == "Payment_failed" ) {
		
			$("#paymentStatus_failed").show("fast").delay(2000).hide("slow");
			$("#paymentStatus_failed").html( 'Payment Failed' );
		
		}
		
	}
	
}





