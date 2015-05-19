/**
* @module framework.router
* @version 1.1
* @requires module:jquery
* @requires module:underscore
* @requires module:backbone
*/
define(['jquery',
'underscore',
'backbone'],
function ($, _, Backbone) {
    //--------------------------------------------------------------------------------------------
    //Router功能，在Backbone Router功能上扩展
    //目标：Router功能可以对多个不同页面模块兼容和“并发”
    //1.可以注册Backbone.View和参数的关系到Router上，也可以注销已经注册的关系。
    //2.当URL参数变化时，调用对应View的
    //3.当参数变化时，可以自动生成URL

    var root = this;
    var previousRouter = root.Router;
    if (!_.isUndefined(previousRouter)) {
        return previousRouter;
    }
    var Router;
    var eipRouter = Backbone.Router.extend({
        routes: { '*routeInfo': "routeFunction" },
        routeFunction: function (routeInfo) {
            _context._trigger(routeInfo);
        }
    });

    var _context = {
        //Use Backbone.Router
        _router: new eipRouter(),

        _lastRouteValue: "",

        //main table info of key
        _routeTable: {},

        //deleted Relation List
        _deletedRelationList: [],

        _routeChanged: function (keyValues) {
            $.each(keyValues, function (i, n) {
                n.Name = n.Name.toLowerCase();
            });
            return JSON.stringify(keyValues.sort(function (a, b) { return a.Name.localeCompare(b.Name); })) != this._lastRouteValue;
        },

        _getKeyValueFromRouteInfo: function (routeInfo) {
            var keyValues = [];
            if (routeInfo != "") {
                var routeSplitInfo = $.grep(routeInfo.split(";"), function (n, i) { return n != ""; });

                $.each(routeSplitInfo, function (i, n) {
                    if (n.indexOf('=') == n.lastIndexOf('=') && n.indexOf('=') != -1) {
                        keyValues.push({
                            Name: n.substring(0, n.indexOf('=')).toLowerCase(),
                            Value: n.substring(n.indexOf('=') + 1)
                        });
                    }
                });
            }
            return keyValues;
        },

        //deel the rout info change
        _trigger: function (routeInfo) {
            if (routeInfo == null) {
                routeInfo = "";
            }
            var keyValues = this._getKeyValueFromRouteInfo(routeInfo);

            if (this._routeChanged(keyValues)) {
                Router.setParams(keyValues, [], true);
                if (_.isFunction(Router.globalRouterCheck)) {
                    Router.globalRouterCheck();
                }
            }
        },

        // if there still any deleted relation exsits, and it to the Paras View Relation table
        _rebirthRelation: function (paraName) {
            _context._gc4deletedRelationList();
            var foundid = [];
            $.each(_context._deletedRelationList, function (i, n) {
                if (n.Para == paraName && Router._isInDomNow(n.View)) {
                    foundid.push(i);
                }
            });
            var spliceIndexs = [];

            foundid = _.sortBy(foundid, function (num) {//倒序排序
                return -num;
            });
            var ret = [];
            $.each(foundid, function (i, n) {
                var view = _context._deletedRelationList[n].View;
                ret.push(view);
                _context._routeTable[paraName].Views.push(view);
                _context._deletedRelationList.splice(n, 1);
            });
            return ret;
        },

        //garbage collection for routeTable
        _gc4RouteTable: function () {
            $.each(_context._routeTable, function (i1, n1) {
                for (var i2 = n1.Views.length - 1; i2 >= 0; i2--) {
                    if (!Router._isInDomNow(n1.Views[i2])) {
                        n1.Views.splice(i2, 1);
                    }
                }
            });
        },

        //garbage collection for deletedRelationList
        _gc4deletedRelationList: function () {
            _context._deletedRelationList = $.grep(_context._deletedRelationList, function (n, i) {
                return Router._isInDomNow(n.View);
            });
        },

        //check if a view in any table yet
        _isTheViewinUse: function (view) {

            var found = false;
            $.each(this._routeTable, function (i, n) {
                found = found || n.Views.indexOf(view) >= 0;
                return !found;
            });
            if (found) return found;
            $.each(this._deletedRelationList, function (i, n) {
                found = found || n.View === view;
                return !found;
            });
            return found;
        },

        // private method encoding
        _encode: function (str) {
            var ret = "";
            for (var i = 0; i < str.length; i++) {
                ret = (i % 2 == 0) ? (ret + String.fromCharCode((str.charCodeAt(str.length - 1 - i) + str.length + i - 32) % 94 + 32)) :
                (String.fromCharCode((str.charCodeAt(str.length - 1 - i) + str.length + i - 32) % 94 + 32) + ret);
            }
            return ret;
        },

        // private method decoding
        _decode: function (str) {
            var ret = "";
            var j = Math.ceil(str.length / 2) - 1;
            for (var i = 0; i < str.length; i++) {
                ret = (i % 2 == 0) ? (String.fromCharCode((str.charCodeAt(j - Math.ceil(i / 2)) - str.length - i + 188 - 32) % 94 + 32) + ret) :
                (String.fromCharCode((str.charCodeAt(j + Math.ceil(i / 2)) - str.length - i + 188 - 32) % 94 + 32) + ret);
            }
            return ret;
        }
    };

    if (typeof exports !== 'undefined') {
        Router = exports;
    } else {
        Router = root.Router = {

            VERSION: '1.1.0',

            noConflict: function () {
                root.Router = previousRouter;
                return this;
            },

            /**Register the View and Paras Relationship to Router
            参数：
            view: Backbone.View的实例。该实例需要扩展routerChanged方法来处理routerChanged的消息通知。同时需要确保el属性绑定到当前页面上某些Dom组件。
            keys: 字符串数组，要绑定的参数的名称的数组，可以有1或多个元素。如果数组有多个元素，这这些参数中的任何一个发生变化，注册的view实例都会得到Router的通知。
            返回值：无
            这是使用Router的第一个函数，通过这个函数把View和参数注册到Router上。
            注册以后有以下两种情况会取消关联关系：
            • 当view的el在domTree中消失时，这个注册的关联关系会被自动回收。
            • 当用户手动调用以下函数时：DeleteParams，UnRegist，或SetParams中指定了deleteKeys, deleteAllOtherKeys参数时。*/

            register: function (view, paras) {
                paras = $.map(paras, function (n, i) {
                    return n.toLowerCase();
                });
                //garbage collect first
                _context._gc4RouteTable();

                //build Paras Views Relation
                $.each(paras, function (i, paraKey) {
                    //exist Param
                    if (!_.isUndefined(_context._routeTable[paraKey])) {

                        if (_.indexOf(_context._routeTable[paraKey].Views, view) == -1) {
                            _context._routeTable[paraKey].Views.push(view);
                        }
                    }
                    else {
                        // if the View is new, add the View to Relations and callback to the view
                        var exsit = false;
                        $.each(_context._deletedRelationList, function (i2, n2) {
                            exsit = (i2 == paraKey) && (n2 === view);
                            return !exsit;
                        });
                        if (!exsit) {
                            _context._deletedRelationList.push({ Para: paraKey, View: view });
                        }
                    }
                });
            },

            //Get some value of the Router Key
            getParam: function (key) {
                key = key.toLowerCase();
                if (!_.isUndefined(_context._routeTable[key])) {
                    return _context._routeTable[key].Value;
                }
            },

            /**
            key: 字符串。要设置的参数名
            value: 字符串。要设置的参数的值
            返回值：无
            这是setParams的简化形式，在只设置一个参数的值的场景使用，相当于：
            setParams([{ Name: key, Value: value }]);
            */
            setParam: function (key, value) {
                this.setParams([{ Name: key, Value: value }]);
            },

            /**keyValues:形如[{Name:"X1",Value:"Y1"},{Name:"X1",Value:"Y2"}...]的键值对，用户设置Param
            deleteKeys/keepKeys:参数名称数组，可选，用于要删除的Param
            deleteAllOtherKeys:bool值，可选，如为True，则删除所有keyValue和keepKeys以外的Param
            keyValues: 键值对的数组。形如[{Name:"X1",Value:"Y1"},{Name:"X1",Value:"Y2"}]，当数组元素只有Name属性而没有Value属性时，则不会对这个参数进行赋值。
            （这种语法主要用于确定要保留的Key的基础上删除其他Key，例如：
            Router.setParams([{ Name: "Region", Value: "TW" }，{ Name: "Site"}], [], true);
            表示将Region设为“TW”，保留Site，其他的都删除。
            ）
            deleteKeys: 字符串数组，指定要删除的键的名称，相当于调用Router.DeleteParams(deleteKeys)。可选参数。
            deleteAllOtherKeys: bool值，如果为True，则删除除了keyValues中的所有参数。可选参数。
            当需要使用代码设置Router中参数的值时，可以使用这个函数。它同时可以再设置参数的同时删除其他的一些或者全部参数。
            返回值：无*/
            setParams: function (keyValues, deleteKeys, deleteAllOtherKeys) {
                $.each(keyValues, function (i, n) {
                    n.Name = n.Name.toLowerCase();
                });

                _context._gc4RouteTable();
                if (_.isUndefined(deleteKeys)) {
                    deleteKeys = [];
                }

                var viewToCallback = [], setKeys = [];
                $.each(keyValues, function (i, n) {
                    setKeys.push(n.Name);
                    if (!_.isUndefined(n.Value)) {
                        if (_.isUndefined(_context._routeTable[n.Name])) {
                            _context._routeTable[n.Name] = {
                                Value: n.Value,
                                Views: [],
                                Created: $.now()
                            };
                            viewToCallback = _.union(viewToCallback, _context._rebirthRelation(n.Name));
                        }
                        else {
                            if (n.Value != _context._routeTable[n.Name].Value) {
                                _context._routeTable[n.Name].Value = n.Value;
                                viewToCallback = _.union(viewToCallback, _context._routeTable[n.Name].Views);
                            }
                        }
                    }
                });

                //如果要删除除了指定的参数以外的所有参数

                if (deleteAllOtherKeys === true) {
                    deleteKeys = _.union(deleteKeys, _.difference(_.keys(_context._routeTable), setKeys));
                }
                viewToCallback = _.union(viewToCallback, Router.deleteParams(deleteKeys, false));
                viewToCallback = _.uniq(viewToCallback);

                $.each(viewToCallback, function (i, n) {
                    //check if the view is still in any table
                    if (_context._isTheViewinUse(n) && Router._isInDomNow(n)) {
                        if (!_.isUndefined(n.routerChanged)) {
                            if (_.isFunction(n.routerChanged)) {
                                n.routerChanged();
                            }
                        }
                    }
                });
                delete viewToCallback;
            },

            //delete the special route keys
            //deleteKeys:["key1","key2"..."keyn"]
            deleteParams: function (deleteKeys, riseEvent) {
                if (_.isUndefined(riseEvent)) {
                    riseEvent = true;
                }
                deleteKeys = $.map(deleteKeys, function (n, i) {
                    return n.toLowerCase();
                });
                var viewToCallback = [];
                $.each(deleteKeys, function (i, n) {
                    if (_context._routeTable[n]) {
                        $.each(_context._routeTable[n].Views, function (i1, n1) {
                            //if the view related to key is exsit in dom
                            if (Router._isInDomNow(n1)) {
                                var exsit = false;
                                $.each(_context._deletedRelationList, function (i2, n2) {
                                    exsit = (i2 == n) && (n2 === n1.el);
                                    return !exsit;
                                });
                                //and not in deletedRelationList yet
                                if (!exsit) {
                                    //add to deletedRelationList
                                    _context._deletedRelationList.push({ Para: n, View: n1 });
                                    //and to call back it
                                    viewToCallback.push(n1);
                                }
                            }
                        });
                        delete _context._routeTable[n];
                    }
                });

                Router.navigate();

                viewToCallback = _.uniq(viewToCallback);

                if (!riseEvent) {
                    return viewToCallback;
                }

                $.each(viewToCallback, function (i, n) {
                    //check if the view is still in any table
                    if (_context._isTheViewinUse(n) && Router._isInDomNow(n)) {
                        if (!_.isUndefined(n.routerChanged)) {
                            if (_.isFunction(n.routerChanged)) {
                                n.routerChanged();
                            }
                        }
                    }
                });
                return viewToCallback;
            },

            //change the route info in url
            navigate: function (newUrl) {
                //if not support the new url, auto generate the new url route info
                if (_.isUndefined(newUrl) || newUrl == null) {
                    newUrl = "";
                    var tmp = [];
                    $.each(_context._routeTable, function (i, n) {
                        if (n.Value != null) {
                            newUrl += i + "=";
                            newUrl += n.Value;
                            newUrl += ";"
                            tmp.push({
                                Name: i,
                                Value: n.Value
                            });
                        }
                    });
                    newUrl = newUrl.substr(0, newUrl.length - 1);

                    //如果没变，就不再navigate

                    //记入_lastRouteValue
                    _context._lastRouteValue = JSON.stringify(tmp.sort(function (a, b) { return a.Name.localeCompare(b.Name); }))
                    //new code
                    if (JSON.stringify(tmp.sort(function (a, b) { return a.Name.localeCompare(b.Name); })) ==
                    JSON.stringify(_context._getKeyValueFromRouteInfo(window.location.hash.substr(1))
                    .sort(function (a, b) { return a.Name.localeCompare(b.Name); }))) {
                        return;
                    }
                }
                //_context._router.navigate(_context._encode(newUrl));
                _context._router.navigate(newUrl);
                if (_.isFunction(Router.globalRouterCheck)) {
                    Router.globalRouterCheck();
                }
            },

            //UnRegister a View from Router
            /**View: Backbone.View实例。
            返回值：无
            函数将把该View在Router中注销的所有信息注销，是register的反动作。
            注销并不会影响View本身。
            注销后，关联关系任何时候都不会自动恢复*/
            unRegister: function (view) {
                $.each(_context._routeTable, function (i1, n1) {
                    n1.Views = $.grep(n1.Views, function (n2, i2) {
                        return !(view === n2);
                    });
                });

                _context._deletedRelationList = $.grep(_context._deletedRelationList, function (i, n) {
                    return !(n.View === view);
                });

            },

            globalRouterCheck: null,

            //返回指定的View是否还存在
            _isInDomNow: function (view) {
                if (_.isElement(view.el)) return $.contains(document.body, view.el);
                if (_.isString(view.el)) return $("body " + view.el).length > 0;
                return false;
            }
        }
        Backbone.history.start({ pushstate: true });
    }



    return Router;
});