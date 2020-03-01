module.exports = function(db,callback){
	// ç”¨æˆ·æ¨¡åž‹
	db.define("RoleModel",{
		role_id : {type: 'serial', key: true},
		role_name : String,
		ps_ids : String,
		ps_ca : String,
		role_desc : String
	},{
		table : "sp_role"
	});
	return callback();
}