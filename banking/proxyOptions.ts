import fs from 'fs'
import path from 'path'

const commonSiteConfigPath = path.resolve(__dirname, '../../../sites/common_site_config.json')

const getWebserverPort = () => {
	const envPort = Number(process.env.VITE_BACKEND_PORT)
	if (Number.isFinite(envPort) && envPort > 0) {
		return envPort
	}

	if (!fs.existsSync(commonSiteConfigPath)) {
		return 8000
	}

	try {
		const raw = fs.readFileSync(commonSiteConfigPath, 'utf-8')
		const parsed = JSON.parse(raw)
		const configPort = Number(parsed.webserver_port)
		if (Number.isFinite(configPort) && configPort > 0) {
			return configPort
		}
	} catch {
		return 8000
	}

	return 8000
}

const webserver_port = getWebserverPort()

export default {
	'^/(app|api|assets|files|private)': {
		target: `http://127.0.0.1:${webserver_port}`,
		ws: true,
		router: function(req) {
			const site_name = req.headers.host.split(':')[0];
			return `http://${site_name}:${webserver_port}`;
		}
	}
};
