/*jshint esnext: true*/
/*global self*/
console.log('hupper.js');
(function (req) {
	'use strict';
	let dom = req('dom');

	let modBlocks = req('blocks');
	let modHupperBlock = req('hupper-block');

	let func = req('func');

	function addHupperBlock() {
		return new Promise(function (resolve) {
			modHupperBlock.addHupperBlock();
			self.port.on('hupper-block.add-menu', modHupperBlock.addMenuItem);
			self.port.on('hupper-block.hide-block', modHupperBlock.addHiddenBlock);
			self.port.on('hupper-block.show-block', modHupperBlock.removeHiddenBlock);

			document.getElementById('block-hupper').addEventListener('click', function (e) {
				let event = modBlocks.onBlockControlClick(e);
				if (event) {
					self.port.emit('block.action', event);
				}
			}, false);
			resolve();
		});
	}

	addHupperBlock().then(function () {
		self.port.on('getComments', function (options) {
			let commentsContainer = document.getElementById('comments');

			if (!commentsContainer) {
				return;
			}

			let modComment = req('comment');
			let modCommentTree = req('commenttree');

			console.log('subscribe');

			self.port.on('comments.update', modComment.onCommentUpdate);

			self.port.on('comment.setNew', function (newComments) {
				var obj = newComments.comments.map(modComment.commentDataStructToObj);
				obj.forEach((comment) => modComment.setNew(comment, newComments.text));
			});

			self.port.on('comment.addNextPrev', function (item) {
				if (item.prevId) {
					modComment.addLinkToPrevComment(item.id, item.prevId);
				}

				if (item.nextId) {
					modComment.addLinkToNextComment(item.id, item.nextId);
				}
			});

			self.port.on('comment.addParentLink', modComment.addParentLinkToComments);
			self.port.on('comment.addExpandLink', modComment.addExpandLinkToComments);

			document.querySelector('body').addEventListener('click', function (e) {
				if (e.target.nodeName === 'A') {
					return;
				}

				if (dom.closest(e.target, '.comment')) {
					return;
				}

				modComment.unwideComments();
			}, false);

			commentsContainer.addEventListener('click', function (e) {
				if (dom.is(e.target, '.expand-comment')) {
					e.preventDefault();
					modComment.unwideComments();
					modComment.widenComment(dom.prev(dom.closest(e.target, '.comment'), 'a').getAttribute('id'));

				}
			}, false);

			function convertComments(comments) {
				return comments.map((comment) => {
					let output = modComment.parseComment(modComment.getCommentFromId(comment.id), {
						content: options.content
					});

					output.children = convertComments(comment.children);

					return output;
				});
			}

			self.port.emit('gotComments', convertComments(modCommentTree.getCommentTree()));
		});

		self.port.on('enableBlockControls', function (blocks) {
			modBlocks.decorateBlocks(blocks);

			let commonParent = dom.findCommonParent(blocks.map(modBlocks.blockDataStructToBlockElement));

			console.log('enabel block controls', commonParent.id, blocks);
			
			commonParent.addEventListener('click', function (e) {
				let event = modBlocks.onBlockButtonClick(e);
				if (event) {
					self.port.emit('block.action', event);
				}
			}, false);
		});

		self.port.on('getBlocks', function () {
			self.port.on('block.hide', modBlocks.hide);
			self.port.on('block.show', modBlocks.show);

			self.port.on('block.hide-content', modBlocks.hideContent);
			self.port.on('block.show-content', modBlocks.showContent);
			self.port.on('blocks.change-order-all', function (blocks) {
				modBlocks.reorderBlocks(blocks);
				self.port.emit('blocks.change-order-all-done');
			});
			self.port.on('block.change-order', (event) => modBlocks.setBlockOrder(event.sidebar, event.blocks));

			self.port.on('block.change-column', (blocks) => modBlocks.reorderBlocks(blocks));

			self.port.on('blocks.set-titles', modBlocks.setTitles);

			self.port.emit('gotBlocks', modBlocks.getBlocks());
		});
		self.port.on('getArticles', function () {
			let modArticles = req('articles');
			let articles = modArticles.parseArticles();

			if (articles.length > 0) {
				self.port.emit('gotArticles', articles);
				self.port.on('articles.mark-new', function (data) {
					data.articles.map(modArticles.articleStructToArticleNodeStruct)
							.forEach(func.partial(modArticles.markNewArticle, data.text));
				});
			}
			self.port.on('articles.addNextPrev', function (item) {
				if (item.prevId) {
					modArticles.addLinkToPrevArticle(item.id, item.prevId);
				}

				if (item.nextId) {
					modArticles.addLinkToNextArticle(item.id, item.nextId);
				}
			});

			self.port.on('articles.add-category-hide-button', modArticles.addCategoryHideButton);

			self.port.on('articles.hide', modArticles.hideArticles);

			document.getElementById('content-both').addEventListener('click', function (e) {
				if (e.target.classList.contains('taxonomy-button')) {
					let articleStruct = modArticles.articleElementToStruct(dom.closest(e.target, '.node'));

					self.port.emit('article.hide-taxonomy', articleStruct);
				}
			}, false);
		});
	});

	self.port.on('setUnlimitedLinks', function () {
		let modUnlimitedlinks = req('unlimitedlinks');
		func.toArray(document.getElementsByTagName('a'))
				.filter(modUnlimitedlinks.isExtendableLink)
				.forEach(modUnlimitedlinks.makeExtendable);
	});
}(window.req));
