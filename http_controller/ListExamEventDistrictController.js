/**
 * Created by tanmv on 26/02/2018.
 */

'use strict';

const logger = require('tracer').colorConsole(),
    async = require('async'),
    express = require('express'),
    util = require('../util/util');
let UsersModel = require('../model/UsersModel'),
    router = express.Router();

router.get('/', function(req, res) {
    const DbUtil = req.DbUtil;
    try{
        let param_render = {};
        param_render.title='Danh sách thi huyện - Trạng Nguyên';

        async.parallel([
            (callback) => {
                DbUtil.GetListProvince((err, list) => {
                    param_render.provinces = list;
                    callback(null, list);
                });
            }
        ], () => {
            res.render('list-exam-event-district', param_render);
        });
    }
    catch(e){
        logger.error(e.stack);
    }
});

router.post('/', function(req, res) {
    try{
        let province_id = util.parseInt(req.body.province_id);
        let district_id = util.parseInt(req.body.district_id);
        let class_id = util.parseInt(req.body.class_id);

        if(province_id > 0) {
            let where = {
                exam_district: true,
                province_id
            };
            if (district_id > 0) where.district_id = district_id;
            if (class_id > 0 && class_id <= 5) where.class_id = class_id;
            UsersModel.find(where)
            .select('_id name class_id class_name birthday school_name district_name province_name')
            .exec((err, list_user) => {
                if (err) {
                    logger.error(err);
                    res.json({
                        error: 20000,
                        message: 'server đang bận, vui lòng thử lại sau'
                    });
                }
                else {
                    res.json({
                        error: 0,
                        message: '',
                        users: list_user
                    });
                }
            });
        }
        else{
            res.json({
                error: 1,
                message: 'hãy nhập đủ dữ liệu'
            });
        }
    }
    catch(e){
        logger.error(e.stack);
    }
});

module.exports = router;