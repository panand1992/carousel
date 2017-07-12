(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        eventUtils = require('utils/utilEvents');
        define(['nbCarousel'], factory);
    } else {
        // Browser globals
        root.nbCarousel = factory(root.options);
    }
}(window, function(options) {
	var nbCarousel = {

		nbCarouselEl : null,
		nbSliderImgDataArr : [],
		windowHeight : $(window).height(),
		windowWidth : $(window).width(),
		currentSlider : null,
		pageURL : location.href,
		pageName : null,

		initialize : function(clear){
			var self = this;

			window.onpopstate = function(event) {
			 	self.closeFullScreen();
			};

			if(clear) {
				self.nbSliderImgDataArr = [];
			}
			if(self.pageURL.search("property/pg") > -1 || self.pageURL.search("property/rent") > -1 || self.pageURL.search("property/sale") > -1){
		    	self.pageName = "list";
		    }
		    if(self.pageURL.search("detail") > -1){
		    	self.pageName = "detail";
		    }
			$(document).ready(function(){
				self.nbCarousel = $(".nbCarousel");
				self.nbCarousel.each(function(index){
					var imgData = {};
					var newImgArr = [];
					var newImgArrM = [];
					var newimgHTML = "";
					var newThumbnailHTML = "";
					if($(this).find(".nbCarouselImg").length == 0  && $(this).find("a").length > 0){
						imgData["count"] = $(this).find("a").length;
						imgData["allowfullscreen"] = $(this).attr("data-allowfullscreen");
						imgData["gridpreview"] = $(this).attr("data-gridpreview");
						imgData["topheader"] = $(this).attr("data-topheader");
						imgData["height"] = $(this).attr("data-height");
						imgData["title"] = $(this).attr("data-title");
						imgData["currentImage"] = 0;
						$(this).find("a").each(function(){
							newImgArr.push($(this).attr('data-src'));
							newImgArrM.push($(this).attr('data-src-m'));
							newimgHTML += "<div class='nbCarouselImg'></div>";
							newThumbnailHTML += "<li><div class='nbCarousel_thumbnail_img'></div></li>";
						});
						imgData["imgHTML"] = newimgHTML;
						imgData["thumbnailHTML"] = newThumbnailHTML;
						imgData["srcArr"] = newImgArr;
						imgData["srcArrM"] = newImgArrM;
						imgData["oldHtml"] = "<div class='nbCarouselImgData'>" + $(this).html() + "</div>";
						imgData["shortUrl"] = $(this).attr("data-shortUrl");
						if($("#nbCarousel-"+index).length > 0){
							self.nbSliderImgDataArr[index] = imgData;
						}
						else{
							self.nbSliderImgDataArr.push(imgData);
							$(this).attr("id", "nbCarousel-"+ index);
						}
					}
				});
				self.initializePreview();
			});

			$(window).resize(function(){
				self.windowHeight = $(window).height();
				self.windowWidth = $(window).width();
			});

			$(document).keydown(function(e) {
				if(self.currentSlider != null){
					switch(e.which) {
				        case 37: 	if(self.nbSliderImgDataArr[self.currentSlider].count > 1){
				        				self.previousSliderImage();
				        			}
				        			break;

				        case 39: 	if(self.nbSliderImgDataArr[self.currentSlider].count > 1){
				        				self.nextSliderImage();
				        			}
				        			break;

				        case 27: 	self.closeFullScreen(); 
				        			break;

				        default: 	return; // exit this handler for other keys
				    }
				}
			});
		},

		initializePreview : function(){
			var self = this;
			var sliderIndex = 0;
			self.nbCarousel.each(function(){
				var elem = $(this);
				if(self.nbSliderImgDataArr[sliderIndex]){
					if(self.nbSliderImgDataArr[sliderIndex].gridpreview){
						self.initializeGridPreview(elem, sliderIndex);
					}
					else{
						self.initializeSliderPreview(elem, sliderIndex);
					}
					var sliderHeight = $(this).parent().height();
					if(self.nbSliderImgDataArr[sliderIndex].height){
						sliderHeight = self.nbSliderImgDataArr[sliderIndex].height;
					}
					$(this).height(sliderHeight);
					sliderIndex++;
				}
			});
			self.RefreshSomeEventListener();
		},

		initializeSliderPreview : function(val, index){
			var self = this;
			val.html(self.nbSliderImgDataArr[index].imgHTML);
			val.find(".nbCarouselImg:nth-child(1)").append("<img src='"+self.nbSliderImgDataArr[index].srcArr[0]+"'>");
			val.find(".nbCarouselImg:nth-child(1)").css({'display' : 'block'});
			val.find(".nbCarouselImg:nth-child(1) img").on("load", function(){
				var imgHeight = $(this).height();
				var imgWidth = $(this).width();
				var sliderHeight = val.height();
				var sliderWidth = val.width();
				var imgAR = imgWidth/imgHeight;
				var sliderAR = sliderWidth/sliderHeight;
				if(imgAR >= sliderAR){
					$(this).css({"height":"100%", "width" : "auto", "left" : (((((sliderHeight/imgHeight)*imgWidth) - sliderWidth)/2)*(-1)) + "px"});
				}
				else{
					$(this).css({"height":"auto", "width" : "100%", "top" :  (((((sliderWidth/imgWidth)*imgHeight) - sliderHeight)/2)*(-1)) + "px"});
				}
			});
			if(self.nbSliderImgDataArr[index].count > 1){
				val.append("<a href='javascript:void(0)' class='nbCarousel_prev'><div class='nbCarousel-left'></div></a>");
				val.append("<a href='javascript:void(0)' class='nbCarousel_next'><div class='nbCarousel-right'></div></a>");
			}
			if(self.nbSliderImgDataArr[index].allowfullscreen == "true"){
				val.append("<a href='javascript:void(0)' class='nbCarousel_expand'><i class='icon-resize-full'></i></a>");
				val.find(".nbCarouselImg").on("click", "img",  function(){
					self.currentSlider = $(this).parents(".nbCarousel").attr("id").split("-")[1];
					self.nbSliderImgDataArr[self.currentSlider].currentImage = $(this).parent().index();
					self.initializeSlider();
				});
			}
			val.find(".nbCarousel_prev").hide();
			val.find(".nbCarousel_next").hide();
			val.append(self.nbSliderImgDataArr[index].oldHtml);
			if(self.nbSliderImgDataArr[index].count > 1){
				val.find(".nbCarousel_next").show();
			}
		},

		initializeGridPreview : function(val, index){
			var self = this;
			var previewHTML = "";
			var className = "";
			for(var i=0;i<self.nbSliderImgDataArr[index].count && i<=3; i++){
				previewHTML += "<div class='nbCarousel_prevImg' style='background-image:url("+self.nbSliderImgDataArr[index].srcArr[i]+")'></div>";
				if(i == 3){
					previewHTML += "<div class='nbCarousel_more'><span>+"+(self.nbSliderImgDataArr[index].count - 3)+"</span></div>";
					className = "nbCarousel_3more";
				}
				else{
					className = "nbCarousel_" + (i+1);
				}
			}
			val.addClass(className);
			val.html(previewHTML);
			val.append(self.nbSliderImgDataArr[index].oldHtml);
		},

		initializeSlider : function(){
			var self = this;
			var propertyTitle = self.nbSliderImgDataArr[self.currentSlider].title;
			var propertyUrlShare = null;
			var propertyShortUrl = self.nbSliderImgDataArr[self.currentSlider].shortUrl;
			if(propertyTitle == undefined || propertyTitle == null || propertyTitle == ""){
				if($(".detail-title-main").length > 0){
					propertyTitle = $(".detail-title-main").html();
					propertyUrlShare = location.pathname;
				}
				else{
					propertyTitle = $("#nbCarousel-" + self.currentSlider).parents(".card").find(".card-link-detail").attr("title");
					propertyUrlShare = $("#nbCarousel-" + self.currentSlider).parents(".card").find(".card-link-detail").attr("href");
				}
			}
			$(".nbCarousel_fullscreen").remove();
			$("body").append(
				"<div class='nbCarousel_fullscreen'>"+
					"<div class='nbCarousel_fullscreen_header'>"+
						"<div class='nbCarousel_share'>Share : <a href='https://www.facebook.com/sharer/sharer.php?u="+
						propertyShortUrl+"' target='_blank'><div class='fb-white-icon'></div></a><a href='http://twitter.com/intent/tweet?text=Check-out this broker-free property: "+
						propertyTitle+" for rent, via @nobrokercom &url="+propertyShortUrl+"' target='_blank'><div class='twitter-white-icon'></div></a><a href='mailto:?subject="
						+propertyTitle+" via Nobroker.com&body=Check-out this brokerage-free property at Nobroker.com. It is a "+propertyTitle+" for rent. Click at "+propertyShortUrl+
						"' target='_blank'><div class='mail-white-icon'></div></a><a href='https://web.whatsapp.com/send?text=Check-out this brokerage-free property at NoBroker.com. It is a " + 
						propertyTitle + ". Click at "+propertyShortUrl+"' target='_blank'><div class='whatsapp-white-icon'></div></a></div>"+
						"<div class='nbCarousel_contact'></div>"+
						"<div class='nbCarousel_rent'></div>"+
						"<div class='nbCarousel_shortlist'></div>"+
					"</div>"+
					"<div class='nbCarousel_fullscreen_wrapper'>"+
						self.nbSliderImgDataArr[self.currentSlider].imgHTML+
					"</div>"+
					"<div class='nbCarousel_fullscreen_footer'>"+
						"<div class='nbCarousel_img_count'></div>"+
						"<div class='nbCarousel_thumbnail_slider'><ul>"+self.nbSliderImgDataArr[self.currentSlider].thumbnailHTML+"</ul></div>"+
					"</div>"+
					"<div class='nbCarousel_close'></div>"+
				"</div>");
			if(self.nbSliderImgDataArr[self.currentSlider].topheader == "false"){
				$(".nbCarousel_fullscreen_header").empty();
			}
			if($(".detail-title-main").length > 0){
				$(".nbCarousel_rent").append($("#price").html());
				$(".shortlistDetailPageIcon").clone().appendTo(".nbCarousel_shortlist");
				$(".top-owner-contact-button").clone().appendTo(".nbCarousel_contact");
			}
			else if($("#mapCard").is(":visible")){
				$(".nbCarousel_rent").append($("#mapDPrice").parent().html());
				$("#mapDShortlist").parent().clone().appendTo(".nbCarousel_shortlist");
				$("#mapDOwner").clone().appendTo(".nbCarousel_contact");
			}
			else{
				var propertyPrice = $("#nbCarousel-" + self.currentSlider).parents(".card").find(".open_detail_page > .col-sm-4:nth-child(3) > h3").html();
				$("#nbCarousel-" + self.currentSlider).parents(".card").find(".btn-ownercontact-detail").clone().appendTo(".nbCarousel_contact");
				$("#nbCarousel-" + self.currentSlider).parents(".card").find(".btn-shortlist-property").clone().appendTo(".nbCarousel_shortlist")
				$(".nbCarousel_rent").append(propertyPrice);
			}
			$(".nbCarousel_contact .top-owner-contact-button").show();
			if($(".scrollNavHeader .shortlistIcon").length > 0){
				$(".scrollNavHeader .shortlistIcon").clone().appendTo(".nbCarousel_shortlist");
				$(".nbCarousel_rent").html("&#8377 " + $(".propertyPrice .detailText").html());
			}
			else{
				$(".nbCarousel_shortlist").append(" Shortlist");
			}
			$(".nbCarousel_fullscreen_wrapper").append("<div class='nbCarousel_progress'></div>");
			$(".nbCarousel_fullscreen_header").width(((self.windowHeight - 200)*4)/3);
			$(".nbCarousel_fullscreen_footer").width(((self.windowHeight - 200)*4)/3);
			if(self.nbSliderImgDataArr[self.currentSlider].count > 1){
				$(".nbCarousel_fullscreen_wrapper").append("<div class='nbCarousel_prev'><div class='nbCarousel-left'></i></div>");
				$(".nbCarousel_fullscreen_wrapper").append("<div class='nbCarousel_next'><div class='nbCarousel-right'></i></div>");
			}
			$(".nbCarousel_fullscreen_footer ul li").off();
			$(".nbCarousel_fullscreen_footer ul li").css({"width" : (((self.windowHeight - 200)*4)/15) + "px", "height" : (((self.windowHeight - 200)*9)/60) + "px"});
			if(self.nbSliderImgDataArr[self.currentSlider].count > 5){
				$(".nbCarousel_fullscreen_footer ul").width((((self.windowHeight - 200)*4)/15)*self.nbSliderImgDataArr[self.currentSlider].count);
			}
			if(self.nbSliderImgDataArr[self.currentSlider].count <= 7){
				for(var i=1;i<=self.nbSliderImgDataArr[self.currentSlider].count;i++){
					$(".nbCarousel_fullscreen_footer ul li:nth-child("+i+") .nbCarousel_thumbnail_img").css({"background-image": "url("+self.nbSliderImgDataArr[self.currentSlider].srcArrM[i-1]+")" });
				}
			}
			else{
				for(var i=1;i<8;i++){
					$(".nbCarousel_fullscreen_footer ul li:nth-child("+i+") .nbCarousel_thumbnail_img").css({"background-image": "url("+self.nbSliderImgDataArr[self.currentSlider].srcArrM[i-1]+")" });
				}
			}
			self.fitImageToSlider();
			$(".nbCarousel_fullscreen_footer ul li").on("click", function(){
				self.nbSliderImgDataArr[self.currentSlider].currentImage = $(this).index() - 1;
				self.nextSliderImage();
			});
		},

		fitImageToMiniSlider : function(){
			var self = this;
			if($("#nbCarousel-"+self.currentSlider+" > .nbCarouselImg:nth-child("+(self.nbSliderImgDataArr[self.currentSlider].currentImage + 1)+") img").length == 0){
				$("#nbCarousel-"+self.currentSlider+" > .nbCarouselImg:nth-child("+(self.nbSliderImgDataArr[self.currentSlider].currentImage + 1)+")").append("<img src='"+self.nbSliderImgDataArr[self.currentSlider].srcArrM[self.nbSliderImgDataArr[self.currentSlider].currentImage]+"'>");
			}
			$("#nbCarousel-"+self.currentSlider+" > .nbCarouselImg:nth-child("+(self.nbSliderImgDataArr[self.currentSlider].currentImage + 1)+")").fadeIn(300);
			$("#nbCarousel-"+self.currentSlider+" > .nbCarouselImg:nth-child("+(self.nbSliderImgDataArr[self.currentSlider].currentImage + 1)+") img").on("load",function(){
				var imgHeight = $(this).height();
				var imgWidth = $(this).width();
				var sliderHeight = $("#nbCarousel-"+self.currentSlider).height();
				var sliderWidth = $("#nbCarousel-"+self.currentSlider).width();
				var imgAR = imgWidth/imgHeight;
				var sliderAR = sliderWidth/sliderHeight;
				if(imgAR >= sliderAR){
					$(this).css({"height":"100%", "width" : "auto", "left" : (((((sliderHeight/imgHeight)*imgWidth) - sliderWidth)/2)*(-1)) + "px"});
				}
				else{
					$(this).css({"height":"auto", "width" : "100%", "top" :  (((((sliderWidth/imgWidth)*imgHeight) - sliderHeight)/2)*(-1)) + "px"});
				}
			});
		},

		fitImageToSlider : function(){
			var self = this;
			$(".nbCarousel_fullscreen_footer ul li").removeClass("nbCarousel_thumbnail_active");
			$(".nbCarousel_progress").hide();
			if($(".nbCarousel_fullscreen_wrapper > .nbCarouselImg:nth-child("+(self.nbSliderImgDataArr[self.currentSlider].currentImage + 1)+") img").length == 0){
				$(".nbCarousel_fullscreen_wrapper > .nbCarouselImg:nth-child("+(self.nbSliderImgDataArr[self.currentSlider].currentImage + 1)+")").append("<img src='"+self.nbSliderImgDataArr[self.currentSlider].srcArrM[self.nbSliderImgDataArr[self.currentSlider].currentImage]+"'><img class='nbCarouselImgL' src=''>");
				$(".nbCarouselImgL").off();
				$(".nbCarouselImgL").on();
				//$(".nbCarousel_progress").show();
			}
			$(".nbCarousel_fullscreen_wrapper > .nbCarouselImg:nth-child("+(self.nbSliderImgDataArr[self.currentSlider].currentImage + 1)+")").fadeIn(300);
			$(".nbCarousel_fullscreen_wrapper > .nbCarouselImg:nth-child("+(self.nbSliderImgDataArr[self.currentSlider].currentImage + 1)+") img").on("load",function(){
				//$(".nbCarousel_progress").hide();
				$(this).css({'display' : 'block'});
				if(self.windowWidth < 768){
					if($(this).height() > $(this).parent().height()){
						$(this).css({"width" : "auto", "height" : "90%"});
					}
					else{
						$(this).css({"height" : "auto", "width" : "90%"});
					}
				}
				$(".nbCarousel_fullscreen_wrapper > .nbCarouselImg:nth-child("+(self.nbSliderImgDataArr[self.currentSlider].currentImage + 1)+") .nbCarouselImgL").attr("src", self.nbSliderImgDataArr[self.currentSlider].srcArr[self.nbSliderImgDataArr[self.currentSlider].currentImage]);
				self.showLargerImage();
			});
			if($(".detail-title-main").length > 0){
				$(".nbCarousel_img_count").html((self.nbSliderImgDataArr[self.currentSlider].currentImage+1) + "/" + self.nbSliderImgDataArr[self.currentSlider].count + " : " + $(".detail-title-main").html());
			}
			else if(self.nbSliderImgDataArr[self.currentSlider].title){
				$(".nbCarousel_img_count").html((self.nbSliderImgDataArr[self.currentSlider].currentImage+1) + "/" + self.nbSliderImgDataArr[self.currentSlider].count + " : " + self.nbSliderImgDataArr[self.currentSlider].title);
			}
			else{
				var propertyTitle = $("#nbCarousel-" + self.currentSlider).parents(".card").find(".card-link-detail").attr("title");
				$(".nbCarousel_img_count").html((self.nbSliderImgDataArr[self.currentSlider].currentImage+1) + "/" + self.nbSliderImgDataArr[self.currentSlider].count + " : " + propertyTitle);
			}
			$(".nbCarousel_fullscreen_footer ul li:nth-child("+(self.nbSliderImgDataArr[self.currentSlider].currentImage+1)+")").addClass("nbCarousel_thumbnail_active");
		},

		showLargerImage : function(){
			var self = this;
			self.RefreshSomeEventListener();
			if($(".nbCarousel_fullscreen_wrapper > .nbCarouselImg:nth-child("+(self.nbSliderImgDataArr[self.currentSlider].currentImage + 1)+") .nbCarouselImgL").length == 1){
				$(".nbCarousel_fullscreen_wrapper > .nbCarouselImg:nth-child("+(self.nbSliderImgDataArr[self.currentSlider].currentImage + 1)+") .nbCarouselImgL").on("load",function(){
					$(".nbCarousel_fullscreen_wrapper > .nbCarouselImg:nth-child("+(self.nbSliderImgDataArr[self.currentSlider].currentImage + 1)+") img").hide();
					$(this).css({'display' : 'block'});
					if(self.windowWidth < 768){
					if($(this).height() > $(this).parent().height()){
						$(this).css({"width" : "auto", "height" : "90%"});
					}
					else{
						$(this).css({"height" : "auto", "width" : "90%"});
					}
				}
				});
			}
		},

		RefreshSomeEventListener : function() {
			var self = this;
			$(".nbCarousel_prev").off();
		    $(".nbCarousel_prev").on("click", function(){
		    	if($(".nbCarousel_fullscreen").length == 0){
		    		self.currentSlider = $(this).parent().attr("id").split("-")[1];
		    	}
				self.previousSliderImage();
			});
			$(".nbCarousel_next").off();
			$(".nbCarousel_next").on("click", function(){
				if($(".nbCarousel_fullscreen").length == 0){
		    		self.currentSlider = $(this).parent().attr("id").split("-")[1];
		    	}
				self.nextSliderImage();
			});
			$(".nbCarousel > .nbCarousel_prevImg").off();
			$(".nbCarousel > .nbCarousel_prevImg").on("click", function(){
				self.currentSlider = $(this).parent().attr("id").split("-")[1];
				self.nbSliderImgDataArr[self.currentSlider].currentImage = $(this).index();
				self.initializeSlider();
			});
			$(".nbCarousel_more").on("click", function(){
				self.currentSlider = $(this).parent().attr("id").split("-")[1];
				self.nbSliderImgDataArr[self.currentSlider].currentImage = 2;
				self.initializeSlider();
			});
			$(".nbCarousel_expand").on("click", function(){
				self.currentSlider = $(this).parent().attr("id").split("-")[1];
				self.nbSliderImgDataArr[self.currentSlider].currentImage = 0;
				self.initializeSlider();
			});
			$(".nbCarousel_fullscreen_wrapper img").off();
			$(".nbCarousel_fullscreen_wrapper img").on("click", function(){
				self.nextSliderImage();
			});
			$(".nbCarousel_close").off();
			$(".nbCarousel_close").on("click", function(){
				self.closeFullScreen();
			});
			$(".nbCarousel_contact").off();
			$(".nbCarousel_shortlist").off();
			$(".nbCarousel_shortlist").on("click", function(){
				if($(this).find("i").hasClass("icon-heart")){
					$(this).find("i").removeClass("icon-heart");
					$(this).find("i").addClass("icon-heart-empty");
					$(this).find("i").css("color", "rgb(112, 112, 112)");
				}
				else{
					$(this).find("i").addClass("icon-heart");
					$(this).find("i").removeClass("icon-heart-empty");
					$(this).find("i").css("color", "rgb(253, 55, 83)");
				}
			});
		},

		nextSliderImage : function(){
			var self = this;
			if($(".nbCarousel_fullscreen").length > 0){
				$(".nbCarousel_fullscreen_wrapper > .nbCarouselImg").fadeOut(300);
				if(self.nbSliderImgDataArr[self.currentSlider].currentImage < (self.nbSliderImgDataArr[self.currentSlider].count - 1)){
					self.nbSliderImgDataArr[self.currentSlider].currentImage++;
				}
				else{
					self.nbSliderImgDataArr[self.currentSlider].currentImage = 0;
				}
				self.fitImageToSlider();
				self.slideThumbnail();
			}
			else{
				$("#nbCarousel-"+self.currentSlider+" > .nbCarouselImg").fadeOut(300);
				if(self.nbSliderImgDataArr[self.currentSlider].currentImage < (self.nbSliderImgDataArr[self.currentSlider].count - 1)){
					self.nbSliderImgDataArr[self.currentSlider].currentImage++;
					if(self.nbSliderImgDataArr[self.currentSlider].currentImage > 0){
						$("#nbCarousel-"+self.currentSlider+" > .nbCarousel_prev").show();
					}
					if(self.nbSliderImgDataArr[self.currentSlider].currentImage == (self.nbSliderImgDataArr[self.currentSlider].count - 1)){
						$("#nbCarousel-"+self.currentSlider+" > .nbCarousel_next").hide();
					}
				}
				else{
					$("#nbCarousel-"+self.currentSlider+" > .nbCarousel_next").hide();
				}
				self.fitImageToMiniSlider();
			}
		},

		previousSliderImage : function(){
			var self = this;
			if($(".nbCarousel_fullscreen").length > 0){
				$(".nbCarousel_fullscreen_wrapper > .nbCarouselImg").fadeOut(300);
				if(self.nbSliderImgDataArr[self.currentSlider].currentImage > 0){
					self.nbSliderImgDataArr[self.currentSlider].currentImage--;
				}
				else{
					self.nbSliderImgDataArr[self.currentSlider].currentImage = self.nbSliderImgDataArr[self.currentSlider].count - 1;
				}
				self.fitImageToSlider();
				self.slideThumbnail();
			}
			else{
				$("#nbCarousel-"+self.currentSlider+" > .nbCarouselImg").fadeOut(300);
				if(self.nbSliderImgDataArr[self.currentSlider].currentImage > 0){
					self.nbSliderImgDataArr[self.currentSlider].currentImage--;
					if(self.nbSliderImgDataArr[self.currentSlider].currentImage < (self.nbSliderImgDataArr[self.currentSlider].count - 1)){
						$("#nbCarousel-"+self.currentSlider+" > .nbCarousel_next").show();
					}
					if(self.nbSliderImgDataArr[self.currentSlider].currentImage == 0){
						$("#nbCarousel-"+self.currentSlider+" > .nbCarousel_prev").hide();
					}
				}
				else{
					$("#nbCarousel-"+self.currentSlider+" > .nbCarousel_prev").hide();
				}
				self.fitImageToMiniSlider();
			}
		},

		closeFullScreen : function(){
			var self = this;
			$(".nbCarousel_fullscreen").remove();
			self.currentSlider = null;
		},

		slideThumbnail : function(){
			var self = this;
			if(self.nbSliderImgDataArr[self.currentSlider].count > 7 && self.nbSliderImgDataArr[self.currentSlider].currentImage > 2){
				for(var i=0; i<4;i++){
					if($(".nbCarousel_fullscreen_footer ul li:nth-child("+(i+self.nbSliderImgDataArr[self.currentSlider].currentImage+1)+") .nbCarousel_thumbnail_img").css("background-image") == "none"){
						$(".nbCarousel_fullscreen_footer ul li:nth-child("+(i+self.nbSliderImgDataArr[self.currentSlider].currentImage+1)+") .nbCarousel_thumbnail_img").css({"background-image": "url("+self.nbSliderImgDataArr[self.currentSlider].srcArrM[i+self.nbSliderImgDataArr[self.currentSlider].currentImage]+")" });
					}
				}
			}
			var marginLeft = 0;
			if(self.nbSliderImgDataArr[self.currentSlider].count > 5){
				if(self.nbSliderImgDataArr[self.currentSlider].currentImage > 2){
					if(self.nbSliderImgDataArr[self.currentSlider].currentImage <= self.nbSliderImgDataArr[self.currentSlider].count - 3){
						marginLeft = (self.nbSliderImgDataArr[self.currentSlider].currentImage - 2)*(((self.windowHeight - 200)*4)/15)*(-1);
					}
					else{
						marginLeft = (self.nbSliderImgDataArr[self.currentSlider].count - 5)*(((self.windowHeight - 200)*4)/15)*(-1);
					}
				} 
			}
			$(".nbCarousel_fullscreen_footer ul").css({"margin-left" : marginLeft + "px"});
		}
	}

	return nbCarousel;
}));