$('input[type="file"]').change(function(e){
    var fileName = e.target.files[0].name;
    alert('The file "' + fileName +  '" has been selected.');
});

function closeAddBook(){
    parent.$.colorbox.close();
} 

$('#button_submit').click(closeAddBook);