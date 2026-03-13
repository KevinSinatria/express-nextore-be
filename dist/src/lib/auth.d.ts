export declare const auth: import("better-auth").Auth<{
    database: (options: import("better-auth").BetterAuthOptions) => import("better-auth").DBAdapter<import("better-auth").BetterAuthOptions>;
    secret: string;
    emailAndPassword: {
        enabled: true;
    };
    trustedOrigins: string[];
    plugins: [{
        id: "username";
        init(ctx: import("better-auth").AuthContext): {
            options: {
                databaseHooks: {
                    user: {
                        create: {
                            before(user: {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            } & Record<string, unknown>, context: import("better-auth").GenericEndpointContext | null): Promise<{
                                data: {
                                    displayUsername?: string | undefined;
                                    username?: string | undefined;
                                    id: string;
                                    createdAt: Date;
                                    updatedAt: Date;
                                    email: string;
                                    emailVerified: boolean;
                                    name: string;
                                    image?: string | null | undefined;
                                };
                            }>;
                        };
                        update: {
                            before(user: Partial<{
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            }> & Record<string, unknown>, context: import("better-auth").GenericEndpointContext | null): Promise<{
                                data: {
                                    displayUsername?: string | undefined;
                                    username?: string | undefined;
                                    id?: string | undefined;
                                    createdAt?: Date | undefined;
                                    updatedAt?: Date | undefined;
                                    email?: string | undefined;
                                    emailVerified?: boolean | undefined;
                                    name?: string | undefined;
                                    image?: string | null | undefined;
                                };
                            }>;
                        };
                    };
                };
            };
        };
        endpoints: {
            signInUsername: import("better-auth").StrictEndpoint<"/sign-in/username", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    username: import("better-auth").ZodString;
                    password: import("better-auth").ZodString;
                    rememberMe: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    callbackURL: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("better-auth").$strip>;
                metadata: {
                    openapi: {
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                token: {
                                                    type: string;
                                                    description: string;
                                                };
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                            422: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                message: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                token: string;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                } & {
                    username: string;
                    displayUsername: string;
                };
            }>;
            isUsernameAvailable: import("better-auth").StrictEndpoint<"/is-username-available", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    username: import("better-auth").ZodString;
                }, import("better-auth").$strip>;
            }, {
                available: boolean;
            }>;
        };
        schema: {
            user: {
                fields: {
                    username: {
                        type: "string";
                        required: false;
                        sortable: true;
                        unique: true;
                        returned: true;
                        transform: {
                            input(value: import("better-auth").DBPrimitive): string | number | boolean | Date | Record<string, unknown> | unknown[] | null | undefined;
                        };
                    };
                    displayUsername: {
                        type: "string";
                        required: false;
                        transform: {
                            input(value: import("better-auth").DBPrimitive): string | number | boolean | Date | Record<string, unknown> | unknown[] | null | undefined;
                        };
                    };
                };
            };
        };
        hooks: {
            before: {
                matcher(context: import("better-auth").HookEndpointContext): boolean;
                handler: (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>;
            }[];
        };
        options: import("better-auth/plugins").UsernameOptions | undefined;
        $ERROR_CODES: {
            EMAIL_NOT_VERIFIED: import("better-auth").RawError<"EMAIL_NOT_VERIFIED">;
            UNEXPECTED_ERROR: import("better-auth").RawError<"UNEXPECTED_ERROR">;
            INVALID_USERNAME_OR_PASSWORD: import("better-auth").RawError<"INVALID_USERNAME_OR_PASSWORD">;
            USERNAME_IS_ALREADY_TAKEN: import("better-auth").RawError<"USERNAME_IS_ALREADY_TAKEN">;
            USERNAME_TOO_SHORT: import("better-auth").RawError<"USERNAME_TOO_SHORT">;
            USERNAME_TOO_LONG: import("better-auth").RawError<"USERNAME_TOO_LONG">;
            INVALID_USERNAME: import("better-auth").RawError<"INVALID_USERNAME">;
            INVALID_DISPLAY_USERNAME: import("better-auth").RawError<"INVALID_DISPLAY_USERNAME">;
        };
    }, {
        id: "open-api";
        endpoints: {
            generateOpenAPISchema: import("better-auth").StrictEndpoint<"/open-api/generate-schema", {
                method: "GET";
            }, {
                openapi: string;
                info: {
                    title: string;
                    description: string;
                    version: string;
                };
                components: {
                    securitySchemes: {
                        apiKeyCookie: {
                            type: string;
                            in: string;
                            name: string;
                            description: string;
                        };
                        bearerAuth: {
                            type: string;
                            scheme: string;
                            description: string;
                        };
                    };
                    schemas: {
                        [x: string]: import("better-auth/plugins").OpenAPIModelSchema;
                    };
                };
                security: {
                    apiKeyCookie: never[];
                    bearerAuth: never[];
                }[];
                servers: {
                    url: string;
                }[];
                tags: {
                    name: string;
                    description: string;
                }[];
                paths: Record<string, import("better-auth/plugins").Path>;
            }>;
            openAPIReference: import("better-auth").StrictEndpoint<import("better-auth").LiteralString | "/reference", {
                method: "GET";
                metadata: {
                    readonly scope: "server";
                };
            }, Response>;
        };
        options: NoInfer<import("better-auth/plugins").OpenAPIOptions>;
    }, {
        id: "custom-session";
        hooks: {
            after: {
                matcher: (ctx: import("better-auth").HookEndpointContext) => boolean;
                handler: (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    userData: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        name: string;
                        image: string | null;
                        username: string;
                        role: import("../generated/prisma/enums.js").Role;
                    } | null;
                    user: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        email: string;
                        emailVerified: boolean;
                        name: string;
                        image?: string | null | undefined;
                    };
                    session: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        userId: string;
                        expiresAt: Date;
                        token: string;
                        ipAddress?: string | null | undefined;
                        userAgent?: string | null | undefined;
                    };
                }[] | undefined>;
            }[];
        };
        endpoints: {
            getSession: import("better-auth").StrictEndpoint<"/get-session", {
                method: "GET";
                query: import("better-auth").ZodOptional<import("better-auth").ZodObject<{
                    disableCookieCache: import("better-auth").ZodOptional<import("better-auth").ZodUnion<[import("better-auth").ZodBoolean, import("better-auth").ZodPipe<import("better-auth").ZodString, import("better-auth").ZodTransform<boolean, string>>]>>;
                    disableRefresh: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                }, import("better-auth").$strip>>;
                metadata: {
                    CUSTOM_SESSION: boolean;
                    openapi: {
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "array";
                                            nullable: boolean;
                                            items: {
                                                $ref: string;
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                requireHeaders: true;
            }, {
                userData: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    image: string | null;
                    username: string;
                    role: import("../generated/prisma/enums.js").Role;
                } | null;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                };
                session: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    expiresAt: Date;
                    token: string;
                    ipAddress?: string | null | undefined;
                    userAgent?: string | null | undefined;
                };
            } | null>;
        };
        $Infer: {
            Session: {
                userData: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    image: string | null;
                    username: string;
                    role: import("../generated/prisma/enums.js").Role;
                } | null;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                };
                session: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    expiresAt: Date;
                    token: string;
                    ipAddress?: string | null | undefined;
                    userAgent?: string | null | undefined;
                };
            };
        };
        options: import("better-auth/plugins").CustomSessionPluginOptions | undefined;
    }];
    user: {
        additionalFields: {
            role: {
                type: ("CASHIER" | "ADMIN" | "SUPERVISOR")[];
                required: true;
                defaultValue: string;
            };
        };
    };
}>;
//# sourceMappingURL=auth.d.ts.map