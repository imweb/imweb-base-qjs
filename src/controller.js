/**
 * @es6
 */
const Q = require('imweb-qjs'),       
      _ = Q._;

/**
 * component初始化工具
 */
let Component = function () {
    let isInitComponent = false;

    return {
        _initSingle (el, opts) {
            opts.el = el;
            return Q.all(opts);
        },

        init () {
            var self = this;

            if (!isInitComponent) {
                isInitComponent = true;
                var components = window._components || {},
                    comp;

                for (var name in components) {
                    if (components.hasOwnProperty(name)) {
                        comp = components[name];
                        comp.module = require(comp.js);
                        Q.define(name, comp.module);
                    }
                }
                
                for (var name in components) {
                    if (components.hasOwnProperty(name)) {
                        comp = components[name];                
                        if (comp.child) {
                            comp.module.init 
                                ? comp.module.init() 
                                : self._initSingle('.component-' + comp.uid, comp.module);
                        }
                    }
                } 
            }
        }
    }
}();

let Third = function () {
    let pool = {};

    function key(k, value) {
        if (value === undefined) {
            return pool[k];
        }
        pool[k] = value;
    }

    function data(el, inst) {
        el = typeof el === 'string' ? _.find(el)[0] : el;
        return _.data(el, 'third-inst', inst);
    }

    function _Third(el, opts, q) {        
        el = typeof el === 'string' ? _.find(el)[0] : el;
        this.el = el;
        // if q is undefined, just mock a ViewModel
        this.vm = q || new Q();
        // just extend options all methods
        _.extend(this, opts);
        // cache the instance
        data(el, this);
        this.bind();
    }
    _.extend(_Third, {
        key: key,
        get: data,
    });

    return _Third;
}();


class Controller {
    constructor() {
        
    }
    
    _init(model) {
        this.COMPONENTREG = /([^.]*)(\.([^.]*))*/;
        this.REFREG = /^[A-Za-z]+$/;

        this.model = model;
        
        Component.init();
        
        this._refreshComponents();
        
        this._refreshThirdComponents();            
        
        this._bindEvent && this._bindEvent();        
        
        // auto run report next tick
        this.report && _.nextTick(function () {
            this.report._init(this);
        }, this);
    }
    
    /**
     * 绑定事件
     * @return {[type]} [description]
     */
    _bindEvent () {

    }

    //循环components，给this赋值
    _refreshComponents() {
        var self = this,
            components = this.components;

        if (components) {
            Object.keys(components).forEach(function (x) {
                var arr = components[x].match(self.REFREG);

                if (arr) {
                    self[x] = self.model.$[arr[0]];
                } else {
                    arr = components[x].match(self.COMPONENTREG);
                    if (arr) {
                        var vm = Q.get(arr[1]);

                        self[x] = arr[3] ? vm.$[arr[3]] : vm;
                    }
                }
            });
        }
    }
    
    //循环thirdComponents，给this赋值
    _refreshThirdComponents () {
        var self = this,
            components = this.thirdComponents;
        if (components) {
            Object.keys(components).forEach(function (x) {
                var arr = components[x].match(self.COMPONENTREG);

                if (arr) {
                    var vm = Third.get(arr[1]);

                    self[x] = arr[3] ? vm.$[arr[3]] : vm;
                }
            });
        }

    }

    init() {
        
    }
}

module.exports = Controller;
