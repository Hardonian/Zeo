
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Organization
 *
 */
export type Organization = $Result.DefaultSelection<Prisma.$OrganizationPayload>
/**
 * Model Repository
 *
 */
export type Repository = $Result.DefaultSelection<Prisma.$RepositoryPayload>
/**
 * Model Project
 *
 */
export type Project = $Result.DefaultSelection<Prisma.$ProjectPayload>
/**
 * Model ReadyLayerRun
 *
 */
export type ReadyLayerRun = $Result.DefaultSelection<Prisma.$ReadyLayerRunPayload>
/**
 * Model EvidenceAttestation
 *
 */
export type EvidenceAttestation = $Result.DefaultSelection<Prisma.$EvidenceAttestationPayload>
/**
 * Model EvidenceObject
 *
 */
export type EvidenceObject = $Result.DefaultSelection<Prisma.$EvidenceObjectPayload>
/**
 * Model PolicyPack
 *
 */
export type PolicyPack = $Result.DefaultSelection<Prisma.$PolicyPackPayload>
/**
 * Model PolicyPackAssignment
 *
 */
export type PolicyPackAssignment = $Result.DefaultSelection<Prisma.$PolicyPackAssignmentPayload>
/**
 * Model WebhookReceipt
 *
 */
export type WebhookReceipt = $Result.DefaultSelection<Prisma.$WebhookReceiptPayload>
/**
 * Model DeadLetterJob
 *
 */
export type DeadLetterJob = $Result.DefaultSelection<Prisma.$DeadLetterJobPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Organizations
 * const organizations = await prisma.organization.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Organizations
   * const organizations = await prisma.organization.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.organization`: Exposes CRUD operations for the **Organization** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Organizations
    * const organizations = await prisma.organization.findMany()
    * ```
    */
  get organization(): Prisma.OrganizationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.repository`: Exposes CRUD operations for the **Repository** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Repositories
    * const repositories = await prisma.repository.findMany()
    * ```
    */
  get repository(): Prisma.RepositoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.project`: Exposes CRUD operations for the **Project** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Projects
    * const projects = await prisma.project.findMany()
    * ```
    */
  get project(): Prisma.ProjectDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.readyLayerRun`: Exposes CRUD operations for the **ReadyLayerRun** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReadyLayerRuns
    * const readyLayerRuns = await prisma.readyLayerRun.findMany()
    * ```
    */
  get readyLayerRun(): Prisma.ReadyLayerRunDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.evidenceAttestation`: Exposes CRUD operations for the **EvidenceAttestation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EvidenceAttestations
    * const evidenceAttestations = await prisma.evidenceAttestation.findMany()
    * ```
    */
  get evidenceAttestation(): Prisma.EvidenceAttestationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.evidenceObject`: Exposes CRUD operations for the **EvidenceObject** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EvidenceObjects
    * const evidenceObjects = await prisma.evidenceObject.findMany()
    * ```
    */
  get evidenceObject(): Prisma.EvidenceObjectDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.policyPack`: Exposes CRUD operations for the **PolicyPack** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PolicyPacks
    * const policyPacks = await prisma.policyPack.findMany()
    * ```
    */
  get policyPack(): Prisma.PolicyPackDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.policyPackAssignment`: Exposes CRUD operations for the **PolicyPackAssignment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PolicyPackAssignments
    * const policyPackAssignments = await prisma.policyPackAssignment.findMany()
    * ```
    */
  get policyPackAssignment(): Prisma.PolicyPackAssignmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.webhookReceipt`: Exposes CRUD operations for the **WebhookReceipt** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WebhookReceipts
    * const webhookReceipts = await prisma.webhookReceipt.findMany()
    * ```
    */
  get webhookReceipt(): Prisma.WebhookReceiptDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.deadLetterJob`: Exposes CRUD operations for the **DeadLetterJob** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DeadLetterJobs
    * const deadLetterJobs = await prisma.deadLetterJob.findMany()
    * ```
    */
  get deadLetterJob(): Prisma.DeadLetterJobDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.4.0
   * Query Engine version: ab56fe763f921d033a6c195e7ddeb3e255bdbb57
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Organization: 'Organization',
    Repository: 'Repository',
    Project: 'Project',
    ReadyLayerRun: 'ReadyLayerRun',
    EvidenceAttestation: 'EvidenceAttestation',
    EvidenceObject: 'EvidenceObject',
    PolicyPack: 'PolicyPack',
    PolicyPackAssignment: 'PolicyPackAssignment',
    WebhookReceipt: 'WebhookReceipt',
    DeadLetterJob: 'DeadLetterJob'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "organization" | "repository" | "project" | "readyLayerRun" | "evidenceAttestation" | "evidenceObject" | "policyPack" | "policyPackAssignment" | "webhookReceipt" | "deadLetterJob"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Organization: {
        payload: Prisma.$OrganizationPayload<ExtArgs>
        fields: Prisma.OrganizationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrganizationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrganizationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findFirst: {
            args: Prisma.OrganizationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrganizationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findMany: {
            args: Prisma.OrganizationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          create: {
            args: Prisma.OrganizationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          createMany: {
            args: Prisma.OrganizationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrganizationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          delete: {
            args: Prisma.OrganizationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          update: {
            args: Prisma.OrganizationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          deleteMany: {
            args: Prisma.OrganizationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrganizationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrganizationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          upsert: {
            args: Prisma.OrganizationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          aggregate: {
            args: Prisma.OrganizationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganization>
          }
          groupBy: {
            args: Prisma.OrganizationGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganizationGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrganizationCountArgs<ExtArgs>
            result: $Utils.Optional<OrganizationCountAggregateOutputType> | number
          }
        }
      }
      Repository: {
        payload: Prisma.$RepositoryPayload<ExtArgs>
        fields: Prisma.RepositoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RepositoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RepositoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>
          }
          findFirst: {
            args: Prisma.RepositoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RepositoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>
          }
          findMany: {
            args: Prisma.RepositoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>[]
          }
          create: {
            args: Prisma.RepositoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>
          }
          createMany: {
            args: Prisma.RepositoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RepositoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>[]
          }
          delete: {
            args: Prisma.RepositoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>
          }
          update: {
            args: Prisma.RepositoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>
          }
          deleteMany: {
            args: Prisma.RepositoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RepositoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RepositoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>[]
          }
          upsert: {
            args: Prisma.RepositoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RepositoryPayload>
          }
          aggregate: {
            args: Prisma.RepositoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRepository>
          }
          groupBy: {
            args: Prisma.RepositoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<RepositoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.RepositoryCountArgs<ExtArgs>
            result: $Utils.Optional<RepositoryCountAggregateOutputType> | number
          }
        }
      }
      Project: {
        payload: Prisma.$ProjectPayload<ExtArgs>
        fields: Prisma.ProjectFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProjectFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProjectFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          findFirst: {
            args: Prisma.ProjectFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProjectFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          findMany: {
            args: Prisma.ProjectFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          create: {
            args: Prisma.ProjectCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          createMany: {
            args: Prisma.ProjectCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProjectCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          delete: {
            args: Prisma.ProjectDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          update: {
            args: Prisma.ProjectUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          deleteMany: {
            args: Prisma.ProjectDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProjectUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProjectUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          upsert: {
            args: Prisma.ProjectUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          aggregate: {
            args: Prisma.ProjectAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProject>
          }
          groupBy: {
            args: Prisma.ProjectGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProjectGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProjectCountArgs<ExtArgs>
            result: $Utils.Optional<ProjectCountAggregateOutputType> | number
          }
        }
      }
      ReadyLayerRun: {
        payload: Prisma.$ReadyLayerRunPayload<ExtArgs>
        fields: Prisma.ReadyLayerRunFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReadyLayerRunFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReadyLayerRunPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReadyLayerRunFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReadyLayerRunPayload>
          }
          findFirst: {
            args: Prisma.ReadyLayerRunFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReadyLayerRunPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReadyLayerRunFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReadyLayerRunPayload>
          }
          findMany: {
            args: Prisma.ReadyLayerRunFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReadyLayerRunPayload>[]
          }
          create: {
            args: Prisma.ReadyLayerRunCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReadyLayerRunPayload>
          }
          createMany: {
            args: Prisma.ReadyLayerRunCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReadyLayerRunCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReadyLayerRunPayload>[]
          }
          delete: {
            args: Prisma.ReadyLayerRunDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReadyLayerRunPayload>
          }
          update: {
            args: Prisma.ReadyLayerRunUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReadyLayerRunPayload>
          }
          deleteMany: {
            args: Prisma.ReadyLayerRunDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReadyLayerRunUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReadyLayerRunUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReadyLayerRunPayload>[]
          }
          upsert: {
            args: Prisma.ReadyLayerRunUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReadyLayerRunPayload>
          }
          aggregate: {
            args: Prisma.ReadyLayerRunAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReadyLayerRun>
          }
          groupBy: {
            args: Prisma.ReadyLayerRunGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReadyLayerRunGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReadyLayerRunCountArgs<ExtArgs>
            result: $Utils.Optional<ReadyLayerRunCountAggregateOutputType> | number
          }
        }
      }
      EvidenceAttestation: {
        payload: Prisma.$EvidenceAttestationPayload<ExtArgs>
        fields: Prisma.EvidenceAttestationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EvidenceAttestationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceAttestationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EvidenceAttestationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceAttestationPayload>
          }
          findFirst: {
            args: Prisma.EvidenceAttestationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceAttestationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EvidenceAttestationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceAttestationPayload>
          }
          findMany: {
            args: Prisma.EvidenceAttestationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceAttestationPayload>[]
          }
          create: {
            args: Prisma.EvidenceAttestationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceAttestationPayload>
          }
          createMany: {
            args: Prisma.EvidenceAttestationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EvidenceAttestationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceAttestationPayload>[]
          }
          delete: {
            args: Prisma.EvidenceAttestationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceAttestationPayload>
          }
          update: {
            args: Prisma.EvidenceAttestationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceAttestationPayload>
          }
          deleteMany: {
            args: Prisma.EvidenceAttestationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EvidenceAttestationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EvidenceAttestationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceAttestationPayload>[]
          }
          upsert: {
            args: Prisma.EvidenceAttestationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceAttestationPayload>
          }
          aggregate: {
            args: Prisma.EvidenceAttestationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEvidenceAttestation>
          }
          groupBy: {
            args: Prisma.EvidenceAttestationGroupByArgs<ExtArgs>
            result: $Utils.Optional<EvidenceAttestationGroupByOutputType>[]
          }
          count: {
            args: Prisma.EvidenceAttestationCountArgs<ExtArgs>
            result: $Utils.Optional<EvidenceAttestationCountAggregateOutputType> | number
          }
        }
      }
      EvidenceObject: {
        payload: Prisma.$EvidenceObjectPayload<ExtArgs>
        fields: Prisma.EvidenceObjectFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EvidenceObjectFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceObjectPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EvidenceObjectFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceObjectPayload>
          }
          findFirst: {
            args: Prisma.EvidenceObjectFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceObjectPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EvidenceObjectFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceObjectPayload>
          }
          findMany: {
            args: Prisma.EvidenceObjectFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceObjectPayload>[]
          }
          create: {
            args: Prisma.EvidenceObjectCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceObjectPayload>
          }
          createMany: {
            args: Prisma.EvidenceObjectCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EvidenceObjectCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceObjectPayload>[]
          }
          delete: {
            args: Prisma.EvidenceObjectDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceObjectPayload>
          }
          update: {
            args: Prisma.EvidenceObjectUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceObjectPayload>
          }
          deleteMany: {
            args: Prisma.EvidenceObjectDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EvidenceObjectUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EvidenceObjectUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceObjectPayload>[]
          }
          upsert: {
            args: Prisma.EvidenceObjectUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EvidenceObjectPayload>
          }
          aggregate: {
            args: Prisma.EvidenceObjectAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEvidenceObject>
          }
          groupBy: {
            args: Prisma.EvidenceObjectGroupByArgs<ExtArgs>
            result: $Utils.Optional<EvidenceObjectGroupByOutputType>[]
          }
          count: {
            args: Prisma.EvidenceObjectCountArgs<ExtArgs>
            result: $Utils.Optional<EvidenceObjectCountAggregateOutputType> | number
          }
        }
      }
      PolicyPack: {
        payload: Prisma.$PolicyPackPayload<ExtArgs>
        fields: Prisma.PolicyPackFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PolicyPackFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PolicyPackFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackPayload>
          }
          findFirst: {
            args: Prisma.PolicyPackFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PolicyPackFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackPayload>
          }
          findMany: {
            args: Prisma.PolicyPackFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackPayload>[]
          }
          create: {
            args: Prisma.PolicyPackCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackPayload>
          }
          createMany: {
            args: Prisma.PolicyPackCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PolicyPackCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackPayload>[]
          }
          delete: {
            args: Prisma.PolicyPackDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackPayload>
          }
          update: {
            args: Prisma.PolicyPackUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackPayload>
          }
          deleteMany: {
            args: Prisma.PolicyPackDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PolicyPackUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PolicyPackUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackPayload>[]
          }
          upsert: {
            args: Prisma.PolicyPackUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackPayload>
          }
          aggregate: {
            args: Prisma.PolicyPackAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePolicyPack>
          }
          groupBy: {
            args: Prisma.PolicyPackGroupByArgs<ExtArgs>
            result: $Utils.Optional<PolicyPackGroupByOutputType>[]
          }
          count: {
            args: Prisma.PolicyPackCountArgs<ExtArgs>
            result: $Utils.Optional<PolicyPackCountAggregateOutputType> | number
          }
        }
      }
      PolicyPackAssignment: {
        payload: Prisma.$PolicyPackAssignmentPayload<ExtArgs>
        fields: Prisma.PolicyPackAssignmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PolicyPackAssignmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackAssignmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PolicyPackAssignmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackAssignmentPayload>
          }
          findFirst: {
            args: Prisma.PolicyPackAssignmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackAssignmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PolicyPackAssignmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackAssignmentPayload>
          }
          findMany: {
            args: Prisma.PolicyPackAssignmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackAssignmentPayload>[]
          }
          create: {
            args: Prisma.PolicyPackAssignmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackAssignmentPayload>
          }
          createMany: {
            args: Prisma.PolicyPackAssignmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PolicyPackAssignmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackAssignmentPayload>[]
          }
          delete: {
            args: Prisma.PolicyPackAssignmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackAssignmentPayload>
          }
          update: {
            args: Prisma.PolicyPackAssignmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackAssignmentPayload>
          }
          deleteMany: {
            args: Prisma.PolicyPackAssignmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PolicyPackAssignmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PolicyPackAssignmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackAssignmentPayload>[]
          }
          upsert: {
            args: Prisma.PolicyPackAssignmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PolicyPackAssignmentPayload>
          }
          aggregate: {
            args: Prisma.PolicyPackAssignmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePolicyPackAssignment>
          }
          groupBy: {
            args: Prisma.PolicyPackAssignmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<PolicyPackAssignmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.PolicyPackAssignmentCountArgs<ExtArgs>
            result: $Utils.Optional<PolicyPackAssignmentCountAggregateOutputType> | number
          }
        }
      }
      WebhookReceipt: {
        payload: Prisma.$WebhookReceiptPayload<ExtArgs>
        fields: Prisma.WebhookReceiptFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WebhookReceiptFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookReceiptPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WebhookReceiptFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookReceiptPayload>
          }
          findFirst: {
            args: Prisma.WebhookReceiptFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookReceiptPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WebhookReceiptFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookReceiptPayload>
          }
          findMany: {
            args: Prisma.WebhookReceiptFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookReceiptPayload>[]
          }
          create: {
            args: Prisma.WebhookReceiptCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookReceiptPayload>
          }
          createMany: {
            args: Prisma.WebhookReceiptCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WebhookReceiptCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookReceiptPayload>[]
          }
          delete: {
            args: Prisma.WebhookReceiptDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookReceiptPayload>
          }
          update: {
            args: Prisma.WebhookReceiptUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookReceiptPayload>
          }
          deleteMany: {
            args: Prisma.WebhookReceiptDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WebhookReceiptUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WebhookReceiptUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookReceiptPayload>[]
          }
          upsert: {
            args: Prisma.WebhookReceiptUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookReceiptPayload>
          }
          aggregate: {
            args: Prisma.WebhookReceiptAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWebhookReceipt>
          }
          groupBy: {
            args: Prisma.WebhookReceiptGroupByArgs<ExtArgs>
            result: $Utils.Optional<WebhookReceiptGroupByOutputType>[]
          }
          count: {
            args: Prisma.WebhookReceiptCountArgs<ExtArgs>
            result: $Utils.Optional<WebhookReceiptCountAggregateOutputType> | number
          }
        }
      }
      DeadLetterJob: {
        payload: Prisma.$DeadLetterJobPayload<ExtArgs>
        fields: Prisma.DeadLetterJobFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DeadLetterJobFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterJobPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DeadLetterJobFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterJobPayload>
          }
          findFirst: {
            args: Prisma.DeadLetterJobFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterJobPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DeadLetterJobFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterJobPayload>
          }
          findMany: {
            args: Prisma.DeadLetterJobFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterJobPayload>[]
          }
          create: {
            args: Prisma.DeadLetterJobCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterJobPayload>
          }
          createMany: {
            args: Prisma.DeadLetterJobCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DeadLetterJobCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterJobPayload>[]
          }
          delete: {
            args: Prisma.DeadLetterJobDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterJobPayload>
          }
          update: {
            args: Prisma.DeadLetterJobUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterJobPayload>
          }
          deleteMany: {
            args: Prisma.DeadLetterJobDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DeadLetterJobUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DeadLetterJobUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterJobPayload>[]
          }
          upsert: {
            args: Prisma.DeadLetterJobUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterJobPayload>
          }
          aggregate: {
            args: Prisma.DeadLetterJobAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDeadLetterJob>
          }
          groupBy: {
            args: Prisma.DeadLetterJobGroupByArgs<ExtArgs>
            result: $Utils.Optional<DeadLetterJobGroupByOutputType>[]
          }
          count: {
            args: Prisma.DeadLetterJobCountArgs<ExtArgs>
            result: $Utils.Optional<DeadLetterJobCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     *
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     *
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    organization?: OrganizationOmit
    repository?: RepositoryOmit
    project?: ProjectOmit
    readyLayerRun?: ReadyLayerRunOmit
    evidenceAttestation?: EvidenceAttestationOmit
    evidenceObject?: EvidenceObjectOmit
    policyPack?: PolicyPackOmit
    policyPackAssignment?: PolicyPackAssignmentOmit
    webhookReceipt?: WebhookReceiptOmit
    deadLetterJob?: DeadLetterJobOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type OrganizationCountOutputType
   */

  export type OrganizationCountOutputType = {
    repositories: number
    runs: number
    evidenceAttestations: number
    evidenceObjects: number
    policyPacks: number
    policyAssignments: number
    webhookReceipts: number
  }

  export type OrganizationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    repositories?: boolean | OrganizationCountOutputTypeCountRepositoriesArgs
    runs?: boolean | OrganizationCountOutputTypeCountRunsArgs
    evidenceAttestations?: boolean | OrganizationCountOutputTypeCountEvidenceAttestationsArgs
    evidenceObjects?: boolean | OrganizationCountOutputTypeCountEvidenceObjectsArgs
    policyPacks?: boolean | OrganizationCountOutputTypeCountPolicyPacksArgs
    policyAssignments?: boolean | OrganizationCountOutputTypeCountPolicyAssignmentsArgs
    webhookReceipts?: boolean | OrganizationCountOutputTypeCountWebhookReceiptsArgs
  }

  // Custom InputTypes
  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationCountOutputType
     */
    select?: OrganizationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountRepositoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RepositoryWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReadyLayerRunWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountEvidenceAttestationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EvidenceAttestationWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountEvidenceObjectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EvidenceObjectWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountPolicyPacksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PolicyPackWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountPolicyAssignmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PolicyPackAssignmentWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountWebhookReceiptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WebhookReceiptWhereInput
  }


  /**
   * Count Type RepositoryCountOutputType
   */

  export type RepositoryCountOutputType = {
    projects: number
    runs: number
    evidenceAttestations: number
    policyAssignments: number
  }

  export type RepositoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    projects?: boolean | RepositoryCountOutputTypeCountProjectsArgs
    runs?: boolean | RepositoryCountOutputTypeCountRunsArgs
    evidenceAttestations?: boolean | RepositoryCountOutputTypeCountEvidenceAttestationsArgs
    policyAssignments?: boolean | RepositoryCountOutputTypeCountPolicyAssignmentsArgs
  }

  // Custom InputTypes
  /**
   * RepositoryCountOutputType without action
   */
  export type RepositoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RepositoryCountOutputType
     */
    select?: RepositoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RepositoryCountOutputType without action
   */
  export type RepositoryCountOutputTypeCountProjectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProjectWhereInput
  }

  /**
   * RepositoryCountOutputType without action
   */
  export type RepositoryCountOutputTypeCountRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReadyLayerRunWhereInput
  }

  /**
   * RepositoryCountOutputType without action
   */
  export type RepositoryCountOutputTypeCountEvidenceAttestationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EvidenceAttestationWhereInput
  }

  /**
   * RepositoryCountOutputType without action
   */
  export type RepositoryCountOutputTypeCountPolicyAssignmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PolicyPackAssignmentWhereInput
  }


  /**
   * Count Type ReadyLayerRunCountOutputType
   */

  export type ReadyLayerRunCountOutputType = {
    attestations: number
  }

  export type ReadyLayerRunCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attestations?: boolean | ReadyLayerRunCountOutputTypeCountAttestationsArgs
  }

  // Custom InputTypes
  /**
   * ReadyLayerRunCountOutputType without action
   */
  export type ReadyLayerRunCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRunCountOutputType
     */
    select?: ReadyLayerRunCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ReadyLayerRunCountOutputType without action
   */
  export type ReadyLayerRunCountOutputTypeCountAttestationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EvidenceAttestationWhereInput
  }


  /**
   * Count Type PolicyPackCountOutputType
   */

  export type PolicyPackCountOutputType = {
    assignments: number
  }

  export type PolicyPackCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assignments?: boolean | PolicyPackCountOutputTypeCountAssignmentsArgs
  }

  // Custom InputTypes
  /**
   * PolicyPackCountOutputType without action
   */
  export type PolicyPackCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackCountOutputType
     */
    select?: PolicyPackCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PolicyPackCountOutputType without action
   */
  export type PolicyPackCountOutputTypeCountAssignmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PolicyPackAssignmentWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Organization
   */

  export type AggregateOrganization = {
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  export type OrganizationMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
  }

  export type OrganizationMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
  }

  export type OrganizationCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    _all: number
  }


  export type OrganizationMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
  }

  export type OrganizationMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
  }

  export type OrganizationCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    _all?: true
  }

  export type OrganizationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organization to aggregate.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Organizations
    **/
    _count?: true | OrganizationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: OrganizationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: OrganizationMaxAggregateInputType
  }

  export type GetOrganizationAggregateType<T extends OrganizationAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganization]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganization[P]>
      : GetScalarType<T[P], AggregateOrganization[P]>
  }




  export type OrganizationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationWhereInput
    orderBy?: OrganizationOrderByWithAggregationInput | OrganizationOrderByWithAggregationInput[]
    by: OrganizationScalarFieldEnum[] | OrganizationScalarFieldEnum
    having?: OrganizationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganizationCountAggregateInputType | true
    _min?: OrganizationMinAggregateInputType
    _max?: OrganizationMaxAggregateInputType
  }

  export type OrganizationGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  type GetOrganizationGroupByPayload<T extends OrganizationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganizationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganizationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
            : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
        }
      >
    >


  export type OrganizationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    repositories?: boolean | Organization$repositoriesArgs<ExtArgs>
    runs?: boolean | Organization$runsArgs<ExtArgs>
    evidenceAttestations?: boolean | Organization$evidenceAttestationsArgs<ExtArgs>
    evidenceObjects?: boolean | Organization$evidenceObjectsArgs<ExtArgs>
    policyPacks?: boolean | Organization$policyPacksArgs<ExtArgs>
    policyAssignments?: boolean | Organization$policyAssignmentsArgs<ExtArgs>
    webhookReceipts?: boolean | Organization$webhookReceiptsArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
  }

  export type OrganizationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "createdAt", ExtArgs["result"]["organization"]>
  export type OrganizationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    repositories?: boolean | Organization$repositoriesArgs<ExtArgs>
    runs?: boolean | Organization$runsArgs<ExtArgs>
    evidenceAttestations?: boolean | Organization$evidenceAttestationsArgs<ExtArgs>
    evidenceObjects?: boolean | Organization$evidenceObjectsArgs<ExtArgs>
    policyPacks?: boolean | Organization$policyPacksArgs<ExtArgs>
    policyAssignments?: boolean | Organization$policyAssignmentsArgs<ExtArgs>
    webhookReceipts?: boolean | Organization$webhookReceiptsArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrganizationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type OrganizationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OrganizationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Organization"
    objects: {
      repositories: Prisma.$RepositoryPayload<ExtArgs>[]
      runs: Prisma.$ReadyLayerRunPayload<ExtArgs>[]
      evidenceAttestations: Prisma.$EvidenceAttestationPayload<ExtArgs>[]
      evidenceObjects: Prisma.$EvidenceObjectPayload<ExtArgs>[]
      policyPacks: Prisma.$PolicyPackPayload<ExtArgs>[]
      policyAssignments: Prisma.$PolicyPackAssignmentPayload<ExtArgs>[]
      webhookReceipts: Prisma.$WebhookReceiptPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
    }, ExtArgs["result"]["organization"]>
    composites: {}
  }

  type OrganizationGetPayload<S extends boolean | null | undefined | OrganizationDefaultArgs> = $Result.GetResult<Prisma.$OrganizationPayload, S>

  type OrganizationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrganizationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganizationCountAggregateInputType | true
    }

  export interface OrganizationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Organization'], meta: { name: 'Organization' } }
    /**
     * Find zero or one Organization that matches the filter.
     * @param {OrganizationFindUniqueArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrganizationFindUniqueArgs>(args: SelectSubset<T, OrganizationFindUniqueArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Organization that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrganizationFindUniqueOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrganizationFindUniqueOrThrowArgs>(args: SelectSubset<T, OrganizationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrganizationFindFirstArgs>(args?: SelectSubset<T, OrganizationFindFirstArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrganizationFindFirstOrThrowArgs>(args?: SelectSubset<T, OrganizationFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Organizations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Organizations
     * const organizations = await prisma.organization.findMany()
     *
     * // Get first 10 Organizations
     * const organizations = await prisma.organization.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const organizationWithIdOnly = await prisma.organization.findMany({ select: { id: true } })
     *
     */
    findMany<T extends OrganizationFindManyArgs>(args?: SelectSubset<T, OrganizationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Organization.
     * @param {OrganizationCreateArgs} args - Arguments to create a Organization.
     * @example
     * // Create one Organization
     * const Organization = await prisma.organization.create({
     *   data: {
     *     // ... data to create a Organization
     *   }
     * })
     *
     */
    create<T extends OrganizationCreateArgs>(args: SelectSubset<T, OrganizationCreateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Organizations.
     * @param {OrganizationCreateManyArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends OrganizationCreateManyArgs>(args?: SelectSubset<T, OrganizationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Organizations and returns the data saved in the database.
     * @param {OrganizationCreateManyAndReturnArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends OrganizationCreateManyAndReturnArgs>(args?: SelectSubset<T, OrganizationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Organization.
     * @param {OrganizationDeleteArgs} args - Arguments to delete one Organization.
     * @example
     * // Delete one Organization
     * const Organization = await prisma.organization.delete({
     *   where: {
     *     // ... filter to delete one Organization
     *   }
     * })
     *
     */
    delete<T extends OrganizationDeleteArgs>(args: SelectSubset<T, OrganizationDeleteArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Organization.
     * @param {OrganizationUpdateArgs} args - Arguments to update one Organization.
     * @example
     * // Update one Organization
     * const organization = await prisma.organization.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends OrganizationUpdateArgs>(args: SelectSubset<T, OrganizationUpdateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Organizations.
     * @param {OrganizationDeleteManyArgs} args - Arguments to filter Organizations to delete.
     * @example
     * // Delete a few Organizations
     * const { count } = await prisma.organization.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends OrganizationDeleteManyArgs>(args?: SelectSubset<T, OrganizationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends OrganizationUpdateManyArgs>(args: SelectSubset<T, OrganizationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations and returns the data updated in the database.
     * @param {OrganizationUpdateManyAndReturnArgs} args - Arguments to update many Organizations.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends OrganizationUpdateManyAndReturnArgs>(args: SelectSubset<T, OrganizationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Organization.
     * @param {OrganizationUpsertArgs} args - Arguments to update or create a Organization.
     * @example
     * // Update or create a Organization
     * const organization = await prisma.organization.upsert({
     *   create: {
     *     // ... data to create a Organization
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Organization we want to update
     *   }
     * })
     */
    upsert<T extends OrganizationUpsertArgs>(args: SelectSubset<T, OrganizationUpsertArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationCountArgs} args - Arguments to filter Organizations to count.
     * @example
     * // Count the number of Organizations
     * const count = await prisma.organization.count({
     *   where: {
     *     // ... the filter for the Organizations we want to count
     *   }
     * })
    **/
    count<T extends OrganizationCountArgs>(
      args?: Subset<T, OrganizationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganizationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrganizationAggregateArgs>(args: Subset<T, OrganizationAggregateArgs>): Prisma.PrismaPromise<GetOrganizationAggregateType<T>>

    /**
     * Group by Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<
      T extends OrganizationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrganizationGroupByArgs['orderBy'] }
        : { orderBy?: OrganizationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrganizationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Organization model
   */
  readonly fields: OrganizationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Organization.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrganizationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    repositories<T extends Organization$repositoriesArgs<ExtArgs> = {}>(args?: Subset<T, Organization$repositoriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    runs<T extends Organization$runsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$runsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    evidenceAttestations<T extends Organization$evidenceAttestationsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$evidenceAttestationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    evidenceObjects<T extends Organization$evidenceObjectsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$evidenceObjectsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EvidenceObjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    policyPacks<T extends Organization$policyPacksArgs<ExtArgs> = {}>(args?: Subset<T, Organization$policyPacksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PolicyPackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    policyAssignments<T extends Organization$policyAssignmentsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$policyAssignmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    webhookReceipts<T extends Organization$webhookReceiptsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$webhookReceiptsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebhookReceiptPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Organization model
   */
  interface OrganizationFieldRefs {
    readonly id: FieldRef<"Organization", 'String'>
    readonly name: FieldRef<"Organization", 'String'>
    readonly createdAt: FieldRef<"Organization", 'DateTime'>
  }


  // Custom InputTypes
  /**
   * Organization findUnique
   */
  export type OrganizationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findUniqueOrThrow
   */
  export type OrganizationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findFirst
   */
  export type OrganizationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findFirstOrThrow
   */
  export type OrganizationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findMany
   */
  export type OrganizationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organizations to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Organizations.
     */
    skip?: number
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization create
   */
  export type OrganizationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to create a Organization.
     */
    data: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
  }

  /**
   * Organization createMany
   */
  export type OrganizationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
  }

  /**
   * Organization createManyAndReturn
   */
  export type OrganizationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
  }

  /**
   * Organization update
   */
  export type OrganizationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to update a Organization.
     */
    data: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
    /**
     * Choose, which Organization to update.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization updateMany
   */
  export type OrganizationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization updateManyAndReturn
   */
  export type OrganizationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization upsert
   */
  export type OrganizationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The filter to search for the Organization to update in case it exists.
     */
    where: OrganizationWhereUniqueInput
    /**
     * In case the Organization found by the `where` argument doesn't exist, create a new Organization with this data.
     */
    create: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
    /**
     * In case the Organization was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
  }

  /**
   * Organization delete
   */
  export type OrganizationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter which Organization to delete.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization deleteMany
   */
  export type OrganizationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organizations to delete
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to delete.
     */
    limit?: number
  }

  /**
   * Organization.repositories
   */
  export type Organization$repositoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    where?: RepositoryWhereInput
    orderBy?: RepositoryOrderByWithRelationInput | RepositoryOrderByWithRelationInput[]
    cursor?: RepositoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RepositoryScalarFieldEnum | RepositoryScalarFieldEnum[]
  }

  /**
   * Organization.runs
   */
  export type Organization$runsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunInclude<ExtArgs> | null
    where?: ReadyLayerRunWhereInput
    orderBy?: ReadyLayerRunOrderByWithRelationInput | ReadyLayerRunOrderByWithRelationInput[]
    cursor?: ReadyLayerRunWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReadyLayerRunScalarFieldEnum | ReadyLayerRunScalarFieldEnum[]
  }

  /**
   * Organization.evidenceAttestations
   */
  export type Organization$evidenceAttestationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationInclude<ExtArgs> | null
    where?: EvidenceAttestationWhereInput
    orderBy?: EvidenceAttestationOrderByWithRelationInput | EvidenceAttestationOrderByWithRelationInput[]
    cursor?: EvidenceAttestationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EvidenceAttestationScalarFieldEnum | EvidenceAttestationScalarFieldEnum[]
  }

  /**
   * Organization.evidenceObjects
   */
  export type Organization$evidenceObjectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceObject
     */
    select?: EvidenceObjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceObject
     */
    omit?: EvidenceObjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceObjectInclude<ExtArgs> | null
    where?: EvidenceObjectWhereInput
    orderBy?: EvidenceObjectOrderByWithRelationInput | EvidenceObjectOrderByWithRelationInput[]
    cursor?: EvidenceObjectWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EvidenceObjectScalarFieldEnum | EvidenceObjectScalarFieldEnum[]
  }

  /**
   * Organization.policyPacks
   */
  export type Organization$policyPacksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPack
     */
    select?: PolicyPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPack
     */
    omit?: PolicyPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackInclude<ExtArgs> | null
    where?: PolicyPackWhereInput
    orderBy?: PolicyPackOrderByWithRelationInput | PolicyPackOrderByWithRelationInput[]
    cursor?: PolicyPackWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PolicyPackScalarFieldEnum | PolicyPackScalarFieldEnum[]
  }

  /**
   * Organization.policyAssignments
   */
  export type Organization$policyAssignmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentInclude<ExtArgs> | null
    where?: PolicyPackAssignmentWhereInput
    orderBy?: PolicyPackAssignmentOrderByWithRelationInput | PolicyPackAssignmentOrderByWithRelationInput[]
    cursor?: PolicyPackAssignmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PolicyPackAssignmentScalarFieldEnum | PolicyPackAssignmentScalarFieldEnum[]
  }

  /**
   * Organization.webhookReceipts
   */
  export type Organization$webhookReceiptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookReceipt
     */
    select?: WebhookReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookReceipt
     */
    omit?: WebhookReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookReceiptInclude<ExtArgs> | null
    where?: WebhookReceiptWhereInput
    orderBy?: WebhookReceiptOrderByWithRelationInput | WebhookReceiptOrderByWithRelationInput[]
    cursor?: WebhookReceiptWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WebhookReceiptScalarFieldEnum | WebhookReceiptScalarFieldEnum[]
  }

  /**
   * Organization without action
   */
  export type OrganizationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
  }


  /**
   * Model Repository
   */

  export type AggregateRepository = {
    _count: RepositoryCountAggregateOutputType | null
    _min: RepositoryMinAggregateOutputType | null
    _max: RepositoryMaxAggregateOutputType | null
  }

  export type RepositoryMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    name: string | null
    createdAt: Date | null
  }

  export type RepositoryMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    name: string | null
    createdAt: Date | null
  }

  export type RepositoryCountAggregateOutputType = {
    id: number
    organizationId: number
    name: number
    createdAt: number
    _all: number
  }


  export type RepositoryMinAggregateInputType = {
    id?: true
    organizationId?: true
    name?: true
    createdAt?: true
  }

  export type RepositoryMaxAggregateInputType = {
    id?: true
    organizationId?: true
    name?: true
    createdAt?: true
  }

  export type RepositoryCountAggregateInputType = {
    id?: true
    organizationId?: true
    name?: true
    createdAt?: true
    _all?: true
  }

  export type RepositoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Repository to aggregate.
     */
    where?: RepositoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Repositories to fetch.
     */
    orderBy?: RepositoryOrderByWithRelationInput | RepositoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: RepositoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Repositories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Repositories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Repositories
    **/
    _count?: true | RepositoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: RepositoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: RepositoryMaxAggregateInputType
  }

  export type GetRepositoryAggregateType<T extends RepositoryAggregateArgs> = {
        [P in keyof T & keyof AggregateRepository]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRepository[P]>
      : GetScalarType<T[P], AggregateRepository[P]>
  }




  export type RepositoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RepositoryWhereInput
    orderBy?: RepositoryOrderByWithAggregationInput | RepositoryOrderByWithAggregationInput[]
    by: RepositoryScalarFieldEnum[] | RepositoryScalarFieldEnum
    having?: RepositoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RepositoryCountAggregateInputType | true
    _min?: RepositoryMinAggregateInputType
    _max?: RepositoryMaxAggregateInputType
  }

  export type RepositoryGroupByOutputType = {
    id: string
    organizationId: string
    name: string
    createdAt: Date
    _count: RepositoryCountAggregateOutputType | null
    _min: RepositoryMinAggregateOutputType | null
    _max: RepositoryMaxAggregateOutputType | null
  }

  type GetRepositoryGroupByPayload<T extends RepositoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RepositoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RepositoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RepositoryGroupByOutputType[P]>
            : GetScalarType<T[P], RepositoryGroupByOutputType[P]>
        }
      >
    >


  export type RepositorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    name?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    projects?: boolean | Repository$projectsArgs<ExtArgs>
    runs?: boolean | Repository$runsArgs<ExtArgs>
    evidenceAttestations?: boolean | Repository$evidenceAttestationsArgs<ExtArgs>
    policyAssignments?: boolean | Repository$policyAssignmentsArgs<ExtArgs>
    _count?: boolean | RepositoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["repository"]>

  export type RepositorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    name?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["repository"]>

  export type RepositorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    name?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["repository"]>

  export type RepositorySelectScalar = {
    id?: boolean
    organizationId?: boolean
    name?: boolean
    createdAt?: boolean
  }

  export type RepositoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "name" | "createdAt", ExtArgs["result"]["repository"]>
  export type RepositoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    projects?: boolean | Repository$projectsArgs<ExtArgs>
    runs?: boolean | Repository$runsArgs<ExtArgs>
    evidenceAttestations?: boolean | Repository$evidenceAttestationsArgs<ExtArgs>
    policyAssignments?: boolean | Repository$policyAssignmentsArgs<ExtArgs>
    _count?: boolean | RepositoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RepositoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type RepositoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $RepositoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Repository"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      projects: Prisma.$ProjectPayload<ExtArgs>[]
      runs: Prisma.$ReadyLayerRunPayload<ExtArgs>[]
      evidenceAttestations: Prisma.$EvidenceAttestationPayload<ExtArgs>[]
      policyAssignments: Prisma.$PolicyPackAssignmentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      name: string
      createdAt: Date
    }, ExtArgs["result"]["repository"]>
    composites: {}
  }

  type RepositoryGetPayload<S extends boolean | null | undefined | RepositoryDefaultArgs> = $Result.GetResult<Prisma.$RepositoryPayload, S>

  type RepositoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RepositoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RepositoryCountAggregateInputType | true
    }

  export interface RepositoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Repository'], meta: { name: 'Repository' } }
    /**
     * Find zero or one Repository that matches the filter.
     * @param {RepositoryFindUniqueArgs} args - Arguments to find a Repository
     * @example
     * // Get one Repository
     * const repository = await prisma.repository.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RepositoryFindUniqueArgs>(args: SelectSubset<T, RepositoryFindUniqueArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Repository that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RepositoryFindUniqueOrThrowArgs} args - Arguments to find a Repository
     * @example
     * // Get one Repository
     * const repository = await prisma.repository.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RepositoryFindUniqueOrThrowArgs>(args: SelectSubset<T, RepositoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Repository that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryFindFirstArgs} args - Arguments to find a Repository
     * @example
     * // Get one Repository
     * const repository = await prisma.repository.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RepositoryFindFirstArgs>(args?: SelectSubset<T, RepositoryFindFirstArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Repository that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryFindFirstOrThrowArgs} args - Arguments to find a Repository
     * @example
     * // Get one Repository
     * const repository = await prisma.repository.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RepositoryFindFirstOrThrowArgs>(args?: SelectSubset<T, RepositoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Repositories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Repositories
     * const repositories = await prisma.repository.findMany()
     *
     * // Get first 10 Repositories
     * const repositories = await prisma.repository.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const repositoryWithIdOnly = await prisma.repository.findMany({ select: { id: true } })
     *
     */
    findMany<T extends RepositoryFindManyArgs>(args?: SelectSubset<T, RepositoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Repository.
     * @param {RepositoryCreateArgs} args - Arguments to create a Repository.
     * @example
     * // Create one Repository
     * const Repository = await prisma.repository.create({
     *   data: {
     *     // ... data to create a Repository
     *   }
     * })
     *
     */
    create<T extends RepositoryCreateArgs>(args: SelectSubset<T, RepositoryCreateArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Repositories.
     * @param {RepositoryCreateManyArgs} args - Arguments to create many Repositories.
     * @example
     * // Create many Repositories
     * const repository = await prisma.repository.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends RepositoryCreateManyArgs>(args?: SelectSubset<T, RepositoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Repositories and returns the data saved in the database.
     * @param {RepositoryCreateManyAndReturnArgs} args - Arguments to create many Repositories.
     * @example
     * // Create many Repositories
     * const repository = await prisma.repository.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Repositories and only return the `id`
     * const repositoryWithIdOnly = await prisma.repository.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends RepositoryCreateManyAndReturnArgs>(args?: SelectSubset<T, RepositoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Repository.
     * @param {RepositoryDeleteArgs} args - Arguments to delete one Repository.
     * @example
     * // Delete one Repository
     * const Repository = await prisma.repository.delete({
     *   where: {
     *     // ... filter to delete one Repository
     *   }
     * })
     *
     */
    delete<T extends RepositoryDeleteArgs>(args: SelectSubset<T, RepositoryDeleteArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Repository.
     * @param {RepositoryUpdateArgs} args - Arguments to update one Repository.
     * @example
     * // Update one Repository
     * const repository = await prisma.repository.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends RepositoryUpdateArgs>(args: SelectSubset<T, RepositoryUpdateArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Repositories.
     * @param {RepositoryDeleteManyArgs} args - Arguments to filter Repositories to delete.
     * @example
     * // Delete a few Repositories
     * const { count } = await prisma.repository.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends RepositoryDeleteManyArgs>(args?: SelectSubset<T, RepositoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Repositories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Repositories
     * const repository = await prisma.repository.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends RepositoryUpdateManyArgs>(args: SelectSubset<T, RepositoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Repositories and returns the data updated in the database.
     * @param {RepositoryUpdateManyAndReturnArgs} args - Arguments to update many Repositories.
     * @example
     * // Update many Repositories
     * const repository = await prisma.repository.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Repositories and only return the `id`
     * const repositoryWithIdOnly = await prisma.repository.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends RepositoryUpdateManyAndReturnArgs>(args: SelectSubset<T, RepositoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Repository.
     * @param {RepositoryUpsertArgs} args - Arguments to update or create a Repository.
     * @example
     * // Update or create a Repository
     * const repository = await prisma.repository.upsert({
     *   create: {
     *     // ... data to create a Repository
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Repository we want to update
     *   }
     * })
     */
    upsert<T extends RepositoryUpsertArgs>(args: SelectSubset<T, RepositoryUpsertArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Repositories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryCountArgs} args - Arguments to filter Repositories to count.
     * @example
     * // Count the number of Repositories
     * const count = await prisma.repository.count({
     *   where: {
     *     // ... the filter for the Repositories we want to count
     *   }
     * })
    **/
    count<T extends RepositoryCountArgs>(
      args?: Subset<T, RepositoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RepositoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Repository.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RepositoryAggregateArgs>(args: Subset<T, RepositoryAggregateArgs>): Prisma.PrismaPromise<GetRepositoryAggregateType<T>>

    /**
     * Group by Repository.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RepositoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<
      T extends RepositoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RepositoryGroupByArgs['orderBy'] }
        : { orderBy?: RepositoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RepositoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRepositoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Repository model
   */
  readonly fields: RepositoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Repository.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RepositoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    projects<T extends Repository$projectsArgs<ExtArgs> = {}>(args?: Subset<T, Repository$projectsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    runs<T extends Repository$runsArgs<ExtArgs> = {}>(args?: Subset<T, Repository$runsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    evidenceAttestations<T extends Repository$evidenceAttestationsArgs<ExtArgs> = {}>(args?: Subset<T, Repository$evidenceAttestationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    policyAssignments<T extends Repository$policyAssignmentsArgs<ExtArgs> = {}>(args?: Subset<T, Repository$policyAssignmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Repository model
   */
  interface RepositoryFieldRefs {
    readonly id: FieldRef<"Repository", 'String'>
    readonly organizationId: FieldRef<"Repository", 'String'>
    readonly name: FieldRef<"Repository", 'String'>
    readonly createdAt: FieldRef<"Repository", 'DateTime'>
  }


  // Custom InputTypes
  /**
   * Repository findUnique
   */
  export type RepositoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * Filter, which Repository to fetch.
     */
    where: RepositoryWhereUniqueInput
  }

  /**
   * Repository findUniqueOrThrow
   */
  export type RepositoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * Filter, which Repository to fetch.
     */
    where: RepositoryWhereUniqueInput
  }

  /**
   * Repository findFirst
   */
  export type RepositoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * Filter, which Repository to fetch.
     */
    where?: RepositoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Repositories to fetch.
     */
    orderBy?: RepositoryOrderByWithRelationInput | RepositoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Repositories.
     */
    cursor?: RepositoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Repositories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Repositories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Repositories.
     */
    distinct?: RepositoryScalarFieldEnum | RepositoryScalarFieldEnum[]
  }

  /**
   * Repository findFirstOrThrow
   */
  export type RepositoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * Filter, which Repository to fetch.
     */
    where?: RepositoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Repositories to fetch.
     */
    orderBy?: RepositoryOrderByWithRelationInput | RepositoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Repositories.
     */
    cursor?: RepositoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Repositories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Repositories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Repositories.
     */
    distinct?: RepositoryScalarFieldEnum | RepositoryScalarFieldEnum[]
  }

  /**
   * Repository findMany
   */
  export type RepositoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * Filter, which Repositories to fetch.
     */
    where?: RepositoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Repositories to fetch.
     */
    orderBy?: RepositoryOrderByWithRelationInput | RepositoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Repositories.
     */
    cursor?: RepositoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Repositories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Repositories.
     */
    skip?: number
    distinct?: RepositoryScalarFieldEnum | RepositoryScalarFieldEnum[]
  }

  /**
   * Repository create
   */
  export type RepositoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Repository.
     */
    data: XOR<RepositoryCreateInput, RepositoryUncheckedCreateInput>
  }

  /**
   * Repository createMany
   */
  export type RepositoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Repositories.
     */
    data: RepositoryCreateManyInput | RepositoryCreateManyInput[]
  }

  /**
   * Repository createManyAndReturn
   */
  export type RepositoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * The data used to create many Repositories.
     */
    data: RepositoryCreateManyInput | RepositoryCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Repository update
   */
  export type RepositoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Repository.
     */
    data: XOR<RepositoryUpdateInput, RepositoryUncheckedUpdateInput>
    /**
     * Choose, which Repository to update.
     */
    where: RepositoryWhereUniqueInput
  }

  /**
   * Repository updateMany
   */
  export type RepositoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Repositories.
     */
    data: XOR<RepositoryUpdateManyMutationInput, RepositoryUncheckedUpdateManyInput>
    /**
     * Filter which Repositories to update
     */
    where?: RepositoryWhereInput
    /**
     * Limit how many Repositories to update.
     */
    limit?: number
  }

  /**
   * Repository updateManyAndReturn
   */
  export type RepositoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * The data used to update Repositories.
     */
    data: XOR<RepositoryUpdateManyMutationInput, RepositoryUncheckedUpdateManyInput>
    /**
     * Filter which Repositories to update
     */
    where?: RepositoryWhereInput
    /**
     * Limit how many Repositories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Repository upsert
   */
  export type RepositoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Repository to update in case it exists.
     */
    where: RepositoryWhereUniqueInput
    /**
     * In case the Repository found by the `where` argument doesn't exist, create a new Repository with this data.
     */
    create: XOR<RepositoryCreateInput, RepositoryUncheckedCreateInput>
    /**
     * In case the Repository was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RepositoryUpdateInput, RepositoryUncheckedUpdateInput>
  }

  /**
   * Repository delete
   */
  export type RepositoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    /**
     * Filter which Repository to delete.
     */
    where: RepositoryWhereUniqueInput
  }

  /**
   * Repository deleteMany
   */
  export type RepositoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Repositories to delete
     */
    where?: RepositoryWhereInput
    /**
     * Limit how many Repositories to delete.
     */
    limit?: number
  }

  /**
   * Repository.projects
   */
  export type Repository$projectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    where?: ProjectWhereInput
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    cursor?: ProjectWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Repository.runs
   */
  export type Repository$runsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunInclude<ExtArgs> | null
    where?: ReadyLayerRunWhereInput
    orderBy?: ReadyLayerRunOrderByWithRelationInput | ReadyLayerRunOrderByWithRelationInput[]
    cursor?: ReadyLayerRunWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReadyLayerRunScalarFieldEnum | ReadyLayerRunScalarFieldEnum[]
  }

  /**
   * Repository.evidenceAttestations
   */
  export type Repository$evidenceAttestationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationInclude<ExtArgs> | null
    where?: EvidenceAttestationWhereInput
    orderBy?: EvidenceAttestationOrderByWithRelationInput | EvidenceAttestationOrderByWithRelationInput[]
    cursor?: EvidenceAttestationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EvidenceAttestationScalarFieldEnum | EvidenceAttestationScalarFieldEnum[]
  }

  /**
   * Repository.policyAssignments
   */
  export type Repository$policyAssignmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentInclude<ExtArgs> | null
    where?: PolicyPackAssignmentWhereInput
    orderBy?: PolicyPackAssignmentOrderByWithRelationInput | PolicyPackAssignmentOrderByWithRelationInput[]
    cursor?: PolicyPackAssignmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PolicyPackAssignmentScalarFieldEnum | PolicyPackAssignmentScalarFieldEnum[]
  }

  /**
   * Repository without action
   */
  export type RepositoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
  }


  /**
   * Model Project
   */

  export type AggregateProject = {
    _count: ProjectCountAggregateOutputType | null
    _min: ProjectMinAggregateOutputType | null
    _max: ProjectMaxAggregateOutputType | null
  }

  export type ProjectMinAggregateOutputType = {
    id: string | null
    repositoryId: string | null
    name: string | null
  }

  export type ProjectMaxAggregateOutputType = {
    id: string | null
    repositoryId: string | null
    name: string | null
  }

  export type ProjectCountAggregateOutputType = {
    id: number
    repositoryId: number
    name: number
    _all: number
  }


  export type ProjectMinAggregateInputType = {
    id?: true
    repositoryId?: true
    name?: true
  }

  export type ProjectMaxAggregateInputType = {
    id?: true
    repositoryId?: true
    name?: true
  }

  export type ProjectCountAggregateInputType = {
    id?: true
    repositoryId?: true
    name?: true
    _all?: true
  }

  export type ProjectAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Project to aggregate.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Projects
    **/
    _count?: true | ProjectCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ProjectMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ProjectMaxAggregateInputType
  }

  export type GetProjectAggregateType<T extends ProjectAggregateArgs> = {
        [P in keyof T & keyof AggregateProject]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProject[P]>
      : GetScalarType<T[P], AggregateProject[P]>
  }




  export type ProjectGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProjectWhereInput
    orderBy?: ProjectOrderByWithAggregationInput | ProjectOrderByWithAggregationInput[]
    by: ProjectScalarFieldEnum[] | ProjectScalarFieldEnum
    having?: ProjectScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProjectCountAggregateInputType | true
    _min?: ProjectMinAggregateInputType
    _max?: ProjectMaxAggregateInputType
  }

  export type ProjectGroupByOutputType = {
    id: string
    repositoryId: string
    name: string
    _count: ProjectCountAggregateOutputType | null
    _min: ProjectMinAggregateOutputType | null
    _max: ProjectMaxAggregateOutputType | null
  }

  type GetProjectGroupByPayload<T extends ProjectGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProjectGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProjectGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProjectGroupByOutputType[P]>
            : GetScalarType<T[P], ProjectGroupByOutputType[P]>
        }
      >
    >


  export type ProjectSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    repositoryId?: boolean
    name?: boolean
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    repositoryId?: boolean
    name?: boolean
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    repositoryId?: boolean
    name?: boolean
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectScalar = {
    id?: boolean
    repositoryId?: boolean
    name?: boolean
  }

  export type ProjectOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "repositoryId" | "name", ExtArgs["result"]["project"]>
  export type ProjectInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
  }
  export type ProjectIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
  }
  export type ProjectIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
  }

  export type $ProjectPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Project"
    objects: {
      repository: Prisma.$RepositoryPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      repositoryId: string
      name: string
    }, ExtArgs["result"]["project"]>
    composites: {}
  }

  type ProjectGetPayload<S extends boolean | null | undefined | ProjectDefaultArgs> = $Result.GetResult<Prisma.$ProjectPayload, S>

  type ProjectCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProjectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProjectCountAggregateInputType | true
    }

  export interface ProjectDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Project'], meta: { name: 'Project' } }
    /**
     * Find zero or one Project that matches the filter.
     * @param {ProjectFindUniqueArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProjectFindUniqueArgs>(args: SelectSubset<T, ProjectFindUniqueArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Project that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProjectFindUniqueOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProjectFindUniqueOrThrowArgs>(args: SelectSubset<T, ProjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProjectFindFirstArgs>(args?: SelectSubset<T, ProjectFindFirstArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProjectFindFirstOrThrowArgs>(args?: SelectSubset<T, ProjectFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Projects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Projects
     * const projects = await prisma.project.findMany()
     *
     * // Get first 10 Projects
     * const projects = await prisma.project.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const projectWithIdOnly = await prisma.project.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ProjectFindManyArgs>(args?: SelectSubset<T, ProjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Project.
     * @param {ProjectCreateArgs} args - Arguments to create a Project.
     * @example
     * // Create one Project
     * const Project = await prisma.project.create({
     *   data: {
     *     // ... data to create a Project
     *   }
     * })
     *
     */
    create<T extends ProjectCreateArgs>(args: SelectSubset<T, ProjectCreateArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Projects.
     * @param {ProjectCreateManyArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ProjectCreateManyArgs>(args?: SelectSubset<T, ProjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Projects and returns the data saved in the database.
     * @param {ProjectCreateManyAndReturnArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ProjectCreateManyAndReturnArgs>(args?: SelectSubset<T, ProjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Project.
     * @param {ProjectDeleteArgs} args - Arguments to delete one Project.
     * @example
     * // Delete one Project
     * const Project = await prisma.project.delete({
     *   where: {
     *     // ... filter to delete one Project
     *   }
     * })
     *
     */
    delete<T extends ProjectDeleteArgs>(args: SelectSubset<T, ProjectDeleteArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Project.
     * @param {ProjectUpdateArgs} args - Arguments to update one Project.
     * @example
     * // Update one Project
     * const project = await prisma.project.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ProjectUpdateArgs>(args: SelectSubset<T, ProjectUpdateArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Projects.
     * @param {ProjectDeleteManyArgs} args - Arguments to filter Projects to delete.
     * @example
     * // Delete a few Projects
     * const { count } = await prisma.project.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ProjectDeleteManyArgs>(args?: SelectSubset<T, ProjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ProjectUpdateManyArgs>(args: SelectSubset<T, ProjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Projects and returns the data updated in the database.
     * @param {ProjectUpdateManyAndReturnArgs} args - Arguments to update many Projects.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ProjectUpdateManyAndReturnArgs>(args: SelectSubset<T, ProjectUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Project.
     * @param {ProjectUpsertArgs} args - Arguments to update or create a Project.
     * @example
     * // Update or create a Project
     * const project = await prisma.project.upsert({
     *   create: {
     *     // ... data to create a Project
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Project we want to update
     *   }
     * })
     */
    upsert<T extends ProjectUpsertArgs>(args: SelectSubset<T, ProjectUpsertArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectCountArgs} args - Arguments to filter Projects to count.
     * @example
     * // Count the number of Projects
     * const count = await prisma.project.count({
     *   where: {
     *     // ... the filter for the Projects we want to count
     *   }
     * })
    **/
    count<T extends ProjectCountArgs>(
      args?: Subset<T, ProjectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProjectCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProjectAggregateArgs>(args: Subset<T, ProjectAggregateArgs>): Prisma.PrismaPromise<GetProjectAggregateType<T>>

    /**
     * Group by Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<
      T extends ProjectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProjectGroupByArgs['orderBy'] }
        : { orderBy?: ProjectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Project model
   */
  readonly fields: ProjectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Project.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProjectClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    repository<T extends RepositoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RepositoryDefaultArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Project model
   */
  interface ProjectFieldRefs {
    readonly id: FieldRef<"Project", 'String'>
    readonly repositoryId: FieldRef<"Project", 'String'>
    readonly name: FieldRef<"Project", 'String'>
  }


  // Custom InputTypes
  /**
   * Project findUnique
   */
  export type ProjectFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project findUniqueOrThrow
   */
  export type ProjectFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project findFirst
   */
  export type ProjectFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Projects.
     */
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project findFirstOrThrow
   */
  export type ProjectFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Projects.
     */
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project findMany
   */
  export type ProjectFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Projects to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Projects.
     */
    skip?: number
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project create
   */
  export type ProjectCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The data needed to create a Project.
     */
    data: XOR<ProjectCreateInput, ProjectUncheckedCreateInput>
  }

  /**
   * Project createMany
   */
  export type ProjectCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Projects.
     */
    data: ProjectCreateManyInput | ProjectCreateManyInput[]
  }

  /**
   * Project createManyAndReturn
   */
  export type ProjectCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data used to create many Projects.
     */
    data: ProjectCreateManyInput | ProjectCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Project update
   */
  export type ProjectUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The data needed to update a Project.
     */
    data: XOR<ProjectUpdateInput, ProjectUncheckedUpdateInput>
    /**
     * Choose, which Project to update.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project updateMany
   */
  export type ProjectUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Projects.
     */
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyInput>
    /**
     * Filter which Projects to update
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to update.
     */
    limit?: number
  }

  /**
   * Project updateManyAndReturn
   */
  export type ProjectUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data used to update Projects.
     */
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyInput>
    /**
     * Filter which Projects to update
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Project upsert
   */
  export type ProjectUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The filter to search for the Project to update in case it exists.
     */
    where: ProjectWhereUniqueInput
    /**
     * In case the Project found by the `where` argument doesn't exist, create a new Project with this data.
     */
    create: XOR<ProjectCreateInput, ProjectUncheckedCreateInput>
    /**
     * In case the Project was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProjectUpdateInput, ProjectUncheckedUpdateInput>
  }

  /**
   * Project delete
   */
  export type ProjectDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter which Project to delete.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project deleteMany
   */
  export type ProjectDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Projects to delete
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to delete.
     */
    limit?: number
  }

  /**
   * Project without action
   */
  export type ProjectDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
  }


  /**
   * Model ReadyLayerRun
   */

  export type AggregateReadyLayerRun = {
    _count: ReadyLayerRunCountAggregateOutputType | null
    _min: ReadyLayerRunMinAggregateOutputType | null
    _max: ReadyLayerRunMaxAggregateOutputType | null
  }

  export type ReadyLayerRunMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    repositoryId: string | null
    status: string | null
    createdAt: Date | null
  }

  export type ReadyLayerRunMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    repositoryId: string | null
    status: string | null
    createdAt: Date | null
  }

  export type ReadyLayerRunCountAggregateOutputType = {
    id: number
    organizationId: number
    repositoryId: number
    status: number
    createdAt: number
    _all: number
  }


  export type ReadyLayerRunMinAggregateInputType = {
    id?: true
    organizationId?: true
    repositoryId?: true
    status?: true
    createdAt?: true
  }

  export type ReadyLayerRunMaxAggregateInputType = {
    id?: true
    organizationId?: true
    repositoryId?: true
    status?: true
    createdAt?: true
  }

  export type ReadyLayerRunCountAggregateInputType = {
    id?: true
    organizationId?: true
    repositoryId?: true
    status?: true
    createdAt?: true
    _all?: true
  }

  export type ReadyLayerRunAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReadyLayerRun to aggregate.
     */
    where?: ReadyLayerRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ReadyLayerRuns to fetch.
     */
    orderBy?: ReadyLayerRunOrderByWithRelationInput | ReadyLayerRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: ReadyLayerRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ReadyLayerRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ReadyLayerRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ReadyLayerRuns
    **/
    _count?: true | ReadyLayerRunCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ReadyLayerRunMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ReadyLayerRunMaxAggregateInputType
  }

  export type GetReadyLayerRunAggregateType<T extends ReadyLayerRunAggregateArgs> = {
        [P in keyof T & keyof AggregateReadyLayerRun]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReadyLayerRun[P]>
      : GetScalarType<T[P], AggregateReadyLayerRun[P]>
  }




  export type ReadyLayerRunGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReadyLayerRunWhereInput
    orderBy?: ReadyLayerRunOrderByWithAggregationInput | ReadyLayerRunOrderByWithAggregationInput[]
    by: ReadyLayerRunScalarFieldEnum[] | ReadyLayerRunScalarFieldEnum
    having?: ReadyLayerRunScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReadyLayerRunCountAggregateInputType | true
    _min?: ReadyLayerRunMinAggregateInputType
    _max?: ReadyLayerRunMaxAggregateInputType
  }

  export type ReadyLayerRunGroupByOutputType = {
    id: string
    organizationId: string
    repositoryId: string
    status: string
    createdAt: Date
    _count: ReadyLayerRunCountAggregateOutputType | null
    _min: ReadyLayerRunMinAggregateOutputType | null
    _max: ReadyLayerRunMaxAggregateOutputType | null
  }

  type GetReadyLayerRunGroupByPayload<T extends ReadyLayerRunGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReadyLayerRunGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReadyLayerRunGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReadyLayerRunGroupByOutputType[P]>
            : GetScalarType<T[P], ReadyLayerRunGroupByOutputType[P]>
        }
      >
    >


  export type ReadyLayerRunSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    repositoryId?: boolean
    status?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    attestations?: boolean | ReadyLayerRun$attestationsArgs<ExtArgs>
    _count?: boolean | ReadyLayerRunCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["readyLayerRun"]>

  export type ReadyLayerRunSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    repositoryId?: boolean
    status?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["readyLayerRun"]>

  export type ReadyLayerRunSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    repositoryId?: boolean
    status?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["readyLayerRun"]>

  export type ReadyLayerRunSelectScalar = {
    id?: boolean
    organizationId?: boolean
    repositoryId?: boolean
    status?: boolean
    createdAt?: boolean
  }

  export type ReadyLayerRunOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "repositoryId" | "status" | "createdAt", ExtArgs["result"]["readyLayerRun"]>
  export type ReadyLayerRunInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    attestations?: boolean | ReadyLayerRun$attestationsArgs<ExtArgs>
    _count?: boolean | ReadyLayerRunCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ReadyLayerRunIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
  }
  export type ReadyLayerRunIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
  }

  export type $ReadyLayerRunPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReadyLayerRun"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      repository: Prisma.$RepositoryPayload<ExtArgs>
      attestations: Prisma.$EvidenceAttestationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      repositoryId: string
      status: string
      createdAt: Date
    }, ExtArgs["result"]["readyLayerRun"]>
    composites: {}
  }

  type ReadyLayerRunGetPayload<S extends boolean | null | undefined | ReadyLayerRunDefaultArgs> = $Result.GetResult<Prisma.$ReadyLayerRunPayload, S>

  type ReadyLayerRunCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReadyLayerRunFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReadyLayerRunCountAggregateInputType | true
    }

  export interface ReadyLayerRunDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReadyLayerRun'], meta: { name: 'ReadyLayerRun' } }
    /**
     * Find zero or one ReadyLayerRun that matches the filter.
     * @param {ReadyLayerRunFindUniqueArgs} args - Arguments to find a ReadyLayerRun
     * @example
     * // Get one ReadyLayerRun
     * const readyLayerRun = await prisma.readyLayerRun.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReadyLayerRunFindUniqueArgs>(args: SelectSubset<T, ReadyLayerRunFindUniqueArgs<ExtArgs>>): Prisma__ReadyLayerRunClient<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReadyLayerRun that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReadyLayerRunFindUniqueOrThrowArgs} args - Arguments to find a ReadyLayerRun
     * @example
     * // Get one ReadyLayerRun
     * const readyLayerRun = await prisma.readyLayerRun.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReadyLayerRunFindUniqueOrThrowArgs>(args: SelectSubset<T, ReadyLayerRunFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReadyLayerRunClient<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReadyLayerRun that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReadyLayerRunFindFirstArgs} args - Arguments to find a ReadyLayerRun
     * @example
     * // Get one ReadyLayerRun
     * const readyLayerRun = await prisma.readyLayerRun.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReadyLayerRunFindFirstArgs>(args?: SelectSubset<T, ReadyLayerRunFindFirstArgs<ExtArgs>>): Prisma__ReadyLayerRunClient<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReadyLayerRun that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReadyLayerRunFindFirstOrThrowArgs} args - Arguments to find a ReadyLayerRun
     * @example
     * // Get one ReadyLayerRun
     * const readyLayerRun = await prisma.readyLayerRun.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReadyLayerRunFindFirstOrThrowArgs>(args?: SelectSubset<T, ReadyLayerRunFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReadyLayerRunClient<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReadyLayerRuns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReadyLayerRunFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReadyLayerRuns
     * const readyLayerRuns = await prisma.readyLayerRun.findMany()
     *
     * // Get first 10 ReadyLayerRuns
     * const readyLayerRuns = await prisma.readyLayerRun.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const readyLayerRunWithIdOnly = await prisma.readyLayerRun.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ReadyLayerRunFindManyArgs>(args?: SelectSubset<T, ReadyLayerRunFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReadyLayerRun.
     * @param {ReadyLayerRunCreateArgs} args - Arguments to create a ReadyLayerRun.
     * @example
     * // Create one ReadyLayerRun
     * const ReadyLayerRun = await prisma.readyLayerRun.create({
     *   data: {
     *     // ... data to create a ReadyLayerRun
     *   }
     * })
     *
     */
    create<T extends ReadyLayerRunCreateArgs>(args: SelectSubset<T, ReadyLayerRunCreateArgs<ExtArgs>>): Prisma__ReadyLayerRunClient<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReadyLayerRuns.
     * @param {ReadyLayerRunCreateManyArgs} args - Arguments to create many ReadyLayerRuns.
     * @example
     * // Create many ReadyLayerRuns
     * const readyLayerRun = await prisma.readyLayerRun.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ReadyLayerRunCreateManyArgs>(args?: SelectSubset<T, ReadyLayerRunCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReadyLayerRuns and returns the data saved in the database.
     * @param {ReadyLayerRunCreateManyAndReturnArgs} args - Arguments to create many ReadyLayerRuns.
     * @example
     * // Create many ReadyLayerRuns
     * const readyLayerRun = await prisma.readyLayerRun.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ReadyLayerRuns and only return the `id`
     * const readyLayerRunWithIdOnly = await prisma.readyLayerRun.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ReadyLayerRunCreateManyAndReturnArgs>(args?: SelectSubset<T, ReadyLayerRunCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReadyLayerRun.
     * @param {ReadyLayerRunDeleteArgs} args - Arguments to delete one ReadyLayerRun.
     * @example
     * // Delete one ReadyLayerRun
     * const ReadyLayerRun = await prisma.readyLayerRun.delete({
     *   where: {
     *     // ... filter to delete one ReadyLayerRun
     *   }
     * })
     *
     */
    delete<T extends ReadyLayerRunDeleteArgs>(args: SelectSubset<T, ReadyLayerRunDeleteArgs<ExtArgs>>): Prisma__ReadyLayerRunClient<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReadyLayerRun.
     * @param {ReadyLayerRunUpdateArgs} args - Arguments to update one ReadyLayerRun.
     * @example
     * // Update one ReadyLayerRun
     * const readyLayerRun = await prisma.readyLayerRun.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ReadyLayerRunUpdateArgs>(args: SelectSubset<T, ReadyLayerRunUpdateArgs<ExtArgs>>): Prisma__ReadyLayerRunClient<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReadyLayerRuns.
     * @param {ReadyLayerRunDeleteManyArgs} args - Arguments to filter ReadyLayerRuns to delete.
     * @example
     * // Delete a few ReadyLayerRuns
     * const { count } = await prisma.readyLayerRun.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ReadyLayerRunDeleteManyArgs>(args?: SelectSubset<T, ReadyLayerRunDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReadyLayerRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReadyLayerRunUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReadyLayerRuns
     * const readyLayerRun = await prisma.readyLayerRun.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ReadyLayerRunUpdateManyArgs>(args: SelectSubset<T, ReadyLayerRunUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReadyLayerRuns and returns the data updated in the database.
     * @param {ReadyLayerRunUpdateManyAndReturnArgs} args - Arguments to update many ReadyLayerRuns.
     * @example
     * // Update many ReadyLayerRuns
     * const readyLayerRun = await prisma.readyLayerRun.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ReadyLayerRuns and only return the `id`
     * const readyLayerRunWithIdOnly = await prisma.readyLayerRun.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ReadyLayerRunUpdateManyAndReturnArgs>(args: SelectSubset<T, ReadyLayerRunUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReadyLayerRun.
     * @param {ReadyLayerRunUpsertArgs} args - Arguments to update or create a ReadyLayerRun.
     * @example
     * // Update or create a ReadyLayerRun
     * const readyLayerRun = await prisma.readyLayerRun.upsert({
     *   create: {
     *     // ... data to create a ReadyLayerRun
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReadyLayerRun we want to update
     *   }
     * })
     */
    upsert<T extends ReadyLayerRunUpsertArgs>(args: SelectSubset<T, ReadyLayerRunUpsertArgs<ExtArgs>>): Prisma__ReadyLayerRunClient<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReadyLayerRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReadyLayerRunCountArgs} args - Arguments to filter ReadyLayerRuns to count.
     * @example
     * // Count the number of ReadyLayerRuns
     * const count = await prisma.readyLayerRun.count({
     *   where: {
     *     // ... the filter for the ReadyLayerRuns we want to count
     *   }
     * })
    **/
    count<T extends ReadyLayerRunCountArgs>(
      args?: Subset<T, ReadyLayerRunCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReadyLayerRunCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReadyLayerRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReadyLayerRunAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReadyLayerRunAggregateArgs>(args: Subset<T, ReadyLayerRunAggregateArgs>): Prisma.PrismaPromise<GetReadyLayerRunAggregateType<T>>

    /**
     * Group by ReadyLayerRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReadyLayerRunGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<
      T extends ReadyLayerRunGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReadyLayerRunGroupByArgs['orderBy'] }
        : { orderBy?: ReadyLayerRunGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReadyLayerRunGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReadyLayerRunGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReadyLayerRun model
   */
  readonly fields: ReadyLayerRunFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReadyLayerRun.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReadyLayerRunClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    repository<T extends RepositoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RepositoryDefaultArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    attestations<T extends ReadyLayerRun$attestationsArgs<ExtArgs> = {}>(args?: Subset<T, ReadyLayerRun$attestationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReadyLayerRun model
   */
  interface ReadyLayerRunFieldRefs {
    readonly id: FieldRef<"ReadyLayerRun", 'String'>
    readonly organizationId: FieldRef<"ReadyLayerRun", 'String'>
    readonly repositoryId: FieldRef<"ReadyLayerRun", 'String'>
    readonly status: FieldRef<"ReadyLayerRun", 'String'>
    readonly createdAt: FieldRef<"ReadyLayerRun", 'DateTime'>
  }


  // Custom InputTypes
  /**
   * ReadyLayerRun findUnique
   */
  export type ReadyLayerRunFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunInclude<ExtArgs> | null
    /**
     * Filter, which ReadyLayerRun to fetch.
     */
    where: ReadyLayerRunWhereUniqueInput
  }

  /**
   * ReadyLayerRun findUniqueOrThrow
   */
  export type ReadyLayerRunFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunInclude<ExtArgs> | null
    /**
     * Filter, which ReadyLayerRun to fetch.
     */
    where: ReadyLayerRunWhereUniqueInput
  }

  /**
   * ReadyLayerRun findFirst
   */
  export type ReadyLayerRunFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunInclude<ExtArgs> | null
    /**
     * Filter, which ReadyLayerRun to fetch.
     */
    where?: ReadyLayerRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ReadyLayerRuns to fetch.
     */
    orderBy?: ReadyLayerRunOrderByWithRelationInput | ReadyLayerRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ReadyLayerRuns.
     */
    cursor?: ReadyLayerRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ReadyLayerRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ReadyLayerRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ReadyLayerRuns.
     */
    distinct?: ReadyLayerRunScalarFieldEnum | ReadyLayerRunScalarFieldEnum[]
  }

  /**
   * ReadyLayerRun findFirstOrThrow
   */
  export type ReadyLayerRunFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunInclude<ExtArgs> | null
    /**
     * Filter, which ReadyLayerRun to fetch.
     */
    where?: ReadyLayerRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ReadyLayerRuns to fetch.
     */
    orderBy?: ReadyLayerRunOrderByWithRelationInput | ReadyLayerRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ReadyLayerRuns.
     */
    cursor?: ReadyLayerRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ReadyLayerRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ReadyLayerRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ReadyLayerRuns.
     */
    distinct?: ReadyLayerRunScalarFieldEnum | ReadyLayerRunScalarFieldEnum[]
  }

  /**
   * ReadyLayerRun findMany
   */
  export type ReadyLayerRunFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunInclude<ExtArgs> | null
    /**
     * Filter, which ReadyLayerRuns to fetch.
     */
    where?: ReadyLayerRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ReadyLayerRuns to fetch.
     */
    orderBy?: ReadyLayerRunOrderByWithRelationInput | ReadyLayerRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ReadyLayerRuns.
     */
    cursor?: ReadyLayerRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ReadyLayerRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ReadyLayerRuns.
     */
    skip?: number
    distinct?: ReadyLayerRunScalarFieldEnum | ReadyLayerRunScalarFieldEnum[]
  }

  /**
   * ReadyLayerRun create
   */
  export type ReadyLayerRunCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunInclude<ExtArgs> | null
    /**
     * The data needed to create a ReadyLayerRun.
     */
    data: XOR<ReadyLayerRunCreateInput, ReadyLayerRunUncheckedCreateInput>
  }

  /**
   * ReadyLayerRun createMany
   */
  export type ReadyLayerRunCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReadyLayerRuns.
     */
    data: ReadyLayerRunCreateManyInput | ReadyLayerRunCreateManyInput[]
  }

  /**
   * ReadyLayerRun createManyAndReturn
   */
  export type ReadyLayerRunCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * The data used to create many ReadyLayerRuns.
     */
    data: ReadyLayerRunCreateManyInput | ReadyLayerRunCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReadyLayerRun update
   */
  export type ReadyLayerRunUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunInclude<ExtArgs> | null
    /**
     * The data needed to update a ReadyLayerRun.
     */
    data: XOR<ReadyLayerRunUpdateInput, ReadyLayerRunUncheckedUpdateInput>
    /**
     * Choose, which ReadyLayerRun to update.
     */
    where: ReadyLayerRunWhereUniqueInput
  }

  /**
   * ReadyLayerRun updateMany
   */
  export type ReadyLayerRunUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReadyLayerRuns.
     */
    data: XOR<ReadyLayerRunUpdateManyMutationInput, ReadyLayerRunUncheckedUpdateManyInput>
    /**
     * Filter which ReadyLayerRuns to update
     */
    where?: ReadyLayerRunWhereInput
    /**
     * Limit how many ReadyLayerRuns to update.
     */
    limit?: number
  }

  /**
   * ReadyLayerRun updateManyAndReturn
   */
  export type ReadyLayerRunUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * The data used to update ReadyLayerRuns.
     */
    data: XOR<ReadyLayerRunUpdateManyMutationInput, ReadyLayerRunUncheckedUpdateManyInput>
    /**
     * Filter which ReadyLayerRuns to update
     */
    where?: ReadyLayerRunWhereInput
    /**
     * Limit how many ReadyLayerRuns to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReadyLayerRun upsert
   */
  export type ReadyLayerRunUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunInclude<ExtArgs> | null
    /**
     * The filter to search for the ReadyLayerRun to update in case it exists.
     */
    where: ReadyLayerRunWhereUniqueInput
    /**
     * In case the ReadyLayerRun found by the `where` argument doesn't exist, create a new ReadyLayerRun with this data.
     */
    create: XOR<ReadyLayerRunCreateInput, ReadyLayerRunUncheckedCreateInput>
    /**
     * In case the ReadyLayerRun was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReadyLayerRunUpdateInput, ReadyLayerRunUncheckedUpdateInput>
  }

  /**
   * ReadyLayerRun delete
   */
  export type ReadyLayerRunDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunInclude<ExtArgs> | null
    /**
     * Filter which ReadyLayerRun to delete.
     */
    where: ReadyLayerRunWhereUniqueInput
  }

  /**
   * ReadyLayerRun deleteMany
   */
  export type ReadyLayerRunDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReadyLayerRuns to delete
     */
    where?: ReadyLayerRunWhereInput
    /**
     * Limit how many ReadyLayerRuns to delete.
     */
    limit?: number
  }

  /**
   * ReadyLayerRun.attestations
   */
  export type ReadyLayerRun$attestationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationInclude<ExtArgs> | null
    where?: EvidenceAttestationWhereInput
    orderBy?: EvidenceAttestationOrderByWithRelationInput | EvidenceAttestationOrderByWithRelationInput[]
    cursor?: EvidenceAttestationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EvidenceAttestationScalarFieldEnum | EvidenceAttestationScalarFieldEnum[]
  }

  /**
   * ReadyLayerRun without action
   */
  export type ReadyLayerRunDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReadyLayerRun
     */
    select?: ReadyLayerRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReadyLayerRun
     */
    omit?: ReadyLayerRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReadyLayerRunInclude<ExtArgs> | null
  }


  /**
   * Model EvidenceAttestation
   */

  export type AggregateEvidenceAttestation = {
    _count: EvidenceAttestationCountAggregateOutputType | null
    _min: EvidenceAttestationMinAggregateOutputType | null
    _max: EvidenceAttestationMaxAggregateOutputType | null
  }

  export type EvidenceAttestationMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    repositoryId: string | null
    runId: string | null
    manifestHash: string | null
    bundleHash: string | null
    treeHash: string | null
    signingMode: string | null
    signature: string | null
    publicKeyId: string | null
    createdAt: Date | null
  }

  export type EvidenceAttestationMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    repositoryId: string | null
    runId: string | null
    manifestHash: string | null
    bundleHash: string | null
    treeHash: string | null
    signingMode: string | null
    signature: string | null
    publicKeyId: string | null
    createdAt: Date | null
  }

  export type EvidenceAttestationCountAggregateOutputType = {
    id: number
    organizationId: number
    repositoryId: number
    runId: number
    manifestHash: number
    bundleHash: number
    treeHash: number
    signingMode: number
    signature: number
    publicKeyId: number
    createdAt: number
    _all: number
  }


  export type EvidenceAttestationMinAggregateInputType = {
    id?: true
    organizationId?: true
    repositoryId?: true
    runId?: true
    manifestHash?: true
    bundleHash?: true
    treeHash?: true
    signingMode?: true
    signature?: true
    publicKeyId?: true
    createdAt?: true
  }

  export type EvidenceAttestationMaxAggregateInputType = {
    id?: true
    organizationId?: true
    repositoryId?: true
    runId?: true
    manifestHash?: true
    bundleHash?: true
    treeHash?: true
    signingMode?: true
    signature?: true
    publicKeyId?: true
    createdAt?: true
  }

  export type EvidenceAttestationCountAggregateInputType = {
    id?: true
    organizationId?: true
    repositoryId?: true
    runId?: true
    manifestHash?: true
    bundleHash?: true
    treeHash?: true
    signingMode?: true
    signature?: true
    publicKeyId?: true
    createdAt?: true
    _all?: true
  }

  export type EvidenceAttestationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EvidenceAttestation to aggregate.
     */
    where?: EvidenceAttestationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EvidenceAttestations to fetch.
     */
    orderBy?: EvidenceAttestationOrderByWithRelationInput | EvidenceAttestationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: EvidenceAttestationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EvidenceAttestations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EvidenceAttestations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned EvidenceAttestations
    **/
    _count?: true | EvidenceAttestationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: EvidenceAttestationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: EvidenceAttestationMaxAggregateInputType
  }

  export type GetEvidenceAttestationAggregateType<T extends EvidenceAttestationAggregateArgs> = {
        [P in keyof T & keyof AggregateEvidenceAttestation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEvidenceAttestation[P]>
      : GetScalarType<T[P], AggregateEvidenceAttestation[P]>
  }




  export type EvidenceAttestationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EvidenceAttestationWhereInput
    orderBy?: EvidenceAttestationOrderByWithAggregationInput | EvidenceAttestationOrderByWithAggregationInput[]
    by: EvidenceAttestationScalarFieldEnum[] | EvidenceAttestationScalarFieldEnum
    having?: EvidenceAttestationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EvidenceAttestationCountAggregateInputType | true
    _min?: EvidenceAttestationMinAggregateInputType
    _max?: EvidenceAttestationMaxAggregateInputType
  }

  export type EvidenceAttestationGroupByOutputType = {
    id: string
    organizationId: string
    repositoryId: string
    runId: string
    manifestHash: string
    bundleHash: string
    treeHash: string
    signingMode: string
    signature: string | null
    publicKeyId: string | null
    createdAt: Date
    _count: EvidenceAttestationCountAggregateOutputType | null
    _min: EvidenceAttestationMinAggregateOutputType | null
    _max: EvidenceAttestationMaxAggregateOutputType | null
  }

  type GetEvidenceAttestationGroupByPayload<T extends EvidenceAttestationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EvidenceAttestationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EvidenceAttestationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EvidenceAttestationGroupByOutputType[P]>
            : GetScalarType<T[P], EvidenceAttestationGroupByOutputType[P]>
        }
      >
    >


  export type EvidenceAttestationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    repositoryId?: boolean
    runId?: boolean
    manifestHash?: boolean
    bundleHash?: boolean
    treeHash?: boolean
    signingMode?: boolean
    signature?: boolean
    publicKeyId?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    run?: boolean | ReadyLayerRunDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evidenceAttestation"]>

  export type EvidenceAttestationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    repositoryId?: boolean
    runId?: boolean
    manifestHash?: boolean
    bundleHash?: boolean
    treeHash?: boolean
    signingMode?: boolean
    signature?: boolean
    publicKeyId?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    run?: boolean | ReadyLayerRunDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evidenceAttestation"]>

  export type EvidenceAttestationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    repositoryId?: boolean
    runId?: boolean
    manifestHash?: boolean
    bundleHash?: boolean
    treeHash?: boolean
    signingMode?: boolean
    signature?: boolean
    publicKeyId?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    run?: boolean | ReadyLayerRunDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evidenceAttestation"]>

  export type EvidenceAttestationSelectScalar = {
    id?: boolean
    organizationId?: boolean
    repositoryId?: boolean
    runId?: boolean
    manifestHash?: boolean
    bundleHash?: boolean
    treeHash?: boolean
    signingMode?: boolean
    signature?: boolean
    publicKeyId?: boolean
    createdAt?: boolean
  }

  export type EvidenceAttestationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "repositoryId" | "runId" | "manifestHash" | "bundleHash" | "treeHash" | "signingMode" | "signature" | "publicKeyId" | "createdAt", ExtArgs["result"]["evidenceAttestation"]>
  export type EvidenceAttestationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    run?: boolean | ReadyLayerRunDefaultArgs<ExtArgs>
  }
  export type EvidenceAttestationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    run?: boolean | ReadyLayerRunDefaultArgs<ExtArgs>
  }
  export type EvidenceAttestationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | RepositoryDefaultArgs<ExtArgs>
    run?: boolean | ReadyLayerRunDefaultArgs<ExtArgs>
  }

  export type $EvidenceAttestationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EvidenceAttestation"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      repository: Prisma.$RepositoryPayload<ExtArgs>
      run: Prisma.$ReadyLayerRunPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      repositoryId: string
      runId: string
      manifestHash: string
      bundleHash: string
      treeHash: string
      signingMode: string
      signature: string | null
      publicKeyId: string | null
      createdAt: Date
    }, ExtArgs["result"]["evidenceAttestation"]>
    composites: {}
  }

  type EvidenceAttestationGetPayload<S extends boolean | null | undefined | EvidenceAttestationDefaultArgs> = $Result.GetResult<Prisma.$EvidenceAttestationPayload, S>

  type EvidenceAttestationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EvidenceAttestationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EvidenceAttestationCountAggregateInputType | true
    }

  export interface EvidenceAttestationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EvidenceAttestation'], meta: { name: 'EvidenceAttestation' } }
    /**
     * Find zero or one EvidenceAttestation that matches the filter.
     * @param {EvidenceAttestationFindUniqueArgs} args - Arguments to find a EvidenceAttestation
     * @example
     * // Get one EvidenceAttestation
     * const evidenceAttestation = await prisma.evidenceAttestation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EvidenceAttestationFindUniqueArgs>(args: SelectSubset<T, EvidenceAttestationFindUniqueArgs<ExtArgs>>): Prisma__EvidenceAttestationClient<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one EvidenceAttestation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EvidenceAttestationFindUniqueOrThrowArgs} args - Arguments to find a EvidenceAttestation
     * @example
     * // Get one EvidenceAttestation
     * const evidenceAttestation = await prisma.evidenceAttestation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EvidenceAttestationFindUniqueOrThrowArgs>(args: SelectSubset<T, EvidenceAttestationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EvidenceAttestationClient<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EvidenceAttestation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceAttestationFindFirstArgs} args - Arguments to find a EvidenceAttestation
     * @example
     * // Get one EvidenceAttestation
     * const evidenceAttestation = await prisma.evidenceAttestation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EvidenceAttestationFindFirstArgs>(args?: SelectSubset<T, EvidenceAttestationFindFirstArgs<ExtArgs>>): Prisma__EvidenceAttestationClient<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EvidenceAttestation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceAttestationFindFirstOrThrowArgs} args - Arguments to find a EvidenceAttestation
     * @example
     * // Get one EvidenceAttestation
     * const evidenceAttestation = await prisma.evidenceAttestation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EvidenceAttestationFindFirstOrThrowArgs>(args?: SelectSubset<T, EvidenceAttestationFindFirstOrThrowArgs<ExtArgs>>): Prisma__EvidenceAttestationClient<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more EvidenceAttestations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceAttestationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EvidenceAttestations
     * const evidenceAttestations = await prisma.evidenceAttestation.findMany()
     *
     * // Get first 10 EvidenceAttestations
     * const evidenceAttestations = await prisma.evidenceAttestation.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const evidenceAttestationWithIdOnly = await prisma.evidenceAttestation.findMany({ select: { id: true } })
     *
     */
    findMany<T extends EvidenceAttestationFindManyArgs>(args?: SelectSubset<T, EvidenceAttestationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a EvidenceAttestation.
     * @param {EvidenceAttestationCreateArgs} args - Arguments to create a EvidenceAttestation.
     * @example
     * // Create one EvidenceAttestation
     * const EvidenceAttestation = await prisma.evidenceAttestation.create({
     *   data: {
     *     // ... data to create a EvidenceAttestation
     *   }
     * })
     *
     */
    create<T extends EvidenceAttestationCreateArgs>(args: SelectSubset<T, EvidenceAttestationCreateArgs<ExtArgs>>): Prisma__EvidenceAttestationClient<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many EvidenceAttestations.
     * @param {EvidenceAttestationCreateManyArgs} args - Arguments to create many EvidenceAttestations.
     * @example
     * // Create many EvidenceAttestations
     * const evidenceAttestation = await prisma.evidenceAttestation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends EvidenceAttestationCreateManyArgs>(args?: SelectSubset<T, EvidenceAttestationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EvidenceAttestations and returns the data saved in the database.
     * @param {EvidenceAttestationCreateManyAndReturnArgs} args - Arguments to create many EvidenceAttestations.
     * @example
     * // Create many EvidenceAttestations
     * const evidenceAttestation = await prisma.evidenceAttestation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many EvidenceAttestations and only return the `id`
     * const evidenceAttestationWithIdOnly = await prisma.evidenceAttestation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends EvidenceAttestationCreateManyAndReturnArgs>(args?: SelectSubset<T, EvidenceAttestationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a EvidenceAttestation.
     * @param {EvidenceAttestationDeleteArgs} args - Arguments to delete one EvidenceAttestation.
     * @example
     * // Delete one EvidenceAttestation
     * const EvidenceAttestation = await prisma.evidenceAttestation.delete({
     *   where: {
     *     // ... filter to delete one EvidenceAttestation
     *   }
     * })
     *
     */
    delete<T extends EvidenceAttestationDeleteArgs>(args: SelectSubset<T, EvidenceAttestationDeleteArgs<ExtArgs>>): Prisma__EvidenceAttestationClient<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one EvidenceAttestation.
     * @param {EvidenceAttestationUpdateArgs} args - Arguments to update one EvidenceAttestation.
     * @example
     * // Update one EvidenceAttestation
     * const evidenceAttestation = await prisma.evidenceAttestation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends EvidenceAttestationUpdateArgs>(args: SelectSubset<T, EvidenceAttestationUpdateArgs<ExtArgs>>): Prisma__EvidenceAttestationClient<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more EvidenceAttestations.
     * @param {EvidenceAttestationDeleteManyArgs} args - Arguments to filter EvidenceAttestations to delete.
     * @example
     * // Delete a few EvidenceAttestations
     * const { count } = await prisma.evidenceAttestation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends EvidenceAttestationDeleteManyArgs>(args?: SelectSubset<T, EvidenceAttestationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EvidenceAttestations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceAttestationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EvidenceAttestations
     * const evidenceAttestation = await prisma.evidenceAttestation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends EvidenceAttestationUpdateManyArgs>(args: SelectSubset<T, EvidenceAttestationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EvidenceAttestations and returns the data updated in the database.
     * @param {EvidenceAttestationUpdateManyAndReturnArgs} args - Arguments to update many EvidenceAttestations.
     * @example
     * // Update many EvidenceAttestations
     * const evidenceAttestation = await prisma.evidenceAttestation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more EvidenceAttestations and only return the `id`
     * const evidenceAttestationWithIdOnly = await prisma.evidenceAttestation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends EvidenceAttestationUpdateManyAndReturnArgs>(args: SelectSubset<T, EvidenceAttestationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one EvidenceAttestation.
     * @param {EvidenceAttestationUpsertArgs} args - Arguments to update or create a EvidenceAttestation.
     * @example
     * // Update or create a EvidenceAttestation
     * const evidenceAttestation = await prisma.evidenceAttestation.upsert({
     *   create: {
     *     // ... data to create a EvidenceAttestation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EvidenceAttestation we want to update
     *   }
     * })
     */
    upsert<T extends EvidenceAttestationUpsertArgs>(args: SelectSubset<T, EvidenceAttestationUpsertArgs<ExtArgs>>): Prisma__EvidenceAttestationClient<$Result.GetResult<Prisma.$EvidenceAttestationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of EvidenceAttestations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceAttestationCountArgs} args - Arguments to filter EvidenceAttestations to count.
     * @example
     * // Count the number of EvidenceAttestations
     * const count = await prisma.evidenceAttestation.count({
     *   where: {
     *     // ... the filter for the EvidenceAttestations we want to count
     *   }
     * })
    **/
    count<T extends EvidenceAttestationCountArgs>(
      args?: Subset<T, EvidenceAttestationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EvidenceAttestationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EvidenceAttestation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceAttestationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EvidenceAttestationAggregateArgs>(args: Subset<T, EvidenceAttestationAggregateArgs>): Prisma.PrismaPromise<GetEvidenceAttestationAggregateType<T>>

    /**
     * Group by EvidenceAttestation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceAttestationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<
      T extends EvidenceAttestationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EvidenceAttestationGroupByArgs['orderBy'] }
        : { orderBy?: EvidenceAttestationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EvidenceAttestationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEvidenceAttestationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EvidenceAttestation model
   */
  readonly fields: EvidenceAttestationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EvidenceAttestation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EvidenceAttestationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    repository<T extends RepositoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RepositoryDefaultArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    run<T extends ReadyLayerRunDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReadyLayerRunDefaultArgs<ExtArgs>>): Prisma__ReadyLayerRunClient<$Result.GetResult<Prisma.$ReadyLayerRunPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EvidenceAttestation model
   */
  interface EvidenceAttestationFieldRefs {
    readonly id: FieldRef<"EvidenceAttestation", 'String'>
    readonly organizationId: FieldRef<"EvidenceAttestation", 'String'>
    readonly repositoryId: FieldRef<"EvidenceAttestation", 'String'>
    readonly runId: FieldRef<"EvidenceAttestation", 'String'>
    readonly manifestHash: FieldRef<"EvidenceAttestation", 'String'>
    readonly bundleHash: FieldRef<"EvidenceAttestation", 'String'>
    readonly treeHash: FieldRef<"EvidenceAttestation", 'String'>
    readonly signingMode: FieldRef<"EvidenceAttestation", 'String'>
    readonly signature: FieldRef<"EvidenceAttestation", 'String'>
    readonly publicKeyId: FieldRef<"EvidenceAttestation", 'String'>
    readonly createdAt: FieldRef<"EvidenceAttestation", 'DateTime'>
  }


  // Custom InputTypes
  /**
   * EvidenceAttestation findUnique
   */
  export type EvidenceAttestationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationInclude<ExtArgs> | null
    /**
     * Filter, which EvidenceAttestation to fetch.
     */
    where: EvidenceAttestationWhereUniqueInput
  }

  /**
   * EvidenceAttestation findUniqueOrThrow
   */
  export type EvidenceAttestationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationInclude<ExtArgs> | null
    /**
     * Filter, which EvidenceAttestation to fetch.
     */
    where: EvidenceAttestationWhereUniqueInput
  }

  /**
   * EvidenceAttestation findFirst
   */
  export type EvidenceAttestationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationInclude<ExtArgs> | null
    /**
     * Filter, which EvidenceAttestation to fetch.
     */
    where?: EvidenceAttestationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EvidenceAttestations to fetch.
     */
    orderBy?: EvidenceAttestationOrderByWithRelationInput | EvidenceAttestationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for EvidenceAttestations.
     */
    cursor?: EvidenceAttestationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EvidenceAttestations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EvidenceAttestations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of EvidenceAttestations.
     */
    distinct?: EvidenceAttestationScalarFieldEnum | EvidenceAttestationScalarFieldEnum[]
  }

  /**
   * EvidenceAttestation findFirstOrThrow
   */
  export type EvidenceAttestationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationInclude<ExtArgs> | null
    /**
     * Filter, which EvidenceAttestation to fetch.
     */
    where?: EvidenceAttestationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EvidenceAttestations to fetch.
     */
    orderBy?: EvidenceAttestationOrderByWithRelationInput | EvidenceAttestationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for EvidenceAttestations.
     */
    cursor?: EvidenceAttestationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EvidenceAttestations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EvidenceAttestations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of EvidenceAttestations.
     */
    distinct?: EvidenceAttestationScalarFieldEnum | EvidenceAttestationScalarFieldEnum[]
  }

  /**
   * EvidenceAttestation findMany
   */
  export type EvidenceAttestationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationInclude<ExtArgs> | null
    /**
     * Filter, which EvidenceAttestations to fetch.
     */
    where?: EvidenceAttestationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EvidenceAttestations to fetch.
     */
    orderBy?: EvidenceAttestationOrderByWithRelationInput | EvidenceAttestationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing EvidenceAttestations.
     */
    cursor?: EvidenceAttestationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EvidenceAttestations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EvidenceAttestations.
     */
    skip?: number
    distinct?: EvidenceAttestationScalarFieldEnum | EvidenceAttestationScalarFieldEnum[]
  }

  /**
   * EvidenceAttestation create
   */
  export type EvidenceAttestationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationInclude<ExtArgs> | null
    /**
     * The data needed to create a EvidenceAttestation.
     */
    data: XOR<EvidenceAttestationCreateInput, EvidenceAttestationUncheckedCreateInput>
  }

  /**
   * EvidenceAttestation createMany
   */
  export type EvidenceAttestationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EvidenceAttestations.
     */
    data: EvidenceAttestationCreateManyInput | EvidenceAttestationCreateManyInput[]
  }

  /**
   * EvidenceAttestation createManyAndReturn
   */
  export type EvidenceAttestationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * The data used to create many EvidenceAttestations.
     */
    data: EvidenceAttestationCreateManyInput | EvidenceAttestationCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EvidenceAttestation update
   */
  export type EvidenceAttestationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationInclude<ExtArgs> | null
    /**
     * The data needed to update a EvidenceAttestation.
     */
    data: XOR<EvidenceAttestationUpdateInput, EvidenceAttestationUncheckedUpdateInput>
    /**
     * Choose, which EvidenceAttestation to update.
     */
    where: EvidenceAttestationWhereUniqueInput
  }

  /**
   * EvidenceAttestation updateMany
   */
  export type EvidenceAttestationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EvidenceAttestations.
     */
    data: XOR<EvidenceAttestationUpdateManyMutationInput, EvidenceAttestationUncheckedUpdateManyInput>
    /**
     * Filter which EvidenceAttestations to update
     */
    where?: EvidenceAttestationWhereInput
    /**
     * Limit how many EvidenceAttestations to update.
     */
    limit?: number
  }

  /**
   * EvidenceAttestation updateManyAndReturn
   */
  export type EvidenceAttestationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * The data used to update EvidenceAttestations.
     */
    data: XOR<EvidenceAttestationUpdateManyMutationInput, EvidenceAttestationUncheckedUpdateManyInput>
    /**
     * Filter which EvidenceAttestations to update
     */
    where?: EvidenceAttestationWhereInput
    /**
     * Limit how many EvidenceAttestations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * EvidenceAttestation upsert
   */
  export type EvidenceAttestationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationInclude<ExtArgs> | null
    /**
     * The filter to search for the EvidenceAttestation to update in case it exists.
     */
    where: EvidenceAttestationWhereUniqueInput
    /**
     * In case the EvidenceAttestation found by the `where` argument doesn't exist, create a new EvidenceAttestation with this data.
     */
    create: XOR<EvidenceAttestationCreateInput, EvidenceAttestationUncheckedCreateInput>
    /**
     * In case the EvidenceAttestation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EvidenceAttestationUpdateInput, EvidenceAttestationUncheckedUpdateInput>
  }

  /**
   * EvidenceAttestation delete
   */
  export type EvidenceAttestationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationInclude<ExtArgs> | null
    /**
     * Filter which EvidenceAttestation to delete.
     */
    where: EvidenceAttestationWhereUniqueInput
  }

  /**
   * EvidenceAttestation deleteMany
   */
  export type EvidenceAttestationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EvidenceAttestations to delete
     */
    where?: EvidenceAttestationWhereInput
    /**
     * Limit how many EvidenceAttestations to delete.
     */
    limit?: number
  }

  /**
   * EvidenceAttestation without action
   */
  export type EvidenceAttestationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceAttestation
     */
    select?: EvidenceAttestationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceAttestation
     */
    omit?: EvidenceAttestationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceAttestationInclude<ExtArgs> | null
  }


  /**
   * Model EvidenceObject
   */

  export type AggregateEvidenceObject = {
    _count: EvidenceObjectCountAggregateOutputType | null
    _avg: EvidenceObjectAvgAggregateOutputType | null
    _sum: EvidenceObjectSumAggregateOutputType | null
    _min: EvidenceObjectMinAggregateOutputType | null
    _max: EvidenceObjectMaxAggregateOutputType | null
  }

  export type EvidenceObjectAvgAggregateOutputType = {
    sizeBytes: number | null
  }

  export type EvidenceObjectSumAggregateOutputType = {
    sizeBytes: number | null
  }

  export type EvidenceObjectMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    runId: string | null
    kind: string | null
    storageProvider: string | null
    storageKey: string | null
    sizeBytes: number | null
    contentHash: string | null
    createdAt: Date | null
  }

  export type EvidenceObjectMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    runId: string | null
    kind: string | null
    storageProvider: string | null
    storageKey: string | null
    sizeBytes: number | null
    contentHash: string | null
    createdAt: Date | null
  }

  export type EvidenceObjectCountAggregateOutputType = {
    id: number
    organizationId: number
    runId: number
    kind: number
    storageProvider: number
    storageKey: number
    sizeBytes: number
    contentHash: number
    createdAt: number
    _all: number
  }


  export type EvidenceObjectAvgAggregateInputType = {
    sizeBytes?: true
  }

  export type EvidenceObjectSumAggregateInputType = {
    sizeBytes?: true
  }

  export type EvidenceObjectMinAggregateInputType = {
    id?: true
    organizationId?: true
    runId?: true
    kind?: true
    storageProvider?: true
    storageKey?: true
    sizeBytes?: true
    contentHash?: true
    createdAt?: true
  }

  export type EvidenceObjectMaxAggregateInputType = {
    id?: true
    organizationId?: true
    runId?: true
    kind?: true
    storageProvider?: true
    storageKey?: true
    sizeBytes?: true
    contentHash?: true
    createdAt?: true
  }

  export type EvidenceObjectCountAggregateInputType = {
    id?: true
    organizationId?: true
    runId?: true
    kind?: true
    storageProvider?: true
    storageKey?: true
    sizeBytes?: true
    contentHash?: true
    createdAt?: true
    _all?: true
  }

  export type EvidenceObjectAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EvidenceObject to aggregate.
     */
    where?: EvidenceObjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EvidenceObjects to fetch.
     */
    orderBy?: EvidenceObjectOrderByWithRelationInput | EvidenceObjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: EvidenceObjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EvidenceObjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EvidenceObjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned EvidenceObjects
    **/
    _count?: true | EvidenceObjectCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: EvidenceObjectAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: EvidenceObjectSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: EvidenceObjectMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: EvidenceObjectMaxAggregateInputType
  }

  export type GetEvidenceObjectAggregateType<T extends EvidenceObjectAggregateArgs> = {
        [P in keyof T & keyof AggregateEvidenceObject]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEvidenceObject[P]>
      : GetScalarType<T[P], AggregateEvidenceObject[P]>
  }




  export type EvidenceObjectGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EvidenceObjectWhereInput
    orderBy?: EvidenceObjectOrderByWithAggregationInput | EvidenceObjectOrderByWithAggregationInput[]
    by: EvidenceObjectScalarFieldEnum[] | EvidenceObjectScalarFieldEnum
    having?: EvidenceObjectScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EvidenceObjectCountAggregateInputType | true
    _avg?: EvidenceObjectAvgAggregateInputType
    _sum?: EvidenceObjectSumAggregateInputType
    _min?: EvidenceObjectMinAggregateInputType
    _max?: EvidenceObjectMaxAggregateInputType
  }

  export type EvidenceObjectGroupByOutputType = {
    id: string
    organizationId: string
    runId: string | null
    kind: string
    storageProvider: string
    storageKey: string
    sizeBytes: number
    contentHash: string
    createdAt: Date
    _count: EvidenceObjectCountAggregateOutputType | null
    _avg: EvidenceObjectAvgAggregateOutputType | null
    _sum: EvidenceObjectSumAggregateOutputType | null
    _min: EvidenceObjectMinAggregateOutputType | null
    _max: EvidenceObjectMaxAggregateOutputType | null
  }

  type GetEvidenceObjectGroupByPayload<T extends EvidenceObjectGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EvidenceObjectGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EvidenceObjectGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EvidenceObjectGroupByOutputType[P]>
            : GetScalarType<T[P], EvidenceObjectGroupByOutputType[P]>
        }
      >
    >


  export type EvidenceObjectSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    runId?: boolean
    kind?: boolean
    storageProvider?: boolean
    storageKey?: boolean
    sizeBytes?: boolean
    contentHash?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evidenceObject"]>

  export type EvidenceObjectSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    runId?: boolean
    kind?: boolean
    storageProvider?: boolean
    storageKey?: boolean
    sizeBytes?: boolean
    contentHash?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evidenceObject"]>

  export type EvidenceObjectSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    runId?: boolean
    kind?: boolean
    storageProvider?: boolean
    storageKey?: boolean
    sizeBytes?: boolean
    contentHash?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evidenceObject"]>

  export type EvidenceObjectSelectScalar = {
    id?: boolean
    organizationId?: boolean
    runId?: boolean
    kind?: boolean
    storageProvider?: boolean
    storageKey?: boolean
    sizeBytes?: boolean
    contentHash?: boolean
    createdAt?: boolean
  }

  export type EvidenceObjectOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "runId" | "kind" | "storageProvider" | "storageKey" | "sizeBytes" | "contentHash" | "createdAt", ExtArgs["result"]["evidenceObject"]>
  export type EvidenceObjectInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type EvidenceObjectIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type EvidenceObjectIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $EvidenceObjectPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EvidenceObject"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      runId: string | null
      kind: string
      storageProvider: string
      storageKey: string
      sizeBytes: number
      contentHash: string
      createdAt: Date
    }, ExtArgs["result"]["evidenceObject"]>
    composites: {}
  }

  type EvidenceObjectGetPayload<S extends boolean | null | undefined | EvidenceObjectDefaultArgs> = $Result.GetResult<Prisma.$EvidenceObjectPayload, S>

  type EvidenceObjectCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EvidenceObjectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EvidenceObjectCountAggregateInputType | true
    }

  export interface EvidenceObjectDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EvidenceObject'], meta: { name: 'EvidenceObject' } }
    /**
     * Find zero or one EvidenceObject that matches the filter.
     * @param {EvidenceObjectFindUniqueArgs} args - Arguments to find a EvidenceObject
     * @example
     * // Get one EvidenceObject
     * const evidenceObject = await prisma.evidenceObject.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EvidenceObjectFindUniqueArgs>(args: SelectSubset<T, EvidenceObjectFindUniqueArgs<ExtArgs>>): Prisma__EvidenceObjectClient<$Result.GetResult<Prisma.$EvidenceObjectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one EvidenceObject that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EvidenceObjectFindUniqueOrThrowArgs} args - Arguments to find a EvidenceObject
     * @example
     * // Get one EvidenceObject
     * const evidenceObject = await prisma.evidenceObject.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EvidenceObjectFindUniqueOrThrowArgs>(args: SelectSubset<T, EvidenceObjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EvidenceObjectClient<$Result.GetResult<Prisma.$EvidenceObjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EvidenceObject that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceObjectFindFirstArgs} args - Arguments to find a EvidenceObject
     * @example
     * // Get one EvidenceObject
     * const evidenceObject = await prisma.evidenceObject.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EvidenceObjectFindFirstArgs>(args?: SelectSubset<T, EvidenceObjectFindFirstArgs<ExtArgs>>): Prisma__EvidenceObjectClient<$Result.GetResult<Prisma.$EvidenceObjectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EvidenceObject that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceObjectFindFirstOrThrowArgs} args - Arguments to find a EvidenceObject
     * @example
     * // Get one EvidenceObject
     * const evidenceObject = await prisma.evidenceObject.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EvidenceObjectFindFirstOrThrowArgs>(args?: SelectSubset<T, EvidenceObjectFindFirstOrThrowArgs<ExtArgs>>): Prisma__EvidenceObjectClient<$Result.GetResult<Prisma.$EvidenceObjectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more EvidenceObjects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceObjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EvidenceObjects
     * const evidenceObjects = await prisma.evidenceObject.findMany()
     *
     * // Get first 10 EvidenceObjects
     * const evidenceObjects = await prisma.evidenceObject.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const evidenceObjectWithIdOnly = await prisma.evidenceObject.findMany({ select: { id: true } })
     *
     */
    findMany<T extends EvidenceObjectFindManyArgs>(args?: SelectSubset<T, EvidenceObjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EvidenceObjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a EvidenceObject.
     * @param {EvidenceObjectCreateArgs} args - Arguments to create a EvidenceObject.
     * @example
     * // Create one EvidenceObject
     * const EvidenceObject = await prisma.evidenceObject.create({
     *   data: {
     *     // ... data to create a EvidenceObject
     *   }
     * })
     *
     */
    create<T extends EvidenceObjectCreateArgs>(args: SelectSubset<T, EvidenceObjectCreateArgs<ExtArgs>>): Prisma__EvidenceObjectClient<$Result.GetResult<Prisma.$EvidenceObjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many EvidenceObjects.
     * @param {EvidenceObjectCreateManyArgs} args - Arguments to create many EvidenceObjects.
     * @example
     * // Create many EvidenceObjects
     * const evidenceObject = await prisma.evidenceObject.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends EvidenceObjectCreateManyArgs>(args?: SelectSubset<T, EvidenceObjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EvidenceObjects and returns the data saved in the database.
     * @param {EvidenceObjectCreateManyAndReturnArgs} args - Arguments to create many EvidenceObjects.
     * @example
     * // Create many EvidenceObjects
     * const evidenceObject = await prisma.evidenceObject.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many EvidenceObjects and only return the `id`
     * const evidenceObjectWithIdOnly = await prisma.evidenceObject.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends EvidenceObjectCreateManyAndReturnArgs>(args?: SelectSubset<T, EvidenceObjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EvidenceObjectPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a EvidenceObject.
     * @param {EvidenceObjectDeleteArgs} args - Arguments to delete one EvidenceObject.
     * @example
     * // Delete one EvidenceObject
     * const EvidenceObject = await prisma.evidenceObject.delete({
     *   where: {
     *     // ... filter to delete one EvidenceObject
     *   }
     * })
     *
     */
    delete<T extends EvidenceObjectDeleteArgs>(args: SelectSubset<T, EvidenceObjectDeleteArgs<ExtArgs>>): Prisma__EvidenceObjectClient<$Result.GetResult<Prisma.$EvidenceObjectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one EvidenceObject.
     * @param {EvidenceObjectUpdateArgs} args - Arguments to update one EvidenceObject.
     * @example
     * // Update one EvidenceObject
     * const evidenceObject = await prisma.evidenceObject.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends EvidenceObjectUpdateArgs>(args: SelectSubset<T, EvidenceObjectUpdateArgs<ExtArgs>>): Prisma__EvidenceObjectClient<$Result.GetResult<Prisma.$EvidenceObjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more EvidenceObjects.
     * @param {EvidenceObjectDeleteManyArgs} args - Arguments to filter EvidenceObjects to delete.
     * @example
     * // Delete a few EvidenceObjects
     * const { count } = await prisma.evidenceObject.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends EvidenceObjectDeleteManyArgs>(args?: SelectSubset<T, EvidenceObjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EvidenceObjects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceObjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EvidenceObjects
     * const evidenceObject = await prisma.evidenceObject.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends EvidenceObjectUpdateManyArgs>(args: SelectSubset<T, EvidenceObjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EvidenceObjects and returns the data updated in the database.
     * @param {EvidenceObjectUpdateManyAndReturnArgs} args - Arguments to update many EvidenceObjects.
     * @example
     * // Update many EvidenceObjects
     * const evidenceObject = await prisma.evidenceObject.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more EvidenceObjects and only return the `id`
     * const evidenceObjectWithIdOnly = await prisma.evidenceObject.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends EvidenceObjectUpdateManyAndReturnArgs>(args: SelectSubset<T, EvidenceObjectUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EvidenceObjectPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one EvidenceObject.
     * @param {EvidenceObjectUpsertArgs} args - Arguments to update or create a EvidenceObject.
     * @example
     * // Update or create a EvidenceObject
     * const evidenceObject = await prisma.evidenceObject.upsert({
     *   create: {
     *     // ... data to create a EvidenceObject
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EvidenceObject we want to update
     *   }
     * })
     */
    upsert<T extends EvidenceObjectUpsertArgs>(args: SelectSubset<T, EvidenceObjectUpsertArgs<ExtArgs>>): Prisma__EvidenceObjectClient<$Result.GetResult<Prisma.$EvidenceObjectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of EvidenceObjects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceObjectCountArgs} args - Arguments to filter EvidenceObjects to count.
     * @example
     * // Count the number of EvidenceObjects
     * const count = await prisma.evidenceObject.count({
     *   where: {
     *     // ... the filter for the EvidenceObjects we want to count
     *   }
     * })
    **/
    count<T extends EvidenceObjectCountArgs>(
      args?: Subset<T, EvidenceObjectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EvidenceObjectCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EvidenceObject.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceObjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EvidenceObjectAggregateArgs>(args: Subset<T, EvidenceObjectAggregateArgs>): Prisma.PrismaPromise<GetEvidenceObjectAggregateType<T>>

    /**
     * Group by EvidenceObject.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EvidenceObjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<
      T extends EvidenceObjectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EvidenceObjectGroupByArgs['orderBy'] }
        : { orderBy?: EvidenceObjectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EvidenceObjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEvidenceObjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EvidenceObject model
   */
  readonly fields: EvidenceObjectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EvidenceObject.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EvidenceObjectClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EvidenceObject model
   */
  interface EvidenceObjectFieldRefs {
    readonly id: FieldRef<"EvidenceObject", 'String'>
    readonly organizationId: FieldRef<"EvidenceObject", 'String'>
    readonly runId: FieldRef<"EvidenceObject", 'String'>
    readonly kind: FieldRef<"EvidenceObject", 'String'>
    readonly storageProvider: FieldRef<"EvidenceObject", 'String'>
    readonly storageKey: FieldRef<"EvidenceObject", 'String'>
    readonly sizeBytes: FieldRef<"EvidenceObject", 'Int'>
    readonly contentHash: FieldRef<"EvidenceObject", 'String'>
    readonly createdAt: FieldRef<"EvidenceObject", 'DateTime'>
  }


  // Custom InputTypes
  /**
   * EvidenceObject findUnique
   */
  export type EvidenceObjectFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceObject
     */
    select?: EvidenceObjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceObject
     */
    omit?: EvidenceObjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceObjectInclude<ExtArgs> | null
    /**
     * Filter, which EvidenceObject to fetch.
     */
    where: EvidenceObjectWhereUniqueInput
  }

  /**
   * EvidenceObject findUniqueOrThrow
   */
  export type EvidenceObjectFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceObject
     */
    select?: EvidenceObjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceObject
     */
    omit?: EvidenceObjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceObjectInclude<ExtArgs> | null
    /**
     * Filter, which EvidenceObject to fetch.
     */
    where: EvidenceObjectWhereUniqueInput
  }

  /**
   * EvidenceObject findFirst
   */
  export type EvidenceObjectFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceObject
     */
    select?: EvidenceObjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceObject
     */
    omit?: EvidenceObjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceObjectInclude<ExtArgs> | null
    /**
     * Filter, which EvidenceObject to fetch.
     */
    where?: EvidenceObjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EvidenceObjects to fetch.
     */
    orderBy?: EvidenceObjectOrderByWithRelationInput | EvidenceObjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for EvidenceObjects.
     */
    cursor?: EvidenceObjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EvidenceObjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EvidenceObjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of EvidenceObjects.
     */
    distinct?: EvidenceObjectScalarFieldEnum | EvidenceObjectScalarFieldEnum[]
  }

  /**
   * EvidenceObject findFirstOrThrow
   */
  export type EvidenceObjectFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceObject
     */
    select?: EvidenceObjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceObject
     */
    omit?: EvidenceObjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceObjectInclude<ExtArgs> | null
    /**
     * Filter, which EvidenceObject to fetch.
     */
    where?: EvidenceObjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EvidenceObjects to fetch.
     */
    orderBy?: EvidenceObjectOrderByWithRelationInput | EvidenceObjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for EvidenceObjects.
     */
    cursor?: EvidenceObjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EvidenceObjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EvidenceObjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of EvidenceObjects.
     */
    distinct?: EvidenceObjectScalarFieldEnum | EvidenceObjectScalarFieldEnum[]
  }

  /**
   * EvidenceObject findMany
   */
  export type EvidenceObjectFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceObject
     */
    select?: EvidenceObjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceObject
     */
    omit?: EvidenceObjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceObjectInclude<ExtArgs> | null
    /**
     * Filter, which EvidenceObjects to fetch.
     */
    where?: EvidenceObjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of EvidenceObjects to fetch.
     */
    orderBy?: EvidenceObjectOrderByWithRelationInput | EvidenceObjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing EvidenceObjects.
     */
    cursor?: EvidenceObjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` EvidenceObjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` EvidenceObjects.
     */
    skip?: number
    distinct?: EvidenceObjectScalarFieldEnum | EvidenceObjectScalarFieldEnum[]
  }

  /**
   * EvidenceObject create
   */
  export type EvidenceObjectCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceObject
     */
    select?: EvidenceObjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceObject
     */
    omit?: EvidenceObjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceObjectInclude<ExtArgs> | null
    /**
     * The data needed to create a EvidenceObject.
     */
    data: XOR<EvidenceObjectCreateInput, EvidenceObjectUncheckedCreateInput>
  }

  /**
   * EvidenceObject createMany
   */
  export type EvidenceObjectCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EvidenceObjects.
     */
    data: EvidenceObjectCreateManyInput | EvidenceObjectCreateManyInput[]
  }

  /**
   * EvidenceObject createManyAndReturn
   */
  export type EvidenceObjectCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceObject
     */
    select?: EvidenceObjectSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceObject
     */
    omit?: EvidenceObjectOmit<ExtArgs> | null
    /**
     * The data used to create many EvidenceObjects.
     */
    data: EvidenceObjectCreateManyInput | EvidenceObjectCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceObjectIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EvidenceObject update
   */
  export type EvidenceObjectUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceObject
     */
    select?: EvidenceObjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceObject
     */
    omit?: EvidenceObjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceObjectInclude<ExtArgs> | null
    /**
     * The data needed to update a EvidenceObject.
     */
    data: XOR<EvidenceObjectUpdateInput, EvidenceObjectUncheckedUpdateInput>
    /**
     * Choose, which EvidenceObject to update.
     */
    where: EvidenceObjectWhereUniqueInput
  }

  /**
   * EvidenceObject updateMany
   */
  export type EvidenceObjectUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EvidenceObjects.
     */
    data: XOR<EvidenceObjectUpdateManyMutationInput, EvidenceObjectUncheckedUpdateManyInput>
    /**
     * Filter which EvidenceObjects to update
     */
    where?: EvidenceObjectWhereInput
    /**
     * Limit how many EvidenceObjects to update.
     */
    limit?: number
  }

  /**
   * EvidenceObject updateManyAndReturn
   */
  export type EvidenceObjectUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceObject
     */
    select?: EvidenceObjectSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceObject
     */
    omit?: EvidenceObjectOmit<ExtArgs> | null
    /**
     * The data used to update EvidenceObjects.
     */
    data: XOR<EvidenceObjectUpdateManyMutationInput, EvidenceObjectUncheckedUpdateManyInput>
    /**
     * Filter which EvidenceObjects to update
     */
    where?: EvidenceObjectWhereInput
    /**
     * Limit how many EvidenceObjects to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceObjectIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * EvidenceObject upsert
   */
  export type EvidenceObjectUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceObject
     */
    select?: EvidenceObjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceObject
     */
    omit?: EvidenceObjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceObjectInclude<ExtArgs> | null
    /**
     * The filter to search for the EvidenceObject to update in case it exists.
     */
    where: EvidenceObjectWhereUniqueInput
    /**
     * In case the EvidenceObject found by the `where` argument doesn't exist, create a new EvidenceObject with this data.
     */
    create: XOR<EvidenceObjectCreateInput, EvidenceObjectUncheckedCreateInput>
    /**
     * In case the EvidenceObject was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EvidenceObjectUpdateInput, EvidenceObjectUncheckedUpdateInput>
  }

  /**
   * EvidenceObject delete
   */
  export type EvidenceObjectDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceObject
     */
    select?: EvidenceObjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceObject
     */
    omit?: EvidenceObjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceObjectInclude<ExtArgs> | null
    /**
     * Filter which EvidenceObject to delete.
     */
    where: EvidenceObjectWhereUniqueInput
  }

  /**
   * EvidenceObject deleteMany
   */
  export type EvidenceObjectDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EvidenceObjects to delete
     */
    where?: EvidenceObjectWhereInput
    /**
     * Limit how many EvidenceObjects to delete.
     */
    limit?: number
  }

  /**
   * EvidenceObject without action
   */
  export type EvidenceObjectDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EvidenceObject
     */
    select?: EvidenceObjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EvidenceObject
     */
    omit?: EvidenceObjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EvidenceObjectInclude<ExtArgs> | null
  }


  /**
   * Model PolicyPack
   */

  export type AggregatePolicyPack = {
    _count: PolicyPackCountAggregateOutputType | null
    _min: PolicyPackMinAggregateOutputType | null
    _max: PolicyPackMaxAggregateOutputType | null
  }

  export type PolicyPackMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    name: string | null
    version: string | null
    description: string | null
    contentsJson: string | null
    packHash: string | null
    signature: string | null
    signingMode: string | null
    createdAt: Date | null
  }

  export type PolicyPackMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    name: string | null
    version: string | null
    description: string | null
    contentsJson: string | null
    packHash: string | null
    signature: string | null
    signingMode: string | null
    createdAt: Date | null
  }

  export type PolicyPackCountAggregateOutputType = {
    id: number
    organizationId: number
    name: number
    version: number
    description: number
    contentsJson: number
    packHash: number
    signature: number
    signingMode: number
    createdAt: number
    _all: number
  }


  export type PolicyPackMinAggregateInputType = {
    id?: true
    organizationId?: true
    name?: true
    version?: true
    description?: true
    contentsJson?: true
    packHash?: true
    signature?: true
    signingMode?: true
    createdAt?: true
  }

  export type PolicyPackMaxAggregateInputType = {
    id?: true
    organizationId?: true
    name?: true
    version?: true
    description?: true
    contentsJson?: true
    packHash?: true
    signature?: true
    signingMode?: true
    createdAt?: true
  }

  export type PolicyPackCountAggregateInputType = {
    id?: true
    organizationId?: true
    name?: true
    version?: true
    description?: true
    contentsJson?: true
    packHash?: true
    signature?: true
    signingMode?: true
    createdAt?: true
    _all?: true
  }

  export type PolicyPackAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PolicyPack to aggregate.
     */
    where?: PolicyPackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PolicyPacks to fetch.
     */
    orderBy?: PolicyPackOrderByWithRelationInput | PolicyPackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: PolicyPackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PolicyPacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PolicyPacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned PolicyPacks
    **/
    _count?: true | PolicyPackCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: PolicyPackMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: PolicyPackMaxAggregateInputType
  }

  export type GetPolicyPackAggregateType<T extends PolicyPackAggregateArgs> = {
        [P in keyof T & keyof AggregatePolicyPack]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePolicyPack[P]>
      : GetScalarType<T[P], AggregatePolicyPack[P]>
  }




  export type PolicyPackGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PolicyPackWhereInput
    orderBy?: PolicyPackOrderByWithAggregationInput | PolicyPackOrderByWithAggregationInput[]
    by: PolicyPackScalarFieldEnum[] | PolicyPackScalarFieldEnum
    having?: PolicyPackScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PolicyPackCountAggregateInputType | true
    _min?: PolicyPackMinAggregateInputType
    _max?: PolicyPackMaxAggregateInputType
  }

  export type PolicyPackGroupByOutputType = {
    id: string
    organizationId: string
    name: string
    version: string
    description: string | null
    contentsJson: string
    packHash: string
    signature: string | null
    signingMode: string
    createdAt: Date
    _count: PolicyPackCountAggregateOutputType | null
    _min: PolicyPackMinAggregateOutputType | null
    _max: PolicyPackMaxAggregateOutputType | null
  }

  type GetPolicyPackGroupByPayload<T extends PolicyPackGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PolicyPackGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PolicyPackGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PolicyPackGroupByOutputType[P]>
            : GetScalarType<T[P], PolicyPackGroupByOutputType[P]>
        }
      >
    >


  export type PolicyPackSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    name?: boolean
    version?: boolean
    description?: boolean
    contentsJson?: boolean
    packHash?: boolean
    signature?: boolean
    signingMode?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    assignments?: boolean | PolicyPack$assignmentsArgs<ExtArgs>
    _count?: boolean | PolicyPackCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["policyPack"]>

  export type PolicyPackSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    name?: boolean
    version?: boolean
    description?: boolean
    contentsJson?: boolean
    packHash?: boolean
    signature?: boolean
    signingMode?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["policyPack"]>

  export type PolicyPackSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    name?: boolean
    version?: boolean
    description?: boolean
    contentsJson?: boolean
    packHash?: boolean
    signature?: boolean
    signingMode?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["policyPack"]>

  export type PolicyPackSelectScalar = {
    id?: boolean
    organizationId?: boolean
    name?: boolean
    version?: boolean
    description?: boolean
    contentsJson?: boolean
    packHash?: boolean
    signature?: boolean
    signingMode?: boolean
    createdAt?: boolean
  }

  export type PolicyPackOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "name" | "version" | "description" | "contentsJson" | "packHash" | "signature" | "signingMode" | "createdAt", ExtArgs["result"]["policyPack"]>
  export type PolicyPackInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    assignments?: boolean | PolicyPack$assignmentsArgs<ExtArgs>
    _count?: boolean | PolicyPackCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PolicyPackIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type PolicyPackIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $PolicyPackPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PolicyPack"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      assignments: Prisma.$PolicyPackAssignmentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      name: string
      version: string
      description: string | null
      contentsJson: string
      packHash: string
      signature: string | null
      signingMode: string
      createdAt: Date
    }, ExtArgs["result"]["policyPack"]>
    composites: {}
  }

  type PolicyPackGetPayload<S extends boolean | null | undefined | PolicyPackDefaultArgs> = $Result.GetResult<Prisma.$PolicyPackPayload, S>

  type PolicyPackCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PolicyPackFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PolicyPackCountAggregateInputType | true
    }

  export interface PolicyPackDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PolicyPack'], meta: { name: 'PolicyPack' } }
    /**
     * Find zero or one PolicyPack that matches the filter.
     * @param {PolicyPackFindUniqueArgs} args - Arguments to find a PolicyPack
     * @example
     * // Get one PolicyPack
     * const policyPack = await prisma.policyPack.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PolicyPackFindUniqueArgs>(args: SelectSubset<T, PolicyPackFindUniqueArgs<ExtArgs>>): Prisma__PolicyPackClient<$Result.GetResult<Prisma.$PolicyPackPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PolicyPack that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PolicyPackFindUniqueOrThrowArgs} args - Arguments to find a PolicyPack
     * @example
     * // Get one PolicyPack
     * const policyPack = await prisma.policyPack.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PolicyPackFindUniqueOrThrowArgs>(args: SelectSubset<T, PolicyPackFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PolicyPackClient<$Result.GetResult<Prisma.$PolicyPackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PolicyPack that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackFindFirstArgs} args - Arguments to find a PolicyPack
     * @example
     * // Get one PolicyPack
     * const policyPack = await prisma.policyPack.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PolicyPackFindFirstArgs>(args?: SelectSubset<T, PolicyPackFindFirstArgs<ExtArgs>>): Prisma__PolicyPackClient<$Result.GetResult<Prisma.$PolicyPackPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PolicyPack that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackFindFirstOrThrowArgs} args - Arguments to find a PolicyPack
     * @example
     * // Get one PolicyPack
     * const policyPack = await prisma.policyPack.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PolicyPackFindFirstOrThrowArgs>(args?: SelectSubset<T, PolicyPackFindFirstOrThrowArgs<ExtArgs>>): Prisma__PolicyPackClient<$Result.GetResult<Prisma.$PolicyPackPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PolicyPacks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PolicyPacks
     * const policyPacks = await prisma.policyPack.findMany()
     *
     * // Get first 10 PolicyPacks
     * const policyPacks = await prisma.policyPack.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const policyPackWithIdOnly = await prisma.policyPack.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PolicyPackFindManyArgs>(args?: SelectSubset<T, PolicyPackFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PolicyPackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PolicyPack.
     * @param {PolicyPackCreateArgs} args - Arguments to create a PolicyPack.
     * @example
     * // Create one PolicyPack
     * const PolicyPack = await prisma.policyPack.create({
     *   data: {
     *     // ... data to create a PolicyPack
     *   }
     * })
     *
     */
    create<T extends PolicyPackCreateArgs>(args: SelectSubset<T, PolicyPackCreateArgs<ExtArgs>>): Prisma__PolicyPackClient<$Result.GetResult<Prisma.$PolicyPackPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PolicyPacks.
     * @param {PolicyPackCreateManyArgs} args - Arguments to create many PolicyPacks.
     * @example
     * // Create many PolicyPacks
     * const policyPack = await prisma.policyPack.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PolicyPackCreateManyArgs>(args?: SelectSubset<T, PolicyPackCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PolicyPacks and returns the data saved in the database.
     * @param {PolicyPackCreateManyAndReturnArgs} args - Arguments to create many PolicyPacks.
     * @example
     * // Create many PolicyPacks
     * const policyPack = await prisma.policyPack.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many PolicyPacks and only return the `id`
     * const policyPackWithIdOnly = await prisma.policyPack.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PolicyPackCreateManyAndReturnArgs>(args?: SelectSubset<T, PolicyPackCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PolicyPackPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PolicyPack.
     * @param {PolicyPackDeleteArgs} args - Arguments to delete one PolicyPack.
     * @example
     * // Delete one PolicyPack
     * const PolicyPack = await prisma.policyPack.delete({
     *   where: {
     *     // ... filter to delete one PolicyPack
     *   }
     * })
     *
     */
    delete<T extends PolicyPackDeleteArgs>(args: SelectSubset<T, PolicyPackDeleteArgs<ExtArgs>>): Prisma__PolicyPackClient<$Result.GetResult<Prisma.$PolicyPackPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PolicyPack.
     * @param {PolicyPackUpdateArgs} args - Arguments to update one PolicyPack.
     * @example
     * // Update one PolicyPack
     * const policyPack = await prisma.policyPack.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PolicyPackUpdateArgs>(args: SelectSubset<T, PolicyPackUpdateArgs<ExtArgs>>): Prisma__PolicyPackClient<$Result.GetResult<Prisma.$PolicyPackPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PolicyPacks.
     * @param {PolicyPackDeleteManyArgs} args - Arguments to filter PolicyPacks to delete.
     * @example
     * // Delete a few PolicyPacks
     * const { count } = await prisma.policyPack.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PolicyPackDeleteManyArgs>(args?: SelectSubset<T, PolicyPackDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PolicyPacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PolicyPacks
     * const policyPack = await prisma.policyPack.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PolicyPackUpdateManyArgs>(args: SelectSubset<T, PolicyPackUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PolicyPacks and returns the data updated in the database.
     * @param {PolicyPackUpdateManyAndReturnArgs} args - Arguments to update many PolicyPacks.
     * @example
     * // Update many PolicyPacks
     * const policyPack = await prisma.policyPack.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more PolicyPacks and only return the `id`
     * const policyPackWithIdOnly = await prisma.policyPack.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends PolicyPackUpdateManyAndReturnArgs>(args: SelectSubset<T, PolicyPackUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PolicyPackPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PolicyPack.
     * @param {PolicyPackUpsertArgs} args - Arguments to update or create a PolicyPack.
     * @example
     * // Update or create a PolicyPack
     * const policyPack = await prisma.policyPack.upsert({
     *   create: {
     *     // ... data to create a PolicyPack
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PolicyPack we want to update
     *   }
     * })
     */
    upsert<T extends PolicyPackUpsertArgs>(args: SelectSubset<T, PolicyPackUpsertArgs<ExtArgs>>): Prisma__PolicyPackClient<$Result.GetResult<Prisma.$PolicyPackPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PolicyPacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackCountArgs} args - Arguments to filter PolicyPacks to count.
     * @example
     * // Count the number of PolicyPacks
     * const count = await prisma.policyPack.count({
     *   where: {
     *     // ... the filter for the PolicyPacks we want to count
     *   }
     * })
    **/
    count<T extends PolicyPackCountArgs>(
      args?: Subset<T, PolicyPackCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PolicyPackCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PolicyPack.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PolicyPackAggregateArgs>(args: Subset<T, PolicyPackAggregateArgs>): Prisma.PrismaPromise<GetPolicyPackAggregateType<T>>

    /**
     * Group by PolicyPack.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<
      T extends PolicyPackGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PolicyPackGroupByArgs['orderBy'] }
        : { orderBy?: PolicyPackGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PolicyPackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPolicyPackGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PolicyPack model
   */
  readonly fields: PolicyPackFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PolicyPack.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PolicyPackClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    assignments<T extends PolicyPack$assignmentsArgs<ExtArgs> = {}>(args?: Subset<T, PolicyPack$assignmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PolicyPack model
   */
  interface PolicyPackFieldRefs {
    readonly id: FieldRef<"PolicyPack", 'String'>
    readonly organizationId: FieldRef<"PolicyPack", 'String'>
    readonly name: FieldRef<"PolicyPack", 'String'>
    readonly version: FieldRef<"PolicyPack", 'String'>
    readonly description: FieldRef<"PolicyPack", 'String'>
    readonly contentsJson: FieldRef<"PolicyPack", 'String'>
    readonly packHash: FieldRef<"PolicyPack", 'String'>
    readonly signature: FieldRef<"PolicyPack", 'String'>
    readonly signingMode: FieldRef<"PolicyPack", 'String'>
    readonly createdAt: FieldRef<"PolicyPack", 'DateTime'>
  }


  // Custom InputTypes
  /**
   * PolicyPack findUnique
   */
  export type PolicyPackFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPack
     */
    select?: PolicyPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPack
     */
    omit?: PolicyPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackInclude<ExtArgs> | null
    /**
     * Filter, which PolicyPack to fetch.
     */
    where: PolicyPackWhereUniqueInput
  }

  /**
   * PolicyPack findUniqueOrThrow
   */
  export type PolicyPackFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPack
     */
    select?: PolicyPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPack
     */
    omit?: PolicyPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackInclude<ExtArgs> | null
    /**
     * Filter, which PolicyPack to fetch.
     */
    where: PolicyPackWhereUniqueInput
  }

  /**
   * PolicyPack findFirst
   */
  export type PolicyPackFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPack
     */
    select?: PolicyPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPack
     */
    omit?: PolicyPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackInclude<ExtArgs> | null
    /**
     * Filter, which PolicyPack to fetch.
     */
    where?: PolicyPackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PolicyPacks to fetch.
     */
    orderBy?: PolicyPackOrderByWithRelationInput | PolicyPackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PolicyPacks.
     */
    cursor?: PolicyPackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PolicyPacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PolicyPacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PolicyPacks.
     */
    distinct?: PolicyPackScalarFieldEnum | PolicyPackScalarFieldEnum[]
  }

  /**
   * PolicyPack findFirstOrThrow
   */
  export type PolicyPackFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPack
     */
    select?: PolicyPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPack
     */
    omit?: PolicyPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackInclude<ExtArgs> | null
    /**
     * Filter, which PolicyPack to fetch.
     */
    where?: PolicyPackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PolicyPacks to fetch.
     */
    orderBy?: PolicyPackOrderByWithRelationInput | PolicyPackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PolicyPacks.
     */
    cursor?: PolicyPackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PolicyPacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PolicyPacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PolicyPacks.
     */
    distinct?: PolicyPackScalarFieldEnum | PolicyPackScalarFieldEnum[]
  }

  /**
   * PolicyPack findMany
   */
  export type PolicyPackFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPack
     */
    select?: PolicyPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPack
     */
    omit?: PolicyPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackInclude<ExtArgs> | null
    /**
     * Filter, which PolicyPacks to fetch.
     */
    where?: PolicyPackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PolicyPacks to fetch.
     */
    orderBy?: PolicyPackOrderByWithRelationInput | PolicyPackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing PolicyPacks.
     */
    cursor?: PolicyPackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PolicyPacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PolicyPacks.
     */
    skip?: number
    distinct?: PolicyPackScalarFieldEnum | PolicyPackScalarFieldEnum[]
  }

  /**
   * PolicyPack create
   */
  export type PolicyPackCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPack
     */
    select?: PolicyPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPack
     */
    omit?: PolicyPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackInclude<ExtArgs> | null
    /**
     * The data needed to create a PolicyPack.
     */
    data: XOR<PolicyPackCreateInput, PolicyPackUncheckedCreateInput>
  }

  /**
   * PolicyPack createMany
   */
  export type PolicyPackCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PolicyPacks.
     */
    data: PolicyPackCreateManyInput | PolicyPackCreateManyInput[]
  }

  /**
   * PolicyPack createManyAndReturn
   */
  export type PolicyPackCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPack
     */
    select?: PolicyPackSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPack
     */
    omit?: PolicyPackOmit<ExtArgs> | null
    /**
     * The data used to create many PolicyPacks.
     */
    data: PolicyPackCreateManyInput | PolicyPackCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PolicyPack update
   */
  export type PolicyPackUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPack
     */
    select?: PolicyPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPack
     */
    omit?: PolicyPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackInclude<ExtArgs> | null
    /**
     * The data needed to update a PolicyPack.
     */
    data: XOR<PolicyPackUpdateInput, PolicyPackUncheckedUpdateInput>
    /**
     * Choose, which PolicyPack to update.
     */
    where: PolicyPackWhereUniqueInput
  }

  /**
   * PolicyPack updateMany
   */
  export type PolicyPackUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PolicyPacks.
     */
    data: XOR<PolicyPackUpdateManyMutationInput, PolicyPackUncheckedUpdateManyInput>
    /**
     * Filter which PolicyPacks to update
     */
    where?: PolicyPackWhereInput
    /**
     * Limit how many PolicyPacks to update.
     */
    limit?: number
  }

  /**
   * PolicyPack updateManyAndReturn
   */
  export type PolicyPackUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPack
     */
    select?: PolicyPackSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPack
     */
    omit?: PolicyPackOmit<ExtArgs> | null
    /**
     * The data used to update PolicyPacks.
     */
    data: XOR<PolicyPackUpdateManyMutationInput, PolicyPackUncheckedUpdateManyInput>
    /**
     * Filter which PolicyPacks to update
     */
    where?: PolicyPackWhereInput
    /**
     * Limit how many PolicyPacks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PolicyPack upsert
   */
  export type PolicyPackUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPack
     */
    select?: PolicyPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPack
     */
    omit?: PolicyPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackInclude<ExtArgs> | null
    /**
     * The filter to search for the PolicyPack to update in case it exists.
     */
    where: PolicyPackWhereUniqueInput
    /**
     * In case the PolicyPack found by the `where` argument doesn't exist, create a new PolicyPack with this data.
     */
    create: XOR<PolicyPackCreateInput, PolicyPackUncheckedCreateInput>
    /**
     * In case the PolicyPack was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PolicyPackUpdateInput, PolicyPackUncheckedUpdateInput>
  }

  /**
   * PolicyPack delete
   */
  export type PolicyPackDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPack
     */
    select?: PolicyPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPack
     */
    omit?: PolicyPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackInclude<ExtArgs> | null
    /**
     * Filter which PolicyPack to delete.
     */
    where: PolicyPackWhereUniqueInput
  }

  /**
   * PolicyPack deleteMany
   */
  export type PolicyPackDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PolicyPacks to delete
     */
    where?: PolicyPackWhereInput
    /**
     * Limit how many PolicyPacks to delete.
     */
    limit?: number
  }

  /**
   * PolicyPack.assignments
   */
  export type PolicyPack$assignmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentInclude<ExtArgs> | null
    where?: PolicyPackAssignmentWhereInput
    orderBy?: PolicyPackAssignmentOrderByWithRelationInput | PolicyPackAssignmentOrderByWithRelationInput[]
    cursor?: PolicyPackAssignmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PolicyPackAssignmentScalarFieldEnum | PolicyPackAssignmentScalarFieldEnum[]
  }

  /**
   * PolicyPack without action
   */
  export type PolicyPackDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPack
     */
    select?: PolicyPackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPack
     */
    omit?: PolicyPackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackInclude<ExtArgs> | null
  }


  /**
   * Model PolicyPackAssignment
   */

  export type AggregatePolicyPackAssignment = {
    _count: PolicyPackAssignmentCountAggregateOutputType | null
    _min: PolicyPackAssignmentMinAggregateOutputType | null
    _max: PolicyPackAssignmentMaxAggregateOutputType | null
  }

  export type PolicyPackAssignmentMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    repositoryId: string | null
    scope: string | null
    policyPackId: string | null
    enabled: boolean | null
    createdAt: Date | null
  }

  export type PolicyPackAssignmentMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    repositoryId: string | null
    scope: string | null
    policyPackId: string | null
    enabled: boolean | null
    createdAt: Date | null
  }

  export type PolicyPackAssignmentCountAggregateOutputType = {
    id: number
    organizationId: number
    repositoryId: number
    scope: number
    policyPackId: number
    enabled: number
    createdAt: number
    _all: number
  }


  export type PolicyPackAssignmentMinAggregateInputType = {
    id?: true
    organizationId?: true
    repositoryId?: true
    scope?: true
    policyPackId?: true
    enabled?: true
    createdAt?: true
  }

  export type PolicyPackAssignmentMaxAggregateInputType = {
    id?: true
    organizationId?: true
    repositoryId?: true
    scope?: true
    policyPackId?: true
    enabled?: true
    createdAt?: true
  }

  export type PolicyPackAssignmentCountAggregateInputType = {
    id?: true
    organizationId?: true
    repositoryId?: true
    scope?: true
    policyPackId?: true
    enabled?: true
    createdAt?: true
    _all?: true
  }

  export type PolicyPackAssignmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PolicyPackAssignment to aggregate.
     */
    where?: PolicyPackAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PolicyPackAssignments to fetch.
     */
    orderBy?: PolicyPackAssignmentOrderByWithRelationInput | PolicyPackAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: PolicyPackAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PolicyPackAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PolicyPackAssignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned PolicyPackAssignments
    **/
    _count?: true | PolicyPackAssignmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: PolicyPackAssignmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: PolicyPackAssignmentMaxAggregateInputType
  }

  export type GetPolicyPackAssignmentAggregateType<T extends PolicyPackAssignmentAggregateArgs> = {
        [P in keyof T & keyof AggregatePolicyPackAssignment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePolicyPackAssignment[P]>
      : GetScalarType<T[P], AggregatePolicyPackAssignment[P]>
  }




  export type PolicyPackAssignmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PolicyPackAssignmentWhereInput
    orderBy?: PolicyPackAssignmentOrderByWithAggregationInput | PolicyPackAssignmentOrderByWithAggregationInput[]
    by: PolicyPackAssignmentScalarFieldEnum[] | PolicyPackAssignmentScalarFieldEnum
    having?: PolicyPackAssignmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PolicyPackAssignmentCountAggregateInputType | true
    _min?: PolicyPackAssignmentMinAggregateInputType
    _max?: PolicyPackAssignmentMaxAggregateInputType
  }

  export type PolicyPackAssignmentGroupByOutputType = {
    id: string
    organizationId: string
    repositoryId: string | null
    scope: string
    policyPackId: string
    enabled: boolean
    createdAt: Date
    _count: PolicyPackAssignmentCountAggregateOutputType | null
    _min: PolicyPackAssignmentMinAggregateOutputType | null
    _max: PolicyPackAssignmentMaxAggregateOutputType | null
  }

  type GetPolicyPackAssignmentGroupByPayload<T extends PolicyPackAssignmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PolicyPackAssignmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PolicyPackAssignmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PolicyPackAssignmentGroupByOutputType[P]>
            : GetScalarType<T[P], PolicyPackAssignmentGroupByOutputType[P]>
        }
      >
    >


  export type PolicyPackAssignmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    repositoryId?: boolean
    scope?: boolean
    policyPackId?: boolean
    enabled?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | PolicyPackAssignment$repositoryArgs<ExtArgs>
    policyPack?: boolean | PolicyPackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["policyPackAssignment"]>

  export type PolicyPackAssignmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    repositoryId?: boolean
    scope?: boolean
    policyPackId?: boolean
    enabled?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | PolicyPackAssignment$repositoryArgs<ExtArgs>
    policyPack?: boolean | PolicyPackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["policyPackAssignment"]>

  export type PolicyPackAssignmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    repositoryId?: boolean
    scope?: boolean
    policyPackId?: boolean
    enabled?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | PolicyPackAssignment$repositoryArgs<ExtArgs>
    policyPack?: boolean | PolicyPackDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["policyPackAssignment"]>

  export type PolicyPackAssignmentSelectScalar = {
    id?: boolean
    organizationId?: boolean
    repositoryId?: boolean
    scope?: boolean
    policyPackId?: boolean
    enabled?: boolean
    createdAt?: boolean
  }

  export type PolicyPackAssignmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "repositoryId" | "scope" | "policyPackId" | "enabled" | "createdAt", ExtArgs["result"]["policyPackAssignment"]>
  export type PolicyPackAssignmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | PolicyPackAssignment$repositoryArgs<ExtArgs>
    policyPack?: boolean | PolicyPackDefaultArgs<ExtArgs>
  }
  export type PolicyPackAssignmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | PolicyPackAssignment$repositoryArgs<ExtArgs>
    policyPack?: boolean | PolicyPackDefaultArgs<ExtArgs>
  }
  export type PolicyPackAssignmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    repository?: boolean | PolicyPackAssignment$repositoryArgs<ExtArgs>
    policyPack?: boolean | PolicyPackDefaultArgs<ExtArgs>
  }

  export type $PolicyPackAssignmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PolicyPackAssignment"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      repository: Prisma.$RepositoryPayload<ExtArgs> | null
      policyPack: Prisma.$PolicyPackPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      repositoryId: string | null
      scope: string
      policyPackId: string
      enabled: boolean
      createdAt: Date
    }, ExtArgs["result"]["policyPackAssignment"]>
    composites: {}
  }

  type PolicyPackAssignmentGetPayload<S extends boolean | null | undefined | PolicyPackAssignmentDefaultArgs> = $Result.GetResult<Prisma.$PolicyPackAssignmentPayload, S>

  type PolicyPackAssignmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PolicyPackAssignmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PolicyPackAssignmentCountAggregateInputType | true
    }

  export interface PolicyPackAssignmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PolicyPackAssignment'], meta: { name: 'PolicyPackAssignment' } }
    /**
     * Find zero or one PolicyPackAssignment that matches the filter.
     * @param {PolicyPackAssignmentFindUniqueArgs} args - Arguments to find a PolicyPackAssignment
     * @example
     * // Get one PolicyPackAssignment
     * const policyPackAssignment = await prisma.policyPackAssignment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PolicyPackAssignmentFindUniqueArgs>(args: SelectSubset<T, PolicyPackAssignmentFindUniqueArgs<ExtArgs>>): Prisma__PolicyPackAssignmentClient<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PolicyPackAssignment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PolicyPackAssignmentFindUniqueOrThrowArgs} args - Arguments to find a PolicyPackAssignment
     * @example
     * // Get one PolicyPackAssignment
     * const policyPackAssignment = await prisma.policyPackAssignment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PolicyPackAssignmentFindUniqueOrThrowArgs>(args: SelectSubset<T, PolicyPackAssignmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PolicyPackAssignmentClient<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PolicyPackAssignment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackAssignmentFindFirstArgs} args - Arguments to find a PolicyPackAssignment
     * @example
     * // Get one PolicyPackAssignment
     * const policyPackAssignment = await prisma.policyPackAssignment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PolicyPackAssignmentFindFirstArgs>(args?: SelectSubset<T, PolicyPackAssignmentFindFirstArgs<ExtArgs>>): Prisma__PolicyPackAssignmentClient<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PolicyPackAssignment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackAssignmentFindFirstOrThrowArgs} args - Arguments to find a PolicyPackAssignment
     * @example
     * // Get one PolicyPackAssignment
     * const policyPackAssignment = await prisma.policyPackAssignment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PolicyPackAssignmentFindFirstOrThrowArgs>(args?: SelectSubset<T, PolicyPackAssignmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__PolicyPackAssignmentClient<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PolicyPackAssignments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackAssignmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PolicyPackAssignments
     * const policyPackAssignments = await prisma.policyPackAssignment.findMany()
     *
     * // Get first 10 PolicyPackAssignments
     * const policyPackAssignments = await prisma.policyPackAssignment.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const policyPackAssignmentWithIdOnly = await prisma.policyPackAssignment.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PolicyPackAssignmentFindManyArgs>(args?: SelectSubset<T, PolicyPackAssignmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PolicyPackAssignment.
     * @param {PolicyPackAssignmentCreateArgs} args - Arguments to create a PolicyPackAssignment.
     * @example
     * // Create one PolicyPackAssignment
     * const PolicyPackAssignment = await prisma.policyPackAssignment.create({
     *   data: {
     *     // ... data to create a PolicyPackAssignment
     *   }
     * })
     *
     */
    create<T extends PolicyPackAssignmentCreateArgs>(args: SelectSubset<T, PolicyPackAssignmentCreateArgs<ExtArgs>>): Prisma__PolicyPackAssignmentClient<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PolicyPackAssignments.
     * @param {PolicyPackAssignmentCreateManyArgs} args - Arguments to create many PolicyPackAssignments.
     * @example
     * // Create many PolicyPackAssignments
     * const policyPackAssignment = await prisma.policyPackAssignment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PolicyPackAssignmentCreateManyArgs>(args?: SelectSubset<T, PolicyPackAssignmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PolicyPackAssignments and returns the data saved in the database.
     * @param {PolicyPackAssignmentCreateManyAndReturnArgs} args - Arguments to create many PolicyPackAssignments.
     * @example
     * // Create many PolicyPackAssignments
     * const policyPackAssignment = await prisma.policyPackAssignment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many PolicyPackAssignments and only return the `id`
     * const policyPackAssignmentWithIdOnly = await prisma.policyPackAssignment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PolicyPackAssignmentCreateManyAndReturnArgs>(args?: SelectSubset<T, PolicyPackAssignmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PolicyPackAssignment.
     * @param {PolicyPackAssignmentDeleteArgs} args - Arguments to delete one PolicyPackAssignment.
     * @example
     * // Delete one PolicyPackAssignment
     * const PolicyPackAssignment = await prisma.policyPackAssignment.delete({
     *   where: {
     *     // ... filter to delete one PolicyPackAssignment
     *   }
     * })
     *
     */
    delete<T extends PolicyPackAssignmentDeleteArgs>(args: SelectSubset<T, PolicyPackAssignmentDeleteArgs<ExtArgs>>): Prisma__PolicyPackAssignmentClient<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PolicyPackAssignment.
     * @param {PolicyPackAssignmentUpdateArgs} args - Arguments to update one PolicyPackAssignment.
     * @example
     * // Update one PolicyPackAssignment
     * const policyPackAssignment = await prisma.policyPackAssignment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PolicyPackAssignmentUpdateArgs>(args: SelectSubset<T, PolicyPackAssignmentUpdateArgs<ExtArgs>>): Prisma__PolicyPackAssignmentClient<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PolicyPackAssignments.
     * @param {PolicyPackAssignmentDeleteManyArgs} args - Arguments to filter PolicyPackAssignments to delete.
     * @example
     * // Delete a few PolicyPackAssignments
     * const { count } = await prisma.policyPackAssignment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PolicyPackAssignmentDeleteManyArgs>(args?: SelectSubset<T, PolicyPackAssignmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PolicyPackAssignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackAssignmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PolicyPackAssignments
     * const policyPackAssignment = await prisma.policyPackAssignment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PolicyPackAssignmentUpdateManyArgs>(args: SelectSubset<T, PolicyPackAssignmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PolicyPackAssignments and returns the data updated in the database.
     * @param {PolicyPackAssignmentUpdateManyAndReturnArgs} args - Arguments to update many PolicyPackAssignments.
     * @example
     * // Update many PolicyPackAssignments
     * const policyPackAssignment = await prisma.policyPackAssignment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more PolicyPackAssignments and only return the `id`
     * const policyPackAssignmentWithIdOnly = await prisma.policyPackAssignment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends PolicyPackAssignmentUpdateManyAndReturnArgs>(args: SelectSubset<T, PolicyPackAssignmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PolicyPackAssignment.
     * @param {PolicyPackAssignmentUpsertArgs} args - Arguments to update or create a PolicyPackAssignment.
     * @example
     * // Update or create a PolicyPackAssignment
     * const policyPackAssignment = await prisma.policyPackAssignment.upsert({
     *   create: {
     *     // ... data to create a PolicyPackAssignment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PolicyPackAssignment we want to update
     *   }
     * })
     */
    upsert<T extends PolicyPackAssignmentUpsertArgs>(args: SelectSubset<T, PolicyPackAssignmentUpsertArgs<ExtArgs>>): Prisma__PolicyPackAssignmentClient<$Result.GetResult<Prisma.$PolicyPackAssignmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PolicyPackAssignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackAssignmentCountArgs} args - Arguments to filter PolicyPackAssignments to count.
     * @example
     * // Count the number of PolicyPackAssignments
     * const count = await prisma.policyPackAssignment.count({
     *   where: {
     *     // ... the filter for the PolicyPackAssignments we want to count
     *   }
     * })
    **/
    count<T extends PolicyPackAssignmentCountArgs>(
      args?: Subset<T, PolicyPackAssignmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PolicyPackAssignmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PolicyPackAssignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackAssignmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PolicyPackAssignmentAggregateArgs>(args: Subset<T, PolicyPackAssignmentAggregateArgs>): Prisma.PrismaPromise<GetPolicyPackAssignmentAggregateType<T>>

    /**
     * Group by PolicyPackAssignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PolicyPackAssignmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<
      T extends PolicyPackAssignmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PolicyPackAssignmentGroupByArgs['orderBy'] }
        : { orderBy?: PolicyPackAssignmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PolicyPackAssignmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPolicyPackAssignmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PolicyPackAssignment model
   */
  readonly fields: PolicyPackAssignmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PolicyPackAssignment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PolicyPackAssignmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    repository<T extends PolicyPackAssignment$repositoryArgs<ExtArgs> = {}>(args?: Subset<T, PolicyPackAssignment$repositoryArgs<ExtArgs>>): Prisma__RepositoryClient<$Result.GetResult<Prisma.$RepositoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    policyPack<T extends PolicyPackDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PolicyPackDefaultArgs<ExtArgs>>): Prisma__PolicyPackClient<$Result.GetResult<Prisma.$PolicyPackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PolicyPackAssignment model
   */
  interface PolicyPackAssignmentFieldRefs {
    readonly id: FieldRef<"PolicyPackAssignment", 'String'>
    readonly organizationId: FieldRef<"PolicyPackAssignment", 'String'>
    readonly repositoryId: FieldRef<"PolicyPackAssignment", 'String'>
    readonly scope: FieldRef<"PolicyPackAssignment", 'String'>
    readonly policyPackId: FieldRef<"PolicyPackAssignment", 'String'>
    readonly enabled: FieldRef<"PolicyPackAssignment", 'Boolean'>
    readonly createdAt: FieldRef<"PolicyPackAssignment", 'DateTime'>
  }


  // Custom InputTypes
  /**
   * PolicyPackAssignment findUnique
   */
  export type PolicyPackAssignmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which PolicyPackAssignment to fetch.
     */
    where: PolicyPackAssignmentWhereUniqueInput
  }

  /**
   * PolicyPackAssignment findUniqueOrThrow
   */
  export type PolicyPackAssignmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which PolicyPackAssignment to fetch.
     */
    where: PolicyPackAssignmentWhereUniqueInput
  }

  /**
   * PolicyPackAssignment findFirst
   */
  export type PolicyPackAssignmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which PolicyPackAssignment to fetch.
     */
    where?: PolicyPackAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PolicyPackAssignments to fetch.
     */
    orderBy?: PolicyPackAssignmentOrderByWithRelationInput | PolicyPackAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PolicyPackAssignments.
     */
    cursor?: PolicyPackAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PolicyPackAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PolicyPackAssignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PolicyPackAssignments.
     */
    distinct?: PolicyPackAssignmentScalarFieldEnum | PolicyPackAssignmentScalarFieldEnum[]
  }

  /**
   * PolicyPackAssignment findFirstOrThrow
   */
  export type PolicyPackAssignmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which PolicyPackAssignment to fetch.
     */
    where?: PolicyPackAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PolicyPackAssignments to fetch.
     */
    orderBy?: PolicyPackAssignmentOrderByWithRelationInput | PolicyPackAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PolicyPackAssignments.
     */
    cursor?: PolicyPackAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PolicyPackAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PolicyPackAssignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PolicyPackAssignments.
     */
    distinct?: PolicyPackAssignmentScalarFieldEnum | PolicyPackAssignmentScalarFieldEnum[]
  }

  /**
   * PolicyPackAssignment findMany
   */
  export type PolicyPackAssignmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which PolicyPackAssignments to fetch.
     */
    where?: PolicyPackAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PolicyPackAssignments to fetch.
     */
    orderBy?: PolicyPackAssignmentOrderByWithRelationInput | PolicyPackAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing PolicyPackAssignments.
     */
    cursor?: PolicyPackAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PolicyPackAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PolicyPackAssignments.
     */
    skip?: number
    distinct?: PolicyPackAssignmentScalarFieldEnum | PolicyPackAssignmentScalarFieldEnum[]
  }

  /**
   * PolicyPackAssignment create
   */
  export type PolicyPackAssignmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentInclude<ExtArgs> | null
    /**
     * The data needed to create a PolicyPackAssignment.
     */
    data: XOR<PolicyPackAssignmentCreateInput, PolicyPackAssignmentUncheckedCreateInput>
  }

  /**
   * PolicyPackAssignment createMany
   */
  export type PolicyPackAssignmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PolicyPackAssignments.
     */
    data: PolicyPackAssignmentCreateManyInput | PolicyPackAssignmentCreateManyInput[]
  }

  /**
   * PolicyPackAssignment createManyAndReturn
   */
  export type PolicyPackAssignmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * The data used to create many PolicyPackAssignments.
     */
    data: PolicyPackAssignmentCreateManyInput | PolicyPackAssignmentCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PolicyPackAssignment update
   */
  export type PolicyPackAssignmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentInclude<ExtArgs> | null
    /**
     * The data needed to update a PolicyPackAssignment.
     */
    data: XOR<PolicyPackAssignmentUpdateInput, PolicyPackAssignmentUncheckedUpdateInput>
    /**
     * Choose, which PolicyPackAssignment to update.
     */
    where: PolicyPackAssignmentWhereUniqueInput
  }

  /**
   * PolicyPackAssignment updateMany
   */
  export type PolicyPackAssignmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PolicyPackAssignments.
     */
    data: XOR<PolicyPackAssignmentUpdateManyMutationInput, PolicyPackAssignmentUncheckedUpdateManyInput>
    /**
     * Filter which PolicyPackAssignments to update
     */
    where?: PolicyPackAssignmentWhereInput
    /**
     * Limit how many PolicyPackAssignments to update.
     */
    limit?: number
  }

  /**
   * PolicyPackAssignment updateManyAndReturn
   */
  export type PolicyPackAssignmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * The data used to update PolicyPackAssignments.
     */
    data: XOR<PolicyPackAssignmentUpdateManyMutationInput, PolicyPackAssignmentUncheckedUpdateManyInput>
    /**
     * Filter which PolicyPackAssignments to update
     */
    where?: PolicyPackAssignmentWhereInput
    /**
     * Limit how many PolicyPackAssignments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PolicyPackAssignment upsert
   */
  export type PolicyPackAssignmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentInclude<ExtArgs> | null
    /**
     * The filter to search for the PolicyPackAssignment to update in case it exists.
     */
    where: PolicyPackAssignmentWhereUniqueInput
    /**
     * In case the PolicyPackAssignment found by the `where` argument doesn't exist, create a new PolicyPackAssignment with this data.
     */
    create: XOR<PolicyPackAssignmentCreateInput, PolicyPackAssignmentUncheckedCreateInput>
    /**
     * In case the PolicyPackAssignment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PolicyPackAssignmentUpdateInput, PolicyPackAssignmentUncheckedUpdateInput>
  }

  /**
   * PolicyPackAssignment delete
   */
  export type PolicyPackAssignmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentInclude<ExtArgs> | null
    /**
     * Filter which PolicyPackAssignment to delete.
     */
    where: PolicyPackAssignmentWhereUniqueInput
  }

  /**
   * PolicyPackAssignment deleteMany
   */
  export type PolicyPackAssignmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PolicyPackAssignments to delete
     */
    where?: PolicyPackAssignmentWhereInput
    /**
     * Limit how many PolicyPackAssignments to delete.
     */
    limit?: number
  }

  /**
   * PolicyPackAssignment.repository
   */
  export type PolicyPackAssignment$repositoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Repository
     */
    select?: RepositorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Repository
     */
    omit?: RepositoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RepositoryInclude<ExtArgs> | null
    where?: RepositoryWhereInput
  }

  /**
   * PolicyPackAssignment without action
   */
  export type PolicyPackAssignmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PolicyPackAssignment
     */
    select?: PolicyPackAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PolicyPackAssignment
     */
    omit?: PolicyPackAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PolicyPackAssignmentInclude<ExtArgs> | null
  }


  /**
   * Model WebhookReceipt
   */

  export type AggregateWebhookReceipt = {
    _count: WebhookReceiptCountAggregateOutputType | null
    _min: WebhookReceiptMinAggregateOutputType | null
    _max: WebhookReceiptMaxAggregateOutputType | null
  }

  export type WebhookReceiptMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    provider: string | null
    deliveryId: string | null
    receivedAt: Date | null
    bodyHash: string | null
    signatureValid: boolean | null
    replayBlocked: boolean | null
    processed: boolean | null
    correlationId: string | null
  }

  export type WebhookReceiptMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    provider: string | null
    deliveryId: string | null
    receivedAt: Date | null
    bodyHash: string | null
    signatureValid: boolean | null
    replayBlocked: boolean | null
    processed: boolean | null
    correlationId: string | null
  }

  export type WebhookReceiptCountAggregateOutputType = {
    id: number
    organizationId: number
    provider: number
    deliveryId: number
    receivedAt: number
    bodyHash: number
    signatureValid: number
    replayBlocked: number
    processed: number
    correlationId: number
    _all: number
  }


  export type WebhookReceiptMinAggregateInputType = {
    id?: true
    organizationId?: true
    provider?: true
    deliveryId?: true
    receivedAt?: true
    bodyHash?: true
    signatureValid?: true
    replayBlocked?: true
    processed?: true
    correlationId?: true
  }

  export type WebhookReceiptMaxAggregateInputType = {
    id?: true
    organizationId?: true
    provider?: true
    deliveryId?: true
    receivedAt?: true
    bodyHash?: true
    signatureValid?: true
    replayBlocked?: true
    processed?: true
    correlationId?: true
  }

  export type WebhookReceiptCountAggregateInputType = {
    id?: true
    organizationId?: true
    provider?: true
    deliveryId?: true
    receivedAt?: true
    bodyHash?: true
    signatureValid?: true
    replayBlocked?: true
    processed?: true
    correlationId?: true
    _all?: true
  }

  export type WebhookReceiptAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WebhookReceipt to aggregate.
     */
    where?: WebhookReceiptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WebhookReceipts to fetch.
     */
    orderBy?: WebhookReceiptOrderByWithRelationInput | WebhookReceiptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: WebhookReceiptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WebhookReceipts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WebhookReceipts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned WebhookReceipts
    **/
    _count?: true | WebhookReceiptCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: WebhookReceiptMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: WebhookReceiptMaxAggregateInputType
  }

  export type GetWebhookReceiptAggregateType<T extends WebhookReceiptAggregateArgs> = {
        [P in keyof T & keyof AggregateWebhookReceipt]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWebhookReceipt[P]>
      : GetScalarType<T[P], AggregateWebhookReceipt[P]>
  }




  export type WebhookReceiptGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WebhookReceiptWhereInput
    orderBy?: WebhookReceiptOrderByWithAggregationInput | WebhookReceiptOrderByWithAggregationInput[]
    by: WebhookReceiptScalarFieldEnum[] | WebhookReceiptScalarFieldEnum
    having?: WebhookReceiptScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WebhookReceiptCountAggregateInputType | true
    _min?: WebhookReceiptMinAggregateInputType
    _max?: WebhookReceiptMaxAggregateInputType
  }

  export type WebhookReceiptGroupByOutputType = {
    id: string
    organizationId: string
    provider: string
    deliveryId: string
    receivedAt: Date
    bodyHash: string
    signatureValid: boolean
    replayBlocked: boolean
    processed: boolean
    correlationId: string | null
    _count: WebhookReceiptCountAggregateOutputType | null
    _min: WebhookReceiptMinAggregateOutputType | null
    _max: WebhookReceiptMaxAggregateOutputType | null
  }

  type GetWebhookReceiptGroupByPayload<T extends WebhookReceiptGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WebhookReceiptGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WebhookReceiptGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WebhookReceiptGroupByOutputType[P]>
            : GetScalarType<T[P], WebhookReceiptGroupByOutputType[P]>
        }
      >
    >


  export type WebhookReceiptSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    provider?: boolean
    deliveryId?: boolean
    receivedAt?: boolean
    bodyHash?: boolean
    signatureValid?: boolean
    replayBlocked?: boolean
    processed?: boolean
    correlationId?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["webhookReceipt"]>

  export type WebhookReceiptSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    provider?: boolean
    deliveryId?: boolean
    receivedAt?: boolean
    bodyHash?: boolean
    signatureValid?: boolean
    replayBlocked?: boolean
    processed?: boolean
    correlationId?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["webhookReceipt"]>

  export type WebhookReceiptSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    provider?: boolean
    deliveryId?: boolean
    receivedAt?: boolean
    bodyHash?: boolean
    signatureValid?: boolean
    replayBlocked?: boolean
    processed?: boolean
    correlationId?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["webhookReceipt"]>

  export type WebhookReceiptSelectScalar = {
    id?: boolean
    organizationId?: boolean
    provider?: boolean
    deliveryId?: boolean
    receivedAt?: boolean
    bodyHash?: boolean
    signatureValid?: boolean
    replayBlocked?: boolean
    processed?: boolean
    correlationId?: boolean
  }

  export type WebhookReceiptOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "provider" | "deliveryId" | "receivedAt" | "bodyHash" | "signatureValid" | "replayBlocked" | "processed" | "correlationId", ExtArgs["result"]["webhookReceipt"]>
  export type WebhookReceiptInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type WebhookReceiptIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type WebhookReceiptIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $WebhookReceiptPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WebhookReceipt"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      provider: string
      deliveryId: string
      receivedAt: Date
      bodyHash: string
      signatureValid: boolean
      replayBlocked: boolean
      processed: boolean
      correlationId: string | null
    }, ExtArgs["result"]["webhookReceipt"]>
    composites: {}
  }

  type WebhookReceiptGetPayload<S extends boolean | null | undefined | WebhookReceiptDefaultArgs> = $Result.GetResult<Prisma.$WebhookReceiptPayload, S>

  type WebhookReceiptCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WebhookReceiptFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WebhookReceiptCountAggregateInputType | true
    }

  export interface WebhookReceiptDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WebhookReceipt'], meta: { name: 'WebhookReceipt' } }
    /**
     * Find zero or one WebhookReceipt that matches the filter.
     * @param {WebhookReceiptFindUniqueArgs} args - Arguments to find a WebhookReceipt
     * @example
     * // Get one WebhookReceipt
     * const webhookReceipt = await prisma.webhookReceipt.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WebhookReceiptFindUniqueArgs>(args: SelectSubset<T, WebhookReceiptFindUniqueArgs<ExtArgs>>): Prisma__WebhookReceiptClient<$Result.GetResult<Prisma.$WebhookReceiptPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WebhookReceipt that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WebhookReceiptFindUniqueOrThrowArgs} args - Arguments to find a WebhookReceipt
     * @example
     * // Get one WebhookReceipt
     * const webhookReceipt = await prisma.webhookReceipt.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WebhookReceiptFindUniqueOrThrowArgs>(args: SelectSubset<T, WebhookReceiptFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WebhookReceiptClient<$Result.GetResult<Prisma.$WebhookReceiptPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WebhookReceipt that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookReceiptFindFirstArgs} args - Arguments to find a WebhookReceipt
     * @example
     * // Get one WebhookReceipt
     * const webhookReceipt = await prisma.webhookReceipt.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WebhookReceiptFindFirstArgs>(args?: SelectSubset<T, WebhookReceiptFindFirstArgs<ExtArgs>>): Prisma__WebhookReceiptClient<$Result.GetResult<Prisma.$WebhookReceiptPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WebhookReceipt that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookReceiptFindFirstOrThrowArgs} args - Arguments to find a WebhookReceipt
     * @example
     * // Get one WebhookReceipt
     * const webhookReceipt = await prisma.webhookReceipt.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WebhookReceiptFindFirstOrThrowArgs>(args?: SelectSubset<T, WebhookReceiptFindFirstOrThrowArgs<ExtArgs>>): Prisma__WebhookReceiptClient<$Result.GetResult<Prisma.$WebhookReceiptPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WebhookReceipts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookReceiptFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WebhookReceipts
     * const webhookReceipts = await prisma.webhookReceipt.findMany()
     *
     * // Get first 10 WebhookReceipts
     * const webhookReceipts = await prisma.webhookReceipt.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const webhookReceiptWithIdOnly = await prisma.webhookReceipt.findMany({ select: { id: true } })
     *
     */
    findMany<T extends WebhookReceiptFindManyArgs>(args?: SelectSubset<T, WebhookReceiptFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebhookReceiptPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WebhookReceipt.
     * @param {WebhookReceiptCreateArgs} args - Arguments to create a WebhookReceipt.
     * @example
     * // Create one WebhookReceipt
     * const WebhookReceipt = await prisma.webhookReceipt.create({
     *   data: {
     *     // ... data to create a WebhookReceipt
     *   }
     * })
     *
     */
    create<T extends WebhookReceiptCreateArgs>(args: SelectSubset<T, WebhookReceiptCreateArgs<ExtArgs>>): Prisma__WebhookReceiptClient<$Result.GetResult<Prisma.$WebhookReceiptPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WebhookReceipts.
     * @param {WebhookReceiptCreateManyArgs} args - Arguments to create many WebhookReceipts.
     * @example
     * // Create many WebhookReceipts
     * const webhookReceipt = await prisma.webhookReceipt.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends WebhookReceiptCreateManyArgs>(args?: SelectSubset<T, WebhookReceiptCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WebhookReceipts and returns the data saved in the database.
     * @param {WebhookReceiptCreateManyAndReturnArgs} args - Arguments to create many WebhookReceipts.
     * @example
     * // Create many WebhookReceipts
     * const webhookReceipt = await prisma.webhookReceipt.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many WebhookReceipts and only return the `id`
     * const webhookReceiptWithIdOnly = await prisma.webhookReceipt.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends WebhookReceiptCreateManyAndReturnArgs>(args?: SelectSubset<T, WebhookReceiptCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebhookReceiptPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WebhookReceipt.
     * @param {WebhookReceiptDeleteArgs} args - Arguments to delete one WebhookReceipt.
     * @example
     * // Delete one WebhookReceipt
     * const WebhookReceipt = await prisma.webhookReceipt.delete({
     *   where: {
     *     // ... filter to delete one WebhookReceipt
     *   }
     * })
     *
     */
    delete<T extends WebhookReceiptDeleteArgs>(args: SelectSubset<T, WebhookReceiptDeleteArgs<ExtArgs>>): Prisma__WebhookReceiptClient<$Result.GetResult<Prisma.$WebhookReceiptPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WebhookReceipt.
     * @param {WebhookReceiptUpdateArgs} args - Arguments to update one WebhookReceipt.
     * @example
     * // Update one WebhookReceipt
     * const webhookReceipt = await prisma.webhookReceipt.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends WebhookReceiptUpdateArgs>(args: SelectSubset<T, WebhookReceiptUpdateArgs<ExtArgs>>): Prisma__WebhookReceiptClient<$Result.GetResult<Prisma.$WebhookReceiptPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WebhookReceipts.
     * @param {WebhookReceiptDeleteManyArgs} args - Arguments to filter WebhookReceipts to delete.
     * @example
     * // Delete a few WebhookReceipts
     * const { count } = await prisma.webhookReceipt.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends WebhookReceiptDeleteManyArgs>(args?: SelectSubset<T, WebhookReceiptDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WebhookReceipts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookReceiptUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WebhookReceipts
     * const webhookReceipt = await prisma.webhookReceipt.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends WebhookReceiptUpdateManyArgs>(args: SelectSubset<T, WebhookReceiptUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WebhookReceipts and returns the data updated in the database.
     * @param {WebhookReceiptUpdateManyAndReturnArgs} args - Arguments to update many WebhookReceipts.
     * @example
     * // Update many WebhookReceipts
     * const webhookReceipt = await prisma.webhookReceipt.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more WebhookReceipts and only return the `id`
     * const webhookReceiptWithIdOnly = await prisma.webhookReceipt.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends WebhookReceiptUpdateManyAndReturnArgs>(args: SelectSubset<T, WebhookReceiptUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebhookReceiptPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WebhookReceipt.
     * @param {WebhookReceiptUpsertArgs} args - Arguments to update or create a WebhookReceipt.
     * @example
     * // Update or create a WebhookReceipt
     * const webhookReceipt = await prisma.webhookReceipt.upsert({
     *   create: {
     *     // ... data to create a WebhookReceipt
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WebhookReceipt we want to update
     *   }
     * })
     */
    upsert<T extends WebhookReceiptUpsertArgs>(args: SelectSubset<T, WebhookReceiptUpsertArgs<ExtArgs>>): Prisma__WebhookReceiptClient<$Result.GetResult<Prisma.$WebhookReceiptPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WebhookReceipts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookReceiptCountArgs} args - Arguments to filter WebhookReceipts to count.
     * @example
     * // Count the number of WebhookReceipts
     * const count = await prisma.webhookReceipt.count({
     *   where: {
     *     // ... the filter for the WebhookReceipts we want to count
     *   }
     * })
    **/
    count<T extends WebhookReceiptCountArgs>(
      args?: Subset<T, WebhookReceiptCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WebhookReceiptCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WebhookReceipt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookReceiptAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WebhookReceiptAggregateArgs>(args: Subset<T, WebhookReceiptAggregateArgs>): Prisma.PrismaPromise<GetWebhookReceiptAggregateType<T>>

    /**
     * Group by WebhookReceipt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookReceiptGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<
      T extends WebhookReceiptGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WebhookReceiptGroupByArgs['orderBy'] }
        : { orderBy?: WebhookReceiptGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WebhookReceiptGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWebhookReceiptGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WebhookReceipt model
   */
  readonly fields: WebhookReceiptFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WebhookReceipt.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WebhookReceiptClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WebhookReceipt model
   */
  interface WebhookReceiptFieldRefs {
    readonly id: FieldRef<"WebhookReceipt", 'String'>
    readonly organizationId: FieldRef<"WebhookReceipt", 'String'>
    readonly provider: FieldRef<"WebhookReceipt", 'String'>
    readonly deliveryId: FieldRef<"WebhookReceipt", 'String'>
    readonly receivedAt: FieldRef<"WebhookReceipt", 'DateTime'>
    readonly bodyHash: FieldRef<"WebhookReceipt", 'String'>
    readonly signatureValid: FieldRef<"WebhookReceipt", 'Boolean'>
    readonly replayBlocked: FieldRef<"WebhookReceipt", 'Boolean'>
    readonly processed: FieldRef<"WebhookReceipt", 'Boolean'>
    readonly correlationId: FieldRef<"WebhookReceipt", 'String'>
  }


  // Custom InputTypes
  /**
   * WebhookReceipt findUnique
   */
  export type WebhookReceiptFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookReceipt
     */
    select?: WebhookReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookReceipt
     */
    omit?: WebhookReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookReceiptInclude<ExtArgs> | null
    /**
     * Filter, which WebhookReceipt to fetch.
     */
    where: WebhookReceiptWhereUniqueInput
  }

  /**
   * WebhookReceipt findUniqueOrThrow
   */
  export type WebhookReceiptFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookReceipt
     */
    select?: WebhookReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookReceipt
     */
    omit?: WebhookReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookReceiptInclude<ExtArgs> | null
    /**
     * Filter, which WebhookReceipt to fetch.
     */
    where: WebhookReceiptWhereUniqueInput
  }

  /**
   * WebhookReceipt findFirst
   */
  export type WebhookReceiptFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookReceipt
     */
    select?: WebhookReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookReceipt
     */
    omit?: WebhookReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookReceiptInclude<ExtArgs> | null
    /**
     * Filter, which WebhookReceipt to fetch.
     */
    where?: WebhookReceiptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WebhookReceipts to fetch.
     */
    orderBy?: WebhookReceiptOrderByWithRelationInput | WebhookReceiptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for WebhookReceipts.
     */
    cursor?: WebhookReceiptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WebhookReceipts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WebhookReceipts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of WebhookReceipts.
     */
    distinct?: WebhookReceiptScalarFieldEnum | WebhookReceiptScalarFieldEnum[]
  }

  /**
   * WebhookReceipt findFirstOrThrow
   */
  export type WebhookReceiptFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookReceipt
     */
    select?: WebhookReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookReceipt
     */
    omit?: WebhookReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookReceiptInclude<ExtArgs> | null
    /**
     * Filter, which WebhookReceipt to fetch.
     */
    where?: WebhookReceiptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WebhookReceipts to fetch.
     */
    orderBy?: WebhookReceiptOrderByWithRelationInput | WebhookReceiptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for WebhookReceipts.
     */
    cursor?: WebhookReceiptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WebhookReceipts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WebhookReceipts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of WebhookReceipts.
     */
    distinct?: WebhookReceiptScalarFieldEnum | WebhookReceiptScalarFieldEnum[]
  }

  /**
   * WebhookReceipt findMany
   */
  export type WebhookReceiptFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookReceipt
     */
    select?: WebhookReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookReceipt
     */
    omit?: WebhookReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookReceiptInclude<ExtArgs> | null
    /**
     * Filter, which WebhookReceipts to fetch.
     */
    where?: WebhookReceiptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WebhookReceipts to fetch.
     */
    orderBy?: WebhookReceiptOrderByWithRelationInput | WebhookReceiptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing WebhookReceipts.
     */
    cursor?: WebhookReceiptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WebhookReceipts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WebhookReceipts.
     */
    skip?: number
    distinct?: WebhookReceiptScalarFieldEnum | WebhookReceiptScalarFieldEnum[]
  }

  /**
   * WebhookReceipt create
   */
  export type WebhookReceiptCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookReceipt
     */
    select?: WebhookReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookReceipt
     */
    omit?: WebhookReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookReceiptInclude<ExtArgs> | null
    /**
     * The data needed to create a WebhookReceipt.
     */
    data: XOR<WebhookReceiptCreateInput, WebhookReceiptUncheckedCreateInput>
  }

  /**
   * WebhookReceipt createMany
   */
  export type WebhookReceiptCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WebhookReceipts.
     */
    data: WebhookReceiptCreateManyInput | WebhookReceiptCreateManyInput[]
  }

  /**
   * WebhookReceipt createManyAndReturn
   */
  export type WebhookReceiptCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookReceipt
     */
    select?: WebhookReceiptSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookReceipt
     */
    omit?: WebhookReceiptOmit<ExtArgs> | null
    /**
     * The data used to create many WebhookReceipts.
     */
    data: WebhookReceiptCreateManyInput | WebhookReceiptCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookReceiptIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WebhookReceipt update
   */
  export type WebhookReceiptUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookReceipt
     */
    select?: WebhookReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookReceipt
     */
    omit?: WebhookReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookReceiptInclude<ExtArgs> | null
    /**
     * The data needed to update a WebhookReceipt.
     */
    data: XOR<WebhookReceiptUpdateInput, WebhookReceiptUncheckedUpdateInput>
    /**
     * Choose, which WebhookReceipt to update.
     */
    where: WebhookReceiptWhereUniqueInput
  }

  /**
   * WebhookReceipt updateMany
   */
  export type WebhookReceiptUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WebhookReceipts.
     */
    data: XOR<WebhookReceiptUpdateManyMutationInput, WebhookReceiptUncheckedUpdateManyInput>
    /**
     * Filter which WebhookReceipts to update
     */
    where?: WebhookReceiptWhereInput
    /**
     * Limit how many WebhookReceipts to update.
     */
    limit?: number
  }

  /**
   * WebhookReceipt updateManyAndReturn
   */
  export type WebhookReceiptUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookReceipt
     */
    select?: WebhookReceiptSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookReceipt
     */
    omit?: WebhookReceiptOmit<ExtArgs> | null
    /**
     * The data used to update WebhookReceipts.
     */
    data: XOR<WebhookReceiptUpdateManyMutationInput, WebhookReceiptUncheckedUpdateManyInput>
    /**
     * Filter which WebhookReceipts to update
     */
    where?: WebhookReceiptWhereInput
    /**
     * Limit how many WebhookReceipts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookReceiptIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WebhookReceipt upsert
   */
  export type WebhookReceiptUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookReceipt
     */
    select?: WebhookReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookReceipt
     */
    omit?: WebhookReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookReceiptInclude<ExtArgs> | null
    /**
     * The filter to search for the WebhookReceipt to update in case it exists.
     */
    where: WebhookReceiptWhereUniqueInput
    /**
     * In case the WebhookReceipt found by the `where` argument doesn't exist, create a new WebhookReceipt with this data.
     */
    create: XOR<WebhookReceiptCreateInput, WebhookReceiptUncheckedCreateInput>
    /**
     * In case the WebhookReceipt was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WebhookReceiptUpdateInput, WebhookReceiptUncheckedUpdateInput>
  }

  /**
   * WebhookReceipt delete
   */
  export type WebhookReceiptDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookReceipt
     */
    select?: WebhookReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookReceipt
     */
    omit?: WebhookReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookReceiptInclude<ExtArgs> | null
    /**
     * Filter which WebhookReceipt to delete.
     */
    where: WebhookReceiptWhereUniqueInput
  }

  /**
   * WebhookReceipt deleteMany
   */
  export type WebhookReceiptDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WebhookReceipts to delete
     */
    where?: WebhookReceiptWhereInput
    /**
     * Limit how many WebhookReceipts to delete.
     */
    limit?: number
  }

  /**
   * WebhookReceipt without action
   */
  export type WebhookReceiptDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WebhookReceipt
     */
    select?: WebhookReceiptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WebhookReceipt
     */
    omit?: WebhookReceiptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WebhookReceiptInclude<ExtArgs> | null
  }


  /**
   * Model DeadLetterJob
   */

  export type AggregateDeadLetterJob = {
    _count: DeadLetterJobCountAggregateOutputType | null
    _avg: DeadLetterJobAvgAggregateOutputType | null
    _sum: DeadLetterJobSumAggregateOutputType | null
    _min: DeadLetterJobMinAggregateOutputType | null
    _max: DeadLetterJobMaxAggregateOutputType | null
  }

  export type DeadLetterJobAvgAggregateOutputType = {
    attempts: number | null
  }

  export type DeadLetterJobSumAggregateOutputType = {
    attempts: number | null
  }

  export type DeadLetterJobMinAggregateOutputType = {
    id: string | null
    jobId: string | null
    jobType: string | null
    payloadJson: string | null
    errorCode: string | null
    failureClass: string | null
    errorMessage: string | null
    attempts: number | null
    createdAt: Date | null
    lastFailedAt: Date | null
  }

  export type DeadLetterJobMaxAggregateOutputType = {
    id: string | null
    jobId: string | null
    jobType: string | null
    payloadJson: string | null
    errorCode: string | null
    failureClass: string | null
    errorMessage: string | null
    attempts: number | null
    createdAt: Date | null
    lastFailedAt: Date | null
  }

  export type DeadLetterJobCountAggregateOutputType = {
    id: number
    jobId: number
    jobType: number
    payloadJson: number
    errorCode: number
    failureClass: number
    errorMessage: number
    attempts: number
    createdAt: number
    lastFailedAt: number
    _all: number
  }


  export type DeadLetterJobAvgAggregateInputType = {
    attempts?: true
  }

  export type DeadLetterJobSumAggregateInputType = {
    attempts?: true
  }

  export type DeadLetterJobMinAggregateInputType = {
    id?: true
    jobId?: true
    jobType?: true
    payloadJson?: true
    errorCode?: true
    failureClass?: true
    errorMessage?: true
    attempts?: true
    createdAt?: true
    lastFailedAt?: true
  }

  export type DeadLetterJobMaxAggregateInputType = {
    id?: true
    jobId?: true
    jobType?: true
    payloadJson?: true
    errorCode?: true
    failureClass?: true
    errorMessage?: true
    attempts?: true
    createdAt?: true
    lastFailedAt?: true
  }

  export type DeadLetterJobCountAggregateInputType = {
    id?: true
    jobId?: true
    jobType?: true
    payloadJson?: true
    errorCode?: true
    failureClass?: true
    errorMessage?: true
    attempts?: true
    createdAt?: true
    lastFailedAt?: true
    _all?: true
  }

  export type DeadLetterJobAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeadLetterJob to aggregate.
     */
    where?: DeadLetterJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DeadLetterJobs to fetch.
     */
    orderBy?: DeadLetterJobOrderByWithRelationInput | DeadLetterJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: DeadLetterJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DeadLetterJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DeadLetterJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned DeadLetterJobs
    **/
    _count?: true | DeadLetterJobCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: DeadLetterJobAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: DeadLetterJobSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: DeadLetterJobMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: DeadLetterJobMaxAggregateInputType
  }

  export type GetDeadLetterJobAggregateType<T extends DeadLetterJobAggregateArgs> = {
        [P in keyof T & keyof AggregateDeadLetterJob]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDeadLetterJob[P]>
      : GetScalarType<T[P], AggregateDeadLetterJob[P]>
  }




  export type DeadLetterJobGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeadLetterJobWhereInput
    orderBy?: DeadLetterJobOrderByWithAggregationInput | DeadLetterJobOrderByWithAggregationInput[]
    by: DeadLetterJobScalarFieldEnum[] | DeadLetterJobScalarFieldEnum
    having?: DeadLetterJobScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DeadLetterJobCountAggregateInputType | true
    _avg?: DeadLetterJobAvgAggregateInputType
    _sum?: DeadLetterJobSumAggregateInputType
    _min?: DeadLetterJobMinAggregateInputType
    _max?: DeadLetterJobMaxAggregateInputType
  }

  export type DeadLetterJobGroupByOutputType = {
    id: string
    jobId: string
    jobType: string
    payloadJson: string
    errorCode: string
    failureClass: string
    errorMessage: string
    attempts: number
    createdAt: Date
    lastFailedAt: Date
    _count: DeadLetterJobCountAggregateOutputType | null
    _avg: DeadLetterJobAvgAggregateOutputType | null
    _sum: DeadLetterJobSumAggregateOutputType | null
    _min: DeadLetterJobMinAggregateOutputType | null
    _max: DeadLetterJobMaxAggregateOutputType | null
  }

  type GetDeadLetterJobGroupByPayload<T extends DeadLetterJobGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DeadLetterJobGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DeadLetterJobGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DeadLetterJobGroupByOutputType[P]>
            : GetScalarType<T[P], DeadLetterJobGroupByOutputType[P]>
        }
      >
    >


  export type DeadLetterJobSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobId?: boolean
    jobType?: boolean
    payloadJson?: boolean
    errorCode?: boolean
    failureClass?: boolean
    errorMessage?: boolean
    attempts?: boolean
    createdAt?: boolean
    lastFailedAt?: boolean
  }, ExtArgs["result"]["deadLetterJob"]>

  export type DeadLetterJobSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobId?: boolean
    jobType?: boolean
    payloadJson?: boolean
    errorCode?: boolean
    failureClass?: boolean
    errorMessage?: boolean
    attempts?: boolean
    createdAt?: boolean
    lastFailedAt?: boolean
  }, ExtArgs["result"]["deadLetterJob"]>

  export type DeadLetterJobSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobId?: boolean
    jobType?: boolean
    payloadJson?: boolean
    errorCode?: boolean
    failureClass?: boolean
    errorMessage?: boolean
    attempts?: boolean
    createdAt?: boolean
    lastFailedAt?: boolean
  }, ExtArgs["result"]["deadLetterJob"]>

  export type DeadLetterJobSelectScalar = {
    id?: boolean
    jobId?: boolean
    jobType?: boolean
    payloadJson?: boolean
    errorCode?: boolean
    failureClass?: boolean
    errorMessage?: boolean
    attempts?: boolean
    createdAt?: boolean
    lastFailedAt?: boolean
  }

  export type DeadLetterJobOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "jobId" | "jobType" | "payloadJson" | "errorCode" | "failureClass" | "errorMessage" | "attempts" | "createdAt" | "lastFailedAt", ExtArgs["result"]["deadLetterJob"]>

  export type $DeadLetterJobPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DeadLetterJob"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      jobId: string
      jobType: string
      payloadJson: string
      errorCode: string
      failureClass: string
      errorMessage: string
      attempts: number
      createdAt: Date
      lastFailedAt: Date
    }, ExtArgs["result"]["deadLetterJob"]>
    composites: {}
  }

  type DeadLetterJobGetPayload<S extends boolean | null | undefined | DeadLetterJobDefaultArgs> = $Result.GetResult<Prisma.$DeadLetterJobPayload, S>

  type DeadLetterJobCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DeadLetterJobFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DeadLetterJobCountAggregateInputType | true
    }

  export interface DeadLetterJobDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DeadLetterJob'], meta: { name: 'DeadLetterJob' } }
    /**
     * Find zero or one DeadLetterJob that matches the filter.
     * @param {DeadLetterJobFindUniqueArgs} args - Arguments to find a DeadLetterJob
     * @example
     * // Get one DeadLetterJob
     * const deadLetterJob = await prisma.deadLetterJob.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DeadLetterJobFindUniqueArgs>(args: SelectSubset<T, DeadLetterJobFindUniqueArgs<ExtArgs>>): Prisma__DeadLetterJobClient<$Result.GetResult<Prisma.$DeadLetterJobPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DeadLetterJob that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DeadLetterJobFindUniqueOrThrowArgs} args - Arguments to find a DeadLetterJob
     * @example
     * // Get one DeadLetterJob
     * const deadLetterJob = await prisma.deadLetterJob.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DeadLetterJobFindUniqueOrThrowArgs>(args: SelectSubset<T, DeadLetterJobFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DeadLetterJobClient<$Result.GetResult<Prisma.$DeadLetterJobPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DeadLetterJob that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterJobFindFirstArgs} args - Arguments to find a DeadLetterJob
     * @example
     * // Get one DeadLetterJob
     * const deadLetterJob = await prisma.deadLetterJob.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DeadLetterJobFindFirstArgs>(args?: SelectSubset<T, DeadLetterJobFindFirstArgs<ExtArgs>>): Prisma__DeadLetterJobClient<$Result.GetResult<Prisma.$DeadLetterJobPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DeadLetterJob that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterJobFindFirstOrThrowArgs} args - Arguments to find a DeadLetterJob
     * @example
     * // Get one DeadLetterJob
     * const deadLetterJob = await prisma.deadLetterJob.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DeadLetterJobFindFirstOrThrowArgs>(args?: SelectSubset<T, DeadLetterJobFindFirstOrThrowArgs<ExtArgs>>): Prisma__DeadLetterJobClient<$Result.GetResult<Prisma.$DeadLetterJobPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DeadLetterJobs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterJobFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DeadLetterJobs
     * const deadLetterJobs = await prisma.deadLetterJob.findMany()
     *
     * // Get first 10 DeadLetterJobs
     * const deadLetterJobs = await prisma.deadLetterJob.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const deadLetterJobWithIdOnly = await prisma.deadLetterJob.findMany({ select: { id: true } })
     *
     */
    findMany<T extends DeadLetterJobFindManyArgs>(args?: SelectSubset<T, DeadLetterJobFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeadLetterJobPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DeadLetterJob.
     * @param {DeadLetterJobCreateArgs} args - Arguments to create a DeadLetterJob.
     * @example
     * // Create one DeadLetterJob
     * const DeadLetterJob = await prisma.deadLetterJob.create({
     *   data: {
     *     // ... data to create a DeadLetterJob
     *   }
     * })
     *
     */
    create<T extends DeadLetterJobCreateArgs>(args: SelectSubset<T, DeadLetterJobCreateArgs<ExtArgs>>): Prisma__DeadLetterJobClient<$Result.GetResult<Prisma.$DeadLetterJobPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DeadLetterJobs.
     * @param {DeadLetterJobCreateManyArgs} args - Arguments to create many DeadLetterJobs.
     * @example
     * // Create many DeadLetterJobs
     * const deadLetterJob = await prisma.deadLetterJob.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends DeadLetterJobCreateManyArgs>(args?: SelectSubset<T, DeadLetterJobCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DeadLetterJobs and returns the data saved in the database.
     * @param {DeadLetterJobCreateManyAndReturnArgs} args - Arguments to create many DeadLetterJobs.
     * @example
     * // Create many DeadLetterJobs
     * const deadLetterJob = await prisma.deadLetterJob.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many DeadLetterJobs and only return the `id`
     * const deadLetterJobWithIdOnly = await prisma.deadLetterJob.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends DeadLetterJobCreateManyAndReturnArgs>(args?: SelectSubset<T, DeadLetterJobCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeadLetterJobPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DeadLetterJob.
     * @param {DeadLetterJobDeleteArgs} args - Arguments to delete one DeadLetterJob.
     * @example
     * // Delete one DeadLetterJob
     * const DeadLetterJob = await prisma.deadLetterJob.delete({
     *   where: {
     *     // ... filter to delete one DeadLetterJob
     *   }
     * })
     *
     */
    delete<T extends DeadLetterJobDeleteArgs>(args: SelectSubset<T, DeadLetterJobDeleteArgs<ExtArgs>>): Prisma__DeadLetterJobClient<$Result.GetResult<Prisma.$DeadLetterJobPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DeadLetterJob.
     * @param {DeadLetterJobUpdateArgs} args - Arguments to update one DeadLetterJob.
     * @example
     * // Update one DeadLetterJob
     * const deadLetterJob = await prisma.deadLetterJob.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends DeadLetterJobUpdateArgs>(args: SelectSubset<T, DeadLetterJobUpdateArgs<ExtArgs>>): Prisma__DeadLetterJobClient<$Result.GetResult<Prisma.$DeadLetterJobPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DeadLetterJobs.
     * @param {DeadLetterJobDeleteManyArgs} args - Arguments to filter DeadLetterJobs to delete.
     * @example
     * // Delete a few DeadLetterJobs
     * const { count } = await prisma.deadLetterJob.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends DeadLetterJobDeleteManyArgs>(args?: SelectSubset<T, DeadLetterJobDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DeadLetterJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterJobUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DeadLetterJobs
     * const deadLetterJob = await prisma.deadLetterJob.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends DeadLetterJobUpdateManyArgs>(args: SelectSubset<T, DeadLetterJobUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DeadLetterJobs and returns the data updated in the database.
     * @param {DeadLetterJobUpdateManyAndReturnArgs} args - Arguments to update many DeadLetterJobs.
     * @example
     * // Update many DeadLetterJobs
     * const deadLetterJob = await prisma.deadLetterJob.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more DeadLetterJobs and only return the `id`
     * const deadLetterJobWithIdOnly = await prisma.deadLetterJob.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends DeadLetterJobUpdateManyAndReturnArgs>(args: SelectSubset<T, DeadLetterJobUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeadLetterJobPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DeadLetterJob.
     * @param {DeadLetterJobUpsertArgs} args - Arguments to update or create a DeadLetterJob.
     * @example
     * // Update or create a DeadLetterJob
     * const deadLetterJob = await prisma.deadLetterJob.upsert({
     *   create: {
     *     // ... data to create a DeadLetterJob
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DeadLetterJob we want to update
     *   }
     * })
     */
    upsert<T extends DeadLetterJobUpsertArgs>(args: SelectSubset<T, DeadLetterJobUpsertArgs<ExtArgs>>): Prisma__DeadLetterJobClient<$Result.GetResult<Prisma.$DeadLetterJobPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DeadLetterJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterJobCountArgs} args - Arguments to filter DeadLetterJobs to count.
     * @example
     * // Count the number of DeadLetterJobs
     * const count = await prisma.deadLetterJob.count({
     *   where: {
     *     // ... the filter for the DeadLetterJobs we want to count
     *   }
     * })
    **/
    count<T extends DeadLetterJobCountArgs>(
      args?: Subset<T, DeadLetterJobCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DeadLetterJobCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DeadLetterJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterJobAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DeadLetterJobAggregateArgs>(args: Subset<T, DeadLetterJobAggregateArgs>): Prisma.PrismaPromise<GetDeadLetterJobAggregateType<T>>

    /**
     * Group by DeadLetterJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterJobGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<
      T extends DeadLetterJobGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DeadLetterJobGroupByArgs['orderBy'] }
        : { orderBy?: DeadLetterJobGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DeadLetterJobGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeadLetterJobGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DeadLetterJob model
   */
  readonly fields: DeadLetterJobFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DeadLetterJob.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DeadLetterJobClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DeadLetterJob model
   */
  interface DeadLetterJobFieldRefs {
    readonly id: FieldRef<"DeadLetterJob", 'String'>
    readonly jobId: FieldRef<"DeadLetterJob", 'String'>
    readonly jobType: FieldRef<"DeadLetterJob", 'String'>
    readonly payloadJson: FieldRef<"DeadLetterJob", 'String'>
    readonly errorCode: FieldRef<"DeadLetterJob", 'String'>
    readonly failureClass: FieldRef<"DeadLetterJob", 'String'>
    readonly errorMessage: FieldRef<"DeadLetterJob", 'String'>
    readonly attempts: FieldRef<"DeadLetterJob", 'Int'>
    readonly createdAt: FieldRef<"DeadLetterJob", 'DateTime'>
    readonly lastFailedAt: FieldRef<"DeadLetterJob", 'DateTime'>
  }


  // Custom InputTypes
  /**
   * DeadLetterJob findUnique
   */
  export type DeadLetterJobFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterJob
     */
    select?: DeadLetterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeadLetterJob
     */
    omit?: DeadLetterJobOmit<ExtArgs> | null
    /**
     * Filter, which DeadLetterJob to fetch.
     */
    where: DeadLetterJobWhereUniqueInput
  }

  /**
   * DeadLetterJob findUniqueOrThrow
   */
  export type DeadLetterJobFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterJob
     */
    select?: DeadLetterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeadLetterJob
     */
    omit?: DeadLetterJobOmit<ExtArgs> | null
    /**
     * Filter, which DeadLetterJob to fetch.
     */
    where: DeadLetterJobWhereUniqueInput
  }

  /**
   * DeadLetterJob findFirst
   */
  export type DeadLetterJobFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterJob
     */
    select?: DeadLetterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeadLetterJob
     */
    omit?: DeadLetterJobOmit<ExtArgs> | null
    /**
     * Filter, which DeadLetterJob to fetch.
     */
    where?: DeadLetterJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DeadLetterJobs to fetch.
     */
    orderBy?: DeadLetterJobOrderByWithRelationInput | DeadLetterJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DeadLetterJobs.
     */
    cursor?: DeadLetterJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DeadLetterJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DeadLetterJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DeadLetterJobs.
     */
    distinct?: DeadLetterJobScalarFieldEnum | DeadLetterJobScalarFieldEnum[]
  }

  /**
   * DeadLetterJob findFirstOrThrow
   */
  export type DeadLetterJobFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterJob
     */
    select?: DeadLetterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeadLetterJob
     */
    omit?: DeadLetterJobOmit<ExtArgs> | null
    /**
     * Filter, which DeadLetterJob to fetch.
     */
    where?: DeadLetterJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DeadLetterJobs to fetch.
     */
    orderBy?: DeadLetterJobOrderByWithRelationInput | DeadLetterJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DeadLetterJobs.
     */
    cursor?: DeadLetterJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DeadLetterJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DeadLetterJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DeadLetterJobs.
     */
    distinct?: DeadLetterJobScalarFieldEnum | DeadLetterJobScalarFieldEnum[]
  }

  /**
   * DeadLetterJob findMany
   */
  export type DeadLetterJobFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterJob
     */
    select?: DeadLetterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeadLetterJob
     */
    omit?: DeadLetterJobOmit<ExtArgs> | null
    /**
     * Filter, which DeadLetterJobs to fetch.
     */
    where?: DeadLetterJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DeadLetterJobs to fetch.
     */
    orderBy?: DeadLetterJobOrderByWithRelationInput | DeadLetterJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing DeadLetterJobs.
     */
    cursor?: DeadLetterJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DeadLetterJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DeadLetterJobs.
     */
    skip?: number
    distinct?: DeadLetterJobScalarFieldEnum | DeadLetterJobScalarFieldEnum[]
  }

  /**
   * DeadLetterJob create
   */
  export type DeadLetterJobCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterJob
     */
    select?: DeadLetterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeadLetterJob
     */
    omit?: DeadLetterJobOmit<ExtArgs> | null
    /**
     * The data needed to create a DeadLetterJob.
     */
    data: XOR<DeadLetterJobCreateInput, DeadLetterJobUncheckedCreateInput>
  }

  /**
   * DeadLetterJob createMany
   */
  export type DeadLetterJobCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DeadLetterJobs.
     */
    data: DeadLetterJobCreateManyInput | DeadLetterJobCreateManyInput[]
  }

  /**
   * DeadLetterJob createManyAndReturn
   */
  export type DeadLetterJobCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterJob
     */
    select?: DeadLetterJobSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DeadLetterJob
     */
    omit?: DeadLetterJobOmit<ExtArgs> | null
    /**
     * The data used to create many DeadLetterJobs.
     */
    data: DeadLetterJobCreateManyInput | DeadLetterJobCreateManyInput[]
  }

  /**
   * DeadLetterJob update
   */
  export type DeadLetterJobUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterJob
     */
    select?: DeadLetterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeadLetterJob
     */
    omit?: DeadLetterJobOmit<ExtArgs> | null
    /**
     * The data needed to update a DeadLetterJob.
     */
    data: XOR<DeadLetterJobUpdateInput, DeadLetterJobUncheckedUpdateInput>
    /**
     * Choose, which DeadLetterJob to update.
     */
    where: DeadLetterJobWhereUniqueInput
  }

  /**
   * DeadLetterJob updateMany
   */
  export type DeadLetterJobUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DeadLetterJobs.
     */
    data: XOR<DeadLetterJobUpdateManyMutationInput, DeadLetterJobUncheckedUpdateManyInput>
    /**
     * Filter which DeadLetterJobs to update
     */
    where?: DeadLetterJobWhereInput
    /**
     * Limit how many DeadLetterJobs to update.
     */
    limit?: number
  }

  /**
   * DeadLetterJob updateManyAndReturn
   */
  export type DeadLetterJobUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterJob
     */
    select?: DeadLetterJobSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DeadLetterJob
     */
    omit?: DeadLetterJobOmit<ExtArgs> | null
    /**
     * The data used to update DeadLetterJobs.
     */
    data: XOR<DeadLetterJobUpdateManyMutationInput, DeadLetterJobUncheckedUpdateManyInput>
    /**
     * Filter which DeadLetterJobs to update
     */
    where?: DeadLetterJobWhereInput
    /**
     * Limit how many DeadLetterJobs to update.
     */
    limit?: number
  }

  /**
   * DeadLetterJob upsert
   */
  export type DeadLetterJobUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterJob
     */
    select?: DeadLetterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeadLetterJob
     */
    omit?: DeadLetterJobOmit<ExtArgs> | null
    /**
     * The filter to search for the DeadLetterJob to update in case it exists.
     */
    where: DeadLetterJobWhereUniqueInput
    /**
     * In case the DeadLetterJob found by the `where` argument doesn't exist, create a new DeadLetterJob with this data.
     */
    create: XOR<DeadLetterJobCreateInput, DeadLetterJobUncheckedCreateInput>
    /**
     * In case the DeadLetterJob was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeadLetterJobUpdateInput, DeadLetterJobUncheckedUpdateInput>
  }

  /**
   * DeadLetterJob delete
   */
  export type DeadLetterJobDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterJob
     */
    select?: DeadLetterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeadLetterJob
     */
    omit?: DeadLetterJobOmit<ExtArgs> | null
    /**
     * Filter which DeadLetterJob to delete.
     */
    where: DeadLetterJobWhereUniqueInput
  }

  /**
   * DeadLetterJob deleteMany
   */
  export type DeadLetterJobDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeadLetterJobs to delete
     */
    where?: DeadLetterJobWhereInput
    /**
     * Limit how many DeadLetterJobs to delete.
     */
    limit?: number
  }

  /**
   * DeadLetterJob without action
   */
  export type DeadLetterJobDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterJob
     */
    select?: DeadLetterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DeadLetterJob
     */
    omit?: DeadLetterJobOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const OrganizationScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt'
  };

  export type OrganizationScalarFieldEnum = (typeof OrganizationScalarFieldEnum)[keyof typeof OrganizationScalarFieldEnum]


  export const RepositoryScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    name: 'name',
    createdAt: 'createdAt'
  };

  export type RepositoryScalarFieldEnum = (typeof RepositoryScalarFieldEnum)[keyof typeof RepositoryScalarFieldEnum]


  export const ProjectScalarFieldEnum: {
    id: 'id',
    repositoryId: 'repositoryId',
    name: 'name'
  };

  export type ProjectScalarFieldEnum = (typeof ProjectScalarFieldEnum)[keyof typeof ProjectScalarFieldEnum]


  export const ReadyLayerRunScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    repositoryId: 'repositoryId',
    status: 'status',
    createdAt: 'createdAt'
  };

  export type ReadyLayerRunScalarFieldEnum = (typeof ReadyLayerRunScalarFieldEnum)[keyof typeof ReadyLayerRunScalarFieldEnum]


  export const EvidenceAttestationScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    repositoryId: 'repositoryId',
    runId: 'runId',
    manifestHash: 'manifestHash',
    bundleHash: 'bundleHash',
    treeHash: 'treeHash',
    signingMode: 'signingMode',
    signature: 'signature',
    publicKeyId: 'publicKeyId',
    createdAt: 'createdAt'
  };

  export type EvidenceAttestationScalarFieldEnum = (typeof EvidenceAttestationScalarFieldEnum)[keyof typeof EvidenceAttestationScalarFieldEnum]


  export const EvidenceObjectScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    runId: 'runId',
    kind: 'kind',
    storageProvider: 'storageProvider',
    storageKey: 'storageKey',
    sizeBytes: 'sizeBytes',
    contentHash: 'contentHash',
    createdAt: 'createdAt'
  };

  export type EvidenceObjectScalarFieldEnum = (typeof EvidenceObjectScalarFieldEnum)[keyof typeof EvidenceObjectScalarFieldEnum]


  export const PolicyPackScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    name: 'name',
    version: 'version',
    description: 'description',
    contentsJson: 'contentsJson',
    packHash: 'packHash',
    signature: 'signature',
    signingMode: 'signingMode',
    createdAt: 'createdAt'
  };

  export type PolicyPackScalarFieldEnum = (typeof PolicyPackScalarFieldEnum)[keyof typeof PolicyPackScalarFieldEnum]


  export const PolicyPackAssignmentScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    repositoryId: 'repositoryId',
    scope: 'scope',
    policyPackId: 'policyPackId',
    enabled: 'enabled',
    createdAt: 'createdAt'
  };

  export type PolicyPackAssignmentScalarFieldEnum = (typeof PolicyPackAssignmentScalarFieldEnum)[keyof typeof PolicyPackAssignmentScalarFieldEnum]


  export const WebhookReceiptScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    provider: 'provider',
    deliveryId: 'deliveryId',
    receivedAt: 'receivedAt',
    bodyHash: 'bodyHash',
    signatureValid: 'signatureValid',
    replayBlocked: 'replayBlocked',
    processed: 'processed',
    correlationId: 'correlationId'
  };

  export type WebhookReceiptScalarFieldEnum = (typeof WebhookReceiptScalarFieldEnum)[keyof typeof WebhookReceiptScalarFieldEnum]


  export const DeadLetterJobScalarFieldEnum: {
    id: 'id',
    jobId: 'jobId',
    jobType: 'jobType',
    payloadJson: 'payloadJson',
    errorCode: 'errorCode',
    failureClass: 'failureClass',
    errorMessage: 'errorMessage',
    attempts: 'attempts',
    createdAt: 'createdAt',
    lastFailedAt: 'lastFailedAt'
  };

  export type DeadLetterJobScalarFieldEnum = (typeof DeadLetterJobScalarFieldEnum)[keyof typeof DeadLetterJobScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>



  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>



  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>



  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>



  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>

  /**
   * Deep Input Types
   */


  export type OrganizationWhereInput = {
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    id?: StringFilter<"Organization"> | string
    name?: StringFilter<"Organization"> | string
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    repositories?: RepositoryListRelationFilter
    runs?: ReadyLayerRunListRelationFilter
    evidenceAttestations?: EvidenceAttestationListRelationFilter
    evidenceObjects?: EvidenceObjectListRelationFilter
    policyPacks?: PolicyPackListRelationFilter
    policyAssignments?: PolicyPackAssignmentListRelationFilter
    webhookReceipts?: WebhookReceiptListRelationFilter
  }

  export type OrganizationOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    repositories?: RepositoryOrderByRelationAggregateInput
    runs?: ReadyLayerRunOrderByRelationAggregateInput
    evidenceAttestations?: EvidenceAttestationOrderByRelationAggregateInput
    evidenceObjects?: EvidenceObjectOrderByRelationAggregateInput
    policyPacks?: PolicyPackOrderByRelationAggregateInput
    policyAssignments?: PolicyPackAssignmentOrderByRelationAggregateInput
    webhookReceipts?: WebhookReceiptOrderByRelationAggregateInput
  }

  export type OrganizationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    name?: StringFilter<"Organization"> | string
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    repositories?: RepositoryListRelationFilter
    runs?: ReadyLayerRunListRelationFilter
    evidenceAttestations?: EvidenceAttestationListRelationFilter
    evidenceObjects?: EvidenceObjectListRelationFilter
    policyPacks?: PolicyPackListRelationFilter
    policyAssignments?: PolicyPackAssignmentListRelationFilter
    webhookReceipts?: WebhookReceiptListRelationFilter
  }, "id">

  export type OrganizationOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    _count?: OrganizationCountOrderByAggregateInput
    _max?: OrganizationMaxOrderByAggregateInput
    _min?: OrganizationMinOrderByAggregateInput
  }

  export type OrganizationScalarWhereWithAggregatesInput = {
    AND?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    OR?: OrganizationScalarWhereWithAggregatesInput[]
    NOT?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Organization"> | string
    name?: StringWithAggregatesFilter<"Organization"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
  }

  export type RepositoryWhereInput = {
    AND?: RepositoryWhereInput | RepositoryWhereInput[]
    OR?: RepositoryWhereInput[]
    NOT?: RepositoryWhereInput | RepositoryWhereInput[]
    id?: StringFilter<"Repository"> | string
    organizationId?: StringFilter<"Repository"> | string
    name?: StringFilter<"Repository"> | string
    createdAt?: DateTimeFilter<"Repository"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    projects?: ProjectListRelationFilter
    runs?: ReadyLayerRunListRelationFilter
    evidenceAttestations?: EvidenceAttestationListRelationFilter
    policyAssignments?: PolicyPackAssignmentListRelationFilter
  }

  export type RepositoryOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
    projects?: ProjectOrderByRelationAggregateInput
    runs?: ReadyLayerRunOrderByRelationAggregateInput
    evidenceAttestations?: EvidenceAttestationOrderByRelationAggregateInput
    policyAssignments?: PolicyPackAssignmentOrderByRelationAggregateInput
  }

  export type RepositoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RepositoryWhereInput | RepositoryWhereInput[]
    OR?: RepositoryWhereInput[]
    NOT?: RepositoryWhereInput | RepositoryWhereInput[]
    organizationId?: StringFilter<"Repository"> | string
    name?: StringFilter<"Repository"> | string
    createdAt?: DateTimeFilter<"Repository"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    projects?: ProjectListRelationFilter
    runs?: ReadyLayerRunListRelationFilter
    evidenceAttestations?: EvidenceAttestationListRelationFilter
    policyAssignments?: PolicyPackAssignmentListRelationFilter
  }, "id">

  export type RepositoryOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    _count?: RepositoryCountOrderByAggregateInput
    _max?: RepositoryMaxOrderByAggregateInput
    _min?: RepositoryMinOrderByAggregateInput
  }

  export type RepositoryScalarWhereWithAggregatesInput = {
    AND?: RepositoryScalarWhereWithAggregatesInput | RepositoryScalarWhereWithAggregatesInput[]
    OR?: RepositoryScalarWhereWithAggregatesInput[]
    NOT?: RepositoryScalarWhereWithAggregatesInput | RepositoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Repository"> | string
    organizationId?: StringWithAggregatesFilter<"Repository"> | string
    name?: StringWithAggregatesFilter<"Repository"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Repository"> | Date | string
  }

  export type ProjectWhereInput = {
    AND?: ProjectWhereInput | ProjectWhereInput[]
    OR?: ProjectWhereInput[]
    NOT?: ProjectWhereInput | ProjectWhereInput[]
    id?: StringFilter<"Project"> | string
    repositoryId?: StringFilter<"Project"> | string
    name?: StringFilter<"Project"> | string
    repository?: XOR<RepositoryScalarRelationFilter, RepositoryWhereInput>
  }

  export type ProjectOrderByWithRelationInput = {
    id?: SortOrder
    repositoryId?: SortOrder
    name?: SortOrder
    repository?: RepositoryOrderByWithRelationInput
  }

  export type ProjectWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProjectWhereInput | ProjectWhereInput[]
    OR?: ProjectWhereInput[]
    NOT?: ProjectWhereInput | ProjectWhereInput[]
    repositoryId?: StringFilter<"Project"> | string
    name?: StringFilter<"Project"> | string
    repository?: XOR<RepositoryScalarRelationFilter, RepositoryWhereInput>
  }, "id">

  export type ProjectOrderByWithAggregationInput = {
    id?: SortOrder
    repositoryId?: SortOrder
    name?: SortOrder
    _count?: ProjectCountOrderByAggregateInput
    _max?: ProjectMaxOrderByAggregateInput
    _min?: ProjectMinOrderByAggregateInput
  }

  export type ProjectScalarWhereWithAggregatesInput = {
    AND?: ProjectScalarWhereWithAggregatesInput | ProjectScalarWhereWithAggregatesInput[]
    OR?: ProjectScalarWhereWithAggregatesInput[]
    NOT?: ProjectScalarWhereWithAggregatesInput | ProjectScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Project"> | string
    repositoryId?: StringWithAggregatesFilter<"Project"> | string
    name?: StringWithAggregatesFilter<"Project"> | string
  }

  export type ReadyLayerRunWhereInput = {
    AND?: ReadyLayerRunWhereInput | ReadyLayerRunWhereInput[]
    OR?: ReadyLayerRunWhereInput[]
    NOT?: ReadyLayerRunWhereInput | ReadyLayerRunWhereInput[]
    id?: StringFilter<"ReadyLayerRun"> | string
    organizationId?: StringFilter<"ReadyLayerRun"> | string
    repositoryId?: StringFilter<"ReadyLayerRun"> | string
    status?: StringFilter<"ReadyLayerRun"> | string
    createdAt?: DateTimeFilter<"ReadyLayerRun"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    repository?: XOR<RepositoryScalarRelationFilter, RepositoryWhereInput>
    attestations?: EvidenceAttestationListRelationFilter
  }

  export type ReadyLayerRunOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
    repository?: RepositoryOrderByWithRelationInput
    attestations?: EvidenceAttestationOrderByRelationAggregateInput
  }

  export type ReadyLayerRunWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReadyLayerRunWhereInput | ReadyLayerRunWhereInput[]
    OR?: ReadyLayerRunWhereInput[]
    NOT?: ReadyLayerRunWhereInput | ReadyLayerRunWhereInput[]
    organizationId?: StringFilter<"ReadyLayerRun"> | string
    repositoryId?: StringFilter<"ReadyLayerRun"> | string
    status?: StringFilter<"ReadyLayerRun"> | string
    createdAt?: DateTimeFilter<"ReadyLayerRun"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    repository?: XOR<RepositoryScalarRelationFilter, RepositoryWhereInput>
    attestations?: EvidenceAttestationListRelationFilter
  }, "id">

  export type ReadyLayerRunOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    _count?: ReadyLayerRunCountOrderByAggregateInput
    _max?: ReadyLayerRunMaxOrderByAggregateInput
    _min?: ReadyLayerRunMinOrderByAggregateInput
  }

  export type ReadyLayerRunScalarWhereWithAggregatesInput = {
    AND?: ReadyLayerRunScalarWhereWithAggregatesInput | ReadyLayerRunScalarWhereWithAggregatesInput[]
    OR?: ReadyLayerRunScalarWhereWithAggregatesInput[]
    NOT?: ReadyLayerRunScalarWhereWithAggregatesInput | ReadyLayerRunScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReadyLayerRun"> | string
    organizationId?: StringWithAggregatesFilter<"ReadyLayerRun"> | string
    repositoryId?: StringWithAggregatesFilter<"ReadyLayerRun"> | string
    status?: StringWithAggregatesFilter<"ReadyLayerRun"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ReadyLayerRun"> | Date | string
  }

  export type EvidenceAttestationWhereInput = {
    AND?: EvidenceAttestationWhereInput | EvidenceAttestationWhereInput[]
    OR?: EvidenceAttestationWhereInput[]
    NOT?: EvidenceAttestationWhereInput | EvidenceAttestationWhereInput[]
    id?: StringFilter<"EvidenceAttestation"> | string
    organizationId?: StringFilter<"EvidenceAttestation"> | string
    repositoryId?: StringFilter<"EvidenceAttestation"> | string
    runId?: StringFilter<"EvidenceAttestation"> | string
    manifestHash?: StringFilter<"EvidenceAttestation"> | string
    bundleHash?: StringFilter<"EvidenceAttestation"> | string
    treeHash?: StringFilter<"EvidenceAttestation"> | string
    signingMode?: StringFilter<"EvidenceAttestation"> | string
    signature?: StringNullableFilter<"EvidenceAttestation"> | string | null
    publicKeyId?: StringNullableFilter<"EvidenceAttestation"> | string | null
    createdAt?: DateTimeFilter<"EvidenceAttestation"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    repository?: XOR<RepositoryScalarRelationFilter, RepositoryWhereInput>
    run?: XOR<ReadyLayerRunScalarRelationFilter, ReadyLayerRunWhereInput>
  }

  export type EvidenceAttestationOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrder
    runId?: SortOrder
    manifestHash?: SortOrder
    bundleHash?: SortOrder
    treeHash?: SortOrder
    signingMode?: SortOrder
    signature?: SortOrderInput | SortOrder
    publicKeyId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
    repository?: RepositoryOrderByWithRelationInput
    run?: ReadyLayerRunOrderByWithRelationInput
  }

  export type EvidenceAttestationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    runId?: string
    AND?: EvidenceAttestationWhereInput | EvidenceAttestationWhereInput[]
    OR?: EvidenceAttestationWhereInput[]
    NOT?: EvidenceAttestationWhereInput | EvidenceAttestationWhereInput[]
    organizationId?: StringFilter<"EvidenceAttestation"> | string
    repositoryId?: StringFilter<"EvidenceAttestation"> | string
    manifestHash?: StringFilter<"EvidenceAttestation"> | string
    bundleHash?: StringFilter<"EvidenceAttestation"> | string
    treeHash?: StringFilter<"EvidenceAttestation"> | string
    signingMode?: StringFilter<"EvidenceAttestation"> | string
    signature?: StringNullableFilter<"EvidenceAttestation"> | string | null
    publicKeyId?: StringNullableFilter<"EvidenceAttestation"> | string | null
    createdAt?: DateTimeFilter<"EvidenceAttestation"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    repository?: XOR<RepositoryScalarRelationFilter, RepositoryWhereInput>
    run?: XOR<ReadyLayerRunScalarRelationFilter, ReadyLayerRunWhereInput>
  }, "id" | "runId">

  export type EvidenceAttestationOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrder
    runId?: SortOrder
    manifestHash?: SortOrder
    bundleHash?: SortOrder
    treeHash?: SortOrder
    signingMode?: SortOrder
    signature?: SortOrderInput | SortOrder
    publicKeyId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: EvidenceAttestationCountOrderByAggregateInput
    _max?: EvidenceAttestationMaxOrderByAggregateInput
    _min?: EvidenceAttestationMinOrderByAggregateInput
  }

  export type EvidenceAttestationScalarWhereWithAggregatesInput = {
    AND?: EvidenceAttestationScalarWhereWithAggregatesInput | EvidenceAttestationScalarWhereWithAggregatesInput[]
    OR?: EvidenceAttestationScalarWhereWithAggregatesInput[]
    NOT?: EvidenceAttestationScalarWhereWithAggregatesInput | EvidenceAttestationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EvidenceAttestation"> | string
    organizationId?: StringWithAggregatesFilter<"EvidenceAttestation"> | string
    repositoryId?: StringWithAggregatesFilter<"EvidenceAttestation"> | string
    runId?: StringWithAggregatesFilter<"EvidenceAttestation"> | string
    manifestHash?: StringWithAggregatesFilter<"EvidenceAttestation"> | string
    bundleHash?: StringWithAggregatesFilter<"EvidenceAttestation"> | string
    treeHash?: StringWithAggregatesFilter<"EvidenceAttestation"> | string
    signingMode?: StringWithAggregatesFilter<"EvidenceAttestation"> | string
    signature?: StringNullableWithAggregatesFilter<"EvidenceAttestation"> | string | null
    publicKeyId?: StringNullableWithAggregatesFilter<"EvidenceAttestation"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"EvidenceAttestation"> | Date | string
  }

  export type EvidenceObjectWhereInput = {
    AND?: EvidenceObjectWhereInput | EvidenceObjectWhereInput[]
    OR?: EvidenceObjectWhereInput[]
    NOT?: EvidenceObjectWhereInput | EvidenceObjectWhereInput[]
    id?: StringFilter<"EvidenceObject"> | string
    organizationId?: StringFilter<"EvidenceObject"> | string
    runId?: StringNullableFilter<"EvidenceObject"> | string | null
    kind?: StringFilter<"EvidenceObject"> | string
    storageProvider?: StringFilter<"EvidenceObject"> | string
    storageKey?: StringFilter<"EvidenceObject"> | string
    sizeBytes?: IntFilter<"EvidenceObject"> | number
    contentHash?: StringFilter<"EvidenceObject"> | string
    createdAt?: DateTimeFilter<"EvidenceObject"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }

  export type EvidenceObjectOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    runId?: SortOrderInput | SortOrder
    kind?: SortOrder
    storageProvider?: SortOrder
    storageKey?: SortOrder
    sizeBytes?: SortOrder
    contentHash?: SortOrder
    createdAt?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
  }

  export type EvidenceObjectWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: EvidenceObjectWhereInput | EvidenceObjectWhereInput[]
    OR?: EvidenceObjectWhereInput[]
    NOT?: EvidenceObjectWhereInput | EvidenceObjectWhereInput[]
    organizationId?: StringFilter<"EvidenceObject"> | string
    runId?: StringNullableFilter<"EvidenceObject"> | string | null
    kind?: StringFilter<"EvidenceObject"> | string
    storageProvider?: StringFilter<"EvidenceObject"> | string
    storageKey?: StringFilter<"EvidenceObject"> | string
    sizeBytes?: IntFilter<"EvidenceObject"> | number
    contentHash?: StringFilter<"EvidenceObject"> | string
    createdAt?: DateTimeFilter<"EvidenceObject"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }, "id">

  export type EvidenceObjectOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    runId?: SortOrderInput | SortOrder
    kind?: SortOrder
    storageProvider?: SortOrder
    storageKey?: SortOrder
    sizeBytes?: SortOrder
    contentHash?: SortOrder
    createdAt?: SortOrder
    _count?: EvidenceObjectCountOrderByAggregateInput
    _avg?: EvidenceObjectAvgOrderByAggregateInput
    _max?: EvidenceObjectMaxOrderByAggregateInput
    _min?: EvidenceObjectMinOrderByAggregateInput
    _sum?: EvidenceObjectSumOrderByAggregateInput
  }

  export type EvidenceObjectScalarWhereWithAggregatesInput = {
    AND?: EvidenceObjectScalarWhereWithAggregatesInput | EvidenceObjectScalarWhereWithAggregatesInput[]
    OR?: EvidenceObjectScalarWhereWithAggregatesInput[]
    NOT?: EvidenceObjectScalarWhereWithAggregatesInput | EvidenceObjectScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EvidenceObject"> | string
    organizationId?: StringWithAggregatesFilter<"EvidenceObject"> | string
    runId?: StringNullableWithAggregatesFilter<"EvidenceObject"> | string | null
    kind?: StringWithAggregatesFilter<"EvidenceObject"> | string
    storageProvider?: StringWithAggregatesFilter<"EvidenceObject"> | string
    storageKey?: StringWithAggregatesFilter<"EvidenceObject"> | string
    sizeBytes?: IntWithAggregatesFilter<"EvidenceObject"> | number
    contentHash?: StringWithAggregatesFilter<"EvidenceObject"> | string
    createdAt?: DateTimeWithAggregatesFilter<"EvidenceObject"> | Date | string
  }

  export type PolicyPackWhereInput = {
    AND?: PolicyPackWhereInput | PolicyPackWhereInput[]
    OR?: PolicyPackWhereInput[]
    NOT?: PolicyPackWhereInput | PolicyPackWhereInput[]
    id?: StringFilter<"PolicyPack"> | string
    organizationId?: StringFilter<"PolicyPack"> | string
    name?: StringFilter<"PolicyPack"> | string
    version?: StringFilter<"PolicyPack"> | string
    description?: StringNullableFilter<"PolicyPack"> | string | null
    contentsJson?: StringFilter<"PolicyPack"> | string
    packHash?: StringFilter<"PolicyPack"> | string
    signature?: StringNullableFilter<"PolicyPack"> | string | null
    signingMode?: StringFilter<"PolicyPack"> | string
    createdAt?: DateTimeFilter<"PolicyPack"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    assignments?: PolicyPackAssignmentListRelationFilter
  }

  export type PolicyPackOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    version?: SortOrder
    description?: SortOrderInput | SortOrder
    contentsJson?: SortOrder
    packHash?: SortOrder
    signature?: SortOrderInput | SortOrder
    signingMode?: SortOrder
    createdAt?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
    assignments?: PolicyPackAssignmentOrderByRelationAggregateInput
  }

  export type PolicyPackWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    organizationId_name_version?: PolicyPackOrganizationIdNameVersionCompoundUniqueInput
    AND?: PolicyPackWhereInput | PolicyPackWhereInput[]
    OR?: PolicyPackWhereInput[]
    NOT?: PolicyPackWhereInput | PolicyPackWhereInput[]
    organizationId?: StringFilter<"PolicyPack"> | string
    name?: StringFilter<"PolicyPack"> | string
    version?: StringFilter<"PolicyPack"> | string
    description?: StringNullableFilter<"PolicyPack"> | string | null
    contentsJson?: StringFilter<"PolicyPack"> | string
    packHash?: StringFilter<"PolicyPack"> | string
    signature?: StringNullableFilter<"PolicyPack"> | string | null
    signingMode?: StringFilter<"PolicyPack"> | string
    createdAt?: DateTimeFilter<"PolicyPack"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    assignments?: PolicyPackAssignmentListRelationFilter
  }, "id" | "organizationId_name_version">

  export type PolicyPackOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    version?: SortOrder
    description?: SortOrderInput | SortOrder
    contentsJson?: SortOrder
    packHash?: SortOrder
    signature?: SortOrderInput | SortOrder
    signingMode?: SortOrder
    createdAt?: SortOrder
    _count?: PolicyPackCountOrderByAggregateInput
    _max?: PolicyPackMaxOrderByAggregateInput
    _min?: PolicyPackMinOrderByAggregateInput
  }

  export type PolicyPackScalarWhereWithAggregatesInput = {
    AND?: PolicyPackScalarWhereWithAggregatesInput | PolicyPackScalarWhereWithAggregatesInput[]
    OR?: PolicyPackScalarWhereWithAggregatesInput[]
    NOT?: PolicyPackScalarWhereWithAggregatesInput | PolicyPackScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PolicyPack"> | string
    organizationId?: StringWithAggregatesFilter<"PolicyPack"> | string
    name?: StringWithAggregatesFilter<"PolicyPack"> | string
    version?: StringWithAggregatesFilter<"PolicyPack"> | string
    description?: StringNullableWithAggregatesFilter<"PolicyPack"> | string | null
    contentsJson?: StringWithAggregatesFilter<"PolicyPack"> | string
    packHash?: StringWithAggregatesFilter<"PolicyPack"> | string
    signature?: StringNullableWithAggregatesFilter<"PolicyPack"> | string | null
    signingMode?: StringWithAggregatesFilter<"PolicyPack"> | string
    createdAt?: DateTimeWithAggregatesFilter<"PolicyPack"> | Date | string
  }

  export type PolicyPackAssignmentWhereInput = {
    AND?: PolicyPackAssignmentWhereInput | PolicyPackAssignmentWhereInput[]
    OR?: PolicyPackAssignmentWhereInput[]
    NOT?: PolicyPackAssignmentWhereInput | PolicyPackAssignmentWhereInput[]
    id?: StringFilter<"PolicyPackAssignment"> | string
    organizationId?: StringFilter<"PolicyPackAssignment"> | string
    repositoryId?: StringNullableFilter<"PolicyPackAssignment"> | string | null
    scope?: StringFilter<"PolicyPackAssignment"> | string
    policyPackId?: StringFilter<"PolicyPackAssignment"> | string
    enabled?: BoolFilter<"PolicyPackAssignment"> | boolean
    createdAt?: DateTimeFilter<"PolicyPackAssignment"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    repository?: XOR<RepositoryNullableScalarRelationFilter, RepositoryWhereInput> | null
    policyPack?: XOR<PolicyPackScalarRelationFilter, PolicyPackWhereInput>
  }

  export type PolicyPackAssignmentOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrderInput | SortOrder
    scope?: SortOrder
    policyPackId?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
    repository?: RepositoryOrderByWithRelationInput
    policyPack?: PolicyPackOrderByWithRelationInput
  }

  export type PolicyPackAssignmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PolicyPackAssignmentWhereInput | PolicyPackAssignmentWhereInput[]
    OR?: PolicyPackAssignmentWhereInput[]
    NOT?: PolicyPackAssignmentWhereInput | PolicyPackAssignmentWhereInput[]
    organizationId?: StringFilter<"PolicyPackAssignment"> | string
    repositoryId?: StringNullableFilter<"PolicyPackAssignment"> | string | null
    scope?: StringFilter<"PolicyPackAssignment"> | string
    policyPackId?: StringFilter<"PolicyPackAssignment"> | string
    enabled?: BoolFilter<"PolicyPackAssignment"> | boolean
    createdAt?: DateTimeFilter<"PolicyPackAssignment"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    repository?: XOR<RepositoryNullableScalarRelationFilter, RepositoryWhereInput> | null
    policyPack?: XOR<PolicyPackScalarRelationFilter, PolicyPackWhereInput>
  }, "id">

  export type PolicyPackAssignmentOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrderInput | SortOrder
    scope?: SortOrder
    policyPackId?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    _count?: PolicyPackAssignmentCountOrderByAggregateInput
    _max?: PolicyPackAssignmentMaxOrderByAggregateInput
    _min?: PolicyPackAssignmentMinOrderByAggregateInput
  }

  export type PolicyPackAssignmentScalarWhereWithAggregatesInput = {
    AND?: PolicyPackAssignmentScalarWhereWithAggregatesInput | PolicyPackAssignmentScalarWhereWithAggregatesInput[]
    OR?: PolicyPackAssignmentScalarWhereWithAggregatesInput[]
    NOT?: PolicyPackAssignmentScalarWhereWithAggregatesInput | PolicyPackAssignmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PolicyPackAssignment"> | string
    organizationId?: StringWithAggregatesFilter<"PolicyPackAssignment"> | string
    repositoryId?: StringNullableWithAggregatesFilter<"PolicyPackAssignment"> | string | null
    scope?: StringWithAggregatesFilter<"PolicyPackAssignment"> | string
    policyPackId?: StringWithAggregatesFilter<"PolicyPackAssignment"> | string
    enabled?: BoolWithAggregatesFilter<"PolicyPackAssignment"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"PolicyPackAssignment"> | Date | string
  }

  export type WebhookReceiptWhereInput = {
    AND?: WebhookReceiptWhereInput | WebhookReceiptWhereInput[]
    OR?: WebhookReceiptWhereInput[]
    NOT?: WebhookReceiptWhereInput | WebhookReceiptWhereInput[]
    id?: StringFilter<"WebhookReceipt"> | string
    organizationId?: StringFilter<"WebhookReceipt"> | string
    provider?: StringFilter<"WebhookReceipt"> | string
    deliveryId?: StringFilter<"WebhookReceipt"> | string
    receivedAt?: DateTimeFilter<"WebhookReceipt"> | Date | string
    bodyHash?: StringFilter<"WebhookReceipt"> | string
    signatureValid?: BoolFilter<"WebhookReceipt"> | boolean
    replayBlocked?: BoolFilter<"WebhookReceipt"> | boolean
    processed?: BoolFilter<"WebhookReceipt"> | boolean
    correlationId?: StringNullableFilter<"WebhookReceipt"> | string | null
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }

  export type WebhookReceiptOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    provider?: SortOrder
    deliveryId?: SortOrder
    receivedAt?: SortOrder
    bodyHash?: SortOrder
    signatureValid?: SortOrder
    replayBlocked?: SortOrder
    processed?: SortOrder
    correlationId?: SortOrderInput | SortOrder
    organization?: OrganizationOrderByWithRelationInput
  }

  export type WebhookReceiptWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    organizationId_provider_deliveryId?: WebhookReceiptOrganizationIdProviderDeliveryIdCompoundUniqueInput
    AND?: WebhookReceiptWhereInput | WebhookReceiptWhereInput[]
    OR?: WebhookReceiptWhereInput[]
    NOT?: WebhookReceiptWhereInput | WebhookReceiptWhereInput[]
    organizationId?: StringFilter<"WebhookReceipt"> | string
    provider?: StringFilter<"WebhookReceipt"> | string
    deliveryId?: StringFilter<"WebhookReceipt"> | string
    receivedAt?: DateTimeFilter<"WebhookReceipt"> | Date | string
    bodyHash?: StringFilter<"WebhookReceipt"> | string
    signatureValid?: BoolFilter<"WebhookReceipt"> | boolean
    replayBlocked?: BoolFilter<"WebhookReceipt"> | boolean
    processed?: BoolFilter<"WebhookReceipt"> | boolean
    correlationId?: StringNullableFilter<"WebhookReceipt"> | string | null
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }, "id" | "organizationId_provider_deliveryId">

  export type WebhookReceiptOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    provider?: SortOrder
    deliveryId?: SortOrder
    receivedAt?: SortOrder
    bodyHash?: SortOrder
    signatureValid?: SortOrder
    replayBlocked?: SortOrder
    processed?: SortOrder
    correlationId?: SortOrderInput | SortOrder
    _count?: WebhookReceiptCountOrderByAggregateInput
    _max?: WebhookReceiptMaxOrderByAggregateInput
    _min?: WebhookReceiptMinOrderByAggregateInput
  }

  export type WebhookReceiptScalarWhereWithAggregatesInput = {
    AND?: WebhookReceiptScalarWhereWithAggregatesInput | WebhookReceiptScalarWhereWithAggregatesInput[]
    OR?: WebhookReceiptScalarWhereWithAggregatesInput[]
    NOT?: WebhookReceiptScalarWhereWithAggregatesInput | WebhookReceiptScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WebhookReceipt"> | string
    organizationId?: StringWithAggregatesFilter<"WebhookReceipt"> | string
    provider?: StringWithAggregatesFilter<"WebhookReceipt"> | string
    deliveryId?: StringWithAggregatesFilter<"WebhookReceipt"> | string
    receivedAt?: DateTimeWithAggregatesFilter<"WebhookReceipt"> | Date | string
    bodyHash?: StringWithAggregatesFilter<"WebhookReceipt"> | string
    signatureValid?: BoolWithAggregatesFilter<"WebhookReceipt"> | boolean
    replayBlocked?: BoolWithAggregatesFilter<"WebhookReceipt"> | boolean
    processed?: BoolWithAggregatesFilter<"WebhookReceipt"> | boolean
    correlationId?: StringNullableWithAggregatesFilter<"WebhookReceipt"> | string | null
  }

  export type DeadLetterJobWhereInput = {
    AND?: DeadLetterJobWhereInput | DeadLetterJobWhereInput[]
    OR?: DeadLetterJobWhereInput[]
    NOT?: DeadLetterJobWhereInput | DeadLetterJobWhereInput[]
    id?: StringFilter<"DeadLetterJob"> | string
    jobId?: StringFilter<"DeadLetterJob"> | string
    jobType?: StringFilter<"DeadLetterJob"> | string
    payloadJson?: StringFilter<"DeadLetterJob"> | string
    errorCode?: StringFilter<"DeadLetterJob"> | string
    failureClass?: StringFilter<"DeadLetterJob"> | string
    errorMessage?: StringFilter<"DeadLetterJob"> | string
    attempts?: IntFilter<"DeadLetterJob"> | number
    createdAt?: DateTimeFilter<"DeadLetterJob"> | Date | string
    lastFailedAt?: DateTimeFilter<"DeadLetterJob"> | Date | string
  }

  export type DeadLetterJobOrderByWithRelationInput = {
    id?: SortOrder
    jobId?: SortOrder
    jobType?: SortOrder
    payloadJson?: SortOrder
    errorCode?: SortOrder
    failureClass?: SortOrder
    errorMessage?: SortOrder
    attempts?: SortOrder
    createdAt?: SortOrder
    lastFailedAt?: SortOrder
  }

  export type DeadLetterJobWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DeadLetterJobWhereInput | DeadLetterJobWhereInput[]
    OR?: DeadLetterJobWhereInput[]
    NOT?: DeadLetterJobWhereInput | DeadLetterJobWhereInput[]
    jobId?: StringFilter<"DeadLetterJob"> | string
    jobType?: StringFilter<"DeadLetterJob"> | string
    payloadJson?: StringFilter<"DeadLetterJob"> | string
    errorCode?: StringFilter<"DeadLetterJob"> | string
    failureClass?: StringFilter<"DeadLetterJob"> | string
    errorMessage?: StringFilter<"DeadLetterJob"> | string
    attempts?: IntFilter<"DeadLetterJob"> | number
    createdAt?: DateTimeFilter<"DeadLetterJob"> | Date | string
    lastFailedAt?: DateTimeFilter<"DeadLetterJob"> | Date | string
  }, "id">

  export type DeadLetterJobOrderByWithAggregationInput = {
    id?: SortOrder
    jobId?: SortOrder
    jobType?: SortOrder
    payloadJson?: SortOrder
    errorCode?: SortOrder
    failureClass?: SortOrder
    errorMessage?: SortOrder
    attempts?: SortOrder
    createdAt?: SortOrder
    lastFailedAt?: SortOrder
    _count?: DeadLetterJobCountOrderByAggregateInput
    _avg?: DeadLetterJobAvgOrderByAggregateInput
    _max?: DeadLetterJobMaxOrderByAggregateInput
    _min?: DeadLetterJobMinOrderByAggregateInput
    _sum?: DeadLetterJobSumOrderByAggregateInput
  }

  export type DeadLetterJobScalarWhereWithAggregatesInput = {
    AND?: DeadLetterJobScalarWhereWithAggregatesInput | DeadLetterJobScalarWhereWithAggregatesInput[]
    OR?: DeadLetterJobScalarWhereWithAggregatesInput[]
    NOT?: DeadLetterJobScalarWhereWithAggregatesInput | DeadLetterJobScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DeadLetterJob"> | string
    jobId?: StringWithAggregatesFilter<"DeadLetterJob"> | string
    jobType?: StringWithAggregatesFilter<"DeadLetterJob"> | string
    payloadJson?: StringWithAggregatesFilter<"DeadLetterJob"> | string
    errorCode?: StringWithAggregatesFilter<"DeadLetterJob"> | string
    failureClass?: StringWithAggregatesFilter<"DeadLetterJob"> | string
    errorMessage?: StringWithAggregatesFilter<"DeadLetterJob"> | string
    attempts?: IntWithAggregatesFilter<"DeadLetterJob"> | number
    createdAt?: DateTimeWithAggregatesFilter<"DeadLetterJob"> | Date | string
    lastFailedAt?: DateTimeWithAggregatesFilter<"DeadLetterJob"> | Date | string
  }

  export type OrganizationCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryCreateNestedManyWithoutOrganizationInput
    runs?: ReadyLayerRunCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryUncheckedCreateNestedManyWithoutOrganizationInput
    runs?: ReadyLayerRunUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectUncheckedCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackUncheckedCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUpdateManyWithoutOrganizationNestedInput
    runs?: ReadyLayerRunUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUncheckedUpdateManyWithoutOrganizationNestedInput
    runs?: ReadyLayerRunUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUncheckedUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUncheckedUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationCreateManyInput = {
    id?: string
    name: string
    createdAt?: Date | string
  }

  export type OrganizationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RepositoryCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutRepositoriesInput
    projects?: ProjectCreateNestedManyWithoutRepositoryInput
    runs?: ReadyLayerRunCreateNestedManyWithoutRepositoryInput
    evidenceAttestations?: EvidenceAttestationCreateNestedManyWithoutRepositoryInput
    policyAssignments?: PolicyPackAssignmentCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUncheckedCreateInput = {
    id?: string
    organizationId: string
    name: string
    createdAt?: Date | string
    projects?: ProjectUncheckedCreateNestedManyWithoutRepositoryInput
    runs?: ReadyLayerRunUncheckedCreateNestedManyWithoutRepositoryInput
    evidenceAttestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutRepositoryInput
    policyAssignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutRepositoriesNestedInput
    projects?: ProjectUpdateManyWithoutRepositoryNestedInput
    runs?: ReadyLayerRunUpdateManyWithoutRepositoryNestedInput
    evidenceAttestations?: EvidenceAttestationUpdateManyWithoutRepositoryNestedInput
    policyAssignments?: PolicyPackAssignmentUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    projects?: ProjectUncheckedUpdateManyWithoutRepositoryNestedInput
    runs?: ReadyLayerRunUncheckedUpdateManyWithoutRepositoryNestedInput
    evidenceAttestations?: EvidenceAttestationUncheckedUpdateManyWithoutRepositoryNestedInput
    policyAssignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryCreateManyInput = {
    id?: string
    organizationId: string
    name: string
    createdAt?: Date | string
  }

  export type RepositoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RepositoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProjectCreateInput = {
    id?: string
    name: string
    repository: RepositoryCreateNestedOneWithoutProjectsInput
  }

  export type ProjectUncheckedCreateInput = {
    id?: string
    repositoryId: string
    name: string
  }

  export type ProjectUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    repository?: RepositoryUpdateOneRequiredWithoutProjectsNestedInput
  }

  export type ProjectUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ProjectCreateManyInput = {
    id?: string
    repositoryId: string
    name: string
  }

  export type ProjectUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ProjectUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ReadyLayerRunCreateInput = {
    id?: string
    status: string
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutRunsInput
    repository: RepositoryCreateNestedOneWithoutRunsInput
    attestations?: EvidenceAttestationCreateNestedManyWithoutRunInput
  }

  export type ReadyLayerRunUncheckedCreateInput = {
    id?: string
    organizationId: string
    repositoryId: string
    status: string
    createdAt?: Date | string
    attestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutRunInput
  }

  export type ReadyLayerRunUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutRunsNestedInput
    repository?: RepositoryUpdateOneRequiredWithoutRunsNestedInput
    attestations?: EvidenceAttestationUpdateManyWithoutRunNestedInput
  }

  export type ReadyLayerRunUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attestations?: EvidenceAttestationUncheckedUpdateManyWithoutRunNestedInput
  }

  export type ReadyLayerRunCreateManyInput = {
    id?: string
    organizationId: string
    repositoryId: string
    status: string
    createdAt?: Date | string
  }

  export type ReadyLayerRunUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReadyLayerRunUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceAttestationCreateInput = {
    id?: string
    manifestHash: string
    bundleHash: string
    treeHash: string
    signingMode: string
    signature?: string | null
    publicKeyId?: string | null
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutEvidenceAttestationsInput
    repository: RepositoryCreateNestedOneWithoutEvidenceAttestationsInput
    run: ReadyLayerRunCreateNestedOneWithoutAttestationsInput
  }

  export type EvidenceAttestationUncheckedCreateInput = {
    id?: string
    organizationId: string
    repositoryId: string
    runId: string
    manifestHash: string
    bundleHash: string
    treeHash: string
    signingMode: string
    signature?: string | null
    publicKeyId?: string | null
    createdAt?: Date | string
  }

  export type EvidenceAttestationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    manifestHash?: StringFieldUpdateOperationsInput | string
    bundleHash?: StringFieldUpdateOperationsInput | string
    treeHash?: StringFieldUpdateOperationsInput | string
    signingMode?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    publicKeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutEvidenceAttestationsNestedInput
    repository?: RepositoryUpdateOneRequiredWithoutEvidenceAttestationsNestedInput
    run?: ReadyLayerRunUpdateOneRequiredWithoutAttestationsNestedInput
  }

  export type EvidenceAttestationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    runId?: StringFieldUpdateOperationsInput | string
    manifestHash?: StringFieldUpdateOperationsInput | string
    bundleHash?: StringFieldUpdateOperationsInput | string
    treeHash?: StringFieldUpdateOperationsInput | string
    signingMode?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    publicKeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceAttestationCreateManyInput = {
    id?: string
    organizationId: string
    repositoryId: string
    runId: string
    manifestHash: string
    bundleHash: string
    treeHash: string
    signingMode: string
    signature?: string | null
    publicKeyId?: string | null
    createdAt?: Date | string
  }

  export type EvidenceAttestationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    manifestHash?: StringFieldUpdateOperationsInput | string
    bundleHash?: StringFieldUpdateOperationsInput | string
    treeHash?: StringFieldUpdateOperationsInput | string
    signingMode?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    publicKeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceAttestationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    runId?: StringFieldUpdateOperationsInput | string
    manifestHash?: StringFieldUpdateOperationsInput | string
    bundleHash?: StringFieldUpdateOperationsInput | string
    treeHash?: StringFieldUpdateOperationsInput | string
    signingMode?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    publicKeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceObjectCreateInput = {
    id?: string
    runId?: string | null
    kind: string
    storageProvider: string
    storageKey: string
    sizeBytes: number
    contentHash: string
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutEvidenceObjectsInput
  }

  export type EvidenceObjectUncheckedCreateInput = {
    id?: string
    organizationId: string
    runId?: string | null
    kind: string
    storageProvider: string
    storageKey: string
    sizeBytes: number
    contentHash: string
    createdAt?: Date | string
  }

  export type EvidenceObjectUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    runId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: StringFieldUpdateOperationsInput | string
    storageProvider?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    contentHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutEvidenceObjectsNestedInput
  }

  export type EvidenceObjectUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    runId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: StringFieldUpdateOperationsInput | string
    storageProvider?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    contentHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceObjectCreateManyInput = {
    id?: string
    organizationId: string
    runId?: string | null
    kind: string
    storageProvider: string
    storageKey: string
    sizeBytes: number
    contentHash: string
    createdAt?: Date | string
  }

  export type EvidenceObjectUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    runId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: StringFieldUpdateOperationsInput | string
    storageProvider?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    contentHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceObjectUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    runId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: StringFieldUpdateOperationsInput | string
    storageProvider?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    contentHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyPackCreateInput = {
    id?: string
    name: string
    version: string
    description?: string | null
    contentsJson: string
    packHash: string
    signature?: string | null
    signingMode: string
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutPolicyPacksInput
    assignments?: PolicyPackAssignmentCreateNestedManyWithoutPolicyPackInput
  }

  export type PolicyPackUncheckedCreateInput = {
    id?: string
    organizationId: string
    name: string
    version: string
    description?: string | null
    contentsJson: string
    packHash: string
    signature?: string | null
    signingMode: string
    createdAt?: Date | string
    assignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutPolicyPackInput
  }

  export type PolicyPackUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    contentsJson?: StringFieldUpdateOperationsInput | string
    packHash?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    signingMode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutPolicyPacksNestedInput
    assignments?: PolicyPackAssignmentUpdateManyWithoutPolicyPackNestedInput
  }

  export type PolicyPackUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    contentsJson?: StringFieldUpdateOperationsInput | string
    packHash?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    signingMode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutPolicyPackNestedInput
  }

  export type PolicyPackCreateManyInput = {
    id?: string
    organizationId: string
    name: string
    version: string
    description?: string | null
    contentsJson: string
    packHash: string
    signature?: string | null
    signingMode: string
    createdAt?: Date | string
  }

  export type PolicyPackUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    contentsJson?: StringFieldUpdateOperationsInput | string
    packHash?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    signingMode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyPackUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    contentsJson?: StringFieldUpdateOperationsInput | string
    packHash?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    signingMode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyPackAssignmentCreateInput = {
    id?: string
    scope: string
    enabled: boolean
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutPolicyAssignmentsInput
    repository?: RepositoryCreateNestedOneWithoutPolicyAssignmentsInput
    policyPack: PolicyPackCreateNestedOneWithoutAssignmentsInput
  }

  export type PolicyPackAssignmentUncheckedCreateInput = {
    id?: string
    organizationId: string
    repositoryId?: string | null
    scope: string
    policyPackId: string
    enabled: boolean
    createdAt?: Date | string
  }

  export type PolicyPackAssignmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    scope?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutPolicyAssignmentsNestedInput
    repository?: RepositoryUpdateOneWithoutPolicyAssignmentsNestedInput
    policyPack?: PolicyPackUpdateOneRequiredWithoutAssignmentsNestedInput
  }

  export type PolicyPackAssignmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    repositoryId?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: StringFieldUpdateOperationsInput | string
    policyPackId?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyPackAssignmentCreateManyInput = {
    id?: string
    organizationId: string
    repositoryId?: string | null
    scope: string
    policyPackId: string
    enabled: boolean
    createdAt?: Date | string
  }

  export type PolicyPackAssignmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    scope?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyPackAssignmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    repositoryId?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: StringFieldUpdateOperationsInput | string
    policyPackId?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebhookReceiptCreateInput = {
    id?: string
    provider: string
    deliveryId: string
    receivedAt?: Date | string
    bodyHash: string
    signatureValid: boolean
    replayBlocked: boolean
    processed: boolean
    correlationId?: string | null
    organization: OrganizationCreateNestedOneWithoutWebhookReceiptsInput
  }

  export type WebhookReceiptUncheckedCreateInput = {
    id?: string
    organizationId: string
    provider: string
    deliveryId: string
    receivedAt?: Date | string
    bodyHash: string
    signatureValid: boolean
    replayBlocked: boolean
    processed: boolean
    correlationId?: string | null
  }

  export type WebhookReceiptUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    deliveryId?: StringFieldUpdateOperationsInput | string
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bodyHash?: StringFieldUpdateOperationsInput | string
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    replayBlocked?: BoolFieldUpdateOperationsInput | boolean
    processed?: BoolFieldUpdateOperationsInput | boolean
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
    organization?: OrganizationUpdateOneRequiredWithoutWebhookReceiptsNestedInput
  }

  export type WebhookReceiptUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    deliveryId?: StringFieldUpdateOperationsInput | string
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bodyHash?: StringFieldUpdateOperationsInput | string
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    replayBlocked?: BoolFieldUpdateOperationsInput | boolean
    processed?: BoolFieldUpdateOperationsInput | boolean
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WebhookReceiptCreateManyInput = {
    id?: string
    organizationId: string
    provider: string
    deliveryId: string
    receivedAt?: Date | string
    bodyHash: string
    signatureValid: boolean
    replayBlocked: boolean
    processed: boolean
    correlationId?: string | null
  }

  export type WebhookReceiptUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    deliveryId?: StringFieldUpdateOperationsInput | string
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bodyHash?: StringFieldUpdateOperationsInput | string
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    replayBlocked?: BoolFieldUpdateOperationsInput | boolean
    processed?: BoolFieldUpdateOperationsInput | boolean
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WebhookReceiptUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    deliveryId?: StringFieldUpdateOperationsInput | string
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bodyHash?: StringFieldUpdateOperationsInput | string
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    replayBlocked?: BoolFieldUpdateOperationsInput | boolean
    processed?: BoolFieldUpdateOperationsInput | boolean
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DeadLetterJobCreateInput = {
    id?: string
    jobId: string
    jobType: string
    payloadJson: string
    errorCode: string
    failureClass: string
    errorMessage: string
    attempts: number
    createdAt?: Date | string
    lastFailedAt: Date | string
  }

  export type DeadLetterJobUncheckedCreateInput = {
    id?: string
    jobId: string
    jobType: string
    payloadJson: string
    errorCode: string
    failureClass: string
    errorMessage: string
    attempts: number
    createdAt?: Date | string
    lastFailedAt: Date | string
  }

  export type DeadLetterJobUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    payloadJson?: StringFieldUpdateOperationsInput | string
    errorCode?: StringFieldUpdateOperationsInput | string
    failureClass?: StringFieldUpdateOperationsInput | string
    errorMessage?: StringFieldUpdateOperationsInput | string
    attempts?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastFailedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeadLetterJobUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    payloadJson?: StringFieldUpdateOperationsInput | string
    errorCode?: StringFieldUpdateOperationsInput | string
    failureClass?: StringFieldUpdateOperationsInput | string
    errorMessage?: StringFieldUpdateOperationsInput | string
    attempts?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastFailedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeadLetterJobCreateManyInput = {
    id?: string
    jobId: string
    jobType: string
    payloadJson: string
    errorCode: string
    failureClass: string
    errorMessage: string
    attempts: number
    createdAt?: Date | string
    lastFailedAt: Date | string
  }

  export type DeadLetterJobUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    payloadJson?: StringFieldUpdateOperationsInput | string
    errorCode?: StringFieldUpdateOperationsInput | string
    failureClass?: StringFieldUpdateOperationsInput | string
    errorMessage?: StringFieldUpdateOperationsInput | string
    attempts?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastFailedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeadLetterJobUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    payloadJson?: StringFieldUpdateOperationsInput | string
    errorCode?: StringFieldUpdateOperationsInput | string
    failureClass?: StringFieldUpdateOperationsInput | string
    errorMessage?: StringFieldUpdateOperationsInput | string
    attempts?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastFailedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type RepositoryListRelationFilter = {
    every?: RepositoryWhereInput
    some?: RepositoryWhereInput
    none?: RepositoryWhereInput
  }

  export type ReadyLayerRunListRelationFilter = {
    every?: ReadyLayerRunWhereInput
    some?: ReadyLayerRunWhereInput
    none?: ReadyLayerRunWhereInput
  }

  export type EvidenceAttestationListRelationFilter = {
    every?: EvidenceAttestationWhereInput
    some?: EvidenceAttestationWhereInput
    none?: EvidenceAttestationWhereInput
  }

  export type EvidenceObjectListRelationFilter = {
    every?: EvidenceObjectWhereInput
    some?: EvidenceObjectWhereInput
    none?: EvidenceObjectWhereInput
  }

  export type PolicyPackListRelationFilter = {
    every?: PolicyPackWhereInput
    some?: PolicyPackWhereInput
    none?: PolicyPackWhereInput
  }

  export type PolicyPackAssignmentListRelationFilter = {
    every?: PolicyPackAssignmentWhereInput
    some?: PolicyPackAssignmentWhereInput
    none?: PolicyPackAssignmentWhereInput
  }

  export type WebhookReceiptListRelationFilter = {
    every?: WebhookReceiptWhereInput
    some?: WebhookReceiptWhereInput
    none?: WebhookReceiptWhereInput
  }

  export type RepositoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReadyLayerRunOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EvidenceAttestationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EvidenceObjectOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PolicyPackOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PolicyPackAssignmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WebhookReceiptOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrganizationCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type OrganizationMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type OrganizationMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type OrganizationScalarRelationFilter = {
    is?: OrganizationWhereInput
    isNot?: OrganizationWhereInput
  }

  export type ProjectListRelationFilter = {
    every?: ProjectWhereInput
    some?: ProjectWhereInput
    none?: ProjectWhereInput
  }

  export type ProjectOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RepositoryCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type RepositoryMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type RepositoryMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type RepositoryScalarRelationFilter = {
    is?: RepositoryWhereInput
    isNot?: RepositoryWhereInput
  }

  export type ProjectCountOrderByAggregateInput = {
    id?: SortOrder
    repositoryId?: SortOrder
    name?: SortOrder
  }

  export type ProjectMaxOrderByAggregateInput = {
    id?: SortOrder
    repositoryId?: SortOrder
    name?: SortOrder
  }

  export type ProjectMinOrderByAggregateInput = {
    id?: SortOrder
    repositoryId?: SortOrder
    name?: SortOrder
  }

  export type ReadyLayerRunCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type ReadyLayerRunMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type ReadyLayerRunMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type ReadyLayerRunScalarRelationFilter = {
    is?: ReadyLayerRunWhereInput
    isNot?: ReadyLayerRunWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type EvidenceAttestationCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrder
    runId?: SortOrder
    manifestHash?: SortOrder
    bundleHash?: SortOrder
    treeHash?: SortOrder
    signingMode?: SortOrder
    signature?: SortOrder
    publicKeyId?: SortOrder
    createdAt?: SortOrder
  }

  export type EvidenceAttestationMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrder
    runId?: SortOrder
    manifestHash?: SortOrder
    bundleHash?: SortOrder
    treeHash?: SortOrder
    signingMode?: SortOrder
    signature?: SortOrder
    publicKeyId?: SortOrder
    createdAt?: SortOrder
  }

  export type EvidenceAttestationMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrder
    runId?: SortOrder
    manifestHash?: SortOrder
    bundleHash?: SortOrder
    treeHash?: SortOrder
    signingMode?: SortOrder
    signature?: SortOrder
    publicKeyId?: SortOrder
    createdAt?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EvidenceObjectCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    runId?: SortOrder
    kind?: SortOrder
    storageProvider?: SortOrder
    storageKey?: SortOrder
    sizeBytes?: SortOrder
    contentHash?: SortOrder
    createdAt?: SortOrder
  }

  export type EvidenceObjectAvgOrderByAggregateInput = {
    sizeBytes?: SortOrder
  }

  export type EvidenceObjectMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    runId?: SortOrder
    kind?: SortOrder
    storageProvider?: SortOrder
    storageKey?: SortOrder
    sizeBytes?: SortOrder
    contentHash?: SortOrder
    createdAt?: SortOrder
  }

  export type EvidenceObjectMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    runId?: SortOrder
    kind?: SortOrder
    storageProvider?: SortOrder
    storageKey?: SortOrder
    sizeBytes?: SortOrder
    contentHash?: SortOrder
    createdAt?: SortOrder
  }

  export type EvidenceObjectSumOrderByAggregateInput = {
    sizeBytes?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type PolicyPackOrganizationIdNameVersionCompoundUniqueInput = {
    organizationId: string
    name: string
    version: string
  }

  export type PolicyPackCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    version?: SortOrder
    description?: SortOrder
    contentsJson?: SortOrder
    packHash?: SortOrder
    signature?: SortOrder
    signingMode?: SortOrder
    createdAt?: SortOrder
  }

  export type PolicyPackMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    version?: SortOrder
    description?: SortOrder
    contentsJson?: SortOrder
    packHash?: SortOrder
    signature?: SortOrder
    signingMode?: SortOrder
    createdAt?: SortOrder
  }

  export type PolicyPackMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    version?: SortOrder
    description?: SortOrder
    contentsJson?: SortOrder
    packHash?: SortOrder
    signature?: SortOrder
    signingMode?: SortOrder
    createdAt?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type RepositoryNullableScalarRelationFilter = {
    is?: RepositoryWhereInput | null
    isNot?: RepositoryWhereInput | null
  }

  export type PolicyPackScalarRelationFilter = {
    is?: PolicyPackWhereInput
    isNot?: PolicyPackWhereInput
  }

  export type PolicyPackAssignmentCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrder
    scope?: SortOrder
    policyPackId?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
  }

  export type PolicyPackAssignmentMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrder
    scope?: SortOrder
    policyPackId?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
  }

  export type PolicyPackAssignmentMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    repositoryId?: SortOrder
    scope?: SortOrder
    policyPackId?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type WebhookReceiptOrganizationIdProviderDeliveryIdCompoundUniqueInput = {
    organizationId: string
    provider: string
    deliveryId: string
  }

  export type WebhookReceiptCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    provider?: SortOrder
    deliveryId?: SortOrder
    receivedAt?: SortOrder
    bodyHash?: SortOrder
    signatureValid?: SortOrder
    replayBlocked?: SortOrder
    processed?: SortOrder
    correlationId?: SortOrder
  }

  export type WebhookReceiptMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    provider?: SortOrder
    deliveryId?: SortOrder
    receivedAt?: SortOrder
    bodyHash?: SortOrder
    signatureValid?: SortOrder
    replayBlocked?: SortOrder
    processed?: SortOrder
    correlationId?: SortOrder
  }

  export type WebhookReceiptMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    provider?: SortOrder
    deliveryId?: SortOrder
    receivedAt?: SortOrder
    bodyHash?: SortOrder
    signatureValid?: SortOrder
    replayBlocked?: SortOrder
    processed?: SortOrder
    correlationId?: SortOrder
  }

  export type DeadLetterJobCountOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    jobType?: SortOrder
    payloadJson?: SortOrder
    errorCode?: SortOrder
    failureClass?: SortOrder
    errorMessage?: SortOrder
    attempts?: SortOrder
    createdAt?: SortOrder
    lastFailedAt?: SortOrder
  }

  export type DeadLetterJobAvgOrderByAggregateInput = {
    attempts?: SortOrder
  }

  export type DeadLetterJobMaxOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    jobType?: SortOrder
    payloadJson?: SortOrder
    errorCode?: SortOrder
    failureClass?: SortOrder
    errorMessage?: SortOrder
    attempts?: SortOrder
    createdAt?: SortOrder
    lastFailedAt?: SortOrder
  }

  export type DeadLetterJobMinOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    jobType?: SortOrder
    payloadJson?: SortOrder
    errorCode?: SortOrder
    failureClass?: SortOrder
    errorMessage?: SortOrder
    attempts?: SortOrder
    createdAt?: SortOrder
    lastFailedAt?: SortOrder
  }

  export type DeadLetterJobSumOrderByAggregateInput = {
    attempts?: SortOrder
  }

  export type RepositoryCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<RepositoryCreateWithoutOrganizationInput, RepositoryUncheckedCreateWithoutOrganizationInput> | RepositoryCreateWithoutOrganizationInput[] | RepositoryUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: RepositoryCreateOrConnectWithoutOrganizationInput | RepositoryCreateOrConnectWithoutOrganizationInput[]
    createMany?: RepositoryCreateManyOrganizationInputEnvelope
    connect?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
  }

  export type ReadyLayerRunCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<ReadyLayerRunCreateWithoutOrganizationInput, ReadyLayerRunUncheckedCreateWithoutOrganizationInput> | ReadyLayerRunCreateWithoutOrganizationInput[] | ReadyLayerRunUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: ReadyLayerRunCreateOrConnectWithoutOrganizationInput | ReadyLayerRunCreateOrConnectWithoutOrganizationInput[]
    createMany?: ReadyLayerRunCreateManyOrganizationInputEnvelope
    connect?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
  }

  export type EvidenceAttestationCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<EvidenceAttestationCreateWithoutOrganizationInput, EvidenceAttestationUncheckedCreateWithoutOrganizationInput> | EvidenceAttestationCreateWithoutOrganizationInput[] | EvidenceAttestationUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: EvidenceAttestationCreateOrConnectWithoutOrganizationInput | EvidenceAttestationCreateOrConnectWithoutOrganizationInput[]
    createMany?: EvidenceAttestationCreateManyOrganizationInputEnvelope
    connect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
  }

  export type EvidenceObjectCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<EvidenceObjectCreateWithoutOrganizationInput, EvidenceObjectUncheckedCreateWithoutOrganizationInput> | EvidenceObjectCreateWithoutOrganizationInput[] | EvidenceObjectUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: EvidenceObjectCreateOrConnectWithoutOrganizationInput | EvidenceObjectCreateOrConnectWithoutOrganizationInput[]
    createMany?: EvidenceObjectCreateManyOrganizationInputEnvelope
    connect?: EvidenceObjectWhereUniqueInput | EvidenceObjectWhereUniqueInput[]
  }

  export type PolicyPackCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<PolicyPackCreateWithoutOrganizationInput, PolicyPackUncheckedCreateWithoutOrganizationInput> | PolicyPackCreateWithoutOrganizationInput[] | PolicyPackUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: PolicyPackCreateOrConnectWithoutOrganizationInput | PolicyPackCreateOrConnectWithoutOrganizationInput[]
    createMany?: PolicyPackCreateManyOrganizationInputEnvelope
    connect?: PolicyPackWhereUniqueInput | PolicyPackWhereUniqueInput[]
  }

  export type PolicyPackAssignmentCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<PolicyPackAssignmentCreateWithoutOrganizationInput, PolicyPackAssignmentUncheckedCreateWithoutOrganizationInput> | PolicyPackAssignmentCreateWithoutOrganizationInput[] | PolicyPackAssignmentUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: PolicyPackAssignmentCreateOrConnectWithoutOrganizationInput | PolicyPackAssignmentCreateOrConnectWithoutOrganizationInput[]
    createMany?: PolicyPackAssignmentCreateManyOrganizationInputEnvelope
    connect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
  }

  export type WebhookReceiptCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<WebhookReceiptCreateWithoutOrganizationInput, WebhookReceiptUncheckedCreateWithoutOrganizationInput> | WebhookReceiptCreateWithoutOrganizationInput[] | WebhookReceiptUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: WebhookReceiptCreateOrConnectWithoutOrganizationInput | WebhookReceiptCreateOrConnectWithoutOrganizationInput[]
    createMany?: WebhookReceiptCreateManyOrganizationInputEnvelope
    connect?: WebhookReceiptWhereUniqueInput | WebhookReceiptWhereUniqueInput[]
  }

  export type RepositoryUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<RepositoryCreateWithoutOrganizationInput, RepositoryUncheckedCreateWithoutOrganizationInput> | RepositoryCreateWithoutOrganizationInput[] | RepositoryUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: RepositoryCreateOrConnectWithoutOrganizationInput | RepositoryCreateOrConnectWithoutOrganizationInput[]
    createMany?: RepositoryCreateManyOrganizationInputEnvelope
    connect?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
  }

  export type ReadyLayerRunUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<ReadyLayerRunCreateWithoutOrganizationInput, ReadyLayerRunUncheckedCreateWithoutOrganizationInput> | ReadyLayerRunCreateWithoutOrganizationInput[] | ReadyLayerRunUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: ReadyLayerRunCreateOrConnectWithoutOrganizationInput | ReadyLayerRunCreateOrConnectWithoutOrganizationInput[]
    createMany?: ReadyLayerRunCreateManyOrganizationInputEnvelope
    connect?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
  }

  export type EvidenceAttestationUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<EvidenceAttestationCreateWithoutOrganizationInput, EvidenceAttestationUncheckedCreateWithoutOrganizationInput> | EvidenceAttestationCreateWithoutOrganizationInput[] | EvidenceAttestationUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: EvidenceAttestationCreateOrConnectWithoutOrganizationInput | EvidenceAttestationCreateOrConnectWithoutOrganizationInput[]
    createMany?: EvidenceAttestationCreateManyOrganizationInputEnvelope
    connect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
  }

  export type EvidenceObjectUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<EvidenceObjectCreateWithoutOrganizationInput, EvidenceObjectUncheckedCreateWithoutOrganizationInput> | EvidenceObjectCreateWithoutOrganizationInput[] | EvidenceObjectUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: EvidenceObjectCreateOrConnectWithoutOrganizationInput | EvidenceObjectCreateOrConnectWithoutOrganizationInput[]
    createMany?: EvidenceObjectCreateManyOrganizationInputEnvelope
    connect?: EvidenceObjectWhereUniqueInput | EvidenceObjectWhereUniqueInput[]
  }

  export type PolicyPackUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<PolicyPackCreateWithoutOrganizationInput, PolicyPackUncheckedCreateWithoutOrganizationInput> | PolicyPackCreateWithoutOrganizationInput[] | PolicyPackUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: PolicyPackCreateOrConnectWithoutOrganizationInput | PolicyPackCreateOrConnectWithoutOrganizationInput[]
    createMany?: PolicyPackCreateManyOrganizationInputEnvelope
    connect?: PolicyPackWhereUniqueInput | PolicyPackWhereUniqueInput[]
  }

  export type PolicyPackAssignmentUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<PolicyPackAssignmentCreateWithoutOrganizationInput, PolicyPackAssignmentUncheckedCreateWithoutOrganizationInput> | PolicyPackAssignmentCreateWithoutOrganizationInput[] | PolicyPackAssignmentUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: PolicyPackAssignmentCreateOrConnectWithoutOrganizationInput | PolicyPackAssignmentCreateOrConnectWithoutOrganizationInput[]
    createMany?: PolicyPackAssignmentCreateManyOrganizationInputEnvelope
    connect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
  }

  export type WebhookReceiptUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<WebhookReceiptCreateWithoutOrganizationInput, WebhookReceiptUncheckedCreateWithoutOrganizationInput> | WebhookReceiptCreateWithoutOrganizationInput[] | WebhookReceiptUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: WebhookReceiptCreateOrConnectWithoutOrganizationInput | WebhookReceiptCreateOrConnectWithoutOrganizationInput[]
    createMany?: WebhookReceiptCreateManyOrganizationInputEnvelope
    connect?: WebhookReceiptWhereUniqueInput | WebhookReceiptWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type RepositoryUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<RepositoryCreateWithoutOrganizationInput, RepositoryUncheckedCreateWithoutOrganizationInput> | RepositoryCreateWithoutOrganizationInput[] | RepositoryUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: RepositoryCreateOrConnectWithoutOrganizationInput | RepositoryCreateOrConnectWithoutOrganizationInput[]
    upsert?: RepositoryUpsertWithWhereUniqueWithoutOrganizationInput | RepositoryUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: RepositoryCreateManyOrganizationInputEnvelope
    set?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    disconnect?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    delete?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    connect?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    update?: RepositoryUpdateWithWhereUniqueWithoutOrganizationInput | RepositoryUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: RepositoryUpdateManyWithWhereWithoutOrganizationInput | RepositoryUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: RepositoryScalarWhereInput | RepositoryScalarWhereInput[]
  }

  export type ReadyLayerRunUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<ReadyLayerRunCreateWithoutOrganizationInput, ReadyLayerRunUncheckedCreateWithoutOrganizationInput> | ReadyLayerRunCreateWithoutOrganizationInput[] | ReadyLayerRunUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: ReadyLayerRunCreateOrConnectWithoutOrganizationInput | ReadyLayerRunCreateOrConnectWithoutOrganizationInput[]
    upsert?: ReadyLayerRunUpsertWithWhereUniqueWithoutOrganizationInput | ReadyLayerRunUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: ReadyLayerRunCreateManyOrganizationInputEnvelope
    set?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    disconnect?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    delete?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    connect?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    update?: ReadyLayerRunUpdateWithWhereUniqueWithoutOrganizationInput | ReadyLayerRunUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: ReadyLayerRunUpdateManyWithWhereWithoutOrganizationInput | ReadyLayerRunUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: ReadyLayerRunScalarWhereInput | ReadyLayerRunScalarWhereInput[]
  }

  export type EvidenceAttestationUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<EvidenceAttestationCreateWithoutOrganizationInput, EvidenceAttestationUncheckedCreateWithoutOrganizationInput> | EvidenceAttestationCreateWithoutOrganizationInput[] | EvidenceAttestationUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: EvidenceAttestationCreateOrConnectWithoutOrganizationInput | EvidenceAttestationCreateOrConnectWithoutOrganizationInput[]
    upsert?: EvidenceAttestationUpsertWithWhereUniqueWithoutOrganizationInput | EvidenceAttestationUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: EvidenceAttestationCreateManyOrganizationInputEnvelope
    set?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    disconnect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    delete?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    connect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    update?: EvidenceAttestationUpdateWithWhereUniqueWithoutOrganizationInput | EvidenceAttestationUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: EvidenceAttestationUpdateManyWithWhereWithoutOrganizationInput | EvidenceAttestationUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: EvidenceAttestationScalarWhereInput | EvidenceAttestationScalarWhereInput[]
  }

  export type EvidenceObjectUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<EvidenceObjectCreateWithoutOrganizationInput, EvidenceObjectUncheckedCreateWithoutOrganizationInput> | EvidenceObjectCreateWithoutOrganizationInput[] | EvidenceObjectUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: EvidenceObjectCreateOrConnectWithoutOrganizationInput | EvidenceObjectCreateOrConnectWithoutOrganizationInput[]
    upsert?: EvidenceObjectUpsertWithWhereUniqueWithoutOrganizationInput | EvidenceObjectUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: EvidenceObjectCreateManyOrganizationInputEnvelope
    set?: EvidenceObjectWhereUniqueInput | EvidenceObjectWhereUniqueInput[]
    disconnect?: EvidenceObjectWhereUniqueInput | EvidenceObjectWhereUniqueInput[]
    delete?: EvidenceObjectWhereUniqueInput | EvidenceObjectWhereUniqueInput[]
    connect?: EvidenceObjectWhereUniqueInput | EvidenceObjectWhereUniqueInput[]
    update?: EvidenceObjectUpdateWithWhereUniqueWithoutOrganizationInput | EvidenceObjectUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: EvidenceObjectUpdateManyWithWhereWithoutOrganizationInput | EvidenceObjectUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: EvidenceObjectScalarWhereInput | EvidenceObjectScalarWhereInput[]
  }

  export type PolicyPackUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<PolicyPackCreateWithoutOrganizationInput, PolicyPackUncheckedCreateWithoutOrganizationInput> | PolicyPackCreateWithoutOrganizationInput[] | PolicyPackUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: PolicyPackCreateOrConnectWithoutOrganizationInput | PolicyPackCreateOrConnectWithoutOrganizationInput[]
    upsert?: PolicyPackUpsertWithWhereUniqueWithoutOrganizationInput | PolicyPackUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: PolicyPackCreateManyOrganizationInputEnvelope
    set?: PolicyPackWhereUniqueInput | PolicyPackWhereUniqueInput[]
    disconnect?: PolicyPackWhereUniqueInput | PolicyPackWhereUniqueInput[]
    delete?: PolicyPackWhereUniqueInput | PolicyPackWhereUniqueInput[]
    connect?: PolicyPackWhereUniqueInput | PolicyPackWhereUniqueInput[]
    update?: PolicyPackUpdateWithWhereUniqueWithoutOrganizationInput | PolicyPackUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: PolicyPackUpdateManyWithWhereWithoutOrganizationInput | PolicyPackUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: PolicyPackScalarWhereInput | PolicyPackScalarWhereInput[]
  }

  export type PolicyPackAssignmentUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<PolicyPackAssignmentCreateWithoutOrganizationInput, PolicyPackAssignmentUncheckedCreateWithoutOrganizationInput> | PolicyPackAssignmentCreateWithoutOrganizationInput[] | PolicyPackAssignmentUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: PolicyPackAssignmentCreateOrConnectWithoutOrganizationInput | PolicyPackAssignmentCreateOrConnectWithoutOrganizationInput[]
    upsert?: PolicyPackAssignmentUpsertWithWhereUniqueWithoutOrganizationInput | PolicyPackAssignmentUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: PolicyPackAssignmentCreateManyOrganizationInputEnvelope
    set?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    disconnect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    delete?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    connect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    update?: PolicyPackAssignmentUpdateWithWhereUniqueWithoutOrganizationInput | PolicyPackAssignmentUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: PolicyPackAssignmentUpdateManyWithWhereWithoutOrganizationInput | PolicyPackAssignmentUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: PolicyPackAssignmentScalarWhereInput | PolicyPackAssignmentScalarWhereInput[]
  }

  export type WebhookReceiptUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<WebhookReceiptCreateWithoutOrganizationInput, WebhookReceiptUncheckedCreateWithoutOrganizationInput> | WebhookReceiptCreateWithoutOrganizationInput[] | WebhookReceiptUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: WebhookReceiptCreateOrConnectWithoutOrganizationInput | WebhookReceiptCreateOrConnectWithoutOrganizationInput[]
    upsert?: WebhookReceiptUpsertWithWhereUniqueWithoutOrganizationInput | WebhookReceiptUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: WebhookReceiptCreateManyOrganizationInputEnvelope
    set?: WebhookReceiptWhereUniqueInput | WebhookReceiptWhereUniqueInput[]
    disconnect?: WebhookReceiptWhereUniqueInput | WebhookReceiptWhereUniqueInput[]
    delete?: WebhookReceiptWhereUniqueInput | WebhookReceiptWhereUniqueInput[]
    connect?: WebhookReceiptWhereUniqueInput | WebhookReceiptWhereUniqueInput[]
    update?: WebhookReceiptUpdateWithWhereUniqueWithoutOrganizationInput | WebhookReceiptUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: WebhookReceiptUpdateManyWithWhereWithoutOrganizationInput | WebhookReceiptUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: WebhookReceiptScalarWhereInput | WebhookReceiptScalarWhereInput[]
  }

  export type RepositoryUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<RepositoryCreateWithoutOrganizationInput, RepositoryUncheckedCreateWithoutOrganizationInput> | RepositoryCreateWithoutOrganizationInput[] | RepositoryUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: RepositoryCreateOrConnectWithoutOrganizationInput | RepositoryCreateOrConnectWithoutOrganizationInput[]
    upsert?: RepositoryUpsertWithWhereUniqueWithoutOrganizationInput | RepositoryUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: RepositoryCreateManyOrganizationInputEnvelope
    set?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    disconnect?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    delete?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    connect?: RepositoryWhereUniqueInput | RepositoryWhereUniqueInput[]
    update?: RepositoryUpdateWithWhereUniqueWithoutOrganizationInput | RepositoryUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: RepositoryUpdateManyWithWhereWithoutOrganizationInput | RepositoryUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: RepositoryScalarWhereInput | RepositoryScalarWhereInput[]
  }

  export type ReadyLayerRunUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<ReadyLayerRunCreateWithoutOrganizationInput, ReadyLayerRunUncheckedCreateWithoutOrganizationInput> | ReadyLayerRunCreateWithoutOrganizationInput[] | ReadyLayerRunUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: ReadyLayerRunCreateOrConnectWithoutOrganizationInput | ReadyLayerRunCreateOrConnectWithoutOrganizationInput[]
    upsert?: ReadyLayerRunUpsertWithWhereUniqueWithoutOrganizationInput | ReadyLayerRunUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: ReadyLayerRunCreateManyOrganizationInputEnvelope
    set?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    disconnect?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    delete?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    connect?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    update?: ReadyLayerRunUpdateWithWhereUniqueWithoutOrganizationInput | ReadyLayerRunUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: ReadyLayerRunUpdateManyWithWhereWithoutOrganizationInput | ReadyLayerRunUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: ReadyLayerRunScalarWhereInput | ReadyLayerRunScalarWhereInput[]
  }

  export type EvidenceAttestationUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<EvidenceAttestationCreateWithoutOrganizationInput, EvidenceAttestationUncheckedCreateWithoutOrganizationInput> | EvidenceAttestationCreateWithoutOrganizationInput[] | EvidenceAttestationUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: EvidenceAttestationCreateOrConnectWithoutOrganizationInput | EvidenceAttestationCreateOrConnectWithoutOrganizationInput[]
    upsert?: EvidenceAttestationUpsertWithWhereUniqueWithoutOrganizationInput | EvidenceAttestationUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: EvidenceAttestationCreateManyOrganizationInputEnvelope
    set?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    disconnect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    delete?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    connect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    update?: EvidenceAttestationUpdateWithWhereUniqueWithoutOrganizationInput | EvidenceAttestationUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: EvidenceAttestationUpdateManyWithWhereWithoutOrganizationInput | EvidenceAttestationUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: EvidenceAttestationScalarWhereInput | EvidenceAttestationScalarWhereInput[]
  }

  export type EvidenceObjectUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<EvidenceObjectCreateWithoutOrganizationInput, EvidenceObjectUncheckedCreateWithoutOrganizationInput> | EvidenceObjectCreateWithoutOrganizationInput[] | EvidenceObjectUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: EvidenceObjectCreateOrConnectWithoutOrganizationInput | EvidenceObjectCreateOrConnectWithoutOrganizationInput[]
    upsert?: EvidenceObjectUpsertWithWhereUniqueWithoutOrganizationInput | EvidenceObjectUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: EvidenceObjectCreateManyOrganizationInputEnvelope
    set?: EvidenceObjectWhereUniqueInput | EvidenceObjectWhereUniqueInput[]
    disconnect?: EvidenceObjectWhereUniqueInput | EvidenceObjectWhereUniqueInput[]
    delete?: EvidenceObjectWhereUniqueInput | EvidenceObjectWhereUniqueInput[]
    connect?: EvidenceObjectWhereUniqueInput | EvidenceObjectWhereUniqueInput[]
    update?: EvidenceObjectUpdateWithWhereUniqueWithoutOrganizationInput | EvidenceObjectUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: EvidenceObjectUpdateManyWithWhereWithoutOrganizationInput | EvidenceObjectUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: EvidenceObjectScalarWhereInput | EvidenceObjectScalarWhereInput[]
  }

  export type PolicyPackUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<PolicyPackCreateWithoutOrganizationInput, PolicyPackUncheckedCreateWithoutOrganizationInput> | PolicyPackCreateWithoutOrganizationInput[] | PolicyPackUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: PolicyPackCreateOrConnectWithoutOrganizationInput | PolicyPackCreateOrConnectWithoutOrganizationInput[]
    upsert?: PolicyPackUpsertWithWhereUniqueWithoutOrganizationInput | PolicyPackUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: PolicyPackCreateManyOrganizationInputEnvelope
    set?: PolicyPackWhereUniqueInput | PolicyPackWhereUniqueInput[]
    disconnect?: PolicyPackWhereUniqueInput | PolicyPackWhereUniqueInput[]
    delete?: PolicyPackWhereUniqueInput | PolicyPackWhereUniqueInput[]
    connect?: PolicyPackWhereUniqueInput | PolicyPackWhereUniqueInput[]
    update?: PolicyPackUpdateWithWhereUniqueWithoutOrganizationInput | PolicyPackUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: PolicyPackUpdateManyWithWhereWithoutOrganizationInput | PolicyPackUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: PolicyPackScalarWhereInput | PolicyPackScalarWhereInput[]
  }

  export type PolicyPackAssignmentUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<PolicyPackAssignmentCreateWithoutOrganizationInput, PolicyPackAssignmentUncheckedCreateWithoutOrganizationInput> | PolicyPackAssignmentCreateWithoutOrganizationInput[] | PolicyPackAssignmentUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: PolicyPackAssignmentCreateOrConnectWithoutOrganizationInput | PolicyPackAssignmentCreateOrConnectWithoutOrganizationInput[]
    upsert?: PolicyPackAssignmentUpsertWithWhereUniqueWithoutOrganizationInput | PolicyPackAssignmentUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: PolicyPackAssignmentCreateManyOrganizationInputEnvelope
    set?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    disconnect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    delete?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    connect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    update?: PolicyPackAssignmentUpdateWithWhereUniqueWithoutOrganizationInput | PolicyPackAssignmentUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: PolicyPackAssignmentUpdateManyWithWhereWithoutOrganizationInput | PolicyPackAssignmentUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: PolicyPackAssignmentScalarWhereInput | PolicyPackAssignmentScalarWhereInput[]
  }

  export type WebhookReceiptUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<WebhookReceiptCreateWithoutOrganizationInput, WebhookReceiptUncheckedCreateWithoutOrganizationInput> | WebhookReceiptCreateWithoutOrganizationInput[] | WebhookReceiptUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: WebhookReceiptCreateOrConnectWithoutOrganizationInput | WebhookReceiptCreateOrConnectWithoutOrganizationInput[]
    upsert?: WebhookReceiptUpsertWithWhereUniqueWithoutOrganizationInput | WebhookReceiptUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: WebhookReceiptCreateManyOrganizationInputEnvelope
    set?: WebhookReceiptWhereUniqueInput | WebhookReceiptWhereUniqueInput[]
    disconnect?: WebhookReceiptWhereUniqueInput | WebhookReceiptWhereUniqueInput[]
    delete?: WebhookReceiptWhereUniqueInput | WebhookReceiptWhereUniqueInput[]
    connect?: WebhookReceiptWhereUniqueInput | WebhookReceiptWhereUniqueInput[]
    update?: WebhookReceiptUpdateWithWhereUniqueWithoutOrganizationInput | WebhookReceiptUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: WebhookReceiptUpdateManyWithWhereWithoutOrganizationInput | WebhookReceiptUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: WebhookReceiptScalarWhereInput | WebhookReceiptScalarWhereInput[]
  }

  export type OrganizationCreateNestedOneWithoutRepositoriesInput = {
    create?: XOR<OrganizationCreateWithoutRepositoriesInput, OrganizationUncheckedCreateWithoutRepositoriesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutRepositoriesInput
    connect?: OrganizationWhereUniqueInput
  }

  export type ProjectCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<ProjectCreateWithoutRepositoryInput, ProjectUncheckedCreateWithoutRepositoryInput> | ProjectCreateWithoutRepositoryInput[] | ProjectUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutRepositoryInput | ProjectCreateOrConnectWithoutRepositoryInput[]
    createMany?: ProjectCreateManyRepositoryInputEnvelope
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
  }

  export type ReadyLayerRunCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<ReadyLayerRunCreateWithoutRepositoryInput, ReadyLayerRunUncheckedCreateWithoutRepositoryInput> | ReadyLayerRunCreateWithoutRepositoryInput[] | ReadyLayerRunUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: ReadyLayerRunCreateOrConnectWithoutRepositoryInput | ReadyLayerRunCreateOrConnectWithoutRepositoryInput[]
    createMany?: ReadyLayerRunCreateManyRepositoryInputEnvelope
    connect?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
  }

  export type EvidenceAttestationCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<EvidenceAttestationCreateWithoutRepositoryInput, EvidenceAttestationUncheckedCreateWithoutRepositoryInput> | EvidenceAttestationCreateWithoutRepositoryInput[] | EvidenceAttestationUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: EvidenceAttestationCreateOrConnectWithoutRepositoryInput | EvidenceAttestationCreateOrConnectWithoutRepositoryInput[]
    createMany?: EvidenceAttestationCreateManyRepositoryInputEnvelope
    connect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
  }

  export type PolicyPackAssignmentCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<PolicyPackAssignmentCreateWithoutRepositoryInput, PolicyPackAssignmentUncheckedCreateWithoutRepositoryInput> | PolicyPackAssignmentCreateWithoutRepositoryInput[] | PolicyPackAssignmentUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: PolicyPackAssignmentCreateOrConnectWithoutRepositoryInput | PolicyPackAssignmentCreateOrConnectWithoutRepositoryInput[]
    createMany?: PolicyPackAssignmentCreateManyRepositoryInputEnvelope
    connect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
  }

  export type ProjectUncheckedCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<ProjectCreateWithoutRepositoryInput, ProjectUncheckedCreateWithoutRepositoryInput> | ProjectCreateWithoutRepositoryInput[] | ProjectUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutRepositoryInput | ProjectCreateOrConnectWithoutRepositoryInput[]
    createMany?: ProjectCreateManyRepositoryInputEnvelope
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
  }

  export type ReadyLayerRunUncheckedCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<ReadyLayerRunCreateWithoutRepositoryInput, ReadyLayerRunUncheckedCreateWithoutRepositoryInput> | ReadyLayerRunCreateWithoutRepositoryInput[] | ReadyLayerRunUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: ReadyLayerRunCreateOrConnectWithoutRepositoryInput | ReadyLayerRunCreateOrConnectWithoutRepositoryInput[]
    createMany?: ReadyLayerRunCreateManyRepositoryInputEnvelope
    connect?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
  }

  export type EvidenceAttestationUncheckedCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<EvidenceAttestationCreateWithoutRepositoryInput, EvidenceAttestationUncheckedCreateWithoutRepositoryInput> | EvidenceAttestationCreateWithoutRepositoryInput[] | EvidenceAttestationUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: EvidenceAttestationCreateOrConnectWithoutRepositoryInput | EvidenceAttestationCreateOrConnectWithoutRepositoryInput[]
    createMany?: EvidenceAttestationCreateManyRepositoryInputEnvelope
    connect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
  }

  export type PolicyPackAssignmentUncheckedCreateNestedManyWithoutRepositoryInput = {
    create?: XOR<PolicyPackAssignmentCreateWithoutRepositoryInput, PolicyPackAssignmentUncheckedCreateWithoutRepositoryInput> | PolicyPackAssignmentCreateWithoutRepositoryInput[] | PolicyPackAssignmentUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: PolicyPackAssignmentCreateOrConnectWithoutRepositoryInput | PolicyPackAssignmentCreateOrConnectWithoutRepositoryInput[]
    createMany?: PolicyPackAssignmentCreateManyRepositoryInputEnvelope
    connect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
  }

  export type OrganizationUpdateOneRequiredWithoutRepositoriesNestedInput = {
    create?: XOR<OrganizationCreateWithoutRepositoriesInput, OrganizationUncheckedCreateWithoutRepositoriesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutRepositoriesInput
    upsert?: OrganizationUpsertWithoutRepositoriesInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutRepositoriesInput, OrganizationUpdateWithoutRepositoriesInput>, OrganizationUncheckedUpdateWithoutRepositoriesInput>
  }

  export type ProjectUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<ProjectCreateWithoutRepositoryInput, ProjectUncheckedCreateWithoutRepositoryInput> | ProjectCreateWithoutRepositoryInput[] | ProjectUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutRepositoryInput | ProjectCreateOrConnectWithoutRepositoryInput[]
    upsert?: ProjectUpsertWithWhereUniqueWithoutRepositoryInput | ProjectUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: ProjectCreateManyRepositoryInputEnvelope
    set?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    disconnect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    delete?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    update?: ProjectUpdateWithWhereUniqueWithoutRepositoryInput | ProjectUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: ProjectUpdateManyWithWhereWithoutRepositoryInput | ProjectUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
  }

  export type ReadyLayerRunUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<ReadyLayerRunCreateWithoutRepositoryInput, ReadyLayerRunUncheckedCreateWithoutRepositoryInput> | ReadyLayerRunCreateWithoutRepositoryInput[] | ReadyLayerRunUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: ReadyLayerRunCreateOrConnectWithoutRepositoryInput | ReadyLayerRunCreateOrConnectWithoutRepositoryInput[]
    upsert?: ReadyLayerRunUpsertWithWhereUniqueWithoutRepositoryInput | ReadyLayerRunUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: ReadyLayerRunCreateManyRepositoryInputEnvelope
    set?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    disconnect?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    delete?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    connect?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    update?: ReadyLayerRunUpdateWithWhereUniqueWithoutRepositoryInput | ReadyLayerRunUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: ReadyLayerRunUpdateManyWithWhereWithoutRepositoryInput | ReadyLayerRunUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: ReadyLayerRunScalarWhereInput | ReadyLayerRunScalarWhereInput[]
  }

  export type EvidenceAttestationUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<EvidenceAttestationCreateWithoutRepositoryInput, EvidenceAttestationUncheckedCreateWithoutRepositoryInput> | EvidenceAttestationCreateWithoutRepositoryInput[] | EvidenceAttestationUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: EvidenceAttestationCreateOrConnectWithoutRepositoryInput | EvidenceAttestationCreateOrConnectWithoutRepositoryInput[]
    upsert?: EvidenceAttestationUpsertWithWhereUniqueWithoutRepositoryInput | EvidenceAttestationUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: EvidenceAttestationCreateManyRepositoryInputEnvelope
    set?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    disconnect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    delete?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    connect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    update?: EvidenceAttestationUpdateWithWhereUniqueWithoutRepositoryInput | EvidenceAttestationUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: EvidenceAttestationUpdateManyWithWhereWithoutRepositoryInput | EvidenceAttestationUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: EvidenceAttestationScalarWhereInput | EvidenceAttestationScalarWhereInput[]
  }

  export type PolicyPackAssignmentUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<PolicyPackAssignmentCreateWithoutRepositoryInput, PolicyPackAssignmentUncheckedCreateWithoutRepositoryInput> | PolicyPackAssignmentCreateWithoutRepositoryInput[] | PolicyPackAssignmentUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: PolicyPackAssignmentCreateOrConnectWithoutRepositoryInput | PolicyPackAssignmentCreateOrConnectWithoutRepositoryInput[]
    upsert?: PolicyPackAssignmentUpsertWithWhereUniqueWithoutRepositoryInput | PolicyPackAssignmentUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: PolicyPackAssignmentCreateManyRepositoryInputEnvelope
    set?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    disconnect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    delete?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    connect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    update?: PolicyPackAssignmentUpdateWithWhereUniqueWithoutRepositoryInput | PolicyPackAssignmentUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: PolicyPackAssignmentUpdateManyWithWhereWithoutRepositoryInput | PolicyPackAssignmentUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: PolicyPackAssignmentScalarWhereInput | PolicyPackAssignmentScalarWhereInput[]
  }

  export type ProjectUncheckedUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<ProjectCreateWithoutRepositoryInput, ProjectUncheckedCreateWithoutRepositoryInput> | ProjectCreateWithoutRepositoryInput[] | ProjectUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutRepositoryInput | ProjectCreateOrConnectWithoutRepositoryInput[]
    upsert?: ProjectUpsertWithWhereUniqueWithoutRepositoryInput | ProjectUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: ProjectCreateManyRepositoryInputEnvelope
    set?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    disconnect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    delete?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    update?: ProjectUpdateWithWhereUniqueWithoutRepositoryInput | ProjectUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: ProjectUpdateManyWithWhereWithoutRepositoryInput | ProjectUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
  }

  export type ReadyLayerRunUncheckedUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<ReadyLayerRunCreateWithoutRepositoryInput, ReadyLayerRunUncheckedCreateWithoutRepositoryInput> | ReadyLayerRunCreateWithoutRepositoryInput[] | ReadyLayerRunUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: ReadyLayerRunCreateOrConnectWithoutRepositoryInput | ReadyLayerRunCreateOrConnectWithoutRepositoryInput[]
    upsert?: ReadyLayerRunUpsertWithWhereUniqueWithoutRepositoryInput | ReadyLayerRunUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: ReadyLayerRunCreateManyRepositoryInputEnvelope
    set?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    disconnect?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    delete?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    connect?: ReadyLayerRunWhereUniqueInput | ReadyLayerRunWhereUniqueInput[]
    update?: ReadyLayerRunUpdateWithWhereUniqueWithoutRepositoryInput | ReadyLayerRunUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: ReadyLayerRunUpdateManyWithWhereWithoutRepositoryInput | ReadyLayerRunUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: ReadyLayerRunScalarWhereInput | ReadyLayerRunScalarWhereInput[]
  }

  export type EvidenceAttestationUncheckedUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<EvidenceAttestationCreateWithoutRepositoryInput, EvidenceAttestationUncheckedCreateWithoutRepositoryInput> | EvidenceAttestationCreateWithoutRepositoryInput[] | EvidenceAttestationUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: EvidenceAttestationCreateOrConnectWithoutRepositoryInput | EvidenceAttestationCreateOrConnectWithoutRepositoryInput[]
    upsert?: EvidenceAttestationUpsertWithWhereUniqueWithoutRepositoryInput | EvidenceAttestationUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: EvidenceAttestationCreateManyRepositoryInputEnvelope
    set?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    disconnect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    delete?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    connect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    update?: EvidenceAttestationUpdateWithWhereUniqueWithoutRepositoryInput | EvidenceAttestationUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: EvidenceAttestationUpdateManyWithWhereWithoutRepositoryInput | EvidenceAttestationUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: EvidenceAttestationScalarWhereInput | EvidenceAttestationScalarWhereInput[]
  }

  export type PolicyPackAssignmentUncheckedUpdateManyWithoutRepositoryNestedInput = {
    create?: XOR<PolicyPackAssignmentCreateWithoutRepositoryInput, PolicyPackAssignmentUncheckedCreateWithoutRepositoryInput> | PolicyPackAssignmentCreateWithoutRepositoryInput[] | PolicyPackAssignmentUncheckedCreateWithoutRepositoryInput[]
    connectOrCreate?: PolicyPackAssignmentCreateOrConnectWithoutRepositoryInput | PolicyPackAssignmentCreateOrConnectWithoutRepositoryInput[]
    upsert?: PolicyPackAssignmentUpsertWithWhereUniqueWithoutRepositoryInput | PolicyPackAssignmentUpsertWithWhereUniqueWithoutRepositoryInput[]
    createMany?: PolicyPackAssignmentCreateManyRepositoryInputEnvelope
    set?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    disconnect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    delete?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    connect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    update?: PolicyPackAssignmentUpdateWithWhereUniqueWithoutRepositoryInput | PolicyPackAssignmentUpdateWithWhereUniqueWithoutRepositoryInput[]
    updateMany?: PolicyPackAssignmentUpdateManyWithWhereWithoutRepositoryInput | PolicyPackAssignmentUpdateManyWithWhereWithoutRepositoryInput[]
    deleteMany?: PolicyPackAssignmentScalarWhereInput | PolicyPackAssignmentScalarWhereInput[]
  }

  export type RepositoryCreateNestedOneWithoutProjectsInput = {
    create?: XOR<RepositoryCreateWithoutProjectsInput, RepositoryUncheckedCreateWithoutProjectsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutProjectsInput
    connect?: RepositoryWhereUniqueInput
  }

  export type RepositoryUpdateOneRequiredWithoutProjectsNestedInput = {
    create?: XOR<RepositoryCreateWithoutProjectsInput, RepositoryUncheckedCreateWithoutProjectsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutProjectsInput
    upsert?: RepositoryUpsertWithoutProjectsInput
    connect?: RepositoryWhereUniqueInput
    update?: XOR<XOR<RepositoryUpdateToOneWithWhereWithoutProjectsInput, RepositoryUpdateWithoutProjectsInput>, RepositoryUncheckedUpdateWithoutProjectsInput>
  }

  export type OrganizationCreateNestedOneWithoutRunsInput = {
    create?: XOR<OrganizationCreateWithoutRunsInput, OrganizationUncheckedCreateWithoutRunsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutRunsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type RepositoryCreateNestedOneWithoutRunsInput = {
    create?: XOR<RepositoryCreateWithoutRunsInput, RepositoryUncheckedCreateWithoutRunsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutRunsInput
    connect?: RepositoryWhereUniqueInput
  }

  export type EvidenceAttestationCreateNestedManyWithoutRunInput = {
    create?: XOR<EvidenceAttestationCreateWithoutRunInput, EvidenceAttestationUncheckedCreateWithoutRunInput> | EvidenceAttestationCreateWithoutRunInput[] | EvidenceAttestationUncheckedCreateWithoutRunInput[]
    connectOrCreate?: EvidenceAttestationCreateOrConnectWithoutRunInput | EvidenceAttestationCreateOrConnectWithoutRunInput[]
    createMany?: EvidenceAttestationCreateManyRunInputEnvelope
    connect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
  }

  export type EvidenceAttestationUncheckedCreateNestedManyWithoutRunInput = {
    create?: XOR<EvidenceAttestationCreateWithoutRunInput, EvidenceAttestationUncheckedCreateWithoutRunInput> | EvidenceAttestationCreateWithoutRunInput[] | EvidenceAttestationUncheckedCreateWithoutRunInput[]
    connectOrCreate?: EvidenceAttestationCreateOrConnectWithoutRunInput | EvidenceAttestationCreateOrConnectWithoutRunInput[]
    createMany?: EvidenceAttestationCreateManyRunInputEnvelope
    connect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
  }

  export type OrganizationUpdateOneRequiredWithoutRunsNestedInput = {
    create?: XOR<OrganizationCreateWithoutRunsInput, OrganizationUncheckedCreateWithoutRunsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutRunsInput
    upsert?: OrganizationUpsertWithoutRunsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutRunsInput, OrganizationUpdateWithoutRunsInput>, OrganizationUncheckedUpdateWithoutRunsInput>
  }

  export type RepositoryUpdateOneRequiredWithoutRunsNestedInput = {
    create?: XOR<RepositoryCreateWithoutRunsInput, RepositoryUncheckedCreateWithoutRunsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutRunsInput
    upsert?: RepositoryUpsertWithoutRunsInput
    connect?: RepositoryWhereUniqueInput
    update?: XOR<XOR<RepositoryUpdateToOneWithWhereWithoutRunsInput, RepositoryUpdateWithoutRunsInput>, RepositoryUncheckedUpdateWithoutRunsInput>
  }

  export type EvidenceAttestationUpdateManyWithoutRunNestedInput = {
    create?: XOR<EvidenceAttestationCreateWithoutRunInput, EvidenceAttestationUncheckedCreateWithoutRunInput> | EvidenceAttestationCreateWithoutRunInput[] | EvidenceAttestationUncheckedCreateWithoutRunInput[]
    connectOrCreate?: EvidenceAttestationCreateOrConnectWithoutRunInput | EvidenceAttestationCreateOrConnectWithoutRunInput[]
    upsert?: EvidenceAttestationUpsertWithWhereUniqueWithoutRunInput | EvidenceAttestationUpsertWithWhereUniqueWithoutRunInput[]
    createMany?: EvidenceAttestationCreateManyRunInputEnvelope
    set?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    disconnect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    delete?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    connect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    update?: EvidenceAttestationUpdateWithWhereUniqueWithoutRunInput | EvidenceAttestationUpdateWithWhereUniqueWithoutRunInput[]
    updateMany?: EvidenceAttestationUpdateManyWithWhereWithoutRunInput | EvidenceAttestationUpdateManyWithWhereWithoutRunInput[]
    deleteMany?: EvidenceAttestationScalarWhereInput | EvidenceAttestationScalarWhereInput[]
  }

  export type EvidenceAttestationUncheckedUpdateManyWithoutRunNestedInput = {
    create?: XOR<EvidenceAttestationCreateWithoutRunInput, EvidenceAttestationUncheckedCreateWithoutRunInput> | EvidenceAttestationCreateWithoutRunInput[] | EvidenceAttestationUncheckedCreateWithoutRunInput[]
    connectOrCreate?: EvidenceAttestationCreateOrConnectWithoutRunInput | EvidenceAttestationCreateOrConnectWithoutRunInput[]
    upsert?: EvidenceAttestationUpsertWithWhereUniqueWithoutRunInput | EvidenceAttestationUpsertWithWhereUniqueWithoutRunInput[]
    createMany?: EvidenceAttestationCreateManyRunInputEnvelope
    set?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    disconnect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    delete?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    connect?: EvidenceAttestationWhereUniqueInput | EvidenceAttestationWhereUniqueInput[]
    update?: EvidenceAttestationUpdateWithWhereUniqueWithoutRunInput | EvidenceAttestationUpdateWithWhereUniqueWithoutRunInput[]
    updateMany?: EvidenceAttestationUpdateManyWithWhereWithoutRunInput | EvidenceAttestationUpdateManyWithWhereWithoutRunInput[]
    deleteMany?: EvidenceAttestationScalarWhereInput | EvidenceAttestationScalarWhereInput[]
  }

  export type OrganizationCreateNestedOneWithoutEvidenceAttestationsInput = {
    create?: XOR<OrganizationCreateWithoutEvidenceAttestationsInput, OrganizationUncheckedCreateWithoutEvidenceAttestationsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutEvidenceAttestationsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type RepositoryCreateNestedOneWithoutEvidenceAttestationsInput = {
    create?: XOR<RepositoryCreateWithoutEvidenceAttestationsInput, RepositoryUncheckedCreateWithoutEvidenceAttestationsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutEvidenceAttestationsInput
    connect?: RepositoryWhereUniqueInput
  }

  export type ReadyLayerRunCreateNestedOneWithoutAttestationsInput = {
    create?: XOR<ReadyLayerRunCreateWithoutAttestationsInput, ReadyLayerRunUncheckedCreateWithoutAttestationsInput>
    connectOrCreate?: ReadyLayerRunCreateOrConnectWithoutAttestationsInput
    connect?: ReadyLayerRunWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type OrganizationUpdateOneRequiredWithoutEvidenceAttestationsNestedInput = {
    create?: XOR<OrganizationCreateWithoutEvidenceAttestationsInput, OrganizationUncheckedCreateWithoutEvidenceAttestationsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutEvidenceAttestationsInput
    upsert?: OrganizationUpsertWithoutEvidenceAttestationsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutEvidenceAttestationsInput, OrganizationUpdateWithoutEvidenceAttestationsInput>, OrganizationUncheckedUpdateWithoutEvidenceAttestationsInput>
  }

  export type RepositoryUpdateOneRequiredWithoutEvidenceAttestationsNestedInput = {
    create?: XOR<RepositoryCreateWithoutEvidenceAttestationsInput, RepositoryUncheckedCreateWithoutEvidenceAttestationsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutEvidenceAttestationsInput
    upsert?: RepositoryUpsertWithoutEvidenceAttestationsInput
    connect?: RepositoryWhereUniqueInput
    update?: XOR<XOR<RepositoryUpdateToOneWithWhereWithoutEvidenceAttestationsInput, RepositoryUpdateWithoutEvidenceAttestationsInput>, RepositoryUncheckedUpdateWithoutEvidenceAttestationsInput>
  }

  export type ReadyLayerRunUpdateOneRequiredWithoutAttestationsNestedInput = {
    create?: XOR<ReadyLayerRunCreateWithoutAttestationsInput, ReadyLayerRunUncheckedCreateWithoutAttestationsInput>
    connectOrCreate?: ReadyLayerRunCreateOrConnectWithoutAttestationsInput
    upsert?: ReadyLayerRunUpsertWithoutAttestationsInput
    connect?: ReadyLayerRunWhereUniqueInput
    update?: XOR<XOR<ReadyLayerRunUpdateToOneWithWhereWithoutAttestationsInput, ReadyLayerRunUpdateWithoutAttestationsInput>, ReadyLayerRunUncheckedUpdateWithoutAttestationsInput>
  }

  export type OrganizationCreateNestedOneWithoutEvidenceObjectsInput = {
    create?: XOR<OrganizationCreateWithoutEvidenceObjectsInput, OrganizationUncheckedCreateWithoutEvidenceObjectsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutEvidenceObjectsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type OrganizationUpdateOneRequiredWithoutEvidenceObjectsNestedInput = {
    create?: XOR<OrganizationCreateWithoutEvidenceObjectsInput, OrganizationUncheckedCreateWithoutEvidenceObjectsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutEvidenceObjectsInput
    upsert?: OrganizationUpsertWithoutEvidenceObjectsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutEvidenceObjectsInput, OrganizationUpdateWithoutEvidenceObjectsInput>, OrganizationUncheckedUpdateWithoutEvidenceObjectsInput>
  }

  export type OrganizationCreateNestedOneWithoutPolicyPacksInput = {
    create?: XOR<OrganizationCreateWithoutPolicyPacksInput, OrganizationUncheckedCreateWithoutPolicyPacksInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutPolicyPacksInput
    connect?: OrganizationWhereUniqueInput
  }

  export type PolicyPackAssignmentCreateNestedManyWithoutPolicyPackInput = {
    create?: XOR<PolicyPackAssignmentCreateWithoutPolicyPackInput, PolicyPackAssignmentUncheckedCreateWithoutPolicyPackInput> | PolicyPackAssignmentCreateWithoutPolicyPackInput[] | PolicyPackAssignmentUncheckedCreateWithoutPolicyPackInput[]
    connectOrCreate?: PolicyPackAssignmentCreateOrConnectWithoutPolicyPackInput | PolicyPackAssignmentCreateOrConnectWithoutPolicyPackInput[]
    createMany?: PolicyPackAssignmentCreateManyPolicyPackInputEnvelope
    connect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
  }

  export type PolicyPackAssignmentUncheckedCreateNestedManyWithoutPolicyPackInput = {
    create?: XOR<PolicyPackAssignmentCreateWithoutPolicyPackInput, PolicyPackAssignmentUncheckedCreateWithoutPolicyPackInput> | PolicyPackAssignmentCreateWithoutPolicyPackInput[] | PolicyPackAssignmentUncheckedCreateWithoutPolicyPackInput[]
    connectOrCreate?: PolicyPackAssignmentCreateOrConnectWithoutPolicyPackInput | PolicyPackAssignmentCreateOrConnectWithoutPolicyPackInput[]
    createMany?: PolicyPackAssignmentCreateManyPolicyPackInputEnvelope
    connect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
  }

  export type OrganizationUpdateOneRequiredWithoutPolicyPacksNestedInput = {
    create?: XOR<OrganizationCreateWithoutPolicyPacksInput, OrganizationUncheckedCreateWithoutPolicyPacksInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutPolicyPacksInput
    upsert?: OrganizationUpsertWithoutPolicyPacksInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutPolicyPacksInput, OrganizationUpdateWithoutPolicyPacksInput>, OrganizationUncheckedUpdateWithoutPolicyPacksInput>
  }

  export type PolicyPackAssignmentUpdateManyWithoutPolicyPackNestedInput = {
    create?: XOR<PolicyPackAssignmentCreateWithoutPolicyPackInput, PolicyPackAssignmentUncheckedCreateWithoutPolicyPackInput> | PolicyPackAssignmentCreateWithoutPolicyPackInput[] | PolicyPackAssignmentUncheckedCreateWithoutPolicyPackInput[]
    connectOrCreate?: PolicyPackAssignmentCreateOrConnectWithoutPolicyPackInput | PolicyPackAssignmentCreateOrConnectWithoutPolicyPackInput[]
    upsert?: PolicyPackAssignmentUpsertWithWhereUniqueWithoutPolicyPackInput | PolicyPackAssignmentUpsertWithWhereUniqueWithoutPolicyPackInput[]
    createMany?: PolicyPackAssignmentCreateManyPolicyPackInputEnvelope
    set?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    disconnect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    delete?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    connect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    update?: PolicyPackAssignmentUpdateWithWhereUniqueWithoutPolicyPackInput | PolicyPackAssignmentUpdateWithWhereUniqueWithoutPolicyPackInput[]
    updateMany?: PolicyPackAssignmentUpdateManyWithWhereWithoutPolicyPackInput | PolicyPackAssignmentUpdateManyWithWhereWithoutPolicyPackInput[]
    deleteMany?: PolicyPackAssignmentScalarWhereInput | PolicyPackAssignmentScalarWhereInput[]
  }

  export type PolicyPackAssignmentUncheckedUpdateManyWithoutPolicyPackNestedInput = {
    create?: XOR<PolicyPackAssignmentCreateWithoutPolicyPackInput, PolicyPackAssignmentUncheckedCreateWithoutPolicyPackInput> | PolicyPackAssignmentCreateWithoutPolicyPackInput[] | PolicyPackAssignmentUncheckedCreateWithoutPolicyPackInput[]
    connectOrCreate?: PolicyPackAssignmentCreateOrConnectWithoutPolicyPackInput | PolicyPackAssignmentCreateOrConnectWithoutPolicyPackInput[]
    upsert?: PolicyPackAssignmentUpsertWithWhereUniqueWithoutPolicyPackInput | PolicyPackAssignmentUpsertWithWhereUniqueWithoutPolicyPackInput[]
    createMany?: PolicyPackAssignmentCreateManyPolicyPackInputEnvelope
    set?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    disconnect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    delete?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    connect?: PolicyPackAssignmentWhereUniqueInput | PolicyPackAssignmentWhereUniqueInput[]
    update?: PolicyPackAssignmentUpdateWithWhereUniqueWithoutPolicyPackInput | PolicyPackAssignmentUpdateWithWhereUniqueWithoutPolicyPackInput[]
    updateMany?: PolicyPackAssignmentUpdateManyWithWhereWithoutPolicyPackInput | PolicyPackAssignmentUpdateManyWithWhereWithoutPolicyPackInput[]
    deleteMany?: PolicyPackAssignmentScalarWhereInput | PolicyPackAssignmentScalarWhereInput[]
  }

  export type OrganizationCreateNestedOneWithoutPolicyAssignmentsInput = {
    create?: XOR<OrganizationCreateWithoutPolicyAssignmentsInput, OrganizationUncheckedCreateWithoutPolicyAssignmentsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutPolicyAssignmentsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type RepositoryCreateNestedOneWithoutPolicyAssignmentsInput = {
    create?: XOR<RepositoryCreateWithoutPolicyAssignmentsInput, RepositoryUncheckedCreateWithoutPolicyAssignmentsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutPolicyAssignmentsInput
    connect?: RepositoryWhereUniqueInput
  }

  export type PolicyPackCreateNestedOneWithoutAssignmentsInput = {
    create?: XOR<PolicyPackCreateWithoutAssignmentsInput, PolicyPackUncheckedCreateWithoutAssignmentsInput>
    connectOrCreate?: PolicyPackCreateOrConnectWithoutAssignmentsInput
    connect?: PolicyPackWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type OrganizationUpdateOneRequiredWithoutPolicyAssignmentsNestedInput = {
    create?: XOR<OrganizationCreateWithoutPolicyAssignmentsInput, OrganizationUncheckedCreateWithoutPolicyAssignmentsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutPolicyAssignmentsInput
    upsert?: OrganizationUpsertWithoutPolicyAssignmentsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutPolicyAssignmentsInput, OrganizationUpdateWithoutPolicyAssignmentsInput>, OrganizationUncheckedUpdateWithoutPolicyAssignmentsInput>
  }

  export type RepositoryUpdateOneWithoutPolicyAssignmentsNestedInput = {
    create?: XOR<RepositoryCreateWithoutPolicyAssignmentsInput, RepositoryUncheckedCreateWithoutPolicyAssignmentsInput>
    connectOrCreate?: RepositoryCreateOrConnectWithoutPolicyAssignmentsInput
    upsert?: RepositoryUpsertWithoutPolicyAssignmentsInput
    disconnect?: RepositoryWhereInput | boolean
    delete?: RepositoryWhereInput | boolean
    connect?: RepositoryWhereUniqueInput
    update?: XOR<XOR<RepositoryUpdateToOneWithWhereWithoutPolicyAssignmentsInput, RepositoryUpdateWithoutPolicyAssignmentsInput>, RepositoryUncheckedUpdateWithoutPolicyAssignmentsInput>
  }

  export type PolicyPackUpdateOneRequiredWithoutAssignmentsNestedInput = {
    create?: XOR<PolicyPackCreateWithoutAssignmentsInput, PolicyPackUncheckedCreateWithoutAssignmentsInput>
    connectOrCreate?: PolicyPackCreateOrConnectWithoutAssignmentsInput
    upsert?: PolicyPackUpsertWithoutAssignmentsInput
    connect?: PolicyPackWhereUniqueInput
    update?: XOR<XOR<PolicyPackUpdateToOneWithWhereWithoutAssignmentsInput, PolicyPackUpdateWithoutAssignmentsInput>, PolicyPackUncheckedUpdateWithoutAssignmentsInput>
  }

  export type OrganizationCreateNestedOneWithoutWebhookReceiptsInput = {
    create?: XOR<OrganizationCreateWithoutWebhookReceiptsInput, OrganizationUncheckedCreateWithoutWebhookReceiptsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutWebhookReceiptsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type OrganizationUpdateOneRequiredWithoutWebhookReceiptsNestedInput = {
    create?: XOR<OrganizationCreateWithoutWebhookReceiptsInput, OrganizationUncheckedCreateWithoutWebhookReceiptsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutWebhookReceiptsInput
    upsert?: OrganizationUpsertWithoutWebhookReceiptsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutWebhookReceiptsInput, OrganizationUpdateWithoutWebhookReceiptsInput>, OrganizationUncheckedUpdateWithoutWebhookReceiptsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type RepositoryCreateWithoutOrganizationInput = {
    id?: string
    name: string
    createdAt?: Date | string
    projects?: ProjectCreateNestedManyWithoutRepositoryInput
    runs?: ReadyLayerRunCreateNestedManyWithoutRepositoryInput
    evidenceAttestations?: EvidenceAttestationCreateNestedManyWithoutRepositoryInput
    policyAssignments?: PolicyPackAssignmentCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUncheckedCreateWithoutOrganizationInput = {
    id?: string
    name: string
    createdAt?: Date | string
    projects?: ProjectUncheckedCreateNestedManyWithoutRepositoryInput
    runs?: ReadyLayerRunUncheckedCreateNestedManyWithoutRepositoryInput
    evidenceAttestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutRepositoryInput
    policyAssignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryCreateOrConnectWithoutOrganizationInput = {
    where: RepositoryWhereUniqueInput
    create: XOR<RepositoryCreateWithoutOrganizationInput, RepositoryUncheckedCreateWithoutOrganizationInput>
  }

  export type RepositoryCreateManyOrganizationInputEnvelope = {
    data: RepositoryCreateManyOrganizationInput | RepositoryCreateManyOrganizationInput[]
  }

  export type ReadyLayerRunCreateWithoutOrganizationInput = {
    id?: string
    status: string
    createdAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutRunsInput
    attestations?: EvidenceAttestationCreateNestedManyWithoutRunInput
  }

  export type ReadyLayerRunUncheckedCreateWithoutOrganizationInput = {
    id?: string
    repositoryId: string
    status: string
    createdAt?: Date | string
    attestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutRunInput
  }

  export type ReadyLayerRunCreateOrConnectWithoutOrganizationInput = {
    where: ReadyLayerRunWhereUniqueInput
    create: XOR<ReadyLayerRunCreateWithoutOrganizationInput, ReadyLayerRunUncheckedCreateWithoutOrganizationInput>
  }

  export type ReadyLayerRunCreateManyOrganizationInputEnvelope = {
    data: ReadyLayerRunCreateManyOrganizationInput | ReadyLayerRunCreateManyOrganizationInput[]
  }

  export type EvidenceAttestationCreateWithoutOrganizationInput = {
    id?: string
    manifestHash: string
    bundleHash: string
    treeHash: string
    signingMode: string
    signature?: string | null
    publicKeyId?: string | null
    createdAt?: Date | string
    repository: RepositoryCreateNestedOneWithoutEvidenceAttestationsInput
    run: ReadyLayerRunCreateNestedOneWithoutAttestationsInput
  }

  export type EvidenceAttestationUncheckedCreateWithoutOrganizationInput = {
    id?: string
    repositoryId: string
    runId: string
    manifestHash: string
    bundleHash: string
    treeHash: string
    signingMode: string
    signature?: string | null
    publicKeyId?: string | null
    createdAt?: Date | string
  }

  export type EvidenceAttestationCreateOrConnectWithoutOrganizationInput = {
    where: EvidenceAttestationWhereUniqueInput
    create: XOR<EvidenceAttestationCreateWithoutOrganizationInput, EvidenceAttestationUncheckedCreateWithoutOrganizationInput>
  }

  export type EvidenceAttestationCreateManyOrganizationInputEnvelope = {
    data: EvidenceAttestationCreateManyOrganizationInput | EvidenceAttestationCreateManyOrganizationInput[]
  }

  export type EvidenceObjectCreateWithoutOrganizationInput = {
    id?: string
    runId?: string | null
    kind: string
    storageProvider: string
    storageKey: string
    sizeBytes: number
    contentHash: string
    createdAt?: Date | string
  }

  export type EvidenceObjectUncheckedCreateWithoutOrganizationInput = {
    id?: string
    runId?: string | null
    kind: string
    storageProvider: string
    storageKey: string
    sizeBytes: number
    contentHash: string
    createdAt?: Date | string
  }

  export type EvidenceObjectCreateOrConnectWithoutOrganizationInput = {
    where: EvidenceObjectWhereUniqueInput
    create: XOR<EvidenceObjectCreateWithoutOrganizationInput, EvidenceObjectUncheckedCreateWithoutOrganizationInput>
  }

  export type EvidenceObjectCreateManyOrganizationInputEnvelope = {
    data: EvidenceObjectCreateManyOrganizationInput | EvidenceObjectCreateManyOrganizationInput[]
  }

  export type PolicyPackCreateWithoutOrganizationInput = {
    id?: string
    name: string
    version: string
    description?: string | null
    contentsJson: string
    packHash: string
    signature?: string | null
    signingMode: string
    createdAt?: Date | string
    assignments?: PolicyPackAssignmentCreateNestedManyWithoutPolicyPackInput
  }

  export type PolicyPackUncheckedCreateWithoutOrganizationInput = {
    id?: string
    name: string
    version: string
    description?: string | null
    contentsJson: string
    packHash: string
    signature?: string | null
    signingMode: string
    createdAt?: Date | string
    assignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutPolicyPackInput
  }

  export type PolicyPackCreateOrConnectWithoutOrganizationInput = {
    where: PolicyPackWhereUniqueInput
    create: XOR<PolicyPackCreateWithoutOrganizationInput, PolicyPackUncheckedCreateWithoutOrganizationInput>
  }

  export type PolicyPackCreateManyOrganizationInputEnvelope = {
    data: PolicyPackCreateManyOrganizationInput | PolicyPackCreateManyOrganizationInput[]
  }

  export type PolicyPackAssignmentCreateWithoutOrganizationInput = {
    id?: string
    scope: string
    enabled: boolean
    createdAt?: Date | string
    repository?: RepositoryCreateNestedOneWithoutPolicyAssignmentsInput
    policyPack: PolicyPackCreateNestedOneWithoutAssignmentsInput
  }

  export type PolicyPackAssignmentUncheckedCreateWithoutOrganizationInput = {
    id?: string
    repositoryId?: string | null
    scope: string
    policyPackId: string
    enabled: boolean
    createdAt?: Date | string
  }

  export type PolicyPackAssignmentCreateOrConnectWithoutOrganizationInput = {
    where: PolicyPackAssignmentWhereUniqueInput
    create: XOR<PolicyPackAssignmentCreateWithoutOrganizationInput, PolicyPackAssignmentUncheckedCreateWithoutOrganizationInput>
  }

  export type PolicyPackAssignmentCreateManyOrganizationInputEnvelope = {
    data: PolicyPackAssignmentCreateManyOrganizationInput | PolicyPackAssignmentCreateManyOrganizationInput[]
  }

  export type WebhookReceiptCreateWithoutOrganizationInput = {
    id?: string
    provider: string
    deliveryId: string
    receivedAt?: Date | string
    bodyHash: string
    signatureValid: boolean
    replayBlocked: boolean
    processed: boolean
    correlationId?: string | null
  }

  export type WebhookReceiptUncheckedCreateWithoutOrganizationInput = {
    id?: string
    provider: string
    deliveryId: string
    receivedAt?: Date | string
    bodyHash: string
    signatureValid: boolean
    replayBlocked: boolean
    processed: boolean
    correlationId?: string | null
  }

  export type WebhookReceiptCreateOrConnectWithoutOrganizationInput = {
    where: WebhookReceiptWhereUniqueInput
    create: XOR<WebhookReceiptCreateWithoutOrganizationInput, WebhookReceiptUncheckedCreateWithoutOrganizationInput>
  }

  export type WebhookReceiptCreateManyOrganizationInputEnvelope = {
    data: WebhookReceiptCreateManyOrganizationInput | WebhookReceiptCreateManyOrganizationInput[]
  }

  export type RepositoryUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: RepositoryWhereUniqueInput
    update: XOR<RepositoryUpdateWithoutOrganizationInput, RepositoryUncheckedUpdateWithoutOrganizationInput>
    create: XOR<RepositoryCreateWithoutOrganizationInput, RepositoryUncheckedCreateWithoutOrganizationInput>
  }

  export type RepositoryUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: RepositoryWhereUniqueInput
    data: XOR<RepositoryUpdateWithoutOrganizationInput, RepositoryUncheckedUpdateWithoutOrganizationInput>
  }

  export type RepositoryUpdateManyWithWhereWithoutOrganizationInput = {
    where: RepositoryScalarWhereInput
    data: XOR<RepositoryUpdateManyMutationInput, RepositoryUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type RepositoryScalarWhereInput = {
    AND?: RepositoryScalarWhereInput | RepositoryScalarWhereInput[]
    OR?: RepositoryScalarWhereInput[]
    NOT?: RepositoryScalarWhereInput | RepositoryScalarWhereInput[]
    id?: StringFilter<"Repository"> | string
    organizationId?: StringFilter<"Repository"> | string
    name?: StringFilter<"Repository"> | string
    createdAt?: DateTimeFilter<"Repository"> | Date | string
  }

  export type ReadyLayerRunUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: ReadyLayerRunWhereUniqueInput
    update: XOR<ReadyLayerRunUpdateWithoutOrganizationInput, ReadyLayerRunUncheckedUpdateWithoutOrganizationInput>
    create: XOR<ReadyLayerRunCreateWithoutOrganizationInput, ReadyLayerRunUncheckedCreateWithoutOrganizationInput>
  }

  export type ReadyLayerRunUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: ReadyLayerRunWhereUniqueInput
    data: XOR<ReadyLayerRunUpdateWithoutOrganizationInput, ReadyLayerRunUncheckedUpdateWithoutOrganizationInput>
  }

  export type ReadyLayerRunUpdateManyWithWhereWithoutOrganizationInput = {
    where: ReadyLayerRunScalarWhereInput
    data: XOR<ReadyLayerRunUpdateManyMutationInput, ReadyLayerRunUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type ReadyLayerRunScalarWhereInput = {
    AND?: ReadyLayerRunScalarWhereInput | ReadyLayerRunScalarWhereInput[]
    OR?: ReadyLayerRunScalarWhereInput[]
    NOT?: ReadyLayerRunScalarWhereInput | ReadyLayerRunScalarWhereInput[]
    id?: StringFilter<"ReadyLayerRun"> | string
    organizationId?: StringFilter<"ReadyLayerRun"> | string
    repositoryId?: StringFilter<"ReadyLayerRun"> | string
    status?: StringFilter<"ReadyLayerRun"> | string
    createdAt?: DateTimeFilter<"ReadyLayerRun"> | Date | string
  }

  export type EvidenceAttestationUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: EvidenceAttestationWhereUniqueInput
    update: XOR<EvidenceAttestationUpdateWithoutOrganizationInput, EvidenceAttestationUncheckedUpdateWithoutOrganizationInput>
    create: XOR<EvidenceAttestationCreateWithoutOrganizationInput, EvidenceAttestationUncheckedCreateWithoutOrganizationInput>
  }

  export type EvidenceAttestationUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: EvidenceAttestationWhereUniqueInput
    data: XOR<EvidenceAttestationUpdateWithoutOrganizationInput, EvidenceAttestationUncheckedUpdateWithoutOrganizationInput>
  }

  export type EvidenceAttestationUpdateManyWithWhereWithoutOrganizationInput = {
    where: EvidenceAttestationScalarWhereInput
    data: XOR<EvidenceAttestationUpdateManyMutationInput, EvidenceAttestationUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type EvidenceAttestationScalarWhereInput = {
    AND?: EvidenceAttestationScalarWhereInput | EvidenceAttestationScalarWhereInput[]
    OR?: EvidenceAttestationScalarWhereInput[]
    NOT?: EvidenceAttestationScalarWhereInput | EvidenceAttestationScalarWhereInput[]
    id?: StringFilter<"EvidenceAttestation"> | string
    organizationId?: StringFilter<"EvidenceAttestation"> | string
    repositoryId?: StringFilter<"EvidenceAttestation"> | string
    runId?: StringFilter<"EvidenceAttestation"> | string
    manifestHash?: StringFilter<"EvidenceAttestation"> | string
    bundleHash?: StringFilter<"EvidenceAttestation"> | string
    treeHash?: StringFilter<"EvidenceAttestation"> | string
    signingMode?: StringFilter<"EvidenceAttestation"> | string
    signature?: StringNullableFilter<"EvidenceAttestation"> | string | null
    publicKeyId?: StringNullableFilter<"EvidenceAttestation"> | string | null
    createdAt?: DateTimeFilter<"EvidenceAttestation"> | Date | string
  }

  export type EvidenceObjectUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: EvidenceObjectWhereUniqueInput
    update: XOR<EvidenceObjectUpdateWithoutOrganizationInput, EvidenceObjectUncheckedUpdateWithoutOrganizationInput>
    create: XOR<EvidenceObjectCreateWithoutOrganizationInput, EvidenceObjectUncheckedCreateWithoutOrganizationInput>
  }

  export type EvidenceObjectUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: EvidenceObjectWhereUniqueInput
    data: XOR<EvidenceObjectUpdateWithoutOrganizationInput, EvidenceObjectUncheckedUpdateWithoutOrganizationInput>
  }

  export type EvidenceObjectUpdateManyWithWhereWithoutOrganizationInput = {
    where: EvidenceObjectScalarWhereInput
    data: XOR<EvidenceObjectUpdateManyMutationInput, EvidenceObjectUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type EvidenceObjectScalarWhereInput = {
    AND?: EvidenceObjectScalarWhereInput | EvidenceObjectScalarWhereInput[]
    OR?: EvidenceObjectScalarWhereInput[]
    NOT?: EvidenceObjectScalarWhereInput | EvidenceObjectScalarWhereInput[]
    id?: StringFilter<"EvidenceObject"> | string
    organizationId?: StringFilter<"EvidenceObject"> | string
    runId?: StringNullableFilter<"EvidenceObject"> | string | null
    kind?: StringFilter<"EvidenceObject"> | string
    storageProvider?: StringFilter<"EvidenceObject"> | string
    storageKey?: StringFilter<"EvidenceObject"> | string
    sizeBytes?: IntFilter<"EvidenceObject"> | number
    contentHash?: StringFilter<"EvidenceObject"> | string
    createdAt?: DateTimeFilter<"EvidenceObject"> | Date | string
  }

  export type PolicyPackUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: PolicyPackWhereUniqueInput
    update: XOR<PolicyPackUpdateWithoutOrganizationInput, PolicyPackUncheckedUpdateWithoutOrganizationInput>
    create: XOR<PolicyPackCreateWithoutOrganizationInput, PolicyPackUncheckedCreateWithoutOrganizationInput>
  }

  export type PolicyPackUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: PolicyPackWhereUniqueInput
    data: XOR<PolicyPackUpdateWithoutOrganizationInput, PolicyPackUncheckedUpdateWithoutOrganizationInput>
  }

  export type PolicyPackUpdateManyWithWhereWithoutOrganizationInput = {
    where: PolicyPackScalarWhereInput
    data: XOR<PolicyPackUpdateManyMutationInput, PolicyPackUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type PolicyPackScalarWhereInput = {
    AND?: PolicyPackScalarWhereInput | PolicyPackScalarWhereInput[]
    OR?: PolicyPackScalarWhereInput[]
    NOT?: PolicyPackScalarWhereInput | PolicyPackScalarWhereInput[]
    id?: StringFilter<"PolicyPack"> | string
    organizationId?: StringFilter<"PolicyPack"> | string
    name?: StringFilter<"PolicyPack"> | string
    version?: StringFilter<"PolicyPack"> | string
    description?: StringNullableFilter<"PolicyPack"> | string | null
    contentsJson?: StringFilter<"PolicyPack"> | string
    packHash?: StringFilter<"PolicyPack"> | string
    signature?: StringNullableFilter<"PolicyPack"> | string | null
    signingMode?: StringFilter<"PolicyPack"> | string
    createdAt?: DateTimeFilter<"PolicyPack"> | Date | string
  }

  export type PolicyPackAssignmentUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: PolicyPackAssignmentWhereUniqueInput
    update: XOR<PolicyPackAssignmentUpdateWithoutOrganizationInput, PolicyPackAssignmentUncheckedUpdateWithoutOrganizationInput>
    create: XOR<PolicyPackAssignmentCreateWithoutOrganizationInput, PolicyPackAssignmentUncheckedCreateWithoutOrganizationInput>
  }

  export type PolicyPackAssignmentUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: PolicyPackAssignmentWhereUniqueInput
    data: XOR<PolicyPackAssignmentUpdateWithoutOrganizationInput, PolicyPackAssignmentUncheckedUpdateWithoutOrganizationInput>
  }

  export type PolicyPackAssignmentUpdateManyWithWhereWithoutOrganizationInput = {
    where: PolicyPackAssignmentScalarWhereInput
    data: XOR<PolicyPackAssignmentUpdateManyMutationInput, PolicyPackAssignmentUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type PolicyPackAssignmentScalarWhereInput = {
    AND?: PolicyPackAssignmentScalarWhereInput | PolicyPackAssignmentScalarWhereInput[]
    OR?: PolicyPackAssignmentScalarWhereInput[]
    NOT?: PolicyPackAssignmentScalarWhereInput | PolicyPackAssignmentScalarWhereInput[]
    id?: StringFilter<"PolicyPackAssignment"> | string
    organizationId?: StringFilter<"PolicyPackAssignment"> | string
    repositoryId?: StringNullableFilter<"PolicyPackAssignment"> | string | null
    scope?: StringFilter<"PolicyPackAssignment"> | string
    policyPackId?: StringFilter<"PolicyPackAssignment"> | string
    enabled?: BoolFilter<"PolicyPackAssignment"> | boolean
    createdAt?: DateTimeFilter<"PolicyPackAssignment"> | Date | string
  }

  export type WebhookReceiptUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: WebhookReceiptWhereUniqueInput
    update: XOR<WebhookReceiptUpdateWithoutOrganizationInput, WebhookReceiptUncheckedUpdateWithoutOrganizationInput>
    create: XOR<WebhookReceiptCreateWithoutOrganizationInput, WebhookReceiptUncheckedCreateWithoutOrganizationInput>
  }

  export type WebhookReceiptUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: WebhookReceiptWhereUniqueInput
    data: XOR<WebhookReceiptUpdateWithoutOrganizationInput, WebhookReceiptUncheckedUpdateWithoutOrganizationInput>
  }

  export type WebhookReceiptUpdateManyWithWhereWithoutOrganizationInput = {
    where: WebhookReceiptScalarWhereInput
    data: XOR<WebhookReceiptUpdateManyMutationInput, WebhookReceiptUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type WebhookReceiptScalarWhereInput = {
    AND?: WebhookReceiptScalarWhereInput | WebhookReceiptScalarWhereInput[]
    OR?: WebhookReceiptScalarWhereInput[]
    NOT?: WebhookReceiptScalarWhereInput | WebhookReceiptScalarWhereInput[]
    id?: StringFilter<"WebhookReceipt"> | string
    organizationId?: StringFilter<"WebhookReceipt"> | string
    provider?: StringFilter<"WebhookReceipt"> | string
    deliveryId?: StringFilter<"WebhookReceipt"> | string
    receivedAt?: DateTimeFilter<"WebhookReceipt"> | Date | string
    bodyHash?: StringFilter<"WebhookReceipt"> | string
    signatureValid?: BoolFilter<"WebhookReceipt"> | boolean
    replayBlocked?: BoolFilter<"WebhookReceipt"> | boolean
    processed?: BoolFilter<"WebhookReceipt"> | boolean
    correlationId?: StringNullableFilter<"WebhookReceipt"> | string | null
  }

  export type OrganizationCreateWithoutRepositoriesInput = {
    id?: string
    name: string
    createdAt?: Date | string
    runs?: ReadyLayerRunCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutRepositoriesInput = {
    id?: string
    name: string
    createdAt?: Date | string
    runs?: ReadyLayerRunUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectUncheckedCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackUncheckedCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutRepositoriesInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutRepositoriesInput, OrganizationUncheckedCreateWithoutRepositoriesInput>
  }

  export type ProjectCreateWithoutRepositoryInput = {
    id?: string
    name: string
  }

  export type ProjectUncheckedCreateWithoutRepositoryInput = {
    id?: string
    name: string
  }

  export type ProjectCreateOrConnectWithoutRepositoryInput = {
    where: ProjectWhereUniqueInput
    create: XOR<ProjectCreateWithoutRepositoryInput, ProjectUncheckedCreateWithoutRepositoryInput>
  }

  export type ProjectCreateManyRepositoryInputEnvelope = {
    data: ProjectCreateManyRepositoryInput | ProjectCreateManyRepositoryInput[]
  }

  export type ReadyLayerRunCreateWithoutRepositoryInput = {
    id?: string
    status: string
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutRunsInput
    attestations?: EvidenceAttestationCreateNestedManyWithoutRunInput
  }

  export type ReadyLayerRunUncheckedCreateWithoutRepositoryInput = {
    id?: string
    organizationId: string
    status: string
    createdAt?: Date | string
    attestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutRunInput
  }

  export type ReadyLayerRunCreateOrConnectWithoutRepositoryInput = {
    where: ReadyLayerRunWhereUniqueInput
    create: XOR<ReadyLayerRunCreateWithoutRepositoryInput, ReadyLayerRunUncheckedCreateWithoutRepositoryInput>
  }

  export type ReadyLayerRunCreateManyRepositoryInputEnvelope = {
    data: ReadyLayerRunCreateManyRepositoryInput | ReadyLayerRunCreateManyRepositoryInput[]
  }

  export type EvidenceAttestationCreateWithoutRepositoryInput = {
    id?: string
    manifestHash: string
    bundleHash: string
    treeHash: string
    signingMode: string
    signature?: string | null
    publicKeyId?: string | null
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutEvidenceAttestationsInput
    run: ReadyLayerRunCreateNestedOneWithoutAttestationsInput
  }

  export type EvidenceAttestationUncheckedCreateWithoutRepositoryInput = {
    id?: string
    organizationId: string
    runId: string
    manifestHash: string
    bundleHash: string
    treeHash: string
    signingMode: string
    signature?: string | null
    publicKeyId?: string | null
    createdAt?: Date | string
  }

  export type EvidenceAttestationCreateOrConnectWithoutRepositoryInput = {
    where: EvidenceAttestationWhereUniqueInput
    create: XOR<EvidenceAttestationCreateWithoutRepositoryInput, EvidenceAttestationUncheckedCreateWithoutRepositoryInput>
  }

  export type EvidenceAttestationCreateManyRepositoryInputEnvelope = {
    data: EvidenceAttestationCreateManyRepositoryInput | EvidenceAttestationCreateManyRepositoryInput[]
  }

  export type PolicyPackAssignmentCreateWithoutRepositoryInput = {
    id?: string
    scope: string
    enabled: boolean
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutPolicyAssignmentsInput
    policyPack: PolicyPackCreateNestedOneWithoutAssignmentsInput
  }

  export type PolicyPackAssignmentUncheckedCreateWithoutRepositoryInput = {
    id?: string
    organizationId: string
    scope: string
    policyPackId: string
    enabled: boolean
    createdAt?: Date | string
  }

  export type PolicyPackAssignmentCreateOrConnectWithoutRepositoryInput = {
    where: PolicyPackAssignmentWhereUniqueInput
    create: XOR<PolicyPackAssignmentCreateWithoutRepositoryInput, PolicyPackAssignmentUncheckedCreateWithoutRepositoryInput>
  }

  export type PolicyPackAssignmentCreateManyRepositoryInputEnvelope = {
    data: PolicyPackAssignmentCreateManyRepositoryInput | PolicyPackAssignmentCreateManyRepositoryInput[]
  }

  export type OrganizationUpsertWithoutRepositoriesInput = {
    update: XOR<OrganizationUpdateWithoutRepositoriesInput, OrganizationUncheckedUpdateWithoutRepositoriesInput>
    create: XOR<OrganizationCreateWithoutRepositoriesInput, OrganizationUncheckedCreateWithoutRepositoriesInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutRepositoriesInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutRepositoriesInput, OrganizationUncheckedUpdateWithoutRepositoriesInput>
  }

  export type OrganizationUpdateWithoutRepositoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    runs?: ReadyLayerRunUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutRepositoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    runs?: ReadyLayerRunUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUncheckedUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUncheckedUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type ProjectUpsertWithWhereUniqueWithoutRepositoryInput = {
    where: ProjectWhereUniqueInput
    update: XOR<ProjectUpdateWithoutRepositoryInput, ProjectUncheckedUpdateWithoutRepositoryInput>
    create: XOR<ProjectCreateWithoutRepositoryInput, ProjectUncheckedCreateWithoutRepositoryInput>
  }

  export type ProjectUpdateWithWhereUniqueWithoutRepositoryInput = {
    where: ProjectWhereUniqueInput
    data: XOR<ProjectUpdateWithoutRepositoryInput, ProjectUncheckedUpdateWithoutRepositoryInput>
  }

  export type ProjectUpdateManyWithWhereWithoutRepositoryInput = {
    where: ProjectScalarWhereInput
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyWithoutRepositoryInput>
  }

  export type ProjectScalarWhereInput = {
    AND?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
    OR?: ProjectScalarWhereInput[]
    NOT?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
    id?: StringFilter<"Project"> | string
    repositoryId?: StringFilter<"Project"> | string
    name?: StringFilter<"Project"> | string
  }

  export type ReadyLayerRunUpsertWithWhereUniqueWithoutRepositoryInput = {
    where: ReadyLayerRunWhereUniqueInput
    update: XOR<ReadyLayerRunUpdateWithoutRepositoryInput, ReadyLayerRunUncheckedUpdateWithoutRepositoryInput>
    create: XOR<ReadyLayerRunCreateWithoutRepositoryInput, ReadyLayerRunUncheckedCreateWithoutRepositoryInput>
  }

  export type ReadyLayerRunUpdateWithWhereUniqueWithoutRepositoryInput = {
    where: ReadyLayerRunWhereUniqueInput
    data: XOR<ReadyLayerRunUpdateWithoutRepositoryInput, ReadyLayerRunUncheckedUpdateWithoutRepositoryInput>
  }

  export type ReadyLayerRunUpdateManyWithWhereWithoutRepositoryInput = {
    where: ReadyLayerRunScalarWhereInput
    data: XOR<ReadyLayerRunUpdateManyMutationInput, ReadyLayerRunUncheckedUpdateManyWithoutRepositoryInput>
  }

  export type EvidenceAttestationUpsertWithWhereUniqueWithoutRepositoryInput = {
    where: EvidenceAttestationWhereUniqueInput
    update: XOR<EvidenceAttestationUpdateWithoutRepositoryInput, EvidenceAttestationUncheckedUpdateWithoutRepositoryInput>
    create: XOR<EvidenceAttestationCreateWithoutRepositoryInput, EvidenceAttestationUncheckedCreateWithoutRepositoryInput>
  }

  export type EvidenceAttestationUpdateWithWhereUniqueWithoutRepositoryInput = {
    where: EvidenceAttestationWhereUniqueInput
    data: XOR<EvidenceAttestationUpdateWithoutRepositoryInput, EvidenceAttestationUncheckedUpdateWithoutRepositoryInput>
  }

  export type EvidenceAttestationUpdateManyWithWhereWithoutRepositoryInput = {
    where: EvidenceAttestationScalarWhereInput
    data: XOR<EvidenceAttestationUpdateManyMutationInput, EvidenceAttestationUncheckedUpdateManyWithoutRepositoryInput>
  }

  export type PolicyPackAssignmentUpsertWithWhereUniqueWithoutRepositoryInput = {
    where: PolicyPackAssignmentWhereUniqueInput
    update: XOR<PolicyPackAssignmentUpdateWithoutRepositoryInput, PolicyPackAssignmentUncheckedUpdateWithoutRepositoryInput>
    create: XOR<PolicyPackAssignmentCreateWithoutRepositoryInput, PolicyPackAssignmentUncheckedCreateWithoutRepositoryInput>
  }

  export type PolicyPackAssignmentUpdateWithWhereUniqueWithoutRepositoryInput = {
    where: PolicyPackAssignmentWhereUniqueInput
    data: XOR<PolicyPackAssignmentUpdateWithoutRepositoryInput, PolicyPackAssignmentUncheckedUpdateWithoutRepositoryInput>
  }

  export type PolicyPackAssignmentUpdateManyWithWhereWithoutRepositoryInput = {
    where: PolicyPackAssignmentScalarWhereInput
    data: XOR<PolicyPackAssignmentUpdateManyMutationInput, PolicyPackAssignmentUncheckedUpdateManyWithoutRepositoryInput>
  }

  export type RepositoryCreateWithoutProjectsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutRepositoriesInput
    runs?: ReadyLayerRunCreateNestedManyWithoutRepositoryInput
    evidenceAttestations?: EvidenceAttestationCreateNestedManyWithoutRepositoryInput
    policyAssignments?: PolicyPackAssignmentCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUncheckedCreateWithoutProjectsInput = {
    id?: string
    organizationId: string
    name: string
    createdAt?: Date | string
    runs?: ReadyLayerRunUncheckedCreateNestedManyWithoutRepositoryInput
    evidenceAttestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutRepositoryInput
    policyAssignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryCreateOrConnectWithoutProjectsInput = {
    where: RepositoryWhereUniqueInput
    create: XOR<RepositoryCreateWithoutProjectsInput, RepositoryUncheckedCreateWithoutProjectsInput>
  }

  export type RepositoryUpsertWithoutProjectsInput = {
    update: XOR<RepositoryUpdateWithoutProjectsInput, RepositoryUncheckedUpdateWithoutProjectsInput>
    create: XOR<RepositoryCreateWithoutProjectsInput, RepositoryUncheckedCreateWithoutProjectsInput>
    where?: RepositoryWhereInput
  }

  export type RepositoryUpdateToOneWithWhereWithoutProjectsInput = {
    where?: RepositoryWhereInput
    data: XOR<RepositoryUpdateWithoutProjectsInput, RepositoryUncheckedUpdateWithoutProjectsInput>
  }

  export type RepositoryUpdateWithoutProjectsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutRepositoriesNestedInput
    runs?: ReadyLayerRunUpdateManyWithoutRepositoryNestedInput
    evidenceAttestations?: EvidenceAttestationUpdateManyWithoutRepositoryNestedInput
    policyAssignments?: PolicyPackAssignmentUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateWithoutProjectsInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    runs?: ReadyLayerRunUncheckedUpdateManyWithoutRepositoryNestedInput
    evidenceAttestations?: EvidenceAttestationUncheckedUpdateManyWithoutRepositoryNestedInput
    policyAssignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutRepositoryNestedInput
  }

  export type OrganizationCreateWithoutRunsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutRunsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectUncheckedCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackUncheckedCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutRunsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutRunsInput, OrganizationUncheckedCreateWithoutRunsInput>
  }

  export type RepositoryCreateWithoutRunsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutRepositoriesInput
    projects?: ProjectCreateNestedManyWithoutRepositoryInput
    evidenceAttestations?: EvidenceAttestationCreateNestedManyWithoutRepositoryInput
    policyAssignments?: PolicyPackAssignmentCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUncheckedCreateWithoutRunsInput = {
    id?: string
    organizationId: string
    name: string
    createdAt?: Date | string
    projects?: ProjectUncheckedCreateNestedManyWithoutRepositoryInput
    evidenceAttestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutRepositoryInput
    policyAssignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryCreateOrConnectWithoutRunsInput = {
    where: RepositoryWhereUniqueInput
    create: XOR<RepositoryCreateWithoutRunsInput, RepositoryUncheckedCreateWithoutRunsInput>
  }

  export type EvidenceAttestationCreateWithoutRunInput = {
    id?: string
    manifestHash: string
    bundleHash: string
    treeHash: string
    signingMode: string
    signature?: string | null
    publicKeyId?: string | null
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutEvidenceAttestationsInput
    repository: RepositoryCreateNestedOneWithoutEvidenceAttestationsInput
  }

  export type EvidenceAttestationUncheckedCreateWithoutRunInput = {
    id?: string
    organizationId: string
    repositoryId: string
    manifestHash: string
    bundleHash: string
    treeHash: string
    signingMode: string
    signature?: string | null
    publicKeyId?: string | null
    createdAt?: Date | string
  }

  export type EvidenceAttestationCreateOrConnectWithoutRunInput = {
    where: EvidenceAttestationWhereUniqueInput
    create: XOR<EvidenceAttestationCreateWithoutRunInput, EvidenceAttestationUncheckedCreateWithoutRunInput>
  }

  export type EvidenceAttestationCreateManyRunInputEnvelope = {
    data: EvidenceAttestationCreateManyRunInput | EvidenceAttestationCreateManyRunInput[]
  }

  export type OrganizationUpsertWithoutRunsInput = {
    update: XOR<OrganizationUpdateWithoutRunsInput, OrganizationUncheckedUpdateWithoutRunsInput>
    create: XOR<OrganizationCreateWithoutRunsInput, OrganizationUncheckedCreateWithoutRunsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutRunsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutRunsInput, OrganizationUncheckedUpdateWithoutRunsInput>
  }

  export type OrganizationUpdateWithoutRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUncheckedUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUncheckedUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type RepositoryUpsertWithoutRunsInput = {
    update: XOR<RepositoryUpdateWithoutRunsInput, RepositoryUncheckedUpdateWithoutRunsInput>
    create: XOR<RepositoryCreateWithoutRunsInput, RepositoryUncheckedCreateWithoutRunsInput>
    where?: RepositoryWhereInput
  }

  export type RepositoryUpdateToOneWithWhereWithoutRunsInput = {
    where?: RepositoryWhereInput
    data: XOR<RepositoryUpdateWithoutRunsInput, RepositoryUncheckedUpdateWithoutRunsInput>
  }

  export type RepositoryUpdateWithoutRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutRepositoriesNestedInput
    projects?: ProjectUpdateManyWithoutRepositoryNestedInput
    evidenceAttestations?: EvidenceAttestationUpdateManyWithoutRepositoryNestedInput
    policyAssignments?: PolicyPackAssignmentUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateWithoutRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    projects?: ProjectUncheckedUpdateManyWithoutRepositoryNestedInput
    evidenceAttestations?: EvidenceAttestationUncheckedUpdateManyWithoutRepositoryNestedInput
    policyAssignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutRepositoryNestedInput
  }

  export type EvidenceAttestationUpsertWithWhereUniqueWithoutRunInput = {
    where: EvidenceAttestationWhereUniqueInput
    update: XOR<EvidenceAttestationUpdateWithoutRunInput, EvidenceAttestationUncheckedUpdateWithoutRunInput>
    create: XOR<EvidenceAttestationCreateWithoutRunInput, EvidenceAttestationUncheckedCreateWithoutRunInput>
  }

  export type EvidenceAttestationUpdateWithWhereUniqueWithoutRunInput = {
    where: EvidenceAttestationWhereUniqueInput
    data: XOR<EvidenceAttestationUpdateWithoutRunInput, EvidenceAttestationUncheckedUpdateWithoutRunInput>
  }

  export type EvidenceAttestationUpdateManyWithWhereWithoutRunInput = {
    where: EvidenceAttestationScalarWhereInput
    data: XOR<EvidenceAttestationUpdateManyMutationInput, EvidenceAttestationUncheckedUpdateManyWithoutRunInput>
  }

  export type OrganizationCreateWithoutEvidenceAttestationsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryCreateNestedManyWithoutOrganizationInput
    runs?: ReadyLayerRunCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutEvidenceAttestationsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryUncheckedCreateNestedManyWithoutOrganizationInput
    runs?: ReadyLayerRunUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectUncheckedCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackUncheckedCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutEvidenceAttestationsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutEvidenceAttestationsInput, OrganizationUncheckedCreateWithoutEvidenceAttestationsInput>
  }

  export type RepositoryCreateWithoutEvidenceAttestationsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutRepositoriesInput
    projects?: ProjectCreateNestedManyWithoutRepositoryInput
    runs?: ReadyLayerRunCreateNestedManyWithoutRepositoryInput
    policyAssignments?: PolicyPackAssignmentCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUncheckedCreateWithoutEvidenceAttestationsInput = {
    id?: string
    organizationId: string
    name: string
    createdAt?: Date | string
    projects?: ProjectUncheckedCreateNestedManyWithoutRepositoryInput
    runs?: ReadyLayerRunUncheckedCreateNestedManyWithoutRepositoryInput
    policyAssignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryCreateOrConnectWithoutEvidenceAttestationsInput = {
    where: RepositoryWhereUniqueInput
    create: XOR<RepositoryCreateWithoutEvidenceAttestationsInput, RepositoryUncheckedCreateWithoutEvidenceAttestationsInput>
  }

  export type ReadyLayerRunCreateWithoutAttestationsInput = {
    id?: string
    status: string
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutRunsInput
    repository: RepositoryCreateNestedOneWithoutRunsInput
  }

  export type ReadyLayerRunUncheckedCreateWithoutAttestationsInput = {
    id?: string
    organizationId: string
    repositoryId: string
    status: string
    createdAt?: Date | string
  }

  export type ReadyLayerRunCreateOrConnectWithoutAttestationsInput = {
    where: ReadyLayerRunWhereUniqueInput
    create: XOR<ReadyLayerRunCreateWithoutAttestationsInput, ReadyLayerRunUncheckedCreateWithoutAttestationsInput>
  }

  export type OrganizationUpsertWithoutEvidenceAttestationsInput = {
    update: XOR<OrganizationUpdateWithoutEvidenceAttestationsInput, OrganizationUncheckedUpdateWithoutEvidenceAttestationsInput>
    create: XOR<OrganizationCreateWithoutEvidenceAttestationsInput, OrganizationUncheckedCreateWithoutEvidenceAttestationsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutEvidenceAttestationsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutEvidenceAttestationsInput, OrganizationUncheckedUpdateWithoutEvidenceAttestationsInput>
  }

  export type OrganizationUpdateWithoutEvidenceAttestationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUpdateManyWithoutOrganizationNestedInput
    runs?: ReadyLayerRunUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutEvidenceAttestationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUncheckedUpdateManyWithoutOrganizationNestedInput
    runs?: ReadyLayerRunUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUncheckedUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUncheckedUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type RepositoryUpsertWithoutEvidenceAttestationsInput = {
    update: XOR<RepositoryUpdateWithoutEvidenceAttestationsInput, RepositoryUncheckedUpdateWithoutEvidenceAttestationsInput>
    create: XOR<RepositoryCreateWithoutEvidenceAttestationsInput, RepositoryUncheckedCreateWithoutEvidenceAttestationsInput>
    where?: RepositoryWhereInput
  }

  export type RepositoryUpdateToOneWithWhereWithoutEvidenceAttestationsInput = {
    where?: RepositoryWhereInput
    data: XOR<RepositoryUpdateWithoutEvidenceAttestationsInput, RepositoryUncheckedUpdateWithoutEvidenceAttestationsInput>
  }

  export type RepositoryUpdateWithoutEvidenceAttestationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutRepositoriesNestedInput
    projects?: ProjectUpdateManyWithoutRepositoryNestedInput
    runs?: ReadyLayerRunUpdateManyWithoutRepositoryNestedInput
    policyAssignments?: PolicyPackAssignmentUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateWithoutEvidenceAttestationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    projects?: ProjectUncheckedUpdateManyWithoutRepositoryNestedInput
    runs?: ReadyLayerRunUncheckedUpdateManyWithoutRepositoryNestedInput
    policyAssignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutRepositoryNestedInput
  }

  export type ReadyLayerRunUpsertWithoutAttestationsInput = {
    update: XOR<ReadyLayerRunUpdateWithoutAttestationsInput, ReadyLayerRunUncheckedUpdateWithoutAttestationsInput>
    create: XOR<ReadyLayerRunCreateWithoutAttestationsInput, ReadyLayerRunUncheckedCreateWithoutAttestationsInput>
    where?: ReadyLayerRunWhereInput
  }

  export type ReadyLayerRunUpdateToOneWithWhereWithoutAttestationsInput = {
    where?: ReadyLayerRunWhereInput
    data: XOR<ReadyLayerRunUpdateWithoutAttestationsInput, ReadyLayerRunUncheckedUpdateWithoutAttestationsInput>
  }

  export type ReadyLayerRunUpdateWithoutAttestationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutRunsNestedInput
    repository?: RepositoryUpdateOneRequiredWithoutRunsNestedInput
  }

  export type ReadyLayerRunUncheckedUpdateWithoutAttestationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationCreateWithoutEvidenceObjectsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryCreateNestedManyWithoutOrganizationInput
    runs?: ReadyLayerRunCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutEvidenceObjectsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryUncheckedCreateNestedManyWithoutOrganizationInput
    runs?: ReadyLayerRunUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackUncheckedCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutEvidenceObjectsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutEvidenceObjectsInput, OrganizationUncheckedCreateWithoutEvidenceObjectsInput>
  }

  export type OrganizationUpsertWithoutEvidenceObjectsInput = {
    update: XOR<OrganizationUpdateWithoutEvidenceObjectsInput, OrganizationUncheckedUpdateWithoutEvidenceObjectsInput>
    create: XOR<OrganizationCreateWithoutEvidenceObjectsInput, OrganizationUncheckedCreateWithoutEvidenceObjectsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutEvidenceObjectsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutEvidenceObjectsInput, OrganizationUncheckedUpdateWithoutEvidenceObjectsInput>
  }

  export type OrganizationUpdateWithoutEvidenceObjectsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUpdateManyWithoutOrganizationNestedInput
    runs?: ReadyLayerRunUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutEvidenceObjectsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUncheckedUpdateManyWithoutOrganizationNestedInput
    runs?: ReadyLayerRunUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUncheckedUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUncheckedUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationCreateWithoutPolicyPacksInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryCreateNestedManyWithoutOrganizationInput
    runs?: ReadyLayerRunCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutPolicyPacksInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryUncheckedCreateNestedManyWithoutOrganizationInput
    runs?: ReadyLayerRunUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectUncheckedCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutPolicyPacksInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutPolicyPacksInput, OrganizationUncheckedCreateWithoutPolicyPacksInput>
  }

  export type PolicyPackAssignmentCreateWithoutPolicyPackInput = {
    id?: string
    scope: string
    enabled: boolean
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutPolicyAssignmentsInput
    repository?: RepositoryCreateNestedOneWithoutPolicyAssignmentsInput
  }

  export type PolicyPackAssignmentUncheckedCreateWithoutPolicyPackInput = {
    id?: string
    organizationId: string
    repositoryId?: string | null
    scope: string
    enabled: boolean
    createdAt?: Date | string
  }

  export type PolicyPackAssignmentCreateOrConnectWithoutPolicyPackInput = {
    where: PolicyPackAssignmentWhereUniqueInput
    create: XOR<PolicyPackAssignmentCreateWithoutPolicyPackInput, PolicyPackAssignmentUncheckedCreateWithoutPolicyPackInput>
  }

  export type PolicyPackAssignmentCreateManyPolicyPackInputEnvelope = {
    data: PolicyPackAssignmentCreateManyPolicyPackInput | PolicyPackAssignmentCreateManyPolicyPackInput[]
  }

  export type OrganizationUpsertWithoutPolicyPacksInput = {
    update: XOR<OrganizationUpdateWithoutPolicyPacksInput, OrganizationUncheckedUpdateWithoutPolicyPacksInput>
    create: XOR<OrganizationCreateWithoutPolicyPacksInput, OrganizationUncheckedCreateWithoutPolicyPacksInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutPolicyPacksInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutPolicyPacksInput, OrganizationUncheckedUpdateWithoutPolicyPacksInput>
  }

  export type OrganizationUpdateWithoutPolicyPacksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUpdateManyWithoutOrganizationNestedInput
    runs?: ReadyLayerRunUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutPolicyPacksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUncheckedUpdateManyWithoutOrganizationNestedInput
    runs?: ReadyLayerRunUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUncheckedUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type PolicyPackAssignmentUpsertWithWhereUniqueWithoutPolicyPackInput = {
    where: PolicyPackAssignmentWhereUniqueInput
    update: XOR<PolicyPackAssignmentUpdateWithoutPolicyPackInput, PolicyPackAssignmentUncheckedUpdateWithoutPolicyPackInput>
    create: XOR<PolicyPackAssignmentCreateWithoutPolicyPackInput, PolicyPackAssignmentUncheckedCreateWithoutPolicyPackInput>
  }

  export type PolicyPackAssignmentUpdateWithWhereUniqueWithoutPolicyPackInput = {
    where: PolicyPackAssignmentWhereUniqueInput
    data: XOR<PolicyPackAssignmentUpdateWithoutPolicyPackInput, PolicyPackAssignmentUncheckedUpdateWithoutPolicyPackInput>
  }

  export type PolicyPackAssignmentUpdateManyWithWhereWithoutPolicyPackInput = {
    where: PolicyPackAssignmentScalarWhereInput
    data: XOR<PolicyPackAssignmentUpdateManyMutationInput, PolicyPackAssignmentUncheckedUpdateManyWithoutPolicyPackInput>
  }

  export type OrganizationCreateWithoutPolicyAssignmentsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryCreateNestedManyWithoutOrganizationInput
    runs?: ReadyLayerRunCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutPolicyAssignmentsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryUncheckedCreateNestedManyWithoutOrganizationInput
    runs?: ReadyLayerRunUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectUncheckedCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackUncheckedCreateNestedManyWithoutOrganizationInput
    webhookReceipts?: WebhookReceiptUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutPolicyAssignmentsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutPolicyAssignmentsInput, OrganizationUncheckedCreateWithoutPolicyAssignmentsInput>
  }

  export type RepositoryCreateWithoutPolicyAssignmentsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutRepositoriesInput
    projects?: ProjectCreateNestedManyWithoutRepositoryInput
    runs?: ReadyLayerRunCreateNestedManyWithoutRepositoryInput
    evidenceAttestations?: EvidenceAttestationCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryUncheckedCreateWithoutPolicyAssignmentsInput = {
    id?: string
    organizationId: string
    name: string
    createdAt?: Date | string
    projects?: ProjectUncheckedCreateNestedManyWithoutRepositoryInput
    runs?: ReadyLayerRunUncheckedCreateNestedManyWithoutRepositoryInput
    evidenceAttestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutRepositoryInput
  }

  export type RepositoryCreateOrConnectWithoutPolicyAssignmentsInput = {
    where: RepositoryWhereUniqueInput
    create: XOR<RepositoryCreateWithoutPolicyAssignmentsInput, RepositoryUncheckedCreateWithoutPolicyAssignmentsInput>
  }

  export type PolicyPackCreateWithoutAssignmentsInput = {
    id?: string
    name: string
    version: string
    description?: string | null
    contentsJson: string
    packHash: string
    signature?: string | null
    signingMode: string
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutPolicyPacksInput
  }

  export type PolicyPackUncheckedCreateWithoutAssignmentsInput = {
    id?: string
    organizationId: string
    name: string
    version: string
    description?: string | null
    contentsJson: string
    packHash: string
    signature?: string | null
    signingMode: string
    createdAt?: Date | string
  }

  export type PolicyPackCreateOrConnectWithoutAssignmentsInput = {
    where: PolicyPackWhereUniqueInput
    create: XOR<PolicyPackCreateWithoutAssignmentsInput, PolicyPackUncheckedCreateWithoutAssignmentsInput>
  }

  export type OrganizationUpsertWithoutPolicyAssignmentsInput = {
    update: XOR<OrganizationUpdateWithoutPolicyAssignmentsInput, OrganizationUncheckedUpdateWithoutPolicyAssignmentsInput>
    create: XOR<OrganizationCreateWithoutPolicyAssignmentsInput, OrganizationUncheckedCreateWithoutPolicyAssignmentsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutPolicyAssignmentsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutPolicyAssignmentsInput, OrganizationUncheckedUpdateWithoutPolicyAssignmentsInput>
  }

  export type OrganizationUpdateWithoutPolicyAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUpdateManyWithoutOrganizationNestedInput
    runs?: ReadyLayerRunUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutPolicyAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUncheckedUpdateManyWithoutOrganizationNestedInput
    runs?: ReadyLayerRunUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUncheckedUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUncheckedUpdateManyWithoutOrganizationNestedInput
    webhookReceipts?: WebhookReceiptUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type RepositoryUpsertWithoutPolicyAssignmentsInput = {
    update: XOR<RepositoryUpdateWithoutPolicyAssignmentsInput, RepositoryUncheckedUpdateWithoutPolicyAssignmentsInput>
    create: XOR<RepositoryCreateWithoutPolicyAssignmentsInput, RepositoryUncheckedCreateWithoutPolicyAssignmentsInput>
    where?: RepositoryWhereInput
  }

  export type RepositoryUpdateToOneWithWhereWithoutPolicyAssignmentsInput = {
    where?: RepositoryWhereInput
    data: XOR<RepositoryUpdateWithoutPolicyAssignmentsInput, RepositoryUncheckedUpdateWithoutPolicyAssignmentsInput>
  }

  export type RepositoryUpdateWithoutPolicyAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutRepositoriesNestedInput
    projects?: ProjectUpdateManyWithoutRepositoryNestedInput
    runs?: ReadyLayerRunUpdateManyWithoutRepositoryNestedInput
    evidenceAttestations?: EvidenceAttestationUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateWithoutPolicyAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    projects?: ProjectUncheckedUpdateManyWithoutRepositoryNestedInput
    runs?: ReadyLayerRunUncheckedUpdateManyWithoutRepositoryNestedInput
    evidenceAttestations?: EvidenceAttestationUncheckedUpdateManyWithoutRepositoryNestedInput
  }

  export type PolicyPackUpsertWithoutAssignmentsInput = {
    update: XOR<PolicyPackUpdateWithoutAssignmentsInput, PolicyPackUncheckedUpdateWithoutAssignmentsInput>
    create: XOR<PolicyPackCreateWithoutAssignmentsInput, PolicyPackUncheckedCreateWithoutAssignmentsInput>
    where?: PolicyPackWhereInput
  }

  export type PolicyPackUpdateToOneWithWhereWithoutAssignmentsInput = {
    where?: PolicyPackWhereInput
    data: XOR<PolicyPackUpdateWithoutAssignmentsInput, PolicyPackUncheckedUpdateWithoutAssignmentsInput>
  }

  export type PolicyPackUpdateWithoutAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    contentsJson?: StringFieldUpdateOperationsInput | string
    packHash?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    signingMode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutPolicyPacksNestedInput
  }

  export type PolicyPackUncheckedUpdateWithoutAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    contentsJson?: StringFieldUpdateOperationsInput | string
    packHash?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    signingMode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationCreateWithoutWebhookReceiptsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryCreateNestedManyWithoutOrganizationInput
    runs?: ReadyLayerRunCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutWebhookReceiptsInput = {
    id?: string
    name: string
    createdAt?: Date | string
    repositories?: RepositoryUncheckedCreateNestedManyWithoutOrganizationInput
    runs?: ReadyLayerRunUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceAttestations?: EvidenceAttestationUncheckedCreateNestedManyWithoutOrganizationInput
    evidenceObjects?: EvidenceObjectUncheckedCreateNestedManyWithoutOrganizationInput
    policyPacks?: PolicyPackUncheckedCreateNestedManyWithoutOrganizationInput
    policyAssignments?: PolicyPackAssignmentUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutWebhookReceiptsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutWebhookReceiptsInput, OrganizationUncheckedCreateWithoutWebhookReceiptsInput>
  }

  export type OrganizationUpsertWithoutWebhookReceiptsInput = {
    update: XOR<OrganizationUpdateWithoutWebhookReceiptsInput, OrganizationUncheckedUpdateWithoutWebhookReceiptsInput>
    create: XOR<OrganizationCreateWithoutWebhookReceiptsInput, OrganizationUncheckedCreateWithoutWebhookReceiptsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutWebhookReceiptsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutWebhookReceiptsInput, OrganizationUncheckedUpdateWithoutWebhookReceiptsInput>
  }

  export type OrganizationUpdateWithoutWebhookReceiptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUpdateManyWithoutOrganizationNestedInput
    runs?: ReadyLayerRunUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutWebhookReceiptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repositories?: RepositoryUncheckedUpdateManyWithoutOrganizationNestedInput
    runs?: ReadyLayerRunUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceAttestations?: EvidenceAttestationUncheckedUpdateManyWithoutOrganizationNestedInput
    evidenceObjects?: EvidenceObjectUncheckedUpdateManyWithoutOrganizationNestedInput
    policyPacks?: PolicyPackUncheckedUpdateManyWithoutOrganizationNestedInput
    policyAssignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type RepositoryCreateManyOrganizationInput = {
    id?: string
    name: string
    createdAt?: Date | string
  }

  export type ReadyLayerRunCreateManyOrganizationInput = {
    id?: string
    repositoryId: string
    status: string
    createdAt?: Date | string
  }

  export type EvidenceAttestationCreateManyOrganizationInput = {
    id?: string
    repositoryId: string
    runId: string
    manifestHash: string
    bundleHash: string
    treeHash: string
    signingMode: string
    signature?: string | null
    publicKeyId?: string | null
    createdAt?: Date | string
  }

  export type EvidenceObjectCreateManyOrganizationInput = {
    id?: string
    runId?: string | null
    kind: string
    storageProvider: string
    storageKey: string
    sizeBytes: number
    contentHash: string
    createdAt?: Date | string
  }

  export type PolicyPackCreateManyOrganizationInput = {
    id?: string
    name: string
    version: string
    description?: string | null
    contentsJson: string
    packHash: string
    signature?: string | null
    signingMode: string
    createdAt?: Date | string
  }

  export type PolicyPackAssignmentCreateManyOrganizationInput = {
    id?: string
    repositoryId?: string | null
    scope: string
    policyPackId: string
    enabled: boolean
    createdAt?: Date | string
  }

  export type WebhookReceiptCreateManyOrganizationInput = {
    id?: string
    provider: string
    deliveryId: string
    receivedAt?: Date | string
    bodyHash: string
    signatureValid: boolean
    replayBlocked: boolean
    processed: boolean
    correlationId?: string | null
  }

  export type RepositoryUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    projects?: ProjectUpdateManyWithoutRepositoryNestedInput
    runs?: ReadyLayerRunUpdateManyWithoutRepositoryNestedInput
    evidenceAttestations?: EvidenceAttestationUpdateManyWithoutRepositoryNestedInput
    policyAssignments?: PolicyPackAssignmentUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    projects?: ProjectUncheckedUpdateManyWithoutRepositoryNestedInput
    runs?: ReadyLayerRunUncheckedUpdateManyWithoutRepositoryNestedInput
    evidenceAttestations?: EvidenceAttestationUncheckedUpdateManyWithoutRepositoryNestedInput
    policyAssignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutRepositoryNestedInput
  }

  export type RepositoryUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReadyLayerRunUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutRunsNestedInput
    attestations?: EvidenceAttestationUpdateManyWithoutRunNestedInput
  }

  export type ReadyLayerRunUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attestations?: EvidenceAttestationUncheckedUpdateManyWithoutRunNestedInput
  }

  export type ReadyLayerRunUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceAttestationUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    manifestHash?: StringFieldUpdateOperationsInput | string
    bundleHash?: StringFieldUpdateOperationsInput | string
    treeHash?: StringFieldUpdateOperationsInput | string
    signingMode?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    publicKeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneRequiredWithoutEvidenceAttestationsNestedInput
    run?: ReadyLayerRunUpdateOneRequiredWithoutAttestationsNestedInput
  }

  export type EvidenceAttestationUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    runId?: StringFieldUpdateOperationsInput | string
    manifestHash?: StringFieldUpdateOperationsInput | string
    bundleHash?: StringFieldUpdateOperationsInput | string
    treeHash?: StringFieldUpdateOperationsInput | string
    signingMode?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    publicKeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceAttestationUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    runId?: StringFieldUpdateOperationsInput | string
    manifestHash?: StringFieldUpdateOperationsInput | string
    bundleHash?: StringFieldUpdateOperationsInput | string
    treeHash?: StringFieldUpdateOperationsInput | string
    signingMode?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    publicKeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceObjectUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    runId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: StringFieldUpdateOperationsInput | string
    storageProvider?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    contentHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceObjectUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    runId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: StringFieldUpdateOperationsInput | string
    storageProvider?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    contentHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceObjectUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    runId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: StringFieldUpdateOperationsInput | string
    storageProvider?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    contentHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyPackUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    contentsJson?: StringFieldUpdateOperationsInput | string
    packHash?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    signingMode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignments?: PolicyPackAssignmentUpdateManyWithoutPolicyPackNestedInput
  }

  export type PolicyPackUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    contentsJson?: StringFieldUpdateOperationsInput | string
    packHash?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    signingMode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignments?: PolicyPackAssignmentUncheckedUpdateManyWithoutPolicyPackNestedInput
  }

  export type PolicyPackUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    contentsJson?: StringFieldUpdateOperationsInput | string
    packHash?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    signingMode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyPackAssignmentUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    scope?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    repository?: RepositoryUpdateOneWithoutPolicyAssignmentsNestedInput
    policyPack?: PolicyPackUpdateOneRequiredWithoutAssignmentsNestedInput
  }

  export type PolicyPackAssignmentUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    repositoryId?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: StringFieldUpdateOperationsInput | string
    policyPackId?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyPackAssignmentUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    repositoryId?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: StringFieldUpdateOperationsInput | string
    policyPackId?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebhookReceiptUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    deliveryId?: StringFieldUpdateOperationsInput | string
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bodyHash?: StringFieldUpdateOperationsInput | string
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    replayBlocked?: BoolFieldUpdateOperationsInput | boolean
    processed?: BoolFieldUpdateOperationsInput | boolean
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WebhookReceiptUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    deliveryId?: StringFieldUpdateOperationsInput | string
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bodyHash?: StringFieldUpdateOperationsInput | string
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    replayBlocked?: BoolFieldUpdateOperationsInput | boolean
    processed?: BoolFieldUpdateOperationsInput | boolean
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WebhookReceiptUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    deliveryId?: StringFieldUpdateOperationsInput | string
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bodyHash?: StringFieldUpdateOperationsInput | string
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    replayBlocked?: BoolFieldUpdateOperationsInput | boolean
    processed?: BoolFieldUpdateOperationsInput | boolean
    correlationId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProjectCreateManyRepositoryInput = {
    id?: string
    name: string
  }

  export type ReadyLayerRunCreateManyRepositoryInput = {
    id?: string
    organizationId: string
    status: string
    createdAt?: Date | string
  }

  export type EvidenceAttestationCreateManyRepositoryInput = {
    id?: string
    organizationId: string
    runId: string
    manifestHash: string
    bundleHash: string
    treeHash: string
    signingMode: string
    signature?: string | null
    publicKeyId?: string | null
    createdAt?: Date | string
  }

  export type PolicyPackAssignmentCreateManyRepositoryInput = {
    id?: string
    organizationId: string
    scope: string
    policyPackId: string
    enabled: boolean
    createdAt?: Date | string
  }

  export type ProjectUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ProjectUncheckedUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ProjectUncheckedUpdateManyWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ReadyLayerRunUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutRunsNestedInput
    attestations?: EvidenceAttestationUpdateManyWithoutRunNestedInput
  }

  export type ReadyLayerRunUncheckedUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attestations?: EvidenceAttestationUncheckedUpdateManyWithoutRunNestedInput
  }

  export type ReadyLayerRunUncheckedUpdateManyWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceAttestationUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    manifestHash?: StringFieldUpdateOperationsInput | string
    bundleHash?: StringFieldUpdateOperationsInput | string
    treeHash?: StringFieldUpdateOperationsInput | string
    signingMode?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    publicKeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutEvidenceAttestationsNestedInput
    run?: ReadyLayerRunUpdateOneRequiredWithoutAttestationsNestedInput
  }

  export type EvidenceAttestationUncheckedUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    runId?: StringFieldUpdateOperationsInput | string
    manifestHash?: StringFieldUpdateOperationsInput | string
    bundleHash?: StringFieldUpdateOperationsInput | string
    treeHash?: StringFieldUpdateOperationsInput | string
    signingMode?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    publicKeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceAttestationUncheckedUpdateManyWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    runId?: StringFieldUpdateOperationsInput | string
    manifestHash?: StringFieldUpdateOperationsInput | string
    bundleHash?: StringFieldUpdateOperationsInput | string
    treeHash?: StringFieldUpdateOperationsInput | string
    signingMode?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    publicKeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyPackAssignmentUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    scope?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutPolicyAssignmentsNestedInput
    policyPack?: PolicyPackUpdateOneRequiredWithoutAssignmentsNestedInput
  }

  export type PolicyPackAssignmentUncheckedUpdateWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    scope?: StringFieldUpdateOperationsInput | string
    policyPackId?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyPackAssignmentUncheckedUpdateManyWithoutRepositoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    scope?: StringFieldUpdateOperationsInput | string
    policyPackId?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceAttestationCreateManyRunInput = {
    id?: string
    organizationId: string
    repositoryId: string
    manifestHash: string
    bundleHash: string
    treeHash: string
    signingMode: string
    signature?: string | null
    publicKeyId?: string | null
    createdAt?: Date | string
  }

  export type EvidenceAttestationUpdateWithoutRunInput = {
    id?: StringFieldUpdateOperationsInput | string
    manifestHash?: StringFieldUpdateOperationsInput | string
    bundleHash?: StringFieldUpdateOperationsInput | string
    treeHash?: StringFieldUpdateOperationsInput | string
    signingMode?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    publicKeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutEvidenceAttestationsNestedInput
    repository?: RepositoryUpdateOneRequiredWithoutEvidenceAttestationsNestedInput
  }

  export type EvidenceAttestationUncheckedUpdateWithoutRunInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    manifestHash?: StringFieldUpdateOperationsInput | string
    bundleHash?: StringFieldUpdateOperationsInput | string
    treeHash?: StringFieldUpdateOperationsInput | string
    signingMode?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    publicKeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EvidenceAttestationUncheckedUpdateManyWithoutRunInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    repositoryId?: StringFieldUpdateOperationsInput | string
    manifestHash?: StringFieldUpdateOperationsInput | string
    bundleHash?: StringFieldUpdateOperationsInput | string
    treeHash?: StringFieldUpdateOperationsInput | string
    signingMode?: StringFieldUpdateOperationsInput | string
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    publicKeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyPackAssignmentCreateManyPolicyPackInput = {
    id?: string
    organizationId: string
    repositoryId?: string | null
    scope: string
    enabled: boolean
    createdAt?: Date | string
  }

  export type PolicyPackAssignmentUpdateWithoutPolicyPackInput = {
    id?: StringFieldUpdateOperationsInput | string
    scope?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutPolicyAssignmentsNestedInput
    repository?: RepositoryUpdateOneWithoutPolicyAssignmentsNestedInput
  }

  export type PolicyPackAssignmentUncheckedUpdateWithoutPolicyPackInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    repositoryId?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PolicyPackAssignmentUncheckedUpdateManyWithoutPolicyPackInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    repositoryId?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}