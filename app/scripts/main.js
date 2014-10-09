//*******************************//
//                               //
//    © 2014 - Yaser Tallo       //
// http://YaserTallo.github.io/  //
//                               //
//*******************************//

(function($, window) {
	'use strict';

	// Variables
	var $win			= $(window),
		winHeight		= $win.height(),
		winWidth		= $win.width(),
		$page			= $('html, body'),
		$topBar			= $('#top-bar'),
		$topNav			= $topBar.find('#top-nav'),
		$topMenu		= $topBar.find('#top-nav, #social-bar'),
		$navToggle		= $topBar.find('#nav-toggle'),
		$toTop			= $('#to-top'),
		$down			= $('#down'),
		$form			= $('#form1'),
		$pictos			= $('#pictosholder'),

		$filter			= $('#projects-filter'),
		$filterToggle	= $('#filter-toggle'),
		$filterList		= $filter.find('li'),

		$mSlider		= $topNav.find('#active'),

		$animList		= $('[data-anim]'),
		animList		= [],	// Cache animated objects and their positions
		navLinks		= [],	// Array of cached menu links objects for single targeting
		$navLinks		= $topNav.find('[data-target]'),
		navLinksTargets	= [],	// Keep list of menu links targets objects for positions requery.

		canRun			= true,

		scrollPosKeys	= {
			offset: 150,
			top			: 0,
			navTargetPos: [],	// List of targets positions (just integers)
			addPos		: function(targets) {
				scrollPosKeys.navTargetPos = []; // Empty the list.
				$.each(targets, function(idx, obj) {
					if(obj) {
						scrollPosKeys[obj[0].id] = Math.round(obj.offset().top - scrollPosKeys.offset);
						scrollPosKeys.navTargetPos.push(Math.round(obj.offset().top - scrollPosKeys.offset));
					}
				});
				scrollEmitter();
			}
		};

		// settings		= $.extend({
		// 	something: true,
		// 	somelse: false,
		// }, options);


	// Functions

	var debounce = function(func, wait) {
		var timeout;
		return function() {
			var context = this,
				args = arguments,

				later = function() {
					timeout = null;
					func.apply(context, args);
				},

				callNow = !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if(callNow) {
				func.apply(context, args);
			}
		};
	};



	var buildNav = function() {
		$navLinks.each(function() {
			var $el = $(this);
			navLinks.push($el);
			navLinksTargets.push($el.data('target') !== ('top' || '#' || '') ? $('#' + $el.data('target')) : 0);
		});
		scrollPosKeys.addPos(navLinksTargets);
		return (function() {
			$navLinks.on({
				mouseenter: navIn,
				mouseleave: navOut,
				click: navClick
			});
		})();
	};



	// To animate any element, add (data-anim="classOfAnimation") That's all.
	var makeAnim = function(firstLoad) {
		var temp = [];
		$animList.each(function() {
			var $el = $(this);
			temp.push({
				'elm': $el,
				'elmTop': Math.round($el.offset().top),
				'elmBottom': Math.round($el.height() + $el.offset().top),
				'elmAnim': $el.data('anim')
			});
			$el.addClass(firstLoad ? 'animated invisible' : 'animated');
		});
		return temp;
	};



	var inView = function(obj, top) {
		// Check if element is in view and apply the animation classes to it.
		var $el = obj.elm,
			repeat = true,
			padding = 80, // The value is %. Make it an option later higher value shows element earlier
			flex = ($el.height() / 100) * padding,

			viewportTop = top,
			viewportBottom = winHeight + viewportTop,

			elementTop = obj.elmTop + flex,
			elementBottom = obj.elmBottom - flex;

		if(viewportBottom > elementBottom && viewportTop < elementTop) {
			if(!$el.hasClass(obj.elmAnim)) {
				$el.addClass(obj.elmAnim).removeClass('invisible');
			}
		} else {
			if(repeat && $el.hasClass(obj.elmAnim)) {
				$el.addClass('invisible').removeClass(obj.elmAnim);
			}
		}
	};



	var dropDown = function(e) {
		var $this = $(this).is($navToggle) ? $topMenu : $filterList;
		$this.slideToggle(500);
		e.preventDefault();
	};



	var navIn = function() {
		var sliderNewPos = $(this).next().position().left;
		$mSlider.stop().clearQueue().animate({
			left: sliderNewPos + 'px'
		});
	};



	var navOut = function() {
		if(canRun) {
			var sliderCurrentPos = $navLinks.filter('.active').next().position().left;
			$mSlider.delay(200).animate({
				left: sliderCurrentPos + 'px'
			});
		}
	};



	var navClick = function(e) {
		var $this = $(this);
		if(winWidth < 768 && $this.data('target') !== 'top') {
			stickBar();
		}
		$navLinks.filter('.active').removeClass('active');
		goTo(scrollPosKeys[$this.data('target')] + 5);
		e.preventDefault();
	};



	var stickBar = function() {
		if(!$topBar.hasClass('sticky')) {
			$topBar.hide()
				.addClass('sticky')
				.slideDown(500, function(){
					$topBar.removeAttr('style');
				});
		}
		$toTop.slideDown(500);
	};



	var scrollSpy = function(obj) {
		if(obj && !obj.hasClass('active')) {
			$navLinks.filter('.active').removeClass('active');
			obj.addClass('active');
			$mSlider.animate({
				left: obj.next().position().left
			});
		}
	};



	var goTo = function(val) {
		canRun = false;
		$page.animate({
			scrollTop: val
		}, 1000, function(){
			canRun = true;
			scrollEmitter();
		});
	};



	var scrollEmitter = function() {
		var pos = $win.scrollTop(),
			k = scrollPosKeys.navTargetPos;

		if(pos >= scrollPosKeys.offset) {
			stickBar();
			if(pos < k[0]) {
				scrollSpy(navLinks[0]);
			} else if(pos > k[k.length - 1]) {
				scrollSpy(navLinks[k.length]);
			} else {
				for(var i = 1, len = k.length; i <= len; i++) {
					if(k[i] && pos > k[i-1] && pos < k[i]) {
						scrollSpy(navLinks[i]);
					}
				}
			}
		} else {
			$topBar.removeClass('sticky');
			$toTop.removeAttr('style');
			scrollSpy(navLinks[0]);
		}
		$.each(animList, function(idx, obj) {
			inView(obj, pos);
		});
	};



	var reQuery = function() {
		winHeight = $win.height();
		winWidth = $win.width();
		scrollPosKeys.addPos(navLinksTargets); // Get the new positions for all sections.
		$topMenu.removeAttr('style');
		$filterList.removeAttr('style'); // Close dropdown menus if open, especially useful on window resize.
		animList = makeAnim(); // Get new positions for animated elements.
		return scrollEmitter(); // Refresh current scroll position and apply the new positions to the emitter function.
	};



	var filterProjects = function() {
		var $this = $(this); // Filter button
		if(!$this.hasClass('active')) {
			var category = $this.attr('id').split('-')[1];
			$filter.find('.active').removeClass('active');
			$this.addClass('active');
			
			$('.project-listing').each(function() {
				var $listing = $(this);
				if(category === 'all' || $listing.data('category') === category) {
					$listing.fadeIn(1000);
				} else {
					$listing.hide();
				}
			});
			return reQuery();// Refresh all cached pos lists to reflect the new height.
		}
	};



	var pictosSwing = function() {
		$pictos.toggleClass('pre-accident');
	};



	var pictosAccident = function() {
		var $intro = $pictos.parent();
		$pictos.off('mouseover')
			.addClass('accident')
			.removeClass('pre-accident');
		$intro.css({
			'transition': 'all .6s .5s ease-in-out',
			'transform': 'translate3d(-5%, '+ (winHeight - $pictos.offset().top - 18) +'px, 0) rotate(0)'
		});
		$down.addClass('arrbounce').css({
			'transform': 'translate3d(0, -'+ $intro.height() +'px, 0)'
		});
		setTimeout(function() {
            $down.removeClass('arrbounce');
        }, 2500);
	};



	var formSubmit = function() {
		$.ajax({
			type: 'POST',
			url: 'https://yaziris.wufoo.com/forms/zgq58i40yz45t0/',
			data: $form.serialize(),
			crossDomain: true,
			timeout: 5000,
			complete: function() {
				$form.find('[type=submit]').replaceWith('<h4 style="margin:auto 13%">Thank you, I\'ll get in touch with you as soon as possible.</h4>');
			}
		}); // Note: Site is only giving error response, nothing works except using their API.
		return false;
	};



	return (function init() {
		$win.on('load', function() {
			$form.find('textarea').removeAttr('placeholder');
			$form.find(':disabled').removeAttr('disabled');
			animList = makeAnim(true);
			buildNav();
		});

		$navToggle.on('click', dropDown);
		$filterToggle.on('click', dropDown);

		$toTop.on('click', navClick);
		$down.on('click', navClick);

		$filter.on('click', 'button', filterProjects);

		$win.on('resize', debounce(reQuery, 500));

		$win.on('scroll', function() {
			if(canRun) {
				scrollEmitter();
			}
		});

		$pictos.one('click', pictosAccident);
		$pictos.on('mouseover', pictosSwing);

		$form.on('submit', formSubmit);
	}());
}(jQuery, window));
