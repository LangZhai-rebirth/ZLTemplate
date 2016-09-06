/**
 * ZLTemplate 1.0.4
 * Date: 2016-09-06
 * © 2016 LangZhai(智能小菜菜)
 * This is licensed under the GNU LGPL, version 3 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl.html
 * Project home: https://github.com/LangZhai/ZLTemplate
 *
 * ==========更新历史==========
 * -2016-09-06    1.0.4-
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

Object.encodeEntity = function (obj) {
    if (obj instanceof Object) {
        $.each(Object.keys(obj), function (i, item) {
            obj[item] = Object.encodeEntity(obj[item]);
        });
    } else if (typeof obj === 'string') {
        obj = obj.replaceAll('&', '&amp;').replaceAll('>', '&gt;').replaceAll('<', '&lt;').replaceAll('"', '&quot;').replaceAll('\'', '&#x27;');
    }
    return obj;
};

Object.getVal = function (obj, key) {
    $.each(key.split('.'), function (i, item) {
        obj = obj[item];
        if (obj === undefined) {
            return false;
        }
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

(function ($) {
    /**
     * 填充内容模板
     * @param  data  {Object}    JSON数据
     * @param  options  {Object}    参数列表
     * @return  result  {String}    填充结果
     * @example
     * $('#template').template(data,{
     * 	   nested:嵌套内容模板,
     * 	   clean:是否清除未填充节点,
     * 	   rule:正则查询规则
     * });
     */
    $.fn.template = function (data, options) {
        var $this = $(this),
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
            $.each(data, function (i, item) {
                result += $this.template(item, $.extend({}, options, {index: i, last: i === data.length - 1}));
            });
        } else {
            result = $this.html();
            options.rule = options.rule || /#{(.(?!#{))*[^\n\r\f\t\v\0]}/g;
            binds = result.match(options.rule);
            data = Object.encodeEntity(data);
            if (data instanceof Object && options.nested !== undefined) {
                if (options.nested instanceof Array) {
                    options.nested = $.map(options.nested, function (item) {
                        if (!(item instanceof $)) {
                            return $(item);
                        } else
                            return item;
                    });
                } else if (typeof options.nested === 'string') {
                    options.nested = options.nested.length ? $.map(options.nested.split(','), function (item) {
                        return $(item);
                    }) : [];
                } else if (options.nested instanceof $) {
                    options.nested = options.nested.map(function () {
                        return $(this);
                    });
                } else {
                    options.nested = [];
                }
                $.each(options.nested, function (i, $item) {
                    nestedCol = $item.data('nested');
                    nested[$item.data('alias') || nestedCol] = $item.template(Object.getVal(data, nestedCol), options);
                });
            }
            $.each(binds, function (i, item) {
                val = item.substring(2);
                try {
                    val = eval(val.substring(0, val.length - 1).replaceAll('&amp;', '&').replaceAll('&gt;', '>').replaceAll('&lt;', '<'));
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
}($));