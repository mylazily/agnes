
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const SVELTEKIT_FORK: string;
	export const NODE_ENV: string;
	export const CFS_TRANSPORT: string;
	export const npm_command: string;
	export const npm_config_global_prefix: string;
	export const NVM_CD_FLAGS: string;
	export const KUBERNETES_SERVICE_HOST: string;
	export const PWD: string;
	export const npm_config_init_module: string;
	export const npm_config_globalconfig: string;
	export const SUPERVISOR_PROCESS_NAME: string;
	export const KUBERNETES_PORT_443_TCP: string;
	export const BROWSERUSE_SPK_ENABLED: string;
	export const npm_execpath: string;
	export const BROWSER_SNAPSHOT_DIR: string;
	export const MCP_LOG_DIR: string;
	export const npm_lifecycle_event: string;
	export const npm_package_version: string;
	export const GIT_TERMINAL_PROMPT: string;
	export const NODE_PATH: string;
	export const DEBIAN_FRONTEND: string;
	export const npm_lifecycle_script: string;
	export const SUPERVISOR_ENABLED: string;
	export const BUN_INSTALL: string;
	export const COREPACK_ENABLE_STRICT: string;
	export const NVM_INC: string;
	export const SUPERVISOR_SERVER_URL: string;
	export const NO_PROXY: string;
	export const NVM_DIR: string;
	export const HOME: string;
	export const npm_config_local_prefix: string;
	export const LD_LIBRARY_PATH: string;
	export const SUPERVISOR_GROUP_NAME: string;
	export const NVM_BIN: string;
	export const TOOLHOST_JOB_LOG_DIR: string;
	export const COREPACK_DEFAULT_TO_LATEST: string;
	export const npm_config_noproxy: string;
	export const HOSTNAME: string;
	export const TOOLHOST_CWD: string;
	export const SHLVL: string;
	export const npm_node_execpath: string;
	export const PAGER: string;
	export const CI: string;
	export const AGENTS_SKILLS_DIR: string;
	export const OPEN_PREVIEW_CDP_ENDPOINT: string;
	export const SLARDAR_DOMAIN: string;
	export const LC_ALL: string;
	export const KUBERNETES_SERVICE_PORT: string;
	export const npm_config_userconfig: string;
	export const CFS_TOKEN: string;
	export const COREPACK_ENABLE_AUTO_PIN: string;
	export const PYTHONIOENCODING: string;
	export const AGENT_TOOL_HOST_MCP_SERVER_CONF_FILE: string;
	export const HTTPS_PROXY: string;
	export const _: string;
	export const npm_config_node_gyp: string;
	export const INIT_CWD: string;
	export const KUBERNETES_PORT: string;
	export const TRAE_SKILLS_DIR: string;
	export const NODE_OPTIONS: string;
	export const HTTP_PROXY: string;
	export const OLDPWD: string;
	export const EDITOR: string;
	export const PYTHONUTF8: string;
	export const SLARDAR_BID: string;
	export const http_proxy: string;
	export const npm_config_user_agent: string;
	export const CFS_SOCKET: string;
	export const npm_config_npm_version: string;
	export const NPM_CONFIG_YES: string;
	export const COREPACK_ENABLE_DOWNLOAD_PROMPT: string;
	export const COLOR: string;
	export const https_proxy: string;
	export const npm_config_prefix: string;
	export const KUBERNETES_PORT_443_TCP_PORT: string;
	export const TERM: string;
	export const npm_config_cache: string;
	export const KUBERNETES_SERVICE_PORT_HTTPS: string;
	export const KUBERNETES_PORT_443_TCP_ADDR: string;
	export const CARGO_TERM_COLOR: string;
	export const NODE: string;
	export const npm_package_name: string;
	export const PATH: string;
	export const TRAE_ENV_WORKSPACE: string;
	export const SSH_AUTH_SOCK: string;
	export const AGENT_TOOL_HOST_IDE_DYNAMIC_CONF_FILE: string;
	export const CRAWLER_CDP_ENDPOINT: string;
	export const CDP_USER_DATA_DIR: string;
	export const KUBERNETES_PORT_443_TCP_PROTO: string;
	export const LANG: string;
	export const ICUBE_USER_DATA_DIR: string;
	export const npm_package_json: string;
	export const no_proxy: string;
	export const container: string;
	export const PREVIEW_PROXY_PUBLIC_PORT: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		SVELTEKIT_FORK: string;
		NODE_ENV: string;
		CFS_TRANSPORT: string;
		npm_command: string;
		npm_config_global_prefix: string;
		NVM_CD_FLAGS: string;
		KUBERNETES_SERVICE_HOST: string;
		PWD: string;
		npm_config_init_module: string;
		npm_config_globalconfig: string;
		SUPERVISOR_PROCESS_NAME: string;
		KUBERNETES_PORT_443_TCP: string;
		BROWSERUSE_SPK_ENABLED: string;
		npm_execpath: string;
		BROWSER_SNAPSHOT_DIR: string;
		MCP_LOG_DIR: string;
		npm_lifecycle_event: string;
		npm_package_version: string;
		GIT_TERMINAL_PROMPT: string;
		NODE_PATH: string;
		DEBIAN_FRONTEND: string;
		npm_lifecycle_script: string;
		SUPERVISOR_ENABLED: string;
		BUN_INSTALL: string;
		COREPACK_ENABLE_STRICT: string;
		NVM_INC: string;
		SUPERVISOR_SERVER_URL: string;
		NO_PROXY: string;
		NVM_DIR: string;
		HOME: string;
		npm_config_local_prefix: string;
		LD_LIBRARY_PATH: string;
		SUPERVISOR_GROUP_NAME: string;
		NVM_BIN: string;
		TOOLHOST_JOB_LOG_DIR: string;
		COREPACK_DEFAULT_TO_LATEST: string;
		npm_config_noproxy: string;
		HOSTNAME: string;
		TOOLHOST_CWD: string;
		SHLVL: string;
		npm_node_execpath: string;
		PAGER: string;
		CI: string;
		AGENTS_SKILLS_DIR: string;
		OPEN_PREVIEW_CDP_ENDPOINT: string;
		SLARDAR_DOMAIN: string;
		LC_ALL: string;
		KUBERNETES_SERVICE_PORT: string;
		npm_config_userconfig: string;
		CFS_TOKEN: string;
		COREPACK_ENABLE_AUTO_PIN: string;
		PYTHONIOENCODING: string;
		AGENT_TOOL_HOST_MCP_SERVER_CONF_FILE: string;
		HTTPS_PROXY: string;
		_: string;
		npm_config_node_gyp: string;
		INIT_CWD: string;
		KUBERNETES_PORT: string;
		TRAE_SKILLS_DIR: string;
		NODE_OPTIONS: string;
		HTTP_PROXY: string;
		OLDPWD: string;
		EDITOR: string;
		PYTHONUTF8: string;
		SLARDAR_BID: string;
		http_proxy: string;
		npm_config_user_agent: string;
		CFS_SOCKET: string;
		npm_config_npm_version: string;
		NPM_CONFIG_YES: string;
		COREPACK_ENABLE_DOWNLOAD_PROMPT: string;
		COLOR: string;
		https_proxy: string;
		npm_config_prefix: string;
		KUBERNETES_PORT_443_TCP_PORT: string;
		TERM: string;
		npm_config_cache: string;
		KUBERNETES_SERVICE_PORT_HTTPS: string;
		KUBERNETES_PORT_443_TCP_ADDR: string;
		CARGO_TERM_COLOR: string;
		NODE: string;
		npm_package_name: string;
		PATH: string;
		TRAE_ENV_WORKSPACE: string;
		SSH_AUTH_SOCK: string;
		AGENT_TOOL_HOST_IDE_DYNAMIC_CONF_FILE: string;
		CRAWLER_CDP_ENDPOINT: string;
		CDP_USER_DATA_DIR: string;
		KUBERNETES_PORT_443_TCP_PROTO: string;
		LANG: string;
		ICUBE_USER_DATA_DIR: string;
		npm_package_json: string;
		no_proxy: string;
		container: string;
		PREVIEW_PROXY_PUBLIC_PORT: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
