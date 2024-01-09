let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { readFileSync, mkdirSync, writeFileSync, readdirSync, rmdirSync, rmSync, existsSync, lstatSync } = require(`fs`);
const { TextDecoder, TextEncoder } = require(`util`);

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_26(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h51bf4e6dd1611b16(arg0, arg1, addHeapObject(arg2));
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
function __wbg_adapter_255(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h94557e7ecaaa646f(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
module.exports.StatType = Object.freeze({ File:0,"0":"File",Dir:1,"1":"Dir", });
/**
*/
class BranchName {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BranchName.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_branchname_free(ptr);
    }
    /**
    * @returns {string}
    */
    get 0() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_branchname_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 0(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_branchname_0(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.BranchName = BranchName;
/**
*/
class Bundle {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bundle_free(ptr);
    }
    /**
    * @returns {(BundleTrace)[]}
    */
    get traces() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_bundle_traces(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(BundleTrace)[]} arg0
    */
    set traces(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_bundle_traces(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {(BundleObject)[]}
    */
    get objs() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_bundle_objs(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(BundleObject)[]} arg0
    */
    set objs(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_bundle_objs(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {(BundleBranch)[]}
    */
    get branches() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_bundle_branches(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(BundleBranch)[]} arg0
    */
    set branches(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_bundle_branches(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.Bundle = Bundle;
/**
*/
class BundleBranch {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BundleBranch.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof BundleBranch)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bundlebranch_free(ptr);
    }
    /**
    * @returns {BranchName}
    */
    get branch_name() {
        const ret = wasm.__wbg_get_bundlebranch_branch_name(this.__wbg_ptr);
        return BranchName.__wrap(ret);
    }
    /**
    * @param {BranchName} arg0
    */
    set branch_name(arg0) {
        _assertClass(arg0, BranchName);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_bundlebranch_branch_name(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {(CommitHash)[]}
    */
    get commits() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_bundlebranch_commits(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(CommitHash)[]} arg0
    */
    set commits(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_bundlebranch_commits(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.BundleBranch = BundleBranch;
/**
*/
class BundleObject {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BundleObject.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof BundleObject)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bundleobject_free(ptr);
    }
    /**
    * @returns {ObjHash}
    */
    get hash() {
        const ret = wasm.__wbg_get_bundleobject_hash(this.__wbg_ptr);
        return ObjHash.__wrap(ret);
    }
    /**
    * @param {ObjHash} arg0
    */
    set hash(arg0) {
        _assertClass(arg0, ObjHash);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_bundleobject_hash(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {CompressedBuf}
    */
    get compressed_buf() {
        const ret = wasm.__wbg_get_bundleobject_compressed_buf(this.__wbg_ptr);
        return CompressedBuf.__wrap(ret);
    }
    /**
    * @param {CompressedBuf} arg0
    */
    set compressed_buf(arg0) {
        _assertClass(arg0, CompressedBuf);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_bundleobject_compressed_buf(this.__wbg_ptr, ptr0);
    }
}
module.exports.BundleObject = BundleObject;
/**
*/
class BundleTrace {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BundleTrace.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof BundleTrace)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bundletrace_free(ptr);
    }
    /**
    * @returns {CommitHash}
    */
    get commit_hash() {
        const ret = wasm.__wbg_get_bundlebranch_branch_name(this.__wbg_ptr);
        return CommitHash.__wrap(ret);
    }
    /**
    * @param {CommitHash} arg0
    */
    set commit_hash(arg0) {
        _assertClass(arg0, CommitHash);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_bundlebranch_branch_name(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {ObjHash}
    */
    get obj_hash() {
        const ret = wasm.__wbg_get_bundletrace_obj_hash(this.__wbg_ptr);
        return ObjHash.__wrap(ret);
    }
    /**
    * @param {ObjHash} arg0
    */
    set obj_hash(arg0) {
        _assertClass(arg0, ObjHash);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_bundleobject_compressed_buf(this.__wbg_ptr, ptr0);
    }
}
module.exports.BundleTrace = BundleTrace;
/**
*/
class Close {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_close_free(ptr);
    }
    /**
    * @returns {DiscussionId}
    */
    get discussion_id() {
        const ret = wasm.__wbg_get_close_discussion_id(this.__wbg_ptr);
        return DiscussionId.__wrap(ret);
    }
    /**
    * @param {DiscussionId} arg0
    */
    set discussion_id(arg0) {
        _assertClass(arg0, DiscussionId);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_close_discussion_id(this.__wbg_ptr, ptr0);
    }
}
module.exports.Close = Close;
/**
*/
class Closed {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_closed_free(ptr);
    }
    /**
    * @returns {DiscussionId}
    */
    get discussion_id() {
        const ret = wasm.__wbg_get_close_discussion_id(this.__wbg_ptr);
        return DiscussionId.__wrap(ret);
    }
    /**
    * @param {DiscussionId} arg0
    */
    set discussion_id(arg0) {
        _assertClass(arg0, DiscussionId);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_close_discussion_id(this.__wbg_ptr, ptr0);
    }
}
module.exports.Closed = Closed;
/**
*/
class CommitHash {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CommitHash.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof CommitHash)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_commithash_free(ptr);
    }
    /**
    * @returns {ObjHash}
    */
    get 0() {
        const ret = wasm.__wbg_get_bundleobject_hash(this.__wbg_ptr);
        return ObjHash.__wrap(ret);
    }
    /**
    * @param {ObjHash} arg0
    */
    set 0(arg0) {
        _assertClass(arg0, ObjHash);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_bundleobject_hash(this.__wbg_ptr, ptr0);
    }
}
module.exports.CommitHash = CommitHash;
/**
*/
class CommitText {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_committext_free(ptr);
    }
    /**
    * @returns {string}
    */
    get 0() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_committext_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 0(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_committext_0(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.CommitText = CommitText;
/**
*/
class CompressedBuf {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CompressedBuf.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_compressedbuf_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    get 0() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_compressedbuf_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} arg0
    */
    set 0(arg0) {
        const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_compressedbuf_0(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.CompressedBuf = CompressedBuf;
/**
*/
class Conflict {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_conflict_free(ptr);
    }
    /**
    * @returns {FilePath}
    */
    get file_path() {
        const ret = wasm.__wbg_get_conflict_file_path(this.__wbg_ptr);
        return FilePath.__wrap(ret);
    }
    /**
    * @param {FilePath} arg0
    */
    set file_path(arg0) {
        _assertClass(arg0, FilePath);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_conflict_file_path(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {ObjHash}
    */
    get source() {
        const ret = wasm.__wbg_get_conflict_source(this.__wbg_ptr);
        return ObjHash.__wrap(ret);
    }
    /**
    * @param {ObjHash} arg0
    */
    set source(arg0) {
        _assertClass(arg0, ObjHash);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_conflict_source(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {ObjHash}
    */
    get dist() {
        const ret = wasm.__wbg_get_conflict_dist(this.__wbg_ptr);
        return ObjHash.__wrap(ret);
    }
    /**
    * @param {ObjHash} arg0
    */
    set dist(arg0) {
        _assertClass(arg0, ObjHash);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_conflict_dist(this.__wbg_ptr, ptr0);
    }
}
module.exports.Conflict = Conflict;
/**
*/
class Create {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_create_free(ptr);
    }
    /**
    * @returns {string}
    */
    get title() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_create_title(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set title(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_create_title(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {string} title
    */
    constructor(title) {
        const ptr0 = passStringToWasm0(title, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.create_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
module.exports.Create = Create;
/**
*/
class Created {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_created_free(ptr);
    }
    /**
    * @returns {DiscussionMeta}
    */
    get meta() {
        const ret = wasm.__wbg_get_created_meta(this.__wbg_ptr);
        return DiscussionMeta.__wrap(ret);
    }
    /**
    * @param {DiscussionMeta} arg0
    */
    set meta(arg0) {
        _assertClass(arg0, DiscussionMeta);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_created_meta(this.__wbg_ptr, ptr0);
    }
    /**
    * @param {DiscussionMeta} meta
    */
    constructor(meta) {
        _assertClass(meta, DiscussionMeta);
        var ptr0 = meta.__destroy_into_raw();
        const ret = wasm.created_new(ptr0);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
module.exports.Created = Created;
/**
*/
class Discussion {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_discussion_free(ptr);
    }
    /**
    * @returns {DiscussionMeta}
    */
    get meta() {
        const ret = wasm.__wbg_get_discussion_meta(this.__wbg_ptr);
        return DiscussionMeta.__wrap(ret);
    }
    /**
    * @param {DiscussionMeta} arg0
    */
    set meta(arg0) {
        _assertClass(arg0, DiscussionMeta);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_discussion_meta(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {(MessageId)[]}
    */
    get messages() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_discussion_messages(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(MessageId)[]} arg0
    */
    set messages(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_discussion_messages(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {DiscussionMeta} meta
    */
    constructor(meta) {
        _assertClass(meta, DiscussionMeta);
        var ptr0 = meta.__destroy_into_raw();
        const ret = wasm.discussion_from_meta(ptr0);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
module.exports.Discussion = Discussion;
/**
*/
class DiscussionId {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(DiscussionId.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_discussionid_free(ptr);
    }
    /**
    * @returns {string}
    */
    get 0() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_discussionid_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 0(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_discussionid_0(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {string} id
    */
    constructor(id) {
        const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.discussionid_from_string(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @returns {string}
    */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.discussionid_toString(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
module.exports.DiscussionId = DiscussionId;
/**
*/
class DiscussionMeta {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(DiscussionMeta.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_discussionmeta_free(ptr);
    }
    /**
    * @returns {DiscussionId}
    */
    get id() {
        const ret = wasm.__wbg_get_discussionmeta_id(this.__wbg_ptr);
        return DiscussionId.__wrap(ret);
    }
    /**
    * @param {DiscussionId} arg0
    */
    set id(arg0) {
        _assertClass(arg0, DiscussionId);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_discussionmeta_id(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {string}
    */
    get title() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_discussionmeta_title(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set title(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_discussionmeta_title(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {UserId}
    */
    get creator() {
        const ret = wasm.__wbg_get_discussionmeta_creator(this.__wbg_ptr);
        return UserId.__wrap(ret);
    }
    /**
    * @param {UserId} arg0
    */
    set creator(arg0) {
        _assertClass(arg0, UserId);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_discussionmeta_creator(this.__wbg_ptr, ptr0);
    }
    /**
    * @param {DiscussionId} id
    * @param {string} title
    * @param {UserId} creator
    */
    constructor(id, title, creator) {
        _assertClass(id, DiscussionId);
        var ptr0 = id.__destroy_into_raw();
        const ptr1 = passStringToWasm0(title, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        _assertClass(creator, UserId);
        var ptr2 = creator.__destroy_into_raw();
        const ret = wasm.discussionmeta_new(ptr0, ptr1, len1, ptr2);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
module.exports.DiscussionMeta = DiscussionMeta;
/**
*/
class FilePath {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FilePath.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_filepath_free(ptr);
    }
    /**
    * @returns {string}
    */
    get 0() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_filepath_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 0(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_filepath_0(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.FilePath = FilePath;
/**
*/
class Message {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Message.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_message_free(ptr);
    }
    /**
    * @returns {MessageId}
    */
    get id() {
        const ret = wasm.__wbg_get_message_id(this.__wbg_ptr);
        return MessageId.__wrap(ret);
    }
    /**
    * @param {MessageId} arg0
    */
    set id(arg0) {
        _assertClass(arg0, MessageId);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_message_id(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {UserId}
    */
    get user_id() {
        const ret = wasm.__wbg_get_message_user_id(this.__wbg_ptr);
        return UserId.__wrap(ret);
    }
    /**
    * @param {UserId} arg0
    */
    set user_id(arg0) {
        _assertClass(arg0, UserId);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_message_user_id(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {MessageText}
    */
    get text() {
        const ret = wasm.__wbg_get_message_text(this.__wbg_ptr);
        return MessageText.__wrap(ret);
    }
    /**
    * @param {MessageText} arg0
    */
    set text(arg0) {
        _assertClass(arg0, MessageText);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_message_text(this.__wbg_ptr, ptr0);
    }
    /**
    * @param {string} user_id
    * @param {string} text
    */
    constructor(user_id, text) {
        const ptr0 = passStringToWasm0(user_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.message_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
module.exports.Message = Message;
/**
*/
class MessageId {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(MessageId.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof MessageId)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_messageid_free(ptr);
    }
    /**
    * @returns {string}
    */
    get 0() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_messageid_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 0(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_messageid_0(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {string} text
    */
    constructor(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.messageid_wasm_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
module.exports.MessageId = MessageId;
/**
*/
class MessageText {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(MessageText.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_messagetext_free(ptr);
    }
    /**
    * @returns {string}
    */
    get 0() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_messageid_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 0(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_messageid_0(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {string} text
    */
    constructor(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.messageid_wasm_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
module.exports.MessageText = MessageText;
/**
*/
class MkdirOptions {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(MkdirOptions.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mkdiroptions_free(ptr);
    }
    /**
    * @returns {boolean}
    */
    get recursive() {
        const ret = wasm.__wbg_get_mkdiroptions_recursive(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set recursive(arg0) {
        wasm.__wbg_set_mkdiroptions_recursive(this.__wbg_ptr, arg0);
    }
}
module.exports.MkdirOptions = MkdirOptions;
/**
*/
class MockFile {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mockfile_free(ptr);
    }
    /**
    * @returns {bigint}
    */
    get create_time() {
        const ret = wasm.__wbg_get_mockfile_create_time(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set create_time(arg0) {
        wasm.__wbg_set_mockfile_create_time(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {bigint}
    */
    get update_time() {
        const ret = wasm.__wbg_get_mockfile_update_time(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set update_time(arg0) {
        wasm.__wbg_set_mockfile_update_time(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {Uint8Array}
    */
    get buf() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_mockfile_buf(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} arg0
    */
    set buf(arg0) {
        const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_mockfile_buf(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.MockFile = MockFile;
/**
*/
class NodeFileSystem {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nodefilesystem_free(ptr);
    }
    /**
    * @returns {string}
    */
    get workspace_folder() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_nodefilesystem_workspace_folder(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set workspace_folder(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_nodefilesystem_workspace_folder(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {string} workspace_folder
    */
    constructor(workspace_folder) {
        const ptr0 = passStringToWasm0(workspace_folder, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.nodefilesystem_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @param {string} path
    * @returns {string}
    */
    path(path) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nodefilesystem_path(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
    * @param {string} path
    */
    create_dir_api(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nodefilesystem_create_dir_api(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} path
    * @param {Uint8Array} buf
    */
    write_file_api(path, buf) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(buf, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.nodefilesystem_write_file_api(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} path
    * @returns {(string)[] | undefined}
    */
    read_dir_api(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nodefilesystem_read_dir_api(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            if (r3) {
                throw takeObject(r2);
            }
            let v2;
            if (r0 !== 0) {
                v2 = getArrayJsValueFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 4, 4);
            }
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} path
    * @returns {Uint8Array | undefined}
    */
    read_file_api(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nodefilesystem_read_file_api(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            if (r3) {
                throw takeObject(r2);
            }
            let v2;
            if (r0 !== 0) {
                v2 = getArrayU8FromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} path
    */
    delete_api(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nodefilesystem_delete_api(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} path
    * @returns {Stat | undefined}
    */
    stat_api(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.nodefilesystem_stat_api(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return r0 === 0 ? undefined : Stat.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.NodeFileSystem = NodeFileSystem;
/**
*/
class ObjHash {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ObjHash.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_objhash_free(ptr);
    }
    /**
    * @returns {string}
    */
    get 0() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_objhash_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 0(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_compressedbuf_0(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.ObjHash = ObjHash;
/**
*/
class Replied {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_replied_free(ptr);
    }
    /**
    * @returns {MessageId}
    */
    get to() {
        const ret = wasm.__wbg_get_close_discussion_id(this.__wbg_ptr);
        return MessageId.__wrap(ret);
    }
    /**
    * @param {MessageId} arg0
    */
    set to(arg0) {
        _assertClass(arg0, MessageId);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_close_discussion_id(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Message}
    */
    get message() {
        const ret = wasm.__wbg_get_replied_message(this.__wbg_ptr);
        return Message.__wrap(ret);
    }
    /**
    * @param {Message} arg0
    */
    set message(arg0) {
        _assertClass(arg0, Message);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_replied_message(this.__wbg_ptr, ptr0);
    }
    /**
    * @param {string} target_id
    * @param {Message} message
    */
    constructor(target_id, message) {
        const ptr0 = passStringToWasm0(target_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(message, Message);
        var ptr1 = message.__destroy_into_raw();
        const ret = wasm.replied_wasm_new(ptr0, len0, ptr1);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
module.exports.Replied = Replied;
/**
*/
class Reply {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_reply_free(ptr);
    }
    /**
    * @returns {MessageId}
    */
    get to() {
        const ret = wasm.__wbg_get_close_discussion_id(this.__wbg_ptr);
        return MessageId.__wrap(ret);
    }
    /**
    * @param {MessageId} arg0
    */
    set to(arg0) {
        _assertClass(arg0, MessageId);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_close_discussion_id(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {MessageText}
    */
    get text() {
        const ret = wasm.__wbg_get_reply_text(this.__wbg_ptr);
        return MessageText.__wrap(ret);
    }
    /**
    * @param {MessageText} arg0
    */
    set text(arg0) {
        _assertClass(arg0, MessageText);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_reply_text(this.__wbg_ptr, ptr0);
    }
    /**
    * @param {string} target_id
    * @param {string} text
    */
    constructor(target_id, text) {
        const ptr0 = passStringToWasm0(target_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.reply_wasm_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
module.exports.Reply = Reply;
/**
*/
class RoomId {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RoomId.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_roomid_free(ptr);
    }
    /**
    * @returns {string}
    */
    get 0() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_discussionid_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 0(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_discussionid_0(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.RoomId = RoomId;
/**
*/
class SessionConfigs {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SessionConfigs.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sessionconfigs_free(ptr);
    }
    /**
    * @returns {RoomId}
    */
    get room_id() {
        const ret = wasm.__wbg_get_sessionconfigs_room_id(this.__wbg_ptr);
        return RoomId.__wrap(ret);
    }
    /**
    * @param {RoomId} arg0
    */
    set room_id(arg0) {
        _assertClass(arg0, RoomId);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_sessionconfigs_room_id(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {SessionId}
    */
    get session_id() {
        const ret = wasm.__wbg_get_sessionconfigs_session_id(this.__wbg_ptr);
        return SessionId.__wrap(ret);
    }
    /**
    * @param {SessionId} arg0
    */
    set session_id(arg0) {
        _assertClass(arg0, SessionId);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_sessionconfigs_session_id(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {UserId}
    */
    get user_id() {
        const ret = wasm.__wbg_get_sessionconfigs_user_id(this.__wbg_ptr);
        return UserId.__wrap(ret);
    }
    /**
    * @param {UserId} arg0
    */
    set user_id(arg0) {
        _assertClass(arg0, UserId);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_sessionconfigs_user_id(this.__wbg_ptr, ptr0);
    }
    /**
    * @param {string} session_id
    * @param {string} room_id
    * @param {string} user_id
    */
    constructor(session_id, room_id, user_id) {
        const ptr0 = passStringToWasm0(session_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(room_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(user_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.sessionconfigs_wasm_new(ptr0, len0, ptr1, len1, ptr2, len2);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
module.exports.SessionConfigs = SessionConfigs;
/**
*/
class SessionId {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SessionId.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sessionid_free(ptr);
    }
    /**
    * @returns {string}
    */
    get 0() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_discussionid_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 0(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_discussionid_0(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {string} id
    */
    constructor(id) {
        const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.discussionid_from_string(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
module.exports.SessionId = SessionId;
/**
*/
class Speak {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_speak_free(ptr);
    }
    /**
    * @returns {DiscussionId}
    */
    get discussion_id() {
        const ret = wasm.__wbg_get_close_discussion_id(this.__wbg_ptr);
        return DiscussionId.__wrap(ret);
    }
    /**
    * @param {DiscussionId} arg0
    */
    set discussion_id(arg0) {
        _assertClass(arg0, DiscussionId);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_close_discussion_id(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {MessageText}
    */
    get text() {
        const ret = wasm.__wbg_get_reply_text(this.__wbg_ptr);
        return MessageText.__wrap(ret);
    }
    /**
    * @param {MessageText} arg0
    */
    set text(arg0) {
        _assertClass(arg0, MessageText);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_reply_text(this.__wbg_ptr, ptr0);
    }
}
module.exports.Speak = Speak;
/**
*/
class Spoke {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_spoke_free(ptr);
    }
    /**
    * @returns {DiscussionId}
    */
    get discussion_id() {
        const ret = wasm.__wbg_get_close_discussion_id(this.__wbg_ptr);
        return DiscussionId.__wrap(ret);
    }
    /**
    * @param {DiscussionId} arg0
    */
    set discussion_id(arg0) {
        _assertClass(arg0, DiscussionId);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_close_discussion_id(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Message}
    */
    get message() {
        const ret = wasm.__wbg_get_replied_message(this.__wbg_ptr);
        return Message.__wrap(ret);
    }
    /**
    * @param {Message} arg0
    */
    set message(arg0) {
        _assertClass(arg0, Message);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_replied_message(this.__wbg_ptr, ptr0);
    }
    /**
    * @param {string} discussion_id
    * @param {Message} message
    */
    constructor(discussion_id, message) {
        const ptr0 = passStringToWasm0(discussion_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(message, Message);
        var ptr1 = message.__destroy_into_raw();
        const ret = wasm.replied_wasm_new(ptr0, len0, ptr1);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
module.exports.Spoke = Spoke;
/**
*/
class Stat {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Stat.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stat_free(ptr);
    }
    /**
    * @returns {StatType}
    */
    get ty() {
        const ret = wasm.__wbg_get_stat_ty(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {StatType} arg0
    */
    set ty(arg0) {
        wasm.__wbg_set_stat_ty(this.__wbg_ptr, arg0);
    }
    /**
    * ファイルの場合、ファイルサイズ
    * ディレクトリの場合、エントリ数
    * @returns {bigint}
    */
    get size() {
        const ret = wasm.__wbg_get_stat_size(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * ファイルの場合、ファイルサイズ
    * ディレクトリの場合、エントリ数
    * @param {bigint} arg0
    */
    set size(arg0) {
        wasm.__wbg_set_stat_size(this.__wbg_ptr, arg0);
    }
    /**
    * ファイルが作成された時点におけるUTCの基準時刻からの経過時間（秒）
    * @returns {bigint}
    */
    get create_time() {
        const ret = wasm.__wbg_get_stat_create_time(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * ファイルが作成された時点におけるUTCの基準時刻からの経過時間（秒）
    * @param {bigint} arg0
    */
    set create_time(arg0) {
        wasm.__wbg_set_stat_create_time(this.__wbg_ptr, arg0);
    }
    /**
    * ファイルが更新された時点におけるUTCの基準時刻からの経過時間（秒）
    * @returns {bigint}
    */
    get update_time() {
        const ret = wasm.__wbg_get_stat_update_time(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * ファイルが更新された時点におけるUTCの基準時刻からの経過時間（秒）
    * @param {bigint} arg0
    */
    set update_time(arg0) {
        wasm.__wbg_set_stat_update_time(this.__wbg_ptr, arg0);
    }
}
module.exports.Stat = Stat;
/**
*/
class UserId {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(UserId.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_userid_free(ptr);
    }
    /**
    * @returns {string}
    */
    get 0() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_discussionid_0(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set 0(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_discussionid_0(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {string} id
    */
    constructor(id) {
        const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.discussionid_from_string(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @returns {string}
    */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.discussionid_toString(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
module.exports.UserId = UserId;
/**
*/
class WasmTvcClient {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtvcclient_free(ptr);
    }
    /**
    * @param {string} branch_name
    * @param {any} fs
    */
    constructor(branch_name, fs) {
        const ptr0 = passStringToWasm0(branch_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmtvcclient_new(ptr0, len0, addHeapObject(fs));
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @returns {CommitHash}
    */
    init_repository() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmtvcclient_init_repository(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return CommitHash.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {bigint | undefined} [lifetime_sec]
    * @returns {Promise<SessionConfigs>}
    */
    open_room(lifetime_sec) {
        const ret = wasm.wasmtvcclient_open_room(this.__wbg_ptr, !isLikeNone(lifetime_sec), isLikeNone(lifetime_sec) ? BigInt(0) : lifetime_sec);
        return takeObject(ret);
    }
    /**
    * @param {string} path
    */
    stage(path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmtvcclient_stage(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} text
    */
    commit(text) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmtvcclient_commit(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {SessionConfigs} session_configs
    * @returns {Promise<void>}
    */
    push(session_configs) {
        _assertClass(session_configs, SessionConfigs);
        var ptr0 = session_configs.__destroy_into_raw();
        const ret = wasm.wasmtvcclient_push(this.__wbg_ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {string} source_branch
    */
    merge(source_branch) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(source_branch, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmtvcclient_merge(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {SessionConfigs} session_configs
    * @returns {Promise<void>}
    */
    fetch(session_configs) {
        _assertClass(session_configs, SessionConfigs);
        var ptr0 = session_configs.__destroy_into_raw();
        const ret = wasm.wasmtvcclient_fetch(this.__wbg_ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @returns {(string)[]}
    */
    staging_files() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmtvcclient_staging_files(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} file_path
    * @returns {boolean}
    */
    exists_in_traces(file_path) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(file_path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmtvcclient_exists_in_traces(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return r0 !== 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    close() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmtvcclient_close(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.WasmTvcClient = WasmTvcClient;

module.exports.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

module.exports.__wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

module.exports.__wbg_existsSync_e3651f9ad8d341de = function() { return handleError(function (arg0, arg1) {
    const ret = existsSync(getStringFromWasm0(arg0, arg1));
    return ret;
}, arguments) };

module.exports.__wbg_readdirSync_fa0ed99d11ff4b48 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = readdirSync(getStringFromWasm0(arg1, arg2), takeObject(arg3));
    const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}, arguments) };

module.exports.__wbg_lstatSync_a444a1691f42fbe5 = function() { return handleError(function (arg0, arg1) {
    const ret = lstatSync(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_isFile_62fcb2d282b20d48 = function(arg0) {
    const ret = getObject(arg0).isFile();
    return ret;
};

module.exports.__wbg_rmSync_aa639c85cc5a49cd = function() { return handleError(function (arg0, arg1) {
    const ret = rmSync(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_rmdirSync_2884c7227481d8ad = function() { return handleError(function (arg0, arg1) {
    const ret = rmdirSync(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_mkdirSync_e53c18930836a63e = function() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = mkdirSync(getStringFromWasm0(arg1, arg2), MkdirOptions.__wrap(arg3));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}, arguments) };

module.exports.__wbg_code_95e3ecf3dfcf81fe = function(arg0, arg1) {
    const ret = getObject(arg1).code;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

module.exports.__wbg_writeFileSync_f81ce0077399abc9 = function(arg0, arg1, arg2, arg3, arg4) {
    var v0 = getArrayU8FromWasm0(arg2, arg3).slice();
    wasm.__wbindgen_free(arg2, arg3 * 1, 1);
    writeFileSync(getStringFromWasm0(arg0, arg1), v0, getObject(arg4));
};

module.exports.__wbg_readFileSync_47327c040cf70117 = function() { return handleError(function (arg0, arg1) {
    const ret = readFileSync(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_is_string = function(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

module.exports.__wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

module.exports.__wbg_size_540502bb08858ac1 = function(arg0) {
    const ret = getObject(arg0).size;
    return ret;
};

module.exports.__wbg_ctimeMs_6dd813da8f9d0e10 = function(arg0) {
    const ret = getObject(arg0).ctimeMs;
    return ret;
};

module.exports.__wbg_mtimeMs_1001edd9f4204a7b = function(arg0) {
    const ret = getObject(arg0).mtimeMs;
    return ret;
};

module.exports.__wbindgen_object_clone_ref = function(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_deleteApi_f3a04cc1f493f026 = function(arg0, arg1, arg2) {
    getObject(arg0).deleteApi(getStringFromWasm0(arg1, arg2));
};

module.exports.__wbg_writeFileApi_d778076a46e9e4ab = function(arg0, arg1, arg2, arg3, arg4) {
    var v0 = getArrayU8FromWasm0(arg3, arg4).slice();
    wasm.__wbindgen_free(arg3, arg4 * 1, 1);
    getObject(arg0).writeFileApi(getStringFromWasm0(arg1, arg2), v0);
};

module.exports.__wbg_allFilesIn_a403fa82c0f59608 = function(arg0, arg1, arg2, arg3) {
    const ret = getObject(arg1).allFilesIn(getStringFromWasm0(arg2, arg3));
    const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

module.exports.__wbg_createDirApi_61f83a4910bb56b7 = function(arg0, arg1, arg2, arg3) {
    const ret = getObject(arg1).createDirApi(getStringFromWasm0(arg2, arg3));
    var ptr1 = isLikeNone(ret) ? 0 : passArray8ToWasm0(ret, wasm.__wbindgen_malloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

module.exports.__wbg_readFileApi_17ef501abf130e34 = function(arg0, arg1, arg2, arg3) {
    const ret = getObject(arg1).readFileApi(getStringFromWasm0(arg2, arg3));
    var ptr1 = isLikeNone(ret) ? 0 : passArray8ToWasm0(ret, wasm.__wbindgen_malloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

module.exports.__wbindgen_cb_drop = function(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

module.exports.__wbg_sessionconfigs_new = function(arg0) {
    const ret = SessionConfigs.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_fetch_6a2624d7f767e331 = function(arg0) {
    const ret = fetch(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_fetch_693453ca3f88c055 = function(arg0, arg1) {
    const ret = getObject(arg0).fetch(getObject(arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_newwithstrandinit_f581dff0d19a8b03 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_signal_3c701f5f40a5f08d = function(arg0) {
    const ret = getObject(arg0).signal;
    return addHeapObject(ret);
};

module.exports.__wbg_new_0ae46f44b7485bb2 = function() { return handleError(function () {
    const ret = new AbortController();
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_abort_2c4fb490d878d2b2 = function(arg0) {
    getObject(arg0).abort();
};

module.exports.__wbg_new_7a20246daa6eec7e = function() { return handleError(function () {
    const ret = new Headers();
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_append_aa3f462f9e2b5ff2 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

module.exports.__wbg_instanceof_Response_4c3b1446206114d1 = function(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Response;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

module.exports.__wbg_url_83a6a4f65f7a2b38 = function(arg0, arg1) {
    const ret = getObject(arg1).url;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

module.exports.__wbg_status_d6d47ad2837621eb = function(arg0) {
    const ret = getObject(arg0).status;
    return ret;
};

module.exports.__wbg_headers_24def508a7518df9 = function(arg0) {
    const ret = getObject(arg0).headers;
    return addHeapObject(ret);
};

module.exports.__wbg_arrayBuffer_5b2688e3dd873fed = function() { return handleError(function (arg0) {
    const ret = getObject(arg0).arrayBuffer();
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_messageid_unwrap = function(arg0) {
    const ret = MessageId.__unwrap(takeObject(arg0));
    return ret;
};

module.exports.__wbg_messageid_new = function(arg0) {
    const ret = MessageId.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_bundlebranch_new = function(arg0) {
    const ret = BundleBranch.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_bundlebranch_unwrap = function(arg0) {
    const ret = BundleBranch.__unwrap(takeObject(arg0));
    return ret;
};

module.exports.__wbg_bundleobject_unwrap = function(arg0) {
    const ret = BundleObject.__unwrap(takeObject(arg0));
    return ret;
};

module.exports.__wbg_commithash_unwrap = function(arg0) {
    const ret = CommitHash.__unwrap(takeObject(arg0));
    return ret;
};

module.exports.__wbg_bundletrace_unwrap = function(arg0) {
    const ret = BundleTrace.__unwrap(takeObject(arg0));
    return ret;
};

module.exports.__wbg_bundleobject_new = function(arg0) {
    const ret = BundleObject.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_bundletrace_new = function(arg0) {
    const ret = BundleTrace.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_commithash_new = function(arg0) {
    const ret = CommitHash.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_crypto_58f13aa23ffcb166 = function(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

module.exports.__wbindgen_is_object = function(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

module.exports.__wbg_process_5b786e71d465a513 = function(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

module.exports.__wbg_versions_c2ab80650590b6a2 = function(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

module.exports.__wbg_node_523d7bd03ef69fba = function(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

module.exports.__wbg_msCrypto_abcb1295e768d1f2 = function(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

module.exports.__wbg_require_2784e593a4674877 = function() { return handleError(function () {
    const ret = module.require;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_is_function = function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

module.exports.__wbg_randomFillSync_a0d98aa11c81fe89 = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).randomFillSync(takeObject(arg1));
}, arguments) };

module.exports.__wbg_getRandomValues_504510b5564925af = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

module.exports.__wbg_queueMicrotask_4d890031a6a5a50c = function(arg0) {
    queueMicrotask(getObject(arg0));
};

module.exports.__wbg_queueMicrotask_adae4bc085237231 = function(arg0) {
    const ret = getObject(arg0).queueMicrotask;
    return addHeapObject(ret);
};

module.exports.__wbg_newnoargs_c62ea9419c21fbac = function(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_next_9b877f231f476d01 = function(arg0) {
    const ret = getObject(arg0).next;
    return addHeapObject(ret);
};

module.exports.__wbg_next_6529ee0cca8d57ed = function() { return handleError(function (arg0) {
    const ret = getObject(arg0).next();
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_done_5fe336b092d60cf2 = function(arg0) {
    const ret = getObject(arg0).done;
    return ret;
};

module.exports.__wbg_value_0c248a78fdc8e19f = function(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
};

module.exports.__wbg_iterator_db7ca081358d4fb2 = function() {
    const ret = Symbol.iterator;
    return addHeapObject(ret);
};

module.exports.__wbg_get_7b48513de5dc5ea4 = function() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_call_90c26b09837aba1c = function() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_new_9fb8d994e1c0aaac = function() {
    const ret = new Object();
    return addHeapObject(ret);
};

module.exports.__wbg_self_f0e34d89f33b99fd = function() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_window_d3b084224f4774d7 = function() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_globalThis_9caa27ff917c6860 = function() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_global_35dfdd59a4da3e74 = function() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_is_undefined = function(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

module.exports.__wbg_call_5da1969d7cd31ccd = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_new_60f57089c7563e81 = function(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_255(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

module.exports.__wbg_resolve_6e1c6553a82f85b7 = function(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_then_3ab08cd4fbb91ae9 = function(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_then_8371cc12cfedc5a2 = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

module.exports.__wbg_buffer_a448f833075b71ba = function(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

module.exports.__wbg_newwithbyteoffsetandlength_d0482f893617af71 = function(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_new_8f67e318f15d7254 = function(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_set_2357bf09366ee480 = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

module.exports.__wbg_length_1d25fa9e4ac21ce7 = function(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

module.exports.__wbg_newwithlength_6c2df9e2f3028c43 = function(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_subarray_2e940e41c0f5a1d9 = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_stringify_e1b19966d964d242 = function() { return handleError(function (arg0) {
    const ret = JSON.stringify(getObject(arg0));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_has_9c711aafa4b444a2 = function() { return handleError(function (arg0, arg1) {
    const ret = Reflect.has(getObject(arg0), getObject(arg1));
    return ret;
}, arguments) };

module.exports.__wbg_set_759f75cd92b612d2 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };

module.exports.__wbindgen_debug_string = function(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbindgen_memory = function() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

module.exports.__wbindgen_closure_wrapper1402 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 389, __wbg_adapter_26);
    return addHeapObject(ret);
};

const path = require('path').join(__dirname, 'index_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

