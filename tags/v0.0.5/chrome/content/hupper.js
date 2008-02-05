/**
 * hupper.js
 * @fileoverview This file is part of the Hupper Firefox extension,
 * which adds some extra feature for the {@link http://hup.hu hup.hu} site
 * {@link http://ajnasz.hu/blog/20070616/hupper-extension Hupper Firefox Extension}
 *
 * Copyright (C) 2007-2008
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @license General Public Licence v2
 * for more details see the licence.txt file
 */

/**
 * Mozilla logging service
 * @class HLog is a class to make the logging easier
 * @constructor
 */
var HLog = function()
{
  this.s = this.serv();
};
HLog.prototype = 
{
  /**
   * Stores a log service
   */
  s: null,
  /**
   * Stores the loggable message
   */
  msg: null,
  /**
   * Mozilla log service initialization method
   * @return Mozilla log service
   * @type Service
   */
  serv: function()
  {
    return Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  },
  /**
   * @param {String} arguments The arguments will be written to the error console 
   */
  log: function()
  {
    this.msg = new String();
    for(var i = 0; i < arguments.length; i++) 
    {
      this.msg += ', ' + arguments[i];
    }
    try 
    {
      this.s.logStringMessage('HUPPER: ' + this.msg.replace(/^, /, ''));
    } 
    catch(e) 
    {
      // alert(this.msg.join(', '));
      // alert(this.msg);
    };
  }
};
/**
 * Namespace, to store the static variables
 * @final
 */
var HupperVars =
{
  trollCommentHeaderClass: 'trollHeader',
  trollCommentClass: 'trollComment',
  trollCommentAnswersClass: 'trollCommentAnswer',
  hupperCommentHeaderClass: 'hupperHeader',
  hupperCommentHeader: 'hupperComment'
};
/**
 * Namespace, which is used to returns the preferences value
 */
var HupperPrefs = 
{
  /**
   * Prefernce mozilla service
   * pref types: BoolPref, CharPref, IntPref
   * {@link http://developer.mozilla.org/en/docs/Code_snippets:Preferences developer.mozilla.org}
   */
  prefManager: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
  /**
   * @return The returned array contains the names of the trolls
   * @type Array
   */
  trolls: function()
  {
    var trolls = this.prefManager.getCharPref('extensions.hupper.trolls');
    return trolls.split(',');
  },
  /**
   * @return Hexa code color
   * @type String
   */
  trollcolor: function()
  {
    return this.prefManager.getCharPref('extensions.hupper.trollcolor');
  },
  /**
   * @type {Boolean}
   */
  filtertrolls: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.filtertrolls');
  },
  /**
   * @return hide or hilight the trolls
   * @type String
   */
  trollfiltermethod: function()
  {
    // hide, hilight
    return this.prefManager.getCharPref('extensions.hupper.trollfiltermethod');
  },
  /**
   * @return also hide the answers of a troll comment
   * @type String
   */
  hidetrollanswers: function()
  {
    // hide, hilight
    return this.prefManager.getBoolPref('extensions.hupper.hidetrollanswers');
  },
  /**
   * @return The returned array contains the names of the huppers
   * @type Array
   */
  huppers: function()
  {
    var huppers = this.prefManager.getCharPref('extensions.hupper.huppers');
    return huppers.split(',');
  },
  /**
   * @return Hexa code color
   * @type String
   */
  huppercolor: function()
  {
    return this.prefManager.getCharPref('extensions.hupper.huppercolor');
  },
  /**
   * @type Boolean
   */
  filterhuppers: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.filterhuppers');
  },
  /**
   * @type Boolean
   */
  replacenewcommenttext: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.replacenewcommenttext');
  },
  /**
   * @type String
   */
  newcommenttext: function()
  {
    return this.prefManager.getCharPref('extensions.hupper.newcommenttext');
  },
  /**
   * @type Boolean
   */
  prevnextlinks: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.prevnextlinks');
  },
  /**
   * @type String
   */
  tags: function()
  {
    return this.prefManager.getCharPref('extensions.hupper.tags');
  },
  /**
   * @type Boolean
   */
  extraCommentLinks: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.extracommentlinks');
  },
  /**
   * @type Boolean
   */
  hilightForumLinesOnHover: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.hilightforumlinesonhover');
  },
  /**
   * @type Boolean
   */
  insertPermalink: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.insertpermalink');
  },
  /**
   * @type Boolean
   */
  insertnewtexttonode: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.insertnewtexttonode');
  },
  /**
   * @type Boolean
   */
  fadeparentcomment: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.fadeparentcomment');
  },
  /**
   * @type Boolean
   */
  showqnavbox: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.showqnavbox');
  }
};
/**
 * Namespace to build links, lists etc.
 * @class nodeHeaderBuilder Namespace to build links, lists etc.
 * @constructor
 */
var nodeHeaderBuilder = function()
{
  /**
   * @final
   */
  this.firstLinkText = HUP.Bundles.getString('FirstLinkText');
  /**
   * @final
   */
  this.lastLinkText = HUP.Bundles.getString('LastLinkText');
  /**
   * @final
   */
  this.prevLinkText = HUP.Bundles.getString('PrevLinkText');
  /**
   * @final
   */
  this.nextLinkText = HUP.Bundles.getString('NextLinkText');
  /**
   * @final
   */
  this.topLinkText = HUP.Bundles.getString('TopLinkText');
  /**
   * @final
   */
  this.backLinkText = HUP.Bundles.getString('BackLinkText');
  /**
   * @final
   */
  this.parentLinkText = HUP.Bundles.getString('ParentLinkText');
  
  // Title text nodes
  this.fit = HUP.El.Txt(this.firstLinkText);
  this.lat = HUP.El.Txt(this.lastLinkText);
  this.newCt = HUP.El.Txt(HupperPrefs.newcommenttext());
  
  // Mark as read node
  this.markR = HUP.El.CreateLink(HUP.Bundles.getString('markingText'));
  HUP.El.AddClass(this.markR, 'marker');
};
nodeHeaderBuilder.prototype = {
  /**
    * Builds a link which points to the specified path with the next link str
    * @param {String} path Path for the next node
    * @return A DOM link (a) object within the ~Next~ text
    * @type Element
    */
  buildNextLink: function(path)
  {
    return HUP.El.CreateLink(this.nextLinkText, '#' + path);
  },
  /**
    * Builds a link which points to the specified path with the prev link text
    * @param {String} path Path for the next node
    * @return A DOM link (a) object within the ~Prev~ text
    * @type Element
    */
  buildPrevLink: function(path)
  {
    return HUP.El.CreateLink(this.prevLinkText, '#' + path);
  },
  /**
    * Builds a text node with the first text
    * @return Span element within first link text
    * @type Element
    */
  buildFirstLink: function()
  {
    var nsp = HUP.El.Span();
    HUP.El.Add(this.fit, nsp);
    return nsp;
  },
  /**
    * Builds a text node with the last text
    * @return Span element with within last link text
    * @type Element
    */
  buildLastLink: function()
  {
    var nsp = HUP.El.Span();
    HUP.El.Add(this.lat, nsp);
    return nsp;
  },
  /**
    * Builds a mark as read linknode
    * @return Link (a) element
    * @param {String} path the path to the node
    * @param {Int} i marker id
    * @type Element
    */
  buildMarker: function(path, i)
  {
    var mr = this.markR.cloneNode(true);
    mr.setAttribute('path', path);
    mr.setAttribute('id', 'marker-' + i);
    mr.addEventListener('click', markNodeAsRead, true);
    return mr;
  },
  /**
    * Builds a text node with [new] text
    * @return Span element, within a next link
    * @type Element
    */
  buildNewText: function()
  {
    var nsp = HUP.El.Span();
    HUP.El.AddClass(nsp, 'hnew');
    HUP.El.Add(this.newCt.cloneNode(true), nsp);
    return nsp;
  },
  /**
    * Builds an invisible link with a name attribute
    * @param {Int} i id of the node
    * @return Link (a) element only with name attribute
    * @type Element
    */
  buildNameLink: function(i)
  {
    var liaC = HUP.El.A();
    liaC.setAttribute('name', 'n-' + i);
    return liaC;
  },
  /**
    * Builds a link node which points to the top of the page
    * @return Li element, within a link which points to the top of the page
    * @type Element
    */
  buildComExtraTop: function()
  {
    var tmpList = HUP.El.Li();
    HUP.El.Add(HUP.El.CreateLink(this.topLinkText, '#'), tmpList);
    return tmpList;
  },
  /**
    * Builds a link node which points to the previous page
    * @return Li element with a link, which point to the previous history page
    * @type Element
    */
  buildComExtraBack: function()
  {
    var tmpList = HUP.El.Li();
    HUP.El.Add(HUP.El.CreateLink(this.backLinkText, 'javascript:history.back();'), tmpList);
    return tmpList;
  },
  /**
    * Builds a link node which points to the comment's parent comment
    * @param {String} parent The parent comment id
    * @return Li element with a link, which points to the parent comment
    * @type Element
    */
  buildComExtraParent: function(parent)
  {
    var tmpList = HUP.El.Li();
    var link = HUP.El.CreateLink(this.parentLinkText, '#' + parent.id);
    // if fading enabled, add an event listener, which will fades the parent node
    if(HupperPrefs.fadeparentcomment()) 
    {
      link.addEventListener('click', function(e)
      {
        new Transform(e.target.n.comment, 'FadeIn');
      }, false);
      link.n = parent;
    }
    HUP.El.Add(link, tmpList);
    return tmpList;
  },
  /**
    * Builds a link with a permalink text
    * @param {String} cid
    * @return Li element, with a link, which points to exactly to the comment
    * @type Element
    */
  buildComExtraPerma: function(cid)
  {
    var tmpList = HUP.El.Li();
    HUP.El.Add(HUP.El.CreateLink('permalink', '#' + cid), tmpList);
    return tmpList;
  }
};
/**
 * Collects the comment nodes and filter them into another 2 array too by their 
 * roperties: comments, newComments, indentComments the indenComments just contains
 * an index which specify the comment index in the comments array
 * @return Array with the comments and new comments: 0 => comments object, 1 => only new comments, 
 * @type Array
 */
var getComments = function()
{
  var coms = HUP.El.GetId('comments');
  if(!coms) 
  {
    return false;
  }
  var ds = HUP.El.GetTag('div', coms);
  var header, footer, el, comments = new Array(), newComm, parentComment, indentComments = new Array(), newComments = new Array(), dsl = ds.length, i, cont;
  for(i = 0; i < dsl; i++) 
  {
    if(HUP.El.HasClass(ds[i], 'comment')) 
    {
      header = HUP.El.GetByClass(ds[i], 'submitted', 'div')[0];
      footer = HUP.El.GetByClass(ds[i], 'link', 'div')[0];
      cont = HUP.El.GetByClass(ds[i], 'content', 'div')[0];
      newComm = HUP.El.GetByClass(ds[i], 'new', 'span');
      comment = 
      {
        comment: ds[i],
        header: header,
        footer: footer,
        cont: cont,
        newComm: (newComm.length) ? newComm[0] : false,
        footerLinks: HUP.El.GetFirstTag('ul', footer),
        id: ds[i].previousSibling.previousSibling.id,
        indent: getIndent(ds[i]),
        childs: getChildComment(ds[i]),
        user: (typeof header.childNodes[1] != 'undefined') ? header.childNodes[1].innerHTML : header.innerHTML.replace(/[^\(]+\( ([^ ]+).*/, '$1')
      };
      parentComment = getParentComment(indentComments, comment);
      comment.parent = (typeof parentComment != 'undefined' && parentComment !== false) ? comments[parentComment] : -1;
      if(typeof indentComments[comment.indent] == 'undefined') 
      {
        indentComments[comment.indent] = new Array();
      }
      indentComments[comment.indent].push(comments.length);
      comments.push(comment);
      if(comment.newComm) 
      {
        newComments.push(comment);
      }
    }
  }
  return new Array(comments, newComments, indentComments);
};
/**
 * Collects the content nodes like articles or blog posts from the page
 * @var {Array} nodes contains all node objects
 * @var {Array} newnodes contains only the new node objects
 * @var {Object} node a node object with all data of the node
 * @var {Object} node.header header node of the node - where are the titles of the nodes
 * @var {String} node.path the path to the node
 * @var {Object} node.submitData
 * @var {Object} node.cont
 * @var {Object} node.cont
 * @var {Boolean} node.newc true, if the node have unread comments
 * @return An arry with all nodes and only new nodes 0 => all node, 1 => only new nodes
 * @type Array
 */
var getNodes = function()
{
  var c = HUP.El.GetId('content-both');
  var ds = HUP.El.GetTag('div', c);
  var nodes = new Array(), newnodes = new Array(), node = {}, dsl = ds.length, i, header, submitData, cont, footer;
  for(i = 0; i < dsl; i++) 
  {
    if(HUP.El.HasClass(ds[i], 'node')) 
    {
      header = ds[i].childNodes[1];
      submitData = ds[i].childNodes[3];
      cont = ds[i].childNodes[5];
      footer = HUP.El.HasClass(ds[i].childNodes[7], 'links') ? ds[i].childNodes[7] : false;
      node = 
      {
        header: header,
        path: header.firstChild.getAttribute('href'),
        submitData: submitData,
        cont: cont,
        footer: footer,
        newc: HUP.El.GetByClass(footer, 'comment_new_comments', 'li').length > 0 ? true : false
      };
      node.newc ? nodes.push(node) && newnodes.push(node) : nodes.push(node);
    }
  }
  return new Array(nodes, newnodes);
};
/**
 * Parse the nodes to mark that the node have unread comment, adds prev and next links to the header
 * @param {Array} nodes
 */
var parseNodes = function(nodes)
{
  var spa = HUP.El.Span(), sp, builder = new nodeHeaderBuilder(), nl = nodes.length, i, mread;
  for(i = 0; i < nl; i++) 
  {
    if(nodes[i].newc) 
    {
      sp = spa.cloneNode(true);
      HUP.El.AddClass(sp, 'nnew');
      mread = builder.buildMarker(nodes[i].path, i);
      HUP.markReadNodes.push(mread);
      HUP.El.Add(mread, sp);
      HUP.El.Add(builder.buildNewText(), sp);
      HUP.El.Insert(builder.buildNameLink(i), nodes[i].header);
      
      if(i > 0) 
      {
        HUP.El.Add(builder.buildPrevLink('n-' + (i - 1)), sp);
      }
      else 
      {
        HUP.El.Add(builder.buildFirstLink(), sp);
      }
      if(i < nl - 1) 
      {
        HUP.El.Add(builder.buildNextLink('n-' + (i + 1)), sp);
      }
      else 
      {
        HUP.El.Add(builder.buildLastLink(), sp);
      }
      HUP.El.Insert(sp, nodes[i].header.firstChild);
    }
  }
};
/**
 * Send an AJAX HEAD request to the server, to remove the unread nodes
 * @param {Event} e Event object
 * @requires HupAjax
 * @see HupAjax
 */
var markNodeAsRead = function(e)
{
  new HupAjax(
  {
    method: 'head',
    url: 'http://hup.hu' + this.getAttribute('path').replace(/^\s*(.+)\s*$/, '$1'),
    successHandler: function()
    {
      this.el.innerHTML = HUP.Bundles.getString('markingSuccess');
      if(this.el.nextSibling.getAttribute('class') == 'hnew') 
      {
        HUP.El.Remove(this.el.nextSibling, this.el.parentNode);
      }
    },
    loadHandler: function()
    {
      var img = HUP.El.Img('chrome://hupper/skin/ajax-loader.gif', 'marking...');
      HUP.El.RemoveAll(this.el);
      HUP.El.Add(img, this.el);
    },
    errorHandler: function()
    {
      var t = HUP.El.Txt(HUP.Bundles.getString('markingError'));
      HUP.El.RemoveAll(this.el);
      HUP.El.Add(t, this.el);
    }
  }, e.target);
};
/**
 * Marks as read all nodes, which have unread items
 * @param {Event} e event object
 */
var markAllNodeAsRead = function(e)
{
  var n = e.target.markNodes;
  var d = document || HUP.w;
  for(var i = 0; i < n.length; i++) 
  {
    var click = d.createEvent("MouseEvents");
    click.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    n[i].dispatchEvent(click);
  }
};
/**
 * Checks that the arrray contains the specified element
 * @param {String,Number,Array,Object} value
 * @type {Boolean}
 */
var inArray = function(value, array)
{
  var i = array.length - 1;
  while(array[i]) 
  {
    if(array[i] === value) 
    {
      return true;
    }
    i--;
  }
  return false;
};
/**
 * Parses all comment on the page and add class names, replaces the 'új' text, etc.
 * @param {Array} comments
 * @param {Array} newComments
 * @param {Array} indentComments
 */
var parseComments = function(comments, newComments, indentComments)
{
  var replacenewcommenttext = HupperPrefs.replacenewcommenttext();
  var prevnextlinks = HupperPrefs.prevnextlinks();
  var trolls = HupperPrefs.trolls();
  var filtertrolls = HupperPrefs.filtertrolls();
  var huppers = HupperPrefs.huppers();
  var filterhuppers = HupperPrefs.filterhuppers();
  var extraCommentLinks = HupperPrefs.extraCommentLinks();
  var insertPermalink = HupperPrefs.insertPermalink();
  
  var builder = new nodeHeaderBuilder(), ps;
  comments.map(function(C)
  {
    if(filtertrolls) 
    {
      if(inArray(C.user, trolls)) 
      {
        HUP.El.AddClass(C.comment, HupperVars.trollCommentClass);
        HUP.El.AddClass(C.header, HupperVars.trollCommentHeaderClass);
        if(C.childs != -1) {
          HUP.El.AddClass(C.childs, HupperVars.trollCommentAnswersClass);
        }
      }
    }
    if(filterhuppers) 
    {
      if(inArray(C.user, huppers)) 
      {
        HUP.El.AddClass(C.comment, HupperVars.hupperCommentClass);
        HUP.El.AddClass(C.header, HupperVars.hupperCommentHeaderClass);
      }
    }
    if(extraCommentLinks) 
    {
      HUP.El.Add(builder.buildComExtraTop(), C.footerLinks);
      HUP.El.Add(builder.buildComExtraBack(), C.footerLinks);
    }
    if(C.parent != -1) 
    {
      var Bl = builder.buildComExtraParent(C.parent);
      HUP.El.Add(Bl, C.footerLinks);
    }
    if(insertPermalink) 
    {
      HUP.El.Add(builder.buildComExtraPerma(C.id), C.footerLinks);
    }
  });
  if(replacenewcommenttext || prevnextlinks) 
  {
    var spanNode = HUP.El.Span(), tmpSpan1, ncl = newComments.length, i;
    for(i = 0; i < ncl; i++) 
    {
      tmpSpan1 = spanNode.cloneNode(true);
      HUP.El.AddClass(tmpSpan1, 'hnav');
      if(prevnextlinks) 
      {
        if(i > 0) 
        {
          HUP.El.Add(builder.buildPrevLink(newComments[i - 1].id), tmpSpan1);
        }
        else 
        {
          HUP.El.Add(builder.buildFirstLink(), tmpSpan1);
        }
        if(i < ncl - 1) 
        {
          HUP.El.Add(builder.buildNextLink(newComments[i + 1].id), tmpSpan1);
        }
        else 
        {
          HUP.El.Add(builder.buildLastLink(), tmpSpan1);
        }
      }
      if(replacenewcommenttext) 
      {
        HUP.El.Remove(newComments[i].newComm, newComments[i].comment);
        HUP.El.Add(builder.buildNewText(), tmpSpan1);
      }
      HUP.El.Insert(tmpSpan1, newComments[i].header.firstChild);
    }
  }
};
/**
 * Check, that the comment is an answer for another comment or not,
 * returns the index of the parent comment or 
 * @param {Array} indentedComments
 * @param {Comment} comment
 * @return returns an array index number or false
 * @type {Int,False} 
 */
var getParentComment = function(indentedComments, comment)
{
  // if the comment is indented
  if(comment.indent > 0) 
  {
    return indentedComments[(comment.indent - 1)][(indentedComments[(comment.indent - 1)].length - 1)];
  }
  else 
  {
    return false;
  }
};

var getChildComment = function(comment) {
  var child = comment.nextSibling.nextSibling;
  if(HUP.El.HasClass(child, 'indented')) {
    return child;
  }
  return -1;
}
/**
 * Get the indent level of the element
 * @param {Element} el
 * @return how indented the comment
 * @type Int
 */
var getIndent = function(el)
{
  var indent = 0;
  while(HUP.El.HasClass(el.parentNode, 'indented')) 
  {
    el = el.parentNode;
    indent++;
  }
  return indent;
};
/**
 * Appends a new link to the top of the page, if there is new comment
 * @param {String} [link]
 */
var appendNewNotifier = function(link, mark)
{
  var hupperBlockId = 'block-hupper-0'; // newNotifier
  if(HUP.El.GetId(hupperBlockId)) 
  {
    return;
  }
  var div = HUP.El.Div();
  var h2 = HUP.El.El('h2');
  var ul = HUP.El.Ul();
  var li = HUP.El.Li();
  var a1, a2, li1, li2;
  HUP.El.AddClass(li, 'leaf');
  
  HUP.El.Add(HUP.El.Txt('Hupper'), h2);

  a1 = HUP.El.CreateLink(HUP.Bundles.getString('firstNew'), link || '#new');
  li1 = li.cloneNode(true);
  HUP.El.Add(a1, li1);

  HUP.El.AddClass(ul, 'menu');
  HUP.El.Add(li1, ul);

  if(mark) 
  {
    a2 = HUP.El.CreateLink(HUP.Bundles.getString('markAllRead'), 'javascript:void(0)');
    a2.addEventListener('click', markAllNodeAsRead, false);
    a2.markNodes = HUP.markReadNodes;
  
    li2 = li.cloneNode(true);
    HUP.El.Add(a2, li2);
    HUP.El.Add(li2, ul);
  }
  var blockDiv = div.cloneNode(div);
  var contentDiv = div.cloneNode(div);
  HUP.El.AddClass(contentDiv, 'content');
  HUP.El.Add(ul, contentDiv);

  HUP.El.Add(h2, blockDiv);
  HUP.El.Add(contentDiv, blockDiv);
  blockDiv.setAttribute('id', hupperBlockId);
  HUP.El.AddClass(blockDiv, 'block block-hupper');

  var googleBlock = HUP.El.GetId('block-block-8');
  HUP.El.Insert(blockDiv, googleBlock);
};
/**
 * Adds my own styles to the hup.hu header
 * @param {Event} e event object
 */
var addHupStyles = function(e)
{
  var styles = '';
  switch(HupperPrefs.trollfiltermethod())
  {
    case 'hide':
      styles += '.' + HupperVars.trollCommentClass + ' {display:none !important;}';
      if(HupperPrefs.hidetrollanswers()) {
        styles += '.' + HupperVars.trollCommentAnswersClass + ' {display:none !important;}';
      }
      break;
    case 'hilight':
    default:
      styles += '.' + HupperVars.trollCommentHeaderClass + ' {background-color:' + HupperPrefs.trollcolor() + ' !important;}';
      break;
  };
  styles += '.' + HupperVars.hupperCommentHeaderClass + ' {background-color: ' + HupperPrefs.huppercolor() + ' !important;}';
  styles += '#filteredhuppers, #filteredtrolls {display:block; !important;}';
  styles += '#tags {background-color:#F6F6EB; }';
  styles += '#tags h4 {margin: 0;padding:0; }';
  styles += '#tags ul {list-style:none;padding:0;margin:0;}#tags li {padding-left:5px;margin:0;}';
  if(HupperPrefs.hilightForumLinesOnHover()) 
  {
    styles += 'tr.odd:hover td, tr.even:hover {background-color: #D8D8C4;}';
  }
  styles += 'input, textarea { border: 1px solid #999 !important; padding: 2px !important; margin-bottom: 5px !important; }';
  styles += 'input:focus, textarea:focus { border-color: #000 !important; }';
  styles += '.hnew { color: red; font-weight: bold; }';
  styles += '.nnew { float:right; }';
  styles += '.nnew, .nnew a { font-size:10px; font-weight: normal; }';
  styles += '.nnew * { margin-left: 2px; margin-right: 2px; }';
  styles += '.hnav { float: right; padding-right: 5px; }';
  styles += '.hnav * { margin-left: 2px; margin-right: 2px; }';
  styles += '.submitted { padding: 2px !important; }';
  styles += '.marker { cursor: pointer; color: #000; }';
  
  var st = HUP.El.El('style');
  st.setAttribute('type', 'text/css');
  HUP.El.Add(HUP.El.Txt(styles), st);
  HUP.El.Add(st, HUP.El.GetFirstTag('head'));
};
/**
 * Class to create and manipulate DOM elements
 * @constructor
 */
var Elementer = function()
{
  this.doc = HUP.w;
  this.li = this.doc.createElement('li');
  this.ul = this.doc.createElement('ul');
  this.div = this.doc.createElement('div');
  this.span = this.doc.createElement('span')
  this.a = this.doc.createElement('a')
  this.img = this.doc.createElement('img')
  this.GetBody();
}
Elementer.prototype = {
  /**
    * Creates an 'li' element
    * @return Li element
    * @type Element
    */
  Li: function()
  {
    return this.li.cloneNode(true);
  },
  /**
    * Creates an 'ul' element
    * @return Ul element
    * @type Element
    */
  Ul: function()
  {
    return this.ul.cloneNode(true);
  },
  /**
    * Creates an 'div' element
    * @return Div element
    * @type Element
    */
  Div: function()
  {
    return this.div.cloneNode(true);
  },
  /**
    * Creates an 'span' element
    * @return Span element
    * @type Element
    */
  Span: function()
  {
    return this.span.cloneNode(true);
  },
  /**
    * Creates an 'a' element
    * @return A element
    * @type Element
    */
  A: function()
  {
    return this.a.cloneNode(true);
  },
  /**
    * Creates an 'img' element
    * @param {String} src source of the image
    * @param {String} alt image alternate text
    * @return Img element
    * @type Element
    */
  Img: function(src, alt)
  {
    var img = this.img.cloneNode(true);
    img.setAttribute('src', src);
    img.setAttribute('alt', alt);
    return img;
  },
  /**
    * Creates a specified element
    * @param {String} el type of element
    * @return Li element
    * @type Element
    */
  El: function(el)
  {
    return this.doc.createElement(el);
  },
  /**
    * Creates a text element
    * @return Text element
    * @type Element
    */
  Txt: function(text)
  {
    return this.doc.createTextNode(text);
  },
  /**
    * Adds a child element
    * @param {Element} elem addable element
    * @param {Element} parent Element, where the new element will appended
    * @return Returns the element
    * @type Element
    */

  Add: function(elem, parent)
  {
    parent.appendChild(elem);
    return elem;
  },
  /**
    * Inserts an element before another element
    * @param {Element} elem insertable element
    * @param {Element} before element before the new elem will inserted
    * @return Returns the elem
    * @type Element
    */
  Insert: function(elem, before)
  {
    before.parentNode.insertBefore(elem, before);
    return elem;
  },
  /**
    * Removes the specified element
    * @param {Element} elem removable childnode
    * @param {Element} parent
    */
  Remove: function(elem, parent)
  {
    if(typeof parent == 'object')
    {
      parent.removeChild(elem);
    }
    else
    {
      elem.parentNode.removeChild(elem);
    }
  },
  /**
  * Removes all childnode of the element
  * @param {Element} element
  */
  RemoveAll: function(element)
  {
    while(element.firstChild) 
    {
      this.Remove(element.firstChild, element);
    }
  },
  /**
    * @param {Element} inner the new content element
    * @param {Element} obj updatable element
    */
  Update: function(inner, obj)
  {
    this.RemoveAll(obj);
    this.Add(inner, obj);
  },
  /**
    * Collects the elements by their tag name
    * @param {String} tag the elements tag name
    * @param {Element} [parent] parent element
    * @return An array which contains the elements with the given tagname
    * @type {Array}
    */
  GetTag: function(tag, parent)
  {
    if(typeof parent == 'object')
    {
      return parent.getElementsByTagName(tag);
    }
    return this.doc.getElementsByTagName(tag);
  },
  /**
    * Returns the first matching tag
    * @see #GetTag
    * @param {String} tag the elements tag name
    * @param {Objecŧ} [parent] parent element
    * @return First element node
    * @type Element
    */
  GetFirstTag: function(tag, parent)
  {
    return this.GetTag(tag, parent)[0];
  },
  /**
    * Returns the document body
    * @type Element
    */
  GetBody: function()
  {
    if(this.body)
    {
      return this.body;
    }
    this.body = this.GetFirstTag('body');
    return this.body;
  },
  /**
    * Returns an element by it's id
    * @param {String} id Id of the element
    * @param {Element} [parent] parent element
    * @type Element
    */
  GetId: function(id, parent)
  {
    if(!this.elements)
    {
      this.elements = new Object();
    }
    if(!this.elements[id])
    {
      if(typeof parent == 'object')
      {
        this.elements[id] = parent.getElementById(id);
      }
      else
      {
        this.elements[id] = this.doc.getElementById(id);
      }
    }
    return this.elements[id];
  },
  /**
  * Adds the specified class to the element
  * @param {Element} el DOM element
  * @param {String} c Class name
  */
  AddClass: function(el, c)
  {
    var curClass = el.getAttribute('class');
    if(curClass === null) 
    {
      el.setAttribute('class', c);
    }
    else 
    {
      el.setAttribute('class', curClass + ' ' + c);
    }
  },
  /**
  * Removes the specified class from the element
  * @param {Element} el DOM element
  * @param {String} c Class name
  */
  RemoveClass: function(el, c)
  {
    el.setAttribute('class', el.getAttribute('class').replace(c, ''));
  },
  /**
  * Checks that the element has the specified class or not
  * @param {Element} el Element
  * @param {String} c Class name
  * @type {Boolean}
  */
  HasClass: function(el, c)
  {
    if(!el || !c) 
    {
      return false;
    }
    cl = new RegExp('\\b' + c + '\\b');
    return cl.test(el.getAttribute('class'));
  },

  /**
  * Collects the elements, which are has the specified className (cn) and childNodes of the specified node (par)
  * @param {Element} par parent element node
  * @param {String} cn className
  * @param {String} el element type
  * @param {Boolean} [force] if the par attribute is false|undefined change the parent element to the body if the value of the variable is true
  * @type {Array}
  */
  GetByClass: function(par, cn, el, force)
  {
    if(!el) 
    {
      el = '*';
    }
    if(!par) 
    {
      if(force == true) 
      {
        par = this.GetBody();
      }
      else 
      {
        return new Array();
      }
    }
    var ts = this.GetTag(el, par), out = new Array(), i, tsl = ts.length;
    for(i = 0; i < tsl; i++) 
    {
      if(this.HasClass(ts[i], cn)) 
      {
        out.push(ts[i]);
      }
    }
    return out;
  },
  /**
    * @param {String} text link content
    * @param {String} [href] url of the link
    * @return link object
    * @type Element
    */
  CreateLink: function(text, href)
  {
    var l = this.A();
    if(href) { 
      l.setAttribute('href', href);
    }
    this.Add(this.Txt(text), l)
    return l;
  }
};
/**
 * Make links from the block titles
 * @constructor
 */
var makeTitleLinks = function()
{
  for(box in this.boxes) {
    this.boxes[box](this.makeTitle);
  }
};
makeTitleLinks.prototype = {
  /**
   * Title creator functions
   */
  boxes: {
    /**
     * title for wiki block
     * @param {Function} makeTitle 
     */
    wiki: function(makeTitle)
    {
      makeTitle('block-aggregator-feed-3', 'http://wiki.hup.hu');
    },
    /**
     * title for blog block
     * @param {Function} makeTitle 
     */
    blog: function(makeTitle)
    {
      makeTitle('block-blog-0', '/blog');
    },
    /**
     * title for search block
     * @param {Function} makeTitle 
     */
    search: function(makeTitle)
    {
      makeTitle('block-search-0', '/search');
    },
    /**
     * title for poll block
     * @param {Function} makeTitle 
     */
    poll: function(makeTitle)
    {
      makeTitle('block-poll-40', '/poll');
    },
    /**
     * title for flickr block
     * @param {Function} makeTitle 
     */
    flickr: function(makeTitle)
    {
      makeTitle('block-aggregator-feed-40', 'http://www.flickr.com/photos/h_u_p/');
    },
    /**
     * title for tag cloud block
     * @param {Function} makeTitle 
     */
    temak: function(makeTitle)
    {
      makeTitle('block-tagadelic-1', '/temak');
    },
    /**
     * title for new comments block
     * @param {Function} makeTitle 
     */
    tracker: function(makeTitle)
    {
      makeTitle('block-comment-0', '/tracker');
    }
  },

  /**
   * Compose the title link
   * @param {String} contId Id of the title container div
   * @param {String} url the url of the title
   */
  makeTitle: function(contId, url)
  {
    var titleCont = HUP.El.GetId(contId);
    if(titleCont)
    {
      var t = HUP.El.GetFirstTag('h2', titleCont);
      HUP.El.Update(HUP.El.CreateLink(t.innerHTML, url), t);
    }
  }
};
/**
 * @class Timer is small bencmark utility
 * @constructor
 */
var Timer = function() {
  this.start();
};
Timer.prototype = {
  /**
   * Start the timer
   */
  start: function() {
    this.startTime = new Date();
  },
  /**
   * Stop the timer
   */
  stop: function() {
    this.endTime = new Date();
  },
  /**
   * Finish the run and return the result
   * @return The difference between the start and the and in ms
   * @type Int
   */
  finish: function() {
    return this.endTime.getTime() - this.startTime.getTime();
  }
};
var bindKeys = function() {
  HUP.w.addEventListener('keyup', checkKeypress, false);
}
var checkKeypress = function(event) {
  if(event.shiftKey && event.altKey) {
    switch(e.keyCode) {
      case 78:
        // next
        if(/^#/.test(location.hash)) {
          return;
        }
        break;
      case 80:
        // pref
        break;
    }
  }
}
/**
 * Initialization function, runs when the page is loaded
 * @param {Event} e window load event object
 */
var HUPPER = function(e)
{
  var ww = e.originalTarget;
  if(ww.location.href.match(/^https?:\/\/(?:www\.)?hup\.hu/)) 
  {
    /**
     * A unique global object to store all global objects/array/... of the Hupper Extension
     */
    var TIMER = new Timer();
    HUP = {};
    // HUP document object
    HUP.w = ww;
    // Elementer
    HUP.El = new Elementer();
    // Logger
    HUP.L = new HLog();
    // Lang stuffs
    HUP.Bundles = document.getElementById('hupper-bundles');
    // Stores the mark as read nodes
    HUP.markReadNodes = new Array();
    addHupStyles();
    // Create links from the titles
    new makeTitleLinks();
    if(HUP.El.GetId('comments')) 
    {
      var c = getComments();
      comments = c[0];
      newComments = c[1];
      indentComments = c[2];
      parseComments(comments, newComments, indentComments);
      if(newComments.length && HupperPrefs.showqnavbox()) 
      {
        appendNewNotifier();
      }
    }
    else 
    {
      if(HupperPrefs.insertnewtexttonode()) 
      {
        var newNodes = getNodes()[1];
        parseNodes(newNodes);
        if(newNodes.length > 0 && HupperPrefs.showqnavbox()) 
        {
          appendNewNotifier('#n-0', true);
        }
      }
    }
    TIMER.stop();
    HUP.L.log('initialized', 'Run time: ' + TIMER.finish() + 'ms');
  }
};