function openAddAu(){
		  //กำหนดขนาดและหน้าเว็บที่จะแสดงใน popup สามารถใส่เป็นภาพก็ได้นะครับ
        $.colorbox({iframe:true, width:"1000px", height:"700px", href: '/admin/au/add'});
      } 

$('.author_add').click(openAddAu);