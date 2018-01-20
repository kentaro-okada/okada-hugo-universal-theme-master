  $(".owl-carousel").owlCarousel({

                URLhashListener:true,
                startPosition: 'URLHash',
                    nav:true,
                    dots:false,
                    loop: true,
                    mergeFit: true,
                        autoHeight :true,
                  navText : ["前へ","次へ"],
responsive:{
        0:{
            items:1,
        },
        600:{
            items:2,
        },
        1000:{
            items:3,
                                                        autoplay: true,
                                                        autoplayHoverPause: true
		}
	}
})

        