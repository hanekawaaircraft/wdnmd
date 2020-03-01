module.exports = function(db,callback){
	// ç”¨æˆ·æ¨¡åž‹
	db.define("OrderGoodModel",{
		id : {type: 'serial', key: true},
		order_id : Number,
		goods_id : Number,
		goods_price : Number,
		goods_number : Number,
		goods_total_price : Number
	},{
		table : "sp_order_goods"
	});
	return callback();
}