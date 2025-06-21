// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    /**
     * @param {string=} returnType
     * @param {Array=} argTypes
     * @param {Object=} opts
     */
    function cwrap(ident: any, returnType?: string | undefined, argTypes?: any[] | undefined, opts?: any | undefined): (...args: any[]) => any;
    /**
     * @param {number} ptr
     * @param {string} type
     */
    function getValue(ptr: number, type?: string): any;
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
    function setValue(ptr: number, value: number, type?: string): void;
    function allocate(slab: any, allocator: any): any;
    let ALLOC_NORMAL: any;
    let HEAP16: any;
    let HEAPU8: any;
    let HEAP32: any;
}
interface WasmModule {
  _psx_audio_xa_get_buffer_size(_0: number, _1: number): number;
  _psx_audio_xa_encode_simple(_0: number, _1: number, _2: number, _3: number): number;
  _malloc(_0: number): number;
  _free(_0: number): void;
}

interface EmbindModule {
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
