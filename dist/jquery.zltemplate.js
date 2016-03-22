/**
 * ZLTemplate
 * Date: 2016-03-18
 * © 2016 LangZhai(智能小菜菜)
 * This is licensed under the GNU LGPL, version 3 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl.html
 * Project home: https://github.com/LangZhai/ZLTemplate
 */

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
            nestedCol,
            nested = {};
        options = options || {};
        if (data instanceof Array) {
            result = '';
            $.each(data, function (i, item) {
                result += $this.template(item, options);
            });
        } else {
            result = $this.html();
            options.rule = options.rule || /#{(.(?!#{))*[^\n\r\f\t\v\0]}/g;
            binds = result.match(options.rule);
            if (data instanceof Object && options.nested !== undefined) {
                if (options.nested instanceof Array) {
                    if (options.nested.length) {
                        options.nested = $.map(options.nested, function (item) {
                            if (!(item instanceof $)) {
                                return $(item);
                            } else
                                return item;
                        });
                    }
                } else if (typeof(options.nested) === 'string') {
                    if (options.nested.length) {
                        options.nested = $.map(options.nested.split(','), function (item) {
                            return $(item);
                        });
                    }
                } else if (options.nested instanceof $) {
                    options.nested = options.nested.map(function () {
                        return $(this);
                    });
                } else {
                    options.nested = [];
                }
                if (options.nested.length) {
                    $.each(options.nested, function (i, item) {
                        nestedCol = item.data('nested');
                        nested[item.data('alias') || nestedCol] = item.template(data[nestedCol], options);
                    });
                }
            }
            $.each(binds, function (i, item) {
                val = item.substring(2);
                val = 'val=' + val.substring(0, val.length - 1).replaceAll('&amp;', '&').replaceAll('&gt;', '>').replaceAll('&lt;', '<');
                try {
                    eval(val);
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