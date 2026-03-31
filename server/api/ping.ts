import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    // 輕量查詢
    const { data, error } = await supabase.from('visitor_logs').select('id').limit(1)
    if (error) throw error
    return { success: true, message: '排課系統喚醒成功！' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})
