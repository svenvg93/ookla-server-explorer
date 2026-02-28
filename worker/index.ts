interface Env {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/servers') {
      const search = url.searchParams.get('search') ?? ''
      const ooklaUrl =
        'https://www.speedtest.net/api/js/servers?engine=js&limit=1000' +
        (search ? '&search=' + encodeURIComponent(search) : '')

      const clientIp = request.headers.get('CF-Connecting-IP') ?? ''

      try {
        const resp = await fetch(ooklaUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.speedtest.net/',
            'Origin': 'https://www.speedtest.net',
            'X-Requested-With': 'XMLHttpRequest',
            ...(clientIp ? { 'X-Forwarded-For': clientIp } : {}),
          },
        })

        const body = await resp.text()
        const trimmed = body.trim()

        if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
          return Response.json(
            { error: 'Ookla returned non-JSON (status ' + resp.status + ')', preview: trimmed.slice(0, 200) },
            { status: 502 },
          )
        }

        return new Response(body, {
          status: resp.status,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
          },
        })
      } catch (e) {
        return Response.json({ error: (e as Error).message }, { status: 502 })
      }
    }

    return env.ASSETS.fetch(request)
  },
}
