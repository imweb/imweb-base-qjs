/**
 * @es6
 */
var huatuo = require('huatuo'), //华佗测速
    monitor = require('tx-monitor').monitor, //monitor上报
    tdw = require('imweb-report'),
    badjs = require('badjs-report');

const isd = {
        'page_start': 34, //页面开始时间
        'page_css_ready': 35, //css加载完成
        'page_js_ready': 36, //第三方js加载完成
        'page_main_start': 37, //主逻辑加载
        'page_main_end': 38, //主逻辑结束
        'page_render_end': 39, //全部render 完成
        'page_render_fp': 40 //首屏render 完成
    },
    isdArray = Object.keys(isd);

$.extend(true, huatuo.cfg, {
    isd: isd,
    appid: 10061
});

var handler = {

}

class Report {
    constructor() {                
        
    }

    _init(controller) {
        this.controller = controller; 
        this.monitor = monitor;
        this.badjs = badjs;

        this.init();
        this.sendHuatuo && this.sendHuatuo();
        this._bindEvent && this._bindEvent();
    }
    
    init() {        
        
    }
    
    sendHuatuo() {
        //华佗上报打点
        const _TArray = window._T;

        if (_TArray) {
            //循环数据，上报打点
            for (var i = 0, j = isdArray.length; i < j; i++) {
                var t = _TArray[i + 1] || +new Date();
                
                huatuo.push(isdArray[i], t);                
            }
        }
        
        // report
        huatuo.report(isdArray, {
            delay: 50
        });
    }
    
    /**
     *  修改华佗配置 
     * 
    */
    setHuatuoConfig(config) {
        $.extend(true, huatuo.cfg, config);
    }

    /**
     * 修改tdw配置
     */
    setTdwConfig(param) {
        this.param = param || {};
        var args = [].slice.call(arguments);
        args[0] = {};
        tdw.config.apply(tdw, args);        
    }

    tdwReport(param) {
        param = $.extend(true, {}, this.param || {}, param || {});
        var args = [].slice.call(arguments);
        args[0] = param;
        tdw.tdw.apply(tdw, args);
    }
}

Report.config = function (config) {
    //tdw配置
    if (config.tdw) {
        var tdwConfig = config.tdw;
        tdw.config(tdwConfig.config, false, tdwConfig.table);
    }

    //badjs配置
    if (config.badjs) {
        config.badjs.onReport = function () {
            monitor(config.badjs.monitorId);
        }
        
        badjs.init(config.badjs);
    }

    //monitor配置
    if (config.monitor) {
        monitor(config.monitor);
    }

    //华佗配置
    if (config.huatuo) {
        $.extend(true, huatuo.cfg, config.huatuo);
    }
}

module.exports = Report;
