/* global chrome:true */
import * as modBlocks from './core/blocks';
import * as modArticles from './core/articles';
import * as modHupperBlock  from './core/hupper-block';
import * as modComment from './core/comments';

import * as unlimitedlinks from './core/unlimitedlinks';
import * as modCommentTree from './core/commenttree';

import { log } from '../core/log';

log.log(modBlocks, modArticles, modHupperBlock, modComment);

function getCommentObjects (options) {
	let commentsContainer = document.getElementById('comments');

	if (!commentsContainer) {
		return;
	}

	return modComment.convertComments(modCommentTree.getCommentTree(), options);
}

function getContextUser (data) {

	let url = new URL(data.linkUrl);
	let elem = document.querySelector(`.comment .submitted > a[href$="${url.pathname}"]`);

	if (elem === null) {
		elem = document.querySelector(`.node > table > tbody > tr > td:nth-child(1) > a[href$="${url.pathname}"]`);
	}

	return elem ? elem.textContent : null;
}

function updateComments () {
	let comments = getCommentObjects({content: true});

	if (!comments) {
		return;
	}

	chrome.runtime.sendMessage({
		event: 'requestCommentParse',
		data: comments
	}, function (comments) {
		if (comments) {
			console.log(comments);

			modComment.onCommentUpdate(comments);
			let childComments = comments.filter(c => c.parent !== '');
			modComment.addParentLinkToComments(childComments);
			modComment.addExpandLinkToComments(childComments.filter(c => c.indentLevel > 1));

			let newComments = comments.filter(c => c.isNew && !c.hide);
			newComments.forEach(modComment.onCommentAddNextPrev);
			modComment.onCommentSetNew(newComments);
		}
	});
}

function updateArticles () {
	let articles = modArticles.parseArticles();

	if (!articles) {
		return;
	}

	chrome.runtime.sendMessage({
		event: 'requestArticleParse',
		data: articles
	}, function (articles) {
		if (articles) {
			modArticles.hideArticles(articles.filter(a => a.hide));
			modArticles.onMarkNew(articles);
			articles.filter(a => a.hasOwnProperty('nextId') || a.hasOwnProperty('prevId'))
				.forEach(modArticles.onArticleAddNextPrev);
			modArticles.onAddCategoryHideButton(articles);
		}
	});
}

function updateBlocks () {
	let blocks = modBlocks.getBlocks();

	if (!blocks.left && !blocks.right) {
		return;
	}

	chrome.runtime.sendMessage({
		event: 'requestBlockParse',
		data: blocks
	}, function (blocks) {
		console.log('block responses', blocks);
		if (blocks) {
			console.log(blocks);
			modBlocks.reorderBlocks(blocks);
			modBlocks.decorateBlocks(blocks);
		}
	});
}

function addBlockListeners () {
	modBlocks.onEnableBlockControls(function (event) {
		chrome.runtime.sendMessage({
			event: 'block.action',
			data: event,
			context: modBlocks.getBlocks()
		}, function (response) {
			switch (event.action) {
			case 'up':
			case 'down':
			case 'left':
			case 'right':
				modBlocks.reorderBlocks(response);
				break;
			default:
				modBlocks.toggleBlock(response);
				return;
			}
		});
	});
}

function addArticleListeners () {
	modArticles.listenToTaxonomyButtonClick(function (article) {
		chrome.runtime.sendMessage({event: 'article.hide-taxonomy', data: article}, updateArticles);
	});
}

function addCommentListeners () {
	let commentsContainer = document.getElementById('comments');

	if (commentsContainer) {
		document.querySelector('body').addEventListener('click', modComment.onBodyClick, false);
		commentsContainer.addEventListener('click', modComment.onCommentsContainerClick, false);
	}
}

function addHupperBlockListeners () {
	console.log('add hupper block listeners');
	document.getElementById('block-hupper').addEventListener('click', function (e) {
		let event = modBlocks.onBlockControlClick(e);
		if (!event) {
			return;
		}

		chrome.runtime.sendMessage({event: 'block.action', data: event}, function (block) {
			modBlocks.toggleBlock(block);
		});
	}, false);
}

window.addEventListener('DOMContentLoaded', function () {
	chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
		switch (msg.event) {
		case 'trolluser':
		case 'untrolluser':
		case 'highlightuser':
		case 'unhighlightuser':
			sendResponse({event: msg.event, data: getContextUser(msg.data)});
			break;

		case 'userChange':
			updateComments();
		}
	});

	chrome.runtime.sendMessage({event: 'register'}, function (response) {
		if (response.event === 'registered') {
			if (response.data.setunlimitedlinks) {
				unlimitedlinks.setUnlimitedLinks();
			}

			if (response.data.parseblocks) {
				modHupperBlock.addHupperBlock();
				addHupperBlockListeners();
				updateBlocks();
			}
			updateComments();
			updateArticles();
			addCommentListeners();
			addBlockListeners();
			addArticleListeners();
		}
	});
}, false);