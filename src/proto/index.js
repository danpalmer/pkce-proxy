/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(function(global, factory) { /* global define, require, module */

    /* AMD */ if (typeof define === 'function' && define.amd)
        define(["protobufjs/minimal"], factory);

    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module.exports)
        module.exports = factory(require("protobufjs/minimal"));

})(this, function($protobuf) {
    "use strict";

    // Common aliases
    const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    
    // Exported root namespace
    const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    export const Foo = $root.Foo = (() => {
    
        /**
         * Properties of a Foo.
         * @exports IFoo
         * @interface IFoo
         * @property {string|null} [test] Foo test
         */
    
        /**
         * Constructs a new Foo.
         * @exports Foo
         * @classdesc Represents a Foo.
         * @implements IFoo
         * @constructor
         * @param {IFoo=} [properties] Properties to set
         */
        function Foo(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * Foo test.
         * @member {string} test
         * @memberof Foo
         * @instance
         */
        Foo.prototype.test = "";
    
        /**
         * Creates a new Foo instance using the specified properties.
         * @function create
         * @memberof Foo
         * @static
         * @param {IFoo=} [properties] Properties to set
         * @returns {Foo} Foo instance
         */
        Foo.create = function create(properties) {
            return new Foo(properties);
        };
    
        /**
         * Encodes the specified Foo message. Does not implicitly {@link Foo.verify|verify} messages.
         * @function encode
         * @memberof Foo
         * @static
         * @param {IFoo} message Foo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Foo.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.test != null && Object.hasOwnProperty.call(message, "test"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.test);
            return writer;
        };
    
        /**
         * Encodes the specified Foo message, length delimited. Does not implicitly {@link Foo.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Foo
         * @static
         * @param {IFoo} message Foo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Foo.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a Foo message from the specified reader or buffer.
         * @function decode
         * @memberof Foo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Foo} Foo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Foo.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Foo();
            while (reader.pos < end) {
                let tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.test = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };
    
        /**
         * Decodes a Foo message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Foo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Foo} Foo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Foo.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a Foo message.
         * @function verify
         * @memberof Foo
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Foo.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.test != null && message.hasOwnProperty("test"))
                if (!$util.isString(message.test))
                    return "test: string expected";
            return null;
        };
    
        /**
         * Creates a Foo message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof Foo
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {Foo} Foo
         */
        Foo.fromObject = function fromObject(object) {
            if (object instanceof $root.Foo)
                return object;
            let message = new $root.Foo();
            if (object.test != null)
                message.test = String(object.test);
            return message;
        };
    
        /**
         * Creates a plain object from a Foo message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Foo
         * @static
         * @param {Foo} message Foo
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Foo.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.test = "";
            if (message.test != null && message.hasOwnProperty("test"))
                object.test = message.test;
            return object;
        };
    
        /**
         * Converts this Foo to JSON.
         * @function toJSON
         * @memberof Foo
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Foo.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for Foo
         * @function getTypeUrl
         * @memberof Foo
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Foo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/Foo";
        };
    
        return Foo;
    })();

    return $root;
});
