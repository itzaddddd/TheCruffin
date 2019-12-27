function openCart(){
		  //กำหนดขนาดและหน้าเว็บที่จะแสดงใน popup สามารถใส่เป็นภาพก็ได้นะครับ
        $.colorbox({iframe:true, width:"1000px", height:"500px", href: "/cart"});
      }

function openLogin(){
		  //กำหนดขนาดและหน้าเว็บที่จะแสดงใน popup สามารถใส่เป็นภาพก็ได้นะครับ
        $.colorbox({iframe:true, width:"400px", height:"550px", href: "/login"});
      }

function openRegis(){
		  //กำหนดขนาดและหน้าเว็บที่จะแสดงใน popup สามารถใส่เป็นภาพก็ได้นะครับ
        $.colorbox({iframe:true, width:"1000px", height:"500px", href: "/regis"});
      }      


$("#login").click(openLogin);

$("#regis").click(openRegis);

$("#cart").click(openCart);

$("#about_us").click(function(){
	let url = "/";
	$(location).attr('href',url);
});

$("#book").click(function(){
	let url = "/book";
	$(location).attr('href',url);
});

$("#author").click(function(){
	let url = "/author";
	$(location).attr('href',url);
});


$("#search").click(function(){
	let url = "/search";
	$(location).attr('href',url);
});

$(".nav-link").mouseover(function(){
	$(this).css("color","red");
	$(this).mouseout(function(){
		$(this).css("color","white");
	});
});

$("#vision").click(function(){
	let url = "/admin";
	$(location).attr('href',url);
});