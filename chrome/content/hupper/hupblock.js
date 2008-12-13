/**
 * @class HUPBlock
 * @constructor
 * @param {Element} block
 */
var HUPBlock = function(block, sides, blockMenus) {
  if(!block) return;
  this.block = block;
  this.id = this.block.getAttribute('id');
  this.blockMenus = blockMenus;
  this.titleNode = HUP.El.GetFirstTag('h2', this.block);
  var contents = HUP.El.GetByClass(this.block, 'content', 'div');
  this.contentNode = contents.length ? contents[0] : null;
  if(this.titleNode) this.title = this.titleNode.innerHTML;
  this.makeTitle();
  if(this.id != 'block-hupper-0') this.addButtons(); // exception for hup block
  this.addMoveButtons();
  var properties = HUPBlocksProperties.getBlock(this.id);
  if(properties) {
    this.side = properties.side;
    this.setIndex(properties.index);
    properties.hidden ? this.hide() : this.show();
    properties.contentHidden ? this.hideContent() : this.showContent();
  } else {
    this.side = /sidebar-right/.test(this.block.parentNode.getAttribute('id')) ? 'right' : 'left';
    this.setIndex(sides[this.side]);
    this.saveProperties();
    sides[this.side]++;
  }
};
HUPBlock.prototype = {
  hidden: false,
  contentHidden: false,
  blocks: new Array(),
  hide: function() {
    HUP.El.Hide(this.block);
    this.hidden = true;
    this.blockMenus.addBlockToMenu(this);
    this.saveProperties();
  },
  show: function() {
    HUP.El.Show(this.block);
    this.hidden = false;
    this.blockMenus.removeBlockFromMenu(this);
    this.saveProperties();
  },
  hideContent: function() {
    if(!this.contentNode) return;
    HUP.El.Hide(this.contentNode);
    HUP.El.Hide(this.hideButton);
    HUP.El.Show(this.showButton);
    this.contentHidden = true;
    this.saveProperties();
  },
  showContent: function() {
    if(!this.contentNode) return;
    HUP.El.Show(this.contentNode);
    HUP.El.Show(this.hideButton);
    HUP.El.Hide(this.showButton);
    this.contentHidden = false;
    this.saveProperties();
  },
  makeTitle: function() {
    var boxes = {
        'block-aggregator-feed-13': 'http://distrowatch.com',
        'block-aggregator-feed-19': 'http://www.freebsd.org',
        'block-aggregator-feed-2': 'http://www.kernel.org',
        'block-aggregator-feed-3': 'http://wiki.hup.hu',
        'block-aggregator-feed-4': 'http://lwn.net',
        'block-aggregator-feed-40': 'http://www.flickr.com/photos/h_u_p/',
        'block-aggregator-feed-41': 'http://blogs.sun.com',
        'block-aggregator-feed-44': 'http://hwsw.hu',
        'block-aggregator-feed-46': 'http://www.linuxdevices.com',
        'block-aggregator-feed-47': 'http://undeadly.org',
        'block-block-6': 'http://www.mozilla.com/firefox?from=sfx&uid=225821&t=308',
        'block-blog-0': '/blog',
        'block-comment-0': '/tracker',
        'block-poll-0': '/poll',
        'block-poll-40': '/poll',
        'block-search-0': '/search',
        'block-tagadelic-1': '/temak'

    };
    if(boxes[this.id] && this.title && this.titleNode) {
      HUP.El.Update(HUP.El.CreateLink(this.title, boxes[this.id]), this.titleNode);
    }
  },
  moveUp: function() {
    var block = this.getUpBlock();
    while(!block.titleNode || block.hidden) {
      block = this.getUpBlock(block);
    }
    var newIndex = block.index;
    var thisIndex = this.index;
    this.blocks[this.blocks.indexOf(block)].index = thisIndex;
    this.index = newIndex;
    HUPRearrangeBlocks(this.blocks);
    this.saveProperties();
  },
  moveDown: function() {
    var block = this.getDownBlock();
    while(!block.titleNode || block.hidden) {
      block = this.getDownBlock(block);
    }
    var thisIndex = this.index;
    var newIndex = block.index;
    this.blocks[this.blocks.indexOf(block)].index = thisIndex;
    this.index = newIndex;
    HUPRearrangeBlocks(this.blocks);
    this.saveProperties();
  },
  getDownBlock: function(refBlock) {
    if(!refBlock) refBlock = this;
    var thisIndex = this.blocks.indexOf(refBlock);
    var newIndex = thisIndex + 1;
    while(this.blocks[newIndex+1] && this.blocks[newIndex].side != this.side) {
      newIndex++;
    }
    return this.blocks[newIndex];
  },
  getUpBlock: function(refBlock) {
    if(!refBlock) refBlock = this;
    var thisIndex = this.blocks.indexOf(refBlock);
    var newIndex = thisIndex - 1;
    while(this.blocks[newIndex-1] && this.blocks[newIndex].side != this.side) {
      newIndex--;
    }
    return this.blocks[newIndex];
  },
  moveRight: function() {
    if(this.side == 'right') return;
    this.side = 'right';
    this.index = -1;
    this.saveProperties();
    HUPRearrangeBlocks(this.blocks);
  },
  moveLeft: function() {
    if(this.side == 'left') return;
    this.side = 'left';
    this.index = -1;
    this.saveProperties();
    HUPRearrangeBlocks(this.blocks);
  },
  setIndex: function(index, save) {
    this.index = index;
    if(save) this.saveProperties();
  },
  addButtons: function() {
    if(!this.titleNode) return;
    var _this = this;
    this.delButton = HUP.El.Button(HUP.Bundles.getString('deleteBlock'), 'hupper-button block-button delete-button');
    this.hideButton = HUP.El.Button(HUP.Bundles.getString('hideBlockContent'), 'hupper-button block-button hide-button');
    this.showButton = HUP.El.Button(HUP.Bundles.getString('showBlockContent'), 'hupper-button block-button show-button');
    HUP.El.Hide(this.showButton);
    HUP.Ev.addEvent(this.delButton, 'click', function() {
      _this.hide();
    });
    HUP.Ev.addEvent(this.hideButton, 'click', function() {
      _this.hideContent();
    });
    HUP.Ev.addEvent(this.showButton, 'click', function() {
      _this.showContent();
    });
    HUP.El.Insert(this.showButton, this.titleNode.firstChild);
    HUP.El.Insert(this.hideButton, this.titleNode.firstChild);
    HUP.El.Insert(this.delButton, this.titleNode.firstChild);
  },
  addMoveButtons: function() {
    if(!this.titleNode) return;
    this.upButton = HUP.El.Button(HUP.Bundles.getString('moveBoxUp'), 'hupper-button up-button block-move-button');
    this.downButton = HUP.El.Button(HUP.Bundles.getString('moveBoxDown'), 'hupper-button down-button block-move-button');
    this.leftButton = HUP.El.Button(HUP.Bundles.getString('moveBoxLeft'), 'hupper-button left-button block-move-button');
    this.rightButton = HUP.El.Button(HUP.Bundles.getString('moveBoxRight'), 'hupper-button right-button block-move-button');
    var _this = this;
    HUP.Ev.addEvent(this.upButton, 'click', function() {
      _this.moveUp();
    });
    HUP.Ev.addEvent(this.downButton, 'click', function() {
      _this.moveDown();
    });
    HUP.Ev.addEvent(this.leftButton, 'click', function() {
      _this.moveLeft();
    });
    HUP.Ev.addEvent(this.rightButton, 'click', function() {
      _this.moveRight();
    });
    HUP.El.Insert(this.upButton, this.titleNode.firstChild);
    HUP.El.Insert(this.downButton, this.titleNode.firstChild);
    HUP.El.Insert(this.leftButton, this.titleNode.firstChild);
    HUP.El.Insert(this.rightButton, this.titleNode.firstChild);
  },
  saveProperties: function() {
    var props = {
      hidden: this.hidden,
      contentHidden: this.contentHidden,
      index: this.index,
      side: this.side
    };
    HUPBlocksProperties.setBlock(this.id, props);
  }
};
HUPBlocksProperties = {
  set: function(blocks) {
    HUP.hp.set.blocks(HUPJson.encode(blocks));
  },
  get: function() {
    return HUPJson.decode(HUP.hp.get.blocks());
  },
  setBlock: function(block, props) {
    var blocks = this.get();
    blocks[block] = props;
    this.set(blocks);
  },
  getBlock: function(block) {
    return this.get()[block];
  }
};
HUPBlockMenus = function(hupMenu) {
  this.blocks = new Object();
  this.hupMenu = hupMenu;
};
HUPBlockMenus.prototype = {
  addMenu: function() {
    if(this.menu) return;
    this.menuitem = this.hupMenu.addMenuItem({name: 'Restore hidden blocks', click: function() {
      HUP.El.ToggleClass(this.parentNode, 'hide-submenu');
      HUP.El.ToggleClass(this.parentNode, 'collapsed');
      HUP.El.ToggleClass(this.parentNode, 'expanded');
    }});
    HUP.El.RemoveClass(this.menuitem, 'leaf');
    HUP.El.AddClass(this.menuitem, 'hide-submenu collapsed');
    this.menu = this.hupMenu.addMenu(this.menuitem);
  },
  removeMenu: function() {
    if(this.menuitem || this.menu) {
      this.hupMenu.removeMenu(this.menu);
      this.hupMenu.removeMenuItem(this.menuitem);
      this.menuitem = null;
      this.menu = null;
    }
  },
  addBlockToMenu: function(block) {
    if(!this.blocks[block.id]) {
      if(!this.menu) this.addMenu();
      var _this = this;
      this.blocks[block.id] = this.hupMenu.addMenuItem({name: block.title, click: function() {block.show()}}, _this.menu);
    }
  },
  removeBlockFromMenu: function(block) {
    if(this.blocks[block.id]) {
      HUP.El.Remove(this.blocks[block.id]);
      delete this.blocks[block.id];
    }
    var n = 0;
    for(var i in this.blocks) {n++;}
    if(n == 0) this.removeMenu();
  }
};
HUPRearrangeBlocks = function(blocks) {
  blocks.sort(function(a, b) {
    if((a.side == b.side && a.index < b.index) || (a.side == 'left' && b.side == 'right') || !a.titleNode) return -1;
    if((a.side == b.side && a.index > b.index) || (a.side == 'right' && b.side == 'left')) return 1;
  });
  var sides = {left:1, right:1};
  blocks.forEach(function(block, index) {
    if(block.side == 'left') {
      block.setIndex(sides.left, true);
      sides.left++;
    }  else {
      block.setIndex(sides.right, true);
      sides.right++;
    }
  });
  var left = HUP.El.GetId('sidebar-left');
  var right = HUP.El.GetId('sidebar-right');
  HUP.El.RemoveAll(left);
  HUP.El.RemoveAll(right);
  blocks.forEach(function(block, index){
    (block.side == 'left') ? HUP.El.Add(block.block, left) : HUP.El.Add(block.block, right);
    block.blocks = blocks;
  });
};