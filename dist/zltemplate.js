/**
 * ZLTemplate 2.0.0
 * Date: 2017-05-17
 * © 2016-2017 LangZhai(智能小菜菜)
 * This is licensed under the GNU LGPL, version 3 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl.html
 * Project home: https://github.com/LangZhai/ZLTemplate
 *
 * ==========更新历史==========
 * -2017-05-17    2.0.0-
 *   1.【Update】不再依赖jQuery。
 *
 * -2017-02-13    1.0.5-
 *   1.【Debug】修复字符实体编码BUG。
 *
 * -2016-09-07    1.0.4-
 *   1.【Update】data-nested支持多级对象属性；
 *   2.【Debug】防止JS注入。
 *
 * -2016-07-14    1.0.2-
 *   1.【Add】添加last标识。
 *
 * -2016-05-05    1.0.1-
 *   1.【Add】添加index标识。
 *
 * -2016-04-01    1.0.0-
 *   1.【Add】ZLTemplate诞生。
 */

Object.extend = function () {
    var args,
        deep;
    if (typeof arguments[0] === 'boolean') {
        args = [].slice.call(arguments, 1);
        deep = arguments[0];
    } else {
        args = [].slice.call(arguments);
    }
    args.forEach(function (obj) {
        if (obj instanceof Object) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    args[0][key] = deep ? Object.extend(deep, {}, obj[key]) : obj[key];
                }
            }
        } else {
            args[0] = obj;
        }
    });
    return args[0];
};

Object.encodeEntity = function (obj) {
    if (obj instanceof Object) {
        obj = Object.extend(obj instanceof Array ? [] : {}, obj);
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = Object.encodeEntity(obj[key]);
            }
        }
    } else if (typeof obj === 'string') {
        obj = obj.replaceAll(/&(?!(\S(?!&))+;)/, '&amp;').replaceAll('>', '&gt;').replaceAll('<', '&lt;').replaceAll('"', '&quot;').replaceAll('\'', '&#39;');
    }
    return obj;
};

Object.decodeEntity = function (obj) {
    if (obj instanceof Object) {
        obj = Object.extend(obj instanceof Array ? [] : {}, obj);
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = Object.decodeEntity(obj[key]);
            }
        }
    } else if (typeof obj === 'string') {
        obj = obj.replaceAll('&amp;', '&').replaceAll('&gt;', '>').replaceAll('&lt;', '<').replaceAll('&quot;', '"').replaceAll('&#39;', '\'');
    }
    return obj;
};

Object.getVal = function (obj, key) {
    key.split('.').some(function (item) {
        return (obj = obj[item]) === undefined;
    });
    return obj;
};

String.prototype.replaceAll = function (reallyDo, replaceWith, ignoreCase) {
    if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
        return this.replace(new RegExp(reallyDo, (ignoreCase ? 'gi' : 'g')), replaceWith);
    } else {
        return this.replace(reallyDo, replaceWith);
    }
};

(function () {
    var ZLTemplate = function (selector) {
        return new ZLTemplate.prototype.init(selector);
    };

    ZLTemplate.prototype.init = function (selector) {
        if (typeof selector === 'string') {
            var nodes = document.querySelectorAll(selector);
            Object.extend(this, nodes);
            this.length = nodes.length;
            return this;
        } else if (selector.nodeType) {
            this[0] = selector;
            this.length = 1;
            return this;
        }
        return selector;
    };

    /**
     * 填充内容模板
     * @param  data  {Object}    JSON数据
     * @param  options  {Object}    参数列表
     * @return  result  {String}    填充结果
     * @example
     * ZLTemplate('#template').template(data,{
     * 	   nested:嵌套内容模板,
     * 	   clean:是否清除未填充节点,
     * 	   rule:正则查询规则
     * });
     */
    ZLTemplate.prototype.template = function (data, options) {
        var _this = this,
            binds,
            val,
            result,
            index,
            last,
            nestedCol,
            nested = {};
        options = options || {};
        index = options.index || 0;
        last = options.last === undefined || options.last;
        if (data instanceof Array) {
            result = '';
            data.forEach(function (item, i) {
                result += _this.template(item, Object.extend({}, options, {index: i, last: i === data.length - 1}));
            });
        } else {
            result = this[0].innerHTML;
            options.rule = options.rule || /#{(.(?!#{))*[^\n\r\f\t\v\0]}/g;
            binds = result.match(options.rule);
            data = Object.encodeEntity(data);
            if (data instanceof Object && options.nested !== undefined) {
                if (options.nested instanceof Array) {
                    options.nested = options.nested.map(function (item) {
                        if (!(item instanceof ZLTemplate)) {
                            return ZLTemplate(item);
                        } else
                            return item;
                    });
                } else if (typeof options.nested === 'string') {
                    options.nested = options.nested.length ? options.nested.split(',').map(function (item) {
                        return ZLTemplate(item);
                    }) : [];
                } else if (options.nested instanceof ZLTemplate) {
                    options.nested = [].map.call(options.nested, function (item) {
                        return ZLTemplate(item);
                    });
                } else {
                    options.nested = [];
                }
                options.nested.forEach(function (item) {
                    nestedCol = item[0].dataset.nested;
                    nested[item[0].dataset.alias || nestedCol] = item.template(Object.getVal(data, nestedCol), options);
                });
            }
            binds.forEach(function (item) {
                val = item.substring(2);
                try {
                    val = eval(Object.decodeEntity(val.substring(0, val.length - 1)));
                } catch (err) {
                    val = undefined;
                }
                if (val !== undefined) {
                    result = result.replace(item, val);
                } else if (options.clean === undefined || options.clean) {
                    result = result.replace(item, '');
                }
            });
        }
        return result;
    };

    ZLTemplate.prototype.init.prototype = ZLTemplate.prototype;
    window.ZLTemplate = ZLTemplate;
}());