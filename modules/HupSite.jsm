/*global Components: true */
var scope = {};
var HupSite = function (doc) {
    this.doc = doc;
    Components.utils.import('resource://huppermodules/prefs.jsm', scope);
    this.prefs = new scope.HP();
    Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
    this.elementer = new scope.Elementer(this.doc);
};
HupSite.prototype = {
    init: function () {
        this.setStyles();
        this.createBlockMenus();
        if (this.hasComments()) {
            this.parseComments();
            this.addNewCommentsNotifier();
        } else {
            this.getNodes();
            return;
            this.parseNodes();
            this.addNewNodeNotifier();
        }
        this.setBlocks();
        this.setUnlimitedLinks();
    },
    setUnlimitedLinks: function () {
        var doc = this.doc;
        this.prefs.get.setunlimitedlinks(function (response) {
            if (response.pref.value) {
                var linkParams = [
                    '/cikkek',
                    '/node',
                    '/szavazasok',
                    '/promo'
                ], callStr = [];
                linkParams.forEach(function (link) {
                    callStr.push(
                        'a[href^="' + link + '"]',
                        'a[href^="' + link + '"]',
                        'a[href^="' + link + '"]',
                        'a[href^=" ' + link + '"]',
                        'a[href^=" ' + link + '"]',
                        'a[href^=" ' + link + '"]',
                        'a[href^="http://hup.hu' + link + '"]',
                        'a[href^="http://hup.hu' + link + '"]',
                        'a[href^="http://hup.hu' + link + '"]',
                        'a[href^=" http://hup.hu' + link + '"]',
                        'a[href^=" http://hup.hu' + link + '"]',
                        'a[href^=" http://hup.hu' + link + '"]',
                        'a[href^="http://www.hup.hu' + link + '"]',
                        'a[href^="http://www.hup.hu' + link + '"]',
                        'a[href^="http://www.hup.hu' + link + '"]',
                        'a[href^=" http://www.hup.hu' + link + '"]',
                        'a[href^=" http://www.hup.hu' + link + '"]',
                        'a[href^=" http://www.hup.hu' + link + '"]'
                    );
                });
                Array.prototype.slice
                    .call(doc.querySelectorAll(callStr.join(',')))
                    .forEach(function (elem) {
                    var link = elem.href,
                        parts = link.split('#');
                    if (parts[0].indexOf('?') > -1) {
                        parts[0] += '&';
                    } else {
                        parts[0] += '?';
                    }
                    parts[0] += 'comments_per_page=9999';
                    elem.href = parts.join('#');
                });
            }
        });
    },
    parseBlocks: function (blockElements) {
        var scope = {},
            blockMenus = this.blockMenus,
            prefs = this.prefs,
            doc = this.doc,
            _this = this,
            processedBlocks, leftBlocksFromConf, rightBlocksFromConf,
            hupperBlocks;

        Components.utils.import('resource://huppermodules/hupblocks.jsm', scope);
        hupperBlocks = new scope.Blocks();
        hupperBlocks.UI = scope.Blocks.UI(this.doc, hupperBlocks);
        Components.utils.import('resource://huppermodules/hupblock.jsm', scope);
        this.hupperBlocks = hupperBlocks;
        prefs.get.blocks(function (response) {
            var blocksFromConfig = JSON.parse(response.pref.value), processedBlocks;
            if (blocksFromConfig && (blocksFromConfig.left || blocksFromConfig.right)) {
                leftBlocksFromConf = blocksFromConfig.left;
                rightBlocksFromConf = blocksFromConfig.right;

                processedBlocks = leftBlocksFromConf.map(function (leftBlock) {
                    var matched = false,
                        blockElement,
                        bl = blockElements.length;

                    while (bl--) {
                        blockElement = blockElements[bl];
                        if (blockElement.id === leftBlock.id) {
                            blockElements.splice(bl, 1);
                            break;
                        }
                    }

                    return new scope.Block(doc, {
                        id: leftBlock.id,
                        blockMenus: blockMenus,
                        blocks: hupperBlocks,
                        side: 'left',
                        hidden: leftBlock.hidden,
                        contentHidden: leftBlock.contentHidden
                    });
                }).concat(rightBlocksFromConf.map(function (rightBlock) {
                    var blockElement,
                        bl = blockElements.length;

                    while (bl--) {
                        blockElement = blockElements[bl];
                        if (blockElement.id === rightBlock.id) {
                            blockElements.splice(bl, 1);
                            break;
                        }
                    }

                    return new scope.Block(doc, {
                        id: rightBlock.id,
                        blockMenus: blockMenus,
                        blocks: hupperBlocks,
                        side: 'right',
                        hidden: rightBlock.hidden,
                        contentHidden: rightBlock.contentHidden
                    });
                })).concat(
                  blockElements.map(function (blockElement) {
                    return new scope.Block(doc, {
                        block: blockElement,
                        blockMenus: blockMenus,
                        blocks: hupperBlocks
                    });
                }));
            } else {
                processedBlocks = blockElements.map(function (blockElement) {
                    return new scope.Block(doc, {
                        block: blockElement,
                        blockMenus: blockMenus,
                        blocks: hupperBlocks
                    });
                });
            }
            processedBlocks.forEach(function (block, a, b) {
                hupperBlocks.registerBlock(block);
            });
            hupperBlocks.save();
            hupperBlocks.UI.rearrangeBlocks();
            hupperBlocks.save();
            _this.processedBlocks = processedBlocks;
        });
    },
    getBlocks: function () {
        var scope = {}, elementer;
        Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
        elementer = this.elementer;
        return elementer
            .GetByClass(elementer.GetId('sidebar-left'), 'block', 'div')
            .concat(elementer.GetByClass(elementer.GetId('sidebar-right'), 'block', 'div'));
    },
    setBlocks: function () {
        var _this = this;
        this.prefs.get.parseblocks(function (response) {
            if (response.pref.value) {
                var blocks = _this.getBlocks(blocks);
                _this.parseBlocks(blocks);
            }
        });
    },
    markAllNodeAsRead: function (e) {
        this.newNodes.forEach(function (node) {
            node.markAsRead();
        });
    },
    appendNewNotifier: function (link, mark) {
        var scope = {}, bundles;
        Components.utils.import('resource://huppermodules/bundles.jsm', scope);
        bundles = scope.hupperBundles;
        this.menu.addMenuItem({
            name: bundles.getString('firstNew'),
            href: link || '#new'
        });
        if (mark) {
            this.menu.addMenuItem({
                name: bundles.getString('markAllRead'),
                click: this.markAllNodeAsRead
            });
        }
    },
    addNewCommentsNotifier: function () {
        var newComments = this.comments.newComments,
            _this = this;
        this.prefs.get.showqnavbox(function (response) {
            if (newComments.length && response.pref.value) {
                _this.appendNewNotifier();
            }
        });
    },
    addNewNodeNotifier: function () {
        var _this = this;
        this.prefs.get.insertnewtexttonode(function (response) {
            if (response.pref.value) {
                _this.prefs.get.showqnavbox(function (response) {
                    if (_this.newNodes.length > 0 && response.pref.value) {
                        _this.appendNewNotifier('#node-' + _this.newNodes[0].id, true);
                    }
                });
            }
        });
    },
    getNodes: function () {
        var scope = {},
            nodes = [],
            newNodes = [],
            c, ds, i, dsl, node, elementer;
        elementer = this.elementer;
        c = elementer.GetId('content-both');
        ds = elementer.GetTag('div', c);
        Components.utils.import('resource://huppermodules/hupnode.jsm', scope);
        for (i = 0, dsl = ds.length; i < dsl; i += 1) {
            if (elementer.HasClass(ds[i], 'node')) {
                node = new scope.Node(this.doc, ds[i]);
                nodes.push(node);
                if (node.newc && !node.hidden) {
                    newNodes.push(node);
                }
            }
        }
        this.nodes = nodes;
        this.newNodes = newNodes;
    },
    parseNodes: function () {
        var nodeMenu, node, i, nl;
        Components.utils.import('resource://huppermodules/hupnode.jsm', scope);
        nodeMenu = new scope.NodeMenus(this.doc, this.menu);
        this.nodes.forEach(function (node) {
            if (node.newc) {
                node.index = this.newNodes.indexOf(node);
                node.next = (node.index === this.newNodes.length - 1) ?
                    false :
                    this.newNodes[node.index + 1].id;
                node.previous = (node.index === 0 || !this.newNodes[node.index - 1]) ?
                    false :
                    this.newNodes[node.index - 1].id;
                node.addNewNodeLinks();
            }
            node.addNodes(this.nodes, nodeMenu);
        }, this);

    },
    parseComments: function () {
        Components.utils.import('resource://huppermodules/hupcomment.jsm', scope);
        this.comments = new scope.GetComments(this.doc);
    },
    hasComments: function () {
        return !!this.elementer.GetId('comments');
    },
    setStyles: function () {
        Components.utils.import('resource://huppermodules/hupperStyleHandler.jsm', scope);
        scope.hupperStyleHandler();
    },
    createMenu: function () {
        Components.utils.import('resource://huppermodules/menu.jsm', scope);
        this.menu = new scope.Menu(this.doc);
    },
    createBlockMenus: function () {
        if (!this.menu) {
            this.createMenu();
        }
        if (!this.blockMenus) {
            Components.utils.import('resource://huppermodules/hupblock.jsm', scope);
            this.blockMenus = new scope.BlockMenus(this.doc, this.menu);
        }
    },
    destroy: function () {
        if (this.comments) {
            this.comments.destroy();
        }
        if (this.blockMenus) {
            this.blockMenus.destroy();
            this.blockMenus = null;
        }
        if (this.menu) {
            this.menu.destroy();
            this.menu = null;
        }
        if (this.nodes) {
            this.nodes.forEach(function (node) {
                node.destroy();
                node = null;
            });
            this.nodes = null;
        }
        if (this.newNodes) {
            this.newNodes.forEach(function (node) {
                node.destroy();
                node = null;
            });
            this.newNodes = null;
        }
        if (this.processedBlocks) {
            this.processedBlocks.forEach(function (block) {
                block.destroy();
                block = null;
            });
        }
        if (this.hupperBlocks) {
            this.hupperBlocks.destroy();
            this.hupperBlocks.UI.destroy();
            this.hupperBlocks = null;
        }
        this.processedBlocks = null;
        this.doc = null;
        this.prefs = null;
        this.elementer.destroy();
        this.elementer = null;
        if (typeof this.onDestroy === 'undefined') {
            this.onDestroy();
        }
    }
};
var EXPORTED_SYMBOLS = ['HupSite'];
