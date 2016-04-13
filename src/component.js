/**
 * @es6
 */
const Q = require('imweb-qjs');       

var base = {
    data: {
        // 默认是否显示属性
        isShow: false        
    },

    methods: {
        //显示
        show() {
            this.$set('isShow', true);
        },

        //隐藏
        hide() {
            this.$set('isShow', false);
        },

        /**
         * 对所有子模块发送事件
         * @param {String} event
         * @param {...Object} args 
         */
        dispatchAll() {
            var args = [].slice.call(arguments);
            this._children.forEach(function(child) {
                child.$emit.apply(child, args);
            });
        },

        /**
         * 调用子模块特定方法
         * @param {String} name
         * @param {...Object} args 
         */
        callAll(name) {
            var args = [].slice.call(arguments, 1);
            this._children.forEach(function(child) {
                child[name] && child[name].apply(child, args);
            });
        }
    },

    ready() {
        let options = this.$options,
            components = options.components || {};
        for (var name in components) {
            if (components.hasOwnProperty(name)) {
                this[name] = Q.get(components[name]);
            }
        }
        
        if (options._Controller) { 
            let ins = new options._Controller();
            ins.init(this);            
        }
    }
};

module.exports = {
    base: base, // modify it to set global base

    extend: function (opt) {
        var base = this.base || base,
            merge = {};

        ['methods', 'filters', 'directives', 'data'].forEach(function(p) {
            merge[p] = $.extend({}, base[p] || {}, opt[p] || {});
        });

        // set ready
        merge.ready = function() {
            base.ready && base.ready.apply(this, arguments);
            opt.ready && opt.ready.apply(this, arguments);
        };

        return $.extend({}, base, opt, merge);
    }
};

