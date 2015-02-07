/*jshint moz:true*/
console.log('comments.js');
(function ($, def, req) {
	'use strict';
	def('comment', function () {
		const TROLL_COMMENT_CLASS = 'trollComment';
		const TROLL_COMMENT_HEADER_CLASS = 'trollHeader';
		const TROLL_COMMENT_REPLY_CLASS = 'trollCommentAnswer';
		const HIGHLIGHTED_COMMENT_CLASS = 'highlighted';
		const COMMENT_HEADER_CLASS = 'submitted';
		const NEW_COMMENT_CLASS = 'comment-new';
		const COMMENT_CLASS = 'comment';
		const COMMENT_NEW_MARKER_CLASS = 'new';
		const ANONYM_COMMENT_AUTHOR_REGEXP = /[^\(]+\( ([^ ]+).*/;
		const COMMENT_DATE_REGEXP = /[\s\|]+([0-9]+)\.\s([a-zúőűáéóüöí]+)\s+([0-9]+)\.,\s+([a-zűáéúőóüöí]+)\s+-\s+(\d+):(\d+).*/;
		const COMMENT_MONTH_NAMES = {
			'január': 0,
			'február': 1,
			'március': 2,
			'április': 3,
			'május': 4,
			'június': 5,
			'július': 6,
			'augusztus': 7,
			'szeptember': 8,
			'október': 9,
			'november': 10,
			'december': 11
		};

		var dom = req('dom');

		/**
		 * @type commentDataStruct
		 *   isNew Boolean
		 *   author String
		 *   created Timestamp
		 */
		var commentDataStruct = {
			isNew: false,
			author: '',
			created: 0,
			id: ''
		};

		/**
		 * @type commentStruct
		 *   node: jQueryObject
		 *   header: jQueryObject
		 */
		var commentStruct = {
			node: null,
			header: null
		};

		/**
		 * @param commentStruct comment
		 * @return string
		 */
		function getCommentAuthor(comment) {
			var output = '';

			output = comment.header.querySelector('a').textContent.trim();

			if (output === '') {
				output = comment.header.textContent.replace(ANONYM_COMMENT_AUTHOR_REGEXP, '$1');
			}
			return output;
		}

		/**
		 * @param commentStruct comment
		 * @return Timestamp
		 */
		function getCommentCreateDate(comment) {
			var date, dateMatch;
			dateMatch = comment.header.textContent.match(COMMENT_DATE_REGEXP);
			date = new Date();
			date.setYear(dateMatch[1]);
			date.setMonth(COMMENT_MONTH_NAMES[dateMatch[2]]);
			date.setDate(dateMatch[3]);
			date.setHours(dateMatch[5]);
			date.setMinutes(dateMatch[6]);
			return date.getTime();
		}

		/**
		 * @param commentStruct comment
		 * @return String
		 */
		function getCommentId(comment) {
			var element = dom.prev(comment.node, 'a');

			if (element) {
				return element.getAttribute('id');
			}

			return '';
		}

		/**
		 * @param HTMLCommentNode node
		 * @return Object
		 *   node: jQueryObject
		 *   header: jQueryObject
		 */
		function getCommentObj(node) {
			var commentObj = Object.create(commentStruct);

			commentObj.node = node;
			commentObj.header = node.querySelector('.' + COMMENT_HEADER_CLASS);

			return commentObj;
		}

		/**
		 * @param HTMLCommentElementNode node
		 * @return commentDataStruct
		 */
		function parseComment(node) {
			var output = Object.create(commentDataStruct);
			var commentObj = getCommentObj(node);
			output.isNew = commentObj.node.classList.contains(NEW_COMMENT_CLASS);
			output.author = getCommentAuthor(commentObj);
			output.created = getCommentCreateDate(commentObj);
			output.id = getCommentId(commentObj);
			return output;
		}

		/**
		 *
		 * @param commentStruct comment
		 */
		function getNewMarkerElement(comment) {
			return comment.node.querySelector('.' + COMMENT_NEW_MARKER_CLASS);
		}
		
		/**
		 * @param commentStruct comment
		 * @param string text
		 */
		function setNew(comment, text) {
			getNewMarkerElement(comment).textContent = text;
		}

		/**
		 * @param string id Comment id
		 * @param string nextCommentId
		 */
		function addLinkToPrevComment(id, prevCommentId) {
			var comment = getCommentObj(getCommentFromId(id)),
				link;

			link = document.createElement('a');
			link.href = '#' + prevCommentId;
			link.textContent = 'Prev';

			addHNav(comment);
			comment.header.querySelector('.hnav').appendChild(link);
		}

		/**
		 * @param string id Comment id
		 * @param string nextCommentId
		 */
		function addLinkToNextComment(id, nextCommentId) {
			var comment = getCommentObj(getCommentFromId(id)),
				link;

			link = document.createElement('a');
			link.href = '#' + nextCommentId;
			link.textContent = 'Next';

			addHNav(comment);
			comment.header.querySelector('.hnav').appendChild(link);
		}

		function addHNav(comment) {
			if (!comment.header.querySelector('.hnav')) {
				var span = document.createElement('span');
				span.classList.add('hnav');

				comment.header.appendChild(span);
			}
		}

		/**
		 * @param string id Comment id
		 * @return jQueryObject Comment element
		 */
		function getCommentFromId(id) {
			var elem = document.getElementById(id);

			return dom.next(elem, '.' + COMMENT_CLASS);
		}

		/**
		 * @param commentDataStruct comment
		 * @return commentStruct
		 */
		function commentDataStructToObj(comment) {
			var item = getCommentFromId(comment.id);

			return getCommentObj(item);
		}

		function setTroll(comment) {
			comment.node.classList.add(TROLL_COMMENT_CLASS);
			comment.header.classList.add(TROLL_COMMENT_HEADER_CLASS);

			var replies = dom.next(comment.node, '.indented');

			if (replies) {
				replies.classList.add(TROLL_COMMENT_REPLY_CLASS);
			}
		}

		function unsetTroll(comment) {
			comment.node.classList.remove(TROLL_COMMENT_CLASS);
			comment.header.classList.remove(TROLL_COMMENT_HEADER_CLASS);

			var replies = dom.next(comment.node, '.indented');

			if (replies) {
				replies.classList.remove(TROLL_COMMENT_REPLY_CLASS);
			}
		}

		/**
		 * @return commentDataStruct[]
		 */
		function getTrollComments() {
			return Array.prototype.slice.call(document.querySelectorAll('.' + TROLL_COMMENT_CLASS)).map(parseComment);
		}

		/**
		 * @return commentDataStruct[]
		 */
		function getHighlightedComments() {
			return Array.prototype.slice.call(document.querySelectorAll('.' + HIGHLIGHTED_COMMENT_CLASS)).map(parseComment);
		}

		/**
		 * @param commentStruct[] trollComments
		 */
		function setTrolls(trollComments) {
			getTrollComments()
				.filter(function (comment) {
					return trollComments.indexOf(comment.author) === -1;
				})
				.map(function (comment) {
					return getCommentObj(getCommentFromId(comment.id));
				})
				.forEach(unsetTroll);

			trollComments.map(function (comment) {
				return getCommentObj(getCommentFromId(comment.id));
			}).forEach(setTroll);
		}

		function unsetTrolls() {
			var trolled = Array.prototype.slice.call(document.querySelectorAll([
				'.' + TROLL_COMMENT_CLASS,
				'.' + TROLL_COMMENT_HEADER_CLASS,
				'.' + TROLL_COMMENT_REPLY_CLASS
			].join(',')));

			trolled.forEach(function (element) {
				element.classList.remove(TROLL_COMMENT_CLASS, TROLL_COMMENT_HEADER_CLASS, TROLL_COMMENT_REPLY_CLASS);
			});
		}

		function unhighlightComment(comment) {
			comment.node.classList.remove(HIGHLIGHTED_COMMENT_CLASS);
			comment.header.style.backgroundColor = '';
		}

		function highlightComments(comments) {
			getHighlightedComments()
				.filter(function (comment) {
					return comments.indexOf(comment.author) === -1;
				})
				.map(function (comment) {
					return getCommentObj(getCommentFromId(comment.id));
				})
				.forEach(unhighlightComment);

			comments.forEach(function (comment) {
				var commentObj = commentDataStructToObj(comment);

				commentObj.node.classList.add(HIGHLIGHTED_COMMENT_CLASS);
				commentObj.header.style.backgroundColor = comment.userColor;
			});
		}

		return {
			parseComment: parseComment,
			setNew: setNew,
			commentDataStructToObj: commentDataStructToObj,
			addLinkToNextComment: addLinkToNextComment,
			addLinkToPrevComment: addLinkToPrevComment,
			setTrolls: setTrolls,
			unsetTrolls: unsetTrolls,
			highlightComments: highlightComments
		};
	});
}(window.jQuery, window.def, window.req));
