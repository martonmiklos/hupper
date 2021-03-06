import * as events from '../../core/events';
import * as testUtil from '../../core/testUtil';

let test = require('tape');

test('core/events.createEmitter.on', (t) => {
	t.plan(6);

	let emitter = events.createEmitter();

	let listener = testUtil.spy();

	emitter.on('foo', listener);

	emitter.emit('foo', 1);

	t.equal(listener.getCallCount(), 1, 'listener called');

	t.equal(listener.getCalls()[0].args.length, 2, 'event passes to arguments to the callback');
	t.equal(listener.getCalls()[0].args[0], 1, 'event passes the args to the callback');
	t.equal(listener.getCalls()[0].args[1], 'foo', 'event passes the event name to the callback');

	let anyListener = testUtil.spy();
	emitter.on('*', anyListener);

	emitter.emit('foo');

	t.equal(listener.getCallCount(), 2, 'listener called');
	t.equal(anyListener.getCallCount(), 1, 'anyListener called');

	t.end();
});

test('core/events.createEmitter.off', (t) => {
	t.test('Remove all listeners', (t) => {
		t.plan(2);
		let emitter = events.createEmitter();

		let listener = testUtil.spy();
		let listener2 = testUtil.spy();

		emitter.on('foo', listener);
		emitter.on('bar', listener2);

		emitter.off();
		emitter.emit('foo');
		emitter.emit('bar');

		t.equal(listener.getCallCount(), 0, 'Listener of first event not called');
		t.equal(listener2.getCallCount(), 0, 'Listener of second event not called');

		t.end();
	});

	t.test('Remove all listener by name', (t) => {
		t.plan(3);
		let emitter = events.createEmitter();

		let listener = testUtil.spy();
		let listener2 = testUtil.spy();
		let listener3 = testUtil.spy();

		emitter.on('foo', listener);
		emitter.on('foo', listener2);
		emitter.on('bar', listener3);

		emitter.off('foo');
		emitter.emit('foo');
		emitter.emit('bar');

		t.equal(listener.getCallCount(), 0, 'Listener unsubscribed');
		t.equal(listener2.getCallCount(), 0, 'Second listener unsubscribed');
		t.equal(listener3.getCallCount(), 1, 'Other listener kept');
		t.end();
	});


	t.test('core/events.createEmitter.off specific listener', (t) => {
		t.plan(3);

		let emitter = events.createEmitter();

		let listener = testUtil.spy();
		let listener2 = testUtil.spy();
		let listener3 = testUtil.spy();

		emitter.on('foo', listener);
		emitter.on('foo', listener2);
		emitter.on('bar', listener3);

		emitter.off('foo', listener);
		emitter.emit('foo');
		emitter.emit('bar');

		t.equal(listener.getCallCount(), 0, 'Unsubscribed listener should not be called');
		t.equal(listener2.getCallCount(), 1, 'One remaining listener called');
		t.equal(listener3.getCallCount(), 1, 'Other events not removed');

		t.end();
	});

	t.test('Invlaid argument number', (t) => {
		t.plan(3);
		let emitter = events.createEmitter();

		let listener = testUtil.spy();
		let listener2 = testUtil.spy();

		emitter.on('foo', listener);
		emitter.on('bar', listener2);

		t.throws(() => {
			emitter.off('foo', 'bar', 'baz');
		}, /Invalid number of arguments/, 'Error thrown if too many argument set');
		emitter.emit('foo');
		emitter.emit('bar');

		t.equal(listener.getCallCount(), 1, 'Listener of first event not called');
		t.equal(listener2.getCallCount(), 1, 'Listener of second event not called');

		t.end();
	});

	t.end();
});

test('core/events.createEmitter.emit all listeners', (t) => {
	t.plan(1);
	let emitter = events.createEmitter();

	let listener = testUtil.spy();

	emitter.on('foo', listener);
	emitter.on('foo', listener);
	emitter.on('foo', listener);

	emitter.emit('foo');

	t.equal(listener.getCallCount(), 3, 'called all listeners');

	t.end();
});

test('core/events.createEmitter.on adds only function listeners', (t) => {
	t.plan(1);
	let emitter = events.createEmitter();

	emitter.on('foo', 12);

	t.doesNotThrow(() => {
		emitter.emit('foo');
	},'emitter not try to call listener which is not a function');

	t.end();
});

test('core/events.createEmitter.once removes listener after call', (t) => {
	let emitter = events.createEmitter();
	let listener = testUtil.spy();

	emitter.once('foo', listener);
	emitter.emit('foo');
	emitter.emit('foo');

	t.equal(listener.getCallCount(), 1, 'Called listener only once');
	t.end();

});
