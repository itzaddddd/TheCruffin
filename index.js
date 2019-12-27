let express = require('express'); 
let app = express();
let path = require('path');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let mongoose = require('mongoose');
/*นำเข้า schema ของ database */
let Author = require('./models/author');
let Product = require('./models/product');
let User = require('./models/user');
let Cart = require('./models/cart');
/*ใช้ session เก็บข้อมูลที่ user ทำ */
let session = require('express-session');
/*passport ใช้ทำ login-register */
let passport = require('passport');
/*flash แสดงข้อความ error */
let flash = require('connect-flash');
/* passport แบบ local */
let LocalStrategy = require('passport-local').Strategy;
/* เก็บ session ใน database mongodb เดิม */
let MongoStore = require('connect-mongo')(session);
/* ให้ใช้ put,delete method ได้*/
let methodOverride = require('method-override');
/*ตัวแปรไว้พักค่าก่อนเก็บลง db */
let user;
let book_add;
let author_add;

/* ต่อ db the_cruffin ที่ port 27017 */
mongoose.connect('mongodb://localhost:27017/the_cruffin',{useNewUrlParser : true});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
/* กำหนด view engine เป็น ejs*/
app.set('views', path.join(__dirname, 'views'));
app.set("view engine","ejs");

app.use(express.static(path.join(__dirname, 'public/code')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
/*เรียกใช้ session */
app.use(session({
	secret: "thecruffin",
	resave: false,
	saveUninitialized: true,
	store: new MongoStore({ mongooseConnection: mongoose.connection}), //เชื่อมต่อ session กับ db เดิม
	cookie: {maxAge: 300 * 60 * 1000} //อายุ session
}));

app.use(methodOverride('_method'));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

/*ฟังก์ชันกำหนดให้ตัวแปรใช้กับ ejs ได้ทุกหน้า*/
app.use(function(req,res,next){
	res.locals.login = req.isAuthenticated();
	res.locals.user = req.user;
	res.locals.session = req.session;
	next();
});
/*สร้าง passport*/
passport.use(new LocalStrategy(User.authenticate())); //เก็บข้อมูล user ใน db User
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* ----routes---- */
/* ---user--- */
/*Home page เป็น about us*/
app.get('/',function(req,res){
	res.render('about_us');
});

/* --หน้า UI-- */
/*หน้าสินค้า*/
app.get('/book',function(req,res){
	Product.find(function(err,docs){ //หาข้อมูล book ทั้งหมดใน db Product มาแสดง
		let productChunks = [];
		let chunkSize = 4;
		for(let i=0;i<docs.length;i+=chunkSize){
			productChunks.push(docs.slice(i,i+chunkSize));
		}
		res.render('book',{products:productChunks});
	});
});
/*ดูข้อมูลสินค้า*/
app.get('/book/:id',function(req,res){
	Product.findById(req.params.id)
 		.then((doc)=>{
		res.render('book_detail',{product:doc});
 	}).catch((err)=>{
		console.log(err);
 	});
});
/*หน้าข้อมูลนักเขียน*/
app.get('/author',function(req,res){
	Author.find(function(err,docs){ //หาข้อมูล author ทั้งหมดใน db Product มาแสดง
		let authorChunks = [];
		let chunkSize = 3;
		for(let i=0;i<docs.length;i+=chunkSize){
			authorChunks.push(docs.slice(i,i+chunkSize));
		}
		res.render('author',{authors:authorChunks});
	});
});
/*ดูข้อมูลนักเขียนแต่ละคน*/
app.get('/author/:id',function(req,res){
	Author.findById(req.params.id)
	.then((doc)=>{
		res.render('author_detail',{author:doc});
	}).catch((err)=>{
		console.log(err);
	});

	
});
/*หน้าค้นหา*/
app.get('/search',function(req,res){
	res.render('search');
});

app.post('/search',function(req,res){
});

/* --ซื้อสินค้า-- */
/*เพิ่มสินค้าใส่ตะกร้า*/
app.get('/add-to-cart/:id',isLoggedIn,function(req,res){
	let productId = req.params.id;
	let cart = new Cart(req.session.cart ? req.session.cart:{});
	console.log('cart :'+cart);
	Product.findById(productId, function(err, product){
		if(err){
			return res.redirect('/');
		}
		cart.add(product, product.id);
		req.session.cart = cart;
		console.log(req.session.cart);
		res.redirect('/book');
	});
});
/*ลบสินค้าในตะกร้า*/
app.get('/remove/:id',function(req,res){
	let productId = req.params.id;
	let cart = new Cart(req.session.cart ? req.session.cart:{});
	cart.removeItem(productId);
	req.session.cart = cart;
	if(req.session.cart.totalQty === 0){
		req.session.cart = null;
		req.session.isPay = null;
	}
	res.redirect('/cart');
});

/*ข้อมูลตะกร้าสินค้า*/
app.get('/cart',function(req,res){
	if(!req.session.cart){
		return res.render('cart',{products:null});
	}
	let cart = new Cart(req.session.cart);
	res.render('cart',{products:cart.generateArray(), totalPrice:cart.totalPrice, totalQty:cart.totalQty});
});

app.get('/pay',function(req,res){
	req.session.cart = null;
	req.session.isPay = true;
	res.redirect('cart');
});

/* --สมาชิก-- */
app.get('/login',function(req,res){
	res.render('login');
});


/* ล็อกอิน */
app.post('/login',passport.authenticate('local',{
	successRedirect: "/user",
	failureRedirect: "/",failureFlash: true
}), function(req,res,next){
	req.session.save((err)=>{
		if(err){
			return next(err);
		}
		res.redirect('/');
	});
});
/* ล็อกเอาท์ */
app.get('/logout', function(req,res){
	req.session.destroy();
	req.logout();
	res.redirect('/');
});
/*ตรวจว่า login หรือยัง*/
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

function isAdmin(req, res, next){
	if(req.user.isAdmin){
		return next();
	}
	res.redirect("/");
}

app.get('/regis', function(req,res){
	res.render('regis');
});
/*สมัครสมาชิก*/
app.post("/regis", function(req, res,next){
	user = { // พักข้อมูลใน user
		email : req.body.email,
		firstname : req.body.firstname,
		lastname : req.body.lastname,
		gender : req.body.gender,
		house_no : req.body.addr_house_no,
		village : req.body.addr_village,
		village_no : req.body.addr_village_no,
		lane : req.body.addr_lane,
		road : req.body.addr_road,
		province : req.body.addr_province,
		district : req.body.addr_district,
		sub_district : req.body.addr_sub_district,
		postal_code : req.body.addr_postal_code,
		contact_name : req.body.contact_name,
		phone_number : req.body.phone_number
	}

	User.register(new User({ //ลงทะเบียนข้อมูล User ใหม่ใน db User
		username: req.body.username,
		email : user.email,
		firstname : user.firstname,
		lastname : user.lastname,
		gender : user.gender,
		address : {
			house_no : user.house_no,
			village : user.village,
			village_no : user.village_no,
			lane : user.lane,
			road : user.road,
			province : user.province,
			district : user.district,
			sub_district : user.sub_district,
			postal_code : user.postal_code
		},
		contact_name : user.contact_name,
		phone : user.phone_number
	}), req.body.password1, function(err, user){ // เอา password มา hash ก่อนเก็บ
			if(err){
					console.log(err);
					return res.render('regis',{error:err.message});
			}
			passport.authenticate("local")(req, res, function(){
				req.session.save((err)=>{ //เก็บข้อมูลใน session
					if(err){
						return next(err);
					}
					res.redirect('/');
				});
			});
	});
});
/*หน้า profile ต้อง login ก่อนถึงเข้าได้*/
app.get('/user',isLoggedIn,function(req,res){
	res.render('user');
});

/*หน้าฟอร์มแก้ไขข้อมูลสมาชิก*/
app.get('/user/edit',isLoggedIn,function(req,res){
	res.render('user_edit');
});

/*แก้ไขข้อมูลสมาชิก*/
app.put('/user/:id',isLoggedIn,function(req,res){
	let update = { $set :{
				email : req.body.email,
				firstname : req.body.name,
				lastname : req.body.surname,
				gender : req.body.gender,
				address : {
					house_no : req.body.house_no,
					village : req.body.village,
					village_no : req.body.village_no,
					lane : req.body.lane,
					road : req.body.road,
					province : req.body.province,
					district : req.body.district,
					sub_district : req.body.sub_district,
					postal_code : req.body.postal_code,
				},
				contact_name : req.body.contact_name,
				phone_number : req.body.phone
			}};

	User.findByIdAndUpdate(req.params.id,update,callback);
	
	function callback(err, response){
		if(err){
			res.send(err);
		}else{
			res.redirect('/user');
		}
	}

});

/* ---admin--- */
app.get('/admin',isAdmin,function(req,res){
	res.render('ad');
});
/* หน้าจัดการข้อมูลสินค้า เป็นการเรียกตารางข้อมูลมาแสดง */
app.get('/admin/book',function(req,res){
	Product.find({},function(err,products){
		res.render('ad_book',{
			products:products
		});
		console.log("send products already!");
	});
});
/* form เพิ่มสินค้า */
app.get('/admin/book/add',function(req,res){
	res.render('ad_book_add');
});
/*เพิ่มสินค้าลง db Product*/
app.post('/admin/book/add',function(req,res){
	book_add = {
		name : req.body.inputB_Name,
		cover : req.body.inputB_Cover,
		author : req.body.inputB_Author,
		price : req.body.inputB_Price,
	  ISBN : req.body.inputB_ISBN,
		tag : req.body.inputB_Tag,
		story : req.body.inputB_Story,
		page : req.body.inputB_Page,
		date : req.body.inputB_Date
	};

	let product = new Product({
			b_name : book_add.name,
      b_cover : '/pic/cover/'+book_add.cover,
      b_author : book_add.author,
      b_price : book_add.price,
      b_ISBN : book_add.ISBN,
      b_tag : book_add.tag,
      b_story : book_add.story,
      b_page : book_add.page
		});

	product.save(function (err, product) { //บันทึกลง db
		if (err) return console.error(err);
	  });
});
/*หน้าแก้ไข แต่ยังแก้ไม่ได้ */
app.get('/admin/book/:id',function(req,res){
	Product.findById(req.params.id)
 		.then((doc)=>{
		console.log(doc);
		res.render('ad_book_edit',{product:doc});
 	}).catch((err)=>{
		console.log(err);
 	});
});

app.put('/admin/book/:id',function(req,res){
	Product.findByIdAndUpdate(req.params.id,{$set:{
			b_name : req.body.inputB_Name,
      b_author : req.body.inputB_Author,
      b_price : req.body.inputB_Price,
      b_ISBN : req.body.inputB_ISBN,
    	b_tag : req.body.inputB_Tag,
      b_story : req.body.inputB_Story,
      b_page : req.body.inputB_Page
		}},{new:true}).then((docs,err)=>{
		if(docs) {
			res.redirect('/admin/book');
		} else {
			console.log(err);
		}
	 }).catch((err)=>{
		 console.log(err);
	 });
});
/*ลบข้อมูล*/
app.delete('/admin/book/:id', function(req, res){
	Product.findByIdAndRemove({_id: req.params.id}, 
	   function(err, docs){
			 console.log(docs);
		if(err) console.log(err);
		else{
			res.redirect('/admin/book');
		}
	});
});
/* -author-*/
app.get('/admin/au',function(req,res){
	Author.find({},function(err,authors){
		res.render('ad_au',{
			authors:authors
		});
	});
});

app.get('/admin/au/add',function(req,res){
	res.render('ad_au_add');
});

app.post("/admin/au/add",function(req,res){
	author_add = {
		penname : req.body.inputA_PenName,
		name : req.body.inputA_Name,
		phone : req.body.inputA_Phone,
		email : req.body.inputA_Email,
		pic : req.body.inputA_Pic,
		interview : req.body.inputA_Interview,
	}

	let author = new Author({
			a_penname : author_add.penname,
			a_name : author_add.name,
			a_pic : '/pic/author/'+author_add.pic,
			a_phone : author_add.phone,
			a_email : author_add.email,
			a_interview : author_add.interview
	});

	author.save(function (err, author) {
		if (err) return console.error(err);
	});
});

app.get('/admin/au/:id',function(req,res){
	Author.findById(req.params.id)
 		.then((doc)=>{
		console.log(doc);
		res.render('ad_au_edit',{author:doc});
 	}).catch((err)=>{
		console.log(err);
 	});
});

app.put('/admin/au/:id',function(req,res){
	Author.findByIdAndUpdate(req.params.id,{$set:{
		a_penname : req.body.inputA_PenName,
		a_name : req.body.inputA_Name,
		a_phone : req.body.inputA_Phone,
		a_email : req.body.inputA_Email,
		a_interview : req.body.inputA_Interview	
	}},{new:true}).then((docs,err)=>{
		if(docs) {
		  res.redirect('/admin/au');
		} else {
		  console.log(err);
		}
	 }).catch((err)=>{
		 console.log(err);
	 });
});

app.delete('/admin/au/:id', function(req, res){
	Author.findByIdAndRemove({_id: req.params.id}, 
	   function(err, docs){
		if(err) console.log(err);
		else{
			console.log(docs);	
			res.redirect('/admin/au');
		}
	});
});

app.listen(2332,function(){
	console.log("Server is running on port 2332");
});
