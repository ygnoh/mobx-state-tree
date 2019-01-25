import {
    fail,
    isPrimitive,
    createNode,
    ISimpleType,
    Type,
    TypeFlags,
    IContext,
    IValidationResult,
    typeCheckSuccess,
    typeCheckFailure,
    isType,
    ScalarNode,
    Primitives,
    AnyObjectNode
} from "../../internal"

/**
 * @internal
 * @hidden
 */
export class Literal<T, N extends ScalarNode<T, T> = any> extends Type<T, T, T, N> {
    readonly shouldAttachNode = false
    readonly value: any
    readonly flags = TypeFlags.Literal

    constructor(value: any) {
        super(JSON.stringify(value))
        this.value = value
    }

    instantiate(parent: AnyObjectNode | null, subpath: string, environment: any, snapshot: T): N {
        return createNode(this, parent, subpath, environment, snapshot) as any
    }

    describe() {
        return JSON.stringify(this.value)
    }

    isValidSnapshot(value: any, context: IContext): IValidationResult {
        if (isPrimitive(value) && value === this.value) {
            return typeCheckSuccess()
        }
        return typeCheckFailure(
            context,
            value,
            `Value is not a literal ${JSON.stringify(this.value)}`
        )
    }
}

/**
 * `types.literal` - The literal type will return a type that will match only the exact given type.
 * The given value must be a primitive, in order to be serialized to a snapshot correctly.
 * You can use literal to match exact strings for example the exact male or female string.
 *
 * Example:
 * ```ts
 * const Person = types.model({
 *     name: types.string,
 *     gender: types.union(types.literal('male'), types.literal('female'))
 * })
 * ```
 *
 * @param value The value to use in the strict equal check
 * @returns
 */
export function literal<S extends Primitives>(value: S): ISimpleType<S> {
    // check that the given value is a primitive
    if (process.env.NODE_ENV !== "production") {
        if (!isPrimitive(value)) throw fail(`Literal types can be built only on top of primitives`)
    }
    return new Literal<S>(value)
}

/**
 * Returns if a given value represents a literal type.
 *
 * @param type
 * @returns
 */
export function isLiteralType<IT extends ISimpleType<any>>(type: IT): type is IT {
    return isType(type) && (type.flags & TypeFlags.Literal) > 0
}
