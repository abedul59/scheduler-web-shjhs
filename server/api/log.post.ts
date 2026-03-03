import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // 1. 取得訪客 IP (部署到 Vercel 時，真實 IP 會放在 x-forwarded-for 標頭中)
    const forwardedFor = getRequestHeader(event, 'x-forwarded-for')
    // 如果有多個 IP (經過代理)，取第一個
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (event.node.req.socket.remoteAddress || 'unknown')

    // 2. 取得設備資訊 (User-Agent)
    const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'

    // 3. 呼叫 Supabase 寫入資料庫
    const supabase = await serverSupabaseClient(event)
    const { error } = await supabase
      .from('visitor_logs')
      .insert([{ 
        ip_address: ip, 
        user_agent: userAgent 
      }])

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Logging failed:', error)
    return { success: false }
  }
})