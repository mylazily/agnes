export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.hSfkHHdj.js",app:"_app/immutable/entry/app.Bmu25p7r.js",imports:["_app/immutable/entry/start.hSfkHHdj.js","_app/immutable/chunks/6-Xz_EUe.js","_app/immutable/chunks/B2HrR7_J.js","_app/immutable/chunks/VeotHbJm.js","_app/immutable/entry/app.Bmu25p7r.js","_app/immutable/chunks/B2HrR7_J.js","_app/immutable/chunks/BpGpGRak.js","_app/immutable/chunks/DRxzce6D.js","_app/immutable/chunks/VeotHbJm.js","_app/immutable/chunks/Bo2OuWnB.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
