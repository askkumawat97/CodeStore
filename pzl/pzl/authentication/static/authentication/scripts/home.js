	function init() {

		$("#home_btn").click( function() {

			$("#home_nav").show();
			$("#about_nav").hide();
			$("#help_nav").hide();

			$("#home_btn").css( "text-decoration", "underline" );
			$("#about_btn").css( "text-decoration", "none" );
			$("#help_btn").css( "text-decoration", "none" );

		});

		$("#about_btn").click( function() {

			$("#home_nav").hide();
			$("#about_nav").show();
			$("#help_nav").hide();

			$("#home_btn").css( "text-decoration", "none" );
			$("#about_btn").css( "text-decoration", "underline" );
			$("#help_btn").css( "text-decoration", "none" );

		});

		$("#help_btn").click( function() {

			$("#home_nav").hide();
			$("#about_nav").hide();
			$("#help_nav").show();

			$("#home_btn").css( "text-decoration", "none" );
			$("#about_btn").css( "text-decoration", "none" );
			$("#help_btn").css( "text-decoration", "underline" );

		});

		$("#home_btn").hover( function() {
				$("#home_btn").css( "color", "red" );
			}, function() {
				$("#home_btn").css( "color", "white" );
		});

		$("#about_btn").hover( function() {
				$("#about_btn").css( "color", "red" );
			}, function() {
				$("#about_btn").css( "color", "white" );
		});

		$("#help_btn").hover( function() {
				$("#help_btn").css( "color", "red" );
			}, function() {
				$("#help_btn").css( "color", "white" );
		});

		$("#signin_btn").click( function() {

			$("#signin_form").show();
			$("#signup_form").hide();

			$("#signin_error").html('');
			$("#signup_error").html('');

			$("#signin_btn").css( "color", "red" );
			$("#signup_btn").css( "color", "white" );

		});

		$("#signup_btn").click( function() {

			$("#signin_form").hide();
			$("#signup_form").show();

			$("#signin_error").html('');
			$("#signup_error").html('');

			$("#signin_btn").css( "color", "white" );
			$("#signup_btn").css( "color", "red" );
		});
		
		$("#signin_form").submit(function(e) {

			e.preventDefault();

			var form = $(this);
			var url = form.attr('action');

			$.ajax({
				type: "POST",
				url: url,
				data: form.serialize(), // serializes the form's elements.
				success: function( result ) {
					if( result == 'invalid_credentials' || result == 'loggin_error' )
						$("#signin_error").html( result );
					else
						window.document.write( result );
				}
			});

			/*
			$.post( "{% url 'signin' %}", function(data, status){
				alert("Data: " + data + "\nStatus: " + status);
			});
			*/
			/*
			$.ajax({
				url: 'signin',
				type: 'post',
				data: { csrfmiddlewaretoken: window.CSRF_TOKEN },
				success: function(data) {
					alert(data);
				},
				failure: function(data) {
					alert( 'ejax error' );
				}
			});
			*/
		});

		$("#signup_form").submit(function(e) {

			e.preventDefault();

			var form = $(this);
			var url = form.attr('action');

			$.ajax({
				type: "POST",
				url: url,
				data: form.serialize(), // serializes the form's elements.
				success: function( result ) {
					if( result == 'invalid_email' || result == 'username_exist' || result == 'user_email_exist' || result == 'password_must_match' || result == 'invalid_credentials' )
						$("#signup_error").html( result );
					else
						window.document.write( result );
				}
			});

		});

	}
