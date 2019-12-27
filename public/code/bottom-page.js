$("#bt-about_us").click(function(){
	let url = "about_us.html";
	$(location).attr('href',url);
});

$("#bt-book").click(function(){
	let url = "book.html";
	$(location).attr('href',url);
});

$("#bt-author").click(function(){
	let url = "author.html";
	$(location).attr('href',url);
});

$("#bt-search").click(function(){
	let url = "search.html";
	$(location).attr('href',url);
});

$("#bt-about_us").mouseover(function(){
	$(this).css("color","black");
	$(this).mouseout(function(){
		$(this).css("color","white");
	});
});

$("#bt-book").mouseover(function(){
	$(this).css("color","black");
	$(this).mouseout(function(){
		$(this).css("color","white");
	});
});

$("#bt-author").mouseover(function(){
	$(this).css("color","black");
	$(this).mouseout(function(){
		$(this).css("color","white");
	});
});

$("#bt-search").mouseover(function(){
	$(this).css("color","black");
	$(this).mouseout(function(){
		$(this).css("color","white");
	});
});