function index (array, cb) {
	for (let i = 0, al = array.length; i < al; i++) {
		if (cb(array[i])) {
			return i;
		}
	}

	return -1;
}

function first (array, cb) {
	let i = index(array, cb);

	if (i > -1) {
		return array[i];
	}

	return null;
}

function inArray (array, item) {
	return array.indexOf(item) > -1;
}

/**
 * @param NodeList list
 * @return {HTMLDOMElement[]}
 */
function toArray (list) {
	return Array.prototype.slice.call(list);
}

function sortBy (array, field) {
	return array.sort((a, b) => {
		let aVal = a[field],
			bVal = b[field];

		if (aVal > bVal) {
			return 1;
		} else if (aVal < bVal) {
			return -1;
		}

		return 0;
	});
}

function yesOrNo (isOk, yes, no) {
	return isOk ? yes() : no();
}

function groupBy (array, field) {
	return array.reduce((acc, item) => {
		if (!acc[item[field]]) {
			acc[item[field]] = [];
		}

		acc[item[field]].push(item);

		return acc;
	}, {});
}

function hex2rgb (hexcolor) {
	hexcolor = hexcolor[0] === '#' ? hexcolor.slice(1) : hexcolor;

	return [
		parseInt(hexcolor.substr(0,2), 16),
		parseInt(hexcolor.substr(2,2), 16),
		parseInt(hexcolor.substr(4,2), 16)
	];
}

function random (min = 0, max = 1, int = false) {
	if (!int) {
		return Math.random() * (max - min) + min;
	}

	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function padStart (str, len, padString = ' ') {
	let output = '';
	let strLen = str.length;

	while (output.length + strLen < len) {
		output += padString;
	}

	return output + str;
}

function toCamelCase (text) {
	return text.split(/[^a-zA-Z0-9]+/)
		.filter(w => w.length > 0)
		.map((word, index) => index === 0 ?
			word[0].toLowerCase() + word.slice(1) :
			word[0].toUpperCase() + word.slice(1))
		.join('');
}

function maxBy (array, field) {
	return array.reduce((acc, i) => acc[field] > i[field] ? acc : i, {[field]: -Infinity});
}

const negate = func => (...args) => !func(...args);

function compose (...args) {
	return args.reduce((accu, fn) => {
		return fn(accu);
	}, null);
}

const curry = (fn, ...args) => (...args2) => fn.apply(null, args.concat(args2));

const partial = curry;

function always (arg) {
	return () => arg;
}

function recurse (comments, callback, parent) {
	return comments.reduce((array, comment, index) => {
		// const output = Object.assign({}, comment, callback(comment, parent));
		const output = callback(comment, parent);

		output.children = recurse(comment.children, callback, output);
		array[index] = output;

		return array;
	}, new Array(comments.length));
}

function flow (...args) {
	return args.reduce((acc, cb) => cb(acc), null);
}

export {
	first,
	index,
	partial,
	toArray,
	inArray,
	yesOrNo,
	sortBy,
	groupBy,
	random,
	padStart,
	toCamelCase,
	maxBy,
	hex2rgb,
	negate,
	compose,
	curry,
	always,
	recurse,
	flow
};
