# [ZLTemplate](https://github.com/LangZhai-rebirth/ZLTemplate) [![GitHub](https://img.shields.io/github/license/LangZhai-rebirth/ZLTemplate)](https://github.com/LangZhai-rebirth/ZLTemplate/blob/master/LICENSE)

## 这是啥

一款轻量级JavaScript模板引擎。

## 能干啥

填充模板，支持无限循环嵌套及灵活的传参方式。

## 怎么用

引入JS：

```html
<!DOCTYPE HTML>
<html>
    <head>
        <title>ZLTemplate by LangZhai(智能小菜菜)</title>
    </head>
    <body>
        <!--为了使页面加载更快，最好将JS放置在<body>的末尾-->
        <script src="zltemplate.min.js"></script>
    </body>
</html>
```

定义模板：

```html
<!--填充目标-->
<div id="target" style="background:#272822;color:#f8f8f2;padding:1em;margin:.5em 0;overflow:auto;border-radius:.3em;"></div>

<!--主模板-->
<script type="text/html" id="template">
    <h1>#{data.title}</h1>
    <p>#{data.desc}</p>
    #{data.item === undefined ? '' : '<ul>' + nested.item + '</ul>'}
    #{data.attr === undefined ? '' : '<p>' + data.attr.desc + '</p>' + (data.attr.list === undefined ? '' : '<ul>' + nested.prop + '</ul>')}
</script>

<!--嵌套模板-->
<script type="text/html" id="template_item" data-nested="item">
    <li>
        <p>(Line #{index}) #{data.id}----#{data.name}</p>
        #{data.item === undefined ? '' : '<ul>' + nested.item + '</ul>'}
    </li>
</script>

<!--嵌套模板2-->
<script type="text/html" id="template_attr" data-nested="attr.list" data-alias="prop">
    <li>#{data.key}:#{data.value}</li>
</script>
```

填充模板：

```javascript
var data = {
    title: '标题',
    desc: '描述',
    item: [
        {
            id: 1,
            name: '我是子级'
        },
        {
            id: 2,
            name: '我是子级',
            item: [
                {
                    id: 21,
                    name: '我是子级的子级'
                },
                {
                    id: 22,
                    name: '我是子级的子级'
                }
            ]
        },
        {
            id: 3,
            name: '我是子级'
        }
    ],
    attr: {
        desc: '属性',
        list: [
            {
                key: 'name',
                value: '乔治'
            },
            {
                key: 'sex',
                value: '男'
            }
        ]
    }
};
document.querySelector('#target').innerHTML = ZLTemplate('#template').template(data, {nested: '#template_item,#template_attr'});
```

填充效果：

```html
<h1>标题</h1>
<p>描述</p>
<ul>
    <li>
        <p>(Line 0) 1----我是子级</p>
    </li>
    <li>
        <p>(Line 1) 2----我是子级</p>
        <ul>
            <li>
                <p>(Line 0) 21----我是子级的子级</p>
            </li>
            <li>
                <p>(Line 1) 22----我是子级的子级</p>
            </li>
        </ul>
    </li>
    <li>
        <p>(Line 2) 3----我是子级</p>
    </li>
</ul>
<p>属性</p>
<ul>
    <li>name:乔治</li>
    <li>sex:男</li>
</ul>
```

参数定义：

```javascript
ZLTemplate('#template').template(data, {
    //嵌套内容模板，支持传入Element对象(单个或数组)/选择器字符串(单个或数组)
    nested: ['#template_item', '#template_attr', ZLTemplate('#template1'), ZLTemplate('#template2')]
    //是否清除未填充节点
    clean: true,
    //正则查询规则
    rule: /#{(.(?!#{))*[^\n\r\f\t\v\0]}/g
});
```

## 防注入

定义模板：

```html
<!--填充目标-->
<div id="injection" style="background:#272822;color:#f8f8f2;padding:1em;margin:.5em 0;overflow:auto;border-radius:.3em;"></div>

<!--主模板-->
<script type="text/html" id="template_injection">
    <h1>#{data.title}</h1>
    <p>#{data.codeA}</p>
    <p>#{data.codeB}</p>
    <p>#{data.codeC}</p>
</script>
```

填充模板：

```javascript
var data = {
    title: '防注入测试',
    codeA: 'alert(\'注入成功！\');',
    codeB: '<script>location.href = \'https://langzhai-rebirth.github.io/\';</script>',
    codeC: '<script>$(\'body\').remove();</script>'
};
document.querySelector('#injection').innerHTML = ZLTemplate('#template_injection').template(data);
```

填充效果：
```html
<h1>防注入测试</h1>
<p>alert('注入成功！');</p>
<p>&lt;script&gt;location.href = 'https://langzhai-rebirth.github.io/';&lt;/script&gt;</p>
<p>&lt;script&gt;$('body').remove();&lt;/script&gt;</p>
```

## 依赖库

从ZLTemplate 2.0.0开始不再依赖jQuery。