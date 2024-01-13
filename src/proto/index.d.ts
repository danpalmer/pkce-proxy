import * as $protobuf from "protobufjs";
import Long = require("long");
/** Properties of a Foo. */
export interface IFoo {

    /** Foo test */
    test?: (string|null);
}

/** Represents a Foo. */
export class Foo implements IFoo {

    /**
     * Constructs a new Foo.
     * @param [properties] Properties to set
     */
    constructor(properties?: IFoo);

    /** Foo test. */
    public test: string;

    /**
     * Creates a new Foo instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Foo instance
     */
    public static create(properties?: IFoo): Foo;

    /**
     * Encodes the specified Foo message. Does not implicitly {@link Foo.verify|verify} messages.
     * @param message Foo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IFoo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Foo message, length delimited. Does not implicitly {@link Foo.verify|verify} messages.
     * @param message Foo message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IFoo, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Foo message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Foo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Foo;

    /**
     * Decodes a Foo message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Foo
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Foo;

    /**
     * Verifies a Foo message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Foo message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Foo
     */
    public static fromObject(object: { [k: string]: any }): Foo;

    /**
     * Creates a plain object from a Foo message. Also converts values to other types if specified.
     * @param message Foo
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Foo, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Foo to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Foo
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}
