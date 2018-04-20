(function($){
	jQuery.fn.reverse = [].reverse;
	$.et_pb_simple_slider = function(el, options) {
		var settings = $.extend( {
			slide         			: '.et-slide',				 	// slide class
			arrows					: '.et-pb-slider-arrows',		// arrows container class
			prev_arrow				: '.et-pb-arrow-prev',			// left arrow class
			next_arrow				: '.et-pb-arrow-next',			// right arrow class
			controls 				: '.et-pb-controllers a',		// control selector
			control_active_class	: 'et-pb-active-control',		// active control class name
			previous_text			: 'Previous',					// previous arrow text
			next_text				: 'Next',						// next arrow text
			fade_speed				: 500,							// fade effect speed
			use_arrows				: true,							// use arrows?
			use_controls			: true,							// use controls?
			manual_arrows			: '',							// html code for custom arrows
			append_controls_to		: '',							// controls are appended to the slider element by default, here you can specify the element it should append to
			controls_class			: 'et-pb-controllers',				// controls container class name
			slideshow				: false,						// automattic animation?
			slideshow_speed			: 7000,							// automattic animation speed
			show_progress_bar		: false,							// show progress bar if automattic animation is active
		}, options );

		var $et_slider 			= $(el),
			$et_slide			= $et_slider.find( settings.slide ),
			et_slides_number	= $et_slide.length,
			et_fade_speed		= settings.fade_speed,
			et_active_slide		= 0,
			$et_slider_arrows,
			$et_slider_prev,
			$et_slider_next,
			$et_slider_controls,
			et_slider_timer,
			controls_html = '',
			$progress_bar = null,
			progress_timer_count = 0,
			$et_pb_container = $et_slider.find( '.et_pb_container' ),
			et_pb_container_width = $et_pb_container.width();

			$et_slider.et_animation_running = false;

			$.data(el, "et_pb_simple_slider", $et_slider);

			$et_slide.eq(0).addClass( 'et-pb-active-slide' );

			if ( !$et_slider.hasClass('et_pb_bg_layout_dark') && !$et_slider.hasClass('et_pb_bg_layout_light') ){
				$et_slider.addClass( et_get_bg_layout_color( $et_slide.eq(0) ) );
			}

			if ( settings.use_arrows && et_slides_number > 1 ) {
				if ( settings.manual_arrows == '' )
					$et_slider.append( '<div class="et-pb-slider-arrows"><a class="et-pb-arrow-prev" href="#">' + '<span>' +settings.previous_text + '</span>' + '</a><a class="et-pb-arrow-next" href="#">' + '<span>' + settings.next_text + '</span>' + '</a></div>' );
				else
					$et_slider.append( settings.manual_arrows );

				$et_slider_arrows 	= $( settings.arrows );
				$et_slider_prev 	= $et_slider.find( settings.prev_arrow );
				$et_slider_next 	= $et_slider.find( settings.next_arrow );

				$et_slider_next.click( function(){
					if ( $et_slider.et_animation_running )	return false;

					$et_slider.et_slider_move_to( 'next' );

					return false;
				} );

				$et_slider_prev.click( function(){
					if ( $et_slider.et_animation_running )	return false;

					$et_slider.et_slider_move_to( 'previous' );

					return false;
				} );
			}

			if ( settings.use_controls && et_slides_number > 1 ) {
				for ( var i = 1; i <= et_slides_number; i++ ) {
					controls_html += '<a href="#"' + ( i == 1 ? ' class="' + settings.control_active_class + '"' : '' ) + '>' + i + '</a>';
				}

				controls_html =
					'<div class="' + settings.controls_class + '">' +
						controls_html +
					'</div>';

				if ( settings.append_controls_to == '' )
					$et_slider.append( controls_html );
				else
					$( settings.append_controls_to ).append( controls_html );

				$et_slider_controls	= $et_slider.find( settings.controls ),

				$et_slider_controls.click( function(){
					if ( $et_slider.et_animation_running )	return false;

					$et_slider.et_slider_move_to( $(this).index() );

					return false;
				} );
			}

			if ( settings.slideshow && et_slides_number > 1 ) {
				$et_slider.hover( function() {
					$et_slider.addClass( 'et_slider_hovered' );

					if ( typeof et_slider_timer != 'undefined' ) {
						clearInterval( et_slider_timer );
					}
				}, function() {
					$et_slider.removeClass( 'et_slider_hovered' );

					et_slider_auto_rotate();
				} );
			}

			et_slider_auto_rotate();

			function et_slider_auto_rotate(){
				if ( settings.slideshow && et_slides_number > 1 && ! $et_slider.hasClass( 'et_slider_hovered' ) ) {
					et_slider_timer = setTimeout( function() {
						$et_slider.et_slider_move_to( 'next' );
					}, settings.slideshow_speed );
				}
			}

			function et_fix_slider_content_images() {
				var $this_slider           = $et_slider,
					$slide_image_container = $this_slider.find( '.et-pb-active-slide .et_pb_slide_image' );
					$slide                 = $slide_image_container.closest( '.et_pb_slide' ),
					$slider                = $slide.closest( '.et_pb_slider' ),
					slide_height           = $slider.innerHeight(),
					image_height           = parseInt( slide_height * 0.8 );

				$slide_image_container.find( 'img' ).css( 'maxHeight', image_height + 'px' );

				if ( $slide.hasClass( 'et_pb_media_alignment_center' ) ) {
					$slide_image_container.css( 'marginTop', '-' + parseInt( $slide_image_container.height() / 2 ) + 'px' );
				}

				$slide_image_container.find( 'img' ).addClass( 'active' );
			}

			function et_get_bg_layout_color( $slide ) {
				if ( $slide.hasClass( 'et_pb_bg_layout_dark' ) ) {
					return 'et_pb_bg_layout_dark';
				}

				return 'et_pb_bg_layout_light';
			}

			$et_window.load( function() {
				et_fix_slider_content_images();
			} );

			$et_window.resize( function() {
				if ( et_pb_container_width !== $et_pb_container.width() ) {
					et_pb_container_width = $et_pb_container.width();

					et_fix_slider_content_images();
				}
			} );

			$et_slider.et_slider_move_to = function ( direction ) {
				var $active_slide = $et_slide.eq( et_active_slide ),
					$next_slide;

				$et_slider.et_animation_running = true;

				if ( direction == 'next' || direction == 'previous' ){

					if ( direction == 'next' )
						et_active_slide = ( et_active_slide + 1 ) < et_slides_number ? et_active_slide + 1 : 0;
					else
						et_active_slide = ( et_active_slide - 1 ) >= 0 ? et_active_slide - 1 : et_slides_number - 1;

				} else {

					if ( et_active_slide == direction ) {
						$et_slider.et_animation_running = false;
						return;
					}

					et_active_slide = direction;

				}

				if ( typeof et_slider_timer != 'undefined' )
					clearInterval( et_slider_timer );

				$next_slide	= $et_slide.eq( et_active_slide );

				$et_slide.each( function(){
					$(this).css( 'zIndex', 1 );
				} );
				$active_slide.css( 'zIndex', 2 ).removeClass( 'et-pb-active-slide' );
				$next_slide.css( { 'display' : 'block', opacity : 0 } ).addClass( 'et-pb-active-slide' );

				et_fix_slider_content_images();

				if ( settings.use_controls )
					$et_slider_controls.removeClass( settings.control_active_class ).eq( et_active_slide ).addClass( settings.control_active_class );

				$next_slide.animate( { opacity : 1 }, et_fade_speed );
				$active_slide.addClass( 'et_slide_transition' ).css( { 'display' : 'list-item', 'opacity' : 1 } ).animate( { opacity : 0 }, et_fade_speed, function(){
					var active_slide_layout_bg_color = et_get_bg_layout_color( $active_slide ),
						next_slide_layout_bg_color = et_get_bg_layout_color( $next_slide );

					$(this).css('display', 'none').removeClass( 'et_slide_transition' );

					$et_slider
						.removeClass( active_slide_layout_bg_color )
						.addClass( next_slide_layout_bg_color );

					$et_slider.et_animation_running = false;
				} );


				et_slider_auto_rotate();
			}
	}

	$.fn.et_pb_simple_slider = function( options ) {
		return this.each(function() {
			new $.et_pb_simple_slider(this, options);
		});
	}

	var et_hash_module_seperator = '||',
		et_hash_module_param_seperator = '|';

	function process_et_hashchange( hash ) {
		if ( ( hash.indexOf( et_hash_module_seperator, 0 ) ) !== -1 ) {
			modules = hash.split( et_hash_module_seperator );
			for ( var i = 0; i < modules.length; i++ ) {
				var module_params = modules[i].split( et_hash_module_param_seperator );
				var element = module_params[0];
				module_params.shift();
				if ( $('#' + element ).length ) {
					$('#' + element ).trigger({
						type: "et_hashchange",
						params: module_params
					});
				}
			}
		} else {
			module_params = hash.split( et_hash_module_param_seperator );
			var element = module_params[0];
			module_params.shift();
			if ( $('#' + element ).length ) {
				$('#' + element ).trigger({
					type: "et_hashchange",
					params: module_params
				});
			}
		}
	}

	function et_set_hash( module_state_hash ) {
		module_id = module_state_hash.split( et_hash_module_param_seperator )[0];
		if ( !$('#' + module_id ).length ) {
			return;
		}

		if ( window.location.hash ) {
			var hash = window.location.hash.substring(1), //Puts hash in variable, and removes the # character
				new_hash = [];

			if( ( hash.indexOf( et_hash_module_seperator, 0 ) ) !== -1 ) {
				modules = hash.split( et_hash_module_seperator );
				var in_hash = false;
				for ( var i = 0; i < modules.length; i++ ) {
					var element = modules[i].split( et_hash_module_param_seperator )[0];
					if( element === module_id ) {
						new_hash.push( module_state_hash );
						in_hash = true;
					} else {
						new_hash.push( modules[i] );
					}
				}
				if ( !in_hash ) {
					new_hash.push( module_state_hash );
				}
			} else {
				module_params = hash.split( et_hash_module_param_seperator );
				var element = module_params[0];
				if ( element !== module_id ) {
					new_hash.push( hash );
				}
				new_hash.push( module_state_hash );
			}

			hash = new_hash.join( et_hash_module_seperator );
		} else {
			hash = module_state_hash;
		}

		var yScroll = document.body.scrollTop;
		window.location.hash = hash;
		document.body.scrollTop = yScroll;
	}

	var $et_pb_slider  = $( '.et_pb_slider' ),
		$et_pb_video_section = $('.et_pb_section_video_bg'),
		$et_lightbox_image = $( '.et_pb_lightbox_image'),
		$et_pb_parallax = $( '.et_parallax_bg' ),
		et_is_mobile_device = navigator.userAgent.match( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/ ),
		et_is_ipad = navigator.userAgent.match( /iPad/ ),
		$et_container = $( '.container' ),
		et_container_width = $et_container.width(),
		et_is_fixed_nav = $( 'body' ).hasClass( 'et_fixed_nav' ),
		$main_container_wrapper = $( '#page-container' ),
		$et_window = $(window),
		etRecalculateOffset = false,
		et_header_height,
		et_header_modifier,
		et_header_offset,
		et_primary_header_top;

	$(document).ready( function(){
		var $et_top_menu = $( 'ul.nav' );

		$et_top_menu.find( 'li' ).hover( function() {
			if ( ! $(this).closest( 'li.mega-menu' ).length || $(this).hasClass( 'mega-menu' ) ) {
				$(this).addClass( 'et-show-dropdown' );
				$(this).removeClass( 'et-hover' ).addClass( 'et-hover' );
			}
		}, function() {
			var $this_el = $(this);

			$this_el.removeClass( 'et-show-dropdown' );

			setTimeout( function() {
				if ( ! $this_el.hasClass( 'et-show-dropdown' ) ) {
					$this_el.removeClass( 'et-hover' );
				}
			}, 200 );
		} );

		if ( $('ul.et_disable_top_tier').length ) {
			$("ul.et_disable_top_tier > li > ul").prev('a').attr('href','#');
		}

		if ( et_is_mobile_device ) {
			$( '.et_pb_section_video_bg' ).each( function() {
				var $this_el = $(this);

				$this_el.css( 'visibility', 'hidden' ).closest( '.et_pb_preload' ).removeClass( 'et_pb_preload' )
			} );

			$( 'body' ).addClass( 'et_mobile_device' );

			if ( ! et_is_ipad ) {
				$( 'body' ).addClass( 'et_mobile_device_not_ipad' );
			}
		}

		if ( $et_pb_video_section.length ){
			$et_pb_video_section.find( 'video' ).mediaelementplayer( {
				pauseOtherPlayers: false,
				success : function( mediaElement, domObject ) {
					mediaElement.addEventListener( 'canplay', function() {
						et_pb_resize_section_video_bg( $(domObject) );
						et_pb_center_video( $(domObject) );
					} );
				}
			} );
		}

		if ( $et_pb_slider.length ){
			$et_pb_slider.each( function() {
				var $this_slider = $(this),
					et_slider_settings = {
						fade_speed 		: 700,
						slide			: '.et_pb_slide'
					}

				if ( $this_slider.hasClass('et_pb_slider_no_arrows') )
					et_slider_settings.use_arrows = false;

				if ( $this_slider.hasClass('et_pb_slider_no_pagination') )
					et_slider_settings.use_controls = false;

				if ( $this_slider.hasClass('et_slider_auto') ) {
					var et_slider_autospeed_class_value = /et_slider_speed_(\d+)/g;

					et_slider_settings.slideshow = true;

					et_slider_autospeed = et_slider_autospeed_class_value.exec( $this_slider.attr('class') );

					et_slider_settings.slideshow_speed = et_slider_autospeed[1];
				}

				$this_slider.et_pb_simple_slider( et_slider_settings );

			} );
		}

		function et_apply_parallax() {
			var $this = $(this),
				element_top = $this.offset().top,
				window_top = $et_window.scrollTop(),
				y_pos = ( ( ( window_top + $et_window.height() ) - element_top ) * 0.3 ),
				main_position;

			main_position = 'translate3d(0, ' + y_pos + 'px, 0px)';

			$this.find('.et_parallax_bg').css( {
				'-webkit-transform' : main_position,
				'-moz-transform'    : main_position,
				'-ms-transform'     : main_position,
				'transform'         : main_position
			} );
		}

		function et_parallax_set_height() {
			var $this = $(this),
				bg_height;

			bg_height = ( $et_window.height() * 0.3 + $this.innerHeight() );

			$this.find('.et_parallax_bg').css( { 'height' : bg_height } );
		}

		if ( $.fn.fitVids ) {
			$( '.et_pb_slide_video' ).fitVids();

			$( '#main-content' ).fitVids();
		}

		et_fix_video_wmode('.fluid-width-video-wrapper');

		function et_fix_video_wmode( video_wrapper ) {
				$( video_wrapper ).each( function() {
					var $this_el = $(this).find( 'iframe' ),
						src_attr = $this_el.attr('src'),
						wmode_character = src_attr.indexOf( '?' ) == -1 ? '?' : '&amp;',
						this_src = src_attr + wmode_character + 'wmode=opaque';

					$this_el.attr('src', this_src);
				} );
		}

		function et_pb_resize_section_video_bg( $video ) {
			$element = typeof $video !== 'undefined' ? $video.closest( '.et_pb_section_video_bg' ) : $( '.et_pb_section_video_bg' );

			$element.each( function() {
				var $this_el = $(this),
					ratio = ( typeof $this_el.attr( 'data-ratio' ) !== 'undefined' )
						? $this_el.attr( 'data-ratio' )
						: $this_el.find('video').attr( 'width' ) / $this_el.find('video').attr( 'height' ),
					$video_elements = $this_el.find( '.mejs-video, video, object' ).css( 'margin', 0 ),
					$container = $this_el.closest( '.et_pb_section' ).length
						? $this_el.closest( '.et_pb_section' )
						: $this_el.closest( '.et_pb_slides' ),
					body_width = $container.width(),
					container_height = $container.innerHeight(),
					width, height;

				if ( typeof $this_el.attr( 'data-ratio' ) == 'undefined' )
					$this_el.attr( 'data-ratio', ratio );

				if ( body_width / container_height < ratio ) {
					width = container_height * ratio;
					height = container_height;
				} else {
					width = body_width;
					height = body_width / ratio;
				}

				$video_elements.width( width ).height( height );
			} );
		}

		function et_pb_center_video( $video ) {
			$element = typeof $video !== 'undefined' ? $video : $( '.et_pb_section_video_bg .mejs-video' );

			$element.each( function() {
				var $video_width = $(this).width() / 2;
				var $video_width_negative = 0 - $video_width;
				$(this).css("margin-left",$video_width_negative );

				if ( typeof $video !== 'undefined' ) {
					if ( $video.closest( '.et_pb_slider' ).length && ! $video.closest( '.et_pb_first_video' ).length )
						return false;

					setTimeout( function() {
						$( this ).closest( '.et_pb_preload' ).removeClass( 'et_pb_preload' );
					}, 500 );
				}
			} );
		}

		function et_calculate_header_values() {
			var $top_header = $( '#top-header' ),
				secondary_nav_height = $top_header.length && $top_header.is( ':visible' ) ? $top_header.innerHeight() : 0,
				admin_bar_height     = $( '#wpadminbar' ).length ? $( '#wpadminbar' ).innerHeight() : 0;

			et_header_height      = $( '#main-header' ).innerHeight() + secondary_nav_height - 1,
			et_header_modifier    = et_header_height <= 90 ? et_header_height - 29 : et_header_height - 56,
			et_header_offset      = et_header_modifier + admin_bar_height;

			et_primary_header_top = secondary_nav_height + admin_bar_height;
		}

		function et_fix_slider_height() {
			if ( ! $et_pb_slider.length ) return;

			$et_pb_slider.each( function() {
				var $slide = $(this).find( '.et_pb_slide' ),
					$slide_container = $slide.find( '.et_pb_container' ),
					max_height = 0;

				$slide_container.css( 'min-height', 0 );

				$slide.each( function() {
					var $this_el = $(this),
						height = $this_el.innerHeight();

					if ( max_height < height )
						max_height = height;
				} );

				$slide_container.css( 'min-height', max_height );
			} );
		}
		et_fix_slider_height();

		// remove placeholder text before form submission
		function et_pb_remove_placeholder_text( $form ) {
			$form.find('input:text, textarea').each(function(index,domEle){
				var $et_current_input = jQuery(domEle),
					$et_label = $et_current_input.siblings('label'),
					et_label_value = $et_current_input.siblings('label').text();

				if ( $et_label.length && $et_label.is(':hidden') ) {
					if ( $et_label.text() == $et_current_input.val() )
						$et_current_input.val( '' );
				}
			});
		}

		et_duplicate_menu( $('#et-top-navigation ul.nav'), $('#et-top-navigation .mobile_nav'), 'mobile_menu', 'et_mobile_menu' );

		et_duplicate_menu( $('.et_pb_fullwidth_menu ul.nav'), $('.et_pb_fullwidth_menu .mobile_nav'), 'mobile_menu', 'et_mobile_menu' );

		function et_duplicate_menu( menu, append_to, menu_id, menu_class ){
			var $cloned_nav;

			menu.clone().attr('id',menu_id).removeClass().attr('class',menu_class).appendTo( append_to );
			$cloned_nav = append_to.find('> ul');
			$cloned_nav.find('.menu_slide').remove();
			$cloned_nav.find('li:first').addClass('et_first_mobile_item');

			append_to.on( 'click', function(){
				if ( $(this).hasClass('closed') ){
					$(this).removeClass( 'closed' ).addClass( 'opened' );
					$cloned_nav.slideDown( 500 );
				} else {
					$(this).removeClass( 'opened' ).addClass( 'closed' );
					$cloned_nav.slideUp( 500 );
				}
				return false;
			} );

			append_to.on( 'click', 'a', function(event){
				event.stopPropagation();
			} );
		}

		if ( $( '#et-secondary-nav' ).length ) {
			$('#et-top-navigation #mobile_menu').append( $( '#et-secondary-nav' ).clone().html() );
		}

		function et_change_primary_nav_position() {
			var $body = $('body');

			if ( ! $body.hasClass( 'et_vertical_nav' ) && ( $body.hasClass( 'et_fixed_nav' ) ) ) {
				$('#main-header').css( 'top', et_primary_header_top );
			}
		}

		$( window ).resize( function(){
			var containerWidthChanged = et_container_width !== $et_container.width(),
				window_width = $et_window.width();

			et_pb_resize_section_video_bg();
			et_pb_center_video();

			et_fix_slider_height();

			if ( $( '.et_pb_blog_grid' ).length )
				$( '.et_pb_blog_grid' ).masonry();

			if ( et_is_fixed_nav && containerWidthChanged ) {
				setTimeout( function() {
					var $top_header = $( '#top-header' ),
						secondary_nav_height = $top_header.length && $top_header.is( ':visible' ) ? $top_header.innerHeight() : 0;

					$main_container_wrapper.css( 'paddingTop', $( '#main-header' ).innerHeight() + secondary_nav_height - 1 );

					et_change_primary_nav_position();
				}, 200 );
			}

			if ( $( '#wpadminbar' ).length && et_is_fixed_nav && window_width >= 740 && window_width <= 782 ) {
				et_calculate_header_values();

				et_change_primary_nav_position();
			}

			if ( containerWidthChanged ) {
				$('.container-width-change-notify').trigger('containerWidthChanged');

				et_container_width = $et_container.width();

				etRecalculateOffset = true;

			}
		} );

		$( window ).load( function(){
			if ( et_is_fixed_nav ) {
				et_calculate_header_values();

				$main_container_wrapper.css( 'paddingTop', et_header_height - 1 );

				et_change_primary_nav_position();
			}

			if ( $( '.et_pb_blog_grid' ).length ) {
				$( '.et_pb_blog_grid' ).masonry( {
					itemSelector : '.et_pb_post'
				} );
			}

			setTimeout( function() {
				$( '.et_pb_preload' ).removeClass( 'et_pb_preload' );
			}, 500 );

			if ( $.fn.hashchange ) {
				$(window).hashchange( function(){
					var hash = window.location.hash.substring(1);
					process_et_hashchange( hash );
				});
				$(window).hashchange();
			}

			if ( $('p.demo_store').length ) {
				$('#footer-bottom').css('margin-bottom' , $('p.demo_store').innerHeight());
			}

			if ( $.fn.waypoint ) {
				$( '.et-waypoint' ).waypoint( {
					offset: '75%',
					handler: function() {
						$(this).addClass( 'et-animated' );
					}
				} );

				if ( et_is_fixed_nav ) {
					$('#main-content').waypoint( {
						offset: function() {
							if ( etRecalculateOffset ) {
								et_calculate_header_values();

								etRecalculateOffset = false;
							}

							return et_header_offset;
						},
						handler : function( direction ) {
							if ( direction === 'down' ) {
								$('#main-header').addClass( 'et-fixed-header' );
							} else {
								$('#main-header').removeClass( 'et-fixed-header' );
							}
						}
					} );
				}
			}

			if ( $et_pb_parallax.length && !et_is_mobile_device ) {
				$et_pb_parallax.each(function(){
					if ( $(this).hasClass('et_pb_parallax_css') ) {
						return;
					}

					var $this_parent = $(this).parent();

					$.proxy( et_parallax_set_height, $this_parent )();

					$.proxy( et_apply_parallax, $this_parent )();

					$et_window.on( 'scroll', $.proxy( et_apply_parallax, $this_parent ) );

					$et_window.on( 'resize', $.proxy( et_parallax_set_height, $this_parent ) );
					$et_window.on( 'resize', $.proxy( et_apply_parallax, $this_parent ) );
				});
			}


			if ( $('.et_pb_audio_module .mejs-audio').length || $( '.et_audio_content .mejs-audio' ).length ){
				$('.et_pb_audio_module .mejs-audio, .et_audio_content .mejs-audio').each(function(){
					$count_timer = $(this).find('div.mejs-currenttime-container').addClass('custom');
					$(this).find('.mejs-controls div.mejs-duration-container').replaceWith($count_timer);
				});
			}

		} );

		function et_pb_smooth_scroll( $target, $top_section, $speed ) {
			var $window_width = $( window ).width();

			if ( $( 'body' ).hasClass( 'et_fixed_nav' ) && $window_width > 980 ) {
				$menu_offset = $( '#top-header' ).outerHeight() + $( '#main-header' ).outerHeight() - 1;
			} else {
				$menu_offset = -1;
			}

			if ( $ ('#wpadminbar').length && $window_width > 600 ) {
				$menu_offset += $( '#wpadminbar' ).outerHeight();
			}

			//fix sidenav scroll to top
			if ( $top_section ) {
				$scroll_position = 0;
			} else {
				$scroll_position = $target.offset().top - $menu_offset;
			}

			$( 'html, body' ).animate( { scrollTop :  $scroll_position }, $speed );
		}

		$( 'a[href*=#]:not([href=#])' ).click( function() {
			if ( $(this).closest( '.woocommerce-tabs' ).length && $(this).closest( '.tabs' ).length ) {
				return false;
			}

			if ( location.pathname.replace( /^\//,'' ) == this.pathname.replace( /^\//,'' ) && location.hostname == this.hostname ) {
				var target = $( this.hash );
				target = target.length ? target : $( '[name=' + this.hash.slice(1) +']' );
				if ( target.length ) {
					et_pb_smooth_scroll( target, false, 800 );

					if ( ! $( '#main-header' ).hasClass( 'et-fixed-header' ) && $( 'body' ).hasClass( 'et_fixed_nav' ) && $( window ).width() > 980 ) {
							setTimeout(function(){
							et_pb_smooth_scroll( target, false, 200);
						}, 500 );
					}

					return false;
				}
			}
		});

		if ( $( '.et_pb_section' ).length > 1 && $( '.et_pb_side_nav_page' ).length ) {
			var $i=0;

			$( '#main-content' ).append( '<ul class="et_pb_side_nav"></ul>' );

			$( '.et_pb_section' ).each( function(){
				if ( $( this ).height() > 0 ) {
					$active_class = $i == 0 ? 'active' : '';
					$( '.et_pb_side_nav' ).append( '<li class="side_nav_item"><a href="#" id="side_nav_item_id_' + $i + '" class= "' + $active_class + '">' + $i + '</a></li>' );
					$( this ).addClass( 'et_pb_scroll_' + $i );
					$i++;
				}
			});

			$side_nav_offset = ( $i * 20 + 40 ) / 2;
			$( 'ul.et_pb_side_nav' ).css( 'marginTop', '-' + parseInt( $side_nav_offset) + 'px' );
			$( '.et_pb_side_nav' ).addClass( 'et-visible' );


			$( '.et_pb_side_nav a' ).click( function(){
				$top_section =  ( $( this ).text() == "0" ) ? true : false;
				$target = $( '.et_pb_scroll_' + $( this ).text() );

				et_pb_smooth_scroll( $target, $top_section, 800);

				if ( ! $( '#main-header' ).hasClass( 'et-fixed-header' ) && $( 'body' ).hasClass( 'et_fixed_nav' ) && $( window ).width() > 980 ) {
					setTimeout(function(){
						 et_pb_smooth_scroll( $target, $top_section, 200);
					},500);
				}

				return false;
			});

			$( window ).scroll( function(){

				$add_offset = ( $( 'body' ).hasClass( 'et_fixed_nav' ) ) ? 20 : -90;

				if ( $ ( '#wpadminbar' ).length && $( window ).width() > 600 ) {
					$add_offset += $( '#wpadminbar' ).outerHeight();
				}

				$side_offset = ( $( 'body' ).hasClass( 'et_vertical_nav' ) ) ? $( '#top-header' ).height() + $add_offset + 60 : $( '#top-header' ).height() + $( '#main-header' ).height() + $add_offset;

				for ( var $i = 0; $i <= $( '.side_nav_item a' ).length - 1; $i++ ) {
					 if( $( window ).scrollTop() + $( window ).height() == $( document ).height() ) {
						$last = $( '.side_nav_item a' ).length - 1;
						$( '.side_nav_item a' ).removeClass( 'active' );
						$( 'a#side_nav_item_id_' + $last ).addClass( 'active' );
					 } else {
						if ( $( this ).scrollTop() >= $( '.et_pb_scroll_' + $i ).offset().top - $side_offset ) {
							$( '.side_nav_item a' ).removeClass( 'active' );
							$( 'a#side_nav_item_id_' + $i ).addClass( 'active' );
						}
					}
				}
			});
		}
	} );
})(jQuery)
